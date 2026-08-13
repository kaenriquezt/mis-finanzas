import React, { useState, useEffect } from "react";
import { formatCOP, formatUSD, obtenerTasaCambio, calcularPatrimonio } from "../utils/helpers";
import Perriahorro from "./Perriahorro";

const TIPOS = {
  ahorro: { label: "Ahorros", orden: 1 },
  cdt: { label: "CDT", orden: 2 },
  credito: { label: "Tarjetas de crédito", orden: 3 },
  deuda: { label: "Deudas", orden: 4 },
  cuentas_cobrar: { label: "Cuentas por cobrar", orden: 5 },
  compartida: { label: "Ahorros compartidos", orden: 6 }
};

export default function Patrimonio({ cuentas, actualizarSaldo, agregarCuenta, eliminarCuenta }) {
  const [tasaCambio, setTasaCambio] = useState(4200);
  const [editandoId, setEditandoId] = useState(null);
  const [valorEdit, setValorEdit] = useState("");
  const [mostrarPerriahorro, setMostrarPerriahorro] = useState(false);
  const [mostrarNuevaCuenta, setMostrarNuevaCuenta] = useState(false);
  const [nuevaCuenta, setNuevaCuenta] = useState({ nombre: "", tipo: "cuentas_cobrar", moneda: "COP", saldo: 0 });

  useEffect(() => {
    obtenerTasaCambio().then(setTasaCambio);
  }, []);

  const patrimonioNeto = calcularPatrimonio(
    cuentas.map(c => {
      if (c.moneda === "USD") return { ...c, saldo: c.saldo * tasaCambio };
      return c;
    })
  );

  const cuentasPorTipo = Object.entries(TIPOS)
    .map(([tipo, info]) => ({
      tipo,
      ...info,
      cuentas: cuentas.filter(c => c.tipo === tipo)
    }))
    .filter(g => g.cuentas.length > 0)
    .sort((a, b) => a.orden - b.orden);

  const iniciarEdicion = (cuenta) => {
    setEditandoId(cuenta.id);
    setValorEdit(cuenta.saldo.toString());
  };

  const guardarEdicion = async (cuenta) => {
    const nuevo = parseFloat(valorEdit.replace(/[^0-9.-]/g, "")) || 0;
    await actualizarSaldo(cuenta.id, nuevo);
    setEditandoId(null);
  };

  const saldoCOP = (cuenta) => {
    if (cuenta.moneda === "USD") return cuenta.saldo * tasaCambio;
    return cuenta.saldo;
  };

  const totalGrupo = (grupo) => {
    return grupo.cuentas.reduce((sum, c) => sum + Math.abs(saldoCOP(c)), 0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Patrimonio neto hero */}
      <div className="tarjeta" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
        <p className="etiqueta">Patrimonio neto</p>
        <p className={`numero-grande ${patrimonioNeto >= 0 ? "" : ""}`} style={{
          fontSize: 42,
          color: patrimonioNeto >= 0 ? "var(--texto)" : "var(--negativo)",
          lineHeight: 1.1,
          marginTop: 4
        }}>
          {formatCOP(patrimonioNeto)}
        </p>
        <p style={{ fontSize: 12, color: "var(--texto-muy-suave)", marginTop: 8 }}>
          TRM: {formatCOP(tasaCambio)} por USD · actualizado hoy
        </p>
      </div>

      {/* Grupos de cuentas */}
      {cuentasPorTipo.map(grupo => (
        grupo.tipo === "compartida" ? (
          <div key={grupo.tipo}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--texto-suave)" }}>{grupo.label}</p>
            </div>
            {grupo.cuentas.map(cuenta => (
              <div
                key={cuenta.id}
                className="tarjeta"
                style={{ cursor: "pointer", border: "1px solid var(--acento-suave)" }}
                onClick={() => setMostrarPerriahorro(true)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontWeight: 500 }}>{cuenta.nombre}</p>
                    <p style={{ fontSize: 12, color: "var(--texto-suave)", marginTop: 2 }}>
                      No incluido en patrimonio · Toca para ver detalle
                    </p>
                  </div>
                  <p className="numero-grande" style={{ fontSize: 20, color: "var(--acento-hover)" }}>
                    {formatCOP(cuenta.saldo)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div key={grupo.tipo}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--texto-suave)" }}>{grupo.label}</p>
              <p style={{ fontSize: 13, color: grupo.tipo === "credito" || grupo.tipo === "deuda" ? "var(--negativo)" : "var(--texto-suave)" }}>
                {grupo.tipo === "credito" || grupo.tipo === "deuda" ? "−" : ""}{formatCOP(totalGrupo(grupo))}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {grupo.cuentas.map(cuenta => (
                <div key={cuenta.id} className="tarjeta" style={{ padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontWeight: 500, fontSize: 15 }}>{cuenta.nombre}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {editandoId === cuenta.id ? (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <input
                            type="number"
                            value={valorEdit}
                            onChange={e => setValorEdit(e.target.value)}
                            style={{ width: 130, textAlign: "right" }}
                            autoFocus
                            onKeyDown={e => e.key === "Enter" && guardarEdicion(cuenta)}
                          />
                          <button className="btn-primario" style={{ padding: "6px 12px" }} onClick={() => guardarEdicion(cuenta)}>✓</button>
                          <button className="btn-ghost" style={{ padding: "6px 10px" }} onClick={() => setEditandoId(null)}>✕</button>
                        </div>
                      ) : (
                        <>
                          <div style={{ textAlign: "right" }}>
                            <p className="numero-grande" style={{
                              fontSize: 18,
                              color: cuenta.tipo === "credito" || cuenta.tipo === "deuda" ? "var(--negativo)" : "var(--texto)"
                            }}>
                              {cuenta.tipo === "credito" || cuenta.tipo === "deuda" ? "−" : ""}
                              {cuenta.moneda === "USD" ? formatUSD(cuenta.saldo) : formatCOP(cuenta.saldo)}
                            </p>
                            {cuenta.moneda === "USD" && (
                              <p style={{ fontSize: 11, color: "var(--texto-muy-suave)" }}>
                                ≈ {formatCOP(cuenta.saldo * tasaCambio)}
                              </p>
                            )}
                          </div>
                          <button
                            className="btn-ghost"
                            style={{ padding: "4px 8px", fontSize: 13 }}
                            onClick={() => iniciarEdicion(cuenta)}
                            title="Editar saldo"
                          >
                            ✎
                          </button>
                          {cuenta.tipo === "cuentas_cobrar" && (
                            <button
                              className="btn-ghost"
                              style={{ padding: "4px 8px", fontSize: 13, color: "var(--negativo)" }}
                              onClick={() => eliminarCuenta(cuenta.id)}
                              title="Eliminar"
                            >
                              ✕
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {grupo.tipo === "cuentas_cobrar" && (
                <button
                  className="btn-secundario"
                  style={{ alignSelf: "flex-start", fontSize: 13 }}
                  onClick={() => setMostrarNuevaCuenta(true)}
                >
                  + Nueva cuenta por cobrar
                </button>
              )}
            </div>
          </div>
        )
      ))}

      {/* Botón agregar cuenta por cobrar si no hay ninguna */}
      {!cuentas.some(c => c.tipo === "cuentas_cobrar") && (
        <button
          className="btn-secundario"
          style={{ alignSelf: "flex-start", fontSize: 13 }}
          onClick={() => setMostrarNuevaCuenta(true)}
        >
          + Nueva cuenta por cobrar
        </button>
      )}

      {/* Modal Perriahorro */}
      {mostrarPerriahorro && (
        <Perriahorro onCerrar={() => setMostrarPerriahorro(false)} />
      )}

      {/* Modal nueva cuenta por cobrar */}
      {mostrarNuevaCuenta && (
        <div className="modal-overlay" onClick={() => setMostrarNuevaCuenta(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Nueva cuenta por cobrar</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className="etiqueta">Descripción</label>
                <input
                  placeholder="Ej: Pedro - préstamo mayo"
                  value={nuevaCuenta.nombre}
                  onChange={e => setNuevaCuenta(p => ({ ...p, nombre: e.target.value }))}
                />
              </div>
              <div>
                <label className="etiqueta">Monto</label>
                <input
                  type="number"
                  placeholder="0"
                  value={nuevaCuenta.saldo || ""}
                  onChange={e => setNuevaCuenta(p => ({ ...p, saldo: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button className="btn-primario" style={{ flex: 1 }} onClick={async () => {
                  if (!nuevaCuenta.nombre) return;
                  await agregarCuenta({
                    ...nuevaCuenta,
                    tipo: "cuentas_cobrar",
                    moneda: "COP",
                    incluirPatrimonio: true
                  });
                  setNuevaCuenta({ nombre: "", tipo: "cuentas_cobrar", moneda: "COP", saldo: 0 });
                  setMostrarNuevaCuenta(false);
                }}>
                  Guardar
                </button>
                <button className="btn-secundario" onClick={() => setMostrarNuevaCuenta(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
