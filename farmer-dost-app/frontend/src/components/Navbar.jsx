import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function changeLang(e) {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem("fd_lang", lang);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="navbar">
      <div className="brand">🌾 {t("appName")}</div>
      <nav>
        {user ? (
          <>
            <Link to="/">{t("nav.dashboard")}</Link>
            <Link to="/recommend">{t("nav.recommend")}</Link>
            <Link to="/verify">{t("nav.verify")}</Link>
            <Link to="/weather">{t("nav.weather")}</Link>
            <Link to="/market">{t("nav.market")}</Link>
            <Link to="/complaints">{t("nav.complaints")}</Link>
            <button onClick={handleLogout}>{t("nav.logout")}</button>
          </>
        ) : (
          <>
            <Link to="/login">{t("nav.login")}</Link>
            <Link to="/signup">{t("nav.signup")}</Link>
          </>
        )}
        <span className="lang-switch">
          <select value={i18n.language} onChange={changeLang}>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </span>
      </nav>
    </div>
  );
}
