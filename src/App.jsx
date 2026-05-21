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

// Logo oficial de Factores & Mercadeo S.A. — PNG inline (transparente)
const FM_LOGO_DATA_URI = "data:image/png;base64,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";

function Logo({ size = 80 }) {
  return (
    <img
      src={FM_LOGO_DATA_URI}
      alt="Factores & Mercadeo S.A."
      width={size}
      height={size}
      style={{
        display: "block",
        width: size,
        height: size,
        objectFit: "contain",
        filter: "drop-shadow(0 2px 8px rgba(26,40,110,0.25))",
        flexShrink: 0,
      }}
    />
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
          max_tokens: 50,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64Data },
              },
              {
                type: "text",
                text: `Identifica si la imagen muestra uno de estos 3 habladores publicitarios del stand de Factores & Mercadeo S.A.

Todos los habladores tienen estos elementos en común:
- Fondo blanco decorado con triángulos geométricos en azul oscuro, beige claro y dorado.
- Logo ovalado plateado/azul de "F&M / Factores & Mercadeo S.A." en la zona izquierda.
- Un código QR cuadrado con la etiqueta "SCAN ME" en la esquina superior derecha.
- Título grande del producto en tipografía decorativa.

LOS 3 HABLADORES — usa el título visible para distinguirlos:

1. YOGURT_VAINILLA — el título dice "Yogurt" (tipografía serif en azul oscuro) con subtítulo "Vainilla" debajo. La ilustración muestra un vaso/copa con yogurt blanco cremoso y una flor de vainilla beige.

2. MALTEADA_CHOCOLATE — el título dice "Malteada" en cursiva color marrón/café con subtítulo "Chocolate" debajo. La ilustración muestra un vaso/copa con un batido o milkshake marrón de chocolate (a veces con una mano sosteniéndolo), y puede incluir imágenes secundarias de una barra de chocolate o cocoa en polvo.

3. MERMELADA_FRESA — el título dice "Mermelada" en cursiva color rojo o rosa con subtítulo "Fresa" debajo. La ilustración muestra un frasco de vidrio con mermelada roja y fresas frescas alrededor.

INSTRUCCIONES:
- Si reconoces el título del producto Y el aspecto general del hablador (no necesita estar perfectamente nítido, basta con que se distinga el título y la temática), responde con el código correspondiente.
- Si la imagen muestra otra cosa completamente (un objeto cualquiera, una persona, una pantalla, comida real, un papel suelto, un envase comercial NO del hablador, etc.) responde NO_IDENTIFICADO.
- Si la imagen está tan borrosa o tan recortada que no se puede leer el título ni reconocer la temática del hablador, responde NO_IDENTIFICADO.

Responde EXACTAMENTE una sola palabra de estas opciones, sin nada más:
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
      console.log("[F&M] AI Detected:", aiText);

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
        saveLead({ ...leadData, evento: "scan_no_reconocido", aiResponse: aiText }).catch(() => {});
      }
      setScreen("noReconocido");
    } catch (err) {
      console.error("[F&M] AI Error:", err);
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
