import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CartButton from "../components/CartButton";
import CartDrawer from "../components/CartDrawer";
import { useCart } from "../context/CartContext";
import { getProductDetail, getProducts } from "../services/productService";
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
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { refreshCart, openCart } = useCart();

  const session = getAuthSession();

  const hasVariants = product?.variants && product.variants.length > 0;

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

        // Auto-select first variant if available
        if (data.variants && data.variants.length > 0) {
          const inStockVariant = data.variants.find((v) => v.stock > 0);
          setSelectedVariant(inStockVariant || data.variants[0]);
        } else {
          setSelectedVariant(null);
        }

        const allProducts = await getProducts();
        const sameCategory = allProducts
          .filter(
            (item) =>
              item?.id !== data.id && item?.categoryId === data?.categoryId,
          )
          .sort((a, b) => {
            const byViews =
              Number(b?.viewCount || 0) - Number(a?.viewCount || 0);
            if (byViews !== 0) return byViews;
            return Number(b?.id || 0) - Number(a?.id || 0);
          });
        setRelatedProducts(sameCategory);
      } catch (err) {
        setError(err?.message || "Đã có lỗi khi tải sản phẩm");
        setRelatedProducts([]);
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
      toast.error("Vui lòng chọn size trước khi thêm vào giỏ");
      return;
    }

    setAdding(true);

    try {
      await addToCart(product.id, quantity, selectedVariant?.id || null);
      const variantLabel = selectedVariant
        ? ` (${selectedVariant.attributes?.size || ""})`
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
              to="/products"
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
              to="/products"
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
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            ← Quay lại
          </Link>
          <div className="flex items-center gap-3">
            {session?.token && (
              <Link
                to="/orders"
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 transition-colors"
              >
                Đơn hàng
              </Link>
            )}
            {session?.token && <CartButton />}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Image Section */}
          <div className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white overflow-hidden">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                className="h-full w-full object-cover rounded-2xl"
              />
            ) : (
              <div className="flex h-96 w-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-100 text-sm font-semibold text-zinc-500">
                Chưa có ảnh sản phẩm
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-8">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {product.categoryName || "Danh mục"}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
                  {product.name}
                </h1>
              </div>
              <span className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
                {product.status}
              </span>
            </div>

            {product.description && (
              <p className="mt-4 text-base text-zinc-700 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Variant Selector */}
            {hasVariants && (
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

            {/* Product Info */}
            <div className="mt-5 space-y-3 border-t border-zinc-200 pt-5">
              <div className="flex justify-between">
                <span className="text-sm text-zinc-600">Người bán:</span>
                <span className="font-medium text-zinc-900">
                  {product.sellerUsername}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-600">Tồn kho:</span>
                <span className="font-medium text-zinc-900">
                  {currentStock} sản phẩm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-600">ID Sản phẩm:</span>
                <span className="font-medium text-zinc-900">#{product.id}</span>
              </div>
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

            {/* Quantity Selector */}
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

            {/* Add to Cart Button */}
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

            {!session?.token && (
              <Link
                to="/login"
                className="mt-3 block w-full rounded-full border border-zinc-300 bg-white px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 hover:bg-zinc-50 transition-colors"
              >
                Đăng nhập để mua
              </Link>
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
                Cùng danh mục, ưu tiên lượt xem cao
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
                      {formatPrice(item.salePrice || item.price)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                      Lượt xem:{" "}
                      {Number(item.viewCount || 0).toLocaleString("vi-VN")}
                    </p>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      <CartDrawer />
    </div>
  );
}

export default ProductDetailPage;
