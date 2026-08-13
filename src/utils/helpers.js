// Formateo de moneda COP
export const formatCOP = (valor) => {
  if (valor === undefined || valor === null) return "$0";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(valor));
};

// Formateo de moneda USD
export const formatUSD = (valor) => {
  if (valor === undefined || valor === null) return "US$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
};

// Obtener tasa de cambio USD/COP en tiempo real
export const obtenerTasaCambio = async () => {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    const data = await res.json();
    return data.rates.COP || 4200;
  } catch {
    // Fallback si falla la API
    return 4200;
  }
};

// Formateo de fechas
export const formatFecha = (fechaISO, formato = "corto") => {
  if (!fechaISO) return "";
  const fecha = new Date(fechaISO);
  if (formato === "corto") {
    return fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
  }
  if (formato === "largo") {
    return fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
  }
  if (formato === "mes-año") {
    return fecha.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  }
  return fecha.toLocaleDateString("es-CO");
};

// Obtener mes actual como string YYYY-MM
export const mesActual = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
};

// Filtrar movimientos por período
export const filtrarPorPeriodo = (movimientos, filtro) => {
  const { tipo, valor } = filtro;
  return movimientos.filter(m => {
    const fecha = new Date(m.fecha);
    if (tipo === "mes") {
      const [anio, mes] = valor.split("-");
      return fecha.getFullYear() === parseInt(anio) && fecha.getMonth() + 1 === parseInt(mes);
    }
    if (tipo === "anio") {
      return fecha.getFullYear() === parseInt(valor);
    }
    if (tipo === "personalizado") {
      const { desde, hasta } = valor;
      return fecha >= new Date(desde) && fecha <= new Date(hasta + "T23:59:59");
    }
    return true;
  });
};

// Calcular patrimonio neto
export const calcularPatrimonio = (cuentas) => {
  return cuentas
    .filter(c => c.incluirPatrimonio)
    .reduce((total, cuenta) => {
      if (cuenta.tipo === "credito" || cuenta.tipo === "deuda") {
        return total - Math.abs(cuenta.saldo);
      }
      return total + cuenta.saldo;
    }, 0);
};

// Generar imagen del Perriahorro para compartir
export const generarImagenPerriahorro = (aportesPorMiembro, saldoTotal, mes) => {
  const canvas = document.createElement("canvas");
  canvas.width = 540;
  canvas.height = 360;
  const ctx = canvas.getContext("2d");

  // Fondo crema
  ctx.fillStyle = "#F7F4EF";
  ctx.fillRect(0, 0, 540, 360);

  // Borde suave
  ctx.strokeStyle = "#D4C5A9";
  ctx.lineWidth = 2;
  ctx.roundRect(10, 10, 520, 340, 16);
  ctx.stroke();

  // Emoji corazón
  ctx.font = "48px serif";
  ctx.textAlign = "center";
  ctx.fillText("💛", 270, 70);

  // Título
  ctx.font = "bold 26px Georgia, serif";
  ctx.fillStyle = "#2C2C2A";
  ctx.fillText("Perriahorro", 270, 110);

  // Mes
  ctx.font = "15px sans-serif";
  ctx.fillStyle = "#6B6B68";
  ctx.fillText(mes, 270, 135);

  // Línea divisora
  ctx.strokeStyle = "#D4C5A9";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 155);
  ctx.lineTo(480, 155);
  ctx.stroke();

  // Aportes de cada miembro
  const miembros = Object.entries(aportesPorMiembro);
  miembros.forEach(([nombre, monto], i) => {
    const y = 195 + i * 36;
    ctx.font = "15px sans-serif";
    ctx.fillStyle = "#2C2C2A";
    ctx.textAlign = "left";
    ctx.fillText(nombre, 80, y);
    ctx.textAlign = "right";
    ctx.fillStyle = "#3B6D11";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText(formatCOP(monto), 460, y);
  });

  // Línea total
  ctx.strokeStyle = "#D4C5A9";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 200 + miembros.length * 36);
  ctx.lineTo(480, 200 + miembros.length * 36);
  ctx.stroke();

  // Total
  const yTotal = 220 + miembros.length * 36;
  ctx.font = "bold 18px Georgia, serif";
  ctx.fillStyle = "#2C2C2A";
  ctx.textAlign = "left";
  ctx.fillText("Total", 80, yTotal);
  ctx.textAlign = "right";
  ctx.fillStyle = "#7A9E7E";
  ctx.font = "bold 20px Georgia, serif";
  ctx.fillText(formatCOP(saldoTotal), 460, yTotal);

  return canvas.toDataURL("image/png");
};
