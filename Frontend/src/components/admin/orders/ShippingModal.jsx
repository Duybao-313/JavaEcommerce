import React, { useEffect, useState } from "react";
import { CARRIERS } from "../../../constants/orderStatus";

export default function ShippingModal({
  open,
  onClose,
  onSubmit,
  loading,
  initial = null, // existing shipping for update
  orderId,
}) {
  const [carrier, setCarrier] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  useEffect(() => {
    if (open) {
      setCarrier(initial?.carrier || "GHN");
      setTrackingCode(initial?.trackingCode || "");
      setEstimatedDelivery(
        initial?.estimatedDelivery
          ? new Date(initial.estimatedDelivery).toISOString().slice(0, 16)
          : "",
      );
    }
  }, [open, initial]);

  if (!open) return null;

  const isUpdate = !!initial;
  const title = isUpdate ? "Cập nhật vận đơn" : "Tạo vận đơn mới";

  const handleSubmit = (e) => {
    e.preventDefault();
    const body = {
      orderId: orderId || initial?.orderId,
      carrier,
      trackingCode: trackingCode.trim() || undefined,
      estimatedDelivery: estimatedDelivery
        ? new Date(estimatedDelivery).toISOString()
        : undefined,
    };
    if (isUpdate) {
      onSubmit(initial.id, body);
    } else {
      onSubmit(body);
    }
  };

  return (
    <div
      className="orders-drawer-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="orders-drawer"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          width: "min(420px, 90vw)",
          maxHeight: "90vh",
          transform: "translate(-50%, -50%)",
          borderRadius: "0.875rem",
          boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
          animation: "none",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="orders-drawer-header">
          <h2>{title}</h2>
          <button
            className="orders-drawer-close"
            onClick={onClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="orders-drawer-body">
            {/* Carrier */}
            <div>
              <label
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "#a1a1aa",
                  marginBottom: "0.375rem",
                  display: "block",
                }}
              >
                Đơn vị vận chuyển
              </label>
              <select
                className="orders-select"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                style={{ width: "100%" }}
                required
              >
                {CARRIERS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tracking code */}
            <div>
              <label
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "#a1a1aa",
                  marginBottom: "0.375rem",
                  display: "block",
                }}
              >
                Mã vận đơn
              </label>
              <input
                type="text"
                className="orders-search-input"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="VD: GHN123456789"
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>

            {/* Estimated delivery */}
            <div>
              <label
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "#a1a1aa",
                  marginBottom: "0.375rem",
                  display: "block",
                }}
              >
                Ngày giao dự kiến
              </label>
              <input
                type="datetime-local"
                className="orders-search-input"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div className="orders-drawer-footer">
            <button
              type="button"
              className="orders-btn"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="orders-btn orders-btn--primary"
              disabled={loading}
              style={{ marginLeft: "auto" }}
            >
              {loading
                ? "Đang xử lý..."
                : isUpdate
                  ? "Cập nhật"
                  : "Tạo vận đơn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
