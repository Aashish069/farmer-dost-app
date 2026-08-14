import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import client from "../api/client";

const CROPS = ["wheat", "rice", "maize", "sugarcane", "cotton", "potato"];
const SOILS = ["alluvial", "black", "red", "laterite", "sandy", "clay", "loamy", "unknown"];

export default function Recommend() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ crop: "wheat", season: "rabi", soilType: "alluvial" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await client.post("/recommend", form);
      setResult(data.recommendation);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get recommendation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>{t("recommend.title")}</h1>
      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <label>{t("recommend.crop")}</label>
          <select value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })}>
            {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label>{t("recommend.season")}</label>
          <select value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })}>
            <option value="kharif">Kharif</option>
            <option value="rabi">Rabi</option>
            <option value="zaid">Zaid</option>
          </select>
          <label>{t("recommend.soilType")}</label>
          <select value={form.soilType} onChange={(e) => setForm({ ...form, soilType: e.target.value })}>
            {SOILS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn" disabled={loading}>{loading ? "..." : t("recommend.submit")}</button>
        </form>
        {error && <div className="error-text">{error}</div>}
      </div>

      {result && (
        <div className="card">
          <h3>{t("recommend.result")}</h3>
          <p><strong>{result.fertilizer}</strong></p>
          <p>💡 {t("recommend.tip")}: {result.tip}</p>
          <p>🌍 {t("recommend.soilNote")}: {result.soilNote}</p>
          <p>{t("recommend.confidence")}: <span className="badge badge-success">{result.confidencePercent}%</span></p>
        </div>
      )}
    </div>
  );
}
