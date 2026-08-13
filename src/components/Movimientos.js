import React, { useState } from "react";
import { useMovimientos, useCuentas } from "../hooks/useFirestore";
import { CATEGORIAS, TIPO_MOVIMIENTO } from "../data/constants";
import { formatCOP, formatFecha, mesActual, filtrarPorPeriodo } from "../utils/helpers";

const TIPOS_MOV = [
  { id: TIPO_MOVIMIENTO.INGRESO, label: "Ingreso" },
  { id: TIPO_MOVIMIENTO.EGRESO, label: "Egreso" },
  { id: TIPO_MOVIMIENTO.TRASLADO, label: "Traslado entre cuentas" },
  { id: TIPO_MOVIMIENTO.PAGO_DEUDA, label: "Pago de deuda" },
  { id: TIPO_MOVIMIENTO.PRESTAMO, label: "Préstamo a alguien" },
  { id: TIPO_MOVIMIENTO.COBRO, label: "Cobro de préstamo" }
];

export default function Movimientos({ cuentas }) {
  const { movimientos, agregarMovimiento, eliminarMovimiento } = useMovimientos();
  const { actualizarSaldo } = useCuentas();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [filtro, setFiltro] = useState({ tipo: "mes", valor: mesActual() });
  const [busqueda, setBusqueda] = useState("");

  const [form, setForm] = useState({
    tipo: TIPO_MOVIMIENTO.EGRESO,
    monto: "",
    descripcion: "",
    cuentaOrigen: "",
    cuentaDestino: "",
    categoriaGrupo: "",
    categoriaId: "",
    fecha: new Date().toISOString().slice(0, 10)
  });

  const cuentasActivas = cuentas.filter(c => c.tipo !== "compartida");

  const movimientosFiltrados = filtrarPorPeriodo(movimientos, filtro)
    .filter(m => !busqueda || m.descripcion?.toLowerCase().includes(busqueda.toLowerCase()));

  const subcategorias = form.categoriaGrupo
    ? CATEGORIAS.egresos.find(g => g.id === form.categoriaGrupo)?.subcategorias || []
    : [];

  const handleGuardar = async () => {
    if (!form.monto || !form.cuentaOrigen) return;
    const monto = parseFloat(form.monto);

    // Guardar movimiento
    await agregarMovimiento({ ...form, monto });

    // Actualizar saldos según tipo
    const origen = cuentas.find(c => c.id === form.cuentaOrigen);
    if (origen) {
      if (form.tipo === TIPO_MOVIMIENTO.INGRESO) {
        await actualizarSaldo(origen.id, origen.saldo + monto);
      } else if (form.tipo === TIPO_MOVIMIENTO.EGRESO || form.tipo === TIPO_MOVIMIENTO.PRESTAMO) {
        await actualizarSaldo(origen.id, origen.saldo - monto);
      } else if (form.tipo === TIPO_MOVIMIENTO.TRASLADO || form.tipo === TIPO_MOVIMIENTO.PAGO_DEUDA) {
        await actualizarSaldo(origen.id, origen.saldo - monto);
        const destino = cuentas.find(c => c.id === form.cuentaDestino);
        if (destino) {
          if (form.tipo === TIPO_MOVIMIENTO.PAGO_DEUDA) {
            await actualizarSaldo(destino.id, Math.max(0, destino.saldo - monto));
          } else {
            await actualizarSaldo(destino.id, destino.saldo + monto);
          }
        }
      } else if (form.tipo === TIPO_MOVIMIENTO.COBRO) {
        await actualizarSaldo(origen.id, origen.saldo + monto);
        const cuentaCobrar = cuentas.find(c => c.id === form.cuentaDestino);
        if (cuentaCobrar) await actualizarSaldo(cuentaCobrar.id, Math.max(0, cuentaCobrar.saldo - monto));
      }
    }

    setForm({
      tipo: TIPO_MOVIMIENTO.EGRESO, monto: "", descripcion: "",
      cuentaOrigen: "", cuentaDestino: "", categoriaGrupo: "", categoriaId: "",
      fecha: new Date().toISOString().slice(0, 10)
    });
    setMostrarForm(false);
  };

  const necesitaDestino = [TIPO_MOVIMIENTO.TRASLADO, TIPO_MOVIMIENTO.PAGO_DEUDA, TIPO_MOVIMIENTO.COBRO].includes(form.tipo);
  const esIngreso = form.tipo === TIPO_MOVIMIENTO.INGRESO;
  const esEgreso = form.tipo === TIPO_MOVIMIENTO.EGRESO;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Barra superior */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          placeholder="Buscar..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ flex: 1, minWidth: 160 }}
        />
        <select
          value={`${filtro.tipo}:${filtro.tipo === "personalizado" ? "" : filtro.valor}`}
          onChange={e => {
            const [tipo, valor] = e.target.value.split(":");
            setFiltro({ tipo, valor: valor || mesActual() });
          }}
          style={{ width: "auto" }}
        >
          <option value={`mes:${mesActual()}`}>Este mes</option>
          <option value={`anio:${new Date().getFullYear()}`}>Este año</option>
          <option value="personalizado:">Personalizado</option>
        </select>
        <button className="btn-primario" onClick={() => setMostrarForm(true)}>
          + Registrar
        </button>
      </div>

      {filtro.tipo === "personalizado" && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="date" style={{ flex: 1 }}
            onChange={e => setFiltro(f => ({ ...f, valor: { ...f.valor, desde: e.target.value } }))}
          />
          <span style={{ color: "var(--texto-suave)", fontSize: 13 }}>hasta</span>
          <input type="date" style={{ flex: 1 }}
            onChange={e => setFiltro(f => ({ ...f, valor: { ...f.valor, hasta: e.target.value } }))}
          />
        </div>
      )}

      {/* Lista de movimientos */}
      <div className="tarjeta" style={{ padding: 0, overflow: "hidden" }}>
        {movimientosFiltrados.length === 0 ? (
          <p style={{ padding: "2rem", textAlign: "center", color: "var(--texto-suave)" }}>
            Sin movimientos en este período
          </p>
        ) : (
          movimientosFiltrados.map((mov, i) => {
            const esPos = mov.tipo === TIPO_MOVIMIENTO.INGRESO || mov.tipo === TIPO_MOVIMIENTO.COBRO;
            const esNeu = mov.tipo === TIPO_MOVIMIENTO.TRASLADO || mov.tipo === TIPO_MOVIMIENTO.PAGO_DEUDA || mov.tipo === TIPO_MOVIMIENTO.PRESTAMO;
            return (
              <div key={mov.id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.875rem 1.25rem",
                borderBottom: i < movimientosFiltrados.length - 1 ? "1px solid var(--borde)" : "none"
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, fontSize: 14 }}>
                    {mov.descripcion || TIPOS_MOV.find(t => t.id === mov.tipo)?.label}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--texto-suave)", marginTop: 1 }}>
                    {formatFecha(mov.fecha)} · {cuentas.find(c => c.id === mov.cuentaOrigen)?.nombre || mov.cuentaOrigen}
                    {mov.categoriaId && ` · ${mov.categoriaId}`}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p className="numero-grande" style={{
                    fontSize: 16,
                    color: esPos ? "var(--positivo)" : esNeu ? "var(--texto-suave)" : "var(--negativo)"
                  }}>
                    {esPos ? "+" : esNeu ? "" : "−"}{formatCOP(mov.monto)}
                  </p>
                  <button
                    className="btn-ghost"
                    style={{ padding: "3px 6px", fontSize: 12 }}
                    onClick={() => eliminarMovimiento(mov.id)}
                    title="Eliminar"
                  >✕</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal formulario */}
      {mostrarForm && (
        <div className="modal-overlay" onClick={() => setMostrarForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Registrar movimiento</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              <div>
                <label className="etiqueta">Tipo</label>
                <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value, categoriaGrupo: "", categoriaId: "" }))}>
                  {TIPOS_MOV.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className="etiqueta">Monto</label>
                  <input type="number" placeholder="0" value={form.monto}
                    onChange={e => setForm(p => ({ ...p, monto: e.target.value }))} />
                </div>
                <div>
                  <label className="etiqueta">Fecha</label>
                  <input type="date" value={form.fecha}
                    onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="etiqueta">{necesitaDestino ? "Cuenta origen" : "Cuenta"}</label>
                <select value={form.cuentaOrigen} onChange={e => setForm(p => ({ ...p, cuentaOrigen: e.target.value }))}>
                  <option value="">Selecciona...</option>
                  {cuentasActivas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              {necesitaDestino && (
                <div>
                  <label className="etiqueta">
                    {form.tipo === TIPO_MOVIMIENTO.PAGO_DEUDA ? "Deuda a pagar" :
                      form.tipo === TIPO_MOVIMIENTO.COBRO ? "Cuenta por cobrar" :
                        "Cuenta destino"}
                  </label>
                  <select value={form.cuentaDestino} onChange={e => setForm(p => ({ ...p, cuentaDestino: e.target.value }))}>
                    <option value="">Selecciona...</option>
                    {cuentasActivas
                      .filter(c => form.tipo === TIPO_MOVIMIENTO.PAGO_DEUDA
                        ? (c.tipo === "credito" || c.tipo === "deuda")
                        : form.tipo === TIPO_MOVIMIENTO.COBRO
                          ? c.tipo === "cuentas_cobrar"
                          : true)
                      .map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
              )}

              {esEgreso && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label className="etiqueta">Categoría</label>
                    <select value={form.categoriaGrupo}
                      onChange={e => setForm(p => ({ ...p, categoriaGrupo: e.target.value, categoriaId: "" }))}>
                      <option value="">Selecciona...</option>
                      {CATEGORIAS.egresos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                    </select>
                  </div>
                  {subcategorias.length > 0 && (
                    <div>
                      <label className="etiqueta">Subcategoría</label>
                      <select value={form.categoriaId}
                        onChange={e => setForm(p => ({ ...p, categoriaId: e.target.value }))}>
                        <option value="">Selecciona...</option>
                        {subcategorias.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {esIngreso && (
                <div>
                  <label className="etiqueta">Categoría</label>
                  <select value={form.categoriaId}
                    onChange={e => setForm(p => ({ ...p, categoriaId: e.target.value }))}>
                    <option value="">Selecciona...</option>
                    {CATEGORIAS.ingresos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="etiqueta">Descripción (opcional)</label>
                <input placeholder="Ej: Mercado Éxito" value={form.descripcion}
                  onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button className="btn-primario" style={{ flex: 1 }} onClick={handleGuardar}>
                  Guardar
                </button>
                <button className="btn-secundario" onClick={() => setMostrarForm(false)}>
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
