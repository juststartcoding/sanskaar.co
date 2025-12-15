import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Eye,
  Heart,
  Share2,
  BookOpen,
  Volume2,
  Play,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Award,
  Sparkles,
  Download,
  Loader,
} from "lucide-react";
import api from "../services/api";

const PoojaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pooja, setPooja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("hindi");
  const [currentStep, setCurrentStep] = useState(0);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadPooja();
  }, [id]);

  const loadPooja = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/poojas/${id}`);
      const poojaData = response.data.data || response.data;

      setPooja(poojaData);

      if (poojaData.poojaLanguage) {
        setSelectedLanguage(poojaData.poojaLanguage);
      }
    } catch (error) {
      console.error("Failed to load pooja:", error);
      setPooja(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRatePooja = async (rating) => {
    try {
      await api.post(`/poojas/${id}/rate`, { rating });
      alert("Thank you for rating! 🙏");
      loadPooja();
    } catch (error) {
      alert("Please login to rate this pooja");
    }
  };

  const toggleStepComplete = (stepIndex) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter((i) => i !== stepIndex));
    } else {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const handlePlayAudio = (audioUrl) => {
    if (playingAudio === audioUrl) {
      setPlayingAudio(null);
      // In production, pause actual audio
    } else {
      setPlayingAudio(audioUrl);
      // In production, play actual audio
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading pooja details...</p>
        </div>
      </div>
    );
  }

  if (!pooja) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pooja not found
          </h2>
          <Link
            to="/poojas"
            className="text-orange-600 hover:text-orange-700 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse all poojas
          </Link>
        </div>
      </div>
    );
  }

  const languages = [
    { code: "hindi", label: "हिंदी", flag: "🇮🇳", color: "orange" },
    { code: "sanskrit", label: "संस्कृत", flag: "🕉️", color: "purple" },
    { code: "english", label: "English", flag: "🇬🇧", color: "blue" },
  ];

  const currentSteps = pooja.steps?.[selectedLanguage] || [];
  const currentImportance = pooja.importance?.[selectedLanguage] || "";
  const progress =
    currentSteps.length > 0
      ? (completedSteps.length / currentSteps.length) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link
            to="/poojas"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Poojas</span>
          </Link>

          {/* Title and Info */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-6xl">🕉️</div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                    {pooja.poojaType}
                  </h1>
                  <div className="flex items-center gap-4 text-orange-100">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {pooja.views || 0} views
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current text-yellow-300" />
                      {pooja.ratings?.average?.toFixed(1) || "0.0"} (
                      {pooja.ratings?.count || 0})
                    </span>
                  </div>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                  <Calendar className="w-4 h-4" />
                  Added {new Date(pooja.createdAt).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm capitalize">
                  <BookOpen className="w-4 h-4" />
                  {pooja.poojaLanguage}
                </span>
                {pooja.createdBy && (
                  <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                    <User className="w-4 h-4" />
                    By {pooja.createdBy.name || "Admin"}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                  isFavorite
                    ? "bg-red-500 text-white"
                    : "bg-white/20 hover:bg-white/30 text-white"
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`}
                />
              </button>
              <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors">
                <Share2 className="w-6 h-6" />
              </button>
              <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors">
                <Download className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Language Selector */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-orange-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-orange-600" />
                Choose Your Language
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.code);
                      setCurrentStep(0);
                      setCompletedSteps([]);
                    }}
                    className={`relative overflow-hidden p-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                      selectedLanguage === lang.code
                        ? "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{lang.flag}</div>
                      <div className="text-sm">{lang.label}</div>
                    </div>
                    {selectedLanguage === lang.code && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            {currentSteps.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" />
                    Your Progress
                  </h3>
                  <span className="text-2xl font-bold text-green-600">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {completedSteps.length} of {currentSteps.length} steps
                  completed
                </p>
              </div>
            )}

            {/* Importance Section */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-8 border-2 border-yellow-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-7 h-7 text-orange-600" />
                महत्व (Importance)
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-800 leading-relaxed whitespace-pre-line text-justify">
                  {currentImportance ||
                    "No description available in this language."}
                </p>
              </div>
            </div>

            {/* Samagri Section */}
            {pooja.samagri && pooja.samagri.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">🛒</span>
                    पूजा सामग्री (Samagri)
                  </h2>
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {pooja.samagri.length} items
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {pooja.samagri.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors group"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name?.english}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📦</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">
                          {item.name?.english || "Item"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.name?.hindi || ""}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            Qty: {item.quantity} {item.unit}
                          </span>
                          {item.isRequired && (
                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{item.price || 0}</p>
                        {item.productId && (
                          <button
                            onClick={() => {
                              // Add to cart logic here
                              alert(`Added ${item.name?.english} to cart!`);
                            }}
                            className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total and Buy All Button */}
                <div className="border-t pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Samagri Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{pooja.samagri.reduce((sum, item) => sum + (item.price || 0), 0)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      alert("All samagri items added to cart!");
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <span>🛒</span>
                    Add All to Cart
                  </button>
                </div>
              </div>
            )}

            {/* Steps Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-blue-600" />
                Step-by-Step Guide ({currentSteps.length} Steps)
              </h2>

              {currentSteps.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    No steps available in{" "}
                    {languages.find((l) => l.code === selectedLanguage)?.label}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Try selecting a different language
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Steps Navigator */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-4">
                    {currentSteps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                          currentStep === index
                            ? "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg scale-125 ring-4 ring-orange-200"
                            : completedSteps.includes(index)
                            ? "bg-green-500 text-white shadow-md"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                      >
                        {completedSteps.includes(index) ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          index + 1
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Current Step Display */}
                  {currentSteps[currentStep] && (
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-8 border-2 border-orange-200">
                      {/* Step Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {currentStep + 1}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                              Step {currentStep + 1} of {currentSteps.length}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {Math.round(
                                ((currentStep + 1) / currentSteps.length) * 100
                              )}
                              % Complete
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleStepComplete(currentStep)}
                          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                            completedSteps.includes(currentStep)
                              ? "bg-green-500 text-white shadow-lg"
                              : "bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500"
                          }`}
                        >
                          {completedSteps.includes(currentStep) ? (
                            <span className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              Completed
                            </span>
                          ) : (
                            "Mark Complete"
                          )}
                        </button>
                      </div>

                      {/* Step Description */}
                      {currentSteps[currentStep].description && (
                        <div className="mb-6 bg-white rounded-lg p-6 shadow-md">
                          <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            Instructions:
                          </h4>
                          <p className="text-gray-800 leading-relaxed text-lg">
                            {currentSteps[currentStep].description}
                          </p>
                        </div>
                      )}

                      {/* Mantra */}
                      {currentSteps[currentStep].mantra && (
                        <div className="mb-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-6 border-2 border-yellow-400 shadow-md">
                          <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                            <Volume2 className="w-5 h-5 text-orange-600" />
                            Mantra:
                          </h4>
                          <p className="text-2xl text-gray-900 font-serif leading-relaxed text-center py-4">
                            {currentSteps[currentStep].mantra}
                          </p>
                        </div>
                      )}

                      {/* Media Grid */}
                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Image */}
                        {currentSteps[currentStep].image && (
                          <div className="bg-white rounded-lg overflow-hidden shadow-lg group">
                            <div className="relative">
                              <img
                                src={currentSteps[currentStep].image}
                                alt={`Step ${currentStep + 1}`}
                                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/400x300?text=Image";
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-white" />
                              </div>
                            </div>
                            <div className="p-3 text-center">
                              <span className="text-sm font-semibold text-gray-700">
                                View Image
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Audio */}
                        {currentSteps[currentStep].audio && (
                          <button
                            onClick={() =>
                              handlePlayAudio(currentSteps[currentStep].audio)
                            }
                            className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 flex flex-col items-center justify-center gap-3"
                          >
                            <Volume2
                              className={`w-12 h-12 ${
                                playingAudio === currentSteps[currentStep].audio
                                  ? "animate-pulse"
                                  : ""
                              }`}
                            />
                            <span className="font-semibold">
                              {playingAudio === currentSteps[currentStep].audio
                                ? "Playing..."
                                : "Play Audio"}
                            </span>
                          </button>
                        )}

                        {/* Video */}
                        {currentSteps[currentStep].video && (
                          <button
                            onClick={() =>
                              window.open(
                                currentSteps[currentStep].video,
                                "_blank"
                              )
                            }
                            className="bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 flex flex-col items-center justify-center gap-3"
                          >
                            <Play className="w-12 h-12" />
                            <span className="font-semibold">Watch Video</span>
                          </button>
                        )}
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex justify-between mt-8 pt-6 border-t-2 border-orange-200">
                        <button
                          onClick={() =>
                            setCurrentStep(Math.max(0, currentStep - 1))
                          }
                          disabled={currentStep === 0}
                          className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                          <ChevronLeft className="w-5 h-5" />
                          Previous
                        </button>
                        <button
                          onClick={() =>
                            setCurrentStep(
                              Math.min(currentSteps.length - 1, currentStep + 1)
                            )
                          }
                          disabled={currentStep === currentSteps.length - 1}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-lg"
                        >
                          Next Step
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Quick Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Steps</p>
                    <p className="font-bold text-gray-900">
                      {currentSteps.length} steps
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Language</p>
                    <p className="font-bold text-gray-900 capitalize">
                      {pooja.poojaLanguage}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-bold text-gray-900">
                      {Math.max(15, currentSteps.length * 5)} min
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Views</p>
                    <p className="font-bold text-gray-900">
                      {pooja.views || 0} times
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-6 border-2 border-yellow-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600 fill-current" />
                Rate This Pooja
              </h3>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatePooja(rating)}
                    className="w-12 h-12 rounded-full hover:bg-yellow-100 transition-all transform hover:scale-110 flex items-center justify-center"
                  >
                    <Star
                      className={`w-7 h-7 transition-all ${
                        rating <= (pooja.ratings?.average || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600">
                Current:{" "}
                <span className="font-bold">
                  {pooja.ratings?.average?.toFixed(1) || "0.0"}
                </span>{" "}
                ({pooja.ratings?.count || 0} ratings)
              </p>
            </div>

            {/* Share Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                Share This Pooja
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm">
                  Facebook
                </button>
                <button className="py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm">
                  WhatsApp
                </button>
                <button className="py-3 px-4 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-semibold text-sm">
                  Twitter
                </button>
                <button className="py-3 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold text-sm">
                  Copy Link
                </button>
              </div>
            </div>

            {/* Browse More */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Explore More Poojas</h3>
              <p className="text-orange-100 text-sm mb-4">
                Discover more authentic Hindu rituals and ceremonies
              </p>
              <Link
                to="/poojas"
                className="block w-full py-3 bg-white text-orange-600 text-center rounded-lg hover:bg-orange-50 transition-colors font-bold"
              >
                Browse All Poojas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoojaDetail;
