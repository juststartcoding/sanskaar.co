import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Star,
  Clock,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

const MuhuratCalendarMaster = () => {
  const [entries, setEntries] = useState([]);
  const [poojas, setPoojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState("calendar"); // calendar or list

  const tithis = [
    { value: "PRATIPADA", hi: "प्रतिपदा", en: "Pratipada" },
    { value: "DWITIYA", hi: "द्वितीया", en: "Dwitiya" },
    { value: "TRITIYA", hi: "तृतीया", en: "Tritiya" },
    { value: "CHATURTHI", hi: "चतुर्थी", en: "Chaturthi" },
    { value: "PANCHAMI", hi: "पंचमी", en: "Panchami" },
    { value: "SHASHTHI", hi: "षष्ठी", en: "Shashthi" },
    { value: "SAPTAMI", hi: "सप्तमी", en: "Saptami" },
    { value: "ASHTAMI", hi: "अष्टमी", en: "Ashtami" },
    { value: "NAVAMI", hi: "नवमी", en: "Navami" },
    { value: "DASHAMI", hi: "दशमी", en: "Dashami" },
    { value: "EKADASHI", hi: "एकादशी", en: "Ekadashi" },
    { value: "DWADASHI", hi: "द्वादशी", en: "Dwadashi" },
    { value: "TRAYODASHI", hi: "त्रयोदशी", en: "Trayodashi" },
    { value: "CHATURDASHI", hi: "चतुर्दशी", en: "Chaturdashi" },
    { value: "PURNIMA", hi: "पूर्णिमा", en: "Purnima" },
    { value: "AMAVASYA", hi: "अमावस्या", en: "Amavasya" },
  ];

  const pakshas = [
    { value: "SHUKLA", hi: "शुक्ल पक्ष", en: "Shukla Paksha" },
    { value: "KRISHNA", hi: "कृष्ण पक्ष", en: "Krishna Paksha" },
  ];

  const masas = [
    { value: "CHAITRA", hi: "चैत्र", en: "Chaitra" },
    { value: "VAISHAKHA", hi: "वैशाख", en: "Vaishakha" },
    { value: "JYESHTHA", hi: "ज्येष्ठ", en: "Jyeshtha" },
    { value: "ASHADHA", hi: "आषाढ़", en: "Ashadha" },
    { value: "SHRAVANA", hi: "श्रावण", en: "Shravana" },
    { value: "BHADRAPADA", hi: "भाद्रपद", en: "Bhadrapada" },
    { value: "ASHWIN", hi: "आश्विन", en: "Ashwin" },
    { value: "KARTIK", hi: "कार्तिक", en: "Kartik" },
    { value: "MARGASHIRSHA", hi: "मार्गशीर्ष", en: "Margashirsha" },
    { value: "PAUSHA", hi: "पौष", en: "Pausha" },
    { value: "MAGHA", hi: "माघ", en: "Magha" },
    { value: "PHALGUNA", hi: "फाल्गुन", en: "Phalguna" },
  ];

  const tarpanTypes = [
    { value: "NONE", hi: "कोई नहीं", en: "None" },
    { value: "PITRU_TARPAN", hi: "पितृ तर्पण", en: "Pitru Tarpan" },
    { value: "DEV_TARPAN", hi: "देव तर्पण", en: "Dev Tarpan" },
    { value: "RISHI_TARPAN", hi: "ऋषि तर्पण", en: "Rishi Tarpan" },
    { value: "SHRADDHA", hi: "श्राद्ध", en: "Shraddha" },
  ];

  const festivalTypes = [
    { value: "NONE", hi: "कोई नहीं", en: "None" },
    { value: "MAJOR", hi: "प्रमुख त्योहार", en: "Major Festival" },
    { value: "MINOR", hi: "छोटा त्योहार", en: "Minor Festival" },
    { value: "REGIONAL", hi: "क्षेत्रीय त्योहार", en: "Regional Festival" },
    { value: "FASTING", hi: "व्रत", en: "Fasting Day" },
  ];

  const [formData, setFormData] = useState({
    date: "",
    hindu_date: {
      tithi: "PRATIPADA",
      tithi_name: { hi: "", en: "" },
      paksha: "SHUKLA",
      paksha_name: { hi: "", en: "" },
      masa: "CHAITRA",
      masa_name: { hi: "", en: "" },
      samvat: null,
    },
    nakshatra: { name: "", name_hi: "", start_time: "", end_time: "" },
    muhurats: {
      brahma_muhurat: { start: "", end: "" },
      abhijit_muhurat: { start: "", end: "" },
      vijay_muhurat: { start: "", end: "" },
      amrit_kaal: { start: "", end: "" },
      rahu_kaal: { start: "", end: "" },
    },
    tarpan_info: {
      is_tarpan_day: false,
      tarpan_type: "NONE",
      tarpan_description: { hi: "", en: "" },
      best_time: "",
    },
    festival: {
      is_festival: false,
      festival_name: { hi: "", en: "" },
      festival_description: { hi: "", en: "" },
      festival_type: "NONE",
    },
    recommended_poojas: [],
    auspicious_for: [],
    inauspicious_for: [],
    sun_timings: { sunrise: "", sunset: "" },
    notes: { hi: "", en: "" },
    location: { city: "Delhi", timezone: "Asia/Kolkata" },
  });

  useEffect(() => {
    fetchData();
  }, [currentMonth, currentYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesRes, poojasRes] = await Promise.all([
        api.get(
          `/admin/master/muhurat-calendar?startDate=${currentYear}-${String(
            currentMonth,
          ).padStart(2, "0")}-01&endDate=${currentYear}-${String(
            currentMonth,
          ).padStart(2, "0")}-31&limit=31`,
        ),
        api.get("/admin/master/pooja-templates?limit=100"),
      ]);
      setEntries(entriesRes.data.entries || []);
      setPoojas(poojasRes.data.templates || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(
          `/admin/master/muhurat-calendar/${editing._id}`,
          formData,
        );
      } else {
        await api.post("/admin/master/muhurat-calendar", formData);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({
      date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
      hindu_date: item.hindu_date || formData.hindu_date,
      nakshatra: item.nakshatra || formData.nakshatra,
      muhurats: item.muhurats || formData.muhurats,
      tarpan_info: item.tarpan_info || formData.tarpan_info,
      festival: item.festival || formData.festival,
      recommended_poojas: item.recommended_poojas || [],
      auspicious_for: item.auspicious_for || [],
      inauspicious_for: item.inauspicious_for || [],
      sun_timings: item.sun_timings || formData.sun_timings,
      notes: item.notes || formData.notes,
      location: item.location || formData.location,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await api.delete(`/admin/master/muhurat-calendar/${id}`);
      fetchData();
    } catch (e) {
      alert(e.message);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      date: "",
      hindu_date: {
        tithi: "PRATIPADA",
        tithi_name: { hi: "", en: "" },
        paksha: "SHUKLA",
        paksha_name: { hi: "", en: "" },
        masa: "CHAITRA",
        masa_name: { hi: "", en: "" },
        samvat: null,
      },
      nakshatra: { name: "", name_hi: "", start_time: "", end_time: "" },
      muhurats: {
        brahma_muhurat: { start: "", end: "" },
        abhijit_muhurat: { start: "", end: "" },
        vijay_muhurat: { start: "", end: "" },
        amrit_kaal: { start: "", end: "" },
        rahu_kaal: { start: "", end: "" },
      },
      tarpan_info: {
        is_tarpan_day: false,
        tarpan_type: "NONE",
        tarpan_description: { hi: "", en: "" },
        best_time: "",
      },
      festival: {
        is_festival: false,
        festival_name: { hi: "", en: "" },
        festival_description: { hi: "", en: "" },
        festival_type: "NONE",
      },
      recommended_poojas: [],
      auspicious_for: [],
      inauspicious_for: [],
      sun_timings: { sunrise: "", sunset: "" },
      notes: { hi: "", en: "" },
      location: { city: "Delhi", timezone: "Asia/Kolkata" },
    });
  };

  // Auto-fill tithi/paksha/masa names when selected
  const handleTithiChange = (value) => {
    const tithi = tithis.find((t) => t.value === value);
    setFormData({
      ...formData,
      hindu_date: {
        ...formData.hindu_date,
        tithi: value,
        tithi_name: { hi: tithi?.hi || "", en: tithi?.en || "" },
      },
    });
  };

  const handlePakshaChange = (value) => {
    const paksha = pakshas.find((p) => p.value === value);
    setFormData({
      ...formData,
      hindu_date: {
        ...formData.hindu_date,
        paksha: value,
        paksha_name: { hi: paksha?.hi || "", en: paksha?.en || "" },
      },
    });
  };

  const handleMasaChange = (value) => {
    const masa = masas.find((m) => m.value === value);
    setFormData({
      ...formData,
      hindu_date: {
        ...formData.hindu_date,
        masa: value,
        masa_name: { hi: masa?.hi || "", en: masa?.en || "" },
      },
    });
  };

  // Calendar navigation
  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate calendar days
  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(
        2,
        "0",
      )}-${String(day).padStart(2, "0")}`;
      const entry = entries.find((e) => {
        const entryDate = new Date(e.date).toISOString().split("T")[0];
        return entryDate === dateStr;
      });

      days.push(
        <div
          key={day}
          className={`h-24 border p-1 cursor-pointer hover:bg-orange-50 transition-colors ${
            entry ? "bg-orange-50" : "bg-white"
          }`}
          onClick={() => {
            if (entry) {
              handleEdit(entry);
            } else {
              resetForm();
              setFormData((prev) => ({ ...prev, date: dateStr }));
              setShowModal(true);
            }
          }}
        >
          <div className="flex justify-between items-start">
            <span
              className={`text-sm font-medium ${
                entry ? "text-orange-700" : "text-gray-700"
              }`}
            >
              {day}
            </span>
            {entry && (
              <div className="flex gap-1">
                {entry.festival?.is_festival && (
                  <Star className="w-3 h-3 text-yellow-500" />
                )}
                {entry.tarpan_info?.is_tarpan_day && (
                  <Moon className="w-3 h-3 text-blue-500" />
                )}
              </div>
            )}
          </div>
          {entry && (
            <div className="mt-1">
              <p className="text-xs text-orange-600 truncate">
                {entry.hindu_date?.tithi_name?.hi}
              </p>
              {entry.festival?.is_festival && (
                <p className="text-xs text-purple-600 truncate">
                  {entry.festival?.festival_name?.hi}
                </p>
              )}
            </div>
          )}
        </div>,
      );
    }

    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Add/remove auspicious activities
  const addAuspiciousActivity = () => {
    setFormData({
      ...formData,
      auspicious_for: [
        ...formData.auspicious_for,
        { activity: { hi: "", en: "" }, icon: "✓" },
      ],
    });
  };

  const addInauspiciousActivity = () => {
    setFormData({
      ...formData,
      inauspicious_for: [
        ...formData.inauspicious_for,
        { activity: { hi: "", en: "" }, icon: "✗" },
      ],
    });
  };

  // Add/remove recommended poojas
  const addRecommendedPooja = (poojaId) => {
    if (!poojaId) return;
    if (formData.recommended_poojas.find((p) => p.pooja_id === poojaId)) return;
    setFormData({
      ...formData,
      recommended_poojas: [
        ...formData.recommended_poojas,
        { pooja_id: poojaId, priority: 0, reason: { hi: "", en: "" } },
      ],
    });
  };

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-orange-600" />
              मुहूर्त एवं तिथि तर्पण कैलेंडर
            </h1>
            <p className="text-gray-600">Muhurat & Tithi Tarpan Calendar</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setViewMode(viewMode === "calendar" ? "list" : "calendar")
              }
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              {viewMode === "calendar" ? "List View" : "Calendar View"}
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Plus className="w-5 h-5" />
              Add Entry
            </button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4 bg-white rounded-xl shadow p-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {monthNames[currentMonth - 1]} {currentYear}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : viewMode === "calendar" ? (
          /* Calendar View */
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="grid grid-cols-7 bg-orange-100">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-sm font-semibold text-orange-800"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">{renderCalendar()}</div>
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Tithi
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Paksha
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Festival
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Tarpan
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {new Date(entry.date).toLocaleDateString("en-IN")}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm">
                        {entry.hindu_date?.tithi_name?.hi ||
                          entry.hindu_date?.tithi}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          entry.hindu_date?.paksha === "SHUKLA"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {entry.hindu_date?.paksha_name?.hi ||
                          entry.hindu_date?.paksha}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {entry.festival?.is_festival ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                          {entry.festival?.festival_name?.hi || "Festival"}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {entry.tarpan_info?.is_tarpan_day ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                          {entry.tarpan_info?.tarpan_type}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-500">
                      No entries for this month. Click on calendar dates to add.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold">
                  {editing ? "Edit Entry" : "Add New Entry"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date (English Calendar) *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Vikram Samvat
                    </label>
                    <input
                      type="number"
                      value={formData.hindu_date.samvat || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hindu_date: {
                            ...formData.hindu_date,
                            samvat: parseInt(e.target.value) || null,
                          },
                        })
                      }
                      placeholder="2082"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Hindu Date */}
                <div className="border rounded-xl p-4 bg-orange-50">
                  <h3 className="text-lg font-semibold mb-4">
                    🕉️ Hindu Calendar Date
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Tithi *
                      </label>
                      <select
                        value={formData.hindu_date.tithi}
                        onChange={(e) => handleTithiChange(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg bg-white"
                        required
                      >
                        {tithis.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.hi} ({t.en})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Paksha *
                      </label>
                      <select
                        value={formData.hindu_date.paksha}
                        onChange={(e) => handlePakshaChange(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg bg-white"
                        required
                      >
                        {pakshas.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.hi} ({p.en})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Masa *
                      </label>
                      <select
                        value={formData.hindu_date.masa}
                        onChange={(e) => handleMasaChange(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg bg-white"
                        required
                      >
                        {masas.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.hi} ({m.en})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Nakshatra */}
                <div className="border rounded-xl p-4 bg-purple-50">
                  <h3 className="text-lg font-semibold mb-4">⭐ Nakshatra</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Name (English)
                      </label>
                      <input
                        type="text"
                        value={formData.nakshatra.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nakshatra: {
                              ...formData.nakshatra,
                              name: e.target.value,
                            },
                          })
                        }
                        placeholder="Ashwini"
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Name (Hindi)
                      </label>
                      <input
                        type="text"
                        value={formData.nakshatra.name_hi}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nakshatra: {
                              ...formData.nakshatra,
                              name_hi: e.target.value,
                            },
                          })
                        }
                        placeholder="अश्विनी"
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={formData.nakshatra.start_time}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nakshatra: {
                              ...formData.nakshatra,
                              start_time: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={formData.nakshatra.end_time}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nakshatra: {
                              ...formData.nakshatra,
                              end_time: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Muhurats */}
                <div className="border rounded-xl p-4 bg-yellow-50">
                  <h3 className="text-lg font-semibold mb-4">
                    🌅 Muhurat Timings
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        key: "brahma_muhurat",
                        label: "Brahma Muhurat (ब्रह्म मुहूर्त)",
                      },
                      {
                        key: "abhijit_muhurat",
                        label: "Abhijit Muhurat (अभिजित मुहूर्त)",
                      },
                      {
                        key: "vijay_muhurat",
                        label: "Vijay Muhurat (विजय मुहूर्त)",
                      },
                      { key: "amrit_kaal", label: "Amrit Kaal (अमृत काल)" },
                      { key: "rahu_kaal", label: "Rahu Kaal (राहु काल)" },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2">
                        <label className="w-40 text-sm font-medium">
                          {label}
                        </label>
                        <input
                          type="time"
                          value={formData.muhurats[key]?.start || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              muhurats: {
                                ...formData.muhurats,
                                [key]: {
                                  ...formData.muhurats[key],
                                  start: e.target.value,
                                },
                              },
                            })
                          }
                          className="flex-1 px-3 py-2 border rounded-lg"
                          placeholder="Start"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={formData.muhurats[key]?.end || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              muhurats: {
                                ...formData.muhurats,
                                [key]: {
                                  ...formData.muhurats[key],
                                  end: e.target.value,
                                },
                              },
                            })
                          }
                          className="flex-1 px-3 py-2 border rounded-lg"
                          placeholder="End"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sun Timings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      🌅 Sunrise
                    </label>
                    <input
                      type="time"
                      value={formData.sun_timings.sunrise}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sun_timings: {
                            ...formData.sun_timings,
                            sunrise: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      🌇 Sunset
                    </label>
                    <input
                      type="time"
                      value={formData.sun_timings.sunset}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sun_timings: {
                            ...formData.sun_timings,
                            sunset: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Tarpan Info */}
                <div className="border rounded-xl p-4 bg-blue-50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Moon className="w-5 h-5" /> Tarpan Information
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.tarpan_info.is_tarpan_day}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tarpan_info: {
                              ...formData.tarpan_info,
                              is_tarpan_day: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5"
                      />
                      <span className="font-medium">This is a Tarpan Day</span>
                    </label>
                    {formData.tarpan_info.is_tarpan_day && (
                      <div className="grid grid-cols-2 gap-4 pl-7">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Tarpan Type
                          </label>
                          <select
                            value={formData.tarpan_info.tarpan_type}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                tarpan_info: {
                                  ...formData.tarpan_info,
                                  tarpan_type: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-2 border rounded-lg bg-white"
                          >
                            {tarpanTypes.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.hi} ({t.en})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Best Time
                          </label>
                          <input
                            type="text"
                            value={formData.tarpan_info.best_time}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                tarpan_info: {
                                  ...formData.tarpan_info,
                                  best_time: e.target.value,
                                },
                              })
                            }
                            placeholder="कुतुप काल"
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Description (Hindi)
                          </label>
                          <textarea
                            value={formData.tarpan_info.tarpan_description.hi}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                tarpan_info: {
                                  ...formData.tarpan_info,
                                  tarpan_description: {
                                    ...formData.tarpan_info.tarpan_description,
                                    hi: e.target.value,
                                  },
                                },
                              })
                            }
                            rows={2}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Description (English)
                          </label>
                          <textarea
                            value={formData.tarpan_info.tarpan_description.en}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                tarpan_info: {
                                  ...formData.tarpan_info,
                                  tarpan_description: {
                                    ...formData.tarpan_info.tarpan_description,
                                    en: e.target.value,
                                  },
                                },
                              })
                            }
                            rows={2}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Festival Info */}
                <div className="border rounded-xl p-4 bg-pink-50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5" /> Festival / Special Day
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.festival.is_festival}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            festival: {
                              ...formData.festival,
                              is_festival: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5"
                      />
                      <span className="font-medium">
                        This is a Festival / Special Day
                      </span>
                    </label>
                    {formData.festival.is_festival && (
                      <div className="grid grid-cols-2 gap-4 pl-7">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Festival Name (Hindi)
                          </label>
                          <input
                            type="text"
                            value={formData.festival.festival_name.hi}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                festival: {
                                  ...formData.festival,
                                  festival_name: {
                                    ...formData.festival.festival_name,
                                    hi: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="दीपावली"
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Festival Name (English)
                          </label>
                          <input
                            type="text"
                            value={formData.festival.festival_name.en}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                festival: {
                                  ...formData.festival,
                                  festival_name: {
                                    ...formData.festival.festival_name,
                                    en: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Diwali"
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Festival Type
                          </label>
                          <select
                            value={formData.festival.festival_type}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                festival: {
                                  ...formData.festival,
                                  festival_type: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-2 border rounded-lg bg-white"
                          >
                            {festivalTypes.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.hi} ({t.en})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Description (Hindi)
                          </label>
                          <textarea
                            value={formData.festival.festival_description.hi}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                festival: {
                                  ...formData.festival,
                                  festival_description: {
                                    ...formData.festival.festival_description,
                                    hi: e.target.value,
                                  },
                                },
                              })
                            }
                            rows={2}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommended Poojas */}
                <div className="border rounded-xl p-4 bg-green-50">
                  <h3 className="text-lg font-semibold mb-4">
                    🙏 Recommended Poojas
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <select
                      id="poojaSelector"
                      className="flex-1 px-4 py-2 border rounded-lg bg-white"
                    >
                      <option value="">-- Select Pooja --</option>
                      {poojas
                        .filter(
                          (p) =>
                            !formData.recommended_poojas.find(
                              (rp) => rp.pooja_id === p._id,
                            ),
                        )
                        .map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name?.hi} ({p.name?.en})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const sel = document.getElementById("poojaSelector");
                        addRecommendedPooja(sel.value);
                        sel.value = "";
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {formData.recommended_poojas.length > 0 && (
                    <div className="space-y-2">
                      {formData.recommended_poojas.map((rp, idx) => {
                        const pooja = poojas.find((p) => p._id === rp.pooja_id);
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 bg-white rounded-lg"
                          >
                            <span className="flex-1 font-medium">
                              {pooja?.name?.hi || rp.pooja_id}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  recommended_poojas:
                                    formData.recommended_poojas.filter(
                                      (_, i) => i !== idx,
                                    ),
                                })
                              }
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Notes (Hindi)
                    </label>
                    <textarea
                      value={formData.notes.hi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notes: { ...formData.notes, hi: e.target.value },
                        })
                      }
                      rows={2}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Additional notes in Hindi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Notes (English)
                    </label>
                    <textarea
                      value={formData.notes.en}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notes: { ...formData.notes, en: e.target.value },
                        })
                      }
                      rows={2}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Additional notes in English"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {editing ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MuhuratCalendarMaster;
