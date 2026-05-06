
function LoadingSpinner() {
  return (
    <div className="flex h-32 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
    </div>
  );
}

export default LoadingSpinner;

