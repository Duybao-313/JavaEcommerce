
function ConfirmationModal({
  open,
  title,
  message,
  confirmText = "Xac nhan",
  cancelText = "Huy",
  danger = false,
  loading = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg">
        <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
        <p className="mt-2 text-sm text-zinc-600">{message}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              danger ? "bg-red-600" : "bg-zinc-900"
            }`}
          >
            {loading ? "Dang xu ly..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;

