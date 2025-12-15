import React, { useState, useEffect } from "react";
import { TreePine, Users, Plus, UserPlus, Home, X, ZoomIn, ZoomOut, Share2, Copy, Check, Mail } from "lucide-react";
import api from "../services/api";

const FamilyTree = () => {
  const [families, setFamilies] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [showJoinFamily, setShowJoinFamily] = useState(false);

  useEffect(() => { fetchFamilies(); }, []);

  const fetchFamilies = async () => {
    try { const res = await api.get("/families"); setFamilies(res.data.families || []); } 
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (selectedFamily) return <FamilyTreeView family={selectedFamily} onBack={() => { setSelectedFamily(null); fetchFamilies(); }} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-b-4 border-orange-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <TreePine className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Family Tree</h1>
                <p className="text-gray-600">Build and explore your family heritage 🙏</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowJoinFamily(true)} className="flex items-center gap-2 px-6 py-3 border-2 border-orange-500 text-orange-600 rounded-xl hover:bg-orange-50 font-semibold">
                <UserPlus className="w-5 h-5" />Join Family
              </button>
              <button onClick={() => setShowCreateFamily(true)} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 font-semibold shadow-lg">
                <Plus className="w-5 h-5" />Create Family
              </button>
            </div>
          </div>
        </div>

        {/* Families */}
        {families.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">🌳</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Family Trees Yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Create your first family tree or join an existing one using an invite code</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setShowJoinFamily(true)} className="px-6 py-3 border-2 border-orange-500 text-orange-600 rounded-xl font-semibold">Join with Code</button>
              <button onClick={() => setShowCreateFamily(true)} className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold">Create Family</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {families.map(f => (
              <div key={f.id || f._id} onClick={() => setSelectedFamily(f)} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl cursor-pointer overflow-hidden transition-all hover:-translate-y-2 group">
                <div className="h-32 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-30">🌳</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white drop-shadow-lg">{f.name}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">{f.memberCount || 0} members</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${f.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {f.role === 'admin' ? 'Admin' : 'Member'}
                    </span>
                  </div>
                  {f.inviteCode && (
                    <div className="mt-3 pt-3 border-t text-sm text-gray-500">
                      Code: <span className="font-mono font-bold text-orange-600">{f.inviteCode}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateFamily && <CreateFamilyModal onClose={() => setShowCreateFamily(false)} onSuccess={() => { setShowCreateFamily(false); fetchFamilies(); }} />}
        {showJoinFamily && <JoinFamilyModal onClose={() => setShowJoinFamily(false)} onSuccess={() => { setShowJoinFamily(false); fetchFamilies(); }} />}
      </div>
    </div>
  );
};

// Family Tree View with Hierarchical Display
const FamilyTreeView = ({ family, onBack }) => {
  const [tree, setTree] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => { fetchTreeData(); }, []);

  const fetchTreeData = async () => {
    try {
      const familyId = family.id || family._id;
      const [treeRes, membersRes] = await Promise.all([api.get(`/families/${familyId}/tree`), api.get(`/families/${familyId}/members`)]);
      setTree(treeRes.data);
      setMembers(membersRes.data.members || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100"><div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;

  const treeData = tree?.tree || [];

  // Build generations from flat member list if tree is empty
  const buildGenerations = () => {
    if (treeData.length > 0) return null;
    if (members.length === 0) return null;
    
    // Group by relation
    const generations = {
      grandparents: members.filter(m => m.relation === 'grandparent'),
      parents: members.filter(m => m.relation === 'parent'),
      self: members.filter(m => m.relation === 'self' || m.relation === 'spouse' || m.relation === 'sibling'),
      children: members.filter(m => m.relation === 'child'),
      grandchildren: members.filter(m => m.relation === 'grandchild'),
      others: members.filter(m => !['grandparent', 'parent', 'self', 'spouse', 'sibling', 'child', 'grandchild'].includes(m.relation))
    };
    
    return generations;
  };

  const generations = buildGenerations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl"><Home className="w-6 h-6" /></button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{family.name}</h1>
                <p className="text-sm text-gray-600">{members.length} members in your tree</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><ZoomOut className="w-5 h-5" /></button>
              <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><ZoomIn className="w-5 h-5" /></button>
              <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Share2 className="w-5 h-5" />Invite
              </button>
              <button onClick={() => setShowAddMember(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <UserPlus className="w-5 h-5" />Add Member
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tree Visualization */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 min-h-[500px] overflow-auto">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">🌳</span> Family Tree
          </h2>
          
          {treeData.length > 0 ? (
            // Render tree from API
            <div className="flex justify-center py-8" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
              <div className="inline-flex flex-col items-center">
                {treeData.map((root, idx) => <HierarchicalNode key={root.id || idx} node={root} onSelect={setSelectedMember} isRoot />)}
              </div>
            </div>
          ) : generations ? (
            // Render generations view
            <div className="space-y-8" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
              {/* Grandparents */}
              {generations.grandparents.length > 0 && (
                <GenerationRow title="Grandparents" members={generations.grandparents} onSelect={setSelectedMember} bgColor="from-amber-100 to-orange-100" />
              )}
              
              {/* Connection Line */}
              {generations.grandparents.length > 0 && generations.parents.length > 0 && (
                <div className="flex justify-center"><div className="w-1 h-8 bg-gradient-to-b from-orange-300 to-green-300 rounded-full" /></div>
              )}
              
              {/* Parents */}
              {generations.parents.length > 0 && (
                <GenerationRow title="Parents" members={generations.parents} onSelect={setSelectedMember} bgColor="from-green-100 to-emerald-100" />
              )}
              
              {/* Connection Line */}
              {generations.parents.length > 0 && generations.self.length > 0 && (
                <div className="flex justify-center"><div className="w-1 h-8 bg-gradient-to-b from-emerald-300 to-blue-300 rounded-full" /></div>
              )}
              
              {/* Self & Siblings */}
              {generations.self.length > 0 && (
                <GenerationRow title="You & Siblings" members={generations.self} onSelect={setSelectedMember} bgColor="from-blue-100 to-indigo-100" highlight />
              )}
              
              {/* Connection Line */}
              {generations.self.length > 0 && generations.children.length > 0 && (
                <div className="flex justify-center"><div className="w-1 h-8 bg-gradient-to-b from-indigo-300 to-purple-300 rounded-full" /></div>
              )}
              
              {/* Children */}
              {generations.children.length > 0 && (
                <GenerationRow title="Children" members={generations.children} onSelect={setSelectedMember} bgColor="from-purple-100 to-pink-100" />
              )}
              
              {/* Connection Line */}
              {generations.children.length > 0 && generations.grandchildren.length > 0 && (
                <div className="flex justify-center"><div className="w-1 h-8 bg-gradient-to-b from-pink-300 to-rose-300 rounded-full" /></div>
              )}
              
              {/* Grandchildren */}
              {generations.grandchildren.length > 0 && (
                <GenerationRow title="Grandchildren" members={generations.grandchildren} onSelect={setSelectedMember} bgColor="from-rose-100 to-red-100" />
              )}
              
              {/* Others */}
              {generations.others.length > 0 && (
                <GenerationRow title="Other Relatives" members={generations.others} onSelect={setSelectedMember} bgColor="from-gray-100 to-slate-100" />
              )}
            </div>
          ) : (
            // Empty state
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-6xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Start Your Family Tree</h3>
              <p className="text-gray-500 mb-6">Add your first family member to begin building your tree</p>
              <button onClick={() => setShowAddMember(true)} className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">
                Add First Member
              </button>
            </div>
          )}
        </div>

        {/* Members List */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-600" />
            All Members ({members.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {members.map(m => (
              <MemberCard key={m._id} member={m} onClick={() => setSelectedMember(m)} />
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedMember && <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
      {showAddMember && <AddMemberModal familyId={family.id || family._id} onClose={() => setShowAddMember(false)} onSuccess={() => { setShowAddMember(false); fetchTreeData(); }} />}
      {showInvite && <InviteModal family={family} onClose={() => setShowInvite(false)} />}
    </div>
  );
};

// Generation Row Component
const GenerationRow = ({ title, members, onSelect, bgColor, highlight }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-r ${bgColor} ${highlight ? 'ring-4 ring-blue-400 ring-offset-2' : ''}`}>
    <h3 className="text-sm font-bold text-gray-700 mb-4 text-center uppercase tracking-wide">{title}</h3>
    <div className="flex flex-wrap justify-center gap-4">
      {members.map(m => (
        <div key={m._id} onClick={() => onSelect(m)} className="cursor-pointer group">
          <div className={`w-20 h-20 rounded-full border-4 ${m.gender === 'male' ? 'border-blue-400 bg-blue-50' : m.gender === 'female' ? 'border-pink-400 bg-pink-50' : 'border-gray-300 bg-gray-50'} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
            {m.photoUrl ? <img src={m.photoUrl} alt="" className="w-full h-full rounded-full object-cover" /> : <span className={`text-2xl font-bold ${m.gender === 'male' ? 'text-blue-600' : m.gender === 'female' ? 'text-pink-600' : 'text-gray-600'}`}>{m.displayName?.charAt(0)}</span>}
          </div>
          <p className="text-center mt-2 text-sm font-semibold text-gray-800 max-w-[80px] truncate">{m.displayName}</p>
          <p className="text-center text-xs text-gray-500">{m.relation}</p>
        </div>
      ))}
    </div>
  </div>
);

// Member Card Component
const MemberCard = ({ member, onClick }) => (
  <div onClick={onClick} className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-orange-50 hover:shadow-lg transition-all text-center group">
    <div className={`w-16 h-16 rounded-full mx-auto mb-2 border-3 ${member.gender === 'male' ? 'border-blue-400 bg-blue-100' : member.gender === 'female' ? 'border-pink-400 bg-pink-100' : 'border-gray-300 bg-gray-100'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
      {member.photoUrl ? <img src={member.photoUrl} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="text-xl font-bold">{member.displayName?.charAt(0)}</span>}
    </div>
    <p className="font-semibold text-gray-900 truncate text-sm">{member.displayName}</p>
    <p className="text-xs text-gray-500">{member.relation || member.gender}</p>
  </div>
);

// Hierarchical Node (for tree structure from API)
const HierarchicalNode = ({ node, onSelect, isRoot }) => {
  const hasChildren = node.children?.length > 0;
  const genderColor = node.gender === 'male' ? 'blue' : node.gender === 'female' ? 'pink' : 'gray';
  
  return (
    <div className="flex flex-col items-center">
      {!isRoot && <div className="w-1 h-8 bg-gradient-to-b from-green-300 to-green-500 rounded-full" />}
      
      <div className="flex items-center gap-3">
        <div onClick={() => onSelect(node)} className="cursor-pointer group">
          <div className={`w-24 h-24 rounded-full border-4 border-${genderColor}-400 bg-${genderColor}-50 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
            {node.photoUrl ? <img src={node.photoUrl} alt="" className="w-full h-full rounded-full object-cover" /> : <span className={`text-3xl font-bold text-${genderColor}-600`}>{node.displayName?.charAt(0)}</span>}
          </div>
          <div className="text-center mt-2">
            <p className="font-bold text-gray-900">{node.displayName}</p>
            {node.birthdate && <p className="text-xs text-gray-500">{new Date(node.birthdate).getFullYear()}</p>}
          </div>
        </div>
        
        {node.spouse && (
          <>
            <div className="w-8 h-1 bg-red-400 relative flex items-center justify-center">
              <span className="text-red-500 text-sm">❤</span>
            </div>
            <div onClick={() => onSelect(node.spouse)} className="cursor-pointer group">
              <div className={`w-24 h-24 rounded-full border-4 border-${node.spouse.gender === 'male' ? 'blue' : 'pink'}-400 bg-${node.spouse.gender === 'male' ? 'blue' : 'pink'}-50 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                <span className="text-3xl font-bold">{node.spouse.displayName?.charAt(0)}</span>
              </div>
              <p className="text-center mt-2 font-bold text-gray-900">{node.spouse.displayName}</p>
            </div>
          </>
        )}
      </div>
      
      {hasChildren && (
        <>
          <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-300 rounded-full" />
          {node.children.length > 1 && <div className="h-1 bg-green-400 rounded-full" style={{ width: `${(node.children.length - 1) * 180}px` }} />}
          <div className="flex gap-12 pt-2">
            {node.children.map((child, idx) => <HierarchicalNode key={child.id || idx} node={child} onSelect={onSelect} />)}
          </div>
        </>
      )}
    </div>
  );
};

// Member Detail Modal
const MemberModal = ({ member, onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
      <div className="flex justify-between mb-6"><h3 className="text-2xl font-bold">{member.displayName}</h3><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button></div>
      <div className="flex items-center gap-6 mb-6">
        <div className={`w-28 h-28 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl ${member.gender === 'male' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : member.gender === 'female' ? 'bg-gradient-to-br from-pink-400 to-pink-600' : 'bg-gradient-to-br from-gray-400 to-gray-600'}`}>
          {member.photoUrl ? <img src={member.photoUrl} alt="" className="w-full h-full rounded-full object-cover" /> : member.displayName?.charAt(0)}
        </div>
        <div>
          <p className="text-xl font-bold">{member.displayName}</p>
          <p className="text-gray-500 capitalize">{member.relation}</p>
          {member.gender && <span className={`text-3xl ${member.gender === 'male' ? 'text-blue-500' : 'text-pink-500'}`}>{member.gender === 'male' ? '♂' : '♀'}</span>}
        </div>
      </div>
      <div className="space-y-3 text-sm bg-gray-50 rounded-xl p-4">
        {member.birthdate && <div className="flex justify-between py-2 border-b border-gray-200"><span className="text-gray-500">Birth Date</span><span className="font-semibold">{new Date(member.birthdate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>}
        {member.occupation && <div className="flex justify-between py-2 border-b border-gray-200"><span className="text-gray-500">Occupation</span><span className="font-semibold">{member.occupation}</span></div>}
        {member.notes && <div className="py-2"><span className="text-gray-500 block mb-1">Notes</span><p className="text-gray-800">{member.notes}</p></div>}
      </div>
      <button onClick={onClose} className="w-full mt-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700">Close</button>
    </div>
  </div>
);

// Invite Modal
const InviteModal = ({ family, onClose }) => {
  const [copied, setCopied] = useState(false);
  const inviteCode = family.inviteCode || 'XXXXXX';
  
  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareWhatsApp = () => {
    const msg = `Join my family tree "${family.name}" on Sanskaar App!\n\nUse invite code: ${inviteCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between mb-6"><h3 className="text-2xl font-bold">Invite Family Members</h3><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button></div>
        
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">Share this code with your family members</p>
          <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-6">
            <p className="text-sm text-gray-500 mb-2">Invite Code</p>
            <p className="text-4xl font-mono font-bold text-orange-600 tracking-wider">{inviteCode}</p>
          </div>
        </div>
        
        <button onClick={copyCode} className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mb-3 ${copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          {copied ? <><Check className="w-5 h-5" />Copied!</> : <><Copy className="w-5 h-5" />Copy Code</>}
        </button>
        
        <button onClick={shareWhatsApp} className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-600">
          <Mail className="w-5 h-5" />Share on WhatsApp
        </button>
        
        <button onClick={onClose} className="w-full mt-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50">Close</button>
      </div>
    </div>
  );
};

// Create Family Modal
const CreateFamilyModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!formData.name.trim()) { setError("Family name is required"); return; }
    setLoading(true);
    try { await api.post("/families", formData); onSuccess(); } catch (e) { setError(e.response?.data?.message || "Failed"); setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-2xl font-bold mb-6">Create New Family</h3>
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4">{error}</div>}
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold mb-2">Family Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl focus:border-orange-500 focus:ring-0" placeholder="The Sharma Family" /></div>
          <div><label className="block text-sm font-semibold mb-2">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl focus:border-orange-500 focus:ring-0" rows="3" placeholder="Our wonderful family..." /></div>
          <div className="flex gap-3 pt-4"><button onClick={handleSubmit} disabled={loading} className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-orange-700">{loading ? "Creating..." : "Create Family"}</button><button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-semibold hover:bg-gray-200">Cancel</button></div>
        </div>
      </div>
    </div>
  );
};

// Join Family Modal
const JoinFamilyModal = ({ onClose, onSuccess }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!code.trim()) { setError("Please enter invite code"); return; }
    setLoading(true);
    try { await api.post("/families/join", { inviteCode: code.toUpperCase() }); onSuccess(); } catch (e) { setError(e.response?.data?.message || "Invalid code"); setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-2xl font-bold mb-6">Join a Family</h3>
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4">{error}</div>}
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold mb-2">Invite Code *</label><input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="w-full px-4 py-4 border-2 rounded-xl focus:border-orange-500 focus:ring-0 text-center text-2xl font-mono tracking-widest" placeholder="XXXXXX" maxLength={10} /></div>
          <p className="text-sm text-gray-500 text-center">Ask your family admin for the invite code</p>
          <div className="flex gap-3 pt-4"><button onClick={handleSubmit} disabled={loading} className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-orange-700">{loading ? "Joining..." : "Join Family"}</button><button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-semibold hover:bg-gray-200">Cancel</button></div>
        </div>
      </div>
    </div>
  );
};

// Add Member Modal
const AddMemberModal = ({ familyId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ displayName: "", relation: "other", birthdate: "", gender: "unspecified", occupation: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!formData.displayName.trim()) { setError("Name is required"); return; }
    setLoading(true);
    try { await api.post(`/families/${familyId}/members`, formData); onSuccess(); } catch (e) { setError(e.response?.data?.message || "Failed"); setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <h3 className="text-2xl font-bold mb-6">Add Family Member</h3>
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4">{error}</div>}
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold mb-2">Full Name *</label><input type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl" placeholder="Enter name" /></div>
          <div><label className="block text-sm font-semibold mb-2">Relation</label><select value={formData.relation} onChange={(e) => setFormData({ ...formData, relation: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl"><option value="self">Self (You)</option><option value="spouse">Spouse</option><option value="parent">Parent</option><option value="child">Child</option><option value="sibling">Sibling</option><option value="grandparent">Grandparent</option><option value="grandchild">Grandchild</option><option value="other">Other</option></select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-2">Gender</label><select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl"><option value="unspecified">-</option><option value="male">Male</option><option value="female">Female</option></select></div>
            <div><label className="block text-sm font-semibold mb-2">Birth Date</label><input type="date" value={formData.birthdate} onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl" /></div>
          </div>
          <div><label className="block text-sm font-semibold mb-2">Occupation</label><input type="text" value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl" placeholder="e.g., Doctor, Teacher" /></div>
          <div className="flex gap-3 pt-4"><button onClick={handleSubmit} disabled={loading} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-green-700">{loading ? "Adding..." : "Add Member"}</button><button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-semibold hover:bg-gray-200">Cancel</button></div>
        </div>
      </div>
    </div>
  );
};

export default FamilyTree;
