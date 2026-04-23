import React from 'react'
import { Link } from 'react-router-dom'

function getInitials(name) {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function AuthUserBadge({ session }) {
  if (!session?.token) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/login" className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900">
          Đăng nhập
        </Link>
        <Link to="/register" className="hidden rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 md:inline-flex">
          Đăng ký
        </Link>
      </div>
    )
  }

  const user = session.user || {}
  const displayName = user.fullName || user.username || 'Tài khoản'
  const avatarUrl = user.avatarUrl
  const initials = getInitials(displayName)

  return (
    <Link to="/me" className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:border-zinc-900">
      {avatarUrl ? (
        <img src={avatarUrl} alt={displayName} className="h-7 w-7 rounded-full object-cover" />
      ) : (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
          {initials}
        </span>
      )}
      <span className="max-w-[120px] truncate">{displayName}</span>
    </Link>
  )
}

export default AuthUserBadge

