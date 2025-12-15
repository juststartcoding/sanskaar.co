import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  Calendar,
  Phone,
  Video,
  Filter,
  CheckCircle,
} from "lucide-react";

const Pandits = () => {
  const [pandits, setPandits] = useState([]);
  const [filteredPandits, setFilteredPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");

  useEffect(() => {
    loadPandits();
  }, []);

  useEffect(() => {
    filterPandits();
  }, [
    searchTerm,
    selectedSpecialty,
    selectedLanguage,
    selectedRegion,
    pandits,
  ]);

  const loadPandits = async () => {
    try {
      setLoading(true);
      console.log("📥 Loading pandits...");

      // Fetch from backend API
      const response = await fetch("http://localhost:5000/api/pandits");
      const data = await response.json();

      console.log("✅ Pandits loaded:", data);

      // Extract pandits array from response
      const panditList = data.pandits || data || [];

      console.log("Total pandits:", panditList.length);

      setPandits(panditList);
      setFilteredPandits(panditList);
    } catch (error) {
      console.error("❌ Failed to load pandits:", error);
      setPandits([]);
      setFilteredPandits([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPandits = () => {
    if (!Array.isArray(pandits) || pandits.length === 0) {
      setFilteredPandits([]);
      return;
    }

    let filtered = [...pandits];

    if (searchTerm) {
      filtered = filtered.filter(
        (pandit) =>
          (pandit.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (pandit.specialties || []).some((s) =>
            s.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (selectedSpecialty !== "all") {
      filtered = filtered.filter(
        (pandit) =>
          Array.isArray(pandit.specialties) &&
          pandit.specialties.includes(selectedSpecialty)
      );
    }

    if (selectedLanguage !== "all") {
      filtered = filtered.filter(
        (pandit) =>
          Array.isArray(pandit.languages) &&
          pandit.languages.includes(selectedLanguage)
      );
    }

    if (selectedRegion !== "all") {
      filtered = filtered.filter((pandit) => pandit.region === selectedRegion);
    }

    setFilteredPandits(filtered);
  };

  const specialties = [
    "all",
    "Ganesh Pooja",
    "Wedding Ceremonies",
    "Grih Pravesh",
    "Satyanarayan Katha",
    "Durga Pooja",
    "All Rituals",
  ];
  const languages = [
    "all",
    "Hindi",
    "English",
    "Sanskrit",
    "Marathi",
    "Gujarati",
    "Tamil",
    "Telugu",
  ];
  const regions = [
    "all",
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Pune",
    "Ahmedabad",
    "Chennai",
    "Kolkata",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Book Verified Pandits
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Experienced priests for your home or temple ceremonies
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-4 lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Specialty Filter */}
            <div>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty === "all" ? "All Specialties" : specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === "all" ? "All Languages" : lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-gray-600">
              Showing{" "}
              <span className="font-semibold">{filteredPandits.length}</span>{" "}
              pandits
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedSpecialty("all");
                setSelectedLanguage("all");
                setSelectedRegion("all");
              }}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Pandits Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl h-96 animate-pulse"
              ></div>
            ))}
          </div>
        ) : filteredPandits.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No pandits found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search for different criteria
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h4 className="font-semibold text-orange-900 mb-2">
                Coming Soon!
              </h4>
              <p className="text-orange-800">
                We're onboarding verified pandits in your area. Check back soon
                or contact us to register as a pandit.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPandits.map((pandit) => (
              <div
                key={pandit._id}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="p-6">
                  {/* Profile Section */}
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={
                        pandit.profilePhoto || "https://via.placeholder.com/100"
                      }
                      alt={pandit.name || "Pandit"}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {pandit.name || "Pandit Name"}
                        </h3>
                        {pandit.verified && (
                          <CheckCircle
                            className="w-5 h-5 text-blue-600"
                            title="Verified"
                          />
                        )}
                      </div>
                      <div className="flex items-center text-yellow-500 mb-2">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="ml-1 text-sm text-gray-600">
                          {pandit.ratings?.average?.toFixed(1) || "4.8"} (
                          {pandit.ratings?.count || 0})
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {pandit.region || "Mumbai"}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Experience
                      </p>
                      <p className="text-sm text-gray-600">
                        {pandit.experience || "10+"} years
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Languages
                      </p>
                      <p className="text-sm text-gray-600">
                        {Array.isArray(pandit.languages)
                          ? pandit.languages.join(", ")
                          : "Hindi, English, Sanskrit"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Specialties
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(Array.isArray(pandit.specialties)
                          ? pandit.specialties
                          : ["All Rituals"]
                        )
                          .slice(0, 3)
                          .map((specialty, idx) => (
                            <span
                              key={idx}
                              className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs"
                            >
                              {specialty}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Starting from
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        ₹{pandit.baseFee || "1,500"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="w-4 h-4" />
                      <span>In-person visits</span>
                    </div>
                    {pandit.virtualAvailable && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Video className="w-4 h-4" />
                        <span>Virtual pooja available</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/pandits/${pandit._id}`}
                      className="text-center bg-white text-orange-600 border-2 border-orange-600 py-2 rounded-lg hover:bg-orange-50 transition-colors font-medium"
                    >
                      View Profile
                    </Link>
                    <button className="bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA for Pandits */}
        <div className="mt-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Are you a Pandit?
          </h2>
          <p className="text-xl text-orange-100 mb-6 max-w-2xl mx-auto">
            Join our platform and connect with devotees looking for authentic
            rituals
          </p>
          <Link
            to="/pandit/register"
            className="inline-block bg-white text-orange-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
          >
            Register as Pandit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pandits;
