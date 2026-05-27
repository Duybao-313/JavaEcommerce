import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { addToCart } from "../services/cartService";
import { getAuthSession } from "../services/sessionService";

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function BestSellerCard({ product, index }) {
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

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex w-[220px] shrink-0 flex-col rounded-2xl border border-zinc-200/70 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:w-[260px]"
      data-index={index}
    >
      {/* Image */}
      <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-zinc-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading={index > 3 ? "lazy" : "eager"}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">
            📦
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {discountPercent != null && (
            <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              -{discountPercent}%
            </span>
          )}
          {product.soldCount > 0 && (
            <span className="rounded-md bg-zinc-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              Bán chạy
            </span>
          )}
        </div>

        {/* Quick add to cart */}
        {!isSeller && (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding || outOfStock}
            className={`absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all ${
              outOfStock
                ? "cursor-not-allowed bg-zinc-200 text-zinc-400"
                : "bg-white text-zinc-700 hover:bg-zinc-900 hover:text-white"
            } ${adding ? "animate-pulse" : ""}`}
            aria-label={
              outOfStock
                ? "Hết hàng"
                : adding
                  ? "Đang thêm vào giỏ"
                  : `Thêm ${product.name} vào giỏ`
            }
            title={outOfStock ? "Hết hàng — liên hệ người bán để đặt trước" : undefined}
          >
            {adding ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Info */}
      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
        {product.name}
      </h3>

      {product.avgRating != null && (
        <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
          <span className="text-amber-400">★</span>
          <span>{Number(product.avgRating).toFixed(1)}</span>
          {product.soldCount > 0 && (
            <span className="text-zinc-300">· {product.soldCount.toLocaleString("vi-VN")} đã bán</span>
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
    </Link>
  );
}

function SkeletonBestSellerCard() {
  return (
    <div className="flex w-[220px] shrink-0 animate-pulse flex-col rounded-2xl border border-zinc-200/70 bg-white p-3 sm:w-[260px]">
      <div className="mb-3 aspect-[4/3] rounded-xl bg-zinc-200" />
      <div className="mb-2 h-4 w-3/4 rounded-lg bg-zinc-200" />
      <div className="mb-2 h-3 w-1/2 rounded-lg bg-zinc-100" />
      <div className="h-5 w-1/3 rounded-lg bg-zinc-200" />
    </div>
  );
}

export default function BestSellersStrip({
  items = [],
  loading = false,
  showControls = true,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, items]);

  const scrollBy = useCallback((direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.offsetWidth || 260;
    el.scrollBy({ left: direction * (cardWidth + 12) * 2, behavior: "smooth" });
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollBy(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollBy(1);
      }
    },
    [scrollBy],
  );

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section aria-label="Sản phẩm bán chạy" className="relative">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <h2 className="text-base font-bold text-zinc-900 sm:text-lg">
          🔥 Bán chạy nhất
        </h2>
        {showControls && items.length > 0 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canScrollLeft}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-colors hover:border-zinc-400 disabled:cursor-default disabled:opacity-30"
              aria-label="Cuộn sang trái"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canScrollRight}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-colors hover:border-zinc-400 disabled:cursor-default disabled:opacity-30"
              aria-label="Cuộn sang phải"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Scrollable strip */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
        role="list"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Danh sách sản phẩm bán chạy, dùng mũi tên trái phải để cuộn"
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBestSellerCard key={`skeleton-${i}`} />
            ))
          : items.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                style={{ scrollSnapAlign: "start" }}
                role="listitem"
              >
                <BestSellerCard product={product} index={i} />
              </motion.div>
            ))}
      </div>
    </section>
  );
}
