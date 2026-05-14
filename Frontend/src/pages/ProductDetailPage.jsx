import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import CartButton from "../components/CartButton";
import WishlistButton from "../components/WishlistButton";
import CartDrawer from "../components/CartDrawer";
import ReviewSummaryBlock from "../components/review/ReviewSummaryBlock";
import { useCart } from "../context/CartContext";
import { getProductDetail } from "../services/productService";
import { addToCart } from "../services/cartService";
import { getAuthSession } from "../services/sessionService";

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSellerView = searchParams.get("sellerView") === "1";
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const { refreshCart, openCart } = useCart();

  const session = getAuthSession();

  const hasVariants = product?.variants && product.variants.length > 0;
  const hasOptions = product?.options && product.options.length > 0;

  // Find matching variant from selected options
  const matchedVariant = useMemo(() => {
    if (!hasVariants || !hasOptions) return null;
    if (Object.keys(selectedOptions).length === 0) return null;

    return product.variants.find((v) => {
      if (!v.attributes) return false;
      return Object.entries(selectedOptions).every(
        ([key, val]) => v.attributes[key] === val,
      );
    });
  }, [product, selectedOptions, hasVariants, hasOptions]);

  // Auto-select variant when options match
  useEffect(() => {
    if (matchedVariant) {
      setSelectedVariant(matchedVariant);
    } else if (hasVariants && !hasOptions) {
      // No options defined — select first in-stock variant
      if (!selectedVariant) {
        const inStockVariant = product.variants.find((v) => v.stock > 0);
        setSelectedVariant(inStockVariant || product.variants[0]);
      }
    }
  }, [matchedVariant, hasVariants, hasOptions, product, selectedVariant]);

  // Initialize default option selections
  useEffect(() => {
    if (hasOptions && product?.options) {
      const defaults = {};
      product.options.forEach((opt) => {
        if (opt.values && opt.values.length > 0) {
          defaults[opt.name] = opt.values[0];
        }
      });
      setSelectedOptions(defaults);
    }
  }, [product, hasOptions]);

  const currentPrice = useMemo(() => {
    if (hasVariants && selectedVariant) {
      return selectedVariant.salePrice || selectedVariant.price;
    }
    return product?.salePrice || product?.price;
  }, [product, selectedVariant, hasVariants]);

  const originalPrice = useMemo(() => {
    if (hasVariants && selectedVariant) {
      return selectedVariant.salePrice ? selectedVariant.price : null;
    }
    return product?.salePrice ? product?.price : null;
  }, [product, selectedVariant, hasVariants]);

  const currentStock = useMemo(() => {
    if (hasVariants && selectedVariant) {
      return selectedVariant.stock;
    }
    return product?.stock || 0;
  }, [product, selectedVariant, hasVariants]);

  const currentImage = useMemo(() => {
    if (hasVariants && selectedVariant?.imageUrl) {
      return selectedVariant.imageUrl;
    }
    return product?.imageUrl;
  }, [product, selectedVariant, hasVariants]);

  // Gallery images: variant image + product gallery
  const galleryImages = useMemo(() => {
    const images = [];
    if (currentImage) images.push(currentImage);
    if (product?.gallery && Array.isArray(product.gallery)) {
      product.gallery.forEach((url) => {
        if (!images.includes(url)) images.push(url);
      });
    }
    return images;
  }, [product, currentImage]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [currentImage]);

  // Related products from API or fallback to empty
  const relatedProducts = product?.relatedProducts || [];

  // Category name helper (backward compat)
  const categoryName =
    product?.category?.name || product?.categoryName || "Danh mục";

  // Seller info helpers (backward compat)
  const sellerName =
    product?.seller?.storeName || product?.sellerUsername || "Người bán";
  const sellerId = product?.seller?.id || product?.sellerId || null;
  const sellerAvatar = product?.seller?.avatarUrl || null;
  const sellerVerified = product?.seller?.sellerVerified || false;
  const sellerTotalSales =
    product?.seller?.totalSales || product?.soldCount || 0;

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        if (!productId) throw new Error("Product ID không hợp lệ");
        const data = await getProductDetail(productId);

        if (!data) throw new Error("Không nhận được dữ liệu sản phẩm từ API");
        if (typeof data !== "object")
          throw new Error(`Dữ liệu sản phẩm không hợp lệ: ${typeof data}`);
        if (!data.id) throw new Error("Sản phẩm không có ID");

        setProduct(data);
        setQuantity(1);

        // Auto-select first variant if variants exist but no options defined
        if (
          data.variants &&
          data.variants.length > 0 &&
          (!data.options || data.options.length === 0)
        ) {
          const inStockVariant = data.variants.find((v) => v.stock > 0);
          setSelectedVariant(inStockVariant || data.variants[0]);
        } else if (!data.variants || data.variants.length === 0) {
          setSelectedVariant(null);
        }
      } catch (err) {
        setError(err?.message || "Đã có lỗi khi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const handleQuantityChange = (newQuantity) => {
    const value = Math.max(1, Math.min(newQuantity, currentStock || 1));
    setQuantity(value);
  };

  const handleAddToCart = async () => {
    if (!session?.token) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate("/login");
      return;
    }

    if (!product || quantity < 1) {
      toast.error("Vui lòng chọn sản phẩm và số lượng hợp lệ");
      return;
    }

    if (hasVariants && !selectedVariant) {
      toast.error("Vui lòng chọn đầy đủ các tùy chọn trước khi thêm vào giỏ");
      return;
    }

    setAdding(true);

    try {
      await addToCart(product.id, quantity, selectedVariant?.id || null);
      const variantLabel = selectedVariant
        ? ` (${Object.values(selectedVariant.attributes || {}).join(", ")})`
        : "";
      toast.success(`Đã thêm ${quantity} sản phẩm${variantLabel} vào giỏ hàng`);
      setQuantity(1);
      await refreshCart();
      openCart();
    } catch (err) {
      toast.error(err?.message || "Không thể thêm vào giỏ hàng");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-center text-sm text-zinc-600">
            Đang tải chi tiết sản phẩm...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-semibold text-red-700">
              Lỗi khi tải sản phẩm:
            </p>
            <p className="mt-2 text-sm text-red-600 whitespace-pre-wrap break-words">
              {error}
            </p>
            <p className="mt-3 text-xs text-red-600">Product ID: {productId}</p>
            <p className="mt-1 text-xs text-red-600">
              API URL: http://localhost:8080/products/{productId}
            </p>
            <Link
              to={isSellerView ? "/seller/products" : "/products"}
              className="mt-4 inline-block rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-700 hover:border-red-500"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
            <p className="text-sm text-zinc-600">Không tìm thấy sản phẩm này</p>
            <Link
              to={isSellerView ? "/seller/products" : "/products"}
              className="mt-4 inline-block rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            to={isSellerView ? "/seller/products" : "/products"}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            ← Quay lại
          </Link>
          <div className="flex items-center gap-3">
            {session?.token && (
              <>
                <WishlistButton productId={Number(productId)} />
                <Link
                  to="/orders"
                  className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 transition-colors"
                >
                  Đơn hàng
                </Link>
              </>
            )}
            {session?.token && <CartButton />}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Image Section with Gallery */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white overflow-hidden aspect-square">
              {galleryImages.length > 0 && galleryImages[activeImageIndex] ? (
                <img
                  src={galleryImages[activeImageIndex]}
                  alt={product.name}
                  className="h-full w-full object-cover rounded-2xl"
                />
              ) : (
                <div className="flex h-96 w-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-100 text-sm font-semibold text-zinc-500">
                  Chưa có ảnh sản phẩm
                </div>
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {galleryImages.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${
                      idx === activeImageIndex
                        ? "border-zinc-900"
                        : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${product.name} ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-8">
            {/* Category & Title */}
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {categoryName}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
                  {product.name}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <WishlistButton productId={product.id} />
                <span className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
                  {product.status}
                </span>
              </div>
            </div>

            {product.description && (
              <p className="mt-4 text-base text-zinc-700 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Variant Selector with Options */}
            {hasVariants && hasOptions && (
              <div className="mt-6 border-t border-zinc-200 pt-5">
                {product.options.map((option) => (
                  <div key={option.name} className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Chọn {option.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const isSelected =
                          selectedOptions[option.name] === value;
                        return (
                          <button
                            key={value}
                            onClick={() =>
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [option.name]: value,
                              }))
                            }
                            className={`relative rounded-xl border px-4 py-2.5 text-sm font-semibold capitalize transition-all ${
                              isSelected
                                ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                                : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-900"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {selectedVariant && (
                  <p className="mt-2 text-xs text-zinc-500">
                    Còn{" "}
                    <span className="font-semibold text-zinc-800">
                      {selectedVariant.stock}
                    </span>{" "}
                    sản phẩm
                  </p>
                )}
                {!selectedVariant &&
                  Object.keys(selectedOptions).length > 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      Không có biến thể nào khớp với lựa chọn này
                    </p>
                  )}
              </div>
            )}

            {/* Variant Selector without Options (legacy - size only) */}
            {hasVariants && !hasOptions && (
              <div className="mt-6 border-t border-zinc-200 pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Chọn size
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const isOutOfStock = variant.stock === 0;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => {
                          if (!isOutOfStock) {
                            setSelectedVariant(variant);
                            setQuantity(1);
                          }
                        }}
                        disabled={isOutOfStock}
                        className={`relative rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                          isSelected
                            ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                            : isOutOfStock
                              ? "border-zinc-200 bg-zinc-50 text-zinc-300 cursor-not-allowed line-through"
                              : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-900"
                        }`}
                      >
                        {variant.attributes?.size ||
                          variant.sku ||
                          `#${variant.id}`}
                        {isOutOfStock && (
                          <span className="ml-1 text-[10px]">(hết)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedVariant && (
                  <p className="mt-2 text-xs text-zinc-500">
                    Còn{" "}
                    <span className="font-semibold text-zinc-800">
                      {selectedVariant.stock}
                    </span>{" "}
                    sản phẩm
                  </p>
                )}
              </div>
            )}

            {/* Seller / Store Info */}
            <div className="mt-5 border-t border-zinc-200 pt-5">
              <div className="flex items-center gap-4">
                {/* Seller Avatar */}
                <Link
                  to={sellerId ? `/store/${sellerId}` : "#"}
                  className="flex-shrink-0 w-14 h-14 rounded-full border-2 border-zinc-200 overflow-hidden bg-zinc-100 hover:border-zinc-400 transition-colors"
                >
                  {sellerAvatar ? (
                    <img
                      src={sellerAvatar}
                      alt={sellerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-zinc-400">
                      {sellerName?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                  )}
                </Link>

                {/* Seller Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={sellerId ? `/store/${sellerId}` : "#"}
                    className="text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition-colors"
                  >
                    {sellerName}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2">
                    {/* Seller rating from backend */}
                    <div className="flex items-center gap-0.5">
                      {product?.seller?.storeRating != null ? (
                        <>
                          {[1, 2, 3, 4, 5].map((star) => {
                            const rating = Number(product.seller.storeRating);
                            const fill =
                              rating >= star
                                ? "currentColor"
                                : rating >= star - 0.5
                                  ? "url(#sellerHalfGrad)"
                                  : "none";
                            return (
                              <svg
                                key={star}
                                className="w-4 h-4 text-yellow-400"
                                fill={fill}
                                stroke="currentColor"
                                strokeWidth="1"
                                viewBox="0 0 20 20"
                              >
                                <defs>
                                  <linearGradient id="sellerHalfGrad">
                                    <stop
                                      offset="50%"
                                      stopColor="currentColor"
                                    />
                                    <stop
                                      offset="50%"
                                      stopColor="transparent"
                                    />
                                  </linearGradient>
                                </defs>
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            );
                          })}
                          <span className="ml-1 text-xs font-medium text-zinc-500">
                            {Number(product.seller.storeRating).toFixed(1)}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-zinc-400">
                          Chưa có đánh giá
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                    {sellerVerified && (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <span className="text-[10px]">✓</span> Đã xác thực
                      </span>
                    )}
                  </div>
                </div>

                {/* View Store Button */}
                {sellerId && (
                  <Link
                    to={`/store/${sellerId}`}
                    className="flex-shrink-0 rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-800 hover:border-zinc-900 hover:bg-zinc-50 transition-colors"
                  >
                    Xem shop
                  </Link>
                )}
              </div>

              {/* Products Sold */}
              <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-sm text-zinc-600">Sản phẩm đã bán:</span>
                <span className="font-semibold text-zinc-900">
                  {Number(sellerTotalSales).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>

            {/* Additional Product Info */}
            <div className="mt-5 space-y-3 border-t border-zinc-200 pt-5">
              <div className="flex justify-between">
                <span className="text-sm text-zinc-600">Tồn kho:</span>
                <span className="font-medium text-zinc-900">
                  {currentStock} sản phẩm
                </span>
              </div>
              {product.avgRating != null && (
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600">Đánh giá:</span>
                  <span className="font-medium text-zinc-900">
                    ⭐ {Number(product.avgRating).toFixed(1)} (
                    {product.reviewCount || 0} đánh giá)
                  </span>
                </div>
              )}
              {product.sku && (
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600">SKU:</span>
                  <span className="font-medium text-zinc-900">
                    {product.sku}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-zinc-600">Lượt xem:</span>
                <span className="font-medium text-zinc-900">
                  {Number(product.viewCount || 0).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mt-5 border-t border-zinc-200 pt-5">
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-zinc-900">
                  {formatPrice(currentPrice)}
                </p>
                {originalPrice && (
                  <p className="text-lg text-zinc-400 line-through">
                    {formatPrice(originalPrice)}
                  </p>
                )}
              </div>
              {hasVariants && selectedVariant?.salePrice && (
                <p className="mt-1 text-xs font-semibold text-emerald-700">
                  Tiết kiệm{" "}
                  {formatPrice(
                    selectedVariant.price - selectedVariant.salePrice,
                  )}
                </p>
              )}
            </div>

            {/* Quantity Selector — hidden in seller view */}
            {!isSellerView && (
              <div className="mt-5 border-t border-zinc-200 pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Số lượng
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="h-10 w-10 rounded-full border border-zinc-300 bg-white hover:border-zinc-900 hover:bg-zinc-50 flex items-center justify-center font-semibold text-zinc-900 transition-colors"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(parseInt(e.target.value) || 1)
                    }
                    className="w-16 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-center font-medium text-zinc-900"
                    min="1"
                    max={currentStock}
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="h-10 w-10 rounded-full border border-zinc-300 bg-white hover:border-zinc-900 hover:bg-zinc-50 flex items-center justify-center font-semibold text-zinc-900 transition-colors"
                    disabled={quantity >= currentStock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button — hidden in seller view */}
            {!isSellerView && (
              <button
                onClick={handleAddToCart}
                disabled={adding || currentStock === 0}
                className="mt-6 w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors"
              >
                {adding
                  ? "Đang thêm..."
                  : currentStock === 0
                    ? "Hết hàng"
                    : "Thêm vào giỏ hàng"}
              </button>
            )}

            {!session?.token && !isSellerView && (
              <Link
                to="/login"
                className="mt-3 block w-full rounded-full border border-zinc-300 bg-white px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 hover:bg-zinc-50 transition-colors"
              >
                Đăng nhập để mua
              </Link>
            )}

            {/* Seller view actions */}
            {isSellerView && (
              <div className="mt-5 border-t border-zinc-200 pt-5 space-y-3">
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-amber-600 shrink-0"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <p className="text-xs text-amber-700">
                    Bạn đang xem với tư cách người bán — nút mua hàng bị ẩn
                  </p>
                </div>
                <Link
                  to="/seller/products"
                  className="block w-full rounded-full border border-zinc-300 bg-white px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 hover:bg-zinc-50 transition-colors"
                >
                  ← Quay lại quản lý sản phẩm
                </Link>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
                Sản phẩm liên quan
              </h2>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Cùng danh mục {categoryName}
              </p>
            </div>

            <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
              {relatedProducts.map((item) => (
                <article
                  key={item.id}
                  className="min-w-[240px] rounded-2xl border border-zinc-200 bg-zinc-50 p-4 md:min-w-[280px] lg:min-w-[calc((100%-3rem)/4)]"
                >
                  <Link to={`/products/${item.id}`} className="block">
                    <div className="h-36 overflow-hidden rounded-xl bg-zinc-100">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-500">
                          Chưa có ảnh
                        </div>
                      )}
                    </div>

                    <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-zinc-900">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                      {formatPrice(item.price)}
                    </p>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Review Summary Block */}
        <ReviewSummaryBlock />
      </div>

      <CartDrawer />
    </div>
  );
}

export default ProductDetailPage;
