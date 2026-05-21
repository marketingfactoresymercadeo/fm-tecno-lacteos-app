import { useState, useRef, useCallback, useEffect } from "react";

// ============================================================
// CONFIGURACIÓN — Google Sheets endpoint
// ============================================================
// Pegar aquí la URL del Apps Script Web App (ver docs/SETUP_GOOGLE_SHEETS.md)
// Mientras no se configure, la app guarda los leads en localStorage como respaldo.
const GOOGLE_SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycbx-pp8iE1jrEbwtppVJpDceO0PVo5BRDsrOD81AT7NxXY8eccm6kRPv9iWgVJzMgG9TJA/exec";

// ============================================================
// BASE DE DATOS DE PRODUCTOS DEMO (HABLADORES)
// ============================================================
const PRODUCTOS_DEMO = {
  YOGURT_VAINILLA: {
    nombre: "Yogurt Vainilla",
    titulo: "Yogurt",
    subtitulo: "Vainilla",
    icon: "🥛",
    descripcion: "Yogurt fermentado con cultivos vivos, textura cremosa y sabor vainilla auténtico. Perfecto para reducción de azúcar y funcionalidad probiótica.",
    colorPrimario: "#1a286e",
    colorAcento: "#d4a04c",
    grupos: [
      {
        titulo: "Base Láctea",
        descripcion: "Fundamento proteico del producto",
        icon: "🥛",
        materiasPrimas: ["LECHE EN POLVO"],
      },
      {
        titulo: "Fermentación Funcional",
        descripcion: "Cultivos vivos y probióticos para salud digestiva",
        icon: "🦠",
        materiasPrimas: ["CULTIVOS BAL", "PROBIOTICOS L. CASEI"],
      },
      {
        titulo: "Endulzantes",
        descripcion: "Sacarosa + alternativas naturales sin calorías",
        icon: "🍯",
        materiasPrimas: ["SACAROSA", "ERITRITOL", "MONK FRUIT"],
      },
      {
        titulo: "Textura y Estabilidad",
        descripcion: "Cremosidad, cuerpo y control de sinéresis",
        icon: "🌾",
        materiasPrimas: ["ALMIDON NATIVO DE YUCA"],
      },
      {
        titulo: "Sabor",
        descripcion: "Vainilla natural de alta estabilidad",
        icon: "🌼",
        materiasPrimas: ["VAINILLINA"],
      },
    ],
  },
  MALTEADA_CHOCOLATE: {
    nombre: "Malteada Chocolate",
    titulo: "Malteada",
    subtitulo: "Chocolate",
    icon: "🥤",
    descripcion: "Shake premium con proteína concentrada de suero, ingredientes funcionales tipo beauty-from-within y perfil sensorial de chocolate intenso.",
    colorPrimario: "#5d3a1f",
    colorAcento: "#ff712d",
    grupos: [
      {
        titulo: "Proteína y Funcionalidad",
        descripcion: "Concentrado WPC + bioactivos premium",
        icon: "💪",
        materiasPrimas: ["PROTEINA WPC 80", "COLAGENO HIDROLIZADO", "ACIDO HIALURONICO"],
      },
      {
        titulo: "Vitaminas y Minerales",
        descripcion: "Fortificación con biodisponibilidad alta",
        icon: "💊",
        materiasPrimas: ["VITAMINA D3 CWS", "CITRATO DE MAGNESIO", "VITAMINA C", "COMPLEJO VITAMINICO B", "LACTATO FERROSO"],
      },
      {
        titulo: "Cultivos Tecnológicos",
        descripcion: "Probióticos resistentes a procesos en polvo",
        icon: "🧬",
        materiasPrimas: ["AB-KEFIR 200B"],
      },
      {
        titulo: "Estabilidad y Tecnología",
        descripcion: "Estabilizantes y antiaglomerantes para polvos",
        icon: "🧊",
        materiasPrimas: ["GOMA XANTHAN", "DIOXIDO DE SILICIO"],
      },
      {
        titulo: "Endulzante y Cremosidad",
        descripcion: "Reducción de azúcar y mouthfeel sin lactosa",
        icon: "🌙",
        materiasPrimas: ["NEOSWEET S", "CREMA NO LACTEA"],
      },
      {
        titulo: "Sabor Chocolate",
        descripcion: "Cocoas y saborizantes para perfil intenso",
        icon: "🍫",
        materiasPrimas: ["COCOA ALCALINA", "COCOA NATURAL", "SABOR CHOCOLATE", "EXTRACTO DE MALTA"],
      },
    ],
  },
  MERMELADA_FRESA: {
    nombre: "Mermelada Fresa",
    titulo: "Mermelada",
    subtitulo: "Fresa",
    icon: "🍓",
    descripcion: "Mermelada de fresa con perfil reducido en azúcar, textura clásica de cuchara y color vibrante. Apta para diabéticos y públicos premium.",
    colorPrimario: "#c2185b",
    colorAcento: "#e91e63",
    grupos: [
      {
        titulo: "Gelificación",
        descripcion: "Red estructural que da consistencia",
        icon: "🍓",
        materiasPrimas: ["PECTINA"],
      },
      {
        titulo: "Regulación de pH",
        descripcion: "Activa la pectina y conserva color",
        icon: "🍋",
        materiasPrimas: ["ACIDO CITRICO"],
      },
      {
        titulo: "Endulzante de Carga",
        descripcion: "Sustituto 1:1 del azúcar, apto para diabéticos",
        icon: "❄️",
        materiasPrimas: ["XILITOL"],
      },
      {
        titulo: "Sabor y Color",
        descripcion: "Identidad sensorial de fresa",
        icon: "🌹",
        materiasPrimas: ["SABOR FRESA", "ROJO ALLURA"],
      },
    ],
  },
};

const PRODUCTOS_ALIASES = {
  // Yogurt Vainilla
  "YOGURT": "YOGURT_VAINILLA",
  "YOGUR": "YOGURT_VAINILLA",
  "YOGURT VAINILLA": "YOGURT_VAINILLA",
  "YOGUR VAINILLA": "YOGURT_VAINILLA",
  "YOGURT VANILLA": "YOGURT_VAINILLA",
  "VANILLA YOGURT": "YOGURT_VAINILLA",
  // Malteada Chocolate
  "MALTEADA": "MALTEADA_CHOCOLATE",
  "MALTEADA CHOCOLATE": "MALTEADA_CHOCOLATE",
  "MILKSHAKE": "MALTEADA_CHOCOLATE",
  "MILKSHAKE CHOCOLATE": "MALTEADA_CHOCOLATE",
  "BATIDO CHOCOLATE": "MALTEADA_CHOCOLATE",
  "BATIDO": "MALTEADA_CHOCOLATE",
  "SHAKE": "MALTEADA_CHOCOLATE",
  "SHAKE CHOCOLATE": "MALTEADA_CHOCOLATE",
  "CHOCOLATE SHAKE": "MALTEADA_CHOCOLATE",
  // Mermelada Fresa
  "MERMELADA": "MERMELADA_FRESA",
  "MERMELADA FRESA": "MERMELADA_FRESA",
  "JAM": "MERMELADA_FRESA",
  "STRAWBERRY JAM": "MERMELADA_FRESA",
  "JALEA": "MERMELADA_FRESA",
  "JALEA FRESA": "MERMELADA_FRESA",
  "CONSERVA FRESA": "MERMELADA_FRESA",
};

