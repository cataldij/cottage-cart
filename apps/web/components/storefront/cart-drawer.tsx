'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Truck,
  CheckCircle2,
} from 'lucide-react'
import type { Product, Shop, StorefrontTheme } from './sections/types'
import { formatMoney } from './sections/types'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  shop: Shop
  theme: StorefrontTheme
  products: Product[]
  cart: Record<string, number>
  addToCart: (id: string) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
}

type CheckoutStep = 'cart' | 'info' | 'confirm'

interface CheckoutInfo {
  name: string
  email: string
  phone: string
  pickupDate: string
  pickupTime: string
  notes: string
  isDelivery: boolean
  deliveryAddress: string
}

export function CartDrawer({
  open,
  onClose,
  shop,
  theme,
  products,
  cart,
  addToCart,
  removeFromCart,
  clearCart,
}: CartDrawerProps) {
  const { primaryColor, accentColor, textColor, headingColor, headingFont } = theme
  const [step, setStep] = useState<CheckoutStep>('cart')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState<{ id: string; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<CheckoutInfo>({
    name: '',
    email: '',
    phone: '',
    pickupDate: '',
    pickupTime: '',
    notes: '',
    isDelivery: false,
    deliveryAddress: '',
  })

  const cartItems = Object.entries(cart)
    .map(([productId, qty]) => {
      const product = products.find((p) => p.id === productId)
      if (!product) return null
      return { product, quantity: qty }
    })
    .filter(Boolean) as Array<{ product: Product; quantity: number }>

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const deliveryFee = info.isDelivery ? Number(shop.delivery_fee || 0) : 0
  const total = subtotal + deliveryFee
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)

  const handleSubmit = async () => {
    if (isSubmitting) return
    setError(null)

    if (shop.slug === 'demo') {
      setError('Demo storefront — checkout is preview-only.')
      return
    }

    if (!info.name.trim() || !info.email.trim()) {
      setError('Please fill in your name and email.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/shop/${shop.slug}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity })),
          customerName: info.name.trim(),
          customerPhone: info.phone.trim() || null,
          pickupDate: info.pickupDate || null,
          pickupTime: info.pickupTime || null,
          notes: info.notes.trim() || null,
          isDelivery: info.isDelivery,
          deliveryAddress: info.isDelivery ? info.deliveryAddress.trim() : null,
        }),
      })

      if (response.status === 401) {
        setError('Please sign in to place your order.')
        return
      }

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || 'Could not place order. Please try again.')
        return
      }

      setOrderResult({ id: data.order?.id || 'new', total })
      clearCart()
      setStep('confirm')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep('cart')
    setError(null)
    setOrderResult(null)
    onClose()
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col shadow-2xl"
        style={{ backgroundColor: theme.bgColor, color: textColor, fontFamily: theme.bodyFont }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: `${textColor}1a` }}>
          <div className="flex items-center gap-2">
            {step === 'info' && (
              <button onClick={() => setStep('cart')} className="mr-1 rounded p-1 hover:bg-black/5">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <ShoppingBag className="h-5 w-5" style={{ color: primaryColor }} />
            <h2 className="text-lg font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
              {step === 'cart' ? 'Your Cart' : step === 'info' ? 'Checkout' : 'Order Confirmed'}
            </h2>
          </div>
          <button onClick={handleClose} className="rounded-full p-1.5 hover:bg-black/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === 'cart' && (
            <CartReview
              cartItems={cartItems}
              theme={theme}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
            />
          )}
          {step === 'info' && (
            <CheckoutForm
              info={info}
              setInfo={setInfo}
              theme={theme}
              shop={shop}
            />
          )}
          {step === 'confirm' && orderResult && (
            <OrderConfirmation
              orderResult={orderResult}
              theme={theme}
              shop={shop}
            />
          )}
        </div>

        {/* Footer */}
        {step !== 'confirm' && cartCount > 0 && (
          <div className="border-t px-5 py-4 space-y-3" style={{ borderColor: `${textColor}1a` }}>
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {error}
                {error.includes('sign in') && (
                  <Link href="/login" className="ml-2 underline">Sign in</Link>
                )}
              </div>
            )}

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span style={{ color: `${textColor}99` }}>Subtotal</span>
                <span className="font-semibold">{formatMoney(subtotal)}</span>
              </div>
              {info.isDelivery && deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: `${textColor}99` }}>Delivery</span>
                  <span className="font-semibold">{formatMoney(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-1" style={{ borderColor: `${textColor}1a` }}>
                <span className="font-semibold" style={{ color: headingColor }}>Total</span>
                <span className="text-lg font-bold" style={{ color: primaryColor }}>{formatMoney(total)}</span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                onClick={() => setStep('info')}
                className="flex w-full items-center justify-center gap-2 rounded-full py-3 font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                Checkout
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: primaryColor }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order — {formatMoney(total)}
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {step === 'confirm' && (
          <div className="border-t px-5 py-4" style={{ borderColor: `${textColor}1a` }}>
            <button
              onClick={handleClose}
              className="w-full rounded-full py-3 font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ===================================
// Cart Review Sub-component
// ===================================

function CartReview({
  cartItems,
  theme,
  addToCart,
  removeFromCart,
}: {
  cartItems: Array<{ product: Product; quantity: number }>
  theme: StorefrontTheme
  addToCart: (id: string) => void
  removeFromCart: (id: string) => void
}) {
  const { primaryColor, textColor, headingColor, headingFont } = theme

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="h-12 w-12" style={{ color: `${textColor}40` }} />
        <p className="mt-3 font-semibold" style={{ color: headingColor }}>Your cart is empty</p>
        <p className="mt-1 text-sm" style={{ color: `${textColor}80` }}>Browse products and add items to get started.</p>
      </div>
    )
  }

  return (
    <div className="divide-y" style={{ borderColor: `${textColor}10` }}>
      {cartItems.map(({ product, quantity }) => (
        <div key={product.id} className="flex gap-3 px-5 py-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
            <Image
              src={product.image_url || 'https://images.pexels.com/photos/6605308/pexels-photo-6605308.jpeg?auto=compress&cs=tinysrgb&w=200'}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: headingColor, fontFamily: headingFont }}>
              {product.name}
            </p>
            <p className="text-sm" style={{ color: primaryColor }}>{formatMoney(product.price)}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-sm font-bold" style={{ color: primaryColor }}>
              {formatMoney(product.price * quantity)}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => removeFromCart(product.id)}
                className="flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold"
                style={{ borderColor: `${textColor}25` }}
              >
                {quantity === 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              </button>
              <span className="w-5 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => addToCart(product.id)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ===================================
// Checkout Form Sub-component
// ===================================

function CheckoutForm({
  info,
  setInfo,
  theme,
  shop,
}: {
  info: CheckoutInfo
  setInfo: (info: CheckoutInfo) => void
  theme: StorefrontTheme
  shop: Shop
}) {
  const { primaryColor, textColor, headingColor, headingFont } = theme

  const inputClass = 'w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2'

  return (
    <div className="space-y-5 px-5 py-5">
      <div>
        <h3 className="text-sm font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
          Contact Info
        </h3>
        <div className="mt-2 space-y-3">
          <input
            type="text"
            placeholder="Full Name *"
            value={info.name}
            onChange={(e) => setInfo({ ...info, name: e.target.value })}
            className={inputClass}
            style={{ borderColor: `${textColor}20`, backgroundColor: `${theme.bgColor}` }}
          />
          <input
            type="email"
            placeholder="Email *"
            value={info.email}
            onChange={(e) => setInfo({ ...info, email: e.target.value })}
            className={inputClass}
            style={{ borderColor: `${textColor}20`, backgroundColor: `${theme.bgColor}` }}
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={info.phone}
            onChange={(e) => setInfo({ ...info, phone: e.target.value })}
            className={inputClass}
            style={{ borderColor: `${textColor}20`, backgroundColor: `${theme.bgColor}` }}
          />
        </div>
      </div>

      {/* Pickup or Delivery */}
      <div>
        <h3 className="text-sm font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
          Fulfillment
        </h3>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setInfo({ ...info, isDelivery: false })}
            className={`flex flex-1 items-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
              !info.isDelivery ? 'ring-2' : ''
            }`}
            style={{
              borderColor: !info.isDelivery ? primaryColor : `${textColor}20`,
              ringColor: primaryColor,
              backgroundColor: !info.isDelivery ? `${primaryColor}0a` : 'transparent',
            }}
          >
            <MapPin className="h-4 w-4" style={{ color: primaryColor }} />
            Pickup
          </button>
          {shop.delivery_available && (
            <button
              onClick={() => setInfo({ ...info, isDelivery: true })}
              className={`flex flex-1 items-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
                info.isDelivery ? 'ring-2' : ''
              }`}
              style={{
                borderColor: info.isDelivery ? primaryColor : `${textColor}20`,
                ringColor: primaryColor,
                backgroundColor: info.isDelivery ? `${primaryColor}0a` : 'transparent',
              }}
            >
              <Truck className="h-4 w-4" style={{ color: primaryColor }} />
              Delivery
              {shop.delivery_fee ? ` (+${formatMoney(shop.delivery_fee)})` : ''}
            </button>
          )}
        </div>
      </div>

      {info.isDelivery && (
        <div>
          <input
            type="text"
            placeholder="Delivery Address"
            value={info.deliveryAddress}
            onChange={(e) => setInfo({ ...info, deliveryAddress: e.target.value })}
            className={inputClass}
            style={{ borderColor: `${textColor}20`, backgroundColor: `${theme.bgColor}` }}
          />
        </div>
      )}

      {!info.isDelivery && (
        <div>
          <h3 className="text-sm font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
            Pickup Details
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <input
              type="date"
              value={info.pickupDate}
              onChange={(e) => setInfo({ ...info, pickupDate: e.target.value })}
              className={inputClass}
              style={{ borderColor: `${textColor}20`, backgroundColor: `${theme.bgColor}` }}
            />
            <select
              value={info.pickupTime}
              onChange={(e) => setInfo({ ...info, pickupTime: e.target.value })}
              className={inputClass}
              style={{ borderColor: `${textColor}20`, backgroundColor: `${theme.bgColor}` }}
            >
              <option value="">Pickup time</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="13:00">1:00 PM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
            </select>
          </div>
          {shop.pickup_instructions && (
            <p className="mt-2 text-xs" style={{ color: `${textColor}80` }}>
              {shop.pickup_instructions}
            </p>
          )}
          {shop.location_address && (
            <p className="mt-1 text-xs font-medium" style={{ color: `${textColor}99` }}>
              {shop.location_address}
            </p>
          )}
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
          Order Notes
        </h3>
        <textarea
          placeholder="Special requests, allergies, etc. (optional)"
          value={info.notes}
          onChange={(e) => setInfo({ ...info, notes: e.target.value })}
          rows={2}
          className={`${inputClass} resize-none`}
          style={{ borderColor: `${textColor}20`, backgroundColor: `${theme.bgColor}` }}
        />
      </div>
    </div>
  )
}

// ===================================
// Order Confirmation Sub-component
// ===================================

function OrderConfirmation({
  orderResult,
  theme,
  shop,
}: {
  orderResult: { id: string; total: number }
  theme: StorefrontTheme
  shop: Shop
}) {
  const { primaryColor, textColor, headingColor, headingFont } = theme

  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: `${primaryColor}15` }}
      >
        <CheckCircle2 className="h-8 w-8" style={{ color: primaryColor }} />
      </div>
      <h3 className="mt-5 text-2xl font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
        Order Placed!
      </h3>
      <p className="mt-2 text-sm" style={{ color: `${textColor}99` }}>
        Your order from <strong>{shop.name}</strong> has been placed.
      </p>
      <div
        className="mt-4 rounded-xl border px-4 py-3"
        style={{ borderColor: `${textColor}18`, backgroundColor: `${primaryColor}08` }}
      >
        <p className="text-xs" style={{ color: `${textColor}80` }}>Order ID</p>
        <p className="font-mono text-sm font-semibold" style={{ color: primaryColor }}>
          {orderResult.id.slice(0, 8).toUpperCase()}
        </p>
      </div>
      <p className="mt-3 text-lg font-bold" style={{ color: primaryColor }}>
        Total: {formatMoney(orderResult.total)}
      </p>
      <p className="mt-4 text-xs" style={{ color: `${textColor}80` }}>
        You will receive a confirmation when the maker reviews your order.
      </p>
    </div>
  )
}
