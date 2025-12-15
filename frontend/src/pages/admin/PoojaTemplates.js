import React, { useState, useEffect } from "react";
import { Upload, X, Edit, Trash2, Plus, Save, Search, GripVertical, ShoppingBag } from "lucide-react";
import api from "../../services/api";

const PoojaTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [steps, setSteps] = useState([]);
  const [mantras, setMantras] = useState([]);
  const [deities, setDeities] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [formData, setFormData] = useState({
    name: { hi: "", en: "" },
    short_description: { hi: "", en: "" },
    description: { hi: "", en: "" },
    deity_id: "",
    category: "DAILY",
    difficulty_level: "BEGINNER",
    total_duration_minutes: 30,
    main_image_url: "",
    thumbnail_url: "",
    steps: [],
    samagri_list: [], // Now stores product references
    benefits: { hi: "", en: "" },
    isFeatured: false,
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [templatesRes, stepsRes, mantrasRes, deitiesRes, productsRes] = await Promise.all([
        api.get("/admin/master/pooja-templates"),
        api.get("/admin/master/steps"),
        api.get("/admin/master/mantras"),
        api.get("/admin/master/deities"),
        api.get("/shop/products"), // Fetch products for samagri
      ]);
      setTemplates(templatesRes.data.templates || []);
      setSteps(stepsRes.data.steps || []);
      setMantras(mantrasRes.data.mantras || []);
      setDeities(deitiesRes.data.deities || []);
      setProducts(productsRes.data.products || productsRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      setUploading({ ...uploading, [field]: true });
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "pooja-templates");
      const res = await api.post("/admin/master/upload", uploadData, { headers: { "Content-Type": "multipart/form-data" } });
      setFormData({ ...formData, [field]: res.data.url });
    } catch (e) { alert("Upload failed"); }
    finally { setUploading({ ...uploading, [field]: false }); }
  };

  // Add step to template
  const addStep = (stepCode) => {
    if (!stepCode) return;
    const step = steps.find(s => s.step_code === stepCode);
    if (!step) return;
    const exists = formData.steps.find(s => s.step_code === stepCode);
    if (exists) { alert("Step already added!"); return; }
    
    setFormData({
      ...formData,
      steps: [...formData.steps, {
        step_code: step.step_code,
        step_id: step._id,
        order: formData.steps.length + 1,
        duration_minutes: step.duration_minutes || 5,
        mantra_id: "",
        mantra_repeat_count: 11,
        is_optional: false,
      }]
    });
  };

  // Remove step
  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    newSteps.forEach((s, i) => s.order = i + 1);
    setFormData({ ...formData, steps: newSteps });
  };

  // Move step up/down
  const moveStep = (index, direction) => {
    const newSteps = [...formData.steps];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSteps.length) return;
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    newSteps.forEach((s, i) => s.order = i + 1);
    setFormData({ ...formData, steps: newSteps });
  };

  // Update step
  const updateStep = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index][field] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  // Add product to samagri
  const addSamagri = (productId) => {
    if (!productId) return;
    const product = products.find(p => p._id === productId);
    if (!product) return;
    const exists = formData.samagri_list.find(s => s.product_id === productId);
    if (exists) { alert("Product already added!"); return; }
    
    setFormData({
      ...formData,
      samagri_list: [...formData.samagri_list, {
        product_id: product._id,
        product_name: product.name,
        product_image: product.images?.[0] || product.image || "",
        quantity: "1",
        is_required: true,
      }]
    });
    setProductSearch("");
  };

  // Update samagri quantity
  const updateSamagri = (index, field, value) => {
    const newList = [...formData.samagri_list];
    newList[index][field] = value;
    setFormData({ ...formData, samagri_list: newList });
  };

  // Remove samagri
  const removeSamagri = (index) => {
    setFormData({ ...formData, samagri_list: formData.samagri_list.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.steps.length === 0) { alert("Please add at least one step!"); return; }
    try {
      if (editing) await api.put(`/admin/master/pooja-templates/${editing._id}`, formData);
      else await api.post("/admin/master/pooja-templates", formData);
      setShowModal(false); resetForm(); fetchData();
    } catch (e) { alert(e.response?.data?.message || e.message); }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({
      name: item.name || { hi: "", en: "" },
      short_description: item.short_description || { hi: "", en: "" },
      description: item.description || { hi: "", en: "" },
      deity_id: item.deity_id?._id || item.deity_id || "",
      category: item.category || "DAILY",
      difficulty_level: item.difficulty_level || "BEGINNER",
      total_duration_minutes: item.total_duration_minutes || 30,
      main_image_url: item.main_image_url || "",
      thumbnail_url: item.thumbnail_url || "",
      steps: item.steps?.map(s => ({
        step_code: s.step_code,
        step_id: s.step_id,
        order: s.order,
        duration_minutes: s.duration_minutes || 5,
        mantra_id: s.mantra_id?._id || s.mantra_id || "",
        mantra_repeat_count: s.mantra_repeat_count || 11,
        is_optional: s.is_optional || false,
      })) || [],
      samagri_list: item.samagri_list?.map(s => ({
        product_id: s.product_id?._id || s.product_id || "",
        product_name: s.product_name || s.product_id?.name || s.item_name?.hi || "",
        product_image: s.product_image || s.product_id?.images?.[0] || "",
        quantity: s.quantity || "1",
        is_required: s.is_required !== false,
      })) || [],
      benefits: item.benefits || { hi: "", en: "" },
      isFeatured: item.isFeatured || false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try { await api.delete(`/admin/master/pooja-templates/${id}`); fetchData(); } catch (e) { alert(e.message); }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      name: { hi: "", en: "" }, short_description: { hi: "", en: "" }, description: { hi: "", en: "" },
      deity_id: "", category: "DAILY", difficulty_level: "BEGINNER", total_duration_minutes: 30,
      main_image_url: "", thumbnail_url: "", steps: [], samagri_list: [], benefits: { hi: "", en: "" }, isFeatured: false,
    });
    setProductSearch("");
  };

  const filtered = templates.filter(t => 
    !searchTerm || 
    t.name?.hi?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.name?.en?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const categories = ["DAILY", "FESTIVAL", "SPECIAL", "OCCASION", "NAVAGRAHA", "SANATAN"];
  const difficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

  // Filter products for search
  const filteredProducts = products.filter(p => 
    !formData.samagri_list.find(s => s.product_id === p._id) &&
    (!productSearch || 
     (typeof p.name === 'string' && p.name.toLowerCase().includes(productSearch.toLowerCase())) ||
     (p.name?.english && p.name.english.toLowerCase().includes(productSearch.toLowerCase())) ||
     (p.name?.hindi && p.name.hindi.includes(productSearch)) ||
     (p.nameHindi && p.nameHindi.includes(productSearch)))
  );

  const FileUploadField = ({ label, field, currentUrl }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {currentUrl ? (
        <div className="flex items-center gap-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <img src={currentUrl} alt="" className="w-12 h-12 object-cover rounded" />
          <span className="text-sm text-green-700 flex-1">✓ Uploaded</span>
          <button type="button" onClick={() => setFormData({ ...formData, [field]: "" })} className="p-1 text-red-600"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <div className="relative">
          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, field)} className="hidden" id={`file-${field}`} />
          <label htmlFor={`file-${field}`} className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-orange-500 text-sm">
            {uploading[field] ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4 text-gray-400" />}
            <span className="text-gray-600">{uploading[field] ? "Uploading..." : "Upload"}</span>
          </label>
        </div>
      )}
    </div>
  );

  // Get step name
  const getStepName = (stepCode) => {
    const step = steps.find(s => s.step_code === stepCode);
    return step ? `${step.title?.hi} (${step.title?.en})` : stepCode;
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Pooja Templates</h1><p className="text-gray-600">Create poojas with steps & products selection</p></div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"><Plus className="w-5 h-5" />Create Pooja</button>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search poojas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
      </div>

      {loading ? <div className="text-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div key={t._id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition-shadow">
              {t.main_image_url ? <img src={t.main_image_url} alt="" className="w-full h-40 object-cover" /> : <div className="w-full h-40 bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white text-4xl">🙏</div>}
              <div className="p-4">
                <div className="flex gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">{t.category}</span>
                  {t.isFeatured && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">Featured</span>}
                </div>
                <h3 className="font-bold text-gray-900">{t.name?.hi}</h3>
                <p className="text-sm text-gray-600">{t.name?.en}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>⏱️ {t.total_duration_minutes} min</span>
                  <span>📝 {t.steps?.length || 0} steps</span>
                  <span>🛒 {t.samagri_list?.length || 0} items</span>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button onClick={() => handleEdit(t)} className="flex-1 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">Edit</button>
                  <button onClick={() => handleDelete(t._id)} className="flex-1 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-full text-center py-12 text-gray-500">No poojas found. Create your first pooja!</div>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold">{editing ? "Edit Pooja" : "Create New Pooja"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Name (Hindi) *</label><input type="text" value={formData.name.hi} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, hi: e.target.value } })} placeholder="दैनिक गणेश पूजा" className="w-full px-4 py-2 border rounded-lg" required /></div>
                <div><label className="block text-sm font-medium mb-1">Name (English) *</label><input type="text" value={formData.name.en} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })} placeholder="Daily Ganesh Puja" className="w-full px-4 py-2 border rounded-lg" required /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div><label className="block text-sm font-medium mb-1">Deity</label>
                  <select value={formData.deity_id} onChange={(e) => setFormData({ ...formData, deity_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                    <option value="">-- Select --</option>
                    {deities.map(d => <option key={d._id} value={d._id}>{d.name?.hi}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select value={formData.difficulty_level} onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                    {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Duration (min)</label><input type="number" value={formData.total_duration_minutes} onChange={(e) => setFormData({ ...formData, total_duration_minutes: parseInt(e.target.value) || 30 })} className="w-full px-4 py-2 border rounded-lg" /></div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-2 gap-4">
                <FileUploadField label="Main Image" field="main_image_url" currentUrl={formData.main_image_url} />
                <FileUploadField label="Thumbnail" field="thumbnail_url" currentUrl={formData.thumbnail_url} />
              </div>

              {/* Steps Selection */}
              <div className="border rounded-xl p-4 bg-orange-50">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">📝 Pooja Steps</h3>
                
                <div className="flex gap-2 mb-4">
                  <select id="stepSelector" className="flex-1 px-4 py-2 border rounded-lg bg-white">
                    <option value="">-- Select Step to Add --</option>
                    {steps.filter(s => !formData.steps.find(fs => fs.step_code === s.step_code)).map(s => (
                      <option key={s._id} value={s.step_code}>{s.title?.hi} ({s.title?.en})</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => { const sel = document.getElementById("stepSelector"); addStep(sel.value); sel.value = ""; }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1">
                    <Plus className="w-5 h-5" /> Add
                  </button>
                </div>

                {formData.steps.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg bg-white">
                    No steps added. Select steps from dropdown above.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                        <span className="w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-sm">{step.order}</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{getStepName(step.step_code)}</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <select value={step.mantra_id} onChange={(e) => updateStep(index, "mantra_id", e.target.value)} className="text-xs px-2 py-1 border rounded">
                              <option value="">No Mantra</option>
                              {mantras.map(m => <option key={m._id} value={m._id}>{m.mantra_name}</option>)}
                            </select>
                            {step.mantra_id && (
                              <select value={step.mantra_repeat_count} onChange={(e) => updateStep(index, "mantra_repeat_count", parseInt(e.target.value))} className="text-xs px-2 py-1 border rounded">
                                {[1, 11, 21, 51, 108].map(n => <option key={n} value={n}>{n}x</option>)}
                              </select>
                            )}
                            <input type="number" value={step.duration_minutes} onChange={(e) => updateStep(index, "duration_minutes", parseInt(e.target.value) || 5)} className="w-16 text-xs px-2 py-1 border rounded" placeholder="Min" />
                            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={step.is_optional} onChange={(e) => updateStep(index, "is_optional", e.target.checked)} />Optional</label>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => moveStep(index, "up")} disabled={index === 0} className="p-1 text-gray-500 hover:bg-gray-200 rounded disabled:opacity-30">↑</button>
                          <button type="button" onClick={() => moveStep(index, "down")} disabled={index === formData.steps.length - 1} className="p-1 text-gray-500 hover:bg-gray-200 rounded disabled:opacity-30">↓</button>
                          <button type="button" onClick={() => removeStep(index)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Samagri - Product Selection */}
              <div className="border rounded-xl p-4 bg-amber-50">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> Samagri (Select Products)</h3>
                
                {/* Product Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products to add..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white"
                  />
                  
                  {/* Product Dropdown */}
                  {productSearch && filteredProducts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
                      {filteredProducts.slice(0, 10).map(p => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => addSamagri(p._id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-orange-50 text-left border-b last:border-0"
                        >
                          {(p.images?.[0] || p.image || p.mainImage) ? (
                            <img src={p.images?.[0] || p.image || p.mainImage} alt="" className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">📦</div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-sm">{typeof p.name === 'string' ? p.name : (p.name?.english || p.name?.hindi || 'Product')}</div>
                            {(p.nameHindi || p.name?.hindi) && <div className="text-xs text-gray-500">{p.nameHindi || p.name?.hindi}</div>}
                          </div>
                          <span className="text-orange-600 font-medium">₹{p.discountPrice || p.price}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Products */}
                {formData.samagri_list.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg bg-white">
                    No products added. Search and select products above.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.samagri_list.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm">
                        {item.product_image ? (
                          <img src={item.product_image} alt="" className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-amber-100 rounded flex items-center justify-center">🪔</div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.product_name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500">Qty:</label>
                          <input 
                            type="text" 
                            value={item.quantity} 
                            onChange={(e) => updateSamagri(index, "quantity", e.target.value)}
                            className="w-16 px-2 py-1 border rounded text-sm"
                            placeholder="1"
                          />
                          <label className="flex items-center gap-1 text-xs">
                            <input 
                              type="checkbox" 
                              checked={item.is_required} 
                              onChange={(e) => updateSamagri(index, "is_required", e.target.checked)}
                            />
                            Required
                          </label>
                          <button type="button" onClick={() => removeSamagri(index)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Description (Hindi)</label><textarea value={formData.description.hi} onChange={(e) => setFormData({ ...formData, description: { ...formData.description, hi: e.target.value } })} rows={3} className="w-full px-4 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Description (English)</label><textarea value={formData.description.en} onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })} rows={3} className="w-full px-4 py-2 border rounded-lg" /></div>
              </div>

              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-5 h-5 text-orange-600" /><span className="font-medium">Featured Pooja (Show on Homepage)</span></label>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"><Save className="w-5 h-5" />{editing ? "Update Pooja" : "Create Pooja"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoojaTemplates;