// ============================================================
// BASE DE DATOS DE MATERIAS PRIMAS → PRODUCTOS
// ============================================================
const MATERIAS_PRIMAS_DB = {
  "ALMIDON NATIVO DE YUCA": {
    categoria: "Almidón / Texturizante",
    descripcion: "Almidón natural de yuca. Texturizante y ligante con excelente retención de agua.",
    icon: "🌾",
    beneficio: "Mejora elasticidad, controla sinéresis y reduce mermas en cocción",
    enYogur: true, enShake: false, enMermelada: false,
    productos: [
      { nombre: "Quesos análogos para fundir", tipo: "Lácteos", icon: "🧀" },
      { nombre: "Arequipe / Dulce de leche", tipo: "Lácteos", icon: "🍮" },
      { nombre: "Helados artesanales", tipo: "Lácteos", icon: "🍦" },
      { nombre: "Salchichas y frankfurt", tipo: "Cárnicos", icon: "🌭" },
      { nombre: "Jamón cocido premium", tipo: "Cárnicos", icon: "🥩" },
      { nombre: "Nuggets y empanizados", tipo: "Cárnicos", icon: "🍗" },
      { nombre: "Panes sin gluten", tipo: "Panadería", icon: "🍞" },
      { nombre: "Bizcochos y muffins", tipo: "Panadería", icon: "🧁" },
      { nombre: "Sopas y salsas instantáneas", tipo: "Salsas", icon: "🥣" },
      { nombre: "Gomitas y confites", tipo: "Confitería", icon: "🍬" },
      { nombre: "Excipiente para tabletas", tipo: "Farmacéutico", icon: "💊" },
    ],
  },
  "ERITRITOL": {
    categoria: "Poliol / Edulcorante Natural",
    descripcion: "Edulcorante natural fermentado, 0 calorías, perfil de dulzor limpio.",
    icon: "❄️",
    beneficio: "Punto de congelación similar al azúcar, sin retrogusto amargo",
    enYogur: true, enShake: false, enMermelada: false,
    productos: [
      { nombre: "Yogurt sin azúcar", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Helados light", tipo: "Lácteos", icon: "🍦" },
      { nombre: "Leche saborizada diet", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Jamones glaseados keto", tipo: "Cárnicos", icon: "🍖" },
      { nombre: "Salsas BBQ reducidas", tipo: "Cárnicos", icon: "🥩" },
      { nombre: "Galletas diabéticas", tipo: "Panadería", icon: "🍪" },
      { nombre: "Muffins sin azúcar", tipo: "Panadería", icon: "🧁" },
      { nombre: "Bebidas deportivas", tipo: "Bebidas", icon: "🥤" },
      { nombre: "Chocolates sin azúcar", tipo: "Confitería", icon: "🍫" },
      { nombre: "Gomas de mascar", tipo: "Confitería", icon: "🍬" },
      { nombre: "Proteínas en polvo", tipo: "Nutracéuticos", icon: "💪" },
      { nombre: "Pastas dentales", tipo: "Cuidado personal", icon: "🦷" },
    ],
  },
  "MONK FRUIT": {
    categoria: "Edulcorante Natural",
    descripcion: "Extracto de la fruta del monje (luo han guo), 200x más dulce que azúcar, sin calorías.",
    icon: "🍈",
    beneficio: "Dulzor intenso de origen natural, sin retrogusto herbal",
    enYogur: true, enShake: false, enMermelada: false,
    productos: [
      { nombre: "Yogurt natural premium", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Helados premium naturales", tipo: "Lácteos", icon: "🍦" },
      { nombre: "Smoothies y batidos", tipo: "Lácteos", icon: "🥤" },
      { nombre: "Marinadas reducidas en azúcar", tipo: "Cárnicos", icon: "🥩" },
      { nombre: "Postres keto", tipo: "Panadería", icon: "🍰" },
      { nombre: "Galletas sin azúcar", tipo: "Panadería", icon: "🍪" },
      { nombre: "Aguas saborizadas", tipo: "Bebidas", icon: "💧" },
      { nombre: "Kombuchas y tés", tipo: "Bebidas", icon: "🍵" },
      { nombre: "Chocolates artesanales", tipo: "Confitería", icon: "🍫" },
      { nombre: "Barras de proteína", tipo: "Nutracéuticos", icon: "🍫" },
      { nombre: "Suplementos naturales", tipo: "Nutracéuticos", icon: "💊" },
    ],
  },
  "LECHE EN POLVO": {
    categoria: "Proteína Láctea",
    descripcion: "Leche deshidratada con alto contenido proteico y gran versatilidad industrial.",
    icon: "🥛",
    beneficio: "Aumenta extracto seco, mejora cremosidad y actúa como ligante proteico",
    enYogur: true, enShake: false, enMermelada: false,
    productos: [
      { nombre: "Queso crema premium", tipo: "Lácteos", icon: "🧀" },
      { nombre: "Helados artesanales", tipo: "Lácteos", icon: "🍦" },
      { nombre: "Dulce de leche / Arequipe", tipo: "Lácteos", icon: "🍮" },
      { nombre: "Flan y natillas", tipo: "Lácteos", icon: "🍮" },
      { nombre: "Emulsiones cárnicas", tipo: "Cárnicos", icon: "🌭" },
      { nombre: "Jamones premium", tipo: "Cárnicos", icon: "🥩" },
      { nombre: "Panes enriquecidos", tipo: "Panadería", icon: "🍞" },
      { nombre: "Pasteles y bizcochos", tipo: "Panadería", icon: "🎂" },
      { nombre: "Chocolates con leche", tipo: "Confitería", icon: "🍫" },
      { nombre: "Bebidas achocolatadas", tipo: "Bebidas", icon: "🥤" },
      { nombre: "Cafés instantáneos", tipo: "Bebidas", icon: "☕" },
      { nombre: "Fórmulas infantiles", tipo: "Nutracéuticos", icon: "🍼" },
    ],
  },
  "CULTIVOS BAL": {
    categoria: "Cultivos Lácticos",
    descripcion: "Bacterias ácido lácticas iniciadoras que fermentan, texturizan y desarrollan sabor.",
    icon: "🦠",
    beneficio: "Fermentación controlada, biopreservación y desarrollo sensorial",
    enYogur: true, enShake: false, enMermelada: false,
    productos: [
      { nombre: "Yogurt tradicional", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Queso fresco y maduros", tipo: "Lácteos", icon: "🧀" },
      { nombre: "Kéfir", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Mantequilla fermentada", tipo: "Lácteos", icon: "🧈" },
      { nombre: "Chorizo español", tipo: "Cárnicos", icon: "🌭" },
      { nombre: "Salami y pepperoni", tipo: "Cárnicos", icon: "🍕" },
      { nombre: "Jamón curado tipo serrano", tipo: "Cárnicos", icon: "🥩" },
      { nombre: "Masa madre / Sourdough", tipo: "Panadería", icon: "🥖" },
      { nombre: "Kombuchas fermentadas", tipo: "Bebidas", icon: "🍵" },
      { nombre: "Yogures vegetales", tipo: "Vegetales", icon: "🌱" },
    ],
  },
  "PROBIOTICOS L. CASEI": {
    categoria: "Probiótico Funcional",
    descripcion: "Cultivo probiótico que contribuye al balance intestinal e inmunidad.",
    icon: "🧬",
    beneficio: "Alimento funcional con declaraciones de salud permitidas",
    enYogur: true, enShake: false, enMermelada: false,
    productos: [
      { nombre: "Yogurt funcional probiótico", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Leches fermentadas tipo Yakult", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Postres lácteos funcionales", tipo: "Lácteos", icon: "🍮" },
      { nombre: "Embutidos probióticos", tipo: "Cárnicos", icon: "🌭" },
      { nombre: "Panes funcionales", tipo: "Panadería", icon: "🍞" },
      { nombre: "Jugos probióticos", tipo: "Bebidas", icon: "🧃" },
      { nombre: "Cápsulas probióticas", tipo: "Nutracéuticos", icon: "💊" },
      { nombre: "Cremas con probióticos", tipo: "Cosmética", icon: "🧴" },
    ],
  },
  "SACAROSA": {
    categoria: "Azúcar / Carbohidrato",
    descripcion: "Azúcar de caña, edulcorante universal y fuente energética para fermentadores.",
    icon: "🍯",
    beneficio: "Alimento para cultivos BAL, endulzante y agente de cuerpo",
    enYogur: true, enShake: false, enMermelada: false,
    productos: [
      { nombre: "Yogurt endulzado", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Helados tradicionales", tipo: "Lácteos", icon: "🍦" },
      { nombre: "Leche condensada", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Salami y curados", tipo: "Cárnicos", icon: "🍖" },
      { nombre: "Salsas BBQ", tipo: "Cárnicos", icon: "🍖" },
      { nombre: "Galletas y pasteles", tipo: "Panadería", icon: "🍪" },
      { nombre: "Gaseosas y jugos", tipo: "Bebidas", icon: "🥤" },
      { nombre: "Chocolates y caramelos", tipo: "Confitería", icon: "🍫" },
      { nombre: "Mermeladas y conservas", tipo: "Confitería", icon: "🍓" },
      { nombre: "Jarabes farmacéuticos", tipo: "Farmacéutico", icon: "💊" },
    ],
  },
  "PROTEINA WPC 80": {
    categoria: "Proteína Concentrada",
    descripcion: "Concentrado de proteína de suero al 80%. Tecnología Isochill para alta solubilidad.",
    icon: "💪",
    beneficio: "Aporta emulsificación, perfil aminoacídico completo y excelente solubilidad",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Batidos deportivos (shakes)", tipo: "Nutracéuticos", icon: "🥤" },
      { nombre: "Sustitutos de comida", tipo: "Nutracéuticos", icon: "🍱" },
      { nombre: "Barras de proteína", tipo: "Nutracéuticos", icon: "🍫" },
      { nombre: "Yogures proteicos", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Helados proteicos", tipo: "Lácteos", icon: "🍦" },
      { nombre: "Embutidos enriquecidos", tipo: "Cárnicos", icon: "🌭" },
      { nombre: "Panes proteicos", tipo: "Panadería", icon: "🍞" },
      { nombre: "Galletas fitness", tipo: "Panadería", icon: "🍪" },
      { nombre: "Bebidas RTD recovery", tipo: "Bebidas", icon: "💪" },
      { nombre: "Fórmulas clínicas", tipo: "Nutracéuticos", icon: "💊" },
    ],
  },
  "COLAGENO HIDROLIZADO": {
    categoria: "Proteína Bioactiva",
    descripcion: "Proteína biodisponible con péptidos pequeños. Mejora viscosidad sin alterar sabor.",
    icon: "✨",
    beneficio: "Salud articular, piel y tejidos. Claim funcional 'beauty-from-within'",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Barras de proteína", tipo: "Nutracéuticos", icon: "🍫" },
      { nombre: "Bebidas funcionales", tipo: "Bebidas", icon: "🥤" },
      { nombre: "Mezclas para hornear", tipo: "Panadería", icon: "🥧" },
      { nombre: "Yogures premium", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Gomitas funcionales", tipo: "Confitería", icon: "🍬" },
      { nombre: "Sopas y caldos enriquecidos", tipo: "Salsas", icon: "🥣" },
      { nombre: "Cápsulas y suplementos", tipo: "Nutracéuticos", icon: "💊" },
      { nombre: "Cremas anti-edad", tipo: "Cosmética", icon: "🧴" },
      { nombre: "Embutidos premium", tipo: "Cárnicos", icon: "🥩" },
    ],
  },
  "ACIDO HIALURONICO": {
    categoria: "Ingrediente Premium / Nutricosmético",
    descripcion: "Agente de hidratación y soporte de matriz elástica. Tendencia 'Bienestar Holístico'.",
    icon: "💧",
    beneficio: "Salud de piel y articulaciones. Producto premium de alto valor",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Bebidas 'beauty'", tipo: "Bebidas", icon: "✨" },
      { nombre: "Suplementos anti-edad", tipo: "Nutracéuticos", icon: "💊" },
      { nombre: "Shakes premium femeninos", tipo: "Nutracéuticos", icon: "🥤" },
      { nombre: "Yogures funcionales", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Gomitas de belleza", tipo: "Confitería", icon: "🍬" },
      { nombre: "Cremas faciales", tipo: "Cosmética", icon: "🧴" },
      { nombre: "Sérums anti-edad", tipo: "Cosmética", icon: "💆" },
      { nombre: "Aguas funcionales", tipo: "Bebidas", icon: "💧" },
    ],
  },
  "GOMA XANTHAN": {
    categoria: "Estabilizante / Espesante",
    descripcion: "Estabilizante, espesante y agente de suspensión de alta eficiencia en bajas dosis.",
    icon: "🧊",
    beneficio: "Estabilidad de emulsiones, evita sedimentación, mejora estructura sin gluten",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Yogurt bebible", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Helados cremosos", tipo: "Lácteos", icon: "🍦" },
      { nombre: "Bebidas en polvo", tipo: "Bebidas", icon: "🥤" },
      { nombre: "Salsas y aderezos", tipo: "Salsas", icon: "🥣" },
      { nombre: "Mayonesa light", tipo: "Salsas", icon: "🥚" },
      { nombre: "Productos sin gluten", tipo: "Panadería", icon: "🍞" },
      { nombre: "Embutidos emulsionados", tipo: "Cárnicos", icon: "🌭" },
      { nombre: "Smoothies espesos", tipo: "Bebidas", icon: "🥤" },
      { nombre: "Gomitas y geles", tipo: "Confitería", icon: "🍬" },
    ],
  },
  "VITAMINA D3 CWS": {
    categoria: "Fortificante Vitamínico",
    descripcion: "Tecnología Cold Water Soluble que permite dispersión en frío sin sedimentación.",
    icon: "☀️",
    beneficio: "Fortificación invisible, sin anillos de grasa ni sedimentación",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Leches fortificadas", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Leches vegetales (almendras, soya)", tipo: "Vegetales", icon: "🌱" },
      { nombre: "Yogures funcionales", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Jugos fortificados", tipo: "Bebidas", icon: "🧃" },
      { nombre: "Fórmulas infantiles", tipo: "Nutracéuticos", icon: "🍼" },
      { nombre: "Cereales para desayuno", tipo: "Panadería", icon: "🥣" },
      { nombre: "Suplementos líquidos", tipo: "Nutracéuticos", icon: "💊" },
      { nombre: "Premix nutricionales", tipo: "Nutracéuticos", icon: "📦" },
    ],
  },
  "CITRATO DE MAGNESIO": {
    categoria: "Mineral Fortificante",
    descripcion: "Fuente mineral de alta biodisponibilidad. Regulador de acidez y fortificante.",
    icon: "⚡",
    beneficio: "Alta absorción, sin sabor metálico de otros fortificantes",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Bebidas isotónicas", tipo: "Bebidas", icon: "🥤" },
      { nombre: "Polvos para descanso/sueño", tipo: "Nutracéuticos", icon: "🌙" },
      { nombre: "Suplementos deportivos", tipo: "Nutracéuticos", icon: "💪" },
      { nombre: "Aguas funcionales", tipo: "Bebidas", icon: "💧" },
      { nombre: "Jugos enriquecidos", tipo: "Bebidas", icon: "🧃" },
      { nombre: "Premix mineral", tipo: "Nutracéuticos", icon: "📦" },
      { nombre: "Sales reguladoras", tipo: "Farmacéutico", icon: "💊" },
    ],
  },
  "EXTRACTO DE MALTA": {
    categoria: "Saborizante Natural",
    descripcion: "Aporte de color natural, sabor a cereal y azúcares fermentables.",
    icon: "🌾",
    beneficio: "Notas dulces y maltosas, redondea sabores intensos",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Bebidas malteadas", tipo: "Bebidas", icon: "🥤" },
      { nombre: "Cervezas artesanales", tipo: "Bebidas", icon: "🍺" },
      { nombre: "Galletas y panificación", tipo: "Panadería", icon: "🍪" },
      { nombre: "Cereales para desayuno", tipo: "Panadería", icon: "🥣" },
      { nombre: "Bebidas infantiles nutritivas", tipo: "Nutracéuticos", icon: "🍼" },
      { nombre: "Sustitutos de café", tipo: "Bebidas", icon: "☕" },
      { nombre: "Helados malteados", tipo: "Lácteos", icon: "🍦" },
    ],
  },
  "DIOXIDO DE SILICIO": {
    categoria: "Antiaglomerante",
    descripcion: "Agente antiaglomerante (Perkasyl) que facilita el flujo de polvos.",
    icon: "🏖️",
    beneficio: "Evita compactación, mejora flujo y envasado automático",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Mezclas en polvo (premix)", tipo: "Nutracéuticos", icon: "📦" },
      { nombre: "Especias y condimentos", tipo: "Salsas", icon: "🌶️" },
      { nombre: "Sales y azúcares", tipo: "Confitería", icon: "🧂" },
      { nombre: "Cocoa instantánea", tipo: "Bebidas", icon: "☕" },
      { nombre: "Sopas instantáneas", tipo: "Salsas", icon: "🥣" },
      { nombre: "Sachets de bebidas", tipo: "Bebidas", icon: "🥤" },
      { nombre: "Suplementos en polvo", tipo: "Nutracéuticos", icon: "💊" },
    ],
  },
  "VITAMINA C": {
    categoria: "Antioxidante Vitamínico",
    descripcion: "Ácido ascórbico. Antioxidante natural y fortificante vitamínico.",
    icon: "🍊",
    beneficio: "Conservante natural y fortificación inmune",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Conservación de frutas", tipo: "Vegetales", icon: "🍓" },
      { nombre: "Jugos fortificados", tipo: "Bebidas", icon: "🧃" },
      { nombre: "Productos cárnicos curados", tipo: "Cárnicos", icon: "🥩" },
      { nombre: "Bebidas inmunidad", tipo: "Bebidas", icon: "🥤" },
      { nombre: "Mejorante para panadería", tipo: "Panadería", icon: "🥖" },
      { nombre: "Cápsulas y tabletas", tipo: "Nutracéuticos", icon: "💊" },
      { nombre: "Gomitas vitamínicas", tipo: "Confitería", icon: "🍬" },
      { nombre: "Cosméticos antioxidantes", tipo: "Cosmética", icon: "🧴" },
    ],
  },
  "COMPLEJO VITAMINICO B": {
    categoria: "Fortificante Vitamínico",
    descripcion: "Vitaminas B-2 (riboflavina), B-8 (biotina), B-9 (ácido fólico). Co-factores metabólicos.",
    icon: "💊",
    beneficio: "Claim de salud energética, cabello, piel y uñas",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Bebidas energéticas", tipo: "Bebidas", icon: "⚡" },
      { nombre: "Nutrición infantil", tipo: "Nutracéuticos", icon: "🍼" },
      { nombre: "Suplementos pre-natales", tipo: "Nutracéuticos", icon: "💊" },
      { nombre: "Cereales fortificados", tipo: "Panadería", icon: "🥣" },
      { nombre: "Leches enriquecidas", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Suplementos belleza/wellness", tipo: "Nutracéuticos", icon: "✨" },
      { nombre: "Premix multivitamínicos", tipo: "Nutracéuticos", icon: "📦" },
    ],
  },
  "LACTATO FERROSO": {
    categoria: "Mineral Fortificante",
    descripcion: "Fortificación de hierro de alta solubilidad y menor impacto en sabor.",
    icon: "🩸",
    beneficio: "Sabor neutro vs otros sulfatos de hierro",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Fórmulas infantiles", tipo: "Nutracéuticos", icon: "🍼" },
      { nombre: "Cereales para desayuno", tipo: "Panadería", icon: "🥣" },
      { nombre: "Suplementos anti-anemia", tipo: "Nutracéuticos", icon: "💊" },
      { nombre: "Leches fortificadas", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Galletas enriquecidas", tipo: "Panadería", icon: "🍪" },
      { nombre: "Polvos nutricionales", tipo: "Nutracéuticos", icon: "📦" },
    ],
  },
  "AB-KEFIR 200B": {
    categoria: "Probiótico Tecnológico",
    descripcion: "Cultivo iniciador con billones de microorganismos. Resistente a procesos de mezcla.",
    icon: "🧬",
    beneficio: "Funcionalidad digestiva e inmune, sobrevive en matrices secas",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Lácteos fermentados", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Kéfir tradicional", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Polvos funcionales", tipo: "Nutracéuticos", icon: "📦" },
      { nombre: "Suplementos digestivos", tipo: "Nutracéuticos", icon: "💊" },
      { nombre: "Batidos probióticos", tipo: "Nutracéuticos", icon: "🥤" },
      { nombre: "Postres funcionales", tipo: "Lácteos", icon: "🍮" },
    ],
  },
  "NEOSWEET S": {
    categoria: "Edulcorante Compuesto",
    descripcion: "Mezcla de edulcorantes para reducción de azúcar con perfil sensorial limpio.",
    icon: "🍯",
    beneficio: "Sin retrogusto metálico, ideal para sugar-free premium",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Bebidas reducidas en calorías", tipo: "Bebidas", icon: "🥤" },
      { nombre: "Postres sin azúcar", tipo: "Lácteos", icon: "🍮" },
      { nombre: "Confitería sugar-free", tipo: "Confitería", icon: "🍬" },
      { nombre: "Yogures diet", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Alimentos para diabéticos", tipo: "Nutracéuticos", icon: "💊" },
      { nombre: "Productos keto", tipo: "Nutracéuticos", icon: "🥑" },
      { nombre: "Salsas reducidas", tipo: "Salsas", icon: "🥣" },
    ],
  },
  "VAINILLINA": {
    categoria: "Saborizante",
    descripcion: "Aporte de notas dulces y aromáticas auténticas. Versión Etil 2-3x más potente.",
    icon: "🌼",
    beneficio: "Sabor primario universal, alta estabilidad térmica",
    enYogur: true, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Repostería fina", tipo: "Panadería", icon: "🍰" },
      { nombre: "Helados clásicos", tipo: "Lácteos", icon: "🍦" },
      { nombre: "Bebidas lácteas", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Chocolates", tipo: "Confitería", icon: "🍫" },
      { nombre: "Galletería industrial", tipo: "Panadería", icon: "🍪" },
      { nombre: "Yogures saborizados", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Licores y aperitivos", tipo: "Bebidas", icon: "🍷" },
    ],
  },
  "CREMA NO LACTEA": {
    categoria: "Sustituto Lácteo",
    descripcion: "Agente de blanqueo y aporte de cremosidad sin lactosa.",
    icon: "🌙",
    beneficio: "Mouthfeel cremoso, sin lactosa, opacidad blanca",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Cafés 3 en 1", tipo: "Bebidas", icon: "☕" },
      { nombre: "Sopas instantáneas", tipo: "Salsas", icon: "🥣" },
      { nombre: "Postres instantáneos", tipo: "Lácteos", icon: "🍮" },
      { nombre: "Mezclas de chocolate caliente", tipo: "Bebidas", icon: "🍫" },
      { nombre: "Cremas para café", tipo: "Bebidas", icon: "☕" },
      { nombre: "Premezclas vegetales", tipo: "Vegetales", icon: "🌱" },
      { nombre: "Batidos sin lactosa", tipo: "Nutracéuticos", icon: "🥤" },
    ],
  },
  "COCOA ALCALINA": {
    categoria: "Cocoa Procesada",
    descripcion: "Cocoa alcalinizada negra (10-12%). Color intenso y sabor más suave.",
    icon: "🍫",
    beneficio: "Color visualmente atractivo sin colorantes artificiales",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Helados de chocolate oscuro", tipo: "Lácteos", icon: "🍦" },
      { nombre: "Galletas tipo sandwich", tipo: "Panadería", icon: "🍪" },
      { nombre: "Bebidas dark chocolate", tipo: "Bebidas", icon: "🥤" },
      { nombre: "Brownies y bizcochos", tipo: "Panadería", icon: "🎂" },
      { nombre: "Coberturas de chocolate", tipo: "Confitería", icon: "🍫" },
      { nombre: "Postres premium", tipo: "Lácteos", icon: "🍰" },
    ],
  },
  "COCOA NATURAL": {
    categoria: "Cocoa Natural",
    descripcion: "Cocoa natural en polvo. Aporte de sabor a cacao auténtico y polifenoles.",
    icon: "🍫",
    beneficio: "Antioxidantes naturales, claim funcional",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Mezclas saludables", tipo: "Nutracéuticos", icon: "🥤" },
      { nombre: "Repostería funcional", tipo: "Panadería", icon: "🧁" },
      { nombre: "Polvos para hornear", tipo: "Panadería", icon: "🥧" },
      { nombre: "Smoothies premium", tipo: "Bebidas", icon: "🥤" },
      { nombre: "Barras de proteína", tipo: "Nutracéuticos", icon: "🍫" },
      { nombre: "Yogures de chocolate", tipo: "Lácteos", icon: "🥛" },
    ],
  },
  "SABOR FRESA": {
    categoria: "Saborizante",
    descripcion: "Perfil aromático fresa de alta fidelidad. Enmascara notas lácteas del WPC.",
    icon: "🍓",
    beneficio: "Sabor frutal vibrante, estable en matrices proteicas",
    enYogur: false, enShake: true, enMermelada: true,
    productos: [
      { nombre: "Yogures de fresa", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Helados de fresa", tipo: "Lácteos", icon: "🍦" },
      { nombre: "Smoothies y batidos", tipo: "Bebidas", icon: "🥤" },
      { nombre: "Postres instantáneos", tipo: "Lácteos", icon: "🍮" },
      { nombre: "Gomitas frutales", tipo: "Confitería", icon: "🍬" },
      { nombre: "Bebidas en polvo", tipo: "Bebidas", icon: "🧃" },
      { nombre: "Galletas rellenas", tipo: "Panadería", icon: "🍪" },
      { nombre: "Mermeladas premium", tipo: "Confitería", icon: "🍓" },
    ],
  },
  "SABOR CHOCOLATE": {
    categoria: "Saborizante",
    descripcion: "Aporte de perfil aromático primario. Estandariza el sabor frente a variaciones de cacao.",
    icon: "🍫",
    beneficio: "Sabor consistente lote a lote, alta intensidad",
    enYogur: false, enShake: true, enMermelada: false,
    productos: [
      { nombre: "Batidos premium", tipo: "Nutracéuticos", icon: "🥤" },
      { nombre: "Rellenos de galletería", tipo: "Panadería", icon: "🍪" },
      { nombre: "Confitería de chocolate", tipo: "Confitería", icon: "🍫" },
      { nombre: "Helados industriales", tipo: "Lácteos", icon: "🍦" },
      { nombre: "Coberturas y rellenos", tipo: "Confitería", icon: "🧁" },
      { nombre: "Bebidas achocolatadas", tipo: "Bebidas", icon: "☕" },
    ],
  },
  "ROJO ALLURA": {
    categoria: "Colorante",
    descripcion: "Colorante Rojo No. 40 de alta estabilidad frente a luz y pH. Color rosado/rojo vibrante.",
    icon: "🌹",
    beneficio: "Color comercial atractivo, estable en producción",
    enYogur: false, enShake: true, enMermelada: true,
    productos: [
      { nombre: "Bebidas en polvo", tipo: "Bebidas", icon: "🥤" },
      { nombre: "Gomas de mascar", tipo: "Confitería", icon: "🍬" },
      { nombre: "Confitería y dulces", tipo: "Confitería", icon: "🍭" },
      { nombre: "Helados saborizados", tipo: "Lácteos", icon: "🍦" },
      { nombre: "Yogures de fresa", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Embutidos rojos", tipo: "Cárnicos", icon: "🌭" },
      { nombre: "Cocteles y bebidas", tipo: "Bebidas", icon: "🍹" },
      { nombre: "Mermeladas con color", tipo: "Confitería", icon: "🍓" },
    ],
  },
  "PECTINA": {
    categoria: "Hidrocoloide / Gelificante",
    descripcion: "Agente gelificante que forma una red atrapando agua y azúcar, dando consistencia.",
    icon: "🍓",
    beneficio: "Salud: fibra soluble, reduce colesterol. Técnico: mejora textura y sensación en boca",
    enYogur: false, enShake: false, enMermelada: true,
    productos: [
      { nombre: "Mermeladas y conservas", tipo: "Confitería", icon: "🍓" },
      { nombre: "Gomitas y gelatinas", tipo: "Confitería", icon: "🍬" },
      { nombre: "Yogures de fruta", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Helados con frutas", tipo: "Lácteos", icon: "🍦" },
      { nombre: "Néctares de fruta", tipo: "Bebidas", icon: "🧃" },
      { nombre: "Rellenos de pastelería", tipo: "Panadería", icon: "🥧" },
      { nombre: "Yogures cremosos", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Embutidos light", tipo: "Cárnicos", icon: "🌭" },
      { nombre: "Suplementos de fibra", tipo: "Nutracéuticos", icon: "💊" },
      { nombre: "Bebidas funcionales", tipo: "Bebidas", icon: "🥤" },
    ],
  },
  "ACIDO CITRICO": {
    categoria: "Acidulante / Conservante",
    descripcion: "Regulador de acidez y conservante. Ajusta el pH para activar la pectina y otros ingredientes.",
    icon: "🍋",
    beneficio: "Salud: antioxidante, mejora absorción de minerales. Técnico: previene oxidación",
    enYogur: false, enShake: false, enMermelada: true,
    productos: [
      { nombre: "Mermeladas y conservas", tipo: "Confitería", icon: "🍓" },
      { nombre: "Bebidas y refrescos", tipo: "Bebidas", icon: "🥤" },
      { nombre: "Dulces ácidos", tipo: "Confitería", icon: "🍬" },
      { nombre: "Embutidos curados", tipo: "Cárnicos", icon: "🥩" },
      { nombre: "Quesos procesados", tipo: "Lácteos", icon: "🧀" },
      { nombre: "Encurtidos vegetales", tipo: "Vegetales", icon: "🥒" },
      { nombre: "Salsas y aderezos", tipo: "Salsas", icon: "🥣" },
      { nombre: "Helados con frutas", tipo: "Lácteos", icon: "🍦" },
      { nombre: "Vinos y vinagres", tipo: "Bebidas", icon: "🍷" },
      { nombre: "Suplementos efervescentes", tipo: "Nutracéuticos", icon: "💊" },
      { nombre: "Cosméticos exfoliantes", tipo: "Cosmética", icon: "🧴" },
    ],
  },
  "XILITOL": {
    categoria: "Poliol / Edulcorante de Carga",
    descripcion: "Edulcorante de carga que sustituye al azúcar 1:1 en dulzor y volumen (bulking agent).",
    icon: "❄️",
    beneficio: "Salud: índice glucémico bajo (apto para diabéticos), previene la caries. Técnico: efecto refrescante en boca",
    enYogur: false, enShake: false, enMermelada: true,
    productos: [
      { nombre: "Mermeladas sin azúcar", tipo: "Confitería", icon: "🍓" },
      { nombre: "Gomas de mascar", tipo: "Confitería", icon: "🍬" },
      { nombre: "Chocolates sin azúcar", tipo: "Confitería", icon: "🍫" },
      { nombre: "Repostería keto", tipo: "Panadería", icon: "🍰" },
      { nombre: "Galletas diabéticas", tipo: "Panadería", icon: "🍪" },
      { nombre: "Yogures sin azúcar", tipo: "Lácteos", icon: "🥛" },
      { nombre: "Helados sin azúcar", tipo: "Lácteos", icon: "🍦" },
      { nombre: "Enjuagues bucales", tipo: "Cuidado personal", icon: "🦷" },
      { nombre: "Pastas dentales", tipo: "Cuidado personal", icon: "🦷" },
      { nombre: "Caramelos sin caries", tipo: "Confitería", icon: "🍭" },
      { nombre: "Jarabes farmacéuticos", tipo: "Farmacéutico", icon: "💊" },
    ],
  },
};

// ============================================================
// ALIASES PARA MATERIAS PRIMAS
// ============================================================
const ALIASES = {
  "ALMIDON": "ALMIDON NATIVO DE YUCA", "ALMIDON YUCA": "ALMIDON NATIVO DE YUCA",
  "ALMIDON DE YUCA": "ALMIDON NATIVO DE YUCA", "ALMIDON NATIVO": "ALMIDON NATIVO DE YUCA",
  "YUCA": "ALMIDON NATIVO DE YUCA", "ERYTHRITOL": "ERITRITOL", "MONK": "MONK FRUIT",
  "LUO HAN GUO": "MONK FRUIT", "FRUTA DEL MONJE": "MONK FRUIT",
  "LECHE POLVO": "LECHE EN POLVO", "MILK POWDER": "LECHE EN POLVO",
  "LECHE DESHIDRATADA": "LECHE EN POLVO", "BAL": "CULTIVOS BAL", "CULTIVO BAL": "CULTIVOS BAL",
  "CULTIVOS LACTICOS": "CULTIVOS BAL", "CULTIVO LACTICO": "CULTIVOS BAL", "INICIADOR": "CULTIVOS BAL",
  "PROBIOTICO": "PROBIOTICOS L. CASEI", "PROBIOTICOS": "PROBIOTICOS L. CASEI",
  "L. CASEI": "PROBIOTICOS L. CASEI", "L CASEI": "PROBIOTICOS L. CASEI",
  "LACTOBACILLUS": "PROBIOTICOS L. CASEI", "LACTOBACILLUS CASEI": "PROBIOTICOS L. CASEI",
  "AZUCAR": "SACAROSA", "SUCROSA": "SACAROSA", "SUGAR": "SACAROSA",
  "WPC": "PROTEINA WPC 80", "WPC 80": "PROTEINA WPC 80", "WPC80": "PROTEINA WPC 80",
  "ISOCHILL": "PROTEINA WPC 80", "WHEY": "PROTEINA WPC 80",
  "PROTEINA WHEY": "PROTEINA WPC 80", "SUERO LACTEO": "PROTEINA WPC 80",
  "COLAGENO": "COLAGENO HIDROLIZADO", "COLLAGEN": "COLAGENO HIDROLIZADO",
  "PEPTIDOS DE COLAGENO": "COLAGENO HIDROLIZADO", "HIALURONICO": "ACIDO HIALURONICO",
  "HYALURONIC": "ACIDO HIALURONICO", "HA": "ACIDO HIALURONICO",
  "XANTHAN": "GOMA XANTHAN", "XANTAN": "GOMA XANTHAN", "GOMA XANTAN": "GOMA XANTHAN",
  "XANTHAN GUM": "GOMA XANTHAN", "PERKASYL": "DIOXIDO DE SILICIO",
  "DIOXIDO SILICIO": "DIOXIDO DE SILICIO", "SIO2": "DIOXIDO DE SILICIO",
  "SILICIO": "DIOXIDO DE SILICIO", "VITAMINA D": "VITAMINA D3 CWS",
  "VITAMINA D3": "VITAMINA D3 CWS", "D3 CWS": "VITAMINA D3 CWS", "D3": "VITAMINA D3 CWS",
  "MAGNESIO": "CITRATO DE MAGNESIO", "CITRATO MAGNESIO": "CITRATO DE MAGNESIO",
  "ACIDO ASCORBICO": "VITAMINA C", "ASCORBICO": "VITAMINA C", "VITC": "VITAMINA C",
  "BIOTINA": "COMPLEJO VITAMINICO B", "ACIDO FOLICO": "COMPLEJO VITAMINICO B",
  "RIBOFLAVINA": "COMPLEJO VITAMINICO B", "B2": "COMPLEJO VITAMINICO B",
  "B8": "COMPLEJO VITAMINICO B", "B9": "COMPLEJO VITAMINICO B",
  "VITAMINAS B": "COMPLEJO VITAMINICO B", "COMPLEJO B": "COMPLEJO VITAMINICO B",
  "HIERRO": "LACTATO FERROSO", "FERROSO": "LACTATO FERROSO",
  "LACTATO HIERRO": "LACTATO FERROSO", "AB KEFIR": "AB-KEFIR 200B",
  "ABKEFIR": "AB-KEFIR 200B", "KEFIR": "AB-KEFIR 200B",
  "AB-KEFIR": "AB-KEFIR 200B", "200B": "AB-KEFIR 200B",
  "MALTA": "EXTRACTO DE MALTA", "EXTRACTO MALTA": "EXTRACTO DE MALTA",
  "MALT EXTRACT": "EXTRACTO DE MALTA", "VAINILLA": "VAINILLINA",
  "VANILLA": "VAINILLINA", "ETIL VAINILLINA": "VAINILLINA",
  "VAINILLINA NATURAL": "VAINILLINA", "VANILLIN": "VAINILLINA",
  "NEOSWEET": "NEOSWEET S", "NON DAIRY": "CREMA NO LACTEA",
  "NON-DAIRY": "CREMA NO LACTEA", "CREMA NO DAIRY": "CREMA NO LACTEA",
  "F25": "CREMA NO LACTEA", "F25 A": "CREMA NO LACTEA",
  "COCOA": "COCOA NATURAL", "CACAO": "COCOA NATURAL",
  "CACAO POLVO": "COCOA NATURAL", "COCOA POLVO": "COCOA NATURAL",
  "COCOA NEGRA": "COCOA ALCALINA", "COCOA ALCALINIZADA": "COCOA ALCALINA",
  "DUTCH COCOA": "COCOA ALCALINA", "BLACK COCOA": "COCOA ALCALINA",
  "FRESA": "SABOR FRESA", "STRAWBERRY": "SABOR FRESA", "J015": "SABOR FRESA",
  "CHOCOLATE": "SABOR CHOCOLATE", "GSF": "SABOR CHOCOLATE",
  "ALLURA": "ROJO ALLURA", "ROJO 40": "ROJO ALLURA",
  "ROJO NO 40": "ROJO ALLURA", "RED 40": "ROJO ALLURA",
  "ALLURA RED": "ROJO ALLURA", "COLOR ROJO": "ROJO ALLURA",
  "PECTIN": "PECTINA", "PECTINA HM": "PECTINA", "PECTINA LM": "PECTINA",
  "PECTINA CITRICA": "PECTINA", "PECTINA DE MANZANA": "PECTINA",
  "PECTINA DE CITRICOS": "PECTINA", "CITRIC ACID": "ACIDO CITRICO",
  "ACIDO CITRICO ANHIDRO": "ACIDO CITRICO", "ACIDO CITRICO MONOHIDRATO": "ACIDO CITRICO",
  "CITRATO": "ACIDO CITRICO", "E330": "ACIDO CITRICO",
  "XYLITOL": "XILITOL", "AZUCAR DE ABEDUL": "XILITOL",
  "BIRCH SUGAR": "XILITOL", "HKXC10": "XILITOL",
};

// ============================================================
// HELPERS
// ============================================================
function normalize(text) {
  return text
    .toUpperCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9\s.\-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Solo acepta una de las 3 claves canónicas de hablador. Sin fuzzy matching.
// La IA está instruida para responder con uno de estos 3 códigos exactos o NO_IDENTIFICADO.
const PRODUCTOS_CODIGOS_VALIDOS = ["YOGURT_VAINILLA", "MALTEADA_CHOCOLATE", "MERMELADA_FRESA"];

function findProductoDemo(text) {
  if (!text) return null;
  const normalized = text.toUpperCase().trim();
  if (PRODUCTOS_CODIGOS_VALIDOS.includes(normalized) && PRODUCTOS_DEMO[normalized]) {
    return { key: normalized, ...PRODUCTOS_DEMO[normalized] };
  }
  return null;
}

// Solo se usa cuando el usuario ELIGE una materia prima desde la pantalla de selección manual.
// El reconocimiento por foto NUNCA cae aquí — la cámara solo identifica los 3 habladores.
function findMateriaPrima(text) {
  if (!text) return null;
  const normalized = normalize(text);
  if (!normalized) return null;
  if (MATERIAS_PRIMAS_DB[normalized]) return { key: normalized, ...MATERIAS_PRIMAS_DB[normalized] };
  if (ALIASES[normalized]) {
    const key = ALIASES[normalized];
    return { key, ...MATERIAS_PRIMAS_DB[key] };
  }
  return null;
}

// Enviar lead a Google Sheets (con fallback a localStorage)
async function saveLead(leadData) {
  const payload = {
    timestamp: new Date().toISOString(),
    ...leadData,
  };

  // Guardar SIEMPRE en localStorage como respaldo
  try {
    const existing = JSON.parse(localStorage.getItem("fm_leads_backup") || "[]");
    existing.push(payload);
    localStorage.setItem("fm_leads_backup", JSON.stringify(existing));
  } catch (e) { /* ignore */ }

  // Enviar a Google Sheets
  if (!GOOGLE_SHEETS_ENDPOINT || GOOGLE_SHEETS_ENDPOINT.includes("REEMPLAZAR_AQUI")) {
    console.warn("Google Sheets endpoint no configurado. Lead guardado solo localmente.");
    return { ok: false, reason: "endpoint_not_configured" };
  }

  try {
    // Apps Script no soporta CORS preflight, usamos 'no-cors' con text/plain
    await fetch(GOOGLE_SHEETS_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return { ok: true };
  } catch (err) {
    console.error("Error enviando lead:", err);
    return { ok: false, reason: "network_error" };
  }
}

// Email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Phone validation (acepta dígitos, espacios, +, -, (, ))
function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

// ============================================================
// STYLES
// ============================================================
const COLORS = {
  primary: "#ffffff",
  secondary: "#1a286e",
  tertiary: "#ff712d",
  bg: "#f0f2f7",
  cardBg: "#ffffff",
  textDark: "#1a286e",
  textLight: "#6b7280",
  gradient1: "linear-gradient(135deg, #1a286e 0%, #2d3a8c 50%, #1a286e 100%)",
  gradient2: "linear-gradient(135deg, #ff712d 0%, #ff9a5c 100%)",
  glassBg: "rgba(255,255,255,0.85)",
};

// ============================================================
// COMPONENTS
// ============================================================

function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const PARTICLE_COUNT = 60;
    const CONNECTION_DIST = 120;
    const colors = ["#ff712d", "#ffffff", "#4a5abf", "#ff9a5c", "#8b9aff"];

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 4 + 1;
        this.speedX = (Math.random() - 0.5) * 1.2;
        this.speedY = (Math.random() - 0.5) * 1.2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.15;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.03 + 0.01;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += this.pulseSpeed;
        this.opacity = 0.15 + Math.sin(this.pulse) * 0.2;
        if (this.x < -10 || this.x > w + 10 || this.y < -10 || this.y > h + 10) {
          this.reset();
          const side = Math.floor(Math.random() * 4);
          if (side === 0) { this.x = -5; this.y = Math.random() * h; }
          else if (side === 1) { this.x = w + 5; this.y = Math.random() * h; }
          else if (side === 2) { this.y = -5; this.x = Math.random() * w; }
          else { this.y = h + 5; this.x = Math.random() * w; }
        }
      }
      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.globalAlpha = Math.max(0, this.opacity * 0.3);
        ctx.fill();
      }
    }

    const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = "#ff712d";
            ctx.globalAlpha = (1 - dist / CONNECTION_DIST) * 0.12;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      particles.forEach((p) => { p.update(); p.draw(ctx); });
      drawConnections();
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    }

    animate();

    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

// Logo SVG inline — siempre se renderiza, jamás depende de assets externos
function Logo({ size = 80 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: "drop-shadow(0 2px 8px rgba(26,40,110,0.3))",
        flexShrink: 0,
      }}
      aria-label="Factores & Mercadeo"
    >
      <defs>
        <linearGradient id="fm-logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a286e" />
          <stop offset="100%" stopColor="#2d3a8c" />
        </linearGradient>
      </defs>
      {/* Óvalo de fondo con gradiente */}
      <ellipse cx="100" cy="100" rx="92" ry="62" fill="url(#fm-logo-bg)" />
      {/* Arco decorativo superior naranja */}
      <path
        d="M 32 56 Q 100 36 168 56"
        stroke="#ff712d"
        strokeWidth="2.5"
        fill="none"
        opacity="0.85"
        strokeLinecap="round"
      />
      {/* Letras F&M */}
      <text
        x="100"
        y="124"
        textAnchor="middle"
        fontFamily="Georgia, 'Playfair Display', serif"
        fontSize="62"
        fontWeight="700"
        fill="#ffffff"
        letterSpacing="-1"
      >
        F<tspan fill="#ff712d" dx="1">&amp;</tspan><tspan dx="1">M</tspan>
      </text>
      {/* Tagline pequeño */}
      <text
        x="100"
        y="148"
        textAnchor="middle"
        fontFamily="'Open Sans', Helvetica, Arial, sans-serif"
        fontSize="8.5"
        fontWeight="600"
        fill="rgba(255,255,255,0.75)"
        letterSpacing="2.5"
      >
        FACTORES &amp; MERCADEO
      </text>
      {/* Arco decorativo inferior naranja */}
      <path
        d="M 32 146 Q 100 166 168 146"
        stroke="#ff712d"
        strokeWidth="2.5"
        fill="none"
        opacity="0.85"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WelcomeScreen({ onStart }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "24px",
      background: COLORS.gradient1, position: "relative", overflow: "hidden",
    }}>
      <ParticleBackground />
      <div style={{
        position: "relative", zIndex: 1, textAlign: "center",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <Logo size={160} />
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(28px, 6vw, 42px)", color: "#fff",
          margin: "24px 0 8px", fontWeight: 700, lineHeight: 1.1,
        }}>
          Factores & Mercadeo
        </h1>
        <p style={{
          fontFamily: "'Open Sans', sans-serif", fontSize: "14px",
          color: "rgba(255,255,255,0.7)", letterSpacing: "3px",
          textTransform: "uppercase", margin: "0 0 32px",
        }}>
          Tecno Lácteos & Tecno Cárnicos 2025
        </p>

        <div style={{
          background: "rgba(255,255,255,0.08)", borderRadius: "20px",
          padding: "28px 24px", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.12)", maxWidth: "380px",
          margin: "0 auto 36px",
        }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>✨</div>
          <h2 style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: "18px",
            color: "#fff", fontWeight: 600, margin: "0 0 12px",
          }}>
            Un producto,<br/>decenas de materias primas
          </h2>
          <p style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: "14px",
            color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0,
          }}>
            Escanea el hablador de cualquier producto y descubre todas
            las materias primas F&M que lo componen.
          </p>
        </div>

        <button
          onClick={onStart}
          style={{
            background: COLORS.gradient2, border: "none",
            color: "#fff", padding: "16px 48px", borderRadius: "60px",
            fontSize: "16px", fontWeight: 700, fontFamily: "'Open Sans', sans-serif",
            cursor: "pointer", letterSpacing: "0.5px",
            boxShadow: "0 8px 30px rgba(255,113,45,0.4)",
            transition: "all 0.3s ease",
            textTransform: "uppercase",
          }}
          onMouseOver={(e) => { e.target.style.transform = "translateY(-2px) scale(1.02)"; e.target.style.boxShadow = "0 12px 40px rgba(255,113,45,0.5)"; }}
          onMouseOut={(e) => { e.target.style.transform = "translateY(0) scale(1)"; e.target.style.boxShadow = "0 8px 30px rgba(255,113,45,0.4)"; }}
        >
          Comenzar Experiencia
        </button>
      </div>
    </div>
  );
}

