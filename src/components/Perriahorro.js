import React, { useState, useMemo } from "react";
import { useAportesPeriahorro } from "../hooks/useFirestore";
import { formatCOP, formatFecha, generarImagenPerriahorro } from "../utils/helpers";

const MIEMBROS = ["Yo", "So", "Ale", "Yk"];

export default function Perriahorro({ onCerrar }) {
  const { aportes, agregarAporte } = useAportesPeriahorro();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoAporte, setNuevoAporte] = useState({ miembro: "Yo", monto: "", nota: "" });

  const saldoTotal = useMemo(() =>
    aportes.reduce((sum, a) => sum + (a.monto || 0), 0), [aportes]);

  const aportesPorMiembro = useMemo(() => {
    const totales = {};
    MIEMBROS.forEach(m => { totales[m] = 0; });
    aportes.forEach(a => {
      if (totales[a.miembro] !== undefined) totales[a.miembro] += a.monto || 0;
    });
    return totales;
  }, [aportes]);

  const compartirEstado = () => {
    const mesActual = new Date().toLocaleDateString("es-CO", { month: "long", year: "numeric" });
    const dataUrl = generarImagenPerriahorro(aportesPorMiembro, saldoTotal, mesActual);
    const link = document.createElement("a");
    link.download = `perriahorro-${new Date().toISOString().slice(0, 7)}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleAgregar = async () => {
    if (!nuevoAporte.monto) return;
    await agregarAporte({
      miembro: nuevoAporte.miembro,
      monto: parseFloat(nuevoAporte.monto),
      nota: nuevoAporte.nota
    });
    setNuevoAporte({ miembro: "Yo", monto: "", nota: "" });
    setMostrarForm(false);
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div>
            <div style={{ fontSize: 32, marginBottom: 4 }}>💛</div>
            <h2 style={{ margin: 0 }}>Perriahorro</h2>
            <p style={{ fontSize: 12, color: "var(--texto-suave)", marginTop: 2 }}>No incluido en patrimonio</p>
          </div>
          <button className="btn-ghost" style={{ padding: "4px 8px" }} onClick={onCerrar}>✕</button>
        </div>

        {/* Saldo total */}
        <div style={{
          background: "var(--acento-suave)",
          borderRadius: "var(--radio)",
          padding: "1rem",
          marginBottom: "1.25rem",
          textAlign: "center"
        }}>
          <p className="etiqueta">Saldo total</p>
          <p className="numero-grande" style={{ fontSize: 32, color: "var(--acento-hover)" }}>
            {formatCOP(saldoTotal)}
          </p>
        </div>

        {/* Aportes por miembro */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "1.25rem" }}>
          {MIEMBROS.map(m => (
            <div key={m} style={{
              background: "var(--fondo)",
              borderRadius: "var(--radio)",
              padding: "0.75rem 1rem"
            }}>
              <p style={{ fontSize: 13, color: "var(--texto-suave)", marginBottom: 2 }}>{m}</p>
              <p className="numero-grande" style={{ fontSize: 17 }}>
                {formatCOP(aportesPorMiembro[m] || 0)}
              </p>
            </div>
          ))}
        </div>

        {/* Formulario nuevo aporte */}
        {mostrarForm && (
          <div style={{
            background: "var(--fondo)",
            borderRadius: "var(--radio)",
            padding: "1rem",
            marginBottom: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label className="etiqueta">Quién aportó</label>
                <select
                  value={nuevoAporte.miembro}
                  onChange={e => setNuevoAporte(p => ({ ...p, miembro: e.target.value }))}
                >
                  {MIEMBROS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="etiqueta">Monto</label>
                <input
                  type="number"
                  placeholder="0"
                  value={nuevoAporte.monto}
                  onChange={e => setNuevoAporte(p => ({ ...p, monto: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="etiqueta">Nota (opcional)</label>
              <input
                placeholder="Ej: Cuota agosto"
                value={nuevoAporte.nota}
                onChange={e => setNuevoAporte(p => ({ ...p, nota: e.target.value }))}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primario" style={{ flex: 1 }} onClick={handleAgregar}>
                Guardar
              </button>
              <button className="btn-secundario" onClick={() => setMostrarForm(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Historial */}
        {aportes.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <p className="etiqueta" style={{ marginBottom: 8 }}>Historial</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
              {aportes.slice(0, 20).map(a => (
                <div key={a.id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--borde)"
                }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{a.miembro}</span>
                    {a.nota && <span style={{ fontSize: 12, color: "var(--texto-suave)", marginLeft: 6 }}>{a.nota}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="numero-grande" style={{ fontSize: 15, color: "var(--positivo)" }}>
                      +{formatCOP(a.monto)}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--texto-muy-suave)" }}>
                      {formatFecha(a.fecha)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones */}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-primario" style={{ flex: 1 }} onClick={() => setMostrarForm(true)}>
            + Registrar aporte
          </button>
          <button className="btn-secundario" onClick={compartirEstado} title="Descargar imagen para compartir">
            💛 Compartir
          </button>
        </div>
      </div>
    </div>
  );
}
