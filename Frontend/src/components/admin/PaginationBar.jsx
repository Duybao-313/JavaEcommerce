
function PaginationBar({ page, pageSize, totalItems, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div className="mt-4 flex items-center justify-between gap-2 text-sm text-zinc-600">
      <p>
        Trang {page} / {totalPages} ({totalItems} ban ghi)
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 disabled:opacity-50"
        >
          Truoc
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
}

export default PaginationBar;

