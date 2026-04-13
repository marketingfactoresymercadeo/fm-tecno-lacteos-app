import { useState, useRef, useCallback, useEffect } from "react";

// ============================================================
// BASE DE DATOS DE MATERIAS PRIMAS → PRODUCTOS
// ============================================================
// NOTA: Actualizar el miércoles con la lista definitiva de gerencia
const MATERIAS_PRIMAS_DB = {
  "SUCRALOSA": {
    categoria: "Edulcorante Artificial",
    descripcion: "Edulcorante no calórico 600 veces más dulce que el azúcar",
    icon: "🧪",
    productos: [
      { nombre: "Yogurt sin azúcar", tipo: "Lácteo", icon: "🥛" },
      { nombre: "Helado bajo en calorías", tipo: "Lácteo", icon: "🍦" },
      { nombre: "Leche saborizada light", tipo: "Lácteo", icon: "🥛" },
      { nombre: "Embutidos reducidos en azúcar", tipo: "Cárnico", icon: "🌭" },
      { nombre: "Jamón bajo en calorías", tipo: "Cárnico", icon: "🥩" },
      { nombre: "Bebidas lácteas dietéticas", tipo: "Lácteo", icon: "🧃" },
    ],
  },
  "SACARINA SODICA": {
    categoria: "Edulcorante Artificial",
    descripcion: "Edulcorante sintético ampliamente usado en la industria alimentaria",
    icon: "🧪",
    productos: [
      { nombre: "Queso crema light", tipo: "Lácteo", icon: "🧀" },
      { nombre: "Bebida de yogurt", tipo: "Lácteo", icon: "🥛" },
      { nombre: "Salchicha dietética", tipo: "Cárnico", icon: "🌭" },
      { nombre: "Dulce de leche sin azúcar", tipo: "Lácteo", icon: "🍮" },
    ],
  },
  "ACESULFAME K": {
    categoria: "Edulcorante Artificial",
    descripcion: "Potenciador de dulzura, ideal en mezclas con otros edulcorantes",
    icon: "🧪",
    productos: [
      { nombre: "Yogurt griego sin azúcar", tipo: "Lácteo", icon: "🥛" },
      { nombre: "Helado de proteína", tipo: "Lácteo", icon: "🍦" },
      { nombre: "Leche condensada light", tipo: "Lácteo", icon: "🥛" },
      { nombre: "Mortadela reducida en azúcar", tipo: "Cárnico", icon: "🥩" },
    ],
  },
  "SORBITOL": {
    categoria: "Poliol / Edulcorante Natural",
    descripcion: "Agente humectante y edulcorante de bajo índice glucémico",
    icon: "🌿",
    productos: [
      { nombre: "Queso procesado", tipo: "Lácteo", icon: "🧀" },
      { nombre: "Salchicha tipo Frankfurt", tipo: "Cárnico", icon: "🌭" },
      { nombre: "Jamón cocido", tipo: "Cárnico", icon: "🥩" },
      { nombre: "Helado sin azúcar", tipo: "Lácteo", icon: "🍦" },
      { nombre: "Chorizo premium", tipo: "Cárnico", icon: "🥩" },
    ],
  },
  "XYLITOL": {
    categoria: "Poliol / Edulcorante Natural",
    descripcion: "Edulcorante natural con efecto refrescante, bajo en calorías",
    icon: "🌿",
    productos: [
      { nombre: "Postre lácteo sin azúcar", tipo: "Lácteo", icon: "🍮" },
      { nombre: "Yogurt funcional", tipo: "Lácteo", icon: "🥛" },
      { nombre: "Batido proteico", tipo: "Lácteo", icon: "🥤" },
    ],
  },
  "MANITOL": {
    categoria: "Poliol / Edulcorante Natural",
    descripcion: "Agente de textura y edulcorante con baja higroscopicidad",
    icon: "🌿",
    productos: [
      { nombre: "Queso en polvo", tipo: "Lácteo", icon: "🧀" },
      { nombre: "Recubrimiento para queso", tipo: "Lácteo", icon: "🧀" },
      { nombre: "Snack cárnico deshidratado", tipo: "Cárnico", icon: "🥩" },
    ],
  },
  "NEOTAME": {
    categoria: "Edulcorante Artificial",
    descripcion: "Edulcorante de alta intensidad, hasta 13.000 veces más dulce que el azúcar",
    icon: "🧪",
    productos: [
      { nombre: "Leche saborizada", tipo: "Lácteo", icon: "🥛" },
      { nombre: "Yogurt de frutas", tipo: "Lácteo", icon: "🥛" },
      { nombre: "Marinada para carnes", tipo: "Cárnico", icon: "🥩" },
      { nombre: "Glaseado para jamón", tipo: "Cárnico", icon: "🍖" },
    ],
  },
  "TREALOSA": {
    categoria: "Azúcar Natural",
    descripcion: "Disacárido estabilizante, protege proteínas durante el procesamiento",
    icon: "🔬",
    productos: [
      { nombre: "Helado premium", tipo: "Lácteo", icon: "🍦" },
      { nombre: "Queso mozzarella", tipo: "Lácteo", icon: "🧀" },
      { nombre: "Carne procesada congelada", tipo: "Cárnico", icon: "🥩" },
      { nombre: "Nuggets de pollo", tipo: "Cárnico", icon: "🍗" },
      { nombre: "Hamburguesa congelada", tipo: "Cárnico", icon: "🍔" },
    ],
  },
  "MONK FRUIT": {
    categoria: "Edulcorante Natural",
    descripcion: "Extracto de fruta del monje, edulcorante natural sin calorías",
    icon: "🍈",
    productos: [
      { nombre: "Yogurt orgánico", tipo: "Lácteo", icon: "🥛" },
      { nombre: "Leche de almendras", tipo: "Lácteo", icon: "🥛" },
      { nombre: "Mantequilla de maní", tipo: "Otro", icon: "🥜" },
      { nombre: "Batido proteico natural", tipo: "Lácteo", icon: "🥤" },
    ],
  },
  "ASPARTAME": {
    categoria: "Edulcorante Artificial",
    descripcion: "Edulcorante bajo en calorías ampliamente utilizado en la industria",
    icon: "🧪",
    productos: [
      { nombre: "Yogurt dietético", tipo: "Lácteo", icon: "🥛" },
      { nombre: "Postre de gelatina", tipo: "Lácteo", icon: "🍮" },
      { nombre: "Bebida láctea light", tipo: "Lácteo", icon: "🧃" },
    ],
  },
};

