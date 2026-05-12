import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { uploadImage } from "../../services/uploadService";

function StoreInfoForm({ initialData, onSave, saving, isOwner = false }) {
  const [form, setForm] = useState({
    storeName: "",
    storeAddress: "",
    bankName: "",
    bankAccount: "",
  });
  const [dirty, setDirty] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        storeName: initialData.storeName || "",
        storeAddress: initialData.storeAddress || "",
        bankName: initialData.bankName || "",
        bankAccount: initialData.bankAccount || "",
      });
      setDirty(false);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {};
    if (form.storeName.trim()) payload.storeName = form.storeName.trim();
    if (form.storeAddress.trim())
      payload.storeAddress = form.storeAddress.trim();
    if (form.bankName.trim()) payload.bankName = form.bankName.trim();
    if (form.bankAccount.trim()) payload.bankAccount = form.bankAccount.trim();

    if (Object.keys(payload).length === 0) {
      toast.error("Không có thông tin nào để cập nhật");
      return;
    }

    await onSave(payload);
    setDirty(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        await onSave({ storeLogo: imageUrl });
      }
    } catch (err) {
      toast.error(err?.message || "Không thể tải lên logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        await onSave({ storeBanner: imageUrl });
      }
    } catch (err) {
      toast.error(err?.message || "Không thể tải lên banner");
    } finally {
      setUploadingBanner(false);
    }
  };

  if (!isOwner) return null;

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900">
        Thông tin cửa hàng
      </h3>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-zinc-700">
            Tên cửa hàng
            <input
              name="storeName"
              value={form.storeName}
              onChange={handleChange}
              placeholder="VD: Duy's Store"
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
              maxLength={255}
            />
          </label>
          <label className="text-sm text-zinc-700">
            Địa chỉ cửa hàng
            <input
              name="storeAddress"
              value={form.storeAddress}
              onChange={handleChange}
              placeholder="VD: Q1, TP.HCM"
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
              maxLength={500}
            />
          </label>
        </div>

        {/* Logo Upload */}
        <div>
          <p className="text-sm font-medium text-zinc-700">Logo cửa hàng</p>
          <label className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700 hover:border-zinc-900 transition-colors">
            {uploadingLogo ? "Đang tải lên..." : "Tải logo"}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="hidden"
            />
          </label>
        </div>

        {/* Banner Upload */}
        <div>
          <p className="text-sm font-medium text-zinc-700">Banner cửa hàng</p>
          <label className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700 hover:border-zinc-900 transition-colors">
            {uploadingBanner ? "Đang tải lên..." : "Tải banner"}
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              disabled={uploadingBanner}
              className="hidden"
            />
          </label>
        </div>

        {/* Banking Info */}
        <div className="border-t border-zinc-200 pt-4">
          <p className="text-sm font-medium text-zinc-700">
            Thông tin ngân hàng
          </p>
          <div className="mt-2 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-zinc-700">
              Tên ngân hàng
              <input
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                placeholder="VD: Vietcombank"
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                maxLength={255}
              />
            </label>
            <label className="text-sm text-zinc-700">
              Số tài khoản
              <input
                name="bankAccount"
                value={form.bankAccount}
                onChange={handleChange}
                placeholder="Nhập số tài khoản"
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                maxLength={255}
              />
            </label>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !dirty}
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400 transition-colors"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          {dirty && (
            <span className="text-xs text-amber-600">Có thay đổi chưa lưu</span>
          )}
        </div>
      </form>
    </section>
  );
}

export default StoreInfoForm;
