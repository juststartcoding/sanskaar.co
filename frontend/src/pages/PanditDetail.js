import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  Calendar,
  Phone,
  Mail,
  Award,
  Globe,
  CheckCircle,
  Clock,
  ArrowLeft,
  Video,
  Home,
} from "lucide-react";

const PanditDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pandit, setPandit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    loadPanditDetails();
  }, [id]);

  const loadPanditDetails = async () => {
    try {
      setLoading(true);
      console.log("📥 Loading pandit details:", id);

      const response = await fetch(`http://localhost:5000/api/pandits/${id}`);
      const data = await response.json();

      console.log("✅ Pandit loaded:", data);
      setPandit(data);
    } catch (error) {
      console.error("❌ Error loading pandit:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pandit details...</p>
        </div>
      </div>
    );
  }

  if (!pandit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Pandit not found</p>
          <button
            onClick={() => navigate("/pandits")}
            className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Back to Pandits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/pandits")}
            className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to All Pandits
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              {/* Profile Image */}
              <div className="text-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-bold mb-4">
                  {pandit.name?.[0] || "P"}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {pandit.name || "Pandit Ji"}
                </h1>
                {pandit.isApproved && (
                  <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified Pandit
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-4 mb-6">
                {pandit.experience && (
                  <div className="flex items-center text-gray-700">
                    <Award className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-semibold">{pandit.experience} years</p>
                    </div>
                  </div>
                )}

                {pandit.location && (
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold">
                        {pandit.location.city}, {pandit.location.state}
                      </p>
                    </div>
                  </div>
                )}

                {pandit.phone && (
                  <div className="flex items-center text-gray-700">
                    <Phone className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-semibold">{pandit.phone}</p>
                    </div>
                  </div>
                )}

                {pandit.email && (
                  <div className="flex items-center text-gray-700">
                    <Mail className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-sm">{pandit.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book Pandit Ji
                </button>
                <a
                  href={`tel:${pandit.phone}`}
                  className="w-full border-2 border-orange-600 text-orange-600 py-3 rounded-lg hover:bg-orange-50 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {pandit.description ||
                  "Experienced and dedicated pandit ji, specializing in various Hindu rituals and ceremonies. Committed to performing authentic vedic ceremonies with devotion and precision."}
              </p>
            </div>

            {/* Specializations */}
            {pandit.specialization && pandit.specialization.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Specializations
                </h2>
                <div className="flex flex-wrap gap-2">
                  {pandit.specialization.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {pandit.languages && pandit.languages.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-orange-600" />
                  Languages
                </h2>
                <div className="flex flex-wrap gap-2">
                  {pandit.languages.map((lang, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {pandit.education && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Education
                </h2>
                <p className="text-gray-700">{pandit.education}</p>
              </div>
            )}

            {/* Services Offered */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Services Offered
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-orange-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">At Home</p>
                    <p className="text-sm text-gray-600">
                      Pandit ji can visit your home
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Video className="w-5 h-5 text-orange-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Online Pooja</p>
                    <p className="text-sm text-gray-600">
                      Virtual ceremonies available
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-orange-600" />
                Availability
              </h2>
              <p className="text-gray-700">
                Available for bookings. Contact for schedule and rates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Book Pandit Ji
            </h3>
            <p className="text-gray-600 mb-6">
              To book {pandit.name || "this pandit"}, please call or contact
              directly:
            </p>
            <div className="space-y-3 mb-6">
              <a
                href={`tel:${pandit.phone}`}
                className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call: {pandit.phone}
              </a>
              {pandit.email && (
                <a
                  href={`mailto:${pandit.email}`}
                  className="w-full border-2 border-orange-600 text-orange-600 py-3 rounded-lg hover:bg-orange-50 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Email
                </a>
              )}
            </div>
            <button
              onClick={() => setShowBookingModal(false)}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanditDetail;
