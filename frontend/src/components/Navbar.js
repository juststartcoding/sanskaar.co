import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  LogOut,
  Heart,
  BookOpen,
  Users,
  Home,
  MapPin,
  Trash2,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated, user, logout, getCartCount } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate("/");
  };

  const navLinks = [
    { name: t("nav.home"), href: "/", icon: Home },
    { name: t("nav.poojas"), href: "/poojas", icon: BookOpen },
    { name: t("nav.shop"), href: "/shop", icon: ShoppingCart },
    { name: t("nav.pandits"), href: "/pandits", icon: Users },
    { name: t("nav.temples"), href: "/temples", icon: MapPin },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/logo.jpeg" 
              alt="Sanskaar" 
              className="w-12 h-12 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Sanskaar
              </span>
              <span className="text-xs text-gray-600 -mt-1">संस्कार</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                    active
                      ? "text-orange-600 bg-orange-50"
                      : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <LanguageSwitcher />

            {/* Search Icon */}
            <button
              onClick={() => navigate("/search")}
              className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 hover:bg-orange-50 rounded-lg transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* User Profile / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 border border-gray-100 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      {user?.role && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full capitalize">
                          {user.role}
                        </span>
                      )}
                    </div>

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      My Dashboard
                    </Link>

                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      My Orders
                    </Link>

                    <Link
                      to="/user/wishlist"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Heart className="w-4 h-4" />
                      Wishlist
                    </Link>

                    {/* Admin Link */}
                    {(user?.role === "admin" || user?.role === "superadmin") && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 transition-colors border-t border-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-5 py-2 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg"
              >
                <User className="w-4 h-4" />
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-orange-50 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-slideDown">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors font-medium ${
                    active
                      ? "text-orange-600 bg-orange-50"
                      : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}

            {/* Extra Mobile Links */}
            <Link
              to="/waste-collection"
              className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <Trash2 className="w-5 h-5" />
              Eco Waste Collection
            </Link>

            {!isAuthenticated && (
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium mt-4"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
