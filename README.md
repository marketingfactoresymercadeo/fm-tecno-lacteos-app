# F&M Tecno Lácteos & Cárnicos 2025 — App Interactiva

App web interactiva para el stand de **Factores & Mercadeo S.A.** en la feria **Tecno Lácteos & Tecno Cárnicos Andina 2025** (25-26 de mayo, Corferias, Bogotá).

## ¿Qué hace?

El visitante toma una foto del rótulo de una materia prima en el stand y la app le muestra todos los productos que se pueden fabricar con ese ingrediente.

### Flujo

1. **Bienvenida** — Pantalla de marca con animación de partículas
2. **Captura de datos (opcional)** — Lead capture para seguimiento comercial
3. **Escaneo** — Cámara en vivo o selección manual del ingrediente
4. **Resultados** — Lista de productos aplicables filtrados por tipo (Lácteo/Cárnico)
5. **Contacto** — CTA con web, email y agendamiento vía Calendly

### Tecnología

- **React + Vite** — Frontend ligero y rápido
- **API de Claude (Sonnet)** — Lectura de texto en imágenes (OCR inteligente)
- **Canvas API** — Sistema de partículas animadas en tiempo real
- **Vercel** — Hosting y deploy

## Desarrollo local

```bash
npm install
npm run dev
```

## Actualizar materias primas

Editar el objeto `MATERIAS_PRIMAS_DB` en `src/App.jsx` con la lista definitiva de ingredientes y sus productos aplicables.

## Deploy

El proyecto está conectado a Vercel. Cada push a `main` genera un deploy automático.

---

**Factores & Mercadeo S.A.** — ¡Muchas opciones, un solo proveedor!