// ============================================================
// HELPER: Fuzzy match materia prima
// ============================================================
function findMateriaPrima(text) {
  const normalized = text.toUpperCase().trim();
  // Direct match
  if (MATERIAS_PRIMAS_DB[normalized]) return { key: normalized, ...MATERIAS_PRIMAS_DB[normalized] };
  // Partial match
  for (const key of Object.keys(MATERIAS_PRIMAS_DB)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { key, ...MATERIAS_PRIMAS_DB[key] };
    }
  }
  // Word-level match
  const words = normalized.split(/\s+/);
  for (const key of Object.keys(MATERIAS_PRIMAS_DB)) {
    for (const word of words) {
      if (word.length > 3 && key.includes(word)) {
        return { key, ...MATERIAS_PRIMAS_DB[key] };
      }
    }
  }
  return null;
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
        // Glow
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

const FM_LOGO = "data:image/png;base64,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";

function Logo({ size = 80 }) {
  return (
    <img
      src={FM_LOGO}
      alt="Factores & Mercadeo"
      style={{
        width: size, height: size, objectFit: "contain",
        filter: "drop-shadow(0 2px 8px rgba(26,40,110,0.3))",
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
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>📸</div>
          <h2 style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: "18px",
            color: "#fff", fontWeight: 600, margin: "0 0 12px",
          }}>
            Descubre el potencial de cada ingrediente
          </h2>
          <p style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: "14px",
            color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0,
          }}>
            Toma una foto del rótulo de la materia prima y descubre todos los productos
            que puedes crear con ella.
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

