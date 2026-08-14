import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", state: "", district: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        location: { state: form.state, district: form.district },
      };
      const { data } = await client.post("/auth/register", payload);
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-box card">
      <h2>{t("signup.title")}</h2>
      {error && <div className="error-text">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>{t("signup.name")}</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <label>{t("signup.phone")}</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <label>{t("signup.email")}</label>
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label>{t("signup.password")}</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
        <label>{t("signup.state")}</label>
        <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        <label>{t("signup.district")}</label>
        <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "..." : t("signup.submit")}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        {t("signup.haveAccount")} <Link to="/login">{t("signup.loginLink")}</Link>
      </p>
    </div>
  );
}
