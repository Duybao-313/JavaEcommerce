import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { getCart, removeFromCart, updateCartItem } from '../services/cartService'
import { getAuthSession, isSellerSession } from '../services/sessionService'

const CartContext = createContext(null)

function toNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItemIds, setSelectedItemIds] = useState([])

  const session = getAuthSession()
  const canUseCart = Boolean(session?.token) && !isSellerSession(session)

  const refreshCart = useCallback(async () => {
    if (!canUseCart) {
      setCart(null)
      setSelectedItemIds([])
      return
    }

    setLoading(true)
    try {
      const data = await getCart()
      setCart(data || { items: [], totalAmount: 0 })
      setSelectedItemIds((prev) => {
        if (!Array.isArray(data?.items) || data.items.length === 0) return []
        const available = new Set(data.items.map((item) => item.cartItemId))
        const next = prev.filter((id) => available.has(id))
        return next
      })
    } catch (error) {
      setCart({ items: [], totalAmount: 0 })
      setSelectedItemIds([])
    } finally {
      setLoading(false)
    }
  }, [canUseCart])

  useEffect(() => {
    refreshCart()

    const sync = () => {
      refreshCart()
    }

    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)

    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', sync)
    }
  }, [refreshCart])

  const items = useMemo(() => (Array.isArray(cart?.items) ? cart.items : []), [cart])

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + toNumber(item?.quantity), 0),
    [items],
  )

  const totalAmount = useMemo(() => toNumber(cart?.totalAmount), [cart])

  const selectedItems = useMemo(() => {
    if (selectedItemIds.length === 0) return items
    const selectedSet = new Set(selectedItemIds)
    return items.filter((item) => selectedSet.has(item.cartItemId))
  }, [items, selectedItemIds])

  const selectedTotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + toNumber(item?.lineTotal), 0),
    [selectedItems],
  )

  const openCart = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeCart = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggleCart = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const setItemSelected = useCallback((cartItemId, checked) => {
    setSelectedItemIds((prev) => {
      const hasId = prev.includes(cartItemId)
      if (checked && !hasId) return [...prev, cartItemId]
      if (!checked && hasId) return prev.filter((id) => id !== cartItemId)
      return prev
    })
  }, [])

  const selectAllItems = useCallback(() => {
    setSelectedItemIds(items.map((item) => item.cartItemId))
  }, [items])

  const clearSelectedItems = useCallback(() => {
    setSelectedItemIds([])
  }, [])

  const changeItemQuantity = useCallback(
    async (cartItemId, quantity) => {
      const nextQuantity = Math.max(1, toNumber(quantity))
      await updateCartItem(cartItemId, nextQuantity)
      await refreshCart()
    },
    [refreshCart],
  )

  const removeItem = useCallback(
    async (cartItemId) => {
      await removeFromCart(cartItemId)
      setSelectedItemIds((prev) => prev.filter((id) => id !== cartItemId))
      await refreshCart()
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
    },
    [refreshCart],
  )

  const value = {
    cart,
    items,
    itemCount,
    totalAmount,
    selectedItems,
    selectedItemIds,
    selectedTotal,
    isOpen,
    loading,
    canUseCart,
    openCart,
    closeCart,
    toggleCart,
    refreshCart,
    setItemSelected,
    selectAllItems,
    clearSelectedItems,
    changeItemQuantity,
    removeItem,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