function LeadCapture({ onSubmit, onSkip }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "24px",
      background: COLORS.bg, position: "relative",
    }}>
      <div style={{
        background: COLORS.cardBg, borderRadius: "24px",
        padding: "36px 28px", maxWidth: "400px", width: "100%",
        boxShadow: "0 10px 40px rgba(26,40,110,0.08)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
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
            Déjanos tus datos para enviarte más información sobre nuestros productos.
          </p>
        </div>

        {[
          { label: "Nombre", value: name, setter: setName, placeholder: "Tu nombre", type: "text" },
          { label: "Email", value: email, setter: setEmail, placeholder: "correo@empresa.com", type: "email" },
          { label: "Empresa", value: company, setter: setCompany, placeholder: "Nombre de tu empresa", type: "text" },
        ].map((field) => (
          <div key={field.label} style={{ marginBottom: "16px" }}>
            <label style={{
              fontFamily: "'Open Sans', sans-serif", fontSize: "12px",
              color: COLORS.secondary, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "1px",
              display: "block", marginBottom: "6px",
            }}>{field.label}</label>
            <input
              type={field.type}
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
              placeholder={field.placeholder}
              style={{
                width: "100%", padding: "12px 16px", border: `1.5px solid #e5e7eb`,
                borderRadius: "12px", fontSize: "14px",
                fontFamily: "'Open Sans', sans-serif", outline: "none",
                transition: "border-color 0.2s", boxSizing: "border-box",
                background: "#fafbfc",
              }}
              onFocus={(e) => e.target.style.borderColor = COLORS.tertiary}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>
        ))}

        <button
          onClick={() => onSubmit({ name, email, company })}
          style={{
            width: "100%", background: COLORS.gradient2, border: "none",
            color: "#fff", padding: "14px", borderRadius: "12px",
            fontSize: "15px", fontWeight: 700, fontFamily: "'Open Sans', sans-serif",
            cursor: "pointer", marginTop: "8px",
            boxShadow: "0 4px 15px rgba(255,113,45,0.3)",
          }}
        >
          Continuar
        </button>

        <button
          onClick={onSkip}
          style={{
            width: "100%", background: "none", border: "none",
            color: COLORS.textLight, padding: "12px", fontSize: "13px",
            fontFamily: "'Open Sans', sans-serif", cursor: "pointer",
            marginTop: "4px", textDecoration: "underline",
          }}
        >
          Omitir por ahora
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
      {/* Header */}
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
          }}>Escanear Rótulo</span>
          <p style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: "11px",
            color: "rgba(255,255,255,0.5)", margin: "2px 0 0",
          }}>Apunta al nombre de la materia prima</p>
        </div>
      </div>

      {/* Camera View */}
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

        {/* Scan frame overlay */}
        <div style={{
          position: "relative", zIndex: 1,
          width: "280px", height: "120px",
          border: `3px solid ${COLORS.tertiary}`,
          borderRadius: "16px",
          boxShadow: `0 0 0 9999px rgba(0,0,0,0.4), 0 0 30px rgba(255,113,45,0.3)`,
        }}>
          <div style={{
            position: "absolute", bottom: "-36px", left: "50%",
            transform: "translateX(-50%)", whiteSpace: "nowrap",
            fontFamily: "'Open Sans', sans-serif", fontSize: "12px",
            color: "rgba(255,255,255,0.8)", textAlign: "center",
            background: "rgba(0,0,0,0.5)", padding: "4px 12px",
            borderRadius: "8px",
          }}>
            Centra el rótulo aquí
          </div>
          {/* Scanning line animation */}
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

      {/* Bottom Controls */}
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

function ManualSelect({ onSelect, onBack }) {
  const [search, setSearch] = useState("");
  const keys = Object.keys(MATERIAS_PRIMAS_DB).filter(
    (k) => k.includes(search.toUpperCase())
  );

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg, padding: "0 0 40px",
    }}>
      <div style={{
        background: COLORS.gradient1, padding: "20px 20px 28px",
        borderRadius: "0 0 28px 28px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.15)", border: "none",
            color: "#fff", width: "36px", height: "36px", borderRadius: "50%",
            fontSize: "18px", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>←</button>
          <span style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: "16px",
            color: "#fff", fontWeight: 600,
          }}>Selección Manual</span>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar materia prima..."
          style={{
            width: "100%", padding: "14px 18px", borderRadius: "14px",
            border: "none", fontSize: "14px", fontFamily: "'Open Sans', sans-serif",
            outline: "none", boxSizing: "border-box",
            background: "rgba(255,255,255,0.95)",
          }}
        />
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {keys.map((key, i) => {
          const item = MATERIAS_PRIMAS_DB[key];
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              style={{
                display: "flex", alignItems: "center", gap: "14px",
                background: COLORS.cardBg, border: "none", padding: "16px 18px",
                borderRadius: "16px", cursor: "pointer", textAlign: "left",
                boxShadow: "0 2px 8px rgba(26,40,110,0.06)",
                transition: "all 0.2s",
                animation: `slideUp 0.4s ease forwards`,
                animationDelay: `${i * 0.05}s`,
                opacity: 0,
              }}
            >
              <span style={{ fontSize: "28px" }}>{item.icon}</span>
              <div>
                <div style={{
                  fontFamily: "'Open Sans', sans-serif", fontSize: "14px",
                  color: COLORS.secondary, fontWeight: 700,
                }}>{key}</div>
                <div style={{
                  fontFamily: "'Open Sans', sans-serif", fontSize: "11px",
                  color: COLORS.textLight, marginTop: "2px",
                }}>{item.categoria}</div>
              </div>
              <span style={{ marginLeft: "auto", color: COLORS.tertiary, fontSize: "18px" }}>→</span>
            </button>
          );
        })}
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
      }}>Analizando rótulo...</p>
      <p style={{
        fontFamily: "'Open Sans', sans-serif", fontSize: "13px",
        color: "rgba(255,255,255,0.5)",
      }}>Identificando materia prima con IA</p>
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

