import React, { useState, useEffect } from "react";
import { Upload, X, Edit, Trash2, Plus, Save, Search } from "lucide-react";
import api from "../../services/api";

const MantrasMaster = () => {
  const [mantras, setMantras] = useState([]);
  const [deities, setDeities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    mantra_name: "", mantra_code: "",
    text: { sa: "", hi: "", en: "" },
    meaning: { hi: "", en: "" },
    audio_url: "", video_url: "",
    repeat_allowed: [11, 21, 108], default_repeat: 11,
    deity_id: "", category: "GENERAL", safe_for_all: true,
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mantrasRes, deitiesRes] = await Promise.all([
        api.get("/admin/master/mantras"),
        api.get("/admin/master/deities")
      ]);
      setMantras(mantrasRes.data.mantras || []);
      setDeities(deitiesRes.data.deities || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading({ ...uploading, [field]: true });
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "mantras");
      const res = await api.post("/admin/master/upload", uploadData, { headers: { "Content-Type": "multipart/form-data" } });
      setFormData({ ...formData, [field]: res.data.url });
    } catch (e) { alert("Upload failed"); }
    finally { setUploading({ ...uploading, [field]: false }); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/admin/master/mantras/${editing._id}`, formData);
      else await api.post("/admin/master/mantras", formData);
      setShowModal(false); resetForm(); fetchData();
    } catch (e) { alert(e.response?.data?.message || e.message); }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({
      mantra_name: item.mantra_name || "", mantra_code: item.mantra_code || "",
      text: item.text || { sa: "", hi: "", en: "" },
      meaning: item.meaning || { hi: "", en: "" },
      audio_url: item.audio_url || "", video_url: item.video_url || "",
      repeat_allowed: item.repeat_allowed || [11, 21, 108],
      default_repeat: item.default_repeat || 11,
      deity_id: item.deity_id?._id || item.deity_id || "",
      category: item.category || "GENERAL",
      safe_for_all: item.safe_for_all !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this mantra?")) return;
    try { await api.delete(`/admin/master/mantras/${id}`); fetchData(); } catch (e) { alert(e.message); }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ mantra_name: "", mantra_code: "", text: { sa: "", hi: "", en: "" }, meaning: { hi: "", en: "" },
      audio_url: "", video_url: "", repeat_allowed: [11, 21, 108], default_repeat: 11, deity_id: "", category: "GENERAL", safe_for_all: true });
  };

  const filteredMantras = mantras.filter(m =>
    m.mantra_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.mantra_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const FileUploadField = ({ label, field, accept, currentUrl }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {currentUrl ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          {field.includes("audio") ? <audio src={currentUrl} controls className="h-10" /> : <video src={currentUrl} className="w-24 h-16 rounded" />}
          <p className="text-sm text-green-700 flex-1">✓ Uploaded</p>
          <button type="button" onClick={() => setFormData({ ...formData, [field]: "" })} className="p-2 text-red-600"><X className="w-5 h-5" /></button>
        </div>
      ) : (
        <div className="relative">
          <input type="file" accept={accept} onChange={(e) => handleFileUpload(e, field)} className="hidden" id={`file-${field}`} />
          <label htmlFor={`file-${field}`} className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50">
            {uploading[field] ? <><div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /><span>Uploading...</span></> : <><Upload className="w-5 h-5 text-gray-400" /><span className="text-gray-600">Click to upload</span></>}
          </label>
        </div>
      )}
    </div>
  );

  const categories = ["GENERAL", "DEITY_SPECIFIC", "OCCASION", "MORNING", "EVENING", "PROTECTION", "HEALING", "PROSPERITY"];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Mantras Master</h1><p className="text-gray-600">Manage all mantras</p></div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"><Plus className="w-5 h-5" />Add Mantra</button>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search mantras..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
      </div>

      {loading ? <div className="text-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" /></div> : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Deity</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Repeat</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Media</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredMantras.map((m) => (
                <tr key={m._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><div className="font-medium">{m.mantra_name}</div><div className="text-xs text-gray-500 truncate max-w-[200px]">{m.text?.sa}</div></td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-mono">{m.mantra_code}</span></td>
                  <td className="px-4 py-3 text-sm">{m.deity_id?.name?.hi || "-"}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{m.category}</span></td>
                  <td className="px-4 py-3 text-sm">{m.default_repeat}x</td>
                  <td className="px-4 py-3"><div className="flex gap-1">{m.audio_url && <span>🔊</span>}{m.video_url && <span>🎬</span>}</div></td>
                  <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => handleEdit(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button><button onClick={() => handleDelete(m._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMantras.length === 0 && <div className="text-center py-12 text-gray-500">No mantras found.</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editing ? "Edit Mantra" : "Add New Mantra"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Mantra Name *</label><input type="text" value={formData.mantra_name} onChange={(e) => setFormData({ ...formData, mantra_name: e.target.value })} placeholder="Ganesh Mantra" className="w-full px-4 py-2 border rounded-lg" required /></div>
                <div><label className="block text-sm font-medium mb-1">Code</label><input type="text" value={formData.mantra_code} onChange={(e) => setFormData({ ...formData, mantra_code: e.target.value.toUpperCase() })} placeholder="GANESH_MANTRA" className="w-full px-4 py-2 border rounded-lg" disabled={editing} /></div>
              </div>

              <div><h3 className="text-sm font-semibold mb-3">Mantra Text</h3>
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium mb-1">Sanskrit *</label><textarea value={formData.text.sa} onChange={(e) => setFormData({ ...formData, text: { ...formData.text, sa: e.target.value } })} rows={2} placeholder="ॐ गं गणपतये नमः" className="w-full px-4 py-2 border rounded-lg" required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">Hindi</label><textarea value={formData.text.hi} onChange={(e) => setFormData({ ...formData, text: { ...formData.text, hi: e.target.value } })} rows={2} className="w-full px-4 py-2 border rounded-lg" /></div>
                    <div><label className="block text-sm font-medium mb-1">English</label><textarea value={formData.text.en} onChange={(e) => setFormData({ ...formData, text: { ...formData.text, en: e.target.value } })} rows={2} placeholder="Om Gam Ganapataye Namah" className="w-full px-4 py-2 border rounded-lg" /></div>
                  </div>
                </div>
              </div>

              <div><h3 className="text-sm font-semibold mb-3">Meaning</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Hindi</label><textarea value={formData.meaning.hi} onChange={(e) => setFormData({ ...formData, meaning: { ...formData.meaning, hi: e.target.value } })} rows={2} className="w-full px-4 py-2 border rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-1">English</label><textarea value={formData.meaning.en} onChange={(e) => setFormData({ ...formData, meaning: { ...formData.meaning, en: e.target.value } })} rows={2} className="w-full px-4 py-2 border rounded-lg" /></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium mb-1">Deity</label>
                  <select value={formData.deity_id} onChange={(e) => setFormData({ ...formData, deity_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                    <option value="">-- Select Deity --</option>
                    {deities.map(d => <option key={d._id} value={d._id}>{d.name?.hi} ({d.name?.en})</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Default Repeat</label>
                  <select value={formData.default_repeat} onChange={(e) => setFormData({ ...formData, default_repeat: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded-lg">
                    {[1, 11, 21, 51, 108, 1008].map(n => <option key={n} value={n}>{n} times</option>)}
                  </select>
                </div>
              </div>

              <div><h3 className="text-sm font-semibold mb-3">Media Files</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileUploadField label="Audio (MP3)" field="audio_url" accept="audio/*" currentUrl={formData.audio_url} />
                  <FileUploadField label="Video (MP4)" field="video_url" accept="video/*" currentUrl={formData.video_url} />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"><Save className="w-5 h-5" />{editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MantrasMaster;
