import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, ShoppingCart, Heart, Share2, Star, Check, Truck, Shield, 
  RotateCcw, Package, Minus, Plus, ChevronRight, Loader
} from "lucide-react";
import { useApp } from "../context/AppContext";
import api from "../services/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useApp();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/shop/products/${id}`);
      const productData = res.data.product || res.data.data || res.data;
      setProduct(productData);
      
      // Fetch related products
      if (productData?.category) {
        try {
          const relatedRes = await api.get(`/shop/products?category=${productData.category}&limit=4`);
          const related = (relatedRes.data.products || relatedRes.data || []).filter(p => p._id !== id);
          setRelatedProducts(related.slice(0, 4));
        } catch (e) { console.error(e); }
      }
    } catch (error) {
      console.error("Failed to load product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product && addToCart) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => navigate("/cart"), 300);
  };

  const isInCart = cart?.some(item => (item._id || item.id) === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <Link to="/shop" className="text-orange-600 hover:text-orange-700 flex items-center gap-2 justify-center">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [product.mainImage || product.image || "https://via.placeholder.com/500"];
  const price = product.discountPrice || product.price || 0;
  const mrp = product.mrp || price;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const inStock = product.stock > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-orange-600">Home</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link to="/shop" className="text-gray-500 hover:text-orange-600">Shop</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate">{product.name?.english || product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden aspect-square relative">
              <img
                src={images[selectedImage]}
                alt={product.name?.english || "Product"}
                className="w-full h-full object-contain p-4"
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {discount}% OFF
                </div>
              )}
              {product.ecoFriendly && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  🌿 Eco-Friendly
                </div>
              )}
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all ${isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'}`}
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Title */}
            <div>
              <span className="text-orange-600 font-semibold text-sm uppercase tracking-wide">
                {product.category || "Pooja Items"}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">
                {product.name?.english || product.name}
              </h1>
              {product.name?.hindi && (
                <p className="text-xl text-gray-600 mt-1">{product.name.hindi}</p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= (product.ratings?.average || 4.5)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600">
                  {product.ratings?.average?.toFixed(1) || "4.5"} 
                  ({product.ratings?.count || 0} reviews)
                </span>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Price */}
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">₹{price}</span>
                {discount > 0 && (
                  <>
                    <span className="text-xl text-gray-400 line-through">₹{mrp}</span>
                    <span className="text-green-600 font-semibold">Save ₹{mrp - price}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
            </div>

            {/* Stock Status */}
            <div className={`flex items-center gap-2 ${inStock ? 'text-green-600' : 'text-red-600'}`}>
              {inStock ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="font-medium">In Stock</span>
                  {product.stock < 10 && <span className="text-orange-600">- Only {product.stock} left!</span>}
                </>
              ) : (
                <span className="font-medium">Out of Stock</span>
              )}
            </div>

            {/* Quantity Selector */}
            {inStock && (
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Quantity:</span>
                <div className="flex items-center border-2 border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-6 py-3 font-semibold text-lg min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {inStock ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={addedToCart}
                    className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                      addedToCart 
                        ? 'bg-green-500 text-white' 
                        : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="w-6 h-6" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-6 h-6" />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 py-4 bg-orange-600 text-white rounded-xl font-bold text-lg hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Buy Now
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="flex-1 py-4 bg-gray-300 text-gray-500 rounded-xl font-bold text-lg cursor-not-allowed"
                >
                  Out of Stock
                </button>
              )}
            </div>

            {isInCart && !addedToCart && (
              <Link 
                to="/cart" 
                className="block text-center text-orange-600 font-medium hover:underline"
              >
                View Cart →
              </Link>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center p-3">
                <Truck className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Free Delivery</p>
                <p className="text-xs text-gray-500">On orders above ₹499</p>
              </div>
              <div className="text-center p-3">
                <Shield className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Quality Assured</p>
                <p className="text-xs text-gray-500">100% Authentic</p>
              </div>
              <div className="text-center p-3">
                <RotateCcw className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                <p className="text-xs text-gray-500">7 Days Return</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
          <div className="prose max-w-none text-gray-600">
            <p>{product.description?.english || product.description || "Premium quality pooja item for your daily worship needs."}</p>
            {product.description?.hindi && (
              <p className="mt-4 text-gray-500">{product.description.hindi}</p>
            )}
          </div>

          {/* Specifications */}
          {(product.weight || product.dimensions || product.material) && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {product.weight && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Weight</span>
                    <span className="font-medium">{product.weight}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Dimensions</span>
                    <span className="font-medium">{product.dimensions}</span>
                  </div>
                )}
                {product.material && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Material</span>
                    <span className="font-medium">{product.material}</span>
                  </div>
                )}
                {product.brand && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Brand</span>
                    <span className="font-medium">{product.brand}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <Link
                  key={item._id}
                  to={`/product/${item._id}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item.mainImage || item.images?.[0] || "https://via.placeholder.com/300"}
                      alt={item.name?.english}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name?.english || item.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-gray-900">₹{item.discountPrice || item.price}</span>
                      {item.mrp > (item.discountPrice || item.price) && (
                        <span className="text-sm text-gray-400 line-through">₹{item.mrp}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
