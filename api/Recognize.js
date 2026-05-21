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

const PROMPT = `Identifica si la imagen muestra uno de estos 3 habladores publicitarios del stand de Factores & Mercadeo S.A.

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
