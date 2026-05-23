import React from "react";
import {
  ALLOWED_TRANSITIONS,
  DANGEROUS_TRANSITIONS,
  STATUS_LABEL,
} from "../../../constants/orderStatus";

export default function OrderActions({ order, onStatusChange, saving }) {
  const nextStatuses = ALLOWED_TRANSITIONS[order.status] || [];

  if (nextStatuses.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
      {nextStatuses.map((status) => {
        const isDanger = DANGEROUS_TRANSITIONS.includes(status);
        return (
          <button
            key={status}
            className={`orders-btn orders-btn--sm${
              isDanger ? " orders-btn--danger" : ""
            }`}
            onClick={() => onStatusChange(order, status)}
            disabled={saving}
          >
            {isDanger ? "⚠ " : ""}
            Chuyển sang "{STATUS_LABEL[status]}"
          </button>
        );
      })}
    </div>
  );
}
