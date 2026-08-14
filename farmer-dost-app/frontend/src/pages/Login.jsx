import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await client.post("/auth/login", form);
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-box card">
      <h2>{t("login.title")}</h2>
      {error && <div className="error-text">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>{t("login.phone")}</label>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <label>{t("login.password")}</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "..." : t("login.submit")}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        {t("login.noAccount")} <Link to="/signup">{t("login.signupLink")}</Link>
      </p>
      <p style={{ fontSize: "0.8rem", color: "#666" }}>
        Demo: phone 9876543210 / password farmer123 (after running <code>npm run seed</code> in backend)
      </p>
    </div>
  );
}
