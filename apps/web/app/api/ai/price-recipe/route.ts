import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

interface PriceRecipeRequest {
  input: string
  state?: string
  mode: 'parse' | 'price' | 'full'
}

const PARSE_PROMPT = `You are a recipe costing assistant for cottage food businesses (home bakers, chocolatiers, hot sauce makers, etc).

The user will describe a recipe in natural language. Extract structured data.

Return ONLY valid JSON (no markdown, no backticks) with this exact structure:
{
  "name": "Recipe name",
  "description": "Brief description",
  "category": "one of: cookies, cakes, breads, pastries, pies, chocolates, hot_sauce, jams, other",
  "batch_yield": number,
  "yield_unit": "pieces, loaves, bottles, jars, dozen, etc",
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": number,
      "unit": "cups, oz, lbs, tsp, tbsp, each, etc",
      "estimated_package_price": number,
      "estimated_package_size": number,
      "estimated_package_unit": "lbs, oz, each, bag, etc",
      "cost_in_recipe": number
    }
  ],
  "packaging_cost_estimate": number,
  "overhead_cost_estimate": number,
  "total_ingredient_cost": number,
  "cost_per_unit": number,
  "notes": "any relevant notes about the recipe"
}

For estimated prices, use current average US grocery store prices. Be accurate — home bakers rely on this to price their products.
Calculate cost_in_recipe as: (quantity_used / package_size) * package_price, converting units as needed.`

const PRICE_PROMPT = `You are a pricing advisor for cottage food businesses.

Given a product with its cost information, provide competitive pricing analysis and recommendations.

The user's state matters because cottage food laws vary (revenue caps, allowed products, labeling requirements).

Return ONLY valid JSON (no markdown, no backticks) with this structure:
{
  "product_name": "name",
  "cost_per_unit": number,
  "market_analysis": {
    "farmers_market_range": {"low": number, "high": number},
    "home_baker_range": {"low": number, "high": number},
    "artisan_bakery_range": {"low": number, "high": number},
    "online_range": {"low": number, "high": number}
  },
  "recommended_price": number,
  "margin_percent": number,
  "reasoning": "2-3 sentences explaining why this price",
  "pricing_tips": [
    "tip 1",
    "tip 2",
    "tip 3"
  ],
  "revenue_projection": {
    "weekly_units": number,
    "weekly_revenue": number,
    "weekly_profit": number,
    "monthly_profit": number,
    "annual_revenue": number
  },
  "state_info": {
    "state": "XX",
    "revenue_cap": number or null,
    "cap_note": "note about the cap or 'No cap in this state'",
    "months_to_cap": number or null,
    "labeling_required": "brief labeling requirement note"
  }
}

For revenue projections, assume a typical home-based cottage food operation (10-25 units per week for baked goods, 5-15 for specialty items).
Be realistic and helpful — these are side hustles and stay-at-home parents, not commercial operations.`

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const body: PriceRecipeRequest = await request.json()
    const { input, state, mode } = body

    if (!input) {
      return NextResponse.json(
        { error: 'Missing input' },
        { status: 400 }
      )
    }

    if (mode === 'parse' || mode === 'full') {
      // Step 1: Parse the recipe
      const parseResponse = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: PARSE_PROMPT },
              { text: `Recipe description:\n${input}` },
            ],
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      })

      if (!parseResponse.ok) {
        const err = await parseResponse.text()
        console.error('Gemini parse error:', err)
        return NextResponse.json(
          { error: 'Failed to parse recipe' },
          { status: 502 }
        )
      }

      const parseData = await parseResponse.json()
      const parseText = parseData.candidates?.[0]?.content?.parts?.[0]?.text || ''

      let recipe
      try {
        const cleaned = parseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        recipe = JSON.parse(cleaned)
      } catch {
        console.error('Failed to parse recipe JSON:', parseText)
        return NextResponse.json(
          { error: 'Failed to parse AI response' },
          { status: 502 }
        )
      }

      if (mode === 'parse') {
        return NextResponse.json({ recipe })
      }

      // Step 2: Get pricing analysis (full mode)
      const stateStr = state ? ` in ${state}` : ''
      const pricingInput = `Product: ${recipe.name}
Category: ${recipe.category}
Cost per unit: $${recipe.cost_per_unit?.toFixed(2)}
Batch yield: ${recipe.batch_yield} ${recipe.yield_unit}
Total batch cost: $${recipe.total_ingredient_cost?.toFixed(2)}
State: ${state || 'Unknown'}
Description: ${recipe.description || ''}`

      const priceResponse = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: PRICE_PROMPT },
              { text: pricingInput },
            ],
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
      })

      if (!priceResponse.ok) {
        // Return recipe even if pricing fails
        return NextResponse.json({ recipe, pricing: null })
      }

      const priceData = await priceResponse.json()
      const priceText = priceData.candidates?.[0]?.content?.parts?.[0]?.text || ''

      let pricing
      try {
        const cleaned = priceText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        pricing = JSON.parse(cleaned)
      } catch {
        return NextResponse.json({ recipe, pricing: null })
      }

      return NextResponse.json({ recipe, pricing })
    }

    // Price-only mode (for already-parsed recipes)
    if (mode === 'price') {
      const priceResponse = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: PRICE_PROMPT },
              { text: input },
            ],
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
      })

      if (!priceResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to get pricing analysis' },
          { status: 502 }
        )
      }

      const priceData = await priceResponse.json()
      const priceText = priceData.candidates?.[0]?.content?.parts?.[0]?.text || ''

      let pricing
      try {
        const cleaned = priceText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        pricing = JSON.parse(cleaned)
      } catch {
        return NextResponse.json(
          { error: 'Failed to parse pricing response' },
          { status: 502 }
        )
      }

      return NextResponse.json({ pricing })
    }

    return NextResponse.json(
      { error: 'Invalid mode. Use: parse, price, or full' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Price recipe error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
