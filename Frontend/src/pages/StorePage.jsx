import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { addToCart } from "../services/cartService";
import { getAuthSession } from "../services/sessionService";
import {
  getStoreProfile,
  getBestSellers,
  getStoreProducts,
} from "../services/storeService";
import StoreHeader from "../components/StoreHeader";
import BestSellersStrip from "../components/BestSellersStrip";
import ProductsToolbar from "../components/ProductsToolbar";
import WishlistButton from "../components/WishlistButton";

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

const VIEW_STORAGE_KEY = "storePageViewMode";

function getSavedView() {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) || "grid";
  } catch {
    return "grid";
  }
}

function saveView(mode) {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, mode);
  } catch {
    /* noop */
  }
}

/* ─────────────────────────────────────────────
   Product Card
   ───────────────────────────────────────────── */

function ProductCard({ product, viewMode }) {
  const { refreshCart } = useCart();
  const [adding, setAdding] = useState(false);
  const isSeller = getAuthSession()?.role === "SELLER";
  const outOfStock = product.stock != null && product.stock <= 0;

  const handleAddToCart = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (outOfStock) return;
      setAdding(true);
      try {
        await addToCart(product.id, 1);
        await refreshCart();
        toast.success(`Đã thêm "${product.name}" vào giỏ`, { duration: 2000 });
      } catch (err) {
        toast.error(err?.message || "Không thể thêm vào giỏ hàng");
      } finally {
        setAdding(false);
      }
    },
    [product.id, product.name, refreshCart, outOfStock],
  );

  const discountPercent =
    product.salePrice && product.price && product.price > product.salePrice
      ? Math.round((1 - product.salePrice / product.price) * 100)
      : null;

  const isGrid = viewMode !== "list";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <Link
        to={`/products/${product.id}`}
        className={`group flex rounded-2xl border border-zinc-200/70 bg-white shadow-sm transition-shadow hover:border-zinc-300 hover:shadow-md ${
          isGrid ? "flex-col p-3" : "flex-row items-center gap-4 p-3 sm:p-4"
        }`}
      >
        {/* Image */}
        <div
          className={`relative overflow-hidden rounded-xl bg-zinc-100 ${
            isGrid
              ? "mb-3 aspect-square w-full"
              : "h-24 w-24 shrink-0 sm:h-28 sm:w-28"
          }`}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl">
              📦
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-1.5 top-1.5 flex flex-col gap-1">
            {discountPercent != null && (
              <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                -{discountPercent}%
              </span>
            )}
            {product.soldCount > 50 && !discountPercent && (
              <span className="rounded-md bg-zinc-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                Bán chạy
              </span>
            )}
          </div>

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
              <span className="rounded-full bg-zinc-900/80 px-2.5 py-1 text-[10px] font-semibold text-white">
                Hết hàng
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className={`min-w-0 flex-1 ${isGrid ? "" : "self-start"}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
            {product.name}
          </h3>

          {product.avgRating != null && (
            <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
              <span className="text-amber-400">★</span>
              <span>{Number(product.avgRating).toFixed(1)}</span>
              {product.reviewCount > 0 && (
                <span className="text-zinc-300">({product.reviewCount})</span>
              )}
            </p>
          )}

          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-base font-bold text-zinc-900">
              {formatPrice(product.salePrice || product.price)}
            </span>
            {product.salePrice && product.price > product.salePrice && (
              <span className="text-xs text-zinc-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* List-view extra info */}
          {!isGrid && (
            <p className="mt-1 line-clamp-1 text-xs text-zinc-400">
              {product.soldCount != null
                ? `${product.soldCount.toLocaleString("vi-VN")} đã bán`
                : ""}
            </p>
          )}
        </div>

        {/* Actions (list view only) */}
        {!isGrid && !isSeller && (
          <div className="flex shrink-0 items-center gap-2 self-center">
            <WishlistButton productId={product.id} size="sm" />
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || outOfStock}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                outOfStock
                  ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400"
                  : adding
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800"
              } disabled:cursor-not-allowed`}
            >
              {adding ? (
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "Thêm vào giỏ"
              )}
            </button>
          </div>
        )}

        {/* Grid view actions */}
        {isGrid && !isSeller && (
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || outOfStock}
              className={`flex-1 rounded-full border py-1.5 text-xs font-semibold transition-all ${
                outOfStock
                  ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400"
                  : adding
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              {outOfStock ? "Hết hàng" : adding ? "Đang thêm..." : "Thêm vào giỏ"}
            </button>
            <WishlistButton productId={product.id} size="sm" />
          </div>
        )}
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Skeleton Cards
   ───────────────────────────────────────────── */

function SkeletonCard({ viewMode }) {
  const isGrid = viewMode !== "list";
  return (
    <div
      className={`flex animate-pulse rounded-2xl border border-zinc-200/70 bg-white ${
        isGrid ? "flex-col p-3" : "flex-row items-center gap-4 p-3 sm:p-4"
      }`}
    >
      <div
        className={`rounded-xl bg-zinc-200 ${
          isGrid
            ? "mb-3 aspect-square w-full"
            : "h-24 w-24 shrink-0 sm:h-28 sm:w-28"
        }`}
      />
      <div
        className={`min-w-0 flex-1 ${isGrid ? "space-y-2" : "space-y-2 self-start"}`}
      >
        <div className="h-4 w-3/4 rounded-lg bg-zinc-200" />
        <div className="h-3 w-1/2 rounded-lg bg-zinc-100" />
        <div className="h-5 w-1/3 rounded-lg bg-zinc-200" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Empty & Error States
   ───────────────────────────────────────────── */

function EmptyState({ message = "Cửa hàng hiện chưa có sản phẩm" }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center">
      <div className="mb-4 text-5xl">🏪</div>
      <h3 className="text-lg font-semibold text-zinc-900">{message}</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Hãy quay lại sau hoặc liên hệ người bán để biết thêm chi tiết.
      </p>
    </div>
  );
}

function StoreNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 text-6xl">🔍</div>
      <h1 className="text-2xl font-bold text-zinc-900">
        Cửa hàng không tồn tại
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Cửa hàng bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.
      </p>
      <Link
        to="/products"
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-zinc-900 bg-zinc-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-800"
      >
        ← Quay lại sản phẩm
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Store Page
   ───────────────────────────────────────────── */

export default function StorePage() {
  const { sellerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── State ──────────────────────────────────
  const [store, setStore] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingBest, setLoadingBest] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  // Filters / sort / view
  const [viewMode, setViewMode] = useState(getSavedView);
  const currentSort = searchParams.get("sort") || "soldDesc";
  const currentPage = parseInt(searchParams.get("page") || "0", 10);

  const pageSize = 24;
  const isSeller = getAuthSession()?.role === "SELLER";

  // ── Fetch store profile ────────────────────
  const fetchStore = useCallback(async () => {
    if (!sellerId) return;
    try {
      const data = await getStoreProfile(sellerId);
      if (!data) {
        setNotFound(true);
        return;
      }
      setStore(data);
    } catch (err) {
      if (err?.status === 404) {
        setNotFound(true);
      } else {
        setError(err?.message || "Không thể tải thông tin cửa hàng");
      }
    }
  }, [sellerId]);

  // ── Fetch best sellers ─────────────────────
  const fetchBestSellers = useCallback(async () => {
    if (!sellerId) return;
    setLoadingBest(true);
    try {
      const data = await getBestSellers(sellerId, 8);
      setBestSellers(data);
    } catch {
      // best-sellers is optional; don't block UI
    } finally {
      setLoadingBest(false);
    }
  }, [sellerId]);

  // ── Fetch products ─────────────────────────
  const fetchProducts = useCallback(
    async (page, append = false) => {
      if (!sellerId) return;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError("");
      try {
        const data = await getStoreProducts(sellerId, {
          page,
          size: pageSize,
          sort: currentSort,
        });
        if (append) {
          setProducts((prev) => [...prev, ...(data.content || [])]);
        } else {
          setProducts(data.content || []);
        }
        setTotalElements(data.totalElements || 0);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        setError(err?.message || "Không thể tải sản phẩm");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sellerId, currentSort, pageSize],
  );

  // ── Initial load ───────────────────────────
  useEffect(() => {
    setNotFound(false);
    setError("");
    setProducts([]);
    Promise.all([fetchStore(), fetchBestSellers()]);
    // fetchProducts triggered by next effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  // ── Load products on sort/page change ──────
  useEffect(() => {
    if (!sellerId || notFound) return;
    fetchProducts(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId, currentSort, currentPage]);

  // ── Handlers ───────────────────────────────
  const handleSortChange = useCallback(
    (sort) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("sort", sort);
        next.delete("page");
        return next;
      });
    },
    [setSearchParams],
  );

  const handleToggleView = useCallback((mode) => {
    setViewMode(mode);
    saveView(mode);
  }, []);

  const handleLoadMore = useCallback(() => {
    const nextPage = currentPage + 1;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(nextPage));
      return next;
    });
    fetchProducts(nextPage, true);
  }, [currentPage, fetchProducts, setSearchParams]);

  // ── Derived ────────────────────────────────
  const hasMore = currentPage < totalPages - 1;
  const showLoadMore = hasMore && !loading && products.length > 0;

  // ── Render: not found ──────────────────────
  if (notFound) return <StoreNotFound />;

  // ── Render: error (no store data) ──────────
  if (error && !store) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-semibold text-red-700">
              Lỗi khi tải cửa hàng
            </p>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  fetchStore();
                  fetchBestSellers();
                }}
                className="inline-block rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-700 hover:border-red-500"
              >
                Thử lại
              </button>
              <Link
                to="/products"
                className="inline-block rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600 hover:border-zinc-900"
              >
                Quay lại
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: loading skeleton ───────────────
  if (loading && !store) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-5xl animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="h-64 w-full rounded-[2rem] bg-zinc-200" />
          {/* Best sellers skeleton */}
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-64 w-[220px] shrink-0 rounded-2xl bg-zinc-200 sm:w-[260px]"
              />
            ))}
          </div>
          {/* Product grid skeleton */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-zinc-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const storeName = store?.storeName || "Cửa hàng";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)]">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Breadcrumb */}
        <nav
          className="mb-4 flex items-center gap-2 text-xs sm:mb-6"
          aria-label="Breadcrumb"
        >
          <Link
            to="/products"
            className="font-semibold uppercase tracking-[0.14em] text-zinc-400 hover:text-zinc-700"
          >
            Sản phẩm
          </Link>
          <span className="text-zinc-300" aria-hidden="true">
            /
          </span>
          <span className="max-w-[200px] truncate font-semibold uppercase tracking-[0.14em] text-zinc-900">
            {storeName}
          </span>
        </nav>

        {/* ── Section: Store Header ── */}
        <StoreHeader store={{ ...store, totalProducts: totalElements }} />

        {/* ── Section A: Best Sellers ── */}
        <div className="mt-6 sm:mt-8">
          <BestSellersStrip items={bestSellers} loading={loadingBest} />
        </div>

        {/* ── Section B: Product List ── */}
        <section
          className="mt-6 sm:mt-10"
          aria-labelledby="store-products-heading"
        >
          <h2 id="store-products-heading" className="sr-only">
            Tất cả sản phẩm của {storeName}
          </h2>

          {/* Toolbar */}
          <ProductsToolbar
            total={totalElements}
            sort={currentSort}
            onSortChange={handleSortChange}
            viewMode={viewMode}
            onToggleView={isSeller ? undefined : handleToggleView}
          />

          {/* Product list */}
          <div className="mt-4">
            {loading && products.length === 0 ? (
              <div
                className={`grid gap-4 ${
                  viewMode === "list"
                    ? "grid-cols-1"
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                }`}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} viewMode={viewMode} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  <div
                    className={`grid gap-4 ${
                      viewMode === "list"
                        ? "grid-cols-1"
                        : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                    }`}
                  >
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </AnimatePresence>

                {/* Inline error for products */}
                {error && products.length > 0 && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}{" "}
                    <button
                      type="button"
                      onClick={() => fetchProducts(currentPage)}
                      className="ml-2 font-semibold underline hover:no-underline"
                    >
                      Thử lại
                    </button>
                  </div>
                )}

                {/* Load more */}
                {showLoadMore && (
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700 transition-colors hover:border-zinc-900 disabled:cursor-wait disabled:opacity-60"
                    >
                      {loadingMore ? (
                        <>
                          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-900" />
                          Đang tải...
                        </>
                      ) : (
                        "Xem thêm sản phẩm"
                      )}
                    </button>
                  </div>
                )}

                {/* Total count */}
                {totalElements > 0 && (
                  <p className="mt-4 text-center text-xs text-zinc-400">
                    Hiển thị {products.length.toLocaleString("vi-VN")} /{" "}
                    {totalElements.toLocaleString("vi-VN")} sản phẩm
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
