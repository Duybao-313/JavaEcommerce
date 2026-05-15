import React from "react";
import { motion } from "motion/react";

const skeletonVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const itemMotion = {
  rest: { y: 0 },
  hover: {
    y: -2,
    transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  tap: { scale: 0.97, transition: { duration: 0.1 } },
};

function CategoryButton({ cat, isSelected, onSelect }) {
  return (
    <motion.button
      onClick={() => onSelect(cat)}
      type="button"
      aria-pressed={isSelected}
      variants={itemMotion}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className={`relative flex flex-col items-center gap-2 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 ${
        isSelected
          ? "bg-amber-50 ring-1 ring-amber-200"
          : "bg-white hover:bg-zinc-50"
      }`}
    >
      <div className="relative h-12 w-12 flex items-center justify-center rounded-full bg-zinc-100 overflow-hidden">
        {cat.imageUrl ? (
          <img
            src={cat.imageUrl}
            alt={cat.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xl select-none" aria-hidden="true">
            📦
          </span>
        )}
      </div>

      <span className="text-[11px] font-semibold leading-tight text-zinc-900 truncate w-full text-center max-w-[80px]">
        {cat.name}
      </span>

      {isSelected && (
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-amber-400" />
      )}
    </motion.button>
  );
}

const SkeletonItem = () => (
  <div className="flex flex-col items-center gap-2 p-2.5">
    <div className="h-12 w-12 rounded-full bg-zinc-100 animate-pulse" />
    <div className="mt-1 h-3 w-12 rounded bg-zinc-100 animate-pulse" />
  </div>
);

export default function CategoriesStrip({
  categories = [],
  selectedId,
  onSelect,
  loading = false,
  error = "",
}) {
  // --- Loading skeleton ---
  if (loading) {
    return (
      <motion.nav
        aria-label="Danh mục sản phẩm"
        aria-busy="true"
        variants={skeletonVariants}
        initial="hidden"
        animate="visible"
        className="mt-4"
      >
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          {/* Desktop: 3-row grid skeleton */}
          <div className="hidden md:grid grid-rows-3 grid-flow-col gap-3 justify-start">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonItem key={i} />
            ))}
          </div>
          {/* Mobile: 2-row grid skeleton */}
          <div className="hidden sm:grid md:hidden grid-rows-2 grid-flow-col gap-3 justify-start">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonItem key={i} />
            ))}
          </div>
          {/* Small mobile: scroll skeleton */}
          <div className="sm:hidden flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <SkeletonItem />
              </div>
            ))}
          </div>
        </div>
      </motion.nav>
    );
  }

  // --- Error banner ---
  if (error) {
    return (
      <div
        role="alert"
        className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
      >
        Không thể tải danh mục: {error}
      </div>
    );
  }

  // --- Empty: hide completely ---
  if (!categories || categories.length === 0) {
    return null;
  }

  const activeCategories = categories.filter((cat) => cat.isActive !== false);

  if (activeCategories.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Danh mục sản phẩm" className="mt-4">
      {/* Bordered frame */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        {/* Title inside frame */}
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Danh mục
        </p>

        {/* Desktop: 3 rows, auto-flow columns */}
        <div
          className="hidden md:grid grid-rows-3 grid-flow-col gap-3 justify-start"
          role="list"
        >
          {activeCategories.map((cat) => (
            <CategoryButton
              key={cat.id}
              cat={cat}
              isSelected={String(selectedId) === String(cat.id)}
              onSelect={onSelect}
            />
          ))}
        </div>

        {/* Tablet: 2 rows, auto-flow columns */}
        <div
          className="hidden sm:grid md:hidden grid-rows-2 grid-flow-col gap-3 justify-start"
          role="list"
        >
          {activeCategories.map((cat) => (
            <CategoryButton
              key={cat.id}
              cat={cat}
              isSelected={String(selectedId) === String(cat.id)}
              onSelect={onSelect}
            />
          ))}
        </div>

        {/* Small mobile: horizontal scroll */}
        <div
          className="sm:hidden flex gap-2.5 overflow-x-auto scrollbar-none"
          role="list"
        >
          {activeCategories.map((cat) => (
            <div key={cat.id} className="flex-shrink-0">
              <CategoryButton
                cat={cat}
                isSelected={String(selectedId) === String(cat.id)}
                onSelect={onSelect}
              />
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
