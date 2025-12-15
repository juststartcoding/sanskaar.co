import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader, Plus, Trash2, Save } from "lucide-react";
import api from "../../services/api";


const AddTemple = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: { english: "", hindi: "" },
    mainDeity: "Lord Shiva",
    otherDeities: [],
    location: {
      address: "",
      city: "",
      state: "Uttar Pradesh",
      country: "India",
      pincode: "",
      coordinates: { latitude: "", longitude: "" },
    },
    description: { english: "", hindi: "" },
    history: { english: "", hindi: "" },
    significance: { english: "", hindi: "" },
    mainImage: "",
    images: [],
    timings: {
      morning: { opening: "", closing: "" },
      evening: { opening: "", closing: "" },
      specialDays: "",
    },
    contact: { phone: "", email: "", website: "" },
    entryFee: { indian: 0, foreign: 0 },
    bestTimeToVisit: "Morning",
    dressCode: "",
    facilities: [],
    rituals: [],
    specialPoojas: [],
    festivals: [],
    architecture: { style: "", builtIn: "", builtBy: "" },
    rules: [],
    dosDonts: { dos: [], donts: [] },
    howToReach: { byAir: "", byTrain: "", byRoad: "" },
    isActive: true,
    featured: false,
  });

  const deities = [
    "Lord Shiva",
    "Lord Vishnu",
    "Lord Ganesha",
    "Goddess Durga",
    "Goddess Kali",
    "Lord Hanuman",
    "Goddess Lakshmi",
    "Goddess Saraswati",
    "Lord Krishna",
    "Lord Rama",
    "Lord Brahma",
    "Lord Kartikeya",
    "Lord Ayyappa",
    "Lord Venkateswara",
    "Goddess Parvati",
    "Other",
  ];

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu and Kashmir",
  ];

  const availableFacilities = [
    "Parking",
    "Drinking Water",
    "Prasad Counter",
    "Donation Counter",
    "Wheelchair Access",
    "Restrooms",
    "Shoe Stand",
    "Cloakroom",
    "Photography Allowed",
    "Dharmashala",
    "Annadanam",
  ];

  useEffect(() => {
    if (isEdit) {
      loadTemple();
    }
  }, [id]);

  const loadTemple = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/temples/${id}`);
      if (response.data.success) {
        setFormData(response.data.temple);
      }
    } catch (error) {
      console.error("Error loading temple:", error);
      alert("Failed to load temple");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const keys = name.split(".");
      setFormData((prev) => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = type === "checkbox" ? checked : value;
        return newData;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleFacilityToggle = (facility) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const addRitual = () => {
    setFormData((prev) => ({
      ...prev,
      rituals: [
        ...prev.rituals,
        { name: "", time: "", days: [], description: "" },
      ],
    }));
  };

  const removeRitual = (index) => {
    setFormData((prev) => ({
      ...prev,
      rituals: prev.rituals.filter((_, i) => i !== index),
    }));
  };

  const updateRitual = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      rituals: prev.rituals.map((ritual, i) =>
        i === index ? { ...ritual, [field]: value } : ritual
      ),
    }));
  };

  const addFestival = () => {
    setFormData((prev) => ({
      ...prev,
      festivals: [...prev.festivals, { name: "", month: "", description: "" }],
    }));
  };

  const removeFestival = (index) => {
    setFormData((prev) => ({
      ...prev,
      festivals: prev.festivals.filter((_, i) => i !== index),
    }));
  };

  const updateFestival = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      festivals: prev.festivals.map((festival, i) =>
        i === index ? { ...festival, [field]: value } : festival
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Generate slug from English name
      const slug = formData.name.english
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const templeData = {
        ...formData,
        slug,
      };

      if (isEdit) {
        await api.put(`/admin/temples/${id}`, templeData);
        alert("Temple updated successfully!");
      } else {
        await api.post("/admin/temples", templeData);
        alert("Temple added successfully!");
      }

      navigate("/admin/temples");
    } catch (error) {
      console.error("Error saving temple:", error);
      alert(error.response?.data?.message || "Failed to save temple");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Edit Temple" : "Add New Temple"}
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the temple information below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temple Name (English) *
                </label>
                <input
                  type="text"
                  name="name.english"
                  value={formData.name.english}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temple Name (Hindi) *
                </label>
                <input
                  type="text"
                  name="name.hindi"
                  value={formData.name.hindi}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Deity *
                </label>
                <select
                  name="mainDeity"
                  value={formData.mainDeity}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {deities.map((deity) => (
                    <option key={deity} value={deity}>
                      {deity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Image URL *
                </label>
                <input
                  type="url"
                  name="mainImage"
                  value={formData.mainImage}
                  onChange={handleChange}
                  required
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (English) *
              </label>
              <textarea
                name="description.english"
                value={formData.description.english}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Hindi)
              </label>
              <textarea
                name="description.hindi"
                value={formData.description.hindi}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {indianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="location.pincode"
                    value={formData.location.pincode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Timings</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Morning</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Opening
                    </label>
                    <input
                      type="time"
                      name="timings.morning.opening"
                      value={formData.timings.morning.opening}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Closing
                    </label>
                    <input
                      type="time"
                      name="timings.morning.closing"
                      value={formData.timings.morning.closing}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Evening</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Opening
                    </label>
                    <input
                      type="time"
                      name="timings.evening.opening"
                      value={formData.timings.evening.opening}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Closing
                    </label>
                    <input
                      type="time"
                      name="timings.evening.closing"
                      value={formData.timings.evening.closing}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Entry Fee */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Contact & Entry Fee
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="contact.website"
                  value={formData.contact.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entry Fee (Indian) ₹
                </label>
                <input
                  type="number"
                  name="entryFee.indian"
                  value={formData.entryFee.indian}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entry Fee (Foreign) ₹
                </label>
                <input
                  type="number"
                  name="entryFee.foreign"
                  value={formData.entryFee.foreign}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Best Time to Visit
                </label>
                <select
                  name="bestTimeToVisit"
                  value={formData.bestTimeToVisit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Anytime">Anytime</option>
                  <option value="Festivals">During Festivals</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dress Code
              </label>
              <input
                type="text"
                name="dressCode"
                value={formData.dressCode}
                onChange={handleChange}
                placeholder="e.g., Traditional dress preferred"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Facilities</h2>

            <div className="grid md:grid-cols-3 gap-3">
              {availableFacilities.map((facility) => (
                <label
                  key={facility}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.facilities.includes(facility)}
                    onChange={() => handleFacilityToggle(facility)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{facility}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rituals */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Rituals</h2>
              <button
                type="button"
                onClick={addRitual}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Plus className="w-4 h-4" />
                Add Ritual
              </button>
            </div>

            {formData.rituals.map((ritual, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 mb-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-900">
                    Ritual {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeRitual(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Ritual name"
                    value={ritual.name}
                    onChange={(e) =>
                      updateRitual(index, "name", e.target.value)
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Time (e.g., 6:00 AM)"
                    value={ritual.time}
                    onChange={(e) =>
                      updateRitual(index, "time", e.target.value)
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <textarea
                    placeholder="Description"
                    value={ritual.description}
                    onChange={(e) =>
                      updateRitual(index, "description", e.target.value)
                    }
                    className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows="2"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Festivals */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Festivals</h2>
              <button
                type="button"
                onClick={addFestival}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Plus className="w-4 h-4" />
                Add Festival
              </button>
            </div>

            {formData.festivals.map((festival, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 mb-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-900">
                    Festival {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeFestival(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Festival name"
                    value={festival.name}
                    onChange={(e) =>
                      updateFestival(index, "name", e.target.value)
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Month"
                    value={festival.month}
                    onChange={(e) =>
                      updateFestival(index, "month", e.target.value)
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <textarea
                    placeholder="Description"
                    value={festival.description}
                    onChange={(e) =>
                      updateFestival(index, "description", e.target.value)
                    }
                    className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows="2"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Status</h2>

            <div className="flex gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Featured</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  {isEdit ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEdit ? "Update Temple" : "Add Temple"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/temples")}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTemple;
