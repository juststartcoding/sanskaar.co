import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { poojaAPI } from "../../services/api";
import { useApp } from "../../context/AppContext";
import {
  Calendar,
  Clock,
  Users,
  Star,
  Play,
  ShoppingCart,
  BookOpen,
  Volume2,
  ExternalLink,
  Heart,
  Share2,
} from "lucide-react";

const PoojaDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useApp();
  const [pooja, setPooja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(0);
  const [playingAudio, setPlayingAudio] = useState(null);

  useEffect(() => {
    loadPooja();
  }, [slug]);

  const loadPooja = async () => {
    try {
      const response = await poojaAPI.getBySlug(slug);
      if (response && response.data) {
        setPooja(response.data);
      }
    } catch (error) {
      console.error("Failed to load pooja:", error);
      setPooja(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!pooja) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pooja not found
          </h2>
          <Link to="/poojas" className="text-orange-600 hover:text-orange-700">
            Browse all poojas
          </Link>
        </div>
      </div>
    );
  }

  // Safety check for methods array
  const methods =
    Array.isArray(pooja.methods) && pooja.methods.length > 0
      ? pooja.methods
      : [];
  const currentMethod = methods[selectedMethod] || methods[0] || null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-900">
        <img
          src={pooja.mainImage || "https://via.placeholder.com/1200x400"}
          alt={pooja.name?.english || "Pooja"}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {pooja.type || "Ritual"}
              </span>
              <span className="bg-white/20 text-white px-4 py-1 rounded-full text-sm backdrop-blur-sm">
                {pooja.deity || "N/A"}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {pooja.name?.english || "Traditional Pooja"}
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl">
              {pooja.significance?.english ||
                pooja.description?.english ||
                "Traditional Hindu ritual"}
            </p>
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center text-yellow-400">
                <Star className="w-5 h-5 fill-current" />
                <span className="ml-2 text-white font-semibold">
                  {pooja.ratings?.average?.toFixed(1) || "4.5"} (
                  {pooja.ratings?.count || 0} reviews)
                </span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors">
                  <Heart className="w-5 h-5 text-white" />
                </button>
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors">
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About This Pooja
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {pooja.description?.english ||
                  "Traditional Hindu ritual performed with devotion and faith."}
              </p>
              {pooja.whyCelebrated?.english && (
                <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded">
                  <h3 className="font-semibold text-orange-900 mb-2">
                    Why Celebrate
                  </h3>
                  <p className="text-orange-800">
                    {pooja.whyCelebrated.english}
                  </p>
                </div>
              )}
            </div>

            {/* Method Selection */}
            {methods.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Choose Pooja Method
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {methods.map((method, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMethod(index)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedMethod === index
                          ? "border-orange-600 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <h3 className="font-bold text-lg mb-2">
                        {method.name || `Method ${index + 1}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {method.description?.english || "Traditional method"}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="flex items-center text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {method.estimatedDuration || "30"} min
                        </span>
                        <span className="text-orange-600 font-semibold capitalize">
                          {method.difficulty || "Medium"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Offerings List */}
                {currentMethod?.offeringsList &&
                  Array.isArray(currentMethod.offeringsList) &&
                  currentMethod.offeringsList.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Required Offerings
                      </h3>
                      <ul className="grid grid-cols-2 gap-2">
                        {currentMethod.offeringsList.map((offering, idx) => (
                          <li
                            key={idx}
                            className="flex items-center text-sm text-gray-700"
                          >
                            <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
                            {offering.name || "Offering"} (
                            {offering.quantity || "1"})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            {/* Step-by-Step Guide */}
            {currentMethod &&
              Array.isArray(currentMethod.steps) &&
              currentMethod.steps.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Step-by-Step Guide
                  </h2>
                  {currentMethod.steps.map((step, index) => (
                    <div
                      key={index}
                      className="mb-8 pb-8 border-b border-gray-200 last:border-0"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                          {step.stepNumber || index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {step.title?.english || `Step ${index + 1}`}
                          </h3>
                          <p className="text-gray-700 mb-4">
                            {step.description?.english ||
                              "Perform this step with devotion."}
                          </p>

                          {/* Mantra Section */}
                          {step.mantra && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">
                                  Mantra
                                </h4>
                                {step.audioUrl && (
                                  <button
                                    onClick={() =>
                                      setPlayingAudio(
                                        playingAudio === index ? null : index
                                      )
                                    }
                                    className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                      {playingAudio === index
                                        ? "Pause"
                                        : "Play"}{" "}
                                      Audio
                                    </span>
                                  </button>
                                )}
                              </div>
                              <p className="font-sanskrit text-lg text-gray-900 mb-2">
                                {step.mantra.sanskrit || step.mantra}
                              </p>
                              {step.mantra.transliteration && (
                                <p className="text-sm text-gray-600 mb-1">
                                  {step.mantra.transliteration}
                                </p>
                              )}
                              {step.mantra.meaning?.english && (
                                <p className="text-sm text-gray-700 italic">
                                  Meaning: {step.mantra.meaning.english}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Video/GIF */}
                          {(step.videoUrl || step.gifUrl) && (
                            <div className="relative rounded-lg overflow-hidden bg-gray-100 mb-4">
                              <img
                                src={
                                  step.gifUrl ||
                                  step.videoUrl ||
                                  "https://via.placeholder.com/600x400"
                                }
                                alt={
                                  step.title?.english || "Step demonstration"
                                }
                                className="w-full h-auto"
                              />
                              {step.videoUrl && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <button className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                                    <Play className="w-8 h-8 text-orange-600 ml-1" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Materials Required */}
                          {step.materialsRequired &&
                            Array.isArray(step.materialsRequired) &&
                            step.materialsRequired.length > 0 && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">
                                  Materials Needed
                                </h4>
                                <ul className="space-y-2">
                                  {step.materialsRequired.map(
                                    (material, idx) => (
                                      <li
                                        key={idx}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <span className="text-gray-700">
                                          {material.item || material} -{" "}
                                          {material.quantity || "1"}
                                        </span>
                                        {material.productId && (
                                          <button
                                            onClick={() =>
                                              addToCart({
                                                productId: material.productId,
                                              })
                                            }
                                            className="text-orange-600 hover:text-orange-700 font-medium"
                                          >
                                            Add to Cart
                                          </button>
                                        )}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* No method available message */}
            {methods.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <p className="text-gray-600">
                  No detailed steps available for this pooja yet.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              {/* Quick Info */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">Quick Information</h3>
                <div className="space-y-4">
                  {pooja.bestDays &&
                    Array.isArray(pooja.bestDays) &&
                    pooja.bestDays.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-orange-600 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Best Days</p>
                          <p className="text-sm text-gray-600">
                            {pooja.bestDays.join(", ")}
                          </p>
                        </div>
                      </div>
                    )}
                  {currentMethod && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-orange-600 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Duration</p>
                        <p className="text-sm text-gray-600">
                          {currentMethod.estimatedDuration || "30"} minutes
                        </p>
                      </div>
                    </div>
                  )}
                  {pooja.peopleRequired && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-orange-600 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">
                          People Required
                        </p>
                        <p className="text-sm text-gray-600">
                          {pooja.peopleRequired.min || 1}-
                          {pooja.peopleRequired.max || 5} people
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
                {pooja.kitProductId && (
                  <button
                    onClick={() => addToCart({ productId: pooja.kitProductId })}
                    className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Buy Complete Kit
                  </button>
                )}
                <Link
                  to="/pandits"
                  className="block w-full bg-white text-orange-600 py-3 rounded-lg border-2 border-orange-600 hover:bg-orange-50 transition-colors font-semibold text-center"
                >
                  Book a Pandit
                </Link>
                <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Download Guide (PDF)
                </button>
              </div>

              {/* Source References */}
              {pooja.sourceReferences &&
                Array.isArray(pooja.sourceReferences) &&
                pooja.sourceReferences.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                    <h3 className="font-bold text-lg mb-4">
                      Source References
                    </h3>
                    <ul className="space-y-2">
                      {pooja.sourceReferences.map((ref, idx) => (
                        <li key={idx}>
                          <a
                            href={ref.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:text-orange-700 text-sm flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {ref.title || "Reference"}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoojaDetail;
