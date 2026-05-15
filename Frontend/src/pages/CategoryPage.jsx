import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { getCategories } from "../services/categoryService";
import ProductSection from "../components/ProductSection";
import CategoryNode from "../components/CategoryNode";
import AuthUserBadge from "../components/AuthUserBadge";
import CartButton from "../components/CartButton";
import CartDrawer from "../components/CartDrawer";
import WishlistIconHeader from "../components/WishlistIconHeader";
import { getAuthSession } from "../services/sessionService";

// ── Helpers ──────────────────────────────────────────────

function buildTree(flatList) {
  const map = new Map();
  const roots = [];

  for (const cat of flatList) {
    map.set(cat.id, { ...cat, children: [] });
  }

  for (const cat of map.values()) {
    if (cat.parentId != null && map.has(cat.parentId)) {
      map.get(cat.parentId).children.push(cat);
    } else {
      roots.push(cat);
    }
  }

  return roots;
}

// ── Sidebar drawer motion ────────────────────────────────

const sidebarMotion = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    x: "-100%",
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const overlayMotion = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// ── Component ────────────────────────────────────────────

function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subcategoryId = searchParams.get("subcategoryId");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const session = getAuthSession();

  // ── Load categories ──────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const items = await getCategories();
        if (!cancelled) setCategories(items);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Không thể tải danh mục");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Build tree ───────────────────────────────────────

  const categoryTree = useMemo(() => buildTree(categories), [categories]);

  // Find current category
  const currentCategory = useMemo(() => {
    if (!slug) return null;
    return categories.find((cat) => cat.slug === slug) || null;
  }, [categories, slug]);

  // Determine effective category ID for filtering products
  const effectiveCategoryId = useMemo(() => {
    if (subcategoryId) return subcategoryId;
    if (currentCategory) return String(currentCategory.id);
    return null;
  }, [subcategoryId, currentCategory]);

  // Auto-expand path to current category
  useEffect(() => {
    if (!currentCategory) return;
    const path = [];
    let current = currentCategory;
    while (current && current.parentId != null) {
      const parent = categories.find((c) => c.id === current.parentId);
      if (parent) {
        path.push(parent.id);
        current = parent;
      } else {
        break;
      }
    }
    if (path.length > 0) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        path.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [currentCategory, categories]);

  // ── Toggle / Select ──────────────────────────────────

  const handleToggle = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (cat) => {
      navigate(`/categories/${cat.slug || cat.id}`);
      setSidebarOpen(false);
    },
    [navigate],
  );

  // ── Build node data for CategoryNode ─────────────────

  const buildNodeData = useCallback(
    (cat, parentSelected) => {
      const isSelected =
        effectiveCategoryId != null && String(cat.id) === effectiveCategoryId;
      const children = (cat.children || []).filter((c) => c.isActive !== false);
      return {
        category: cat,
        isSelected: isSelected || parentSelected,
        isExpanded: expandedIds.has(cat.id),
        children: children.map((child) => buildNodeData(child, isSelected)),
      };
    },
    [effectiveCategoryId, expandedIds],
  );

  const rootNodes = useMemo(
    () =>
      categoryTree
        .filter((c) => c.isActive !== false)
        .map((cat) => buildNodeData(cat, false)),
    [categoryTree, buildNodeData],
  );

  // ── Sidebar content ──────────────────────────────────

  const sidebarContent = (
    <>
      {/* Breadcrumb shortcut */}
      <nav className="px-4 pt-4 pb-3 border-b border-zinc-100">
        <Link
          to="/products"
          className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          ← Tất cả sản phẩm
        </Link>
      </nav>

      {/* Category tree */}
      <div className="flex-1 overflow-y-auto px-1 py-3">
        {rootNodes.length === 0 ? (
          <p className="px-4 text-xs text-zinc-500">Chưa có danh mục</p>
        ) : (
          rootNodes.map((node) => (
            <CategoryNode
              key={node.category.id}
              category={node.category}
              isSelected={node.isSelected}
              isExpanded={node.isExpanded}
              onToggle={handleToggle}
              onSelect={handleSelect}
              children={node.children}
            />
          ))
        )}
      </div>
    </>
  );

  // ── Loading ──────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)]">
        <HeaderSimple />
        <main className="mx-auto max-w-7xl px-6 pb-20">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
            Đang tải danh mục...
          </div>
        </main>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)]">
        <HeaderSimple />
        <main className="mx-auto max-w-7xl px-6 pb-20">
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
          >
            Không thể tải danh mục: {error}
          </div>
        </main>
      </div>
    );
  }

  // ── Category not found (with slug) ───────────────────

  if (slug && !currentCategory) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)]">
        <HeaderSimple />
        <main className="mx-auto max-w-7xl px-6 pb-20">
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-zinc-900">
              Không tìm thấy danh mục
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              Danh mục <span className="font-semibold">"{slug}"</span> không tồn
              tại hoặc đã bị ẩn.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block rounded-full bg-zinc-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700 transition-colors"
            >
              Về trang sản phẩm
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── Main dual-panel layout ───────────────────────────

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)]">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-4">
          {/* Mobile sidebar toggle */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 -ml-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Mở danh mục"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          <div>
            <Link
              to="/"
              className="text-xl font-semibold tracking-tight text-zinc-900"
            >
              SplitGo
            </Link>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Danh mục
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {session?.token && (
            <>
              <WishlistIconHeader />
              <Link
                to="/orders"
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
              >
                Đơn hàng
              </Link>
              <CartButton />
            </>
          )}
          <AuthUserBadge />
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              variants={overlayMotion}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-zinc-900/30 md:hidden"
            />

            {/* Drawer */}
            <motion.aside
              variants={sidebarMotion}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100">
                <span className="text-sm font-semibold text-zinc-900">
                  Danh mục
                </span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  aria-label="Đóng"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop: dual panels */}
      <div className="mx-auto flex max-w-7xl px-6 pb-20 gap-0">
        {/* Left panel — desktop sidebar */}
        <aside
          className="hidden md:flex md:flex-col md:w-56 lg:w-60 xl:w-64 flex-shrink-0 rounded-2xl border border-zinc-200 bg-white mr-6 overflow-hidden"
          style={{
            height: "fit-content",
            maxHeight: "calc(100vh - 120px)",
            position: "sticky",
            top: "24px",
          }}
        >
          <div className="px-4 pt-4 pb-3">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Danh mục
            </span>
          </div>
          {sidebarContent}
        </aside>

        {/* Right panel — products */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-zinc-500 mb-6"
          >
            <Link to="/" className="hover:text-zinc-900 transition-colors">
              Trang chủ
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              to="/products"
              className="hover:text-zinc-900 transition-colors"
            >
              Sản phẩm
            </Link>
            {currentCategory && (
              <>
                <span aria-hidden="true">/</span>
                <span className="font-semibold text-zinc-900">
                  {currentCategory.name}
                </span>
              </>
            )}
          </nav>

          {/* Category info header */}
          {currentCategory && (
            <section className="mb-8 space-y-4">
              {currentCategory.imageUrl && (
                <div className="overflow-hidden rounded-2xl bg-zinc-100">
                  <img
                    src={currentCategory.imageUrl}
                    alt={currentCategory.name}
                    className="h-40 md:h-56 w-full object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {currentCategory.name}
                </h1>
                {currentCategory.description && (
                  <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-zinc-600">
                    {currentCategory.description}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Products */}
          {effectiveCategoryId ? (
            <ProductSection
              key={effectiveCategoryId}
              preselectedCategory={effectiveCategoryId}
              compact
            />
          ) : (
            <ProductSection compact />
          )}
        </main>
      </div>

      <CartDrawer />
    </div>
  );
}

// ── Simple header for loading/error states ─────────────

function HeaderSimple() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8">
      <Link
        to="/products"
        className="text-xl font-semibold tracking-tight text-zinc-900"
      >
        SplitGo
      </Link>
    </header>
  );
}

export default CategoryPage;
