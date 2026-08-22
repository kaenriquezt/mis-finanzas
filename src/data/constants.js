export const CUENTAS_INICIALES = [
  { id: "bancolombia", nombre: "Bancolombia", tipo: "ahorro", moneda: "COP", saldo: 0, incluirPatrimonio: true },
  { id: "efectivo", nombre: "Efectivo", tipo: "ahorro", moneda: "COP", saldo: 0, incluirPatrimonio: true },
  { id: "billetera", nombre: "Billetera", tipo: "ahorro", moneda: "COP", saldo: 0, incluirPatrimonio: true },
  { id: "bink", nombre: "Bink", tipo: "ahorro", moneda: "COP", saldo: 0, incluirPatrimonio: true },
  { id: "dollarapp", nombre: "DollarApp", tipo: "ahorro", moneda: "USD", saldo: 0, incluirPatrimonio: true },
  { id: "lifemiles", nombre: "Lifemiles", tipo: "credito", moneda: "COP", saldo: 0, incluirPatrimonio: true },
  { id: "black", nombre: "Black", tipo: "credito", moneda: "COP", saldo: 0, incluirPatrimonio: true },
  { id: "nu_cdt", nombre: "CDT Nu", tipo: "cdt", moneda: "COP", saldo: 0, incluirPatrimonio: true },
  { id: "maestria", nombre: "Crédito Maestría", tipo: "deuda", moneda: "COP", saldo: 0, incluirPatrimonio: true },
  { id: "perriahorro", nombre: "Perriahorro 💛", tipo: "compartida", moneda: "COP", saldo: 0, incluirPatrimonio: false,
    miembros: [
      { id: "yo", nombre: "Yo" },
      { id: "so", nombre: "So" },
      { id: "ale", nombre: "Ale" },
      { id: "yk", nombre: "Yk" }
    ]
  }
];

export const CATEGORIAS = {
  ingresos: [
    { id: "salario", nombre: "Salario" },
    { id: "arriendo_ingreso", nombre: "Arriendo" },
    { id: "bonos", nombre: "Bonos" },
    { id: "otro_ingreso", nombre: "Otro" }
  ],
  egresos: [
    {
      id: "hogar",
      nombre: "Hogar",
      subcategorias: [
        { id: "servicios", nombre: "Servicios" },
        { id: "mascotas", nombre: "Mascotas" },
        { id: "familia", nombre: "Familia" },
        { id: "mercado", nombre: "Mercado" },
        { id: "alimentacion_fuera", nombre: "Alimentación por fuera" },
        { id: "mantenimiento_hogar", nombre: "Mantenimiento" },
        { id: "decoracion", nombre: "Decoración" },
        { id: "tramites_hogar", nombre: "Trámites e impuestos" }
      ]
    },
    {
      id: "transporte",
      nombre: "Transporte",
      subcategorias: [
        { id: "gasolina", nombre: "Gasolina" },
        { id: "uber", nombre: "Uber" },
        { id: "parqueadero", nombre: "Parqueadero" },
        { id: "mantenimiento_carro", nombre: "Mantenimiento" }
      ]
    },
    {
      id: "diversion",
      nombre: "Diversión",
      subcategorias: [
        { id: "rumba", nombre: "Rumba" },
        { id: "restaurantes", nombre: "Restaurantes" },
        { id: "parches", nombre: "Parches" },
        { id: "regalos", nombre: "Regalos" },
        { id: "viajes", nombre: "Viajes" }
      ]
    },
    {
      id: "amor_propio",
      nombre: "Amor propio",
      subcategorias: [
        { id: "salud", nombre: "Salud" },
        { id: "gimnasio", nombre: "Gimnasio" },
        { id: "suplementos", nombre: "Suplementos" },
        { id: "belleza", nombre: "Belleza" },
        { id: "ropa", nombre: "Ropa" }
      ]
    },
    {
      id: "obligaciones",
      nombre: "Obligaciones",
      subcategorias: [
        { id: "impuestos", nombre: "Impuestos" },
        { id: "tramites", nombre: "Trámites" },
        { id: "seguros", nombre: "Seguros" }
      ]
    }
  ]
};

// Cuentas en las que se pueden registrar compras en dólares.
// El saldo se sigue guardando en COP; se guarda además el USD original y la tasa.
// Para habilitar otra cuenta, agrega su id a esta lista.
export const CUENTAS_CON_USD = ["black"];

export const TIPO_MOVIMIENTO = {  INGRESO: "ingreso",
  EGRESO: "egreso",
  TRASLADO: "traslado",
  PAGO_DEUDA: "pago_deuda",
  PRESTAMO: "prestamo",
  COBRO: "cobro"
};

export const COLORES = {
  fondo: "#F7F4EF",
  superficie: "#FFFFFF",
  acento: "#7A9E7E",
  acentoSuave: "#E8F0E9",
  texto: "#2C2C2A",
  textoSuave: "#6B6B68",
  positivo: "#3B6D11",
  negativoFondo: "#FCEBEB",
  negativo: "#A32D2D",
  advertenciaFondo: "#FAEEDA",
  advertencia: "#854F0B",
  borde: "rgba(44,44,42,0.12)"
};
