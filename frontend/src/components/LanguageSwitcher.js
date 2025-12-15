import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
    { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्" },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {languages.find((lang) => lang.code === i18n.language)?.nativeName ||
            "English"}
        </span>
      </button>

      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
              i18n.language === lang.code
                ? "bg-orange-50 text-orange-600 font-semibold"
                : "text-gray-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{lang.nativeName}</span>
              {i18n.language === lang.code && (
                <span className="text-orange-600">✓</span>
              )}
            </div>
            <span className="text-xs text-gray-500">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
