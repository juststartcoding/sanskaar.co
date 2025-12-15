import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader,
  Star,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";

const PoojaManagement = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const [poojas, setPoojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: "" });
  const [refreshing, setRefreshing] = useState(false);

  const categories = ["Daily", "Festival", "Occasion", "Sanatan", "Other"];

  useEffect(() => {
    loadPoojas();
  }, [currentPage, searchTerm, filterActive, filterCategory]);

  const loadPoojas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (filterActive !== "all")
        params.append("isActive", filterActive === "active");
      if (filterCategory !== "all") params.append("category", filterCategory);

      const response = await api.get(`/admin/poojas?${params.toString()}`);

      setPoojas(response.data.poojas || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Error loading poojas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPoojas();
    setRefreshing(false);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/poojas/${id}/toggle-status`);
      loadPoojas();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Failed to update status");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/poojas/${deleteModal.id}`);
      setDeleteModal({ show: false, id: null, name: "" });
      loadPoojas();
    } catch (error) {
      console.error("Error deleting pooja:", error);
      alert("Failed to delete pooja");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pooja Management</h1>
          <p className="text-gray-600 mt-1">
            Manage all poojas, steps, and samagri • {total} total poojas
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
            to="/admin/poojas/add"
            className="flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add New Pooja
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search poojas..."
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
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
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

      {/* Poojas Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : poojas.length === 0 ? (
          <div className="text-center p-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No poojas found</p>
            <Link
              to="/admin/poojas/add"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Your First Pooja
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pooja
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Steps
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Samagri
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {poojas.map((pooja) => (
                    <tr
                      key={pooja._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {pooja.mainImage ? (
                            <img
                              src={pooja.mainImage}
                              alt={pooja.poojaType}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-orange-600" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">
                              {pooja.poojaType}
                            </div>
                            <div className="text-sm text-gray-500">
                              {pooja.duration || "Duration not set"}
                            </div>
                          </div>
                          {pooja.featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {pooja.category || "Other"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>🇮🇳 {pooja.steps?.hindi?.length || 0}</div>
                          <div>🕉 {pooja.steps?.sanskrit?.length || 0}</div>
                          <div>🇬🇧 {pooja.steps?.english?.length || 0}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {pooja.samagri?.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">
                              {pooja.samagri.length} items
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">{pooja.views || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-gray-600">
                              {pooja.ratings?.average?.toFixed(1) || "0.0"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            handleToggleStatus(pooja._id, pooja.isActive)
                          }
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            pooja.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {pooja.isActive ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/poojas/edit/${pooja._id}`)
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                show: true,
                                id: pooja._id,
                                name: pooja.poojaType,
                              })
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
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
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
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
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Delete Pooja
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<strong>{deleteModal.name}</strong>"?
              This will also remove all associated steps and samagri. This action cannot be undone.
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

export default PoojaManagement;
