import { useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { clearAuth, getAuthSession, hasRole } from "../../services/sessionService";
import toast from "react-hot-toast";

const navItems = [
  { to: "/admin/products", label: "Sản phẩm" },
  { to: "/admin/orders", label: "Đơn hàng" },
  { to: "/admin/reviews", label: "Đánh giá" },
  { to: "/admin/shippings", label: "Vận chuyển" },
  { to: "/admin/users", label: "Người dùng" },
];

function AdminLayout() {
  const location = useLocation();
  const session = getAuthSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!session?.token || !hasRole(session, "ADMIN")) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    clearAuth();
    toast.success("Đã đăng xuất");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen flex-col bg-zinc-50 lg:flex-row">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white p-4 shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:w-60 lg:translate-x-0 lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            SplitGo
          </p>
          <h1 className="mt-1 text-lg font-bold text-zinc-900">Admin</h1>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 border-t border-zinc-200 pt-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:border-red-300 hover:bg-red-100"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-zinc-200 bg-white px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-zinc-700 hover:bg-zinc-100 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Đăng nhập là</p>
              <p className="text-sm font-semibold text-zinc-900">
                {session?.user?.fullName || session?.user?.username || "Admin"}
              </p>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

