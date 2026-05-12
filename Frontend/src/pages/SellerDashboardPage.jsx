import React, { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";
import {
  clearAuth,
  getAuthSession,
  isSellerSession,
} from "../services/sessionService";
import { getCurrentUserDetail } from "../services/authService";
import SellerHeaderCard from "../components/seller/SellerHeaderCard";

const navItems = [
  {
    label: "Dashboard",
    to: "/seller/dashboard",
  },
  {
    label: "Hồ sơ cửa hàng",
    to: "/profile",
  },
  {
    label: "Sản phẩm của tôi",
    to: "/seller/products",
  },
  {
    label: "Tạo sản phẩm",
    to: "/seller/products/create",
  },
  {
    label: "Lịch sử đơn bán",
    to: "/seller/orders",
  },
];

function SellerDashboardHome() {
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUserDetail()
      .then((data) => setUserDetail(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-6">
      {/* Store Header */}
      {!loading && userDetail && (
        <SellerHeaderCard
          storeName={userDetail.storeName}
          storeLogo={userDetail.storeLogo}
          storeBanner={userDetail.storeBanner}
          storeRating={userDetail.storeRating}
          totalSales={userDetail.totalSales}
          storeStatus={userDetail.storeStatus}
          sellerVerified={userDetail.sellerVerified}
          compact
        />
      )}

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Seller Overview
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
          Dashboard người bán
        </h1>
        <p className="mt-3 text-sm text-zinc-600">
          Chào mừng bạn đến khu vực seller. Tại đây bạn có thể quản lý sản phẩm,
          theo dõi đơn hàng và vận hành gian hàng của mình.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Link
            to="/seller/products"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 hover:border-zinc-400 transition-colors"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              Sản phẩm
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-900">
              Quản lý danh mục bán
            </p>
          </Link>
          <Link
            to="/seller/orders"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 hover:border-zinc-400 transition-colors"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              Đơn hàng
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-900">
              Theo dõi lịch sử đơn bán
            </p>
          </Link>
          <Link
            to="/profile"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 hover:border-zinc-400 transition-colors"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              Hồ sơ cửa hàng
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-900">
              Quản lý thông tin gian hàng
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}

function SellerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getAuthSession();
  const displayName =
    session?.user?.fullName || session?.user?.username || "Seller";

  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }

  if (!isSellerSession(session)) {
    return <Navigate to="/products" replace />;
  }

  const handleLogout = () => {
    clearAuth();
    toast.success("Đăng xuất thành công");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-2xl bg-zinc-900 px-4 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-300">
              SplitGo Seller
            </p>
            <p className="mt-1 text-sm font-semibold">{displayName}</p>
          </div>

          <nav className="mt-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-900 hover:text-zinc-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:border-red-400"
          >
            Đăng xuất
          </button>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export { SellerDashboardHome, SellerLayout };
export default SellerLayout;
