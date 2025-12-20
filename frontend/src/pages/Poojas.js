import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { poojaAPI } from "../services/api";
import { Search, Filter, Star, Clock, BookOpen, Loader, Users } from "lucide-react";

const Poojas = () => {
  const [poojas, setPoojas] = useState([]);
  const [filteredPoojas, setFilteredPoojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadPoojas();
  }, []);

  useEffect(() => {
    filterPoojas();
  }, [searchTerm, selectedCategory, poojas]);

  const loadPoojas = async () => {
    try {
      setLoading(true);
      const response = await poojaAPI.getAll();
      
      let poojasData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          poojasData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          poojasData = response.data.data;
        } else if (response.data.poojas && Array.isArray(response.data.poojas)) {
          poojasData = response.data.poojas;
        } else if (response.data.templates && Array.isArray(response.data.templates)) {
          poojasData = response.data.templates;
        }
      }

      setPoojas(poojasData);
      setFilteredPoojas(poojasData);
    } catch (error) {
      console.error("Failed to load poojas:", error);
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
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((pooja) => {
        const nameHi = pooja.name?.hi || pooja.poojaName?.hi || "";
        const nameEn = pooja.name?.en || pooja.poojaName?.en || pooja.poojaType || "";
        const descHi = pooja.description?.hi || pooja.importance?.hindi || "";
        const descEn = pooja.description?.en || pooja.importance?.english || "";
        
        return nameHi.includes(searchTerm) ||
               nameEn.toLowerCase().includes(term) ||
               descHi.includes(searchTerm) ||
               descEn.toLowerCase().includes(term);
      });
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((pooja) => pooja.category === selectedCategory);
    }

    setFilteredPoojas(filtered);
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "DAILY", label: "Daily Poojas" },
    { value: "FESTIVAL", label: "Festival Poojas" },
    { value: "SPECIAL", label: "Special Occasions" },
    { value: "NAVAGRAHA", label: "Navagraha" },
    { value: "SANATAN", label: "Sanatan" },
  ];

  // Helper to get display name
  const getDisplayName = (pooja) => {
    if (pooja.name?.hi) return pooja.name.hi;
    if (pooja.poojaName?.hi) return pooja.poojaName.hi;
    return pooja.poojaType || "Pooja";
  };

  const getEnglishName = (pooja) => {
    if (pooja.name?.en) return pooja.name.en;
    if (pooja.poojaName?.en) return pooja.poojaName.en;
    return pooja.poojaType || "";
  };

  const getDescription = (pooja) => {
    return pooja.short_description?.en || 
           pooja.description?.en || 
           pooja.importance?.english || 
           pooja.short_description?.hi ||
           pooja.description?.hi ||
           "Traditional Hindu ritual";
  };

  const getStepsCount = (pooja) => {
    if (pooja.templateSteps) return pooja.templateSteps.length;
    if (pooja.steps?.hindi) return pooja.steps.hindi.length;
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            🕉️ Discover Authentic Poojas
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Step-by-step guidance for traditional Hindu rituals with mantras and meanings
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

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
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
          </div>
        ) : (
          /* Pooja Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPoojas.map((pooja) => (
              <Link
                key={pooja._id}
                to={`/pooja/${pooja._id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Pooja Card Image */}
                <div className="h-48 relative">
                  {pooja.main_image_url || pooja.thumbnail_url ? (
                    <img 
                      src={pooja.main_image_url || pooja.thumbnail_url} 
                      alt={getDisplayName(pooja)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-6xl mb-2">🕉️</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  {pooja.isFeatured && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                      ⭐ Featured
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  {pooja.category && (
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 text-white text-xs rounded-full">
                      {pooja.category}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {getDisplayName(pooja)}
                  </h3>
                  <p className="text-sm text-orange-600 mb-3">
                    {getEnglishName(pooja)}
                  </p>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {getDescription(pooja)}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{getStepsCount(pooja)} steps</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{pooja.total_duration_minutes || 30} min</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{pooja.ratings?.average?.toFixed(1) || "5.0"}</span>
                    </div>
                  </div>

                  {/* Deity Info */}
                  {pooja.deity && (
                    <div className="mt-3 pt-3 border-t flex items-center gap-2">
                      {pooja.deity.icon_url && (
                        <img src={pooja.deity.icon_url} alt="" className="w-6 h-6 rounded-full" />
                      )}
                      <span className="text-sm text-gray-600">
                        {pooja.deity.name?.hi || pooja.deity.name?.en}
                      </span>
                    </div>
                  )}
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
