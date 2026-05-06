import { describe, it, expect } from "vitest";
import {
  UI_STATUS,
  STATUS_GROUPS,
  mapOrderToUiStatus,
  isOrderCancellable,
} from "../services/orderService";

// =============================================
// Status mapping tests (AC1, AC4)
// =============================================

describe("mapOrderToUiStatus", () => {
  it("maps PENDING → Chờ xác nhận", () => {
    expect(mapOrderToUiStatus("PENDING")).toBe(UI_STATUS.PENDING_CONFIRMATION);
  });

  it("maps CONFIRMED → Chờ xác nhận", () => {
    expect(mapOrderToUiStatus("CONFIRMED")).toBe(
      UI_STATUS.PENDING_CONFIRMATION,
    );
  });

  it("maps PREPARING → Đang giao", () => {
    expect(mapOrderToUiStatus("PREPARING")).toBe(UI_STATUS.SHIPPING);
  });

  it("maps SHIPPING → Đang giao", () => {
    expect(mapOrderToUiStatus("SHIPPING")).toBe(UI_STATUS.SHIPPING);
  });

  it("maps DELIVERED → Giao hàng thành công", () => {
    expect(mapOrderToUiStatus("DELIVERED")).toBe(UI_STATUS.DELIVERED);
  });

  it("maps CANCELLED → Đã hủy", () => {
    expect(mapOrderToUiStatus("CANCELLED")).toBe(UI_STATUS.CANCELLED);
  });

  it("maps unknown status → Chờ xác nhận (safe default)", () => {
    expect(mapOrderToUiStatus("UNKNOWN_STATE")).toBe(
      UI_STATUS.PENDING_CONFIRMATION,
    );
  });

  it("maps lowercase status correctly", () => {
    expect(mapOrderToUiStatus("pending")).toBe(UI_STATUS.PENDING_CONFIRMATION);
    expect(mapOrderToUiStatus("delivered")).toBe(UI_STATUS.DELIVERED);
    expect(mapOrderToUiStatus("cancelled")).toBe(UI_STATUS.CANCELLED);
  });

  it("maps null/undefined → Chờ xác nhận", () => {
    expect(mapOrderToUiStatus(null)).toBe(UI_STATUS.PENDING_CONFIRMATION);
    expect(mapOrderToUiStatus(undefined)).toBe(UI_STATUS.PENDING_CONFIRMATION);
  });
});

// =============================================
// Cancellation eligibility tests (AC4)
// =============================================

describe("isOrderCancellable", () => {
  it("allows cancel for PENDING", () => {
    expect(isOrderCancellable("PENDING")).toBe(true);
  });

  it("allows cancel for CONFIRMED", () => {
    expect(isOrderCancellable("CONFIRMED")).toBe(true);
  });

  it("allows cancel for PREPARING", () => {
    expect(isOrderCancellable("PREPARING")).toBe(true);
  });

  it("disallows cancel for SHIPPING", () => {
    expect(isOrderCancellable("SHIPPING")).toBe(false);
  });

  it("disallows cancel for DELIVERED", () => {
    expect(isOrderCancellable("DELIVERED")).toBe(false);
  });

  it("disallows cancel for CANCELLED", () => {
    expect(isOrderCancellable("CANCELLED")).toBe(false);
  });

  it("disallows cancel for unknown status", () => {
    expect(isOrderCancellable("UNKNOWN")).toBe(false);
  });
});

// =============================================
// STATUS_GROUPS integrity (AC1)
// =============================================

describe("STATUS_GROUPS", () => {
  it("has exactly 4 UI statuses", () => {
    expect(Object.keys(STATUS_GROUPS)).toHaveLength(4);
  });

  it("PENDING_CONFIRMATION group contains PENDING and CONFIRMED", () => {
    expect(STATUS_GROUPS[UI_STATUS.PENDING_CONFIRMATION]).toEqual([
      "PENDING",
      "CONFIRMED",
    ]);
  });

  it("SHIPPING group contains PREPARING and SHIPPING", () => {
    expect(STATUS_GROUPS[UI_STATUS.SHIPPING]).toEqual([
      "PREPARING",
      "SHIPPING",
    ]);
  });

  it("DELIVERED group contains only DELIVERED", () => {
    expect(STATUS_GROUPS[UI_STATUS.DELIVERED]).toEqual(["DELIVERED"]);
  });

  it("CANCELLED group contains only CANCELLED", () => {
    expect(STATUS_GROUPS[UI_STATUS.CANCELLED]).toEqual(["CANCELLED"]);
  });

  it("all groups together cover all 6 backend statuses", () => {
    const allStatuses = Object.values(STATUS_GROUPS).flat();
    const uniqueStatuses = [...new Set(allStatuses)].sort();
    expect(uniqueStatuses).toEqual([
      "CANCELLED",
      "CONFIRMED",
      "DELIVERED",
      "PENDING",
      "PREPARING",
      "SHIPPING",
    ]);
  });
});
