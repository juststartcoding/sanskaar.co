import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { poojaAPI, productAPI } from "../services/api";
import { useApp } from "../context/AppContext";
import {
  BookOpen,
  ShoppingBag,
  Users,
  Flower2,
  ArrowRight,
  Star,
  Play,
  ShoppingCart,
} from "lucide-react";

const Home = () => {
  const { addToCart } = useApp();
  const [featuredPoojas, setFeaturedPoojas] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingPoojas, setLoadingPoojas] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    loadFeaturedPoojas();
    loadFeaturedProducts();

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadFeaturedPoojas = async () => {
    try {
      setLoadingPoojas(true);
      const response = await poojaAPI.getAll();

      let poojasData = [];

      if (response.data) {
        if (Array.isArray(response.data)) {
          poojasData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          poojasData = response.data.data;
        } else if (
          response.data.poojas &&
          Array.isArray(response.data.poojas)
        ) {
          poojasData = response.data.poojas;
        }
      }

      // Get first 6 poojas for featured section
      setFeaturedPoojas(poojasData.slice(0, 6));
    } catch (error) {
      console.error("Failed to load featured poojas:", error);
      setFeaturedPoojas([]);
    } finally {
      setLoadingPoojas(false);
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productAPI.getAll();

      let productsData = [];

      if (response.data) {
        if (Array.isArray(response.data)) {
          productsData = response.data;
        } else if (
          response.data.products &&
          Array.isArray(response.data.products)
        ) {
          productsData = response.data.products;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          productsData = response.data.data;
        }
      }

      // Get first 8 products for featured section
      setFeaturedProducts(productsData.slice(0, 8));
    } catch (error) {
      console.error("Failed to load featured products:", error);
      setFeaturedProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "Authentic Poojas",
      description:
        "Step-by-step guidance with mantras, meanings, and videos for traditional rituals",
      link: "/poojas",
      color: "from-orange-500 to-red-600",
      image:
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400&fit=crop",
    },
    {
      icon: ShoppingBag,
      title: "Pooja Samagri",
      description:
        "Complete kits and individual items for all your spiritual needs",
      link: "/shop",
      color: "from-yellow-500 to-orange-600",
      image:
        "https://images.unsplash.com/photo-1609157514991-271d52265cdd?w=600&h=400&fit=crop",
    },
    {
      icon: Users,
      title: "Book Pandits",
      description:
        "Verified and experienced priests for your home or temple ceremonies",
      link: "/pandits",
      color: "from-red-500 to-pink-600",
      image:
        "https://images.unsplash.com/photo-1607827448387-a67db1383b59?w=600&h=400&fit=crop",
    },
    {
      icon: Flower2,
      title: "Eco Waste Collection",
      description:
        "Responsible collection and processing of pooja waste materials",
      link: "/waste-collection",
      color: "from-green-500 to-emerald-600",
      image:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop",
    },
  ];

  const stats = [
    { label: "Poojas Listed", value: "500+" },
    { label: "Verified Pandits", value: "1000+" },
    { label: "Happy Devotees", value: "50K+" },
    { label: "Temples Listed", value: "5000+" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax */}
      <section className="relative bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 py-20 overflow-hidden">
        {/* Parallax Background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1587045525000-d9a34d44f733?w=1920&h=1080&fit=crop)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/90 via-red-50/90 to-yellow-50/90" />

        {/* Floating Elements */}
        <div
          className="absolute top-20 right-10 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-30"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div
          className="absolute bottom-20 left-10 w-40 h-40 bg-red-200 rounded-full blur-3xl opacity-30"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-block mb-4">
                <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
                  🕉 Welcome to Sanskaar
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Sacred Journey
                <span className="block text-orange-600">Starts Here</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Discover authentic Hindu rituals, book experienced pandits, and
                shop for quality pooja samagri. Everything you need for your
                spiritual practice in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/poojas"
                  className="bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-700 transition-all transform hover:scale-105 font-semibold text-center shadow-lg"
                >
                  Explore Poojas
                </Link>
                <Link
                  to="/shop"
                  className="bg-white text-orange-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all border-2 border-orange-600 font-semibold text-center"
                >
                  Shop Now
                </Link>
              </div>
            </div>
            <div
              className="relative animate-fade-in"
              style={{ transform: `translateY(${scrollY * 0.1}px)` }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1604608672516-f1b9b1e36bb6?w=800&h=600&fit=crop"
                  alt="Hindu Pooja"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
                  <Play className="w-8 h-8 text-orange-600 ml-1" />
                </button>
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-white fill-current" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">4.9/5</div>
                    <div className="text-sm text-gray-600">50K+ Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Parallax */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=1920&h=1080&fit=crop)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `translateY(${scrollY * 0.15}px)`,
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything for Your Spiritual Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From traditional rituals to modern conveniences, we bring
              authentic Hindu practices to your fingertips
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 card-hover"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div
                    className={`absolute top-4 left-4 w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center shadow-lg`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="flex items-center text-orange-600 font-semibold">
                    Learn More <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Poojas with Parallax */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20"
          style={{
            transform: `translate(${scrollY * 0.1}px, ${scrollY * 0.1}px)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-20"
          style={{
            transform: `translate(-${scrollY * 0.1}px, -${scrollY * 0.1}px)`,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Featured Poojas
              </h2>
              <p className="text-gray-600">
                Popular rituals performed by devotees
              </p>
            </div>
            <Link
              to="/poojas"
              className="hidden md:flex items-center text-orange-600 hover:text-orange-700 font-semibold"
            >
              View All <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>

          {loadingPoojas ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-xl h-80 animate-pulse"
                ></div>
              ))}
            </div>
          ) : featuredPoojas.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">
                No featured poojas available at the moment
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPoojas.map((pooja) => (
                <Link
                  key={pooja._id}
                  to={`/pooja/${pooja._id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2"
                >
                  {/* Pooja Card Header */}
                  <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center relative overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage:
                          "url(https://images.unsplash.com/photo-1604608672516-f1b9b1e36bb6?w=800&h=600&fit=crop)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="text-center text-white relative z-10">
                      <div className="text-6xl mb-2">🕉️</div>
                      <h3 className="text-2xl font-bold px-4">
                        {pooja.poojaType}
                      </h3>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-orange-600 capitalize shadow-lg">
                        {pooja.poojaLanguage}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Status Badge */}
                    {pooja.isActive && (
                      <div className="mb-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    )}

                    {/* Importance/Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {pooja.importance?.english ||
                        pooja.importance?.hindi ||
                        pooja.importance?.sanskrit ||
                        "Traditional Hindu ritual with authentic mantras and procedures"}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
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
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>
                            {pooja.ratings?.average?.toFixed(1) || "4.5"}
                          </span>
                        </div>
                      </div>
                      <span className="text-orange-600 font-semibold text-sm">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* View All Link for Mobile */}
          {featuredPoojas.length > 0 && (
            <div className="text-center mt-8 md:hidden">
              <Link
                to="/poojas"
                className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
              >
                View All Poojas <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section with Parallax */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1609157514991-271d52265cdd?w=1920&h=1080&fit=crop)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `translateY(${scrollY * 0.12}px)`,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Featured Products
              </h2>
              <p className="text-gray-600">
                Premium pooja samagri for your rituals
              </p>
            </div>
            <Link
              to="/shop"
              className="hidden md:flex items-center text-orange-600 hover:text-orange-700 font-semibold"
            >
              View All <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl h-96 animate-pulse"
                ></div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">
                No featured products available at the moment
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div
                  key={product._id}
                  className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={
                        product.mainImage ||
                        "https://images.unsplash.com/photo-1609157514991-271d52265cdd?w=600&h=400&fit=crop"
                      }
                      alt={product.name?.english || "Product"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {product.discountPrice && product.mrp && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                        {Math.round(
                          ((product.mrp - product.discountPrice) /
                            product.mrp) *
                            100
                        )}
                        % OFF
                      </div>
                    )}
                    {product.ecoFriendly && (
                      <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                        Eco-Friendly
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <span className="text-xs text-orange-600 font-semibold uppercase">
                      {product.category || "Product"}
                    </span>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {product.name?.english || "Product Name"}
                    </h3>

                    <div className="flex items-center mb-2">
                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                      <span className="ml-1 text-sm text-gray-600">
                        {product.ratings?.average?.toFixed(1) || "4.5"}
                        {product.ratings?.count
                          ? ` (${product.ratings.count})`
                          : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-bold text-gray-900">
                        ₹{product.discountPrice || product.price || 0}
                      </span>
                      {product.mrp &&
                        product.discountPrice &&
                        product.mrp > product.discountPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.mrp}
                          </span>
                        )}
                    </div>

                    {product.stock > 0 ? (
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2 transform hover:scale-105"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 py-2 rounded-lg font-medium cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Link for Mobile */}
          {featuredProducts.length > 0 && (
            <div className="text-center mt-8 md:hidden">
              <Link
                to="/shop"
                className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
              >
                View All Products <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section with Parallax */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=1920&h=1080&fit=crop)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your Spiritual Journey Today
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of devotees who trust Sanskaar for authentic rituals
            and spiritual guidance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-orange-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all font-semibold shadow-lg transform hover:scale-105"
            >
              Create Account
            </Link>
            <Link
              to="/poojas"
              className="bg-transparent text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-all border-2 border-white font-semibold transform hover:scale-105"
            >
              Browse Poojas
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
