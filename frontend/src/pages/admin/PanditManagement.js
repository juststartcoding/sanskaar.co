import React, { useState, useEffect } from "react";

import {
  Search,
  User,
  Phone,
  Mail,
  Star,
  MapPin,
  CheckCircle,
  XCircle,
  Loader,
  Eye,
  Filter,
  Calendar,
  Award,
  Globe,
} from "lucide-react";
import api from "../../services/api";

const PanditManagement = () => {
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, pending, approved, rejected
  const [selectedPandit, setSelectedPandit] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPandits();
  }, [searchTerm, filterStatus]);

  const loadPandits = async () => {
    try {
      setLoading(true);
      console.log("📥 Loading pandits...");

      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);

      const response = await api.get(`/admin/pandits?${params.toString()}`);
      console.log("✅ Pandits loaded:", response.data);

      let panditList = response.data.pandits || [];

      // Filter by status
      if (filterStatus !== "all") {
        panditList = panditList.filter((p) => {
          if (filterStatus === "pending") return !p.isApproved;
          if (filterStatus === "approved") return p.isApproved && p.isActive;
          if (filterStatus === "rejected")
            return p.isApproved === false && p.rejectedAt;
          return true;
        });
      }

      setPandits(panditList);
    } catch (error) {
      console.error("❌ Error loading pandits:", error);
      alert(
        "Failed to load pandits: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (pandit) => {
    setSelectedPandit(pandit);
    setShowModal(true);
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this pandit?"))
      return;

    try {
      console.log("✅ Approving pandit:", id);
      await api.patch(`/admin/pandits/${id}/approve`);
      alert("Pandit approved successfully!");
      loadPandits();
      setShowModal(false);
    } catch (error) {
      console.error("❌ Approve error:", error);
      alert(
        "Failed to approve: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this pandit?")) return;

    try {
      console.log("❌ Rejecting pandit:", id);
      await api.patch(`/admin/pandits/${id}/reject`);
      alert("Pandit rejected!");
      loadPandits();
      setShowModal(false);
    } catch (error) {
      console.error("❌ Reject error:", error);
      alert(
        "Failed to reject: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      console.log("🔄 Toggling active status:", id);
      await api.patch(`/admin/pandits/${id}/toggle-active`);
      alert(
        `Pandit ${currentStatus ? "deactivated" : "activated"} successfully!`
      );
      loadPandits();
    } catch (error) {
      console.error("❌ Toggle error:", error);
      alert(
        "Failed to toggle status: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const filteredPandits = pandits;

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center h-96">
          <Loader className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Pandit Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage pandit registrations and approvals
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pandits</p>
                <p className="text-3xl font-bold text-gray-900">
                  {pandits.length}
                </p>
              </div>
              <User className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-gray-900">
                  {pandits.filter((p) => p.isApproved && p.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">
                  {pandits.filter((p) => !p.isApproved).length}
                </p>
              </div>
              <Loader className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-3xl font-bold text-gray-900">
                  {pandits.filter((p) => !p.isActive).length}
                </p>
              </div>
              <XCircle className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pandits List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredPandits.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No pandits found</p>
              <p className="text-gray-400 text-sm">
                Pandits will appear here once they register
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pandit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPandits.map((pandit) => (
                    <tr key={pandit._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-orange-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {pandit.name || "N/A"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {pandit.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {pandit.phone || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {pandit.specialization &&
                          pandit.specialization.length > 0 ? (
                            pandit.specialization
                              .slice(0, 2)
                              .map((spec, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                                >
                                  {spec}
                                </span>
                              ))
                          ) : (
                            <span className="text-sm text-gray-400">None</span>
                          )}
                          {pandit.specialization &&
                            pandit.specialization.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{pandit.specialization.length - 2}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm">
                          <Award className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-gray-900">
                            {pandit.experience || 0} years
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {pandit.isApproved ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center w-fit">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center w-fit">
                              <Loader className="w-3 h-3 mr-1" />
                              Pending
                            </span>
                          )}
                          {pandit.isActive ? (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => viewDetails(pandit)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showModal && selectedPandit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Pandit Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedPandit.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedPandit.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedPandit.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedPandit.experience} years
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Specializations
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPandit.specialization &&
                    selectedPandit.specialization.length > 0 ? (
                      selectedPandit.specialization.map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full"
                        >
                          {spec}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-400">No specializations listed</p>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Languages
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPandit.languages &&
                    selectedPandit.languages.length > 0 ? (
                      selectedPandit.languages.map((lang, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full flex items-center"
                        >
                          <Globe className="w-4 h-4 mr-1" />
                          {lang}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-400">No languages listed</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                {selectedPandit.location && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Location
                    </h4>
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-gray-900">
                          {selectedPandit.location.city},{" "}
                          {selectedPandit.location.state}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedPandit.description && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Description
                    </h4>
                    <p className="text-gray-700">
                      {selectedPandit.description}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Current Status
                  </h4>
                  <div className="flex gap-3">
                    {selectedPandit.isApproved ? (
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
                        ✓ Approved
                      </span>
                    ) : (
                      <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold">
                        ⏳ Pending Approval
                      </span>
                    )}
                    {selectedPandit.isActive ? (
                      <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                        Active
                      </span>
                    ) : (
                      <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                {!selectedPandit.isApproved ? (
                  <>
                    <button
                      onClick={() => handleReject(selectedPandit._id)}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedPandit._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                    >
                      Approve Pandit
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      handleToggleActive(
                        selectedPandit._id,
                        selectedPandit.isActive
                      )
                    }
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedPandit.isActive
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {selectedPandit.isActive ? "Deactivate" : "Activate"}
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanditManagement;
