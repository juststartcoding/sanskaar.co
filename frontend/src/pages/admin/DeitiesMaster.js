import React, { useState, useEffect } from "react";
import { Upload, X, Edit, Trash2, Plus, Save, Search } from "lucide-react";
import api from "../../services/api";

const DeitiesMaster = () => {
  const [deities, setDeities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    deity_code: "", name: { hi: "", en: "", sa: "" }, description: { hi: "", en: "" },
    icon_url: "", image_url: "", day_of_worship: "", associated_color: "", category: "OTHER",
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { setLoading(true); const res = await api.get("/admin/master/deities"); setDeities(res.data.deities || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      setUploading({ ...uploading, [field]: true });
      const uploadData = new FormData(); uploadData.append("file", file); uploadData.append("folder", "deities");
      const res = await api.post("/admin/master/upload", uploadData, { headers: { "Content-Type": "multipart/form-data" } });
      setFormData({ ...formData, [field]: res.data.url });
    } catch (e) { alert("Upload failed"); } finally { setUploading({ ...uploading, [field]: false }); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/admin/master/deities/${editing._id}`, formData);
      else await api.post("/admin/master/deities", formData);
      setShowModal(false); resetForm(); fetchData();
    } catch (e) { alert(e.response?.data?.message || e.message); }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({
      deity_code: item.deity_code || "", name: item.name || { hi: "", en: "", sa: "" },
      description: item.description || { hi: "", en: "" }, icon_url: item.icon_url || "",
      image_url: item.image_url || "", day_of_worship: item.day_of_worship || "",
      associated_color: item.associated_color || "", category: item.category || "OTHER",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this deity?")) return;
    try { await api.delete(`/admin/master/deities/${id}`); fetchData(); } catch (e) { alert(e.message); }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ deity_code: "", name: { hi: "", en: "", sa: "" }, description: { hi: "", en: "" },
      icon_url: "", image_url: "", day_of_worship: "", associated_color: "", category: "OTHER" });
  };

  const filtered = deities.filter(d => d.name?.hi?.includes(searchTerm) || d.name?.en?.toLowerCase().includes(searchTerm.toLowerCase()));
  const categories = ["TRIMURTI", "DEVI", "AVATAR", "GANA", "NAVAGRAHA", "OTHER"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const FileUploadField = ({ label, field, currentUrl }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {currentUrl ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <img src={currentUrl} alt="" className="w-16 h-16 object-cover rounded" />
          <p className="text-sm text-green-700 flex-1">✓ Uploaded</p>
          <button type="button" onClick={() => setFormData({ ...formData, [field]: "" })} className="p-2 text-red-600"><X className="w-5 h-5" /></button>
        </div>
      ) : (
        <div className="relative">
          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, field)} className="hidden" id={`file-${field}`} />
          <label htmlFor={`file-${field}`} className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-orange-500">
            {uploading[field] ? <><div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /><span>Uploading...</span></> : <><Upload className="w-5 h-5 text-gray-400" /><span className="text-gray-600">Click to upload</span></>}
          </label>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Deities Master</h1><p className="text-gray-600">Manage all deities</p></div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"><Plus className="w-5 h-5" />Add Deity</button>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search deities..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
      </div>

      {loading ? <div className="text-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <div key={d._id} className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                {d.icon_url ? <img src={d.icon_url} alt="" className="w-16 h-16 rounded-full object-cover" /> : <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl">🙏</div>}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{d.name?.hi}</h3>
                  <p className="text-sm text-gray-600">{d.name?.en}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">{d.category}</span>
                    {d.day_of_worship && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{d.day_of_worship}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button onClick={() => handleEdit(d)} className="flex-1 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">Edit</button>
                <button onClick={() => handleDelete(d._id)} className="flex-1 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium">Delete</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-full text-center py-12 text-gray-500">No deities found.</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editing ? "Edit Deity" : "Add New Deity"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div><label className="block text-sm font-medium mb-1">Deity Code</label><input type="text" value={formData.deity_code} onChange={(e) => setFormData({ ...formData, deity_code: e.target.value.toUpperCase() })} placeholder="GANESHA" className="w-full px-4 py-2 border rounded-lg" disabled={editing} /></div>

              <div><h3 className="text-sm font-semibold mb-3">Names</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Hindi *</label><input type="text" value={formData.name.hi} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, hi: e.target.value } })} placeholder="श्री गणेश" className="w-full px-4 py-2 border rounded-lg" required /></div>
                  <div><label className="block text-sm font-medium mb-1">English *</label><input type="text" value={formData.name.en} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })} placeholder="Lord Ganesha" className="w-full px-4 py-2 border rounded-lg" required /></div>
                  <div><label className="block text-sm font-medium mb-1">Sanskrit</label><input type="text" value={formData.name.sa} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, sa: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" /></div>
                </div>
              </div>

              <div><h3 className="text-sm font-semibold mb-3">Description</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Hindi</label><textarea value={formData.description.hi} onChange={(e) => setFormData({ ...formData, description: { ...formData.description, hi: e.target.value } })} rows={3} className="w-full px-4 py-2 border rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-1">English</label><textarea value={formData.description.en} onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })} rows={3} className="w-full px-4 py-2 border rounded-lg" /></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium mb-1">Category</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1">Worship Day</label><select value={formData.day_of_worship} onChange={(e) => setFormData({ ...formData, day_of_worship: e.target.value })} className="w-full px-4 py-2 border rounded-lg"><option value="">-- Select --</option>{days.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1">Color</label><input type="text" value={formData.associated_color} onChange={(e) => setFormData({ ...formData, associated_color: e.target.value })} placeholder="Red, Orange" className="w-full px-4 py-2 border rounded-lg" /></div>
              </div>

              <div><h3 className="text-sm font-semibold mb-3">Images</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FileUploadField label="Icon (Small)" field="icon_url" currentUrl={formData.icon_url} />
                  <FileUploadField label="Main Image" field="image_url" currentUrl={formData.image_url} />
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

export default DeitiesMaster;
