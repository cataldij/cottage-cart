'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Search,
  Image as ImageIcon,
  Star,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  X,
  Loader2,
  Calculator,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string | null
  is_available: boolean
  is_featured: boolean
  allergens: string[]
  dietary_tags: string[]
  sort_order: number
  category?: { name: string } | null
}

interface Category {
  id: string
  name: string
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [shopId, setShopId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form fields
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formAvailable, setFormAvailable] = useState(true)
  const [formFeatured, setFormFeatured] = useState(false)
  const [formAllergens, setFormAllergens] = useState('')
  const [formDietaryTags, setFormDietaryTags] = useState('')

  // Cast to any — generated DB types don't include CottageCart tables yet
  const supabase: any = createClient()

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Get user's shop
    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('created_by', session.user.id)
      .single()

    if (!shop) {
      setLoading(false)
      return
    }

    setShopId(shop.id)

    // Get products and categories in parallel
    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, category:product_categories(name)')
        .eq('shop_id', shop.id)
        .order('sort_order', { ascending: true }),
      supabase
        .from('product_categories')
        .select('id, name')
        .eq('shop_id', shop.id)
        .order('sort_order', { ascending: true }),
    ])

    setProducts(productsRes.data || [])
    setCategories(categoriesRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Pre-fill from calculator via URL params
  useEffect(() => {
    const name = searchParams.get('name')
    const price = searchParams.get('price')
    const desc = searchParams.get('description')
    if (name) {
      setFormName(name)
      setFormPrice(price || '')
      setFormDesc(desc || '')
      setShowForm(true)
    }
  }, [searchParams])

  const resetForm = () => {
    setFormName('')
    setFormDesc('')
    setFormPrice('')
    setFormCategory('')
    setFormAvailable(true)
    setFormFeatured(false)
    setFormAllergens('')
    setFormDietaryTags('')
    setEditingProduct(null)
    setShowForm(false)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setFormName(product.name)
    setFormDesc(product.description || '')
    setFormPrice(product.price.toString())
    setFormCategory(product.category_id || '')
    setFormAvailable(product.is_available)
    setFormFeatured(product.is_featured)
    setFormAllergens(product.allergens?.join(', ') || '')
    setFormDietaryTags(product.dietary_tags?.join(', ') || '')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!shopId || !formName.trim() || !formPrice) return
    setSaving(true)

    const productData = {
      shop_id: shopId,
      name: formName.trim(),
      description: formDesc.trim() || null,
      price: parseFloat(formPrice),
      category_id: formCategory || null,
      is_available: formAvailable,
      is_featured: formFeatured,
      allergens: formAllergens ? formAllergens.split(',').map(s => s.trim()).filter(Boolean) : [],
      dietary_tags: formDietaryTags ? formDietaryTags.split(',').map(s => s.trim()).filter(Boolean) : [],
    }

    if (editingProduct) {
      await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id)
    } else {
      await supabase
        .from('products')
        .insert(productData)
    }

    resetForm()
    await loadData()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    setDeleting(id)
    await supabase.from('products').delete().eq('id', id)
    await loadData()
    setDeleting(null)
  }

  const toggleAvailable = async (product: Product) => {
    await supabase
      .from('products')
      .update({ is_available: !product.is_available })
      .eq('id', product.id)
    await loadData()
  }

  const toggleFeatured = async (product: Product) => {
    await supabase
      .from('products')
      .update({ is_featured: !product.is_featured })
      .eq('id', product.id)
    await loadData()
  }

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !filterCategory || (p.category as any)?.name === filterCategory
    return matchesSearch && matchesCategory
  })

  const categoryNames = [...new Set(products.map(p => (p.category as any)?.name).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    )
  }

  if (!shopId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-slate-500">Create a shop first to manage products.</p>
        <Link href="/builder">
          <Button className="bg-amber-700 text-white hover:bg-amber-800">Create My Shop</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Menu Items</h1>
          <p className="text-sm text-slate-500">{products.length} products in your shop</p>
        </div>
        <div className="flex gap-2">
          <Link href="/calculator">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Calculator className="h-4 w-4" />
              Price Calculator
            </Button>
          </Link>
          <Button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="gap-2 rounded-xl bg-amber-700 text-white hover:bg-amber-800"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingProduct ? 'Edit Product' : 'New Product'}
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name *</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="Sourdough Boule"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Price *</label>
              <input
                type="number"
                step="0.01"
                value={formPrice}
                onChange={e => setFormPrice(e.target.value)}
                placeholder="8.00"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="Naturally leavened with a crispy crust..."
                rows={2}
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">No category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Allergens (comma-separated)</label>
              <input
                type="text"
                value={formAllergens}
                onChange={e => setFormAllergens(e.target.value)}
                placeholder="wheat, dairy, eggs"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Dietary tags (comma-separated)</label>
              <input
                type="text"
                value={formDietaryTags}
                onChange={e => setFormDietaryTags(e.target.value)}
                placeholder="vegan, gluten-free"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formAvailable}
                  onChange={e => setFormAvailable(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                Available
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={e => setFormFeatured(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                Featured
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving || !formName.trim() || !formPrice}
              className="gap-2 bg-amber-700 text-white hover:bg-amber-800"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </Button>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <div className="flex gap-2">
          <button
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              !filterCategory ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
            onClick={() => setFilterCategory(null)}
          >
            All
          </button>
          {categoryNames.map(cat => (
            <button
              key={cat}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                filterCategory === cat ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {products.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-16">
          <ImageIcon className="h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No products yet</p>
          <p className="text-xs text-slate-400">Add your first menu item or use the Price Calculator to get started</p>
          <div className="flex gap-2">
            <Button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="gap-2 bg-amber-700 text-white hover:bg-amber-800"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
            <Link href="/calculator">
              <Button variant="outline" className="gap-2">
                <Calculator className="h-4 w-4" />
                Price Calculator
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Products table */}
      {filtered.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tags</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{product.name}</span>
                          {product.is_featured && (
                            <button onClick={() => toggleFeatured(product)} title="Unfeature">
                              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                            </button>
                          )}
                          {!product.is_featured && (
                            <button onClick={() => toggleFeatured(product)} title="Feature this product" className="opacity-0 group-hover:opacity-100">
                              <Star className="h-3.5 w-3.5 text-slate-300 hover:text-amber-500" />
                            </button>
                          )}
                        </div>
                        <p className="line-clamp-1 max-w-[240px] text-xs text-slate-500">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {(product.category as any)?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleAvailable(product)}>
                      {product.is_available ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <Eye className="h-3 w-3" /> Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                          <EyeOff className="h-3 w-3" /> Hidden
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {product.dietary_tags?.map(tag => (
                        <span key={tag} className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                          {tag}
                        </span>
                      ))}
                      {product.allergens?.map(a => (
                        <span key={a} className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-700">
                          {a}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-600"
                        onClick={() => openEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                      >
                        {deleting === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
