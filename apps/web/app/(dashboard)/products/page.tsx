'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Search,
  MoreHorizontal,
  Image as ImageIcon,
  Star,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  category: string
  is_available: boolean
  is_featured: boolean
  allergens: string[]
  dietary_tags: string[]
}

// Demo data for initial UI
const DEMO_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Sourdough Boule',
    description: 'Naturally leavened with a crispy crust and open crumb. 48-hour ferment.',
    price: 8.00,
    image_url: null,
    category: 'Breads',
    is_available: true,
    is_featured: true,
    allergens: ['wheat'],
    dietary_tags: ['vegan'],
  },
  {
    id: '2',
    name: 'Chocolate Croissant',
    description: 'Buttery laminated dough with Belgian dark chocolate.',
    price: 4.50,
    image_url: null,
    category: 'Pastries',
    is_available: true,
    is_featured: true,
    allergens: ['wheat', 'dairy', 'eggs'],
    dietary_tags: [],
  },
  {
    id: '3',
    name: 'Cinnamon Raisin Loaf',
    description: 'Enriched dough swirled with Ceylon cinnamon and golden raisins.',
    price: 9.50,
    image_url: null,
    category: 'Breads',
    is_available: true,
    is_featured: false,
    allergens: ['wheat', 'dairy', 'eggs'],
    dietary_tags: ['vegetarian'],
  },
  {
    id: '4',
    name: 'Habanero Mango Hot Sauce',
    description: 'Sweet heat with fresh mangos and habaneros. 5oz bottle.',
    price: 9.00,
    image_url: null,
    category: 'Hot Sauces',
    is_available: true,
    is_featured: false,
    allergens: [],
    dietary_tags: ['vegan', 'gluten-free'],
  },
  {
    id: '5',
    name: 'Seasonal Truffle Box (6pc)',
    description: 'Assorted hand-rolled truffles. Flavors rotate monthly.',
    price: 24.00,
    image_url: null,
    category: 'Chocolates',
    is_available: false,
    is_featured: false,
    allergens: ['dairy', 'soy'],
    dietary_tags: ['vegetarian'],
  },
]

export default function ProductsPage() {
  const [products] = useState<Product[]>(DEMO_PRODUCTS)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  const categories = [...new Set(products.map(p => p.category))]
  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !filterCategory || p.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Menu Items</h1>
          <p className="text-sm text-slate-500">{products.length} products in your shop</p>
        </div>
        <Button className="gap-2 rounded-xl bg-amber-700 text-white hover:bg-amber-800">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
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
          {categories.map(cat => (
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

      {/* Products table */}
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
              <tr key={product.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 last:border-0">
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
                        {product.is_featured && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-[240px]">{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {product.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  {product.is_available ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      <Eye className="h-3 w-3" /> Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                      <EyeOff className="h-3 w-3" /> Hidden
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {product.dietary_tags.map(tag => (
                      <span key={tag} className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                        {tag}
                      </span>
                    ))}
                    {product.allergens.map(a => (
                      <span key={a} className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-700">
                        {a}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
