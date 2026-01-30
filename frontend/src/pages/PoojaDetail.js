import React, { useEffect, useState, useRef } from "react";
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
  Pause,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Clock,
  User,
  Calendar,
  ShoppingCart,
  Plus,
  Minus,
  Package,
  Sparkles,
  Loader,
  X,
  Video,
} from "lucide-react";
import api from "../services/api";
import { useApp } from "../context/AppContext";

const PoojaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useApp() || {};
  const [pooja, setPooja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("hindi");
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");

  // Audio player state
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  useEffect(() => {
    loadPooja();
  }, [id]);

  const loadPooja = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/poojas/${id}`);
      const poojaData = response.data.data || response.data;
      console.log("Pooja Data:", poojaData);
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

  // Audio controls
  const toggleAudio = (audioUrl) => {
    if (audioRef.current) {
      if (isPlaying && audioRef.current.src === audioUrl) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const progress =
        (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioProgress(0);
  };

  // Video modal
  const openVideoModal = (videoUrl) => {
    setCurrentVideoUrl(videoUrl);
    setShowVideoModal(true);
  };

  // Add product to cart
  const handleAddToCart = (product) => {
    if (addToCart) {
      addToCart({
        _id: product.product_id?._id || product.product_id,
        name: getProductName(product),
        price: product.product_id?.price || 99,
        image: product.product_image || product.product_id?.images?.[0],
        quantity: 1,
      });
      alert("Added to cart! 🛒");
    } else {
      alert("Please login to add items to cart");
    }
  };

  // Add all samagri to cart
  const handleAddAllToCart = () => {
    if (!pooja?.samagri_list?.length) return;

    pooja.samagri_list.forEach((item) => {
      if (addToCart) {
        addToCart({
          _id: item.product_id?._id || item.product_id,
          name: getProductName(item),
          price: item.product_id?.price || 99,
          image: item.product_image || item.product_id?.images?.[0],
          quantity: parseInt(item.quantity) || 1,
        });
      }
    });
    alert("All items added to cart! 🛒");
  };

  // Helper functions
  const getProductName = (item) => {
    if (item.product_name) return item.product_name;
    if (item.product_id?.name) {
      if (typeof item.product_id.name === "string") return item.product_id.name;
      return (
        item.product_id.name.english || item.product_id.name.hindi || "Product"
      );
    }
    return "Product";
  };

  const getProductPrice = (item) => {
    return item.product_id?.discountPrice || item.product_id?.price || 99;
  };

  const getStepAudioUrl = (step) => {
    return step.audio_url || step.audio || step.mantra?.audio_url;
  };

  const getStepVideoUrl = (step) => {
    return step.video_url || step.video || step.mantra?.video_url;
  };

  const getStepImageUrl = (step) => {
    return step.image_url || step.image || step.icon_url;
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
    { code: "hindi", label: "हिंदी", flag: "🇮🇳" },
    { code: "english", label: "English", flag: "🇬🇧" },
    { code: "sanskrit", label: "संस्कृत", flag: "🕉️" },
  ];

  const currentSteps =
    pooja.steps?.[selectedLanguage] || pooja.templateSteps || [];
  const progress =
    currentSteps.length > 0
      ? (completedSteps.length / currentSteps.length) * 100
      : 0;

  // Get current step data
  const currentStepData = currentSteps[currentStep] || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        className="hidden"
      />

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-orange-400"
            >
              <X className="w-8 h-8" />
            </button>
            <video
              src={currentVideoUrl}
              controls
              autoPlay
              className="w-full rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/poojas"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Poojas</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                {pooja.main_image_url || pooja.thumbnail_url ? (
                  <img
                    src={pooja.main_image_url || pooja.thumbnail_url}
                    alt=""
                    className="w-24 h-24 rounded-xl object-cover border-4 border-white/30"
                  />
                ) : (
                  <div className="w-24 h-24 bg-white/20 rounded-xl flex items-center justify-center text-5xl">
                    🕉️
                  </div>
                )}
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-1">
                    {pooja.name?.hi ||
                      pooja.poojaName?.hi ||
                      pooja.poojaType ||
                      "Pooja"}
                  </h1>
                  <p className="text-xl text-orange-200">
                    {pooja.name?.en || pooja.poojaName?.en || ""}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-orange-100">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {pooja.views || 0} views
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current text-yellow-300" />
                      {pooja.ratings?.average?.toFixed(1) || "5.0"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {pooja.total_duration_minutes || 30} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {pooja.category && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {pooja.category}
                  </span>
                )}
                {/* NEW: Pooja Vidhi Type Badge */}
                {pooja.pooja_vidhi_type && (
                  <span className="px-3 py-1 bg-purple-500/50 rounded-full text-sm font-medium">
                    {pooja.pooja_vidhi_type_name?.hi || pooja.pooja_vidhi_type}
                  </span>
                )}
                {pooja.difficulty_level && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {pooja.difficulty_level}
                  </span>
                )}
                {pooja.deity?.name && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {pooja.deity.name.hi || pooja.deity.name.en}
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
              <button className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {(pooja.description?.hi ||
              pooja.description?.en ||
              pooja.short_description?.hi) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  About This Pooja
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {pooja.description?.hi ||
                    pooja.description?.en ||
                    pooja.short_description?.hi ||
                    pooja.short_description?.en}
                </p>
              </div>
            )}

            {/* Language Selector */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700">
                  Select Language:
                </span>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedLanguage === lang.code
                        ? "bg-orange-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress
                </span>
                <span className="text-sm font-bold text-orange-600">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Steps Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-orange-600" />
                Steps ({currentSteps.length})
              </h2>

              {currentSteps.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>
                    No steps available in{" "}
                    {languages.find((l) => l.code === selectedLanguage)?.label}
                  </p>
                </div>
              ) : (
                <>
                  {/* Step Navigator */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
                    {currentSteps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                          currentStep === index
                            ? "bg-orange-600 text-white scale-110 ring-4 ring-orange-200"
                            : completedSteps.includes(index)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                      >
                        {completedSteps.includes(index) ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Current Step Display */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
                    {/* Step Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {currentStep + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {currentStepData.title ||
                              currentStepData.step_code ||
                              `Step ${currentStep + 1}`}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {currentStepData.duration_minutes || 5} minutes
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleStepComplete(currentStep)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          completedSteps.includes(currentStep)
                            ? "bg-green-500 text-white"
                            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500"
                        }`}
                      >
                        {completedSteps.includes(currentStep) ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Done
                          </span>
                        ) : (
                          "Mark Done"
                        )}
                      </button>
                    </div>

                    {/* Step Image */}
                    {getStepImageUrl(currentStepData) && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img
                          src={getStepImageUrl(currentStepData)}
                          alt="Step"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}

                    {/* Instruction */}
                    {(currentStepData.instruction ||
                      currentStepData.description) && (
                      <div className="mb-4 bg-white rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 mb-2">
                          Instructions:
                        </h4>
                        <p className="text-gray-700">
                          {currentStepData.instruction ||
                            currentStepData.description}
                        </p>
                      </div>
                    )}

                    {/* Mantra */}
                    {currentStepData.mantra && (
                      <div className="mb-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <Volume2 className="w-5 h-5 text-orange-600" />
                          Mantra:
                        </h4>
                        <p className="text-xl text-center font-serif text-gray-900 py-2">
                          {typeof currentStepData.mantra === "string"
                            ? currentStepData.mantra
                            : currentStepData.mantra?.text?.sa ||
                              currentStepData.mantra?.text?.hi ||
                              currentStepData.mantra?.mantra_name ||
                              ""}
                        </p>
                        {currentStepData.mantra?.text?.en && (
                          <p className="text-sm text-gray-600 text-center italic">
                            {currentStepData.mantra.text.en}
                          </p>
                        )}
                        {currentStepData.mantra_repeat_count && (
                          <p className="text-sm text-orange-600 text-center mt-2 font-medium">
                            🔁 Repeat {currentStepData.mantra_repeat_count}{" "}
                            times
                          </p>
                        )}
                        {currentStepData.mantra?.audio_url && (
                          <div className="mb-4 bg-orange-100 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              🎵 Mantra Audio:
                            </p>
                            <audio
                              src={currentStepData.mantra.audio_url}
                              controls
                              className="w-full"
                              style={{ height: "40px" }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Media Controls - Audio & Video */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Audio Player */}
                      {getStepAudioUrl(currentStepData) && (
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium flex items-center gap-2">
                              <Volume2 className="w-5 h-5" /> Audio
                            </span>
                            <button
                              onClick={() =>
                                toggleAudio(getStepAudioUrl(currentStepData))
                              }
                              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                            >
                              {isPlaying ? (
                                <Pause className="w-5 h-5" />
                              ) : (
                                <Play className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                          {/* Native audio player */}
                          <audio
                            src={getStepAudioUrl(currentStepData)}
                            controls
                            className="w-full mt-2"
                            style={{ height: "40px" }}
                          />
                        </div>
                      )}

                      {/* Video Button */}
                      {getStepVideoUrl(currentStepData) && (
                        <button
                          onClick={() =>
                            openVideoModal(getStepVideoUrl(currentStepData))
                          }
                          className="bg-gradient-to-r from-red-500 to-pink-600 rounded-lg p-4 text-white text-left hover:opacity-90"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium flex items-center gap-2">
                              <Video className="w-5 h-5" /> Video Tutorial
                            </span>
                            <Play className="w-8 h-8" />
                          </div>
                          <p className="text-sm text-white/80 mt-1">
                            Click to watch
                          </p>
                        </button>
                      )}
                    </div>

                    {/* Mantra Audio (if available separately) */}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-4 border-t border-orange-200">
                      <button
                        onClick={() =>
                          setCurrentStep(Math.max(0, currentStep - 1))
                        }
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" /> Previous
                      </button>
                      <button
                        onClick={() =>
                          setCurrentStep(
                            Math.min(currentSteps.length - 1, currentStep + 1),
                          )
                        }
                        disabled={currentStep === currentSteps.length - 1}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Samagri / Products Section */}
            {pooja.samagri_list && pooja.samagri_list.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-600" />
                    Samagri (सामग्री)
                  </h3>
                  <span className="text-sm text-gray-500">
                    {pooja.samagri_list.length} items
                  </span>
                </div>

                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {pooja.samagri_list.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg"
                    >
                      {item.product_image || item.product_id?.images?.[0] ? (
                        <img
                          src={
                            item.product_image || item.product_id?.images?.[0]
                          }
                          alt=""
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-orange-200 rounded-lg flex items-center justify-center text-2xl">
                          🪔
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {getProductName(item)}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">
                            Qty: {item.quantity || 1}
                          </span>
                          {item.is_required && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-orange-600 font-bold">
                          ₹{getProductPrice(item)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex-shrink-0"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add All to Cart Button */}
                <button
                  onClick={handleAddAllToCart}
                  className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-bold hover:from-orange-700 hover:to-red-700 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add All to Cart
                </button>

                {/* Total Price */}
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <span className="text-gray-600">Estimated Total:</span>
                  <span className="text-xl font-bold text-orange-600">
                    ₹
                    {pooja.samagri_list.reduce(
                      (sum, item) =>
                        sum +
                        getProductPrice(item) * (parseInt(item.quantity) || 1),
                      0,
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Quick Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Steps</p>
                    <p className="font-bold">{currentSteps.length} steps</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-bold">
                      {pooja.total_duration_minutes || 30} minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="font-bold">
                      {pooja.ratings?.average?.toFixed(1) || "5.0"} ⭐
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW: Pooja ka Mahatva Section */}
            {(pooja.mahatva?.hi ||
              pooja.mahatva?.en ||
              pooja.mahatva_points?.length > 0) && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border-2 border-purple-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  पूजा का महत्व (Importance)
                </h3>
                {(pooja.mahatva?.hi || pooja.mahatva?.en) && (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {selectedLanguage === "hindi"
                      ? pooja.mahatva?.hi
                      : pooja.mahatva?.en || pooja.mahatva?.hi}
                  </p>
                )}
                {pooja.mahatva_points && pooja.mahatva_points.length > 0 && (
                  <div className="space-y-3">
                    {pooja.mahatva_points.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-white rounded-lg"
                      >
                        <span className="text-xl">{point.icon || "✨"}</span>
                        <div>
                          <p className="font-medium text-purple-700">
                            {selectedLanguage === "hindi"
                              ? point.title?.hi
                              : point.title?.en || point.title?.hi}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedLanguage === "hindi"
                              ? point.description?.hi
                              : point.description?.en || point.description?.hi}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Rate This Pooja */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Rate This Pooja
              </h3>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatePooja(rating)}
                    className="w-10 h-10 rounded-full hover:bg-yellow-100 transition-all transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 mx-auto ${
                        rating <= (pooja.ratings?.average || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600">
                {pooja.ratings?.count || 0} ratings
              </p>
            </div>

            {/* Browse More */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Explore More</h3>
              <p className="text-orange-100 text-sm mb-4">
                Discover more poojas and rituals
              </p>
              <Link
                to="/poojas"
                className="block w-full py-3 bg-white text-orange-600 text-center rounded-lg hover:bg-orange-50 font-bold"
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
