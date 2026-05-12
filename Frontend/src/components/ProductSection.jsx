import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { addToCart } from "../services/cartService";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import { getAuthSession } from "../services/sessionService";

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

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function ProductSection() {
  const navigate = useNavigate();
  const { refreshCart, openCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceSort, setPriceSort] = useState("default");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [topSellingIndex, setTopSellingIndex] = useState(0);
  const [topViewedIndex, setTopViewedIndex] = useState(0);

  const session = getAuthSession();

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

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const items = await getProducts();

        if (!cancelled) {
          setProducts(items);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Đã có lỗi khi tải sản phẩm");
          setProducts([]);
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
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const items = await getCategories();
        if (!cancelled) {
          setCategories(items);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
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

      const price = Number(product?.price || 0);
      const matchMinPrice = !hasMin || price >= min;
      const matchMaxPrice = !hasMax || price <= max;

      return (
        matchName &&
        matchCategory &&
        matchStock &&
        matchMinPrice &&
        matchMaxPrice
      );
    });

    if (priceSort === "asc") {
      result.sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0));
    }

    if (priceSort === "desc") {
      result.sort((a, b) => Number(b?.price || 0) - Number(a?.price || 0));
    }

    return result;
  }, [
    products,
    searchTerm,
    selectedCategory,
    stockFilter,
    minPrice,
    maxPrice,
    priceSort,
  ]);

  const handleAddToCart = async (event, product) => {
    event.stopPropagation();

    if (!session?.token) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate("/login");
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

  return (
    <section id="products" className="mt-14 space-y-10">
      {!loading &&
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
                          {formatPrice(
                            topSellingProducts[topSellingIndex]?.price,
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
                          {formatPrice(
                            topViewedProducts[topViewedIndex]?.price,
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

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Sản phẩm
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              Danh sách sản phẩm mới nhất
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFilterPanelOpen((prev) => !prev)}
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
            >
              {isFilterPanelOpen ? "Ẩn bộ lọc" : "Bộ lọc"}
            </button>
          </div>
        </div>

        {isFilterPanelOpen && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div className="md:col-span-2 lg:col-span-3">
                <label
                  htmlFor="product-search"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                >
                  Tìm kiếm theo tên sản phẩm
                </label>
                <input
                  id="product-search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Nhập tên sản phẩm..."
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label
                  htmlFor="category-filter"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                >
                  Danh mục
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="stock-filter"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                >
                  Số lượng
                </label>
                <select
                  id="stock-filter"
                  value={stockFilter}
                  onChange={(event) => setStockFilter(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                >
                  <option value="all">Tất cả</option>
                  <option value="inStock">Còn hàng</option>
                  <option value="outOfStock">Hết hàng</option>
                  <option value="lowStock">Sắp hết (1-10)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="price-sort"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                >
                  Giá tiền
                </label>
                <select
                  id="price-sort"
                  value={priceSort}
                  onChange={(event) => setPriceSort(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                >
                  <option value="default">Mặc định</option>
                  <option value="asc">Thấp đến cao</option>
                  <option value="desc">Cao đến thấp</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="min-price"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                >
                  Giá từ
                </label>
                <input
                  id="min-price"
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="0"
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label
                  htmlFor="max-price"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                >
                  Giá đến
                </label>
                <input
                  id="max-price"
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="99999999"
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                />
              </div>
            </div>
          </div>
        )}
      </section>

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

      {!loading && !error && filteredProducts.length > 0 && (
        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredProducts.map((product) => (
            <motion.article
              key={product.id}
              variants={itemVariants}
              onClick={() => navigate(`/products/${product.id}`)}
              className="cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-white"
            >
              <div className="h-36 bg-zinc-100">
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
              </div>

              <div className="p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  {product.name || "---"}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <p className="text-xl font-semibold text-zinc-900">
                    {formatPrice(product.price)}
                  </p>
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
    </section>
  );
}

export default ProductSection;
