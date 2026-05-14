import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import CartDrawer from "../components/CartDrawer";
import WishlistItem from "../components/WishlistItem";
import { useCart } from "../context/CartContext";
import { getAuthSession } from "../services/sessionService";
import {
  getWishlist,
  removeFromWishlist,
  addToWishlist,
} from "../services/wishlistService";
import { addToCart } from "../services/cartService";
import { getProductDetail } from "../services/productService";

/* ── Skeleton ─────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start gap-4">
        <div className="h-5 w-5 shrink-0 rounded bg-zinc-200" />
        <div className="h-24 w-24 shrink-0 rounded-xl bg-zinc-200" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 w-3/4 rounded bg-zinc-200" />
          <div className="h-3 w-1/3 rounded bg-zinc-100" />
          <div className="h-4 w-1/4 rounded bg-zinc-200" />
          <div className="flex gap-2">
            <div className="h-7 w-14 rounded-lg bg-zinc-200" />
            <div className="h-7 w-24 rounded-lg bg-zinc-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/* ── Empty State ───────────────────────────────── */
function EmptyWishlist() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center px-4 py-20 text-center"
    >
      {/* Simple line-art heart illustration */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-50">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-rose-300"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-zinc-800">
        Bạn chưa lưu sản phẩm nào
      </h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        Thêm sản phẩm bạn thích để mua sau nhé.
      </p>

      <Link
        to="/products"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        Mua sắm ngay
      </Link>
    </motion.div>
  );
}

/* ── Error State ────────────────────────────────── */
function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="mx-auto mt-16 flex max-w-md flex-col items-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
    >
      <p className="text-sm font-medium text-red-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
      >
        Thử lại
      </button>
    </div>
  );
}

