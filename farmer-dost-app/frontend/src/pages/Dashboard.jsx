import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const cards = [
  { key: "recommendCard", to: "/recommend", icon: "🌱" },
  { key: "verifyCard", to: "/verify", icon: "🔍" },
  { key: "weatherCard", to: "/weather", icon: "⛅" },
  { key: "marketCard", to: "/market", icon: "🛒" },
  { key: "complaintsCard", to: "/complaints", icon: "📢" },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div>
      <h1>{t("dashboard.welcome")}, {user?.name}!</h1>
      <p>{t("dashboard.subtitle")}</p>
      <div className="grid" style={{ marginTop: 20 }}>
        {cards.map((c) => (
          <Link key={c.key} to={c.to} className="card" style={{ display: "block" }}>
            <div style={{ fontSize: "2rem" }}>{c.icon}</div>
            <div style={{ marginTop: 8, fontWeight: 600 }}>{t(`dashboard.${c.key}`)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
