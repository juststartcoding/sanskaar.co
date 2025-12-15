import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { poojaAPI } from "../services/api";
import { Search, Filter, Star, Calendar, BookOpen, Loader } from "lucide-react";

const Poojas = () => {
  const [poojas, setPoojas] = useState([]);
  const [filteredPoojas, setFilteredPoojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  useEffect(() => {
    loadPoojas();
  }, []);

  useEffect(() => {
    filterPoojas();
  }, [searchTerm, selectedLanguage, poojas]);

  const loadPoojas = async () => {
    try {
      setLoading(true);
      console.log("🔍 Loading poojas from: /api/poojas");

      const response = await poojaAPI.getAll();
      console.log("📦 Raw response:", response);
      console.log("📊 Response data:", response.data);

      // Backend returns: { success: true, data: [...], totalPages, currentPage }
      // Extract poojas from response.data.data
      let poojasData = [];

      if (response.data) {
        // Check different response formats
        if (Array.isArray(response.data)) {
          // Format 1: Direct array
          poojasData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Format 2: { data: [...] }
          poojasData = response.data.data;
        } else if (
          response.data.poojas &&
          Array.isArray(response.data.poojas)
        ) {
          // Format 3: { poojas: [...] }
          poojasData = response.data.poojas;
        }
      }

      console.log("✅ Poojas loaded:", poojasData.length);
      console.log("📋 First pooja:", poojasData[0]);

      setPoojas(poojasData);
      setFilteredPoojas(poojasData);
    } catch (error) {
      console.error("❌ Failed to load poojas:", error);
      console.error("❌ Error response:", error.response?.data);
      setPoojas([]);
      setFilteredPoojas([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPoojas = () => {
    if (!Array.isArray(poojas) || poojas.length === 0) {
      setFilteredPoojas([]);
      return;
    }

    let filtered = [...poojas];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (pooja) =>
          (pooja.poojaType || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (pooja.importance?.english || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (pooja.importance?.hindi || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Language filter
    if (selectedLanguage !== "all") {
      filtered = filtered.filter(
        (pooja) => pooja.poojaLanguage === selectedLanguage
      );
    }

    setFilteredPoojas(filtered);
  };

  const languages = [
    { value: "all", label: "All Languages" },
    { value: "hindi", label: "हिंदी" },
    { value: "sanskrit", label: "संस्कृत" },
    { value: "english", label: "English" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            🕉️ Discover Authentic Poojas
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Step-by-step guidance for traditional Hindu rituals with mantras and
            meanings
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search poojas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Language Filter */}
            <div>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredPoojas.length} of {poojas.length} poojas
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : filteredPoojas.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Poojas Found
            </h3>
            <p className="text-gray-600 mb-6">
              {poojas.length === 0
                ? "No poojas available yet. Check back soon!"
                : "Try adjusting your search or filters"}
            </p>
            {poojas.length === 0 && (
              <Link
                to="/admin/poojas"
                className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Add First Pooja (Admin)
              </Link>
            )}
          </div>
        ) : (
          /* Pooja Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPoojas.map((pooja) => (
              <Link
                key={pooja._id}
                to={`/pooja/${pooja._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Pooja Card */}
                <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-2">🕉️</div>
                    <h3 className="text-2xl font-bold">{pooja.poojaType}</h3>
                  </div>
                </div>

                <div className="p-6">
                  {/* Language Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {pooja.poojaLanguage}
                    </span>
                    {pooja.isActive && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Importance */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {pooja.importance?.english ||
                      pooja.importance?.hindi ||
                      pooja.importance?.sanskrit ||
                      "Traditional Hindu ritual"}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>
                          {(pooja.steps?.hindi?.length || 0) +
                            (pooja.steps?.sanskrit?.length || 0) +
                            (pooja.steps?.english?.length || 0)}{" "}
                          steps
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>
                          {pooja.ratings?.average?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                    </div>
                    <div className="text-orange-600 font-semibold">
                      View Details →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Poojas;
