import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import client from "../api/client";

const ISSUE_TYPES = ["fake_product", "expired_product", "wrong_labeling", "poor_quality", "other"];

export default function Complaints() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ issueType: "fake_product", description: "", qrCodeScanned: "" });
  const [mine, setMine] = useState([]);
  const [message, setMessage] = useState("");

  async function loadMine() {
    const { data } = await client.get("/complaints/mine");
    setMine(data.complaints);
  }

  useEffect(() => { loadMine(); }, []); // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      await client.post("/complaints", form);
      setMessage("Complaint submitted.");
      setForm({ issueType: "fake_product", description: "", qrCodeScanned: "" });
      loadMine();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit complaint");
    }
  }

  return (
    <div>
      <h1>{t("complaints.title")}</h1>
      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <label>{t("complaints.issueType")}</label>
          <select value={form.issueType} onChange={(e) => setForm({ ...form, issueType: e.target.value })}>
            {ISSUE_TYPES.map((i) => <option key={i} value={i}>{i.replace("_", " ")}</option>)}
          </select>
          <label>{t("complaints.qrCode")}</label>
          <input value={form.qrCodeScanned} onChange={(e) => setForm({ ...form, qrCodeScanned: e.target.value })} />
          <label>{t("complaints.description")}</label>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <button className="btn">{t("complaints.submit")}</button>
        </form>
        {message && <div className="success-text">{message}</div>}
      </div>

      <h3>{t("complaints.myComplaints")}</h3>
      <div className="grid">
        {mine.map((c) => (
          <div className="card" key={c._id}>
            <p><strong>{c.issueType.replace("_", " ")}</strong></p>
            <p>{c.description}</p>
            <span className="badge badge-warning">{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
