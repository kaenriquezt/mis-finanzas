import React, { useState, useMemo } from "react";
import { useMovimientos, usePresupuestos } from "../hooks/useFirestore";
import { CATEGORIAS, TIPO_MOVIMIENTO } from "../data/constants";
import { formatCOP, mesActual, filtrarPorPeriodo } from "../utils/helpers";

export default function Presupuesto() {
  const { movimientos } = useMovimientos();
  const { presupuestos, guardarPresupuesto } = usePresupuestos();
  const [mes, setMes] = useState(mesActual());
  const [editandoId, setEditandoId] = useState(null);
  const [valorEdit, setValorEdit] = useState("");
  const [grupoAbierto, setGrupoAbierto] = useState(null);

  const movsDelMes = useMemo(() =>
    filtrarPorPeriodo(movimientos, { tipo: "mes", valor: mes })
      .filter(m => m.tipo === TIPO_MOVIMIENTO.EGRESO),
    [movimientos, mes]);

  const gastosPorSubcat = useMemo(() => {
    const totales = {};
    movsDelMes.forEach(m => {
      if (m.categoriaId) {
        totales[m.categoriaId] = (totales[m.categoriaId] || 0) + m.monto;
      }
    });
    return totales;
  }, [movsDelMes]);

  const gastosPorGrupo = useMemo(() => {
    const totales = {};
    CATEGORIAS.egresos.forEach(g => {
      totales[g.id] = g.subcategorias.reduce((sum, s) => sum + (gastosPorSubcat[s.id] || 0), 0);
    });
    return totales;
  }, [gastosPorSubcat]);

  const getPresupuesto = (id) => {
    const key = `${mes}_${id}`;
    const def = presupuestos[`default_${id}`];
    return presupuestos[key]?.monto || def?.monto || 0;
  };

  // Banners de alerta: solo subcategorías que sobrepasan el 100%
  const alertas = useMemo(() => {
    const lista = [];
    CATEGORIAS.egresos.forEach(g => {
      g.subcategorias.forEach(s => {
        const p = getPresupuesto(s.id);
        const g_ = gastosPorSubcat[s.id] || 0;
        if (p > 0 && g_ > p) {
          lista.push({ nombre: s.nombre, grupo: g.nombre, gasto: g_, presupuesto: p });
        }
      });
    });
    return lista;
  }, [gastosPorSubcat, presupuestos, mes]);

  const getColor = (pct) => {
    if (pct > 100) return { barra: "#E24B4A", fondo: "#FCEBEB", texto: "#A32D2D" };
    if (pct >= 80) return { barra: "#EDA100", fondo: "#FAEEDA", texto: "#854F0B" };
    return { barra: "#7A9E7E", fondo: null, texto: "var(--texto)" };
  };

  const guardar = async (id, isDefault) => {
    const monto = parseFloat(valorEdit) || 0;
    const mesKey = isDefault ? "default" : mes;
    await guardarPresupuesto(id, monto, mesKey);
    setEditandoId(null);
  };

  const anioActual = new Date().getFullYear();
  const MESES_OPTS = Array.from({ length: 12 }, (_, i) => {
    const val = `${anioActual}-${String(i + 1).padStart(2, "0")}`;
    const lbl = new Date(anioActual, i, 1).toLocaleDateString("es-CO", { month: "long" });
    return { val, lbl };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Selector de mes */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <select value={mes} onChange={e => setMes(e.target.value)} style={{ width: "auto" }}>
          {MESES_OPTS.map(m => <option key={m.val} value={m.val}>{m.lbl} {anioActual}</option>)}
        </select>
        <span style={{ fontSize: 12, color: "var(--texto-muy-suave)" }}>
          Los cambios de presupuesto solo aplican a este mes. Para cambiar el default, edita cualquier categoría.
        </span>
      </div>

      {/* Banners de alerta */}
      {alertas.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {alertas.map((a, i) => (
            <div key={i} style={{
              background: "#FCEBEB",
              border: "1px solid #F09595",
              borderRadius: "var(--radio)",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              <span style={{ fontSize: 14 }}>⚠️</span>
              <span style={{ fontSize: 13, color: "#A32D2D" }}>
                <strong>{a.nombre}</strong> ({a.grupo}) superó el presupuesto —{" "}
                {formatCOP(a.gasto)} de {formatCOP(a.presupuesto)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Grupos */}
      {CATEGORIAS.egresos.map(grupo => {
        const totalGrupo = gastosPorGrupo[grupo.id] || 0;
        const presupuestoGrupo = grupo.subcategorias.reduce((s, sub) => s + getPresupuesto(sub.id), 0);
        const pctGrupo = presupuestoGrupo > 0 ? (totalGrupo / presupuestoGrupo) * 100 : 0;
        const colGrupo = getColor(pctGrupo);
        const abierto = grupoAbierto === grupo.id;

        return (
          <div key={grupo.id} className="tarjeta" style={{ padding: 0, overflow: "hidden" }}>
            {/* Header grupo */}
            <button
              style={{
                width: "100%", background: "transparent", border: "none",
                padding: "1rem 1.25rem", cursor: "pointer", textAlign: "left",
                borderRadius: 0
              }}
              onClick={() => setGrupoAbierto(abierto ? null : grupo.id)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: presupuestoGrupo > 0 ? 8 : 0 }}>
                <span style={{ fontWeight: 500, fontSize: 15 }}>{grupo.nombre}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, color: colGrupo.texto }}>
                    {formatCOP(totalGrupo)}
                    {presupuestoGrupo > 0 && (
                      <span style={{ color: "var(--texto-muy-suave)", fontWeight: 400 }}>
                        {" "}/ {formatCOP(presupuestoGrupo)}
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--texto-muy-suave)" }}>{abierto ? "▲" : "▼"}</span>
                </div>
              </div>
              {presupuestoGrupo > 0 && (
                <div style={{ height: 5, borderRadius: 99, background: "var(--superficie-2)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(pctGrupo, 100)}%`, borderRadius: 99, background: colGrupo.barra }} />
                </div>
              )}
            </button>

            {/* Subcategorías */}
            {abierto && (
              <div style={{ borderTop: "1px solid var(--borde)" }}>
                {grupo.subcategorias.map(sub => {
                  const gasto = gastosPorSubcat[sub.id] || 0;
                  const presupuesto = getPresupuesto(sub.id);
                  const pct = presupuesto > 0 ? (gasto / presupuesto) * 100 : 0;
                  const col = getColor(pct);

                  return (
                    <div key={sub.id} style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--borde)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: presupuesto > 0 ? 6 : 0 }}>
                        <span style={{ fontSize: 14, color: "var(--texto)" }}>{sub.nombre}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {editandoId === sub.id ? (
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <input
                                type="number"
                                value={valorEdit}
                                onChange={e => setValorEdit(e.target.value)}
                                style={{ width: 110, textAlign: "right", fontSize: 13 }}
                                autoFocus
                                placeholder="Presupuesto"
                                onKeyDown={e => e.key === "Enter" && guardar(sub.id, false)}
                              />
                              <button className="btn-primario" style={{ padding: "5px 10px", fontSize: 12 }}
                                onClick={() => guardar(sub.id, false)}>✓</button>
                              <button className="btn-ghost" style={{ padding: "5px 8px", fontSize: 12 }}
                                onClick={() => setEditandoId(null)}>✕</button>
                            </div>
                          ) : (
                            <>
                              <span style={{ fontSize: 14, color: col.texto, fontWeight: 500 }}>
                                {formatCOP(gasto)}
                                {presupuesto > 0 && (
                                  <span style={{ color: "var(--texto-muy-suave)", fontWeight: 400 }}>
                                    {" "}/ {formatCOP(presupuesto)}
                                  </span>
                                )}
                              </span>
                              <button
                                className="btn-ghost"
                                style={{ padding: "3px 8px", fontSize: 12 }}
                                onClick={() => { setEditandoId(sub.id); setValorEdit(String(presupuesto || "")); }}
                              >
                                {presupuesto > 0 ? "✎" : "+ presupuesto"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {presupuesto > 0 && (
                        <div style={{ height: 5, borderRadius: 99, background: "var(--superficie-2)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%",
                            width: `${Math.min(pct, 100)}%`,
                            borderRadius: 99,
                            background: col.barra
                          }} />
                        </div>
                      )}
                      {pct > 100 && (
                        <p style={{ fontSize: 11, color: col.texto, marginTop: 3 }}>
                          Excedido en {formatCOP(gasto - presupuesto)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
