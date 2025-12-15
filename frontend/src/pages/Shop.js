import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productAPI } from "../services/api";
import { useApp } from "../context/AppContext";
import { ShoppingCart, Star, Search, Filter } from "lucide-react";

const Shop = () => {
  const { addToCart } = useApp();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const loadProducts = async () => {
    try {
      console.log("🔍 Loading products from: /api/shop/products");

      const response = await productAPI.getAll();
      console.log("📦 Raw response:", response);
      console.log("📊 Response data:", response.data);

      // Backend returns: { success: true, products: [...], pagination: {...} }
      let productsData = [];

      if (response.data) {
        if (Array.isArray(response.data)) {
          // Format 1: Direct array
          productsData = response.data;
        } else if (
          response.data.products &&
          Array.isArray(response.data.products)
        ) {
          // Format 2: { products: [...] }
          productsData = response.data.products;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Format 3: { data: [...] }
          productsData = response.data.data;
        }
      }

      console.log("✅ Products loaded:", productsData.length);
      console.log("📋 First product:", productsData[0]);

      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error("❌ Failed to load products:", error);
      console.error("❌ Error response:", error.response?.data);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!Array.isArray(products) || products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          (product.name?.english || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (product.description?.english || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    setFilteredProducts(filtered);
  };

  const categories = [
    "all",
    "Pooja Kit",
    "Flowers",
    "Incense",
    "Lamps & Diyas",
    "Idols",
    "Puja Thali",
    "Eco-Friendly",
    "Books",
    "Accessories",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Pooja Samagri Shop
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Authentic items for your spiritual practices
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <p className="text-gray-600">
              Showing{" "}
              <span className="font-semibold">{filteredProducts.length}</span>{" "}
              products
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl h-80 animate-pulse"
              ></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
              >
                <Link to={`/product/${product._id}`} className="block">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.mainImage || product.images?.[0] || "https://via.placeholder.com/300"}
                      alt={product.name?.english || "Product"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.discountPrice && product.mrp && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {Math.round(
                          ((product.mrp - product.discountPrice) / product.mrp) *
                            100
                        )}
                        % OFF
                      </div>
                    )}
                    {product.ecoFriendly && (
                      <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                        Eco-Friendly
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <span className="text-xs text-orange-600 font-semibold">
                    {product.category || "Product"}
                  </span>
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-orange-600 transition-colors">
                      {product.name?.english || product.name || "Product Name"}
                    </h3>
                  </Link>
                  <div className="flex items-center mb-2">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <span className="ml-1 text-sm text-gray-600">
                      {product.ratings?.average?.toFixed(1) || "4.5"}
                      {product.ratings?.count
                        ? ` (${product.ratings.count})`
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{product.discountPrice || product.price || 0}
                    </span>
                    {product.mrp &&
                      product.discountPrice &&
                      product.mrp > product.discountPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.mrp}
                        </span>
                      )}
                  </div>
                  {product.stock > 0 ? (
                    <button
                      onClick={(e) => { e.preventDefault(); addToCart(product); }}
                      className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-2 rounded-lg font-medium cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
