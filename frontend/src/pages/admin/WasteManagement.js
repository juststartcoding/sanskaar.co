import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Trash,
  Calendar,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Loader,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";


const WasteManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [assignModal, setAssignModal] = useState({
    show: false,
    requestId: null,
  });

  useEffect(() => {
    loadRequests();
  }, [currentPage, filterStatus, filterPriority]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      console.log("📥 Loading waste requests...");

      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
      });

      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterPriority !== "all") params.append("priority", filterPriority);

      const response = await api.get(
        `/admin/waste-requests?${params.toString()}`
      );
      console.log("✅ Waste requests loaded:", response.data);

      setRequests(response.data.requests || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("❌ Error loading requests:", error);
      console.error("Error details:", error.response?.data);
      alert(
        "Failed to load waste requests: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (id) => {
    try {
      const response = await api.get(`/admin/waste-requests/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSelectedRequest(response.data);
    } catch (error) {
      console.error("Error loading request details:", error);
      alert("Failed to load request details");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(
        `/admin/waste-requests/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      loadRequests();
      if (selectedRequest && selectedRequest._id === id) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "normal":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in_progress":
        return <Loader className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/admin/dashboard"
                className="text-orange-600 hover:text-orange-700 text-sm mb-2 inline-block"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Waste Collection Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage waste collection requests
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="collected">Collected</option>
                <option value="processed">Processed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Filter
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              >
                <option value="all">All Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Trash className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No waste requests found</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Request ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Pickup Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Priority
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
                    {requests.map((request) => (
                      <tr
                        key={request._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm text-gray-900">
                            {request.trackingId || request._id.slice(-8)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {request.userId?.name || "Guest User"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.phone || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 line-clamp-2">
                              {request.address?.city}, {request.address?.state}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {request.preferredDate
                                ? new Date(
                                    request.preferredDate
                                  ).toLocaleDateString()
                                : "Not set"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(
                              request.priority
                            )}`}
                          >
                            {request.priority || "normal"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {getStatusIcon(request.status)}
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => viewDetails(request._id)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              View
                            </button>
                            {request.status === "pending" && (
                              <button
                                onClick={() =>
                                  updateStatus(request._id, "in_progress")
                                }
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Start
                              </button>
                            )}
                            {request.status === "in_progress" && (
                              <button
                                onClick={() =>
                                  updateStatus(request._id, "completed")
                                }
                                className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                              >
                                Complete
                              </button>
                            )}
                            {(request.status === "pending" ||
                              request.status === "in_progress") && (
                              <button
                                onClick={() =>
                                  updateStatus(request._id, "cancelled")
                                }
                                className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
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
              <div className="flex items-center justify-between bg-white rounded-xl shadow-md px-6 py-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
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

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Request Details
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-1">
                    Tracking ID
                  </h5>
                  <p className="text-gray-700 font-mono">
                    {selectedRequest.trackingId ||
                      selectedRequest._id.slice(-8)}
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-1">Status</h5>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                      selectedRequest.status
                    )}`}
                  >
                    {getStatusIcon(selectedRequest.status)}
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-1">
                  User Information
                </h5>
                <p className="text-gray-700">
                  {selectedRequest.userId?.name || "Guest User"}
                  {selectedRequest.phone && ` - ${selectedRequest.phone}`}
                  {selectedRequest.userId?.email &&
                    ` - ${selectedRequest.userId.email}`}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-1">Item Type</h5>
                <span className="inline-flex px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium capitalize">
                  {selectedRequest.itemType || "N/A"}
                </span>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-1">Quantity</h5>
                <p className="text-gray-700">
                  {selectedRequest.quantity?.amount}{" "}
                  {selectedRequest.quantity?.unit || "kg"}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-1">Source</h5>
                <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                  {selectedRequest.source || "household"}
                </span>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-1">
                  Pickup Address
                </h5>
                <p className="text-gray-700">
                  {selectedRequest.address?.street}
                  <br />
                  {selectedRequest.address?.city},{" "}
                  {selectedRequest.address?.state}
                  <br />
                  {selectedRequest.address?.pincode &&
                    `Pincode: ${selectedRequest.address.pincode}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-1">
                    Preferred Date
                  </h5>
                  <p className="text-gray-700">
                    {selectedRequest.preferredDate
                      ? new Date(
                          selectedRequest.preferredDate
                        ).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-1">
                    Preferred Time
                  </h5>
                  <p className="text-gray-700 capitalize">
                    {selectedRequest.preferredTime || "Not set"}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-1">Priority</h5>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(
                    selectedRequest.priority
                  )}`}
                >
                  {selectedRequest.priority || "normal"}
                </span>
              </div>

              {selectedRequest.notes && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-1">Notes</h5>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}

              {selectedRequest.assignedTo && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-1">
                    Assigned To
                  </h5>
                  <p className="text-gray-700">
                    {selectedRequest.assignedTo?.name || "N/A"}
                  </p>
                </div>
              )}

              {selectedRequest.collectedBy && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-1">
                    Collected By
                  </h5>
                  <p className="text-gray-700">
                    {selectedRequest.collectedBy?.name || "N/A"}
                  </p>
                </div>
              )}

              {selectedRequest.collectedAt && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-1">
                    Collected At
                  </h5>
                  <p className="text-gray-700">
                    {new Date(selectedRequest.collectedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Images</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRequest.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Waste ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              {selectedRequest.status === "pending" && (
                <button
                  onClick={() => {
                    updateStatus(selectedRequest._id, "scheduled");
                    setSelectedRequest(null);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Schedule Collection
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteManagement;
