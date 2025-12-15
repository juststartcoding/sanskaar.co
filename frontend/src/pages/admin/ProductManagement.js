import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Search,
  Package,
  ChevronLeft,
  ChevronRight,
  Loader,
  Eye,
  RefreshCw,
  Leaf,
} from "lucide-react";
import api from "../../services/api";

const ProductManagement = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: "" });
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
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

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm, filterCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (filterCategory !== "all") params.append("category", filterCategory);

      const response = await api.get(`/admin/products?${params.toString()}`);

      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleToggleFeatured = async (id) => {
    try {
      await api.patch(`/admin/products/${id}/toggle-featured`, {});
      loadProducts();
    } catch (error) {
      console.error("Error toggling featured:", error);
      alert("Failed to update featured status");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/products/${deleteModal.id}`);
      setDeleteModal({ show: false, id: null, name: "" });
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">
            Manage all products in the shop • {total} total products
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/admin/products/add"
            className="flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">No products found</p>
          <Link
            to="/admin/products/add"
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Your First Product
          </Link>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all group"
              >
                <div className="relative">
                  <img
                    src={product.mainImage || "https://via.placeholder.com/400x300"}
                    alt={product.name?.english}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.featured && (
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    )}
                    {product.ecoFriendly && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Leaf className="w-3 h-3" /> Eco
                      </span>
                    )}
                  </div>
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-2">
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                    {product.name?.english}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                    {product.name?.hindi}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">
                          ₹{product.discountPrice || product.price}
                        </span>
                        {product.mrp && product.mrp > (product.discountPrice || product.price) && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.mrp}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="ml-1 text-sm font-medium text-gray-900">
                        {product.ratings?.average?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    Stock:{" "}
                    <span
                      className={`font-semibold ${
                        product.stock > 10
                          ? "text-green-600"
                          : product.stock > 0
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {product.stock > 0 ? `${product.stock} units` : "Out of Stock"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(product._id)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        product.featured
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      title={product.featured ? "Remove from featured" : "Add to featured"}
                    >
                      <Star className={`w-4 h-4 ${product.featured ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteModal({
                          show: true,
                          id: product._id,
                          name: product.name?.english,
                        })
                      }
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({total} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<strong>{deleteModal.name}</strong>"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, id: null, name: "" })}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