function ResultsScreen({ materiaPrima, onScanAgain, onContact }) {
  const [filter, setFilter] = useState("Todos");
  const data = MATERIAS_PRIMAS_DB[materiaPrima];
  if (!data) return null;

  const tipos = ["Todos", ...new Set(data.productos.map((p) => p.tipo))];
  const filtered = filter === "Todos" ? data.productos : data.productos.filter((p) => p.tipo === filter);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, paddingBottom: "100px" }}>
      {/* Hero Header */}
      <div style={{
        background: COLORS.gradient1, padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-40px", right: "-40px", width: "160px",
          height: "160px", borderRadius: "50%",
          background: "rgba(255,113,45,0.1)",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
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
        </div>
      </div>

      {/* Products Count */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "36px", fontWeight: 700, color: COLORS.tertiary,
          }}>{data.productos.length}</span>
          <span style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: "14px",
            color: COLORS.secondary, fontWeight: 600,
          }}>productos aplicables</span>
        </div>
      </div>

      {/* Filter Tabs */}
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

      {/* Product Cards */}
      <div style={{ padding: "4px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map((prod, i) => (
          <div
            key={prod.nombre}
            style={{
              display: "flex", alignItems: "center", gap: "14px",
              background: COLORS.cardBg, padding: "16px 18px",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(26,40,110,0.05)",
              animation: `slideUp 0.5s ease forwards`,
              animationDelay: `${i * 0.07}s`,
              opacity: 0,
              borderLeft: `4px solid ${prod.tipo === "Lácteo" ? COLORS.secondary : prod.tipo === "Cárnico" ? COLORS.tertiary : "#10b981"}`,
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
                color: COLORS.textLight, textTransform: "uppercase",
                letterSpacing: "1px",
              }}>{prod.tipo}</span>
            </div>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: prod.tipo === "Lácteo" ? "rgba(26,40,110,0.08)" : prod.tipo === "Cárnico" ? "rgba(255,113,45,0.08)" : "rgba(16,185,129,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", color: prod.tipo === "Lácteo" ? COLORS.secondary : prod.tipo === "Cárnico" ? COLORS.tertiary : "#10b981",
              fontWeight: 700, fontFamily: "'Open Sans', sans-serif",
            }}>
              F&M
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
          { icon: "📧", label: "info@factoresymercadeo.com", href: "mailto:info@factoresymercadeo.com" },
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
// MAIN APP
// ============================================================
export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [capturedImage, setCapturedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [leadData, setLeadData] = useState(null);

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
          max_tokens: 200,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64Data },
              },
              {
                type: "text",
                text: `Identifica el nombre de la materia prima o ingrediente alimentario que aparece en este rótulo/etiqueta. 
Responde ÚNICAMENTE con el nombre del ingrediente en mayúsculas, sin explicación. 
Ejemplos: SUCRALOSA, SORBITOL, ACESULFAME K, MONK FRUIT, TREALOSA, SACARINA SODICA, XYLITOL, MANITOL, NEOTAME, ASPARTAME.
Si no puedes identificar un ingrediente claro, responde: NO_IDENTIFICADO`,
              },
            ],
          }],
        }),
      });

      const data = await response.json();
      const aiText = data.content?.[0]?.text?.trim() || "NO_IDENTIFICADO";
      const match = findMateriaPrima(aiText);

      if (match) {
        setResult(match.key);
        setScreen("results");
      } else {
        setResult(null);
        setScreen("manual");
      }
    } catch (err) {
      console.error("AI Error:", err);
      setScreen("manual");
    }
  };

  const handleManualSelect = (key) => {
    setResult(key);
    setScreen("results");
  };

  return (
    <>
      {screen === "welcome" && <WelcomeScreen onStart={() => setScreen("lead")} />}
      {screen === "lead" && (
        <LeadCapture
          onSubmit={(data) => { setLeadData(data); setScreen("camera"); }}
          onSkip={() => setScreen("camera")}
        />
      )}
      {screen === "camera" && (
        <CameraScreen
          onCapture={handleCapture}
          onSelectManual={() => setScreen("manual")}
        />
      )}
      {screen === "manual" && (
        <ManualSelect
          onSelect={handleManualSelect}
          onBack={() => setScreen("camera")}
        />
      )}
      {screen === "processing" && <ProcessingScreen image={capturedImage} />}
      {screen === "results" && result && (
        <ResultsScreen
          materiaPrima={result}
          onScanAgain={() => { setResult(null); setScreen("camera"); }}
          onContact={() => setScreen("contact")}
        />
      )}
      {screen === "contact" && <ContactScreen onBack={() => setScreen("camera")} />}
    </>
  );
}
