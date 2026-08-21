import { useState, useEffect } from "react";
import {
  collection, doc, getDocs, addDoc, updateDoc,
  deleteDoc, onSnapshot, setDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { CUENTAS_INICIALES } from "../data/constants";

export function useCuentas() {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "cuentas"), (snap) => {
      if (snap.empty) {
        // Primera vez: inicializar con cuentas predefinidas
        CUENTAS_INICIALES.forEach(c => setDoc(doc(db, "cuentas", c.id), c));
      } else {
        setCuentas(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const actualizarSaldo = async (cuentaId, nuevoSaldo) => {
    await updateDoc(doc(db, "cuentas", cuentaId), { saldo: nuevoSaldo });
  };

  const agregarCuenta = async (cuenta) => {
    await addDoc(collection(db, "cuentas"), cuenta);
  };

  const eliminarCuenta = async (id) => {
    await deleteDoc(doc(db, "cuentas", id));
  };

  return { cuentas, loading, actualizarSaldo, agregarCuenta, eliminarCuenta };
}

export function useMovimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "movimientos"), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setMovimientos(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const agregarMovimiento = async (movimiento) => {
    await addDoc(collection(db, "movimientos"), {
      ...movimiento,
      fecha: movimiento.fecha || new Date().toISOString()
    });
  };

  const eliminarMovimiento = async (id) => {
    await deleteDoc(doc(db, "movimientos", id));
  };

  return { movimientos, loading, agregarMovimiento, eliminarMovimiento };
}

export function usePresupuestos() {
  const [presupuestos, setPresupuestos] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "presupuestos"), (snap) => {
      const data = {};
      snap.docs.forEach(d => { data[d.id] = d.data(); });
      setPresupuestos(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const guardarPresupuesto = async (categoriaId, monto, mes = "default") => {
    const key = `${mes}_${categoriaId}`;
    await setDoc(doc(db, "presupuestos", key), { categoriaId, monto, mes });
  };

  return { presupuestos, loading, guardarPresupuesto };
}

export function useAportesPeriahorro() {
  const [aportes, setAportes] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "perriahorro"), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setAportes(data);
    });
    return () => unsub();
  }, []);

  const agregarAporte = async (aporte) => {
    await addDoc(collection(db, "perriahorro"), {
      ...aporte,
      fecha: new Date().toISOString()
    });
    await recalcularSaldoPerriahorro();
  };

  const editarAporte = async (id, cambios) => {
    await updateDoc(doc(db, "perriahorro", id), cambios);
    await recalcularSaldoPerriahorro();
  };

  const eliminarAporte = async (id) => {
    await deleteDoc(doc(db, "perriahorro", id));
    await recalcularSaldoPerriahorro();
  };

  const recalcularSaldoPerriahorro = async () => {
    const cuentaRef = doc(db, "cuentas", "perriahorro");
    const snap = await getDocs(collection(db, "perriahorro"));
    const total = snap.docs.reduce((sum, d) => sum + (d.data().monto || 0), 0);
    await updateDoc(cuentaRef, { saldo: total });
  };

  return { aportes, agregarAporte, editarAporte, eliminarAporte };
}