// ============================================================
// LEAD CAPTURE — Formulario OBLIGATORIO con validación
// ============================================================
function LeadCapture({ onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim() || name.trim().length < 2) e.name = "Ingresa tu nombre";
    if (!email.trim()) e.email = "Ingresa tu correo";
    else if (!isValidEmail(email.trim())) e.email = "Formato de correo inválido";
    if (!company.trim() || company.trim().length < 2) e.company = "Ingresa el nombre de tu empresa";
    if (!phone.trim()) e.phone = "Ingresa tu teléfono";
    else if (!isValidPhone(phone.trim())) e.phone = "Teléfono inválido (mín. 7 dígitos)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const payload = {
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      phone: phone.trim(),
    };
    // Disparamos pero NO bloqueamos al usuario si el endpoint falla (queda en localStorage)
    saveLead(payload).catch(() => {});
    setTimeout(() => { onSubmit(payload); }, 600);
  };

  const fields = [
    { key: "name", label: "Nombre completo *", value: name, setter: setName, placeholder: "Tu nombre", type: "text", autoComplete: "name" },
    { key: "email", label: "Email *", value: email, setter: setEmail, placeholder: "correo@empresa.com", type: "email", autoComplete: "email" },
    { key: "company", label: "Empresa *", value: company, setter: setCompany, placeholder: "Nombre de tu empresa", type: "text", autoComplete: "organization" },
    { key: "phone", label: "Teléfono *", value: phone, setter: setPhone, placeholder: "+57 300 000 0000", type: "tel", autoComplete: "tel" },
  ];

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "24px",
      background: COLORS.bg, position: "relative",
    }}>
      <div style={{
        background: COLORS.cardBg, borderRadius: "24px",
        padding: "36px 28px", maxWidth: "420px", width: "100%",
        boxShadow: "0 10px 40px rgba(26,40,110,0.08)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Logo size={100} />
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "24px", color: COLORS.secondary,
            margin: "16px 0 8px", fontWeight: 700,
          }}>
            ¡Bienvenido!
          </h2>
          <p style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: "13px",
            color: COLORS.textLight, margin: 0, lineHeight: 1.5,
          }}>
            Cuéntanos quién eres para enviarte información personalizada sobre nuestros ingredientes.
          </p>
        </div>

        {fields.map((field) => (
          <div key={field.key} style={{ marginBottom: "14px" }}>
            <label style={{
              fontFamily: "'Open Sans', sans-serif", fontSize: "11px",
              color: COLORS.secondary, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "1px",
              display: "block", marginBottom: "6px",
            }}>{field.label}</label>
            <input
              type={field.type}
              value={field.value}
              onChange={(e) => {
                field.setter(e.target.value);
                if (errors[field.key]) setErrors({ ...errors, [field.key]: null });
              }}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              style={{
                width: "100%", padding: "12px 16px",
                border: `1.5px solid ${errors[field.key] ? "#ef4444" : "#e5e7eb"}`,
                borderRadius: "12px", fontSize: "14px",
                fontFamily: "'Open Sans', sans-serif", outline: "none",
                transition: "border-color 0.2s", boxSizing: "border-box",
                background: "#fafbfc",
              }}
              onFocus={(e) => { if (!errors[field.key]) e.target.style.borderColor = COLORS.tertiary; }}
              onBlur={(e) => { if (!errors[field.key]) e.target.style.borderColor = "#e5e7eb"; }}
            />
            {errors[field.key] && (
              <div style={{
                fontFamily: "'Open Sans', sans-serif", fontSize: "11px",
                color: "#ef4444", marginTop: "4px", paddingLeft: "4px",
              }}>{errors[field.key]}</div>
            )}
          </div>
        ))}

        <p style={{
          fontFamily: "'Open Sans', sans-serif", fontSize: "10px",
          color: COLORS.textLight, margin: "10px 0 12px", lineHeight: 1.4,
          textAlign: "center",
        }}>
          Al continuar aceptas el tratamiento de tus datos para fines comerciales de Factores & Mercadeo S.A.
        </p>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: "100%", background: submitting ? "#9ca3af" : COLORS.gradient2,
            border: "none", color: "#fff", padding: "14px",
            borderRadius: "12px", fontSize: "15px", fontWeight: 700,
            fontFamily: "'Open Sans', sans-serif",
            cursor: submitting ? "default" : "pointer",
            boxShadow: submitting ? "none" : "0 4px 15px rgba(255,113,45,0.3)",
            transition: "all 0.2s",
          }}
        >
          {submitting ? "Enviando..." : "Continuar →"}
        </button>
      </div>
    </div>
  );
}

