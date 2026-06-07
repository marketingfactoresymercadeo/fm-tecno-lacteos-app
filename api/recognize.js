// ============================================================
// FM RECOGNIZE — Vercel Serverless Function (proxy a Anthropic)
// ============================================================
//
// Esta función vive en https://fm-tecno-lacteos-app.vercel.app/api/recognize
// Recibe una imagen del frontend, la reenvía al API de Anthropic con la
// API key del servidor (que NUNCA se expone al cliente), y devuelve el
// código del producto reconocido.
//
// Variable de entorno requerida:
//   ANTHROPIC_API_KEY — la key de console.anthropic.com
//
// Ver docs/SETUP_ANTHROPIC_API_KEY.md para la configuración.
// ============================================================

export const config = {
  api: {
    bodyParser: { sizeLimit: "10mb" },
  },
};

const PROMPT = `Identifica si la imagen muestra uno de estos 4 habladores publicitarios del stand de Factores & Mercadeo S.A.

Todos los habladores comparten estos elementos:
- Fondo blanco decorado con triángulos geométricos en azul oscuro, beige claro y dorado.
- Logo ovalado plateado/azul de "F&M / Factores & Mercadeo S.A.".
- Un elemento de escaneo en la zona superior derecha: puede ser un código QR con la etiqueta "SCAN ME", o el ícono de una mano sosteniendo un celular que escanea.
- Título grande del producto en tipografía decorativa. EL TÍTULO ES EL DATO MÁS CONFIABLE PARA DISTINGUIRLOS.

LOS 4 HABLADORES — distingue SIEMPRE por el TÍTULO visible y por el ENVASE/CONTENIDO, NO solo por el color:

1. YOGURT_VAINILLA — el título dice "Yogurt" (tipografía serif en azul oscuro) con subtítulo "Vainilla" debajo. La ilustración muestra un vaso/copa con yogurt blanco cremoso y una flor de vainilla beige.

2. MALTEADA_CHOCOLATE — el título dice "Malteada" en cursiva color marrón/café con subtítulo "Chocolate" debajo. La ilustración muestra un vaso/copa con un batido o milkshake marrón de chocolate (a veces con una mano sosteniéndolo), y puede incluir imágenes secundarias de una barra de chocolate o cocoa en polvo.

3. MERMELADA_FRESA — el título dice "Mermelada" en cursiva color rojo o rosa con subtítulo "Fresa" debajo (en ESPAÑOL). La ilustración muestra un FRASCO DE VIDRIO con mermelada roja y FRESAS FRESCAS REALES alrededor. La presencia del frasco de vidrio y de fruta real es la clave de este hablador.

4. GOMAS_PROBIOTICAS — el título normalmente dice "Probiotic Gummies" (en INGLÉS, tipografía gruesa de palo seco en color ROSADO/MAGENTA fuerte). En algunas versiones puede estar en ESPAÑOL ("Gomitas con Probióticos" / "Gomitas Probióticas", con la palabra "Naturales" como subtítulo). La ilustración muestra GOMITAS / GOMINOLAS de color rojo o rosado, redondas y cubiertas de azúcar, servidas en uno o varios tazones/recipientes (bowl blanco, plato oscuro) y/o sueltas — NO hay frasco de vidrio ni fruta fresca real, son dulces de goma. Si ves dulces de goma rojos/rosados (en tazón o sueltos, NO un frasco de mermelada, NO fruta fresca) y/o el título menciona "Gummies" / "Gomitas" / "Probiotic" / "Probióticos", es este hablador.

REGLA ANTI-CONFUSIÓN (Mermelada vs Gomas): ambas son ROJAS. NO decidas por el color. Decide por el título y por el envase: FRASCO DE VIDRIO + FRESAS REALES = MERMELADA_FRESA. GOMITAS SUELTAS (sin frasco, sin fruta real) o título con "Gummies"/"Gomitas"/"Probióticos" = GOMAS_PROBIOTICAS.

INSTRUCCIONES:
- Si reconoces el título del producto Y el aspecto general del hablador (no necesita estar perfectamente nítido, basta con que se distinga el título y la temática), responde con el código correspondiente.
- Si la imagen muestra otra cosa completamente (un objeto cualquiera, una persona, una pantalla, comida real, un papel suelto, un envase comercial NO del hablador, etc.) responde NO_IDENTIFICADO.
- Si la imagen está tan borrosa o tan recortada que no se puede leer el título ni reconocer la temática del hablador, responde NO_IDENTIFICADO.

Responde EXACTAMENTE una sola palabra de estas opciones, sin nada más:
YOGURT_VAINILLA
MALTEADA_CHOCOLATE
MERMELADA_FRESA
GOMAS_PROBIOTICAS
NO_IDENTIFICADO`;

export default async function handler(req, res) {
  // CORS — permitir llamadas desde el mismo dominio del app
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, mediaType } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: "Missing image" });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY no configurada en Vercel.");
      return res.status(500).json({ error: "Server not configured", code: "NO_API_KEY" });
    }

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 50,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: image,
              },
            },
            { type: "text", text: PROMPT },
          ],
        }],
      }),
    });

    if (!anthropicResponse.ok) {
      const errBody = await anthropicResponse.text();
      console.error("Anthropic API error:", anthropicResponse.status, errBody);
      return res.status(502).json({
        error: "Upstream API error",
        status: anthropicResponse.status,
        details: errBody.slice(0, 500),
      });
    }

    const data = await anthropicResponse.json();
    const rawText = data?.content?.[0]?.text || "";
    const result = rawText.trim().toUpperCase();

    return res.status(200).json({
      result,
      raw: rawText,
    });
  } catch (err) {
    console.error("Recognize handler error:", err);
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}
