import React from 'react'
import { useCart } from '../context/CartContext'

function CartButton({ className = '' }) {
  const { canUseCart, itemCount, toggleCart } = useCart()

  if (!canUseCart) return null

  return (
    <button
      type="button"
      onClick={toggleCart}
      className={`relative rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 ${className}`}
    >
      Giỏ hàng
      {itemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white">
          {itemCount}
        </span>
      )}
    </button>
  )
}

export default CartButton


