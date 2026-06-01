import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { addToCart } from "../services/cartService";
import {
  getProducts,
  getProductsByCategory,
  exportProductsCsv,
  importProductsCsv,
} from "../services/productService";
import { getCategories } from "../services/categoryService";
import { getAuthSession, isSellerSession } from "../services/sessionService";
import WishlistButton from "./WishlistButton";
import CategoriesStrip from "./CategoriesStrip";
import SearchFilterBar from "./SearchFilterBar";
import FilterPanel from "./FilterPanel";

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

/** Get the effective display price: salePrice if available, else base price */
function getEffectivePrice(product) {
  const sale = product?.salePrice;
  if (
    sale != null &&
    Number(sale) > 0 &&
    Number(sale) < Number(product?.price || 0)
  ) {
    return Number(sale);
  }
  return Number(product?.price || 0);
}

/** Check if product has a valid sale price lower than base price */
function hasSalePrice(product) {
  const sale = product?.salePrice;
  const base = product?.price;
  return (
    sale != null &&
    Number(sale) > 0 &&
    Number(base) > 0 &&
    Number(sale) < Number(base)
  );
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function ProductSection({ preselectedCategory, compact = false } = {}) {
  const navigate = useNavigate();
  const { refreshCart, openCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceSort, setPriceSort] = useState("default");
  const [ratingFilter, setRatingFilter] = useState(0); // 0 = all, 1-5 = min rating
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [topSellingIndex, setTopSellingIndex] = useState(0);
  const [topViewedIndex, setTopViewedIndex] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;
  const FETCH_ALL_SIZE = 500;

  const session = getAuthSession();
  const sellerMode = isSellerSession(session);

  // Debounce search for backend calls
  const searchTimerRef = useRef(null);
  const [backendSearch, setBackendSearch] = useState("");

  // Sync preselected category from parent (e.g. CategoryPage)
  // When preselectedCategory is set, server-side filtering is already active
  // (fetches products by category + all descendants). Keep selectedCategory
  // as "all" to avoid double-filtering on the client side.
  useEffect(() => {
    if (preselectedCategory != null && preselectedCategory !== "all") {
      setSelectedCategory("all");
    }
  }, [preselectedCategory]);

  const topSellingProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(b?.soldCount || 0) - Number(a?.soldCount || 0))
      .slice(0, 5);
  }, [products]);

  const topViewedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(b?.viewCount || 0) - Number(a?.viewCount || 0))
      .slice(0, 5);
  }, [products]);

  useEffect(() => {
    if (topSellingProducts.length <= 1) {
      setTopSellingIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setTopSellingIndex((prev) => (prev + 1) % topSellingProducts.length);
    }, 3000);

    return () => {
      clearInterval(timer);
    };
  }, [topSellingProducts]);

  useEffect(() => {
    if (topViewedProducts.length <= 1) {
      setTopViewedIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setTopViewedIndex((prev) => (prev + 1) % topViewedProducts.length);
    }, 3000);

    return () => {
      clearInterval(timer);
    };
  }, [topViewedProducts]);

  // Determine if any client-side filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      (searchTerm && searchTerm.trim().length > 0) ||
      (selectedCategory && selectedCategory !== "all") ||
      (stockFilter && stockFilter !== "all") ||
      (minPrice && Number(minPrice) > 0) ||
      (maxPrice && Number(maxPrice) > 0) ||
      (ratingFilter && ratingFilter > 0)
    );
  }, [
    searchTerm,
    selectedCategory,
    stockFilter,
    minPrice,
    maxPrice,
    ratingFilter,
  ]);

  // Reset to page 0 whenever filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [
    searchTerm,
    selectedCategory,
    stockFilter,
    minPrice,
    maxPrice,
    ratingFilter,
  ]);

  // Debounce search to backend
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setBackendSearch(searchTerm?.trim() || "");
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const hasPreselected =
          preselectedCategory != null && preselectedCategory !== "all";
        const useBackendSearch = backendSearch && backendSearch.length > 0;

        let pageData;
        if (useBackendSearch) {
          // Use backend full-text search
          pageData = await getProducts(currentPage, pageSize, backendSearch);
        } else if (hasActiveFilters) {
          // Fetch all products at once for client-side filtering
          if (hasPreselected) {
            pageData = await getProductsByCategory(
              preselectedCategory,
              0,
              FETCH_ALL_SIZE,
            );
          } else {
            pageData = await getProducts(0, FETCH_ALL_SIZE);
          }
        } else {
          // Normal server-side pagination
          if (hasPreselected) {
            pageData = await getProductsByCategory(
              preselectedCategory,
              currentPage,
              pageSize,
            );
          } else {
            pageData = await getProducts(currentPage, pageSize);
          }
        }

        if (!cancelled) {
          setProducts(pageData?.content || []);
          if (hasActiveFilters || useBackendSearch) {
            // For client-side filtering or backend search, total comes from filtered results
            setTotalElements(pageData?.totalElements || 0);
            setTotalPages(1);
          } else {
            setTotalPages(pageData?.totalPages || 0);
            setTotalElements(pageData?.totalElements || 0);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Đã có lỗi khi tải sản phẩm");
          setProducts([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [preselectedCategory, currentPage, hasActiveFilters, backendSearch]);

  // Shared sort helper
  function applySort(arr, sort) {
    if (sort === "asc" || sort === "priceAsc") {
      arr.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    } else if (sort === "desc" || sort === "priceDesc") {
      arr.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    } else if (sort === "soldDesc") {
      arr.sort((a, b) => Number(b?.soldCount || 0) - Number(a?.soldCount || 0));
    } else if (sort === "newest") {
      arr.sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setLoadingCategories(true);
      setCategoriesError("");

      try {
        const items = await getCategories();
        if (!cancelled) {
          setCategories(items);
        }
      } catch (err) {
        if (!cancelled) {
          setCategories([]);
          setCategoriesError(err?.message || "Đã có lỗi khi tải danh mục");
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    // If using backend search, skip client-side filtering
    if (backendSearch && backendSearch.length > 0) {
      let result = [...products];
      // Still apply client-side filters on top of backend search results
      if (selectedCategory !== "all") {
        result = result.filter(
          (p) =>
            String(p?.category?.id || p?.categoryId || "") === selectedCategory,
        );
      }
      if (stockFilter !== "all") {
        result = result.filter((p) => {
          const stock = Number(p?.stock || 0);
          if (stockFilter === "inStock") return stock > 0;
          if (stockFilter === "outOfStock") return stock <= 0;
          if (stockFilter === "lowStock") return stock > 0 && stock <= 10;
          return true;
        });
      }
      const min = Number(minPrice);
      const max = Number(maxPrice);
      if (Number.isFinite(min) && min > 0) {
        result = result.filter((p) => getEffectivePrice(p) >= min);
      }
      if (Number.isFinite(max) && max > 0) {
        result = result.filter((p) => getEffectivePrice(p) <= max);
      }
      if (ratingFilter > 0) {
        result = result.filter(
          (p) => (Number(p?.avgRating) || 0) >= ratingFilter,
        );
      }
      // Sort
      applySort(result, priceSort);
      return result;
    }

    const keyword = normalizeText(searchTerm);
    const min = Number(minPrice);
    const max = Number(maxPrice);
    const hasMin = Number.isFinite(min) && min > 0;
    const hasMax = Number.isFinite(max) && max > 0;

    const result = products.filter((product) => {
      const productName = normalizeText(product?.name);
      const matchName = !keyword || productName.includes(keyword);

      const categoryId = String(
        product?.category?.id || product?.categoryId || "",
      );
      const matchCategory =
        selectedCategory === "all" || categoryId === selectedCategory;

      const stock = Number(product?.stock || 0);
      const matchStock =
        stockFilter === "all" ||
        (stockFilter === "inStock" && stock > 0) ||
        (stockFilter === "outOfStock" && stock <= 0) ||
        (stockFilter === "lowStock" && stock > 0 && stock <= 10);

      const effectivePrice = getEffectivePrice(product);
      const matchMinPrice = !hasMin || effectivePrice >= min;
      const matchMaxPrice = !hasMax || effectivePrice <= max;

      const matchRating =
        ratingFilter <= 0 || (Number(product?.avgRating) || 0) >= ratingFilter;

      return (
        matchName &&
        matchCategory &&
        matchStock &&
        matchMinPrice &&
        matchMaxPrice &&
        matchRating
      );
    });

    // Sort
    applySort(result, priceSort);

    return result;
  }, [
    products,
    searchTerm,
    backendSearch,
    selectedCategory,
    stockFilter,
    minPrice,
    maxPrice,
    ratingFilter,
    priceSort,
  ]);

  // Client-side pagination when filters are active
  const pagedProducts = useMemo(() => {
    if (!hasActiveFilters) return filteredProducts;
    const start = currentPage * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize, hasActiveFilters]);

  // Compute total pages for client-side filtered results
  const computedTotalPages = useMemo(() => {
    if (!hasActiveFilters) return totalPages;
    return Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  }, [hasActiveFilters, totalPages, filteredProducts.length, pageSize]);

  const computedTotalElements = useMemo(() => {
    if (!hasActiveFilters) return totalElements;
    return filteredProducts.length;
  }, [hasActiveFilters, totalElements, filteredProducts.length]);

  const handleAddToCart = async (event, product) => {
    event.stopPropagation();

    if (!session?.token) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate("/login");
      return;
    }

    // Nếu sản phẩm có variants (options như size, color...),
    // điều hướng đến trang chi tiết để user chọn phân loại trước khi thêm vào giỏ
    const hasVariants =
      Array.isArray(product?.variants) && product.variants.length > 0;
    if (hasVariants) {
      toast("Vui lòng chọn phân loại hàng trước khi thêm vào giỏ", {
        icon: "🔍",
      });
      navigate(`/products/${product.id}`);
      return;
    }

    if (Number(product?.stock || 0) <= 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    try {
      await addToCart(product.id, 1);
      await refreshCart();
      openCart();
      toast.success("Đã thêm sản phẩm vào giỏ hàng");
    } catch (error) {
      toast.error(error?.message || "Không thể thêm vào giỏ hàng");
    }
  };

  const handleExportCsv = async () => {
    try {
      const csv = await exportProductsCsv();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `products_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Đã xuất file CSV thành công");
    } catch (err) {
      toast.error(err?.message || "Không thể xuất CSV");
    }
  };

  const handleImportCsv = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const count = await importProductsCsv(text);
        toast.success(`Đã nhập ${count} sản phẩm từ CSV`);
        // Reload products
        setCurrentPage(0);
        const pageData = await getProducts(0, FETCH_ALL_SIZE);
        setProducts(pageData?.content || []);
      } catch (err) {
        toast.error(err?.message || "Không thể nhập CSV");
      }
    };
    input.click();
  };

  return (
    <section id="products" className={compact ? "" : "mt-14 space-y-10"}>
      {!compact &&
        !loading &&
        !error &&
        (topSellingProducts.length > 0 || topViewedProducts.length > 0) && (
          <section className="rounded-3xl border border-zinc-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Tổng quan
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
                  Top sản phẩm nổi bật
                </h2>
              </div>
              <p className="text-xs text-zinc-500">
                Tự động chuyển 3 giây mỗi sản phẩm
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {topSellingProducts.length > 0 && (
                <section className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      Top bán chạy
                    </p>
                    <p className="text-xs text-zinc-500">
                      5 sản phẩm bán nhiều nhất
                    </p>
                  </div>

                  <div className="overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.article
                        key={topSellingProducts[topSellingIndex]?.id}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        onClick={() =>
                          navigate(
                            `/products/${topSellingProducts[topSellingIndex]?.id}`,
                          )
                        }
                        className="relative mx-auto max-w-sm cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-3"
                      >
                        <span className="absolute right-2 top-2 rounded-full bg-zinc-900 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                          Top {topSellingIndex + 1}
                        </span>

                        <div className="h-28 overflow-hidden rounded-xl bg-zinc-100">
                          {topSellingProducts[topSellingIndex]?.imageUrl ? (
                            <img
                              src={topSellingProducts[topSellingIndex].imageUrl}
                              alt={topSellingProducts[topSellingIndex].name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs font-semibold text-zinc-500">
                              Chưa có ảnh
                            </div>
                          )}
                        </div>

                        <p className="mt-2 line-clamp-1 text-sm font-semibold text-zinc-900">
                          {topSellingProducts[topSellingIndex]?.name}
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          Đã bán:{" "}
                          <span className="font-semibold text-zinc-900">
                            {Number(
                              topSellingProducts[topSellingIndex]?.soldCount ||
                                0,
                            ).toLocaleString("vi-VN")}
                          </span>
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-900">
                          <span>
                            {formatPrice(
                              getEffectivePrice(
                                topSellingProducts[topSellingIndex],
                              ),
                            )}
                          </span>
                          {hasSalePrice(
                            topSellingProducts[topSellingIndex],
                          ) && (
                            <span className="ml-2 text-xs text-zinc-400 line-through">
                              {formatPrice(
                                topSellingProducts[topSellingIndex].price,
                              )}
                            </span>
                          )}
                        </p>
                      </motion.article>
                    </AnimatePresence>

                    <div className="mt-3 flex items-center justify-center gap-1.5">
                      {topSellingProducts.map((product, index) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => setTopSellingIndex(index)}
                          className={`h-2.5 w-2.5 rounded-full transition-colors ${
                            index === topSellingIndex
                              ? "bg-zinc-900"
                              : "bg-zinc-300 hover:bg-zinc-500"
                          }`}
                          aria-label={`Xem top bán chạy ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {topViewedProducts.length > 0 && (
                <section className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      Top lượt xem
                    </p>
                    <p className="text-xs text-zinc-500">
                      5 sản phẩm xem nhiều nhất
                    </p>
                  </div>

                  <div className="overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.article
                        key={topViewedProducts[topViewedIndex]?.id}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        onClick={() =>
                          navigate(
                            `/products/${topViewedProducts[topViewedIndex]?.id}`,
                          )
                        }
                        className="relative mx-auto max-w-sm cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-3"
                      >
                        <span className="absolute right-2 top-2 rounded-full bg-zinc-900 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                          Top {topViewedIndex + 1}
                        </span>

                        <div className="h-28 overflow-hidden rounded-xl bg-zinc-100">
                          {topViewedProducts[topViewedIndex]?.imageUrl ? (
                            <img
                              src={topViewedProducts[topViewedIndex].imageUrl}
                              alt={topViewedProducts[topViewedIndex].name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs font-semibold text-zinc-500">
                              Chưa có ảnh
                            </div>
                          )}
                        </div>

                        <p className="mt-2 line-clamp-1 text-sm font-semibold text-zinc-900">
                          {topViewedProducts[topViewedIndex]?.name}
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          Lượt xem:{" "}
                          <span className="font-semibold text-zinc-900">
                            {Number(
                              topViewedProducts[topViewedIndex]?.viewCount || 0,
                            ).toLocaleString("vi-VN")}
                          </span>
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-900">
                          <span>
                            {formatPrice(
                              getEffectivePrice(
                                topViewedProducts[topViewedIndex],
                              ),
                            )}
                          </span>
                          {hasSalePrice(topViewedProducts[topViewedIndex]) && (
                            <span className="ml-2 text-xs text-zinc-400 line-through">
                              {formatPrice(
                                topViewedProducts[topViewedIndex].price,
                              )}
                            </span>
                          )}
                        </p>
                      </motion.article>
                    </AnimatePresence>

                    <div className="mt-3 flex items-center justify-center gap-1.5">
                      {topViewedProducts.map((product, index) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => setTopViewedIndex(index)}
                          className={`h-2.5 w-2.5 rounded-full transition-colors ${
                            index === topViewedIndex
                              ? "bg-zinc-900"
                              : "bg-zinc-300 hover:bg-zinc-500"
                          }`}
                          aria-label={`Xem top lượt xem ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </div>
          </section>
        )}

      {!compact && (
        <CategoriesStrip
          categories={categories.filter((cat) => cat.parentId == null)}
          selectedId={selectedCategory}
          onSelect={(cat) => navigate(`/categories/${cat.slug || cat.id}`)}
          loading={loadingCategories}
          error={categoriesError}
        />
      )}

      {!compact && (
        <section className="space-y-4">
          {/* Section header: title + product count */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Sản phẩm
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
                Danh sách sản phẩm
              </h2>
            </div>
            {!loading && !error && (
              <p className="text-xs font-semibold text-zinc-500">
                <span className="tabular-nums text-zinc-900">
                  {filteredProducts.length}
                </span>{" "}
                sản phẩm
              </p>
            )}
          </div>

          {/* Search + Filter Bar (always visible) */}
          <SearchFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            stockFilter={stockFilter}
            minPrice={minPrice}
            maxPrice={maxPrice}
            ratingFilter={ratingFilter}
            priceSort={priceSort}
            onCategoryChange={setSelectedCategory}
            onStockChange={setStockFilter}
            onRatingChange={setRatingFilter}
            onPriceChange={(type, value) => {
              if (type === "min") setMinPrice(value);
              else setMaxPrice(value);
            }}
            onSortChange={setPriceSort}
            onClearAll={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setStockFilter("all");
              setMinPrice("");
              setMaxPrice("");
              setRatingFilter(0);
              setPriceSort("default");
            }}
            categories={categories}
            isFilterOpen={isFilterPanelOpen}
            onToggleFilter={() => setIsFilterPanelOpen((prev) => !prev)}
            totalProductCount={filteredProducts.length}
            sellerMode={sellerMode}
            onExportCsv={handleExportCsv}
            onImportCsv={handleImportCsv}
          />

          {/* Advanced Filter Panel (expandable) */}
          <FilterPanel
            isOpen={isFilterPanelOpen}
            categories={categories}
            selectedCategory={selectedCategory}
            stockFilter={stockFilter}
            minPrice={minPrice}
            maxPrice={maxPrice}
            ratingFilter={ratingFilter}
            onCategoryChange={setSelectedCategory}
            onStockChange={setStockFilter}
            onRatingChange={setRatingFilter}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onReset={() => {
              setSelectedCategory("all");
              setStockFilter("all");
              setMinPrice("");
              setMaxPrice("");
              setRatingFilter(0);
            }}
            onClose={() => setIsFilterPanelOpen(false)}
          />
        </section>
      )}

      {loading && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
          Đang tải sản phẩm...
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Không thể tải sản phẩm: {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
          Chưa có sản phẩm nào để hiển thị.
        </div>
      )}

      {!loading &&
        !error &&
        products.length > 0 &&
        filteredProducts.length === 0 && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            Không tìm thấy sản phẩm phù hợp với từ khóa "{searchTerm.trim()}".
          </div>
        )}

      {!loading && !error && pagedProducts.length > 0 && (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {pagedProducts.map((product) => (
            <motion.article
              key={product.id}
              variants={itemVariants}
              onClick={() => navigate(`/products/${product.id}`)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-white"
            >
              <div className="relative h-36 bg-zinc-100">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-100 text-sm font-semibold text-zinc-500">
                    Chưa có ảnh sản phẩm
                  </div>
                )}

                {/* Wishlist heart — top-right of image */}
                <div className="absolute right-1.5 top-1.5 z-10">
                  <WishlistButton productId={product.id} size="sm" />
                </div>
              </div>

              <div className="p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  {product.name || "---"}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-semibold text-zinc-900">
                      {formatPrice(getEffectivePrice(product))}
                    </p>
                    {hasSalePrice(product) && (
                      <p className="text-sm text-zinc-400 line-through">
                        {formatPrice(product.price)}
                      </p>
                    )}
                  </div>
                  {hasSalePrice(product) && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                      -
                      {Math.round(
                        (1 -
                          Number(product.salePrice) / Number(product.price)) *
                          100,
                      )}
                      %
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(event) => handleAddToCart(event, product)}
                    disabled={Number(product?.stock || 0) <= 0}
                    className="rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
                  >
                    {Number(product?.stock || 0) <= 0
                      ? "Hết hàng"
                      : "Thêm vào giỏ"}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {!loading && !error && computedTotalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700 hover:border-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Trước
          </button>

          {Array.from({ length: computedTotalPages }, (_, i) => {
            // Show first, last, current, and neighbors
            const showPage =
              i === 0 ||
              i === computedTotalPages - 1 ||
              Math.abs(i - currentPage) <= 1;
            if (!showPage) {
              // Show ellipsis only once between ranges
              if (i === 1 || i === computedTotalPages - 2) {
                return (
                  <span key={i} className="px-1 text-xs text-zinc-400">
                    ...
                  </span>
                );
              }
              return null;
            }
            return (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentPage(i)}
                className={`min-w-[36px] rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                  i === currentPage
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                }`}
              >
                {i + 1}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage >= computedTotalPages - 1}
            onClick={() =>
              setCurrentPage((p) => Math.min(computedTotalPages - 1, p + 1))
            }
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700 hover:border-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sau →
          </button>

          <span className="ml-3 text-xs text-zinc-500">
            {computedTotalElements.toLocaleString("vi-VN")} sản phẩm
          </span>
        </div>
      )}
    </section>
  );
}

export default ProductSection;
