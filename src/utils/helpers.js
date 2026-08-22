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
  const miembros = Object.entries(aportesPorMiembro);

  // Alto dinámico según cantidad de miembros, para que nada quede cortado
  const ALTO_CABECERA = 195;
  const ALTO_FILA = 36;
  const ALTO_PIE = 90;
  const W = 540;
  const H = ALTO_CABECERA + miembros.length * ALTO_FILA + ALTO_PIE;

  // Escala x2 para que se vea nítida en pantallas de celular
  const ESCALA = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * ESCALA;
  canvas.height = H * ESCALA;
  const ctx = canvas.getContext("2d");
  ctx.scale(ESCALA, ESCALA);

  // Rectángulo redondeado propio (roundRect no existe en todos los navegadores)
  const rectRedondo = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // Fondo crema
  ctx.fillStyle = "#F7F4EF";
  ctx.fillRect(0, 0, W, H);

  // Borde suave
  ctx.strokeStyle = "#D4C5A9";
  ctx.lineWidth = 2;
  rectRedondo(10, 10, W - 20, H - 20, 16);
  ctx.stroke();

  // Corazón
  ctx.font = "48px serif";
  ctx.textAlign = "center";
  ctx.fillText("💛", W / 2, 70);

  // Título
  ctx.font = "bold 26px Georgia, serif";
  ctx.fillStyle = "#2C2C2A";
  ctx.fillText("Perriahorro", W / 2, 110);

  // Mes
  ctx.font = "15px sans-serif";
  ctx.fillStyle = "#6B6B68";
  ctx.fillText(mes, W / 2, 135);

  // Línea divisora
  ctx.strokeStyle = "#D4C5A9";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 155);
  ctx.lineTo(W - 60, 155);
  ctx.stroke();

  // Aportes de cada miembro
  miembros.forEach(([nombre, monto], i) => {
    const y = ALTO_CABECERA + i * ALTO_FILA;
    ctx.font = "15px sans-serif";
    ctx.fillStyle = "#2C2C2A";
    ctx.textAlign = "left";
    ctx.fillText(nombre, 80, y);
    ctx.textAlign = "right";
    ctx.fillStyle = "#3B6D11";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText(formatCOP(monto), W - 80, y);
  });

  // Línea del total
  const yLinea = ALTO_CABECERA + miembros.length * ALTO_FILA + 5;
  ctx.strokeStyle = "#D4C5A9";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, yLinea);
  ctx.lineTo(W - 60, yLinea);
  ctx.stroke();

  // Total
  const yTotal = yLinea + 32;
  ctx.font = "bold 18px Georgia, serif";
  ctx.fillStyle = "#2C2C2A";
  ctx.textAlign = "left";
  ctx.fillText("Total", 80, yTotal);
  ctx.textAlign = "right";
  ctx.fillStyle = "#7A9E7E";
  ctx.font = "bold 20px Georgia, serif";
  ctx.fillText(formatCOP(saldoTotal), W - 80, yTotal);

  return canvas;
};

// Convierte el canvas en archivo PNG
export const canvasABlob = (canvas) =>
  new Promise((resolve) => {
    if (canvas.toBlob) {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    } else {
      // Respaldo para navegadores viejos
      const dataUrl = canvas.toDataURL("image/png");
      const bin = atob(dataUrl.split(",")[1]);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      resolve(new Blob([bytes], { type: "image/png" }));
    }
  });
