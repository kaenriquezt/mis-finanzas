import React, { useState, useMemo } from "react";
import { useMovimientos } from "../hooks/useFirestore";
import { CATEGORIAS, TIPO_MOVIMIENTO } from "../data/constants";
import { formatCOP, mesActual, filtrarPorPeriodo } from "../utils/helpers";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export default function Flujo() {
  const { movimientos, loading } = useMovimientos();
  const [filtro, setFiltro] = useState({ tipo: "mes", valor: mesActual() });
  const [rangoCustom, setRangoCustom] = useState({ desde: "", hasta: "" });

  const movsFiltrados = useMemo(() => {
    const f = filtro.tipo === "personalizado"
      ? { tipo: "personalizado", valor: rangoCustom }
      : filtro;
    return filtrarPorPeriodo(movimientos, f).filter(m =>
      m.tipo === TIPO_MOVIMIENTO.INGRESO || m.tipo === TIPO_MOVIMIENTO.EGRESO
    );
  }, [movimientos, filtro, rangoCustom]);

  const totalIngresos = useMemo(() =>
    movsFiltrados.filter(m => m.tipo === TIPO_MOVIMIENTO.INGRESO).reduce((s, m) => s + m.monto, 0),
    [movsFiltrados]);

  const totalEgresos = useMemo(() =>
    movsFiltrados.filter(m => m.tipo === TIPO_MOVIMIENTO.EGRESO).reduce((s, m) => s + m.monto, 0),
    [movsFiltrados]);

  const balance = totalIngresos - totalEgresos;

  // Egresos por grupo
  const egresosPorGrupo = useMemo(() => {
    const grupos = {};
    CATEGORIAS.egresos.forEach(g => { grupos[g.id] = { nombre: g.nombre, total: 0 }; });
    movsFiltrados
      .filter(m => m.tipo === TIPO_MOVIMIENTO.EGRESO)
      .forEach(m => {
        if (m.categoriaGrupo && grupos[m.categoriaGrupo]) {
          grupos[m.categoriaGrupo].total += m.monto;
        }
      });
    return Object.values(grupos).filter(g => g.total > 0).sort((a, b) => b.total - a.total);
  }, [movsFiltrados]);

  // Datos para gráfica de meses del año actual
  const datosMensuales = useMemo(() => {
    const anio = new Date().getFullYear();
    return MESES.map((mes, i) => {
      const movsDelMes = filtrarPorPeriodo(movimientos, {
        tipo: "mes",
        valor: `${anio}-${String(i + 1).padStart(2, "0")}`
      });
      return {
        mes,
        ingresos: movsDelMes.filter(m => m.tipo === TIPO_MOVIMIENTO.INGRESO).reduce((s, m) => s + m.monto, 0),
        egresos: movsDelMes.filter(m => m.tipo === TIPO_MOVIMIENTO.EGRESO).reduce((s, m) => s + m.monto, 0)
      };
    });
  }, [movimientos]);

  const anioActual = new Date().getFullYear();
  const años = [anioActual, anioActual - 1, anioActual - 2];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "var(--superficie)", border: "1px solid var(--borde)",
        borderRadius: 8, padding: "8px 12px", fontSize: 13
      }}>
        <p style={{ fontWeight: 500, marginBottom: 4 }}>{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name === "ingresos" ? "Ingresos" : "Egresos"}: {formatCOP(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["mes", "anio", "personalizado"].map(t => (
            <button
              key={t}
              className={filtro.tipo === t ? "btn-primario" : "btn-secundario"}
              style={{ padding: "7px 14px", fontSize: 13 }}
              onClick={() => setFiltro({ tipo: t, valor: t === "mes" ? mesActual() : String(anioActual) })}
            >
              {t === "mes" ? "Mes" : t === "anio" ? "Año" : "Personalizado"}
            </button>
          ))}
        </div>

        {filtro.tipo === "mes" && (
          <select
            value={filtro.valor}
            onChange={e => setFiltro(f => ({ ...f, valor: e.target.value }))}
            style={{ width: "auto" }}
          >
            {años.flatMap(a =>
              MESES.map((m, i) => {
                const val = `${a}-${String(i + 1).padStart(2, "0")}`;
                return <option key={val} value={val}>{m} {a}</option>;
              })
            )}
          </select>
        )}

        {filtro.tipo === "anio" && (
          <select value={filtro.valor} onChange={e => setFiltro(f => ({ ...f, valor: e.target.value }))} style={{ width: "auto" }}>
            {años.map(a => <option key={a} value={String(a)}>{a}</option>)}
          </select>
        )}
      </div>

      {filtro.tipo === "personalizado" && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="date" value={rangoCustom.desde}
            onChange={e => setRangoCustom(p => ({ ...p, desde: e.target.value }))} style={{ flex: 1 }} />
          <span style={{ color: "var(--texto-suave)", fontSize: 13 }}>hasta</span>
          <input type="date" value={rangoCustom.hasta}
            onChange={e => setRangoCustom(p => ({ ...p, hasta: e.target.value }))} style={{ flex: 1 }} />
        </div>
      )}

      {/* Resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Ingresos", valor: totalIngresos, color: "var(--positivo)", fondo: "var(--positivo-fondo)" },
          { label: "Egresos", valor: totalEgresos, color: "var(--negativo)", fondo: "var(--negativo-fondo)" },
          { label: "Balance", valor: balance, color: balance >= 0 ? "var(--positivo)" : "var(--negativo)", fondo: balance >= 0 ? "var(--positivo-fondo)" : "var(--negativo-fondo)" }
        ].map(item => (
          <div key={item.label} style={{
            background: item.fondo,
            borderRadius: "var(--radio)",
            padding: "0.875rem 1rem"
          }}>
            <p className="etiqueta" style={{ color: item.color, marginBottom: 4 }}>{item.label}</p>
            <p className="numero-grande" style={{ fontSize: 19, color: item.color }}>
              {item.label !== "Balance" ? "" : balance >= 0 ? "+" : "−"}
              {formatCOP(Math.abs(item.valor))}
            </p>
          </div>
        ))}
      </div>

      {/* Gráfica mensual */}
      {filtro.tipo === "anio" && (
        <div className="tarjeta">
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--texto-suave)", marginBottom: "1rem" }}>
            Ingresos vs egresos — {filtro.valor}
          </p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosMensuales} barGap={2}>
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#9B9B98" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="ingresos" fill="#7A9E7E" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="egresos" fill="#D4A5A0" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "var(--texto-suave)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#7A9E7E", display: "inline-block" }}></span>
              Ingresos
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#D4A5A0", display: "inline-block" }}></span>
              Egresos
            </span>
          </div>
        </div>
      )}

      {/* Egresos por categoría */}
      {egresosPorGrupo.length > 0 && (
        <div className="tarjeta">
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--texto-suave)", marginBottom: "1rem" }}>
            Egresos por categoría
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {egresosPorGrupo.map(grupo => {
              const pct = totalEgresos > 0 ? (grupo.total / totalEgresos) * 100 : 0;
              return (
                <div key={grupo.nombre}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 14 }}>{grupo.nombre}</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{formatCOP(grupo.total)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: "var(--superficie-2)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: "var(--acento)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
