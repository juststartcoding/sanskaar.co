import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  IndianRupee,
  Star,
  Calendar,
  Info,
  Navigation,
  Loader,
  ArrowLeft,
  CheckCircle,
  Camera,
  Users,
  Utensils,
} from "lucide-react";
import api from "../services/api";

const TempleDetail = () => {
  const { id } = useParams();
  const [temple, setTemple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadTemple();
  }, [id]);

  const loadTemple = async () => {
    try {
      setLoading(true);
      console.log("🔍 Loading temple:", id);

      const response = await api.get(`/temples/${id}`);
      console.log("✅ Temple loaded:", response.data);

      // Handle different response formats
      let templeData = null;
      if (response.data.temple) {
        templeData = response.data.temple;
      } else if (response.data.data) {
        templeData = response.data.data;
      } else {
        templeData = response.data;
      }

      setTemple(templeData);
    } catch (error) {
      console.error("❌ Failed to load temple:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!temple) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Temple Not Found
          </h2>
          <Link to="/temples" className="text-orange-600 hover:text-orange-700">
            ← Back to Temples
          </Link>
        </div>
      </div>
    );
  }

  const allImages = [temple.mainImage, ...(temple.images || [])].filter(
    Boolean
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/temples"
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Temples
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                {temple.name?.english}
              </h1>
              <p className="text-xl text-orange-100 mb-4">
                {temple.name?.hindi}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="w-5 h-5" />
                  <span>
                    {temple.location?.city}, {temple.location?.state}
                  </span>
                </div>
                {temple.featured && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    Featured
                  </div>
                )}
                {temple.isVerified && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {allImages.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid gap-4">
              {/* Main Image */}
              <div className="relative h-96 rounded-xl overflow-hidden">
                <img
                  src={allImages[selectedImage]}
                  alt={temple.name?.english}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">
                    {selectedImage + 1} / {allImages.length}
                  </span>
                </div>
              </div>

              {/* Thumbnail Grid */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 rounded-lg overflow-hidden ${
                        selectedImage === index ? "ring-4 ring-orange-500" : ""
                      }`}
                    >
                      <img
                        src={img}
                        alt={`View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About This Temple
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {temple.description?.english}
                </p>
                {temple.description?.hindi && (
                  <p className="text-gray-600 mt-3 leading-relaxed">
                    {temple.description.hindi}
                  </p>
                )}
              </div>
            </div>

            {/* History */}
            {temple.history?.english && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  History
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {temple.history.english}
                </p>
              </div>
            )}

            {/* Significance */}
            {temple.significance?.english && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Significance
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {temple.significance.english}
                </p>
              </div>
            )}

            {/* Rituals */}
            {temple.rituals && temple.rituals.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Daily Rituals
                </h2>
                <div className="space-y-3">
                  {temple.rituals.map((ritual, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-orange-500 pl-4 py-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {ritual.name}
                        </h3>
                        {ritual.time && (
                          <span className="text-sm text-orange-600 font-medium">
                            {ritual.time}
                          </span>
                        )}
                      </div>
                      {ritual.description && (
                        <p className="text-sm text-gray-600">
                          {ritual.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Festivals */}
            {temple.festivals && temple.festivals.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-orange-600" />
                  Major Festivals
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {temple.festivals.map((festival, index) => (
                    <div key={index} className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-bold text-gray-900 mb-1">
                        {festival.name}
                      </h3>
                      {festival.month && (
                        <p className="text-sm text-orange-600 font-medium mb-2">
                          {festival.month}
                        </p>
                      )}
                      {festival.description && (
                        <p className="text-sm text-gray-600">
                          {festival.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How to Reach */}
            {(temple.howToReach?.byAir ||
              temple.howToReach?.byTrain ||
              temple.howToReach?.byRoad) && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Navigation className="w-6 h-6 text-orange-600" />
                  How to Reach
                </h2>
                <div className="space-y-4">
                  {temple.howToReach.byAir && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        ✈️ By Air
                      </h3>
                      <p className="text-gray-700">{temple.howToReach.byAir}</p>
                    </div>
                  )}
                  {temple.howToReach.byTrain && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        🚂 By Train
                      </h3>
                      <p className="text-gray-700">
                        {temple.howToReach.byTrain}
                      </p>
                    </div>
                  )}
                  {temple.howToReach.byRoad && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        🚗 By Road
                      </h3>
                      <p className="text-gray-700">
                        {temple.howToReach.byRoad}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Quick Information
              </h3>

              <div className="space-y-4">
                {/* Deity */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Main Deity</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {temple.mainDeity}
                  </p>
                </div>

                {/* Best Time */}
                {temple.bestTimeToVisit && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Best Time to Visit
                    </p>
                    <p className="font-medium text-gray-900">
                      {temple.bestTimeToVisit}
                    </p>
                  </div>
                )}

                {/* Entry Fee */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Entry Fee</p>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-orange-600 text-lg">
                      {temple.entryFee?.indian === 0
                        ? "Free"
                        : `₹${temple.entryFee?.indian} (Indian)`}
                    </span>
                  </div>
                  {temple.entryFee?.foreign > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      ₹{temple.entryFee.foreign} (Foreign)
                    </p>
                  )}
                </div>

                {/* Dress Code */}
                {temple.dressCode && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Dress Code</p>
                    <p className="font-medium text-gray-900">
                      {temple.dressCode}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timings Card */}
            {(temple.timings?.morning?.opening ||
              temple.timings?.evening?.opening) && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Temple Timings
                </h3>

                <div className="space-y-3">
                  {temple.timings.morning?.opening && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Morning</span>
                      <span className="font-semibold text-gray-900">
                        {temple.timings.morning.opening} -{" "}
                        {temple.timings.morning.closing}
                      </span>
                    </div>
                  )}
                  {temple.timings.evening?.opening && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Evening</span>
                      <span className="font-semibold text-gray-900">
                        {temple.timings.evening.opening} -{" "}
                        {temple.timings.evening.closing}
                      </span>
                    </div>
                  )}
                  {temple.timings.specialDays && (
                    <p className="text-sm text-gray-600 mt-2">
                      <Info className="w-4 h-4 inline mr-1" />
                      {temple.timings.specialDays}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Contact Card */}
            {(temple.contact?.phone ||
              temple.contact?.email ||
              temple.contact?.website) && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Contact
                </h3>

                <div className="space-y-3">
                  {temple.contact.phone && (
                    <a
                      href={`tel:${temple.contact.phone}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-orange-600 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span>{temple.contact.phone}</span>
                    </a>
                  )}
                  {temple.contact.email && (
                    <a
                      href={`mailto:${temple.contact.email}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-orange-600 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span>{temple.contact.email}</span>
                    </a>
                  )}
                  {temple.contact.website && (
                    <a
                      href={temple.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-700 hover:text-orange-600 transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                      <span className="break-all">Visit Website</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Facilities Card */}
            {temple.facilities && temple.facilities.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Facilities
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {temple.facilities.map((facility, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Location</h3>

              <div className="space-y-2 text-gray-700">
                <p>{temple.location?.address}</p>
                <p>
                  {temple.location?.city}, {temple.location?.state}
                </p>
                <p>{temple.location?.country}</p>
                {temple.location?.pincode && (
                  <p className="text-sm text-gray-600">
                    PIN: {temple.location.pincode}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempleDetail;
