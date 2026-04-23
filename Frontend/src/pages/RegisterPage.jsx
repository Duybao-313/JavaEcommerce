import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { register, persistAuthResult } from '../services/authApi'
import { registerDemoAccounts } from '../constants/demoAccounts'

const initialState = {
  username: 'Duybao',
  password: '123456',
  fullName: 'duybao',
  email: 'duybao122123@gmail.com',
}

function RegisterPage() {
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const fillDemoAccount = (account) => {
    setForm({
      username: account.username,
      password: account.password,
      fullName: account.fullName,
      email: account.email,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    const payload = {
      username: form.username.trim(),
      password: form.password,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
    }

    const request = register(payload)

    try {
      const result = await toast.promise(request, {
        loading: 'Đang tạo tài khoản...',
        success: (response) => response?.message || 'Đăng ký thành công',
        error: (err) => err?.message || 'Đăng ký thất bại',
      })

      persistAuthResult(result)
      navigate('/products')
    } catch {
      // toast.promise đã hiển thị lỗi
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-zinc-200 bg-zinc-950 p-8 text-zinc-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">SplitGo</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Tạo tài khoản mới</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            Đăng ký để theo dõi đơn hàng, nhận ưu đãi riêng và mua sắm nhanh hơn.
          </p>

          <div className="mt-8 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Mẫu điền nhanh</p>
            {registerDemoAccounts.map((account) => (
              <button
                key={account.label}
                type="button"
                onClick={() => fillDemoAccount(account)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left text-sm text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">{account.label}</p>
                <p className="mt-2 font-semibold">{account.username}</p>
                <p className="text-zinc-400">{account.fullName} • {account.email}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-5 text-sm leading-relaxed text-zinc-200">
            <p className="font-semibold text-zinc-100">Thông báo nổi</p>
            <p className="mt-2">Khi đăng ký thành công hoặc lỗi, toast sẽ hiện ở góc màn hình.</p>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Biểu mẫu</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">Đăng ký tài khoản</h2>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="username">
                Tên đăng nhập
              </label>
              <input
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Duybao"
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="fullName">
                Họ và tên
              </label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="duybao"
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="duybao122123@gmail.com"
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="password">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="123456"
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm text-zinc-600">
            <Link to="/login" className="font-semibold text-zinc-900 hover:underline">
              Đã có tài khoản? Đăng nhập
            </Link>
            <Link to="/" className="hover:text-zinc-900">
              Về trang chủ
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default RegisterPage


