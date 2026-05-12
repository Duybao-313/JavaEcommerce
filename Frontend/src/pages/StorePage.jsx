import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { authFetch } from "../services/authService";
import { parseApiResponse } from "../services/apiClient";
import SellerHeaderCard from "../components/seller/SellerHeaderCard";

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function StorePage() {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  const fetchStoreData = useCallback(async () => {
    if (!sellerId) return;

    setLoading(true);
    setError("");

    try {
      const sellerResp = await authFetch(`/auth/sellers/${sellerId}`);
      const sellerPayload = await parseApiResponse(sellerResp);

      let productsData = [];
      try {
        const productsResp = await authFetch(`/products/seller/${sellerId}`);
        const productsPayload = await parseApiResponse(productsResp);
        productsData = Array.isArray(productsPayload?.data)
          ? productsPayload.data
          : productsPayload?.data?.content || [];
      } catch {
        // Products fetch may fail if not authenticated; that's ok for public view
      }

      if (sellerPayload?.data) {
        setSeller(sellerPayload.data);
      }
      setProducts(productsData);
    } catch (err) {
      setError(err?.message || "Không thể tải thông tin cửa hàng");
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  const storeName = seller?.storeName || "Cửa hàng";

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="animate-pulse space-y-6">
            <div className="h-48 w-full rounded-3xl bg-zinc-200" />
            <div className="h-8 w-48 rounded-xl bg-zinc-200" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-zinc-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-semibold text-red-700">
              Lỗi khi tải cửa hàng
            </p>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <Link
              to="/products"
              className="mt-4 inline-block rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-700 hover:border-red-500"
            >
              Quay lại sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
            <p className="text-sm text-zinc-600">Không tìm thấy cửa hàng này</p>
            <Link
              to="/products"
              className="mt-4 inline-block rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
            >
              Quay lại sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs">
          <Link
            to="/products"
            className="font-semibold uppercase tracking-[0.14em] text-zinc-500 hover:text-zinc-900"
          >
            Sản phẩm
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="font-semibold uppercase tracking-[0.14em] text-zinc-900">
            {storeName}
          </span>
        </div>

        {/* Store Header */}
        <SellerHeaderCard
          storeName={seller.storeName}
          storeLogo={seller.storeLogo}
          storeBanner={seller.storeBanner}
          storeRating={seller.storeRating}
          totalSales={seller.totalSales}
          storeStatus={seller.storeStatus}
          sellerVerified={seller.sellerVerified}
        />

        {/* Store Address */}
        {seller.storeAddress && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
            <span className="text-base">📍</span>
            <span>{seller.storeAddress}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-6 flex gap-2 border-b border-zinc-200 pb-3">
          {[
            { key: "products", label: "Sản phẩm" },
            { key: "about", label: "Giới thiệu" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                activeTab === tab.key
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "products" && (
          <div className="mt-6">
            {products.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
                Cửa hàng chưa có sản phẩm nào
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-zinc-400 hover:shadow-md"
                  >
                    <div className="mb-3 aspect-square overflow-hidden rounded-xl bg-zinc-100">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl">
                          📦
                        </div>
                      )}
                    </div>
                    <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-lg font-bold text-zinc-900">
                      {formatPrice(product.salePrice || product.price)}
                    </p>
                    {product.salePrice && (
                      <p className="text-xs text-zinc-400 line-through">
                        {formatPrice(product.price)}
                      </p>
                    )}
                    {product.avgRating != null && (
                      <p className="mt-1 text-xs text-zinc-500">
                        ⭐ {Number(product.avgRating).toFixed(1)} (
                        {product.reviewCount || 0})
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-zinc-900">
              Về {storeName}
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  Địa chỉ
                </p>
                <p className="mt-1 font-medium text-zinc-900">
                  {seller.storeAddress || "Chưa cập nhật"}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  Đánh giá
                </p>
                <p className="mt-1 font-medium text-zinc-900">
                  {seller.storeRating != null
                    ? `⭐ ${Number(seller.storeRating).toFixed(1)}`
                    : "Chưa có đánh giá"}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  Tổng sản phẩm đã bán
                </p>
                <p className="mt-1 font-medium text-zinc-900">
                  {Number(seller.totalSales || 0).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  Trạng thái
                </p>
                <p className="mt-1">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      seller.sellerVerified === "APPROVED"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-zinc-200 bg-zinc-50 text-zinc-500"
                    }`}
                  >
                    {seller.sellerVerified === "APPROVED"
                      ? "Đã xác thực"
                      : "Chưa xác thực"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StorePage;
