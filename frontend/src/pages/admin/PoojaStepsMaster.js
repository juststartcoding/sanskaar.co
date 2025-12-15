import React, { useState, useEffect } from "react";
import { Upload, X, Edit, Trash2, Plus, Save, Search } from "lucide-react";
import api from "../../services/api";

const PoojaStepsMaster = () => {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [uploading, setUploading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    step_code: "",
    title: { hi: "", en: "", sa: "" },
    instruction: { hi: "", en: "" },
    description: { hi: "", en: "" },
    icon_url: "",
    image_url: "",
    audio_url: "",
    video_url: "",
    is_mandatory: false,
    order_hint: 0,
    duration_minutes: 5,
    background_color: "#FFF7ED",
  });

  useEffect(() => { fetchSteps(); }, []);

  const fetchSteps = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/master/steps");
      setSteps(res.data.steps || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { alert("File size must be less than 50MB"); return; }

    try {
      setUploading({ ...uploading, [field]: true });
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "pooja-steps");
      const res = await api.post("/admin/master/upload", uploadData, { headers: { "Content-Type": "multipart/form-data" } });
      setFormData({ ...formData, [field]: res.data.url });
    } catch (e) { alert("Upload failed: " + (e.response?.data?.message || e.message)); }
    finally { setUploading({ ...uploading, [field]: false }); }
  };

  const removeFile = (field) => setFormData({ ...formData, [field]: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStep) await api.put(`/admin/master/steps/${editingStep._id}`, formData);
      else await api.post("/admin/master/steps", formData);
      setShowModal(false); resetForm(); fetchSteps();
    } catch (e) { alert(e.response?.data?.message || e.message); }
  };

  const handleEdit = (step) => {
    setEditingStep(step);
    setFormData({
      step_code: step.step_code || "", title: step.title || { hi: "", en: "", sa: "" },
      instruction: step.instruction || { hi: "", en: "" }, description: step.description || { hi: "", en: "" },
      icon_url: step.icon_url || "", image_url: step.image_url || "",
      audio_url: step.audio_url || "", video_url: step.video_url || "",
      is_mandatory: step.is_mandatory || false, order_hint: step.order_hint || 0,
      duration_minutes: step.duration_minutes || 5, background_color: step.background_color || "#FFF7ED",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this step?")) return;
    try { await api.delete(`/admin/master/steps/${id}`); fetchSteps(); } catch (e) { alert(e.message); }
  };

  const resetForm = () => {
    setEditingStep(null);
    setFormData({ step_code: "", title: { hi: "", en: "", sa: "" }, instruction: { hi: "", en: "" },
      description: { hi: "", en: "" }, icon_url: "", image_url: "", audio_url: "", video_url: "",
      is_mandatory: false, order_hint: 0, duration_minutes: 5, background_color: "#FFF7ED" });
  };

  const filteredSteps = steps.filter(s =>
    s.step_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.title?.hi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.title?.en?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const FileUploadField = ({ label, field, accept, currentUrl }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {currentUrl ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          {field.includes("image") || field.includes("icon") ? (
            <img src={currentUrl} alt="" className="w-16 h-16 object-cover rounded" />
          ) : field.includes("audio") ? (
            <audio src={currentUrl} controls className="h-10" />
          ) : field.includes("video") ? (
            <video src={currentUrl} className="w-24 h-16 object-cover rounded" />
          ) : null}
          <div className="flex-1"><p className="text-sm text-green-700">✓ Uploaded</p></div>
          <button type="button" onClick={() => removeFile(field)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
      ) : (
        <div className="relative">
          <input type="file" accept={accept} onChange={(e) => handleFileUpload(e, field)} className="hidden" id={`file-${field}`} disabled={uploading[field]} />
          <label htmlFor={`file-${field}`} className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploading[field] ? "bg-gray-100" : "border-gray-300 hover:border-orange-500 hover:bg-orange-50"}`}>
            {uploading[field] ? (<><div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /><span>Uploading...</span></>) : (<><Upload className="w-5 h-5 text-gray-400" /><span className="text-gray-600">Click to upload</span></>)}
          </label>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Pooja Steps Master</h1><p className="text-gray-600">Manage steps used in all poojas</p></div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"><Plus className="w-5 h-5" />Add Step</button>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search steps..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" />
      </div>

      {loading ? (<div className="text-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" /></div>) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Order</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Icon</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Hindi</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">English</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Mandatory</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Media</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSteps.map((step) => (
                <tr key={step._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{step.order_hint}</td>
                  <td className="px-4 py-3">{step.icon_url ? <img src={step.icon_url} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 bg-gray-200 rounded-lg" />}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-mono">{step.step_code}</span></td>
                  <td className="px-4 py-3 text-sm">{step.title?.hi}</td>
                  <td className="px-4 py-3 text-sm">{step.title?.en}</td>
                  <td className="px-4 py-3">{step.is_mandatory ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Yes</span> : <span className="text-gray-400">No</span>}</td>
                  <td className="px-4 py-3 text-sm">{step.duration_minutes} min</td>
                  <td className="px-4 py-3"><div className="flex gap-1">{step.audio_url && <span>🔊</span>}{step.video_url && <span>🎬</span>}{step.image_url && <span>🖼️</span>}</div></td>
                  <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => handleEdit(step)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button><button onClick={() => handleDelete(step._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSteps.length === 0 && <div className="text-center py-12 text-gray-500">No steps found. Add your first step!</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingStep ? "Edit Step" : "Add New Step"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Step Code *</label><input type="text" value={formData.step_code} onChange={(e) => setFormData({ ...formData, step_code: e.target.value.toUpperCase().replace(/\s+/g, "_") })} placeholder="GANESH_VANDANA" className="w-full px-4 py-2 border rounded-lg" required disabled={editingStep} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Order</label><input type="number" value={formData.order_hint} onChange={(e) => setFormData({ ...formData, order_hint: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-1">Duration (min)</label><input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 5 })} className="w-full px-4 py-2 border rounded-lg" /></div>
                </div>
              </div>

              <div><h3 className="text-sm font-semibold mb-3">Titles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Hindi *</label><input type="text" value={formData.title.hi} onChange={(e) => setFormData({ ...formData, title: { ...formData.title, hi: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" required /></div>
                  <div><label className="block text-sm font-medium mb-1">English *</label><input type="text" value={formData.title.en} onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" required /></div>
                  <div><label className="block text-sm font-medium mb-1">Sanskrit</label><input type="text" value={formData.title.sa} onChange={(e) => setFormData({ ...formData, title: { ...formData.title, sa: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" /></div>
                </div>
              </div>

              <div><h3 className="text-sm font-semibold mb-3">Instructions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Hindi</label><textarea value={formData.instruction.hi} onChange={(e) => setFormData({ ...formData, instruction: { ...formData.instruction, hi: e.target.value } })} rows={3} className="w-full px-4 py-2 border rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-1">English</label><textarea value={formData.instruction.en} onChange={(e) => setFormData({ ...formData, instruction: { ...formData.instruction, en: e.target.value } })} rows={3} className="w-full px-4 py-2 border rounded-lg" /></div>
                </div>
              </div>

              <div><h3 className="text-sm font-semibold mb-3">Media Files (Upload)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileUploadField label="Icon Image" field="icon_url" accept="image/*" currentUrl={formData.icon_url} />
                  <FileUploadField label="Step Image" field="image_url" accept="image/*" currentUrl={formData.image_url} />
                  <FileUploadField label="Audio (MP3)" field="audio_url" accept="audio/*" currentUrl={formData.audio_url} />
                  <FileUploadField label="Video (MP4)" field="video_url" accept="video/*" currentUrl={formData.video_url} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.is_mandatory} onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })} className="w-5 h-5 text-orange-600 rounded" /><span className="text-sm font-medium">Mandatory Step</span></label>
                <div className="flex items-center gap-2"><label className="text-sm font-medium">Background:</label><input type="color" value={formData.background_color} onChange={(e) => setFormData({ ...formData, background_color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" /></div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={Object.values(uploading).some(Boolean)} className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"><Save className="w-5 h-5" />{editingStep ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoojaStepsMaster;
