import React, { useState, useEffect } from "react";
import "./index.css";
import Patrimonio from "./components/Patrimonio";
import Flujo from "./components/Flujo";
import Presupuesto from "./components/Presupuesto";
import Movimientos from "./components/Movimientos";
import { useCuentas } from "./hooks/useFirestore";

const TABS = [
  { id: "patrimonio", label: "Patrimonio" },
  { id: "flujo", label: "Flujo" },
  { id: "presupuesto", label: "Presupuesto" },
  { id: "movimientos", label: "Movimientos" }
];

export default function App() {
  const [tabActiva, setTabActiva] = useState("patrimonio");
  const { cuentas, loading, actualizarSaldo, agregarCuenta, eliminarCuenta } = useCuentas();

  return (
    <div style={{ minHeight: "100vh", background: "var(--fondo)" }}>
      {/* Header */}
      <header style={{
        background: "var(--superficie)",
        borderBottom: "1px solid var(--borde)",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: 840, margin: "0 auto", padding: "0 1.25rem" }}>
          <div style={{ paddingTop: "1rem", paddingBottom: "0.25rem" }}>
            <h1 style={{
              fontFamily: "'Lora', serif",
              fontSize: 20,
              fontWeight: 500,
              color: "var(--texto)"
            }}>
              mis finanzas
            </h1>
          </div>
          {/* Tabs */}
          <nav style={{ display: "flex", gap: 2, marginTop: "0.25rem" }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: tabActiva === tab.id
                    ? "2px solid var(--acento)"
                    : "2px solid transparent",
                  borderRadius: 0,
                  color: tabActiva === tab.id ? "var(--acento-hover)" : "var(--texto-suave)",
                  fontWeight: tabActiva === tab.id ? 500 : 400,
                  fontSize: 14,
                  padding: "0.6rem 0.75rem",
                  cursor: "pointer",
                  transition: "color 0.15s, border-color 0.15s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Contenido */}
      <main style={{ maxWidth: 840, margin: "0 auto", padding: "1.5rem 1.25rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--texto-suave)" }}>
            Cargando...
          </div>
        ) : (
          <>
            {tabActiva === "patrimonio" && (
              <Patrimonio cuentas={cuentas} actualizarSaldo={actualizarSaldo} agregarCuenta={agregarCuenta} eliminarCuenta={eliminarCuenta} />
            )}
            {tabActiva === "flujo" && <Flujo cuentas={cuentas} />}
            {tabActiva === "presupuesto" && <Presupuesto />}
            {tabActiva === "movimientos" && <Movimientos cuentas={cuentas} />}
          </>
        )}
      </main>
    </div>
  );
}
