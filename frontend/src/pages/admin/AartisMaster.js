import React, { useState, useEffect } from "react";
import { Upload, X, Edit, Trash2, Plus, Save, Search } from "lucide-react";
import api from "../../services/api";

const AartisMaster = () => {
  const [aartis, setAartis] = useState([]);
  const [deities, setDeities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    aarti_code: "",
    title: { hi: "", en: "", sa: "" },
    deity_id: "",
    lyrics: { hi: "", en: "", sa: "" },
    audio_url: "",
    video_url: "",
    duration_sec: 0,
    time_of_day: "ANY",
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aartisRes, deitiesRes] = await Promise.all([
        api.get("/admin/master/aartis"),
        api.get("/admin/master/deities"),
      ]);
      setAartis(aartisRes.data.aartis || []);
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
      uploadData.append("folder", "aartis");
      const res = await api.post("/admin/master/upload", uploadData, { headers: { "Content-Type": "multipart/form-data" } });
      setFormData({ ...formData, [field]: res.data.url });
    } catch (e) { alert("Upload failed"); }
    finally { setUploading({ ...uploading, [field]: false }); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/admin/master/aartis/${editing._id}`, formData);
      else await api.post("/admin/master/aartis", formData);
      setShowModal(false); resetForm(); fetchData();
    } catch (e) { alert(e.response?.data?.message || e.message); }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({
      aarti_code: item.aarti_code || "",
      title: item.title || { hi: "", en: "", sa: "" },
      deity_id: item.deity_id?._id || item.deity_id || "",
      lyrics: item.lyrics || { hi: "", en: "", sa: "" },
      audio_url: item.audio_url || "",
      video_url: item.video_url || "",
      duration_sec: item.duration_sec || 0,
      time_of_day: item.time_of_day || "ANY",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this aarti?")) return;
    try { await api.delete(`/admin/master/aartis/${id}`); fetchData(); } catch (e) { alert(e.message); }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      aarti_code: "", title: { hi: "", en: "", sa: "" }, deity_id: "",
      lyrics: { hi: "", en: "", sa: "" }, audio_url: "", video_url: "",
      duration_sec: 0, time_of_day: "ANY",
    });
  };

  const filtered = aartis.filter(a =>
    a.title?.hi?.includes(searchTerm) ||
    a.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.aarti_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const timeOptions = ["MORNING", "EVENING", "NIGHT", "ANY"];

  const FileUploadField = ({ label, field, accept, currentUrl }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {currentUrl ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          {field.includes("audio") ? (
            <audio src={currentUrl} controls className="h-10 flex-1" />
          ) : (
            <video src={currentUrl} className="w-32 h-20 rounded object-cover" controls />
          )}
          <p className="text-sm text-green-700">✓ Uploaded</p>
          <button type="button" onClick={() => setFormData({ ...formData, [field]: "" })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input type="file" accept={accept} onChange={(e) => handleFileUpload(e, field)} className="hidden" id={`file-${field}`} />
          <label htmlFor={`file-${field}`} className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50">
            {uploading[field] ? (
              <><div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /><span>Uploading...</span></>
            ) : (
              <><Upload className="w-5 h-5 text-gray-400" /><span className="text-gray-600">Click to upload {label.toLowerCase()}</span></>
            )}
          </label>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🪔 Aartis Master</h1>
          <p className="text-gray-600">Manage all aartis with lyrics and audio</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
          <Plus className="w-5 h-5" />Add Aarti
        </button>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search aartis..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((aarti) => (
            <div key={aarti._id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">🪔</div>
                  <div>
                    <h3 className="font-bold">{aarti.title?.hi}</h3>
                    <p className="text-sm text-orange-100">{aarti.title?.en}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-mono">{aarti.aarti_code}</span>
                  {aarti.deity_id && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{aarti.deity_id?.name?.hi}</span>}
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{aarti.time_of_day}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  {aarti.audio_url && <span>🔊 Audio</span>}
                  {aarti.video_url && <span>🎬 Video</span>}
                  {aarti.duration_sec > 0 && <span>⏱️ {Math.floor(aarti.duration_sec / 60)}:{String(aarti.duration_sec % 60).padStart(2, '0')}</span>}
                </div>
                {aarti.audio_url && (
                  <audio src={aarti.audio_url} controls className="w-full h-8 mb-3" />
                )}
                <div className="flex gap-2 pt-3 border-t">
                  <button onClick={() => handleEdit(aarti)} className="flex-1 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">Edit</button>
                  <button onClick={() => handleDelete(aarti._id)} className="flex-1 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">No aartis found. Add your first aarti!</div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editing ? "Edit Aarti" : "Add New Aarti"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Aarti Code *</label>
                  <input type="text" value={formData.aarti_code} onChange={(e) => setFormData({ ...formData, aarti_code: e.target.value.toUpperCase().replace(/\s+/g, "_") })} placeholder="GANESH_AARTI" className="w-full px-4 py-2 border rounded-lg" required disabled={editing} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deity</label>
                  <select value={formData.deity_id} onChange={(e) => setFormData({ ...formData, deity_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                    <option value="">-- Select Deity --</option>
                    {deities.map(d => <option key={d._id} value={d._id}>{d.name?.hi} ({d.name?.en})</option>)}
                  </select>
                </div>
              </div>

              {/* Titles */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Titles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Hindi *</label><input type="text" value={formData.title.hi} onChange={(e) => setFormData({ ...formData, title: { ...formData.title, hi: e.target.value } })} placeholder="जय गणेश देवा" className="w-full px-4 py-2 border rounded-lg" required /></div>
                  <div><label className="block text-sm font-medium mb-1">English *</label><input type="text" value={formData.title.en} onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })} placeholder="Jai Ganesh Deva" className="w-full px-4 py-2 border rounded-lg" required /></div>
                  <div><label className="block text-sm font-medium mb-1">Sanskrit</label><input type="text" value={formData.title.sa} onChange={(e) => setFormData({ ...formData, title: { ...formData.title, sa: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" /></div>
                </div>
              </div>

              {/* Lyrics */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Lyrics (Full Text)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Hindi *</label>
                    <textarea value={formData.lyrics.hi} onChange={(e) => setFormData({ ...formData, lyrics: { ...formData.lyrics, hi: e.target.value } })} rows={8} placeholder="जय गणेश जय गणेश जय गणेश देवा&#10;माता जाकी पार्वती पिता महादेवा..." className="w-full px-4 py-2 border rounded-lg font-hindi" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">English (Transliteration)</label>
                    <textarea value={formData.lyrics.en} onChange={(e) => setFormData({ ...formData, lyrics: { ...formData.lyrics, en: e.target.value } })} rows={8} placeholder="Jai Ganesh Jai Ganesh Jai Ganesh Deva&#10;Mata Jaki Parvati Pita Mahadeva..." className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Time of Day</label>
                  <select value={formData.time_of_day} onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
                  <input type="number" value={formData.duration_sec} onChange={(e) => setFormData({ ...formData, duration_sec: parseInt(e.target.value) || 0 })} placeholder="180" className="w-full px-4 py-2 border rounded-lg" />
                  <p className="text-xs text-gray-500 mt-1">= {Math.floor(formData.duration_sec / 60)} min {formData.duration_sec % 60} sec</p>
                </div>
              </div>

              {/* Media Upload */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Media Files</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileUploadField label="Audio (MP3)" field="audio_url" accept="audio/*" currentUrl={formData.audio_url} />
                  <FileUploadField label="Video (MP4)" field="video_url" accept="video/*" currentUrl={formData.video_url} />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={Object.values(uploading).some(Boolean)} className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />{editing ? "Update Aarti" : "Create Aarti"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AartisMaster;
