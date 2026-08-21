import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export default function Login() {
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const entrar = async () => {
    setCargando(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      if (e.code === "auth/popup-closed-by-user") {
        setError("");
      } else if (e.code === "auth/unauthorized-domain") {
        setError("Este dominio no está autorizado en Firebase. Agrégalo en Authentication → Settings → Dominios autorizados.");
      } else {
        setError("No se pudo iniciar sesión. Intenta de nuevo.");
      }
    }
    setCargando(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--fondo)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem"
    }}>
      <div className="tarjeta" style={{ maxWidth: 360, width: "100%", textAlign: "center", padding: "2.5rem 2rem" }}>
        <h1 style={{
          fontFamily: "'Lora', serif",
          fontSize: 26,
          fontWeight: 500,
          marginBottom: 6
        }}>
          mis finanzas
        </h1>
        <p style={{ fontSize: 14, color: "var(--texto-suave)", marginBottom: "1.75rem" }}>
          Entra con tu cuenta de Google para ver tus datos.
        </p>

        <button
          className="btn-primario"
          style={{ width: "100%", padding: "12px" }}
          onClick={entrar}
          disabled={cargando}
        >
          {cargando ? "Entrando..." : "Entrar con Google"}
        </button>

        {error && (
          <p style={{ fontSize: 13, color: "var(--negativo)", marginTop: "1rem", lineHeight: 1.5 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