function CameraScreen({ onCapture, onSelectManual }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError("No se pudo acceder a la cámara. Usa el botón para subir una imagen.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    video.srcObject?.getTracks().forEach((t) => t.stop());
    onCapture(dataUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onCapture(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: "#000", position: "relative",
    }}>
      <div style={{
        padding: "16px 20px", display: "flex", alignItems: "center",
        gap: "12px", background: "rgba(0,0,0,0.6)", zIndex: 2,
        backdropFilter: "blur(10px)",
      }}>
        <Logo size={52} />
        <div>
          <span style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: "14px",
            color: "#fff", fontWeight: 600,
          }}>Escanear hablador</span>
          <p style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: "11px",
            color: "rgba(255,255,255,0.5)", margin: "2px 0 0",
          }}>Apunta al hablador del producto (Yogurt, Malteada o Mermelada)</p>
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!error && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
          />
        )}

        <div style={{
          position: "relative", zIndex: 1,
          width: "280px", height: "200px",
          border: `3px solid ${COLORS.tertiary}`,
          borderRadius: "16px",
          boxShadow: `0 0 0 9999px rgba(0,0,0,0.4), 0 0 30px rgba(255,113,45,0.3)`,
        }}>
          <div style={{
            position: "absolute", bottom: "-36px", left: "50%",
            transform: "translateX(-50%)", whiteSpace: "nowrap",
            fontFamily: "'Open Sans', sans-serif", fontSize: "12px",
            color: "rgba(255,255,255,0.9)", textAlign: "center",
            background: "rgba(0,0,0,0.6)", padding: "5px 14px",
            borderRadius: "8px",
          }}>
            Centra el hablador completo
          </div>
          <div style={{
            position: "absolute", left: "8px", right: "8px", height: "2px",
            background: COLORS.tertiary, borderRadius: "2px",
            animation: "scanLine 2s ease-in-out infinite",
            boxShadow: `0 0 10px ${COLORS.tertiary}`,
          }} />
        </div>

        {error && (
          <div style={{
            position: "relative", zIndex: 1, textAlign: "center",
            padding: "24px", color: "#fff",
          }}>
            <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
              {error}
            </p>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      <div style={{
        padding: "20px 24px 36px", display: "flex",
        alignItems: "center", justifyContent: "center", gap: "20px",
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", zIndex: 2,
      }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: "50px", height: "50px", borderRadius: "50%",
            background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)",
            color: "#fff", fontSize: "20px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          🖼️
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileUpload} />

        {cameraActive && (
          <button
            onClick={takePhoto}
            style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: COLORS.gradient2, border: "4px solid rgba(255,255,255,0.9)",
              cursor: "pointer", boxShadow: "0 4px 20px rgba(255,113,45,0.5)",
              transition: "transform 0.15s",
            }}
            onMouseDown={(e) => e.target.style.transform = "scale(0.9)"}
            onMouseUp={(e) => e.target.style.transform = "scale(1)"}
          />
        )}

        <button
          onClick={onSelectManual}
          style={{
            width: "50px", height: "50px", borderRadius: "50%",
            background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)",
            color: "#fff", fontSize: "20px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          📋
        </button>
      </div>

      <style>{`
        @keyframes scanLine {
          0%, 100% { top: 8px; opacity: 0.4; }
          50% { top: calc(100% - 10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// MANUAL SELECT — Ahora con tabs: Productos demo + Materias primas
// ============================================================
function ManualSelect({ onSelectProducto, onSelectMateria, onBack }) {
  const [tab, setTab] = useState("productos"); // 'productos' | 'materias'
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("Todos");

  const productosKeys = Object.keys(PRODUCTOS_DEMO);
  const allKeys = Object.keys(MATERIAS_PRIMAS_DB);
  const keys = allKeys.filter((k) => {
    const item = MATERIAS_PRIMAS_DB[k];
    const matchSearch = k.toLowerCase().includes(search.toLowerCase()) ||
                        item.categoria.toLowerCase().includes(search.toLowerCase());
    const matchFilter = productFilter === "Todos" ||
                        (productFilter === "Yogur" && item.enYogur) ||
                        (productFilter === "Shake" && item.enShake) ||
                        (productFilter === "Mermelada" && item.enMermelada);
    return matchSearch && matchFilter;
  });

  const filters = [
    { id: "Todos", label: "Todos", icon: "📋", count: allKeys.length },
    { id: "Yogur", label: "Yogur", icon: "🥛", count: allKeys.filter((k) => MATERIAS_PRIMAS_DB[k].enYogur).length },
    { id: "Shake", label: "Shake", icon: "💪", count: allKeys.filter((k) => MATERIAS_PRIMAS_DB[k].enShake).length },
    { id: "Mermelada", label: "Mermelada", icon: "🍓", count: allKeys.filter((k) => MATERIAS_PRIMAS_DB[k].enMermelada).length },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg, padding: "0 0 40px",
    }}>
      <div style={{
        background: COLORS.gradient1, padding: "20px 20px 20px",
        borderRadius: "0 0 28px 28px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.15)", border: "none",
            color: "#fff", width: "36px", height: "36px", borderRadius: "50%",
            fontSize: "18px", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>←</button>
          <span style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: "16px",
            color: "#fff", fontWeight: 600,
          }}>Selección manual</span>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", background: "rgba(255,255,255,0.1)",
          borderRadius: "12px", padding: "4px", gap: "4px",
        }}>
          <button
            onClick={() => setTab("productos")}
            style={{
              flex: 1, padding: "10px", borderRadius: "9px", border: "none",
              fontFamily: "'Open Sans', sans-serif", fontSize: "13px",
              fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
              background: tab === "productos" ? "#fff" : "transparent",
              color: tab === "productos" ? COLORS.secondary : "#fff",
            }}
          >
            📦 Productos demo
          </button>
          <button
            onClick={() => setTab("materias")}
            style={{
              flex: 1, padding: "10px", borderRadius: "9px", border: "none",
              fontFamily: "'Open Sans', sans-serif", fontSize: "13px",
              fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
              background: tab === "materias" ? "#fff" : "transparent",
              color: tab === "materias" ? COLORS.secondary : "#fff",
            }}
          >
            🧪 Materias primas
          </button>
        </div>

        {tab === "materias" && (
          <>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar materia prima..."
              style={{
                width: "100%", padding: "14px 18px", borderRadius: "14px",
                border: "none", fontSize: "14px", fontFamily: "'Open Sans', sans-serif",
                outline: "none", boxSizing: "border-box", margin: "12px 0",
                background: "rgba(255,255,255,0.95)",
              }}
            />
            <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setProductFilter(f.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 14px", borderRadius: "20px", border: "none",
                    fontFamily: "'Open Sans', sans-serif", fontSize: "12px",
                    fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                    transition: "all 0.2s",
                    background: productFilter === f.id ? COLORS.gradient2 : "rgba(255,255,255,0.15)",
                    color: "#fff",
                    boxShadow: productFilter === f.id ? "0 4px 12px rgba(255,113,45,0.4)" : "none",
                  }}
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                  <span style={{
                    background: "rgba(255,255,255,0.25)", padding: "1px 7px",
                    borderRadius: "10px", fontSize: "10px",
                  }}>{f.count}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CONTENIDO: Productos */}
      {tab === "productos" && (
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {productosKeys.map((key, i) => {
            const prod = PRODUCTOS_DEMO[key];
            const totalMaterias = prod.grupos.reduce((acc, g) => acc + g.materiasPrimas.length, 0);
            return (
              <button
                key={key}
                onClick={() => onSelectProducto(key)}
                style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  background: COLORS.cardBg, border: "none", padding: "18px",
                  borderRadius: "18px", cursor: "pointer", textAlign: "left",
                  boxShadow: "0 4px 14px rgba(26,40,110,0.08)",
                  transition: "all 0.2s",
                  borderLeft: `5px solid ${prod.colorAcento}`,
                  animation: "slideUp 0.4s ease forwards",
                  animationDelay: `${i * 0.08}s`,
                  opacity: 0,
                }}
              >
                <span style={{ fontSize: "44px", flexShrink: 0 }}>{prod.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "20px", color: prod.colorPrimario, fontWeight: 700,
                    lineHeight: 1.1,
                  }}>{prod.titulo}</div>
                  <div style={{
                    fontFamily: "'Open Sans', sans-serif", fontSize: "13px",
                    color: prod.colorAcento, fontWeight: 600, marginTop: "2px",
                  }}>{prod.subtitulo}</div>
                  <div style={{
                    fontFamily: "'Open Sans', sans-serif", fontSize: "11px",
                    color: COLORS.textLight, marginTop: "6px",
                  }}>{totalMaterias} materias primas · {prod.grupos.length} grupos funcionales</div>
                </div>
                <span style={{ color: COLORS.tertiary, fontSize: "20px", fontWeight: 700 }}>→</span>
              </button>
            );
          })}
        </div>
      )}

      {/* CONTENIDO: Materias primas */}
      {tab === "materias" && (
        <>
          {keys.length === 0 && (
            <div style={{
              padding: "40px 20px", textAlign: "center",
              fontFamily: "'Open Sans', sans-serif", color: COLORS.textLight,
            }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
              <div style={{ fontSize: "14px" }}>No se encontraron resultados</div>
            </div>
          )}
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {keys.map((key, i) => {
              const item = MATERIAS_PRIMAS_DB[key];
              return (
                <button
                  key={key}
                  onClick={() => onSelectMateria(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    background: COLORS.cardBg, border: "none", padding: "14px 16px",
                    borderRadius: "16px", cursor: "pointer", textAlign: "left",
                    boxShadow: "0 2px 8px rgba(26,40,110,0.06)",
                    transition: "all 0.2s",
                    animation: `slideUp 0.4s ease forwards`,
                    animationDelay: `${Math.min(i * 0.03, 0.5)}s`,
                    opacity: 0,
                  }}
                >
                  <span style={{ fontSize: "26px", flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: "'Open Sans', sans-serif", fontSize: "13px",
                      color: COLORS.secondary, fontWeight: 700,
                    }}>{key}</div>
                    <div style={{
                      fontFamily: "'Open Sans', sans-serif", fontSize: "10px",
                      color: COLORS.textLight, marginTop: "2px",
                    }}>{item.categoria}</div>
                  </div>
                  <div style={{ display: "flex", gap: "4px", marginRight: "4px" }}>
                    {item.enYogur && (
                      <span style={{
                        fontSize: "9px", padding: "2px 6px", borderRadius: "8px",
                        background: "rgba(26,40,110,0.1)", color: COLORS.secondary,
                        fontWeight: 700,
                      }}>🥛</span>
                    )}
                    {item.enShake && (
                      <span style={{
                        fontSize: "9px", padding: "2px 6px", borderRadius: "8px",
                        background: "rgba(255,113,45,0.1)", color: COLORS.tertiary,
                        fontWeight: 700,
                      }}>💪</span>
                    )}
                    {item.enMermelada && (
                      <span style={{
                        fontSize: "9px", padding: "2px 6px", borderRadius: "8px",
                        background: "rgba(233,30,99,0.1)", color: "#e91e63",
                        fontWeight: 700,
                      }}>🍓</span>
                    )}
                  </div>
                  <span style={{ color: COLORS.tertiary, fontSize: "16px" }}>→</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function ProcessingScreen({ image }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "32px",
      background: COLORS.gradient1,
    }}>
      <div style={{ position: "relative", marginBottom: "32px" }}>
        {image && (
          <img src={image} alt="captured" style={{
            width: "200px", height: "140px", objectFit: "cover",
            borderRadius: "16px", border: "3px solid rgba(255,255,255,0.2)",
          }} />
        )}
        <div style={{
          position: "absolute", inset: "-8px", borderRadius: "24px",
          border: `3px solid ${COLORS.tertiary}`,
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
      </div>
      <div style={{
        width: "48px", height: "48px", border: "4px solid rgba(255,255,255,0.2)",
        borderTopColor: COLORS.tertiary, borderRadius: "50%",
        animation: "spin 0.8s linear infinite", marginBottom: "20px",
      }} />
      <p style={{
        fontFamily: "'Open Sans', sans-serif", fontSize: "16px",
        color: "#fff", fontWeight: 600, margin: "0 0 8px",
      }}>Analizando imagen...</p>
      <p style={{
        fontFamily: "'Open Sans', sans-serif", fontSize: "13px",
        color: "rgba(255,255,255,0.5)",
      }}>Identificando producto con IA</p>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// PRODUCTO DEMO SCREEN — Nueva pantalla principal
// ============================================================
function ProductoDemoScreen({ productoKey, onScanAgain, onContact, onSelectMateria }) {
  const data = PRODUCTOS_DEMO[productoKey];
  if (!data) return null;

  const totalMaterias = data.grupos.reduce((acc, g) => acc + g.materiasPrimas.length, 0);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, paddingBottom: "100px" }}>
      {/* Hero Header con color del producto */}
      <div style={{
        background: `linear-gradient(135deg, ${data.colorPrimario} 0%, ${data.colorAcento} 100%)`,
        padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-40px", right: "-40px", width: "200px",
          height: "200px", borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", position: "relative", zIndex: 1 }}>
          <Logo size={52} />
          <span style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: "11px",
            color: "rgba(255,255,255,0.7)", letterSpacing: "2px",
            textTransform: "uppercase",
          }}>Factores & Mercadeo</span>
        </div>

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "8px 0 16px" }}>
          <div style={{ fontSize: "64px", marginBottom: "8px" }}>{data.icon}</div>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(36px, 9vw, 52px)", color: "#fff",
            margin: "0", fontWeight: 700, lineHeight: 1,
            textShadow: "0 2px 12px rgba(0,0,0,0.15)",
          }}>{data.titulo}</h1>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(20px, 5vw, 28px)",
            color: "rgba(255,255,255,0.9)",
            margin: "4px 0 0", fontWeight: 400, fontStyle: "italic",
          }}>{data.subtitulo}</div>
        </div>

        <p style={{
          fontFamily: "'Open Sans', sans-serif", fontSize: "13px",
          color: "rgba(255,255,255,0.85)", margin: "16px 0 0", lineHeight: 1.5,
          position: "relative", zIndex: 1, textAlign: "center",
        }}>{data.descripcion}</p>

        {/* Stats */}
        <div style={{
          display: "flex", justifyContent: "center", gap: "24px",
          marginTop: "20px", position: "relative", zIndex: 1,
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "32px", color: "#fff", fontWeight: 700,
            }}>{totalMaterias}</div>
            <div style={{
              fontFamily: "'Open Sans', sans-serif", fontSize: "10px",
              color: "rgba(255,255,255,0.7)", textTransform: "uppercase",
              letterSpacing: "1.5px",
            }}>Materias primas</div>
          </div>
          <div style={{ width: "1px", background: "rgba(255,255,255,0.2)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "32px", color: "#fff", fontWeight: 700,
            }}>{data.grupos.length}</div>
            <div style={{
              fontFamily: "'Open Sans', sans-serif", fontSize: "10px",
              color: "rgba(255,255,255,0.7)", textTransform: "uppercase",
              letterSpacing: "1.5px",
            }}>Grupos funcionales</div>
          </div>
        </div>
      </div>

      {/* Intro */}
      <div style={{ padding: "20px 20px 4px" }}>
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "20px", color: COLORS.secondary,
          margin: "0 0 6px", fontWeight: 700,
        }}>Composición F&M</h2>
        <p style={{
          fontFamily: "'Open Sans', sans-serif", fontSize: "13px",
          color: COLORS.textLight, margin: 0, lineHeight: 1.5,
        }}>
          Toca cualquier materia prima para ver todos los productos donde se puede aplicar.
        </p>
      </div>

      {/* Grupos */}
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {data.grupos.map((grupo, gi) => (
          <div key={gi} style={{
            background: COLORS.cardBg, borderRadius: "18px",
            padding: "18px", boxShadow: "0 2px 10px rgba(26,40,110,0.06)",
            animation: "slideUp 0.5s ease forwards",
            animationDelay: `${gi * 0.08}s`,
            opacity: 0,
          }}>
            {/* Header del grupo */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "12px",
                background: `linear-gradient(135deg, ${data.colorPrimario}15 0%, ${data.colorAcento}25 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", flexShrink: 0,
              }}>{grupo.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{
                  fontFamily: "'Open Sans', sans-serif", fontSize: "15px",
                  color: COLORS.secondary, margin: "0 0 3px", fontWeight: 700,
                }}>{grupo.titulo}</h3>
                <p style={{
                  fontFamily: "'Open Sans', sans-serif", fontSize: "12px",
                  color: COLORS.textLight, margin: 0, lineHeight: 1.4,
                }}>{grupo.descripcion}</p>
              </div>
            </div>

            {/* Materias primas del grupo */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {grupo.materiasPrimas.map((mpKey) => {
                const mp = MATERIAS_PRIMAS_DB[mpKey];
                if (!mp) return null;
                return (
                  <button
                    key={mpKey}
                    onClick={() => onSelectMateria(mpKey)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      background: "#f8f9fc", border: "none",
                      padding: "12px 14px", borderRadius: "12px",
                      cursor: "pointer", textAlign: "left", width: "100%",
                      transition: "all 0.2s",
                      borderLeft: `3px solid ${data.colorAcento}`,
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#eff1f7"}
                    onMouseOut={(e) => e.currentTarget.style.background = "#f8f9fc"}
                  >
                    <span style={{ fontSize: "22px", flexShrink: 0 }}>{mp.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "'Open Sans', sans-serif", fontSize: "13px",
                        color: COLORS.secondary, fontWeight: 700,
                      }}>{mpKey}</div>
                      <div style={{
                        fontFamily: "'Open Sans', sans-serif", fontSize: "11px",
                        color: COLORS.textLight, marginTop: "2px",
                        overflow: "hidden", textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>{mp.beneficio}</div>
                    </div>
                    <span style={{
                      color: data.colorAcento, fontSize: "16px",
                      fontWeight: 700, flexShrink: 0,
                    }}>→</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "16px 20px", display: "flex", gap: "10px",
        background: "rgba(240,242,247,0.95)", backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(26,40,110,0.06)",
      }}>
        <button
          onClick={onScanAgain}
          style={{
            flex: 1, padding: "14px", borderRadius: "14px",
            border: `2px solid ${COLORS.secondary}`, background: "transparent",
            color: COLORS.secondary, fontSize: "13px", fontWeight: 700,
            fontFamily: "'Open Sans', sans-serif", cursor: "pointer",
          }}
        >
          📸 Escanear otro
        </button>
        <button
          onClick={onContact}
          style={{
            flex: 1, padding: "14px", borderRadius: "14px",
            border: "none", background: COLORS.gradient2,
            color: "#fff", fontSize: "13px", fontWeight: 700,
            fontFamily: "'Open Sans', sans-serif", cursor: "pointer",
            boxShadow: "0 4px 15px rgba(255,113,45,0.3)",
          }}
        >
          💬 Contáctanos
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// RESULTS SCREEN — Materia prima individual (sin cambios mayores)
// ============================================================
function ResultsScreen({ materiaPrima, onScanAgain, onContact, onBack }) {
  const [filter, setFilter] = useState("Todos");
  const data = MATERIAS_PRIMAS_DB[materiaPrima];
  if (!data) return null;

  const tipos = ["Todos", ...new Set(data.productos.map((p) => p.tipo))];
  const filtered = filter === "Todos" ? data.productos : data.productos.filter((p) => p.tipo === filter);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, paddingBottom: "100px" }}>
      <div style={{
        background: COLORS.gradient1, padding: "20px 20px 32px",
        borderRadius: "0 0 32px 32px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-40px", right: "-40px", width: "160px",
          height: "160px", borderRadius: "50%",
          background: "rgba(255,113,45,0.1)",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          {onBack && (
            <button onClick={onBack} style={{
              background: "rgba(255,255,255,0.15)", border: "none",
              color: "#fff", width: "36px", height: "36px", borderRadius: "50%",
              fontSize: "18px", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>←</button>
          )}
          <Logo size={52} />
          <span style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: "11px",
            color: "rgba(255,255,255,0.6)", letterSpacing: "2px",
            textTransform: "uppercase",
          }}>Factores & Mercadeo</span>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.08)", borderRadius: "20px",
          padding: "20px", backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "36px" }}>{data.icon}</span>
            <div>
              <span style={{
                fontFamily: "'Open Sans', sans-serif", fontSize: "10px",
                color: COLORS.tertiary, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "1.5px",
              }}>{data.categoria}</span>
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(22px, 5vw, 30px)", color: "#fff",
                margin: "4px 0 0", fontWeight: 700,
              }}>{materiaPrima}</h1>
            </div>
          </div>
          <p style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: "13px",
            color: "rgba(255,255,255,0.6)", margin: "12px 0 0", lineHeight: 1.5,
          }}>{data.descripcion}</p>

          {(data.enYogur || data.enShake || data.enMermelada) && (
            <div style={{
              display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap",
            }}>
              {data.enYogur && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: `linear-gradient(135deg, ${COLORS.tertiary} 0%, #ff9a5c 100%)`,
                  padding: "6px 12px", borderRadius: "20px",
                  boxShadow: "0 4px 12px rgba(255,113,45,0.3)",
                }}>
                  <span style={{ fontSize: "14px" }}>🥛</span>
                  <span style={{
                    fontFamily: "'Open Sans', sans-serif", fontSize: "11px",
                    color: "#fff", fontWeight: 700, letterSpacing: "0.3px",
                  }}>EN NUESTRO YOGUR</span>
                </div>
              )}
              {data.enShake && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: `linear-gradient(135deg, ${COLORS.tertiary} 0%, #ff9a5c 100%)`,
                  padding: "6px 12px", borderRadius: "20px",
                  boxShadow: "0 4px 12px rgba(255,113,45,0.3)",
                }}>
                  <span style={{ fontSize: "14px" }}>💪</span>
                  <span style={{
                    fontFamily: "'Open Sans', sans-serif", fontSize: "11px",
                    color: "#fff", fontWeight: 700, letterSpacing: "0.3px",
                  }}>EN NUESTRO SHAKE</span>
                </div>
              )}
              {data.enMermelada && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: `linear-gradient(135deg, ${COLORS.tertiary} 0%, #ff9a5c 100%)`,
                  padding: "6px 12px", borderRadius: "20px",
                  boxShadow: "0 4px 12px rgba(255,113,45,0.3)",
                }}>
                  <span style={{ fontSize: "14px" }}>🍓</span>
                  <span style={{
                    fontFamily: "'Open Sans', sans-serif", fontSize: "11px",
                    color: "#fff", fontWeight: 700, letterSpacing: "0.3px",
                  }}>EN NUESTRA MERMELADA</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {data.beneficio && (
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{
            background: COLORS.cardBg, borderRadius: "16px",
            padding: "16px 18px", display: "flex",
            alignItems: "flex-start", gap: "12px",
            borderLeft: `4px solid ${COLORS.tertiary}`,
            boxShadow: "0 2px 8px rgba(26,40,110,0.06)",
          }}>
            <span style={{ fontSize: "22px", lineHeight: 1 }}>💡</span>
            <div>
              <div style={{
                fontFamily: "'Open Sans', sans-serif", fontSize: "10px",
                color: COLORS.tertiary, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "1.5px", marginBottom: "3px",
              }}>Beneficio Clave</div>
              <div style={{
                fontFamily: "'Open Sans', sans-serif", fontSize: "13px",
                color: COLORS.secondary, lineHeight: 1.5, fontWeight: 500,
              }}>{data.beneficio}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "36px", fontWeight: 700, color: COLORS.tertiary,
          }}>{data.productos.length}</span>
          <span style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: "14px",
            color: COLORS.secondary, fontWeight: 600,
          }}>productos en {new Set(data.productos.map(p => p.tipo)).size} industrias</span>
        </div>
      </div>

      <div style={{
        display: "flex", gap: "8px", padding: "16px 20px",
        overflowX: "auto",
      }}>
        {tipos.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: "8px 18px", borderRadius: "30px",
              border: "none", fontSize: "12px", fontWeight: 600,
              fontFamily: "'Open Sans', sans-serif", cursor: "pointer",
              whiteSpace: "nowrap", transition: "all 0.2s",
              background: filter === t ? COLORS.gradient2 : COLORS.cardBg,
              color: filter === t ? "#fff" : COLORS.secondary,
              boxShadow: filter === t ? "0 4px 12px rgba(255,113,45,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: "4px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map((prod, i) => {
          const typeColors = {
            "Lácteos": { main: "#1a286e", bg: "rgba(26,40,110,0.08)" },
            "Cárnicos": { main: "#ff712d", bg: "rgba(255,113,45,0.08)" },
            "Panadería": { main: "#d4a04c", bg: "rgba(212,160,76,0.1)" },
            "Bebidas": { main: "#2196f3", bg: "rgba(33,150,243,0.08)" },
            "Confitería": { main: "#e91e63", bg: "rgba(233,30,99,0.08)" },
            "Nutracéuticos": { main: "#10b981", bg: "rgba(16,185,129,0.08)" },
            "Farmacéutico": { main: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
            "Cosmética": { main: "#ec4899", bg: "rgba(236,72,153,0.08)" },
            "Cuidado personal": { main: "#06b6d4", bg: "rgba(6,182,212,0.08)" },
            "Vegetales": { main: "#84cc16", bg: "rgba(132,204,22,0.1)" },
            "Salsas": { main: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
          };
          const c = typeColors[prod.tipo] || { main: "#6b7280", bg: "rgba(107,114,128,0.08)" };
          return (
            <div
              key={prod.nombre + i}
              style={{
                display: "flex", alignItems: "center", gap: "14px",
                background: COLORS.cardBg, padding: "16px 18px",
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(26,40,110,0.05)",
                animation: `slideUp 0.5s ease forwards`,
                animationDelay: `${i * 0.05}s`,
                opacity: 0,
                borderLeft: `4px solid ${c.main}`,
              }}
            >
              <span style={{ fontSize: "30px" }}>{prod.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Open Sans', sans-serif", fontSize: "14px",
                  color: COLORS.secondary, fontWeight: 700,
                }}>{prod.nombre}</div>
                <span style={{
                  fontFamily: "'Open Sans', sans-serif", fontSize: "10px",
                  color: c.main, textTransform: "uppercase",
                  letterSpacing: "1px", fontWeight: 600,
                }}>{prod.tipo}</span>
              </div>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: c.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", color: c.main,
                fontWeight: 700, fontFamily: "'Open Sans', sans-serif",
              }}>
                F&M
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "16px 20px", display: "flex", gap: "10px",
        background: "rgba(240,242,247,0.95)", backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(26,40,110,0.06)",
      }}>
        <button
          onClick={onScanAgain}
          style={{
            flex: 1, padding: "14px", borderRadius: "14px",
            border: `2px solid ${COLORS.secondary}`, background: "transparent",
            color: COLORS.secondary, fontSize: "13px", fontWeight: 700,
            fontFamily: "'Open Sans', sans-serif", cursor: "pointer",
          }}
        >
          📸 Escanear otro
        </button>
        <button
          onClick={onContact}
          style={{
            flex: 1, padding: "14px", borderRadius: "14px",
            border: "none", background: COLORS.gradient2,
            color: "#fff", fontSize: "13px", fontWeight: 700,
            fontFamily: "'Open Sans', sans-serif", cursor: "pointer",
            boxShadow: "0 4px 15px rgba(255,113,45,0.3)",
          }}
        >
          💬 Contáctanos
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function ContactScreen({ onBack }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "24px",
      background: COLORS.gradient1,
    }}>
      <ParticleBackground />
      <div style={{
        background: "rgba(255,255,255,0.95)", borderRadius: "24px",
        padding: "36px 28px", maxWidth: "380px", width: "100%",
        textAlign: "center", position: "relative", zIndex: 1,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <Logo size={120} />
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "22px", color: COLORS.secondary,
          margin: "20px 0 8px", fontWeight: 700,
        }}>¡Hablemos!</h2>
        <p style={{
          fontFamily: "'Open Sans', sans-serif", fontSize: "13px",
          color: COLORS.textLight, lineHeight: 1.6, margin: "0 0 24px",
        }}>
          Nuestro equipo comercial está listo para ayudarte a encontrar el ingrediente perfecto para tu producto.
        </p>

        {[
          { icon: "🌐", label: "www.factoresymercadeo.com", href: "https://www.factoresymercadeo.com" },
          { icon: "📧", label: "marketing@factoresymercadeo.com", href: "mailto:marketing@factoresymercadeo.com" },
          { icon: "📅", label: "Agenda una reunión 1:1", href: "https://calendly.com/marketingfactoresymercadeo/30min" },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href || "#"}
            target={item.href ? "_blank" : undefined}
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "14px 16px", background: "#f8f9fc",
              borderRadius: "12px", marginBottom: "10px",
              textDecoration: "none", transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: "20px" }}>{item.icon}</span>
            <span style={{
              fontFamily: "'Open Sans', sans-serif", fontSize: "13px",
              color: COLORS.secondary, fontWeight: 500,
            }}>{item.label}</span>
          </a>
        ))}

        <button
          onClick={onBack}
          style={{
            width: "100%", padding: "14px", borderRadius: "14px",
            border: "none", background: COLORS.gradient2,
            color: "#fff", fontSize: "14px", fontWeight: 700,
            fontFamily: "'Open Sans', sans-serif", cursor: "pointer",
            marginTop: "16px", boxShadow: "0 4px 15px rgba(255,113,45,0.3)",
          }}
        >
          ← Volver a escanear
        </button>
      </div>
    </div>
  );
}

