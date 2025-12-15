import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Search as SearchIcon, Filter, Loader } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const query = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState({
    poojas: [],
    products: [],
    temples: [],
    pandits: [],
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, i18n.language]);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/search`,
        {
          params: { q: searchTerm, lang: i18n.language },
        }
      );

      setResults(response.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
  };

  const totalResults =
    (results.poojas?.length || 0) +
    (results.products?.length || 0) +
    (results.temples?.length || 0) +
    (results.pandits?.length || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("common.search")}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
            />
          </div>
        </form>

        {/* Results Count */}
        {query && !loading && (
          <div className="mb-6">
            <p className="text-gray-600">
              Found <span className="font-bold">{totalResults}</span> results
              for "{query}"
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-8">
            {["all", "poojas", "products", "temples", "pandits"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 font-medium capitalize ${
                  activeTab === tab
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t(`nav.${tab}`)}
                {tab !== "all" && results[tab] && (
                  <span className="ml-2 text-sm">({results[tab].length})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16">
            <LoadingSpinner size="large" text="Searching..." />
          </div>
        )}

        {/* Results */}
        {!loading && (
          <div className="space-y-8">
            {/* Poojas Results */}
            {(activeTab === "all" || activeTab === "poojas") &&
              results.poojas?.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t("nav.poojas")}
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.poojas.map((pooja) => (
                      <Link
                        key={pooja._id}
                        to={`/poojas/${pooja._id}`}
                        className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {pooja.name[i18n.language] || pooja.name.en}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {pooja.deity[i18n.language] || pooja.deity.en}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            {/* Products Results */}
            {(activeTab === "all" || activeTab === "products") &&
              results.products?.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t("nav.shop")}
                  </h2>
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {results.products.map((product) => (
                      <Link
                        key={product._id}
                        to={`/shop/${product._id}`}
                        className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
                      >
                        <img
                          src={product.mainImage}
                          alt={product.name[i18n.language] || product.name.en}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {product.name[i18n.language] || product.name.en}
                          </h3>
                          <p className="text-orange-600 font-bold">
                            ₹{product.discountPrice || product.price}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            {/* Empty State */}
            {totalResults === 0 && query && (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">
                  No results found for "{query}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
