import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import client from "../api/client";

export default function Market() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({}); // productId -> quantity
  const [message, setMessage] = useState("");

  async function loadProducts() {
    const { data } = await client.get("/products", { params: search ? { search } : {} });
    setProducts(data.products);
  }

  useEffect(() => { loadProducts(); }, []); // eslint-disable-line

  function addToCart(id) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }

  async function placeOrder() {
    setMessage("");
    const items = Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity }));
    if (items.length === 0) return;
    try {
      await client.post("/orders", { items, deliveryAddress: "Default farm address" });
      setMessage("Order placed successfully!");
      setCart({});
      loadProducts();
    } catch (err) {
      setMessage(err.response?.data?.message || "Order failed");
    }
  }

  return (
    <div>
      <h1>{t("market.title")}</h1>
      <div className="card" style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <label>{t("market.search")}</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadProducts()} />
        </div>
        <button className="btn" onClick={loadProducts} style={{ marginBottom: 12 }}>{t("weather.search")}</button>
      </div>

      {message && <div className="success-text">{message}</div>}

      <div className="grid">
        {products.map((p) => (
          <div className="card" key={p._id}>
            <h3>{p.name}</h3>
            <p>{p.manufacturer}</p>
            <p>₹{p.price}</p>
            <p>{p.stock > 0 ? `Stock: ${p.stock}` : <span className="badge badge-danger">{t("market.outOfStock")}</span>}</p>
            {p.isVerifiedGenuine ? (
              <span className="badge badge-success">Verified</span>
            ) : (
              <span className="badge badge-danger">Reported Fake</span>
            )}
            <div style={{ marginTop: 10 }}>
              <button className="btn" disabled={p.stock === 0} onClick={() => addToCart(p._id)}>
                {t("market.addToOrder")} {cart[p._id] ? `(${cart[p._id]})` : ""}
              </button>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(cart).length > 0 && (
        <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={placeOrder}>
          {t("market.placeOrder")}
        </button>
      )}
    </div>
  );
}