// ============================================================
// NO RECONOCIDO SCREEN — feedback claro cuando la IA no identifica un hablador
// ============================================================
function NoReconocidoScreen({ image, onRetry, onManual, motivo }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "24px",
      background: COLORS.gradient1, position: "relative",
    }}>
      <ParticleBackground />
      <div style={{
        background: "rgba(255,255,255,0.97)", borderRadius: "24px",
        padding: "32px 24px", maxWidth: "400px", width: "100%",
        textAlign: "center", position: "relative", zIndex: 1,
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}>
        {/* Foto que tomó el usuario */}
        {image && (
          <div style={{
            position: "relative", display: "inline-block",
            marginBottom: "20px",
          }}>
            <img src={image} alt="captured" style={{
              width: "180px", height: "130px", objectFit: "cover",
              borderRadius: "14px", border: "3px solid #fbbf24",
              boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
            }} />
            <div style={{
              position: "absolute", top: "-10px", right: "-10px",
              background: "#f59e0b", width: "36px", height: "36px",
              borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "20px",
              boxShadow: "0 4px 12px rgba(245,158,11,0.4)",
            }}>⚠️</div>
          </div>
        )}

        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "22px", color: COLORS.secondary,
          margin: "0 0 10px", fontWeight: 700, lineHeight: 1.2,
        }}>
          No pudimos identificar este hablador
        </h2>

        <p style={{
          fontFamily: "'Open Sans', sans-serif", fontSize: "13px",
          color: COLORS.textLight, margin: "0 0 20px", lineHeight: 1.55,
        }}>
          {motivo === "error"
            ? "Hubo un problema procesando la imagen. Intenta de nuevo o explora los productos manualmente."
            : "Apunta la cámara directamente al hablador de un producto F&M (Yogurt, Malteada o Mermelada) para que pueda reconocerlo."}
        </p>

        {/* Tips para mejor escaneo */}
        <div style={{
          background: "#f8f9fc", borderRadius: "14px",
          padding: "14px 16px", textAlign: "left", marginBottom: "20px",
          borderLeft: `3px solid ${COLORS.tertiary}`,
        }}>
          <div style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: "10px",
            color: COLORS.tertiary, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "1.5px",
            marginBottom: "8px",
          }}>💡 Tips para escanear bien</div>
          {[
            "Centra el hablador completo dentro del marco",
            "Buena iluminación, sin sombras fuertes",
            "Sostén el celular firme y derecho",
            "Acércate hasta que ocupe casi toda la pantalla",
          ].map((tip, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: "8px",
              fontFamily: "'Open Sans', sans-serif", fontSize: "12px",
              color: COLORS.secondary, lineHeight: 1.5,
              marginBottom: i < 3 ? "5px" : 0,
            }}>
              <span style={{ color: COLORS.tertiary, fontWeight: 700 }}>•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onRetry}
          style={{
            width: "100%", padding: "14px", borderRadius: "14px",
            border: "none", background: COLORS.gradient2,
            color: "#fff", fontSize: "15px", fontWeight: 700,
            fontFamily: "'Open Sans', sans-serif", cursor: "pointer",
            marginBottom: "10px",
            boxShadow: "0 4px 15px rgba(255,113,45,0.3)",
          }}
        >
          📸 Intentar de nuevo
        </button>

        <button
          onClick={onManual}
          style={{
            width: "100%", padding: "14px", borderRadius: "14px",
            border: `2px solid ${COLORS.secondary}`,
            background: "transparent",
            color: COLORS.secondary, fontSize: "14px", fontWeight: 700,
            fontFamily: "'Open Sans', sans-serif", cursor: "pointer",
          }}
        >
          📋 Explorar productos manualmente
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [capturedImage, setCapturedImage] = useState(null);
  const [resultProducto, setResultProducto] = useState(null);
  const [resultMateria, setResultMateria] = useState(null);
  const [previousScreen, setPreviousScreen] = useState(null);
  const [leadData, setLeadData] = useState(null);

  // Reconocimiento con IA — SOLO acepta uno de los 3 habladores oficiales del stand.
  // Cualquier otra cosa va a la pantalla "No reconocido" con feedback claro al usuario.
  const handleCapture = async (imageDataUrl) => {
    setCapturedImage(imageDataUrl);
    setScreen("processing");

    try {
      const base64Data = imageDataUrl.split(",")[1];
      const mediaType = imageDataUrl.split(";")[0].split(":")[1] || "image/jpeg";

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 30,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64Data },
              },
              {
                type: "text",
                text: `Eres un clasificador estricto de habladores en el stand de Factores & Mercadeo S.A.

Tu única tarea: identificar si la imagen muestra UNO de estos 3 habladores oficiales del stand y NINGÚN otro objeto.

LOS 3 HABLADORES OFICIALES (todos comparten: fondo blanco con triángulos geométricos azul/beige/dorado, logo F&M ovalado a la izquierda, código QR con texto "SCAN ME" en la esquina superior derecha, e ilustración del producto centrado):

1. YOGURT_VAINILLA — título "Yogurt" en azul oscuro tipo serif + subtítulo "Vainilla" + ilustración de un vaso de yogurt blanco con una flor de vainilla.

2. MALTEADA_CHOCOLATE — título "Malteada" en cursiva marrón + subtítulo "Chocolate" + ilustración de un batido/milkshake de chocolate marrón.

3. MERMELADA_FRESA — título "Mermelada" en cursiva roja/rosa + subtítulo "Fresa" + ilustración de un frasco con mermelada roja y fresas frescas.

REGLAS DE DECISIÓN — SÉ EXTREMADAMENTE ESTRICTO:
- Solo responde con uno de los 3 códigos si ves CLARAMENTE el hablador completo y reconoces el título y la ilustración. Si tienes dudas, responde NO_IDENTIFICADO.
- Si la imagen muestra cualquier otra cosa (un objeto cualquiera, una persona, un alimento real, un envase comercial, un papel suelto, una pantalla, un escritorio, etc.), responde NO_IDENTIFICADO.
- Si la imagen está borrosa, mal iluminada, recortada, o no se ve el título del producto, responde NO_IDENTIFICADO.
- Si solo ves el logo F&M pero no identificas cuál de los 3 productos, responde NO_IDENTIFICADO.
- NO inventes ni adivines. Mejor responder NO_IDENTIFICADO que equivocarse.

FORMATO DE RESPUESTA — responde EXACTAMENTE una de estas 4 palabras, sin nada más:
YOGURT_VAINILLA
MALTEADA_CHOCOLATE
MERMELADA_FRESA
NO_IDENTIFICADO`,
              },
            ],
          }],
        }),
      });

      const data = await response.json();
      const aiText = (data.content?.[0]?.text || "").trim().toUpperCase();
      console.log("AI Detected:", aiText);

      // Solo aceptamos match exacto contra uno de los 3 códigos canónicos
      const producto = findProductoDemo(aiText);
      if (producto) {
        if (leadData) {
          saveLead({ ...leadData, productoEscaneado: producto.nombre, evento: "scan_producto" }).catch(() => {});
        }
        setResultProducto(producto.key);
        setScreen("productoDemo");
        return;
      }

      // Cualquier otra cosa (incluido NO_IDENTIFICADO) → pantalla de no reconocido
      if (leadData) {
        saveLead({ ...leadData, evento: "scan_no_reconocido" }).catch(() => {});
      }
      setScreen("noReconocido");
    } catch (err) {
      console.error("AI Error:", err);
      setScreen("noReconocido");
    }
  };

  const handleSelectProductoManual = (key) => {
    if (leadData) {
      saveLead({ ...leadData, productoEscaneado: PRODUCTOS_DEMO[key].nombre, evento: "manual_producto" }).catch(() => {});
    }
    setResultProducto(key);
    setPreviousScreen("manual");
    setScreen("productoDemo");
  };

  const handleSelectMateriaManual = (key) => {
    if (leadData) {
      saveLead({ ...leadData, materiaEscaneada: key, evento: "manual_materia" }).catch(() => {});
    }
    setResultMateria(key);
    setPreviousScreen(screen);
    setScreen("results");
  };

  const handleLeadSubmit = (data) => {
    setLeadData(data);
    setScreen("camera");
  };

  return (
    <>
      {screen === "welcome" && <WelcomeScreen onStart={() => setScreen("lead")} />}
      {screen === "lead" && <LeadCapture onSubmit={handleLeadSubmit} />}
      {screen === "camera" && (
        <CameraScreen
          onCapture={handleCapture}
          onSelectManual={() => setScreen("manual")}
        />
      )}
      {screen === "manual" && (
        <ManualSelect
          onSelectProducto={handleSelectProductoManual}
          onSelectMateria={handleSelectMateriaManual}
          onBack={() => setScreen("camera")}
        />
      )}
      {screen === "processing" && <ProcessingScreen image={capturedImage} />}
      {screen === "noReconocido" && (
        <NoReconocidoScreen
          image={capturedImage}
          onRetry={() => { setCapturedImage(null); setScreen("camera"); }}
          onManual={() => setScreen("manual")}
        />
      )}
      {screen === "productoDemo" && resultProducto && (
        <ProductoDemoScreen
          productoKey={resultProducto}
          onScanAgain={() => { setResultProducto(null); setScreen("camera"); }}
          onContact={() => setScreen("contact")}
          onSelectMateria={handleSelectMateriaManual}
        />
      )}
      {screen === "results" && resultMateria && (
        <ResultsScreen
          materiaPrima={resultMateria}
          onScanAgain={() => { setResultMateria(null); setScreen("camera"); }}
          onContact={() => setScreen("contact")}
          onBack={previousScreen === "productoDemo" ? (() => setScreen("productoDemo")) : (() => setScreen("manual"))}
        />
      )}
      {screen === "contact" && <ContactScreen onBack={() => setScreen("camera")} />}
    </>
  );
}
