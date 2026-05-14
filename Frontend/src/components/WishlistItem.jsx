import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { addToCart } from "../services/cartService";

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

/**
 * WishlistItem — Single wishlist item row/card.
 *
 * Props:
 *   item: { id, productId, productName, productImage, productPrice, salePrice?, variantAttributes?, hasVariants?, createdAt }
 *   selected: boolean
 *   onSelect: (productId) => void
 *   onRemove: (productId) => void
 */
function WishlistItem({ item, selected, onSelect, onRemove }) {
  const navigate = useNavigate();
  const { refreshCart, openCart } = useCart();
  const [adding, setAdding] = useState(false);

  const hasVariants = Boolean(item.hasVariants);
  const price = Number(item.salePrice || item.productPrice || 0);
  const originalPrice = item.salePrice ? Number(item.productPrice || 0) : null;
  const variantAttrs = item.variantAttributes;

  const handleAddToCart = async (event) => {
    event.stopPropagation();

    if (hasVariants) {
      toast("Vui lòng chọn phân loại hàng trước khi thêm vào giỏ", {
        icon: "🔍",
      });
      navigate(`/products/${item.productId}`);
      return;
    }

    setAdding(true);
    try {
      await addToCart(item.productId, 1, null);
      await refreshCart();
      openCart();
      toast.success("Đã thêm vào giỏ hàng");
    } catch (err) {
      toast.error(err?.message || "Không thể thêm vào giỏ hàng");
    } finally {
      setAdding(false);
    }
  };

  const handleNavigate = () => {
    navigate(`/products/${item.productId}`);
  };

  return (
    <article className="group relative flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-3 transition-shadow hover:shadow-card-hover sm:gap-4 sm:p-4">
      {/* Checkbox */}
      <label className="mt-2 flex shrink-0 cursor-pointer select-none items-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(item.productId)}
          className="h-4 w-4 rounded accent-rose-500"
          aria-label={`Chọn ${item.productName}`}
        />
      </label>

      {/* Thumbnail */}
      <button
        type="button"
        onClick={handleNavigate}
        className="shrink-0 overflow-hidden rounded-xl"
      >
        {item.productImage ? (
          <img
            src={item.productImage}
            alt={item.productName}
            className="h-20 w-20 object-cover sm:h-24 sm:w-24"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-400 sm:h-24 sm:w-24">
            Chưa có ảnh
          </div>
        )}
      </button>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <button type="button" onClick={handleNavigate} className="text-left">
          <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 hover:text-rose-600 sm:text-base">
            {item.productName}
          </h3>
        </button>

        {/* Variant attributes */}
        {variantAttrs && typeof variantAttrs === "object" && (
          <p className="mt-1 text-xs text-zinc-500">
            {Object.values(variantAttrs).join(" · ")}
          </p>
        )}

        {/* Price */}
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-rose-600 sm:text-base">
            {formatPrice(price)}
          </span>
          {originalPrice && (
            <span className="text-xs text-zinc-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Price note */}
        <p className="mt-1 text-[11px] text-zinc-400">
          Giá hiện tại · Có thể thay đổi
        </p>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemove(item.productId);
            }}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
            aria-label={`Xóa ${item.productName} khỏi wishlist`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            Xóa
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {adding
              ? "Đang thêm..."
              : hasVariants
                ? "Chọn phân loại"
                : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default WishlistItem;
