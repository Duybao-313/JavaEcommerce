import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthSession } from "../services/sessionService";
import { getWishlist } from "../services/wishlistService";

// Inline SVG Heart icon
function HeartIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

/**
 * WishlistIconHeader — Heart icon + badge count in the header.
 * Click navigates to /wishlist.
 */
function WishlistIconHeader({ className = "" }) {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  const session = getAuthSession();
  const canUseWishlist = Boolean(session?.token);

  const fetchCount = useCallback(async () => {
    if (!canUseWishlist) {
      setCount(0);
      return;
    }
    try {
      const items = await getWishlist();
      setCount(Array.isArray(items) ? items.length : 0);
    } catch {
      setCount(0);
    }
  }, [canUseWishlist]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // Re-fetch on focus (in case user toggled in another tab)
  useEffect(() => {
    const onFocus = () => fetchCount();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchCount]);

  if (!canUseWishlist) return null;

  return (
    <button
      type="button"
      onClick={() => navigate("/wishlist")}
      aria-label={
        count > 0
          ? `Danh sách yêu thích, ${count} sản phẩm`
          : "Danh sách yêu thích, trống"
      }
      className={`relative inline-flex items-center justify-center rounded-full transition-colors
        hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500
        ${className}`}
      style={{ width: 44, height: 44 }}
    >
      <HeartIcon
        size={22}
        className="text-zinc-700 transition-colors hover:text-rose-500"
      />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

export default WishlistIconHeader;
