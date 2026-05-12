import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function CartDrawer() {
  const navigate = useNavigate();
  const {
    canUseCart,
    isOpen,
    closeCart,
    items,
    loading,
    selectedItemIds,
    selectedTotal,
    setItemSelected,
    selectAllItems,
    clearSelectedItems,
    changeItemQuantity,
    removeItem,
  } = useCart();

  if (!canUseCart) return null;

  const hasItems = items.length > 0;

  const handleCheckout = () => {
    if (!hasItems) return;
    navigate("/checkout", {
      state: {
        selectedIds: selectedItemIds,
      },
    });
    closeCart();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">Giỏ hàng</h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 hover:border-zinc-900"
          >
            Đóng
          </button>
        </header>

        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 text-xs">
          <button
            type="button"
            onClick={selectAllItems}
            className="font-semibold uppercase tracking-[0.14em] text-zinc-700 hover:text-zinc-900"
          >
            Chọn tất cả
          </button>
          <button
            type="button"
            onClick={clearSelectedItems}
            className="font-semibold uppercase tracking-[0.14em] text-zinc-500 hover:text-zinc-900"
          >
            Bỏ chọn
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <p className="text-sm text-zinc-600">Đang tải giỏ hàng...</p>
          )}

          {!loading && !hasItems && (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              Chưa có sản phẩm trong giỏ hàng.
            </div>
          )}

          {!loading && hasItems && (
            <div className="space-y-4">
              {items.map((item) => {
                const selected =
                  selectedItemIds.length === 0 ||
                  selectedItemIds.includes(item.cartItemId);

                return (
                  <article
                    key={item.cartItemId}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(event) =>
                          setItemSelected(item.cartItemId, event.target.checked)
                        }
                        className="mt-1 h-4 w-4 accent-zinc-900"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-zinc-900">
                          {item.productName}
                        </p>
                        {item.variantAttributes?.size && (
                          <span className="mt-1 inline-block rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-xs font-medium text-zinc-600">
                            Size: {item.variantAttributes.size}
                          </span>
                        )}
                        <p className="mt-1 text-xs text-zinc-600">
                          {formatPrice(item.unitPrice)} / sản phẩm
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-900">
                          {formatPrice(item.lineTotal)}
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              changeItemQuantity(
                                item.cartItemId,
                                Number(item.quantity || 1) - 1,
                              )
                            }
                            disabled={Number(item.quantity || 1) <= 1}
                            className="h-8 w-8 rounded-full border border-zinc-300 text-sm font-semibold text-zinc-900 hover:border-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold text-zinc-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              changeItemQuantity(
                                item.cartItemId,
                                Number(item.quantity || 1) + 1,
                              )
                            }
                            className="h-8 w-8 rounded-full border border-zinc-300 text-sm font-semibold text-zinc-900 hover:border-zinc-900"
                          >
                            +
                          </button>

                          <button
                            type="button"
                            onClick={() => removeItem(item.cartItemId)}
                            className="ml-auto rounded-full border border-red-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-red-700 hover:border-red-500"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <footer className="border-t border-zinc-200 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600">Tổng tiền đã chọn</span>
            <span className="text-lg font-semibold text-zinc-900">
              {formatPrice(selectedTotal)}
            </span>
          </div>
          <button
            type="button"
            disabled={!hasItems}
            onClick={handleCheckout}
            className="mt-4 w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            Thanh toán
          </button>
        </footer>
      </aside>
    </>
  );
}

export default CartDrawer;
