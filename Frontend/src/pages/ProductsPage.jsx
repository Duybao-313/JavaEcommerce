import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthUserBadge from '../components/AuthUserBadge'
import ProductSection from '../components/ProductSection'
import { getAuthSession, isSellerSession } from '../services/sessionService'

function ProductsPage() {
  const [session, setSession] = useState(() => getAuthSession())

  useEffect(() => {
    const sync = () => setSession(getAuthSession())
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div>
          <p className="text-xl font-semibold tracking-tight text-zinc-900">SplitGo</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Trang sản phẩm</p>
        </div>
        <div className="flex items-center gap-3">
          {isSellerSession(session) && (
            <Link to="/products/create" className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700">
              Tạo sản phẩm
            </Link>
          )}
          <AuthUserBadge session={session} />
          <Link to="/" className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900">
            Về trang chủ
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <ProductSection />
      </main>
    </div>
  )
}

export default ProductsPage

