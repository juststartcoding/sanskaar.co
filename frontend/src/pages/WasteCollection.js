import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf,
  Calendar,
  MapPin,
  Package,
  Upload,
  Clock,
  CheckCircle,
  Truck,
  Info,
  Loader,
} from "lucide-react";
import api from "../services/api";

const WasteCollection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemType: "",
    quantity: "",
    quantityUnit: "kg",
    source: "household",
    pickupAddress: "",
    city: "",
    state: "",
    pincode: "",
    preferredDate: "",
    preferredTime: "",
    phone: "",
    notes: "",
    priority: "normal",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.itemType ||
      !formData.quantity ||
      !formData.pickupAddress ||
      !formData.phone
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      console.log("📤 Submitting waste request...");

      // Prepare request data
      const requestData = {
        itemType: formData.itemType,
        quantity: {
          amount: parseFloat(formData.quantity),
          unit: formData.quantityUnit,
        },
        source: formData.source,
        address: {
          street: formData.pickupAddress,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        phone: formData.phone,
        notes: formData.notes,
        priority: formData.priority,
      };

      console.log("Request Data:", requestData);

      const response = await api.post("/waste/requests", requestData);
      console.log("✅ Request submitted:", response.data);

      setRequestId(response.data.request._id);
      setSubmitted(true);
    } catch (error) {
      console.error("❌ Submit error:", error);
      alert(
        "Failed to submit request: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const itemTypes = [
    {
      value: "flowers",
      label: "Flowers",
      icon: "🌸",
      description: "Fresh or dried flowers",
    },
    {
      value: "leaves",
      label: "Leaves & Garlands",
      icon: "🍃",
      description: "Leaves, garlands, rangoli materials",
    },
    {
      value: "coconut",
      label: "Coconut Shells",
      icon: "🥥",
      description: "Coconut shells and husks",
    },
    {
      value: "cloth",
      label: "Cloth/Fabric",
      icon: "🧵",
      description: "Old cloth, sarees, dhoti",
    },
    {
      value: "incense",
      label: "Incense Sticks",
      icon: "🔥",
      description: "Used incense sticks and ash",
    },
    {
      value: "oil",
      label: "Oil Lamps",
      icon: "🪔",
      description: "Used oil from diyas",
    },
    {
      value: "paper",
      label: "Paper Items",
      icon: "📄",
      description: "Calendars, posters, religious books",
    },
    {
      value: "idols",
      label: "Eco Idols",
      icon: "🗿",
      description: "Clay idols for immersion",
    },
    {
      value: "other",
      label: "Other Pooja Waste",
      icon: "♻️",
      description: "Other religious waste items",
    },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Request Submitted Successfully! 🎉
            </h2>

            <p className="text-gray-600 mb-2">
              Your waste collection request has been received.
            </p>

            {requestId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800 font-semibold">
                  Request ID:
                </p>
                <p className="text-lg text-green-900 font-mono">{requestId}</p>
              </div>
            )}

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Our team will review your request</li>
                    <li>You'll receive a confirmation call/SMS</li>
                    <li>Collection will be scheduled as per your preference</li>
                    <li>You can track status in "My Requests"</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    itemType: "",
                    quantity: "",
                    quantityUnit: "kg",
                    source: "household",
                    pickupAddress: "",
                    city: "",
                    state: "",
                    pincode: "",
                    preferredDate: "",
                    preferredTime: "",
                    phone: "",
                    notes: "",
                    priority: "normal",
                  });
                }}
                className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Submit Another Request
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Eco-Friendly Waste Collection
          </h1>
          <p className="text-lg text-gray-600">
            Dispose your pooja waste responsibly. We'll collect and recycle it
            in an eco-friendly way.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
            <Leaf className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Eco-Friendly</h3>
            <p className="text-sm text-gray-600">
              100% environmentally safe disposal and recycling
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
            <Truck className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Free Pickup</h3>
            <p className="text-sm text-gray-600">
              Doorstep collection at your preferred time
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
            <CheckCircle className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Quick Service</h3>
            <p className="text-sm text-gray-600">
              Collection within 24-48 hours
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Item Type Selection */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              What would you like to dispose?{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {itemTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, itemType: type.value })
                  }
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.itemType === type.value
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="font-semibold text-gray-900 text-sm mb-1">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                step="0.1"
                min="0.1"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter quantity"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Unit
              </label>
              <select
                name="quantityUnit"
                value={formData.quantityUnit}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="bags">Bags</option>
                <option value="pieces">Pieces</option>
                <option value="bundles">Bundles</option>
              </select>
            </div>
          </div>

          {/* Source */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Source
            </label>
            <div className="grid grid-cols-3 gap-4">
              {["household", "temple", "event"].map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => setFormData({ ...formData, source })}
                  className={`px-4 py-3 rounded-lg border-2 font-medium capitalize transition-all ${
                    formData.source === source
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-700 hover:border-green-300"
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          {/* Pickup Address */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Pickup Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="pickupAddress"
              value={formData.pickupAddress}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter complete pickup address"
            />
          </div>

          {/* City, State, Pincode */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="State"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                maxLength="6"
                pattern="[0-9]{6}"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Pincode"
              />
            </div>
          </div>

          {/* Preferred Date & Time */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Preferred Date
              </label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Preferred Time
              </label>
              <select
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select time slot</option>
                <option value="morning">Morning (8 AM - 12 PM)</option>
                <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                <option value="evening">Evening (4 PM - 8 PM)</option>
              </select>
            </div>
          </div>

          {/* Phone */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Contact Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              maxLength="10"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="10-digit mobile number"
            />
          </div>

          {/* Priority */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "low", label: "Low", color: "blue" },
                { value: "normal", label: "Normal", color: "green" },
                { value: "high", label: "High", color: "red" },
              ].map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, priority: priority.value })
                  }
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    formData.priority === priority.value
                      ? `border-${priority.color}-600 bg-${priority.color}-50 text-${priority.color}-700`
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Any special instructions or requirements..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6" />
                Submit Collection Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WasteCollection;
