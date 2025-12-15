import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image,
  Volume2,
  Video,
  Package,
  Search,
  X,
  ShoppingCart,
  Check,
  Loader,
  BookOpen,
} from "lucide-react";
import api from "../../services/api";

const AddPooja = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [currentLang, setCurrentLang] = useState("hindi");
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const languages = [
    { code: "hindi", label: "हिंदी" },
    { code: "sanskrit", label: "संस्कृत" },
    { code: "english", label: "English" },
  ];

  const categories = ["Daily", "Festival", "Occasion", "Sanatan", "Other"];

  const [formData, setFormData] = useState({
    poojaType: "",
    poojaLanguage: "hindi",
    mainImage: "",
    duration: "",
    price: 0,
    category: "Other",
    featured: false,
    importance: { hindi: "", sanskrit: "", english: "" },
    steps: { hindi: [], sanskrit: [], english: [] },
    samagri: [],
  });

  useEffect(() => {
    loadProducts();
    if (isEditMode) {
      loadPooja();
    }
  }, [id]);

  const loadProducts = async () => {
    try {
      const response = await api.get("/admin/products?limit=100");
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadPooja = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/poojas/${id}`);
      const pooja = response.data;
      setFormData({
        poojaType: pooja.poojaType || "",
        poojaLanguage: pooja.poojaLanguage || "hindi",
        mainImage: pooja.mainImage || "",
        duration: pooja.duration || "",
        price: pooja.price || 0,
        category: pooja.category || "Other",
        featured: pooja.featured || false,
        importance: pooja.importance || { hindi: "", sanskrit: "", english: "" },
        steps: pooja.steps || { hindi: [], sanskrit: [], english: [] },
        samagri: pooja.samagri || [],
      });
    } catch (error) {
      console.error("Error loading pooja:", error);
      alert("Failed to load pooja");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.poojaType) {
      alert("Please enter pooja name");
      return;
    }

    try {
      setLoading(true);
      if (isEditMode) {
        await api.put(`/admin/poojas/${id}`, formData);
        alert("Pooja updated successfully!");
      } else {
        await api.post("/admin/poojas", formData);
        alert("Pooja created successfully!");
      }
      navigate("/admin/poojas");
    } catch (error) {
      console.error("Error saving pooja:", error);
      alert("Failed to save pooja");
    } finally {
      setLoading(false);
    }
  };

  const addStep = (lang) => {
    const newStep = {
      id: Date.now(),
      title: "",
      description: "",
      mantra: "",
      image: "",
      audio: "",
      video: "",
    };
    setFormData({
      ...formData,
      steps: {
        ...formData.steps,
        [lang]: [...formData.steps[lang], newStep],
      },
    });
  };

  const updateStep = (lang, stepId, field, value) => {
    setFormData({
      ...formData,
      steps: {
        ...formData.steps,
        [lang]: formData.steps[lang].map((step) =>
          step.id === stepId ? { ...step, [field]: value } : step
        ),
      },
    });
  };

  const removeStep = (lang, stepId) => {
    setFormData({
      ...formData,
      steps: {
        ...formData.steps,
        [lang]: formData.steps[lang].filter((step) => step.id !== stepId),
      },
    });
  };

  const addSamagri = (product) => {
    const newSamagri = {
      id: Date.now(),
      productId: product._id,
      name: { hindi: product.name?.hindi || "", english: product.name?.english || "" },
      quantity: "1",
      unit: "piece",
      isRequired: true,
      notes: "",
      price: product.discountPrice || product.price || 0,
      image: product.mainImage || "",
    };
    setFormData({ ...formData, samagri: [...formData.samagri, newSamagri] });
    setShowProductModal(false);
  };

  const addManualSamagri = () => {
    const newSamagri = {
      id: Date.now(),
      productId: null,
      name: { hindi: "", english: "" },
      quantity: "1",
      unit: "piece",
      isRequired: false,
      notes: "",
      price: 0,
      image: "",
    };
    setFormData({ ...formData, samagri: [...formData.samagri, newSamagri] });
  };

  const updateSamagri = (id, field, value) => {
    setFormData({
      ...formData,
      samagri: formData.samagri.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const removeSamagri = (id) => {
    setFormData({
      ...formData,
      samagri: formData.samagri.filter((item) => item.id !== id),
    });
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name?.english?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.name?.hindi?.includes(productSearch)
  );

  const samagriTotalPrice = formData.samagri.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/poojas")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? "Edit Pooja" : "Add New Pooja"}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? "Update pooja details" : "Create a new pooja with steps and samagri"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 shadow-sm border">
        {[
          { id: "basic", label: "Basic Info", icon: BookOpen },
          { id: "steps", label: "Pooja Steps", icon: BookOpen },
          { id: "samagri", label: "Samagri", icon: ShoppingCart },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? "bg-orange-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            {tab.id === "samagri" && formData.samagri.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {formData.samagri.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pooja Name / पूजा का नाम *
                </label>
                <input
                  type="text"
                  value={formData.poojaType}
                  onChange={(e) => setFormData({ ...formData, poojaType: e.target.value })}
                  placeholder="e.g., Satyanarayan Katha"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 2-3 hours"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Image URL
                </label>
                <input
                  type="url"
                  value={formData.mainImage}
                  onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
                {formData.mainImage && (
                  <img src={formData.mainImage} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
                )}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="font-medium text-gray-700">Featured Pooja</span>
                </label>
              </div>

              {/* Importance in all languages */}
              {languages.map((lang) => (
                <div key={lang.code} className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Importance ({lang.label})
                  </label>
                  <textarea
                    value={formData.importance[lang.code]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        importance: { ...formData.importance, [lang.code]: e.target.value },
                      })
                    }
                    placeholder={`Enter importance in ${lang.label}...`}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Steps Tab */}
        {activeTab === "steps" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Language Selector */}
            <div className="flex gap-2 mb-6">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setCurrentLang(lang.code)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentLang === lang.code
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {lang.label} ({formData.steps[lang.code].length})
                </button>
              ))}
            </div>

            {/* Steps List */}
            <div className="space-y-4">
              {formData.steps[currentLang].length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No steps added yet. Click below to add steps.
                </div>
              ) : (
                formData.steps[currentLang].map((step, index) => (
                  <div key={step.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-orange-600">Step {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeStep(currentLang, step.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateStep(currentLang, step.id, "title", e.target.value)}
                        placeholder="Step Title"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                      <input
                        type="text"
                        value={step.mantra}
                        onChange={(e) => updateStep(currentLang, step.id, "mantra", e.target.value)}
                        placeholder="Mantra (optional)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                      <div className="md:col-span-2">
                        <textarea
                          value={step.description}
                          onChange={(e) => updateStep(currentLang, step.id, "description", e.target.value)}
                          placeholder="Step Description"
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>
                      <input
                        type="url"
                        value={step.image}
                        onChange={(e) => updateStep(currentLang, step.id, "image", e.target.value)}
                        placeholder="Image URL"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                      <input
                        type="url"
                        value={step.audio}
                        onChange={(e) => updateStep(currentLang, step.id, "audio", e.target.value)}
                        placeholder="Audio URL"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                      <input
                        type="url"
                        value={step.video}
                        onChange={(e) => updateStep(currentLang, step.id, "video", e.target.value)}
                        placeholder="Video URL"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                  </div>
                ))
              )}

              <button
                type="button"
                onClick={() => addStep(currentLang)}
                className="w-full py-4 border-2 border-dashed border-orange-300 text-orange-600 rounded-xl hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Step in {languages.find((l) => l.code === currentLang)?.label}
              </button>
            </div>
          </div>
        )}

        {/* Samagri Tab */}
        {activeTab === "samagri" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Samagri / पूजा सामग्री</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Add materials required for this pooja.
                </p>
              </div>
              {formData.samagri.length > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="text-2xl font-bold text-orange-600">₹{samagriTotalPrice}</p>
                </div>
              )}
            </div>

            {/* Add Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                <Package className="w-5 h-5" />
                Add from Products
              </button>
              <button
                type="button"
                onClick={addManualSamagri}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Manual Item
              </button>
            </div>

            {/* Samagri List */}
            {formData.samagri.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No samagri added yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.samagri.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex gap-4">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 grid md:grid-cols-4 gap-3">
                        <input
                          type="text"
                          value={item.name.english}
                          onChange={(e) =>
                            updateSamagri(item.id, "name", { ...item.name, english: e.target.value })
                          }
                          placeholder="Name (English)"
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                        <input
                          type="text"
                          value={item.name.hindi}
                          onChange={(e) =>
                            updateSamagri(item.id, "name", { ...item.name, hindi: e.target.value })
                          }
                          placeholder="नाम (हिंदी)"
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => updateSamagri(item.id, "quantity", e.target.value)}
                            placeholder="Qty"
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => updateSamagri(item.id, "unit", e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                          >
                            <option value="piece">Piece</option>
                            <option value="kg">Kg</option>
                            <option value="g">Gram</option>
                            <option value="packet">Packet</option>
                          </select>
                        </div>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateSamagri(item.id, "price", parseFloat(e.target.value) || 0)}
                          placeholder="Price"
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSamagri(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/poojas")}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEditMode ? "Update Pooja" : "Create Pooja"}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Select Product</h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-96 p-4">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => addSamagri(product)}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
                    >
                      <img
                        src={product.mainImage || "https://via.placeholder.com/60"}
                        alt={product.name?.english}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{product.name?.english}</p>
                        <p className="text-sm text-gray-500 truncate">{product.name?.hindi}</p>
                        <p className="text-sm font-bold text-orange-600">₹{product.price || 0}</p>
                      </div>
                      <Plus className="w-5 h-5 text-orange-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPooja;
