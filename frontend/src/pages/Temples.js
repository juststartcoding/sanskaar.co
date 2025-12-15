import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Clock,
  IndianRupee,
  Search,
  Filter,
  Loader,
} from "lucide-react";
import api from "../services/api";

const Temples = () => {
  const [temples, setTemples] = useState([]);
  const [filteredTemples, setFilteredTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [filterDeity, setFilterDeity] = useState("all");
  const [showFeatured, setShowFeatured] = useState(false);

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
  }, []);

  useEffect(() => {
    filterTemples();
  }, [searchTerm, filterState, filterDeity, showFeatured, temples]);

  const loadTemples = async () => {
    try {
      setLoading(true);
      console.log("🔍 Loading temples from: /api/temples");

      const response = await api.get("/temples");
      console.log("📦 Response:", response.data);

      // Handle different response formats
      let templesData = [];
      if (Array.isArray(response.data)) {
        templesData = response.data;
      } else if (
        response.data.temples &&
        Array.isArray(response.data.temples)
      ) {
        templesData = response.data.temples;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        templesData = response.data.data;
      }

      console.log("✅ Temples loaded:", templesData.length);

      setTemples(templesData);
      setFilteredTemples(templesData);
    } catch (error) {
      console.error("❌ Failed to load temples:", error);
      setTemples([]);
      setFilteredTemples([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTemples = () => {
    if (!Array.isArray(temples) || temples.length === 0) {
      setFilteredTemples([]);
      return;
    }

    let filtered = [...temples];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (temple) =>
          temple.name?.english
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          temple.name?.hindi
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          temple.location?.city
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          temple.location?.state
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // State filter
    if (filterState !== "all") {
      filtered = filtered.filter(
        (temple) => temple.location?.state === filterState
      );
    }

    // Deity filter
    if (filterDeity !== "all") {
      filtered = filtered.filter((temple) => temple.mainDeity === filterDeity);
    }

    // Featured filter
    if (showFeatured) {
      filtered = filtered.filter((temple) => temple.featured === true);
    }

    setFilteredTemples(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            🕉️ Sacred Temples
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Discover divine temples across India. Plan your spiritual journey.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search temples by name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>

            {/* State Filter */}
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
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
              onChange={(e) => setFilterDeity(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              {deities.map((deity) => (
                <option key={deity} value={deity}>
                  {deity === "all" ? "All Deities" : deity}
                </option>
              ))}
            </select>
          </div>

          {/* Featured Toggle */}
          <div className="mt-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFeatured}
                onChange={(e) => setShowFeatured(e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Show only featured temples
              </span>
            </label>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Found{" "}
            <span className="font-bold text-orange-600">
              {filteredTemples.length}
            </span>{" "}
            temples
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : filteredTemples.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Temples Found
            </h3>
            <p className="text-gray-600">
              {temples.length === 0
                ? "No temples available yet. Check back soon!"
                : "Try adjusting your filters to see more temples"}
            </p>
          </div>
        ) : (
          /* Temples Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemples.map((temple) => (
              <Link
                key={temple._id}
                to={`/temples/${temple._id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 duration-300"
              >
                {/* Temple Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      temple.mainImage ||
                      temple.images?.[0] ||
                      temple.image ||
                      `https://via.placeholder.com/400x300/f97316/ffffff?text=${encodeURIComponent(temple.name?.english || 'Temple')}`
                    }
                    alt={temple.name?.english}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://via.placeholder.com/400x300/f97316/ffffff?text=${encodeURIComponent(temple.name?.english || 'Temple')}`;
                    }}
                  />
                  {temple.featured && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  )}
                  {!temple.isActive && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Closed
                    </div>
                  )}
                </div>

                {/* Temple Info */}
                <div className="p-5">
                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                    {temple.name?.english}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                    {temple.name?.hindi}
                  </p>

                  {/* Deity */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                      {temple.mainDeity}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-600" />
                    <span className="line-clamp-2">
                      {temple.location?.city}, {temple.location?.state}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {temple.description?.english ||
                      "Sacred temple with rich history"}
                  </p>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {/* Timings */}
                    {temple.timings?.morning?.opening && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{temple.timings.morning.opening}</span>
                      </div>
                    )}

                    {/* Entry Fee */}
                    <div className="flex items-center gap-1 text-xs font-semibold text-orange-600">
                      <IndianRupee className="w-3 h-3" />
                      {temple.entryFee?.indian === 0
                        ? "Free Entry"
                        : `₹${temple.entryFee?.indian}`}
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button className="w-full mt-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all font-semibold">
                    View Details
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Featured Section */}
        {!showFeatured && temples.filter((t) => t.featured).length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                ⭐ Featured Temples
              </h2>
              <button
                onClick={() => setShowFeatured(true)}
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                View All →
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {temples
                .filter((t) => t.featured)
                .slice(0, 3)
                .map((temple) => (
                  <Link
                    key={temple._id}
                    to={`/temples/${temple._id}`}
                    className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <h3 className="font-bold text-gray-900">
                        {temple.name?.english}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {temple.location?.city}, {temple.location?.state}
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Temples;
