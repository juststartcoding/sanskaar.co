import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Search,
  MapPin,
  Eye,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import api from "../../services/api";


const TempleManagement = () => {
  const navigate = useNavigate();
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [filterDeity, setFilterDeity] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  const states = [
    "all",
    "Uttar Pradesh",
    "Maharashtra",
    "Karnataka",
    "Tamil Nadu",
    "Andhra Pradesh",
    "Gujarat",
    "Rajasthan",
    "Madhya Pradesh",
    "West Bengal",
    "Delhi",
    "Kerala",
    "Punjab",
    "Haryana",
    "Odisha",
  ];

  const deities = [
    "all",
    "Lord Shiva",
    "Lord Vishnu",
    "Lord Ganesha",
    "Goddess Durga",
    "Goddess Kali",
    "Lord Hanuman",
    "Goddess Lakshmi",
    "Lord Krishna",
    "Lord Rama",
    "Lord Venkateswara",
  ];

  useEffect(() => {
    loadTemples();
  }, [currentPage, searchTerm, filterState, filterDeity]);

  const loadTemples = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (filterState !== "all") params.append("state", filterState);
      if (filterDeity !== "all") params.append("deity", filterDeity);

      const response = await api.get(`/admin/temples?${params.toString()}`);

      setTemples(response.data.temples || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error loading temples:", error);
      alert("Failed to load temples");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await api.patch(`/admin/temples/${id}/toggle-featured`);
      loadTemples();
    } catch (error) {
      console.error("Error toggling featured:", error);
      alert("Failed to update featured status");
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/admin/temples/${id}/toggle-active`);
      loadTemples();
    } catch (error) {
      console.error("Error toggling active:", error);
      alert("Failed to update active status");
    }
  };

  const handleVerify = async (id) => {
    try {
      await api.patch(`/admin/temples/${id}/verify`);
      loadTemples();
    } catch (error) {
      console.error("Error verifying temple:", error);
      alert("Failed to verify temple");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/temples/${deleteModal.id}`);
      setDeleteModal({ show: false, id: null });
      loadTemples();
    } catch (error) {
      console.error("Error deleting temple:", error);
      alert("Failed to delete temple");
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Temple Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage temple listings and information
            </p>
          </div>
          <Link
            to="/admin/temples/add"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add New Temple
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search temples..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>

            {/* State Filter */}
            <select
              value={filterState}
              onChange={(e) => {
                setFilterState(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              {states.map((state) => (
                <option key={state} value={state}>
                  {state === "all" ? "All States" : state}
                </option>
              ))}
            </select>

            {/* Deity Filter */}
            <select
              value={filterDeity}
              onChange={(e) => {
                setFilterDeity(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              {deities.map((deity) => (
                <option key={deity} value={deity}>
                  {deity === "all" ? "All Deities" : deity}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : temples.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Temples Found
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first temple
            </p>
            <Link
              to="/admin/temples/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Temple
            </Link>
          </div>
        ) : (
          /* Temples Table */
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Temple
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {temples.map((temple) => (
                      <tr key={temple._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={
                                temple.mainImage ||
                                "https://via.placeholder.com/100"
                              }
                              alt={temple.name.english}
                              className="w-12 h-12 rounded-lg object-cover mr-3"
                            />
                            <div>
                              <div className="font-medium text-gray-900">
                                {temple.name.english}
                              </div>
                              <div className="text-sm text-gray-500">
                                {temple.name.hindi}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-900">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                            {temple.location?.city}, {temple.location?.state}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {temple.mainDeity}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleToggleFeatured(temple._id)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                temple.featured
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <Star
                                className={`w-3 h-3 ${
                                  temple.featured ? "fill-current" : ""
                                }`}
                              />
                              {temple.featured ? "Featured" : "Not Featured"}
                            </button>
                            <button
                              onClick={() => handleToggleActive(temple._id)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                temple.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {temple.isActive ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {temple.isActive ? "Active" : "Inactive"}
                            </button>
                            {!temple.isVerified && (
                              <button
                                onClick={() => handleVerify(temple._id)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Verify
                              </button>
                            )}
                            {temple.isVerified && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Eye className="w-4 h-4 mr-1" />
                            {temple.views || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                navigate(`/admin/temples/edit/${temple._id}`)
                              }
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteModal({ show: true, id: temple._id })
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
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Temple?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this temple? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, id: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

export default TempleManagement;
