import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import client from "../api/client";

export default function Verify() {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  async function checkCode(codeToCheck) {
    setError("");
    setResult(null);
    try {
      const { data } = await client.get(`/products/verify/${encodeURIComponent(codeToCheck)}`);
      setResult(data);
    } catch (err) {
      if (err.response?.data) setResult(err.response.data);
      else setError("Failed to verify product");
    }
  }

  async function startScan() {
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const elementId = "qr-reader";
      const html5QrCode = new Html5Qrcode(elementId);
      scannerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        async (decodedText) => {
          setCode(decodedText);
          await html5QrCode.stop();
          setScanning(false);
          checkCode(decodedText);
        },
        () => {}
      );
    } catch (err) {
      setError("Camera not available. Please enter the code manually below.");
      setScanning(false);
    }
  }

  async function stopScan() {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch (e) {}
    }
    setScanning(false);
  }

  return (
    <div>
      <h1>{t("verify.title")}</h1>
      <div className="card" style={{ maxWidth: 480 }}>
        {!scanning ? (
          <button className="btn" onClick={startScan}>{t("verify.scanBtn")}</button>
        ) : (
          <div>
            <div id="qr-reader" style={{ width: "100%" }}></div>
            <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={stopScan}>Stop</button>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <label>{t("verify.manualLabel")}</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. FD-BATCH-12345-AB12CD" />
          <button className="btn" onClick={() => checkCode(code)} disabled={!code}>
            {t("verify.checkBtn")}
          </button>
        </div>
        {error && <div className="error-text">{error}</div>}
      </div>

      {result && (
        <div className="card">
          {result.verified === false && !result.product && (
            <div className="badge badge-danger">{t("verify.fake")}</div>
          )}
          {result.product && (
            <>
              <h3>{result.product.name}</h3>
              <p>Manufacturer: {result.product.manufacturer}</p>
              <p>Batch: {result.product.batchNumber}</p>
              <p>Expiry: {new Date(result.product.expiryDate).toLocaleDateString()}</p>
              <p>
                {result.verified ? (
                  <span className="badge badge-success">{t("verify.genuine")}</span>
                ) : (
                  <span className="badge badge-danger">{t("verify.fake")}</span>
                )}
                {result.isExpired && <span className="badge badge-warning" style={{ marginLeft: 8 }}>{t("verify.expired")}</span>}
              </p>
            </>
          )}
          <p style={{ marginTop: 8 }}>{result.message}</p>
        </div>
      )}
    </div>
  );
}