/* ── WishlistPage ───────────────────────────────── */
function WishlistPage() {
  const navigate = useNavigate();
  const { refreshCart, openCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [batchAdding, setBatchAdding] = useState(false);

  // Undo support
  const undoRef = useRef(null); // { productId, item }
  const undoTimerRef = useRef(null);

  const session = getAuthSession();
  const isLoggedIn = Boolean(session?.token);

  const loadWishlist = useCallback(async () => {
    if (!isLoggedIn) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const raw = await getWishlist();

      // Enrich items: batch-fetch product details for salePrice, variants, etc.
      const enriched = await Promise.all(
        raw.map(async (wishItem) => {
          try {
            const product = await getProductDetail(wishItem.productId);
            const hasVariants =
              Array.isArray(product?.variants) && product.variants.length > 0;

            // If wishlist has a variantId, find its attributes
            let variantAttributes = null;
            if (wishItem.variantId && product?.variants) {
              const variant = product.variants.find(
                (v) => v.id === wishItem.variantId,
              );
              variantAttributes = variant?.attributes || null;
            }

            return {
              ...wishItem,
              salePrice: product?.salePrice || null,
              variantAttributes,
              hasVariants,
              sellerName: product?.seller?.storeName || null,
            };
          } catch {
            return { ...wishItem, hasVariants: false };
          }
        }),
      );

      setItems(enriched);
    } catch (err) {
      setError(err?.message || "Không thể tải danh sách yêu thích");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/login", { replace: true });
    }
  }, [loading, isLoggedIn, navigate]);

  const handleSelect = useCallback((productId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const handleRemove = useCallback(
    async (productId) => {
      // Clear previous undo timer
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
        // Actually delete the previously undone item
        if (undoRef.current) {
          removeFromWishlist(undoRef.current.productId).catch(() => {});
        }
      }

      const removedItem = items.find((it) => it.productId === productId);
      if (!removedItem) return;

      // Optimistic remove
      setItems((prev) => prev.filter((it) => it.productId !== productId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });

      // Set up undo
      undoRef.current = { productId, item: removedItem };

      const undoToastId = toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="text-sm">Đã xóa khỏi Wishlist</span>
            <button
              type="button"
              onClick={() => {
                // Undo: re-add
                setItems((prev) => {
                  const exists = prev.find((it) => it.productId === productId);
                  if (exists) return prev;
                  return [...prev, removedItem];
                });
                addToWishlist(productId).catch(() => {});
                undoRef.current = null;
                toast.dismiss(t.id);
              }}
              className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
            >
              Hoàn tác
            </button>
          </div>
        ),
        { duration: 4000 },
      );

      // After timeout, actually delete
      undoTimerRef.current = setTimeout(async () => {
        try {
          await removeFromWishlist(productId);
        } catch {
          // If API fails, restore item
          setItems((prev) => {
            const exists = prev.find((it) => it.productId === productId);
            if (exists) return prev;
            return [...prev, removedItem];
          });
          toast.error("Không thể xóa, vui lòng thử lại", {
            id: undoToastId,
          });
        }
        undoRef.current = null;
      }, 4000);
    },
    [items],
  );

  const handleRemoveSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    ids.forEach((id) => handleRemove(id));
  }, [selectedIds, handleRemove]);

  const handleBatchAddToCart = useCallback(async () => {
    // Only add items without variants
    const addableItems = items.filter(
      (it) => !it.hasVariants && selectedIds.has(it.productId),
    );

    if (addableItems.length === 0) {
      // Check if there are any selected items at all
      const selectedItems = items.filter((it) => selectedIds.has(it.productId));
      if (selectedItems.length === 0) {
        toast.error("Vui lòng chọn sản phẩm");
      } else {
        toast(
          "Các sản phẩm đã chọn cần chọn phân loại trước khi thêm vào giỏ",
          {
            icon: "🔍",
            duration: 3000,
          },
        );
      }
      return;
    }

    setBatchAdding(true);
    let added = 0;
    let failed = 0;
    const skipped = items.filter(
      (it) => it.hasVariants && selectedIds.has(it.productId),
    ).length;

    for (const item of addableItems) {
      try {
        await addToCart(item.productId, 1, null);
        added++;
      } catch {
        failed++;
      }
    }

    setBatchAdding(false);
    await refreshCart();

    if (added > 0) {
      toast.success(`Đã thêm ${added} sản phẩm vào giỏ hàng`, {
        duration: 3000,
      });
      openCart();
    }

    if (failed > 0) {
      toast.error(`${failed} sản phẩm không thể thêm`);
    }

    if (skipped > 0) {
      toast(`${skipped} sản phẩm cần chọn phân loại`, {
        icon: "🔍",
        duration: 3000,
      });
    }
  }, [items, selectedIds, refreshCart, openCart]);

  /* ── Render ─────────────────────────────────── */

  // Loading
  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-6 w-24 animate-pulse rounded bg-zinc-200" />
        </div>
        <SkeletonGrid count={4} />
      </main>
    );
  }

  // Error
  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <ErrorState message={error} onRetry={loadWishlist} />
      </main>
    );
  }

  // Empty
  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <EmptyWishlist />
      </main>
    );
  }

  /* ── List ──────────────────────────────────── */

  const allSelected = selectedIds.size === items.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((it) => it.productId)));
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Danh sách yêu thích
            <span className="ml-2 text-sm font-normal text-zinc-500">
              ({items.length})
            </span>
          </h1>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5">
        <button
          type="button"
          onClick={toggleSelectAll}
          className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600 hover:text-zinc-900"
        >
          {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </button>

        <span className="mx-1 text-zinc-300">|</span>

        <button
          type="button"
          onClick={handleBatchAddToCart}
          disabled={batchAdding || selectedIds.size === 0}
          className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 hover:text-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-400"
        >
          {batchAdding ? "Đang thêm..." : "Thêm tất cả vào giỏ"}
        </button>

        <span className="mx-1 text-zinc-300">|</span>

        <button
          type="button"
          onClick={handleRemoveSelected}
          disabled={selectedIds.size === 0}
          className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 hover:text-rose-600 disabled:cursor-not-allowed disabled:text-zinc-400"
        >
          Xóa đã chọn
        </button>
      </div>

      {/* Items */}
      <motion.div initial="hidden" animate="visible" className="space-y-3">
        {items.map((item) => (
          <motion.div
            key={item.productId}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <WishlistItem
              item={item}
              selected={selectedIds.has(item.productId)}
              onSelect={handleSelect}
              onRemove={handleRemove}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Cart drawer */}
      <CartDrawer />
    </main>
  );
}

export default WishlistPage;
