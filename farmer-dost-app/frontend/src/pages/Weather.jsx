import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import client from "../api/client";

export default function Weather() {
  const { t } = useTranslation();
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchWeather(params) {
    setError("");
    setLoading(true);
    try {
      const { data } = await client.get("/weather", { params });
      setData(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setError("Could not get your location. Try searching by city instead.")
    );
  }

  return (
    <div>
      <h1>{t("weather.title")}</h1>
      <div className="card" style={{ maxWidth: 480 }}>
        <button className="btn" onClick={useMyLocation} disabled={loading}>{t("weather.useLocation")}</button>
        <div style={{ marginTop: 16 }}>
          <label>{t("weather.orCity")}</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Bareilly" />
          <button className="btn btn-secondary" onClick={() => fetchWeather({ city })} disabled={!city || loading}>
            {t("weather.search")}
          </button>
        </div>
        {error && <div className="error-text">{error}</div>}
      </div>

      {data && (
        <div className="card">
          <h3>{data.weather.location}</h3>
          <p>{t("weather.temperature")}: {data.weather.temperature}°C</p>
          <p>{t("weather.humidity")}: {data.weather.humidity}%</p>
          <p>{t("weather.condition")}: {data.weather.description}</p>
          <h4 style={{ marginTop: 12 }}>{t("weather.advice")}</h4>
          <ul>
            {data.advice.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
