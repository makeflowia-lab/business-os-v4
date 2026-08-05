'use client'

type AvatarState = 'humano' | 'soul_reaver'

interface RazielAvatarProps {
  state: AvatarState
  isThinking: boolean
  isSpeaking: boolean
  mouthOpen?: boolean
}

export function RazielAvatar({ state, isThinking, isSpeaking, mouthOpen }: RazielAvatarProps) {
  const isSoulReaver = state === 'soul_reaver'

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Avatar frame */}
      <div
        className={`avatar-frame relative rounded-2xl overflow-hidden border-2 transition-all duration-700
          ${isSoulReaver ? 'avatar-soul-reaver soul-scanlines' : 'avatar-humano'}
        `}
      >
        {/* Images — crossfade via opacity */}
        <div className={`absolute inset-0 ${isSoulReaver ? 'soul-alive eye-glow' : 'human-idle'}`}>

          {/* Estado A — Humano */}
          <img
            src="/avatars/estado-a.png"
            alt="Raziel Humano"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700
              ${isSoulReaver ? 'opacity-0' : 'opacity-100'}`}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />

          {/* Estado B — Soul Reaver */}
          <img
            src="/avatars/estado-b.png"
            alt="Raziel Soul Reaver"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700
              ${isSoulReaver ? 'opacity-100' : 'opacity-0'}`}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />

          {/* SVG fallback */}
          <div className={`absolute inset-0 flex items-center justify-center -z-10
            ${isSoulReaver ? 'bg-gradient-to-b from-[#040c1a] to-[#060810]' : 'bg-gradient-to-b from-[#130a05] to-[#060810]'}`}>
            <svg viewBox="0 0 100 120" className="w-28 h-36 opacity-70">
              {isSoulReaver ? (
                <>
                  <ellipse cx="50" cy="52" rx="28" ry="32" fill="none" stroke="#00d4ff" strokeWidth="1.5"/>
                  <ellipse cx="38" cy="48" rx="7" ry="8" fill="#00d4ff" opacity="0.9"/>
                  <ellipse cx="62" cy="48" rx="7" ry="8" fill="#00d4ff" opacity="0.9"/>
                  <path d="M35 70 Q50 80 65 70" fill="none" stroke="#00d4ff" strokeWidth="1.5"/>
                  <path d="M22 52 Q22 20 50 12 Q78 20 78 52" fill="none" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.6"/>
                </>
              ) : (
                <>
                  <ellipse cx="50" cy="52" rx="26" ry="30" fill="none" stroke="#8b5e3c" strokeWidth="1.5"/>
                  <ellipse cx="40" cy="48" rx="5" ry="4" fill="none" stroke="#c4a882" strokeWidth="1.2"/>
                  <ellipse cx="60" cy="48" rx="5" ry="4" fill="none" stroke="#c4a882" strokeWidth="1.2"/>
                  <path d="M40 64 Q50 70 60 64" fill="none" stroke="#c4a882" strokeWidth="1.2"/>
                  <path d="M24 72 Q24 58 50 55 Q76 58 76 72" fill="none" stroke="#8b5e3c" strokeWidth="1.5"/>
                  <path d="M40 85 L50 78 L60 85 L56 96 L44 96 Z" fill="none" stroke="#c4a882" strokeWidth="1.2"/>
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Soul energy overlay */}
        {isSoulReaver && (
          <div className="soul-energy absolute inset-0 pointer-events-none" />
        )}

        {/* Lip sync overlay — mouth area (lower 28% of image) */}
        {isSpeaking && (
          <div className={`lipsync-overlay absolute left-0 right-0 pointer-events-none
            ${mouthOpen ? 'lipsync-open' : 'lipsync-closed'}
            ${isSoulReaver ? 'lipsync-soul' : 'lipsync-human'}`}
          />
        )}

        {/* Speaking outer ring */}
        {isSpeaking && (
          <div className={`absolute inset-0 rounded-2xl pointer-events-none speaking-ring
            ${isSoulReaver ? 'speaking-ring-soul' : 'speaking-ring-human'}`}
          />
        )}

        {/* Thinking dots */}
        {isThinking && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            <div className="typing-dot w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
            <div className="typing-dot w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
            <div className="typing-dot w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
          </div>
        )}
      </div>

      {/* Labels */}
      <div className="flex flex-col items-center gap-0.5">
        <span className={`text-xs font-semibold tracking-widest uppercase transition-colors duration-700
          ${isSoulReaver ? 'text-[#00d4ff]' : 'text-[#c4a882]'}`}>
          RAZIEL
        </span>
        <span className={`text-[10px] tracking-wider transition-colors duration-700
          ${isSoulReaver ? 'text-[rgba(0,212,255,0.6)]' : 'text-[rgba(196,168,130,0.5)]'}`}>
          {isSoulReaver ? 'SEGADOR DE ALMAS' : 'PRIMER TENIENTE'}
        </span>
        {isSpeaking && (
          <span className="text-[9px] text-[#00d4ff] tracking-widest animate-pulse mt-0.5">
            ◆ HABLANDO
          </span>
        )}
      </div>
    </div>
  )
}
