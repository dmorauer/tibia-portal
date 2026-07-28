type LogoProps = {
    size?: number                 // tamanho total em px
    variant?: 'full' | 'icon'     // full = logo com texto, icon = só o emblema
    className?: string
  }

  export default function TibiaIdleLogo({
    size = 200,
    variant = 'full',
    className = '',
  }: LogoProps) {
    // Emblema ocupa 1/1 quando icon, e ~55% da altura quando full
    const emblemSize = variant === 'icon' ? size : size * 0.55
    const totalWidth = variant === 'icon' ? emblemSize : size
    const totalHeight = variant === 'icon' ? emblemSize : size * 0.65

    return (
      <div
        className={`inline-flex flex-col items-center ${className}`}
        style={{ width: totalWidth }}
      >
        <svg
          viewBox="0 0 200 200"
          width={emblemSize}
          height={emblemSize}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Tibia Idle"
        >
          <defs>
            {/* Gradiente do escudo (vermelho escuro → vinho) */}
            <linearGradient id="shieldRed" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b1a1a" />
              <stop offset="50%" stopColor="#5a0f0f" />
              <stop offset="100%" stopColor="#2b0808" />
            </linearGradient>

            {/* Gradiente metálico do azul (aço) */}
            <linearGradient id="metalBlue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8fb8d8" />
              <stop offset="40%" stopColor="#3d6b94" />
              <stop offset="60%" stopColor="#1f3a5a" />
              <stop offset="100%" stopColor="#0f1f33" />
            </linearGradient>

            {/* Gradiente dourado principal */}
            <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff4b8" />
              <stop offset="35%" stopColor="#f0c84a" />
              <stop offset="65%" stopColor="#b8860b" />
              <stop offset="100%" stopColor="#7a5a08" />
            </linearGradient>

            {/* Gradiente dourado escuro (sombra) */}
            <linearGradient id="goldDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b6914" />
              <stop offset="100%" stopColor="#3d2a08" />
            </linearGradient>

            {/* Brilho da ampulheta (dourado claro radiante) */}
            <radialGradient id="hourglassGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8d4" stopOpacity="1" />
              <stop offset="40%" stopColor="#ffd700" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffb700" stopOpacity="0" />
            </radialGradient>

            {/* Sombra interna do escudo */}
            <radialGradient id="shieldShadow" cx="50%" cy="40%" r="60%">
              <stop offset="60%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
            </radialGradient>

            {/* Filtro para efeito 3D de pixel art suave */}
            <filter id="pixelated" x="-10%" y="-10%" width="120%" height="120%">
              <feMorphology operator="dilate" radius="0.3" />
            </filter>
          </defs>

          {/* ============ ESCUDO ============ */}
          <g>
            {/* Borda dourada externa (sombra) */}
            <path
              d="M100 12 L172 32 L172 105 Q172 155 100 188 Q28 155 28 105 L28 32 Z"
              fill="url(#goldDark)"
            />
            {/* Borda dourada principal */}
            <path
              d="M100 16 L168 35 L168 104 Q168 152 100 183 Q32 152 32 104 L32 35 Z"
              fill="url(#gold)"
              stroke="#3d2a08"
              strokeWidth="1.5"
            />
            {/* Interior vermelho do escudo */}
            <path
              d="M100 26 L158 42 L158 102 Q158 145 100 172 Q42 145 42 102 L42 42 Z"
              fill="url(#shieldRed)"
            />
            {/* Cruz azul metálica (quartering) */}
            <path
              d="M100 26 L158 42 L158 102 Q158 145 100 172 L100 26 Z"
              fill="url(#metalBlue)"
              opacity="0.85"
            />
            {/* Borda da cruz dourada */}
            <path
              d="M100 26 L100 172 M42 42 L158 42 M100 26 L100 26"
              stroke="url(#gold)"
              strokeWidth="3"
              fill="none"
            />
            {/* Sombra interna */}
            <path
              d="M100 26 L158 42 L158 102 Q158 145 100 172 Q42 145 42 102 L42 42 Z"
              fill="url(#shieldShadow)"
            />
            {/* Rebites dourados nos cantos */}
            {[
              [50, 50], [150, 50], [100, 90], [50, 130], [150, 130], [100, 155],
            ].map(([cx, cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r="2.5" fill="url(#gold)" stroke="#3d2a08" strokeWidth="0.5" />
                <circle cx={cx - 0.5} cy={cy - 0.5} r="1" fill="#fff8d4" opacity="0.7" />
              </g>
            ))}
          </g>

          {/* ============ ESPADA (vertical, atrás da ampulheta) ============ */}
          <g>
            {/* Lâmina */}
            <rect x="96" y="55" width="8" height="90" fill="url(#metalBlue)" stroke="#0a1525" strokeWidth="0.8" />
            {/* Fio da lâmina (brilho central) */}
            <rect x="99" y="55" width="2" height="90" fill="#cfe0f0" opacity="0.8" />
            {/* Ponta */}
            <polygon points="96,55 100,45 104,55" fill="url(#metalBlue)" stroke="#0a1525" strokeWidth="0.8" />
            {/* Guarda (crossguard) dourada */}
            <rect x="80" y="143" width="40" height="8" rx="2" fill="url(#gold)" stroke="#3d2a08" strokeWidth="1" />
            <rect x="80" y="143" width="40" height="3" fill="#fff4b8" opacity="0.6" />
            {/* Pomo (pommel) */}
            <circle cx="100" cy="158" r="6" fill="url(#gold)" stroke="#3d2a08" strokeWidth="1" />
            <circle cx="98" cy="156" r="2" fill="#fff4b8" opacity="0.8" />
            {/* Cabo */}
            <rect x="97" y="151" width="6" height="7" fill="url(#goldDark)" />
          </g>

          {/* ============ AMPULHETA BRILHANTE (integrada ao centro) ============ */}
          <g>
            {/* Halo radiante */}
            <circle cx="100" cy="105" r="28" fill="url(#hourglassGlow)">
              <animate
                attributeName="r"
                values="26;32;26"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Estrutura da ampulheta */}
            <g stroke="url(#gold)" strokeWidth="2" fill="none">
              {/* Aro superior */}
              <path d="M88 92 L112 92" strokeLinecap="round" />
              {/* Curvas do vidro */}
              <path d="M88 92 Q88 102 100 105 Q112 102 112 92" fill="rgba(255,248,212,0.15)" />
              <path d="M88 118 Q88 108 100 105 Q112 108 112 118" fill="rgba(255,248,212,0.15)" />
              {/* Aro inferior */}
              <path d="M88 118 L112 118" strokeLinecap="round" />
              {/* Pés/supportes */}
              <path d="M88 92 L82 88 M112 92 L118 88 M88 118 L82 122 M112 118 L118 122" strokeLinecap="round" />
            </g>

            {/* Areia brilhante caindo */}
            <g>
              <rect x="99.3" y="95" width="1.4" height="10" fill="#ffd700" opacity="0.9">
                <animate
                  attributeName="opacity"
                  values="0.9;0.3;0.9"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </rect>
              {/* Areia no topo (pirâmide) */}
              <polygon points="92,93 108,93 100,97" fill="#f0c84a" opacity="0.9" />
              {/* Areia no fundo */}
              <polygon points="92,117 108,117 100,113" fill="#f0c84a" opacity="0.9" />
            </g>

            {/* Brilho central da ampulheta */}
            <circle cx="100" cy="105" r="2" fill="#fff8d4">
              <animate
                attributeName="r"
                values="1.5;3;1.5"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>

          {/* ============ ESTRELAS PIXEL ART (nos cantos) ============ */}
          {[[55, 65], [145, 65], [55, 145], [145, 145]].map(([cx, cy], i) => (
            <g key={i} transform={`translate(${cx} ${cy})`} opacity="0.9">
              <rect x="-1" y="-5" width="2" height="2" fill="#ffd700" />
              <rect x="-1" y="3" width="2" height="2" fill="#ffd700" />
              <rect x="-5" y="-1" width="2" height="2" fill="#ffd700" />
              <rect x="3" y="-1" width="2" height="2" fill="#ffd700" />
              <rect x="-1" y="-1" width="2" height="2" fill="#fff8d4" />
            </g>
          ))}
        </svg>

        {variant === 'full' && (
          <div className="mt-1 text-center" style={{ width: size }}>
            <h1
              className="font-serif font-black tracking-widest"
              style={{
                fontSize: size * 0.13,
                lineHeight: 1,
                color: '#f0c84a',
                textShadow: `
                  1px 1px 0 #3d2a08,
                  2px 2px 0 #2b1a05,
                  3px 3px 0 #1a0f03,
                  0 0 12px rgba(240, 200, 74, 0.5)
                `,
                letterSpacing: '0.15em',
              }}
            >
              TIBIA IDLE
            </h1>
            <p
              className="font-serif italic mt-0.5"
              style={{
                fontSize: size * 0.045,
                color: '#b8860b',
                textShadow: '1px 1px 0 #1a0f03',
                letterSpacing: '0.3em',
              }}
            >
              ⚔ FORJA · COMBATE · CONQUISTA ⚔
            </p>
          </div>
        )}
      </div>
    )
  }