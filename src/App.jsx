import { useState, useRef } from "react";

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

function LoadingDots() {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", padding: "20px 0" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: "50%", background: "#c084fc",
          animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
        }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }`}</style>
    </div>
  );
}

function HairstyleCard({ style, index }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(192,132,252,0.25)",
      borderRadius: 14, padding: "16px 18px",
      display: "flex", gap: 14, alignItems: "flex-start",
    }}>
      <div style={{
        minWidth: 36, height: 36, borderRadius: "50%",
        background: "linear-gradient(135deg,#a855f7,#ec4899)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: 15, color: "#fff", flexShrink: 0,
      }}>{index}</div>
      <div>
        <div style={{ fontWeight: 700, color: "#e9d5ff", fontSize: 15, marginBottom: 4 }}>{style.name}</div>
        <div style={{ color: "#c4b5fd", fontSize: 13, lineHeight: 1.55 }}>{style.reason}</div>
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {style.tags?.map((tag) => (
            <span key={tag} style={{
              background: "rgba(168,85,247,0.2)", color: "#d8b4fe",
              borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600,
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const FACE_SHAPES = [
  { id: "oval",    emoji: "🥚", label: "Oval",    urdu: "Andakaari" },
  { id: "round",   emoji: "⭕", label: "Round",   urdu: "Gol" },
  { id: "square",  emoji: "⬛", label: "Square",  urdu: "Chakor" },
  { id: "heart",   emoji: "❤️", label: "Heart",   urdu: "Dil Jaisa" },
  { id: "oblong",  emoji: "📏", label: "Oblong",  urdu: "Lamba" },
  { id: "diamond", emoji: "💎", label: "Diamond", urdu: "Heere Jaisa" },
];

const HAIR_LENGTH = [
  { id: "short",  emoji: "✂️",  label: "Short" },
  { id: "medium", emoji: "💆", label: "Medium" },
  { id: "long",   emoji: "👸", label: "Long" },
  { id: "any",    emoji: "🔀", label: "Koi bhi" },
];function SelfieModal({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [captured, setCaptured] = useState(null);
  const [camError, setCamError] = useState("");

  const startCamera = async () => {
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setReady(true);
        };
      }
    } catch (e) {
      setCamError("Camera access nahi mila. Browser mein camera permission allow karein.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCaptured(dataUrl);
    stopCamera();
  };

  const handleUse = () => { if (captured) { onCapture(captured); onClose(); } };
  const handleRetake = () => { setCaptured(null); startCamera(); };

  useState(() => { startCamera(); return () => stopCamera(); });

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "#1a0530", borderRadius: 20, padding: 20,
        width: "100%", maxWidth: 420,
        border: "1px solid rgba(168,85,247,0.4)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontWeight: 800, fontSize: 17, color: "#e9d5ff" }}>📸 Selfie Lo</span>
          <button onClick={() => { stopCamera(); onClose(); }} style={{
            background: "rgba(255,255,255,0.1)", border: "none", color: "#e9d5ff",
            borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14,
          }}>✕</button>
        </div>
        {camError ? (
          <div style={{ background: "rgba(239,68,68,0.15)", borderRadius: 10, padding: 16, color: "#fca5a5", fontSize: 13, textAlign: "center" }}>
            ⚠️ {camError}
            <br /><br />
            <button onClick={startCamera} style={{ background: "rgba(168,85,247,0.3)", border: "1px solid #a855f7", color: "#e9d5ff", borderRadius: 8, padding: "8px 16px", cursor: "pointer" }}>Dobara Try</button>
          </div>
        ) : (
          <>
            <div style={{ borderRadius: 14, overflow: "hidden", background: "#000", marginBottom: 14, minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {!captured
                ? <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", display: "block", transform: "scaleX(-1)" }} />
                : <img src={captured} alt="Captured" style={{ width: "100%", display: "block" }} />
              }
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {!captured
              ? <button onClick={handleCapture} disabled={!ready} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: ready ? "linear-gradient(135deg,#a855f7,#ec4899)" : "rgba(168,85,247,0.3)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: ready ? "pointer" : "not-allowed" }}>📷 Photo Lo</button>
              : <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={handleRetake} style={{ flex: 1, padding: 13, borderRadius: 12, border: "1px solid rgba(168,85,247,0.4)", background: "transparent", color: "#a78bfa", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🔄 Dobara</button>
                  <button onClick={handleUse} style={{ flex: 2, padding: 13, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#a855f7,#ec4899)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>✅ Use Karein</button>
                </div>
            }
          </>
        )}
      </div>
    </div>
  );
}export default function HairStyleApp() {
  const [gender, setGender] = useState("");
  const [faceShape, setFaceShape] = useState("");
  const [hairLen, setHairLen] = useState("");
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [usePhoto, setUsePhoto] = useState(false);
  const [showSelfie, setShowSelfie] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const galleryRef = useRef(null);

  const processDataUrl = (dataUrl) => {
    setImage(dataUrl);
    setImageBase64(dataUrl.split(",")[1]);
    setResult(null);
    setError("");
  };

  const handleGallery = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => processDataUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSuggest = async () => {
    if (!gender) { setError("Gender select karein."); return; }
    if (usePhoto && !imageBase64) { setError("Photo upload karein ya selfie lein."); return; }
    if (!usePhoto && !faceShape) { setError("Face shape select karein."); return; }
    if (!usePhoto && !hairLen) { setError("Hair length select karein."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const prompt = usePhoto
        ? `You are a professional hair stylist. Analyze the face. Gender: ${gender}. Suggest EXACTLY 10 hairstyles. Respond ONLY valid JSON no markdown: {"faceShape":"...","faceFeatures":"...","confidence":"High or Medium","stylistNote":"...","hairstyles":[{"name":"...","reason":"...","tags":["..."]}]}`
        : `You are a professional hair stylist. Gender: ${gender}, Face Shape: ${faceShape}, Hair Length: ${hairLen==="any"?"Any":hairLen}. Suggest EXACTLY 10 hairstyles. Respond ONLY valid JSON no markdown: {"faceShape":"${faceShape}","stylistNote":"...","hairstyles":[{"name":"...","reason":"...","tags":["..."]}]}`;
      const messages = usePhoto && imageBase64
        ? [{ role:"user", content:[{ type:"image", source:{ type:"base64", media_type:"image/jpeg", data:imageBase64 }},{ type:"text", text:prompt }]}]
        : [{ role:"user", content:prompt }];
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1000, messages }),
      });
      const data = await response.json();
      const text = data.content?.map((c) => c.text||"").join("")||"";
      setResult(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch { setError("Kuch masla hua. Dobara try karein."); }
    finally { setLoading(false); }
  };

  const reset = () => { setResult(null); setGender(""); setFaceShape(""); setHairLen(""); setImage(null); setImageBase64(null); setError(""); };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f0515 0%,#1a0530 50%,#0d0d1f 100%)", fontFamily:"'Inter','Segoe UI',sans-serif", color:"#f3e8ff", padding:"28px 16px 60px" }}>
      {showSelfie && <SelfieModal onCapture={processDataUrl} onClose={() => setShowSelfie(false)} />}
      <div style={{ maxWidth:680, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:44, marginBottom:6 }}>✂️</div>
          <h1 style={{ fontSize:"clamp(22px,5vw,34px)", fontWeight:800, margin:0, background:"linear-gradient(90deg,#e879f9,#a855f7,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>AI Hair Style Advisor</h1>
          <p style={{ color:"#a78bfa", fontSize:13, marginTop:8 }}>Photo ya selfie lein — ya manually select karein</p>
        </div>
        <div style={{ marginBottom:20 }}>
          <div style={{ color:"#c4b5fd", fontWeight:600, marginBottom:10, fontSize:12, letterSpacing:0.8 }}>STEP 1 — GENDER</div>
          <div style={{ display:"flex", gap:10 }}>
            {["Male","Female"].map((g) => (
              <button key={g} onClick={() => setGender(g)} style={{ flex:1, padding:"12px 0", borderRadius:12, border:gender===g?"2px solid #a855f7":"2px solid rgba(168,85,247,0.25)", background:gender===g?"rgba(168,85,247,0.25)":"rgba(255,255,255,0.04)", color:gender===g?"#e9d5ff":"#9ca3af", fontWeight:700, fontSize:15, cursor:"pointer" }}>{g==="Male"?"👨 Male":"👩 Female"}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <div style={{ color:"#c4b5fd", fontWeight:600, marginBottom:10, fontSize:12, letterSpacing:0.8 }}>STEP 2 — TARIKA CHUNEIN</div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setUsePhoto(false)} style={{ flex:1, padding:"12px 0", borderRadius:12, border:!usePhoto?"2px solid #6366f1":"2px solid rgba(99,102,241,0.25)", background:!usePhoto?"rgba(99,102,241,0.22)":"rgba(255,255,255,0.04)", color:!usePhoto?"#e0e7ff":"#9ca3af", fontWeight:700, fontSize:14, cursor:"pointer" }}>📋 Manually</button>
            <button onClick={() => setUsePhoto(true)} style={{ flex:1, padding:"12px 0", borderRadius:12, border:usePhoto?"2px solid #a855f7":"2px solid rgba(168,85,247,0.25)", background:usePhoto?"rgba(168,85,247,0.22)":"rgba(255,255,255,0.04)", color:usePhoto?"#e9d5ff":"#9ca3af", fontWeight:700, fontSize:14, cursor:"pointer" }}>📸 Photo/Selfie</button>
          </div>
        </div>
        {!usePhoto && (
          <>
            <div style={{ marginBottom:20 }}>
              <div style={{ color:"#c4b5fd", fontWeight:600, marginBottom:10, fontSize:12, letterSpacing:0.8 }}>STEP 3 — FACE SHAPE</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {FACE_SHAPES.map((f) => (
                  <button key={f.id} onClick={() => setFaceShape(f.id)} style={{ padding:"12px 6px", borderRadius:12, border:faceShape===f.id?"2px solid #a855f7":"2px solid rgba(168,85,247,0.2)", background:faceShape===f.id?"rgba(168,85,247,0.22)":"rgba(255,255,255,0.04)", color:faceShape===f.id?"#e9d5ff":"#9ca3af", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <span style={{ fontSize:24 }}>{f.emoji}</span>
                    <span style={{ fontWeight:700, fontSize:12 }}>{f.label}</span>
                    <span style={{ fontSize:10, color:faceShape===f.id?"#c4b5fd":"#6b7280" }}>{f.urdu}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ color:"#c4b5fd", fontWeight:600, marginBottom:10, fontSize:12, letterSpacing:0.8 }}>STEP 4 — HAIR LENGTH</div>
              <div style={{ display:"flex", gap:8 }}>
                {HAIR_LENGTH.map((h) => (
                  <button key={h.id} onClick={() => setHairLen(h.id)} style={{ flex:1, padding:"11px 6px", borderRadius:12, border:hairLen===h.id?"2px solid #ec4899":"2px solid rgba(236,72,153,0.2)", background:hairLen===h.id?"rgba(236,72,153,0.18)":"rgba(255,255,255,0.04)", color:hairLen===h.id?"#fce7f3":"#9ca3af", fontWeight:700, fontSize:12, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <span style={{ fontSize:20 }}>{h.emoji}</span><span>{h.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        {usePhoto && (
          <div style={{ marginBottom:20 }}>
            <div style={{ color:"#c4b5fd", fontWeight:600, marginBottom:10, fontSize:12, letterSpacing:0.8 }}>STEP 3 — PHOTO</div>
            <div style={{ display:"flex", gap:10, marginBottom:12 }}>
              <button onClick={() => galleryRef.current?.click()} style={{ flex:1, padding:"16px 8px", borderRadius:14, border:"2px solid rgba(99,102,241,0.5)", background:"rgba(99,102,241,0.12)", color:"#e0e7ff", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, fontWeight:700, fontSize:13 }}>
                <span style={{ fontSize:28 }}>🖼️</span><span>Gallery</span>
              </button>
              <input ref={galleryRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleGallery} />
              <button onClick={() => setShowSelfie(true)} style={{ flex:1, padding:"16px 8px", borderRadius:14, border:"2px solid rgba(168,85,247,0.5)", background:"rgba(168,85,247,0.12)", color:"#f3e8ff", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, fontWeight:700, fontSize:13 }}>
                <span style={{ fontSize:28 }}>📸</span><span>Selfie</span>
              </button>
            </div>
            {image ? (
              <div style={{ textAlign:"center", padding:14, background:"rgba(168,85,247,0.07)", border:"2px dashed rgba(168,85,247,0.35)", borderRadius:14 }}>
                <img src={image} alt="Face" style={{ maxHeight:200, maxWidth:"100%", borderRadius:12, objectFit:"cover" }} />
                <div style={{ color:"#86efac", fontSize:12, marginTop:8, fontWeight:600 }}>✅ Photo ready!</div>
                <button onClick={() => { setImage(null); setImageBase64(null); }} style={{ marginTop:8, background:"transparent", border:"1px solid rgba(239,68,68,0.4)", color:"#fca5a5", borderRadius:8, padding:"5px 14px", cursor:"pointer", fontSize:12 }}>🗑️ Hatayein</button>
              </div>
            ) : (
              <div style={{ textAlign:"center", padding:"20px 14px", background:"rgba(168,85,247,0.04)", border:"2px dashed rgba(168,85,247,0.25)", borderRadius:14, color:"#6d28d9", fontSize:13 }}>📂 Gallery ya Selfie chunein</div>
            )}
          </div>
        )}
        {error && <div style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.4)", borderRadius:10, padding:"11px 15px", color:"#fca5a5", fontSize:13, marginBottom:16 }}>⚠️ {error}</div>}
        <button onClick={handleSuggest} disabled={loading} style={{ width:"100%", padding:"15px", borderRadius:14, border:"none", background:loading?"rgba(168,85,247,0.3)":"linear-gradient(135deg,#a855f7,#ec4899)", color:"#fff", fontWeight:800, fontSize:16, cursor:loading?"not-allowed":"pointer", boxShadow:loading?"none":"0 4px 24px rgba(168,85,247,0.45)" }}>
          {loading?"⏳ AI Soch raha hai...":"✨ Hairstyles Suggest Karein"}
        </button>
        {loading && <div style={{ textAlign:"center", marginTop:18 }}><LoadingDots /><p style={{ color:"#a78bfa", fontSize:13 }}>Best hairstyles dhundh raha hai...</p></div>}
        {result && (
          <div style={{ marginTop:28 }}>
            <div style={{ background:"linear-gradient(135deg,rgba(168,85,247,0.15),rgba(236,72,153,0.1))", border:"1px solid rgba(192,132,252,0.35)", borderRadius:16, padding:"18px 20px", marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}><span style={{ fontSize:22 }}>🔍</span><span style={{ fontWeight:800, fontSize:16, color:"#e9d5ff" }}>Analysis</span></div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10 }}>
                {result.faceShape && <span style={{ background:"rgba(168,85,247,0.2)", color:"#d8b4fe", borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:600 }}>{result.faceShape} Face</span>}
                {result.confidence && <span style={{ background:"rgba(34,197,94,0.15)", color:"#86efac", borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:600 }}>{result.confidence}</span>}
                <span style={{ background:"rgba(99,102,241,0.2)", color:"#c7d2fe", borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:600 }}>{gender}</span>
              </div>
              {result.faceFeatures && <div style={{ color:"#c4b5fd", fontSize:13, marginBottom:10 }}>{result.faceFeatures}</div>}
              {result.stylistNote && <div style={{ background:"rgba(168,85,247,0.12)", borderRadius:8, padding:"10px 14px", color:"#d8b4fe", fontSize:13, fontStyle:"italic", borderLeft:"3px solid #a855f7" }}>💡 {result.stylistNote}</div>}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}><span style={{ fontSize:20 }}>💇</span><span style={{ fontWeight:800, fontSize:17, color:"#e9d5ff" }}>Top 10 Hairstyles</span></div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {result.hairstyles?.map((s,i) => <HairstyleCard key={i} style={s} index={i+1} />)}
            </div>
            <button onClick={reset} style={{ marginTop:24, width:"100%", padding:"13px", borderRadius:12, border:"1px solid rgba(168,85,247,0.4)", background:"transparent", color:"#a78bfa", fontWeight:600, fontSize:14, cursor:"pointer" }}>🔄 Dobara Try</button>
          </div>
        )}
      </div>
    </div>
  );
      }
