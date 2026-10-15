import { useEffect, useRef, useState } from "react";

export default function Robot() {
  const wrapRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [wave, setWave] = useState(false);

  // Cursor tracking — subtle
  useEffect(() => {
    const onMove = (e) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (vw / 2)));
      const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (vh / 2)));
      setPos({ x: dx, y: dy });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Blink
  useEffect(() => {
    let timer;
    const loop = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 130);
      timer = setTimeout(loop, 2600 + Math.random() * 2400);
    };
    timer = setTimeout(loop, 1600);
    return () => clearTimeout(timer);
  }, []);

  // Wave right hand every ~5s
  useEffect(() => {
    let timer;
    const loop = () => {
      setWave(true);
      setTimeout(() => setWave(false), 1700);
      timer = setTimeout(loop, 5000 + Math.random() * 2000);
    };
    timer = setTimeout(loop, 2400);
    return () => clearTimeout(timer);
  }, []);

  // Subtle body motion
  const bodyX = pos.x * 12;
  const bodyY = pos.y * 8;
  const bodyRotate = pos.x * 4;

  // Head extra motion
  const headX = pos.x * 6;
  const headY = pos.y * 4;
  const headRotate = pos.x * 7;

  // Eyes
  const eyeX = pos.x * 4.5;
  const eyeY = pos.y * 3.5;

  return (
    <div ref={wrapRef} className="robot-wrap">
      {/* Speech bubble */}
      <div className="robot-bubble">
        <div className="robot-bubble-title">
          Hi! <span className="robot-emoji">👋</span>
        </div>
        <div className="robot-bubble-sub">Welcome to</div>
        <div className="robot-bubble-brand">Qifaw Technologies</div>
      </div>

      {/* Rings */}
      <div className="robot-ring robot-ring-1" />
      <div className="robot-ring robot-ring-2" />
      <div className="robot-ring robot-ring-3" />

      <svg
        viewBox="0 0 400 480"
        className="robot-svg"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="headGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <radialGradient id="eyeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="45%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </radialGradient>
          <linearGradient id="armGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <filter id="eyeGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ═══ FULL BODY GROUP — follows cursor ═══ */}
        <g
          style={{
            transform: `translate(${bodyX}px, ${bodyY}px) rotate(${bodyRotate}deg)`,
            transformOrigin: "200px 380px",
            transition: "transform .55s cubic-bezier(.22,1,.36,1)",
          }}
        >
          {/* ═══ ANTENNA ═══ */}
          <line
            x1="200" y1="72" x2="200" y2="36"
            stroke="#60A5FA" strokeWidth="4" strokeLinecap="round"
          />
          <circle cx="200" cy="30" r="8" fill="#60A5FA" filter="url(#eyeGlow)">
            <animate attributeName="opacity" values="1;0.55;1" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* ═══ HEAD ═══ */}
          <g
            style={{
              transform: `translate(${headX}px, ${headY}px) rotate(${headRotate}deg)`,
              transformOrigin: "200px 148px",
              transition: "transform .38s cubic-bezier(.22,1,.36,1)",
            }}
          >
            {/* Head shell */}
            <rect
              x="88" y="80" width="224" height="150" rx="40"
              fill="url(#headGrad)"
            />
            {/* Face screen */}
            <rect
              x="114" y="106" width="172" height="104" rx="26"
              fill="url(#faceGrad)"
            />

            {/* Eyes */}
            {!blink ? (
              <>
                <g filter="url(#eyeGlow)">
                  <circle cx="158" cy="152" r="11" fill="url(#eyeGrad)">
                    <animate attributeName="r" values="11;12;11" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="242" cy="152" r="11" fill="url(#eyeGrad)">
                    <animate attributeName="r" values="11;12;11" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                </g>
                {/* Pupils */}
                <circle
                  cx={158 + eyeX} cy={152 + eyeY} r="3.8" fill="#FFFFFF"
                  style={{ transition: "cx .12s linear, cy .12s linear" }}
                />
                <circle
                  cx={242 + eyeX} cy={152 + eyeY} r="3.8" fill="#FFFFFF"
                  style={{ transition: "cx .12s linear, cy .12s linear" }}
                />
              </>
            ) : (
              <>
                <line x1="146" y1="152" x2="170" y2="152" stroke="#60A5FA" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="230" y1="152" x2="254" y2="152" stroke="#60A5FA" strokeWidth="3.5" strokeLinecap="round" />
              </>
            )}

            {/* Smile */}
            <path
              d="M182 182 Q200 196 218 182"
              stroke="#60A5FA" strokeWidth="3.2" fill="none" strokeLinecap="round"
            />

            {/* Cheek blush dots (subtle) */}
            <circle cx="132" cy="178" r="5" fill="#60A5FA" opacity="0.25" />
            <circle cx="268" cy="178" r="5" fill="#60A5FA" opacity="0.25" />
          </g>

          {/* ═══ NECK ═══ */}
          <rect x="182" y="222" width="36" height="18" rx="6" fill="#2563EB" />
          <rect x="182" y="222" width="36" height="6" rx="3" fill="#60A5FA" opacity="0.4" />

          {/* ═══ BODY ═══ */}
          <rect
            x="106" y="240" width="188" height="170" rx="38"
            fill="url(#bodyGrad)"
          />

          {/* Body top highlight */}
          <rect
            x="118" y="252" width="164" height="48" rx="24"
            fill="#FFFFFF" opacity="0.10"
          />

          {/* Body screen */}
          <rect
            x="138" y="282" width="124" height="76" rx="18"
            fill="#0F172A" opacity="0.20"
          />

          {/* Center pulsing light */}
          <circle cx="200" cy="320" r="11" fill="#E0F2FE">
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Vents */}
          <line x1="174" y1="374" x2="174" y2="390" stroke="#DBEAFE" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
          <line x1="200" y1="374" x2="200" y2="390" stroke="#DBEAFE" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
          <line x1="226" y1="374" x2="226" y2="390" stroke="#DBEAFE" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />

          {/* ═══ LEFT ARM — completely still ═══ */}
          <g>
            {/* Shoulder joint */}
            <circle cx="106" cy="262" r="13" fill="#1D4ED8" />
            {/* Upper arm */}
            <rect x="70" y="258" width="28" height="76" rx="14" fill="url(#armGrad)" />
            {/* Forearm */}
            <rect x="70" y="320" width="28" height="56" rx="14" fill="url(#armGrad)" />
            {/* Hand — natural closed */}
            <ellipse cx="84" cy="388" rx="16" ry="18" fill="#3B82F6" />
            {/* Fingers (subtle) */}
            <rect x="74" y="382" width="6" height="14" rx="3" fill="#60A5FA" opacity="0.85" />
            <rect x="82" y="380" width="6" height="16" rx="3" fill="#60A5FA" opacity="0.85" />
            <rect x="90" y="382" width="6" height="14" rx="3" fill="#60A5FA" opacity="0.85" />
          </g>

          {/* ═══ RIGHT ARM — waving ═══ */}
          <g
            className={`robot-arm-right ${wave ? "is-waving" : ""}`}
            style={{ transformOrigin: "294px 262px" }}
          >
            {/* Shoulder joint */}
            <circle cx="294" cy="262" r="13" fill="#1D4ED8" />
            {/* Upper arm */}
            <rect x="302" y="258" width="28" height="76" rx="14" fill="url(#armGrad)" />
            {/* Forearm */}
            <rect x="302" y="320" width="28" height="56" rx="14" fill="url(#armGrad)" />
            {/* Hand — open palm (for wave) */}
            <ellipse cx="316" cy="388" rx="16" ry="18" fill="#3B82F6" />
            {/* Fingers spread */}
            <rect x="304" y="378" width="6" height="16" rx="3" fill="#60A5FA" opacity="0.9" transform="rotate(-18 307 386)" />
            <rect x="313" y="376" width="6" height="18" rx="3" fill="#60A5FA" opacity="0.9" />
            <rect x="322" y="378" width="6" height="16" rx="3" fill="#60A5FA" opacity="0.9" transform="rotate(18 325 386)" />
          </g>

          {/* ═══ SHADOW ═══ */}
          <ellipse cx="200" cy="438" rx="90" ry="10" fill="#2563EB" opacity="0.16" />
        </g>
      </svg>
    </div>
  );
}