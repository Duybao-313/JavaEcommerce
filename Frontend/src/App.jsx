import React, { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import './App.css'

const skills = [
  {
    title: 'Bộ khung landing chuẩn chuyển đổi',
    type: 'Playbook',
    size: '2.4 MB',
    summary: 'Cấu trúc section, thứ tự thông điệp và vị trí CTA tối ưu cho trang bán hàng.',
  },
  {
    title: 'Quy tắc tương tác và chuyển động',
    type: 'System',
    size: '1.2 MB',
    summary: 'Bộ quy tắc animation giúp trang web mượt, sang và giữ chân người dùng tốt hơn.',
  },
  {
    title: 'Thành phần UI cho ecommerce',
    type: 'Component',
    size: '3.8 MB',
    summary: 'Card sản phẩm, khung ưu đãi, trust badge có thể tái sử dụng cho shop online.',
  },
  {
    title: 'Mẫu theo dõi tăng trưởng',
    type: 'Template',
    size: '890 KB',
    summary: 'Mẫu theo dõi để test nội dung, bố cục và hiệu quả chương trình khuyến mãi hằng tuần.',
  },
]

const categories = [
  { title: 'Điện tử', description: 'Điện thoại, laptop, thiết bị âm thanh và phụ kiện công nghệ.' },
  { title: 'Thời trang', description: 'Quần áo, giày dép và phụ kiện hot trend cập nhật liên tục.' },
  { title: 'Nhà cửa đời sống', description: 'Đồ gia dụng, decor và sản phẩm nâng cấp không gian sống.' },
  { title: 'Làm đẹp chăm sóc cá nhân', description: 'Mỹ phẩm, skincare và sản phẩm chăm sóc sức khỏe mỗi ngày.' },
]

const highlights = [
  'Giao nhanh nội thành và liên tỉnh toàn quốc',
  'Thanh toán an toàn, theo dõi đơn hàng minh bạch',
  'Đổi trả linh hoạt, hỗ trợ tận tâm 24/7',
]

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
}

const fadeUpItem = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: 'easeOut' },
  },
}

function App() {
  const heroRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start end', 'end start'],
  })

  const heroTextY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, prefersReducedMotion ? 0 : -18],
  )
  const heroCardY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, prefersReducedMotion ? 0 : 14],
  )

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <p className="text-xl font-semibold tracking-tight text-zinc-900">SplitGo</p>
        <nav className="hidden gap-8 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 md:flex">
          <a href="#skills" className="hover:text-zinc-900">Năng lực</a>
          <a href="#products" className="hover:text-zinc-900">Danh mục</a>
          <a href="#features" className="hover:text-zinc-900">Lợi ích</a>
          <a href="#contact" className="hover:text-zinc-900">Liên hệ</a>
        </nav>
        <button className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900">
          Mua ngay
        </button>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <motion.section
          ref={heroRef}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-8 border-y border-zinc-200 py-12 md:grid-cols-[1.15fr_0.85fr]"
        >
          <motion.div style={{ y: heroTextY }}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Thiết kế hiện đại cho shop thương mại điện tử
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.03] tracking-tight text-zinc-900 md:text-6xl">
              Trang bán hàng tối ưu chuyển đổi, đẹp, rõ ràng và dễ mua.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 md:text-lg">
              SplitGo tối ưu hành trình mua sắm bằng bố cục mạch lạc, thông điệp ngắn gọn và CTA nổi bật để tăng đơn hàng.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700">
                Khám phá sản phẩm
              </button>
              <button className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-800 hover:border-zinc-900">
                Xem ưu đãi
              </button>
            </div>
          </motion.div>

          <motion.div
            style={{ y: heroCardY }}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.45 }}
            className="rounded-3xl border border-zinc-200 bg-white p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Chương trình tuần này</p>
            <p className="mt-2 text-3xl font-semibold leading-tight text-zinc-900">Giảm đến 40% cho danh mục hot</p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">Ưu đãi giới hạn, cập nhật liên tục để tăng chuyển đổi và doanh thu.</p>
            <div className="mt-7 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Sản phẩm đang bán</p>
                <p className="mt-1 text-xl font-semibold text-zinc-900">2,400+</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Đơn trung bình/ngày</p>
                <p className="mt-1 text-xl font-semibold text-zinc-900">680</p>
              </div>
            </div>
          </motion.div>
        </motion.section>



        <section id="products" className="mt-14">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">Danh mục nổi bật</h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            {categories.map((item, index) => (
              <motion.article
                key={item.title}
                variants={fadeUpItem}
                className="rounded-2xl border border-zinc-200 bg-white p-6"
              >
                <h3 className="text-xl font-semibold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section id="features" className="mt-14 rounded-3xl border border-zinc-200 bg-zinc-950 p-8 text-zinc-100">
          <h2 className="text-3xl font-semibold tracking-tight">Vì sao khách hàng chọn SplitGo</h2>
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-6 grid gap-3 md:grid-cols-3"
          >
            {highlights.map((item) => (
              <motion.li variants={fadeUpItem} key={item} className="rounded-2xl border border-zinc-700 bg-zinc-900 p-5 text-sm leading-relaxed">
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </section>

        <section id="contact" className="mt-14 rounded-3xl border border-zinc-200 bg-white p-8 md:p-10">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">Nhận ưu đãi mới mỗi tuần</h2>
          <p className="mt-2 text-sm text-zinc-600">Đăng ký để nhận mã giảm giá, sản phẩm mới và chương trình độc quyền.</p>
          <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="nhap-email-cua-ban@example.com"
              className="w-full rounded-full border border-zinc-300 px-5 py-3 text-sm outline-none focus:border-zinc-900"
            />
            <button className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700">
              Đăng ký ngay
            </button>
          </form>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-8 text-center text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
        2026 SplitGo. Nền tảng bán hàng ecommerce.
      </footer>
    </div>
  )
}

export default App


