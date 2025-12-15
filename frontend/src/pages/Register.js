import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Store,
  Award,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  Loader,
  CheckCircle,
  Users,
} from "lucide-react";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("user");
  const [formData, setFormData] = useState({
    // Common fields for all roles
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",

    // Seller specific
    businessName: "",
    businessType: "",
    gstNumber: "",

    // Pandit specific
    specialization: [],
    experience: "",
    languages: [],

    // Location (for seller and pandit)
    location: {
      city: "",
      state: "",
      address: "",
    },
  });

  const roles = [
    {
      id: "user",
      name: "User",
      icon: User,
      description: "Browse temples, book poojas, and shop products",
      color: "blue",
    },
    {
      id: "seller",
      name: "Seller",
      icon: Store,
      description: "Sell pooja items and spiritual products",
      color: "green",
    },
    {
      id: "pandit",
      name: "Pandit",
      icon: Award,
      description: "Offer pooja services and receive bookings",
      color: "orange",
    },
  ];

  const specializations = [
    "Wedding Ceremonies",
    "Griha Pravesh",
    "Satyanarayan Puja",
    "Ganesh Puja",
    "Lakshmi Puja",
    "Durga Puja",
    "Hanuman Puja",
    "Navgraha Puja",
    "Rudrabhishek",
    "Kaal Sarp Dosh Puja",
    "Vastu Shanti",
    "Mundan Ceremony",
    "Thread Ceremony",
  ];

  const languages = [
    "Hindi",
    "Sanskrit",
    "English",
    "Bengali",
    "Tamil",
    "Telugu",
    "Marathi",
    "Gujarati",
    "Kannada",
    "Malayalam",
  ];

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const keys = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayToggle = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Validation
      if (!formData.name || !formData.email || !formData.password) {
        alert("Please fill all required fields");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      if (formData.password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
      }

      // Role specific validation
      if (selectedRole === "seller") {
        if (!formData.businessName) {
          alert("Please enter business name");
          return;
        }
      }

      if (selectedRole === "pandit") {
        if (formData.specialization.length === 0) {
          alert("Please select at least one specialization");
          return;
        }
        if (!formData.experience) {
          alert("Please enter years of experience");
          return;
        }
      }

      // Prepare data based on role
      let registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: selectedRole,
      };

      // Add role-specific data
      if (selectedRole === "seller") {
        registrationData = {
          ...registrationData,
          businessName: formData.businessName,
          businessType: formData.businessType,
          gstNumber: formData.gstNumber,
          location: formData.location,
        };
      }

      if (selectedRole === "pandit") {
        registrationData = {
          ...registrationData,
          specialization: formData.specialization,
          experience: formData.experience,
          languages: formData.languages,
          location: formData.location,
        };
      }

      // Choose appropriate endpoint
      let endpoint = "/auth/register";
      if (selectedRole === "pandit") {
        endpoint = "/auth/pandit-signup";
      } else if (selectedRole === "seller") {
        endpoint = "/auth/seller-signup";
      }

      const response = await api.post(endpoint, registrationData);

      if (response.data.success || response.data.token) {
        let successMessage = "Registration successful!";

        if (selectedRole === "seller") {
          successMessage =
            "Seller registration successful! Your account is pending admin approval. You will receive an email once approved.";
        } else if (selectedRole === "pandit") {
          successMessage =
            "Pandit registration successful! Your profile is pending admin approval. You will receive an email once approved.";
        } else {
          // Auto-login for regular users
          if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        }

        alert(successMessage);
        navigate(selectedRole === "user" ? "/user/dashboard" : "/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🕉️ Join Sanskaar
          </h1>
          <p className="text-gray-600">
            Create your account and start your spiritual journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              Select Your Role
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `border-${role.color}-500 bg-${role.color}-50 shadow-lg scale-105`
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`p-3 rounded-full mb-3 ${
                          isSelected ? `bg-${role.color}-100` : "bg-gray-100"
                        }`}
                      >
                        <Icon
                          className={`w-8 h-8 ${
                            isSelected
                              ? `text-${role.color}-600`
                              : "text-gray-600"
                          }`}
                        />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        {role.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {role.description}
                      </p>
                      {isSelected && (
                        <CheckCircle
                          className={`w-5 h-5 text-${role.color}-600 mt-2`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Information - Common for all */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Seller Specific Fields */}
          {selectedRole === "seller" && (
            <>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-green-600" />
                  Business Information
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                      placeholder="Your business name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type
                    </label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Retailer">Retailer</option>
                      <option value="Individual">Individual Seller</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      placeholder="22AAAAA0000A1Z5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Location for Seller */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Business Location
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      required
                      placeholder="Mumbai"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      {indianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="location.address"
                      value={formData.location.address}
                      onChange={handleChange}
                      placeholder="Full address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Pandit Specific Fields */}
          {selectedRole === "pandit" && (
            <>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-600" />
                  Professional Information
                </h2>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization * (Select at least one)
                  </label>
                  <div className="grid md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {specializations.map((spec) => (
                      <label
                        key={spec}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.specialization.includes(spec)}
                          onChange={() =>
                            handleArrayToggle("specialization", spec)
                          }
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Languages Known (Select all that apply)
                  </label>
                  <div className="grid md:grid-cols-5 gap-2">
                    {languages.map((lang) => (
                      <label
                        key={lang}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang)}
                          onChange={() => handleArrayToggle("languages", lang)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location for Pandit */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Your Location
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      required
                      placeholder="Varanasi"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      {indianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Approval Notice for Seller/Pandit */}
          {(selectedRole === "seller" || selectedRole === "pandit") && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <FileText className="w-6 h-6 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Approval Required
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Your profile will be reviewed by our admin team</li>
                    <li>
                      • You will receive an email notification once approved
                    </li>
                    <li>
                      • Only approved {selectedRole}s can login and access the
                      platform
                    </li>
                    <li>• This process usually takes 24-48 hours</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
