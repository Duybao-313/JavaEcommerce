import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getAuthSession } from "../services/sessionService";
import {
  addToWishlist,
  checkWishlist,
  removeFromWishlist,
} from "../services/wishlistService";

/**
 * WishlistButton — Heart toggle for product cards & product detail.
 *
 * Props:
 *   productId: number (required)
 *   initialActive?: boolean — pre-seeded state (optional, skips check call)
 *   onToggle?: (active: boolean) => void
 *   size?: 'sm' | 'md' — default 'md'
 *   className?: string
 */
function WishlistButton({
  productId,
  initialActive,
  onToggle,
  size = "md",
  className = "",
}) {
  const [active, setActive] = useState(!!initialActive);
  const [checked, setChecked] = useState(initialActive != null);
  const pendingRef = useRef(false);

  const session = getAuthSession();
  const isLoggedIn = Boolean(session?.token);

  const iconSize = size === "sm" ? 16 : 20;
  const hitSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  // Resolve initial state from API if not seeded
  useEffect(() => {
    if (initialActive != null || !isLoggedIn) {
      setChecked(true);
      return;
    }

    let cancelled = false;
    checkWishlist(productId)
      .then((inWishlist) => {
        if (!cancelled) {
          setActive(inWishlist);
          setChecked(true);
        }
      })
      .catch(() => {
        if (!cancelled) setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [productId, initialActive, isLoggedIn]);

  const handleToggle = useCallback(
    async (event) => {
      event.stopPropagation();
      event.preventDefault();

      if (!isLoggedIn) {
        toast.error("Vui lòng đăng nhập để dùng tính năng này");
        return;
      }

      if (pendingRef.current) return;

      const next = !active;
      // Optimistic update
      setActive(next);
      pendingRef.current = true;

      try {
        if (next) {
          await addToWishlist(productId);
          toast.success("Đã thêm vào Wishlist");
        } else {
          await removeFromWishlist(productId);
          toast("Đã xóa khỏi Wishlist", {
            icon: "💔",
            duration: 4000,
          });
        }
        onToggle?.(next);
      } catch (err) {
        // Rollback on failure
        setActive(!next);
        toast.error(err?.message || "Có lỗi xảy ra, vui lòng thử lại");
      } finally {
        pendingRef.current = false;
      }
    },
    [active, isLoggedIn, productId, onToggle],
  );

  return (
    <button
      type="button"
      role="button"
      aria-pressed={active}
      aria-label={active ? "Xóa khỏi wishlist" : "Thêm vào wishlist"}
      onClick={handleToggle}
      className={`group relative inline-flex items-center justify-center rounded-full transition-all
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500
        ${hitSize}
        ${
          active
            ? "text-rose-500 bg-amber-50/85 border border-amber-200/80 shadow-sm"
            : "text-zinc-500 bg-amber-50/80 border border-amber-200/60 hover:text-rose-400 hover:bg-amber-50/95 hover:border-amber-300/80"
        }
        ${className}`}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-all duration-150 ease-out ${
          active ? "scale-100" : "group-hover:scale-110"
        }`}
        style={{ transformOrigin: "center" }}
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  );
}

export default WishlistButton;
