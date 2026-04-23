import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { clearAuth, getAuthSession, getCurrentUserDetail } from '../services/authApi'

function getInitials(name) {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function UserProfilePage() {
  const [session, setSession] = useState(() => getAuthSession())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userDetail, setUserDetail] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!session?.token) {
      navigate('/login', { replace: true })
      return
    }

    async function loadUserDetail() {
      setLoading(true)
      setError('')

      try {
        const detail = await getCurrentUserDetail()
        setUserDetail(detail)
      } catch (err) {
        setError(err?.message || 'Không thể tải thông tin tài khoản')
      } finally {
        setLoading(false)
      }
    }

    loadUserDetail()
  }, [navigate, session?.token])

  const user = useMemo(() => {
    return userDetail || session?.user || null
  }, [session?.user, userDetail])

  const displayName = user?.fullName || user?.username || 'Tài khoản'
  const avatarUrl = user?.avatarUrl

  const handleLogout = () => {
    clearAuth()
    toast.success('Đã đăng xuất')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">SplitGo</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Thông tin người dùng</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/products" className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900">
              Về sản phẩm
            </Link>
            <button onClick={handleLogout} className="rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-700 hover:border-red-500">
              Đăng xuất
            </button>
          </div>
        </header>

        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 text-xl font-bold text-white">
                {getInitials(displayName)}
              </div>
            )}

            <div>
              <p className="text-2xl font-semibold text-zinc-900">{displayName}</p>
              <p className="text-sm text-zinc-600">@{user?.username || 'unknown'}</p>
            </div>
          </div>

          {loading && <p className="mt-6 text-sm text-zinc-600">Đang tải thông tin tài khoản...</p>}
          {!loading && error && <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</p>}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Email</p>
              <p className="mt-1 font-medium text-zinc-900">{user?.email || '-'}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Vai trò</p>
              <p className="mt-1 font-medium text-zinc-900">{String(user?.role || session?.role || '-').replace('ROLE_', '')}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Số điện thoại</p>
              <p className="mt-1 font-medium text-zinc-900">{user?.phone || '-'}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Địa chỉ</p>
              <p className="mt-1 font-medium text-zinc-900">{user?.address || '-'}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default UserProfilePage

