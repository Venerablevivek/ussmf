// The design's inline SVG sprite: U.S.S.M.F. seal, UI icons and the custom air sports icons.
// Rendered once in the root layout; <Icon name="…"/> and <Seal/> reference these symbols.

export default function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sealG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4C8DFF" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="wingG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#60A5FA" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="tlg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FF7A6B" />
          <stop offset=".5" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <symbol id="seal" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="49" fill="url(#sealG)" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth=".7" />
        <path id="sealArc" d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0" fill="none" />
        <text
          fontSize="5.6"
          fontWeight="700"
          fill="#fff"
          letterSpacing=".6"
          style={{ fontFamily: "var(--f-display)" }}
        >
          <textPath href="#sealArc" textLength="226" lengthAdjust="spacingAndGlyphs">
            UNITED STATES SPORTS MEDICINE FEDERATION ★ AIR SPORTS ★
          </textPath>
        </text>
        <circle cx="50" cy="50" r="29" fill="#fff" />
        <circle cx="50" cy="50" r="26.5" fill="#F5F9FF" stroke="#DCE6F7" strokeWidth=".8" />
        <path
          d="M45 53c-6.5.5-12.5-2-16-7 4.2 1.3 8.4 1.4 11.6.4-3.2-.4-6.4-2.4-7.6-4.8 4.4 1.6 8.8 1.8 12 1.6z"
          fill="url(#wingG)"
        />
        <path
          d="M55 53c6.5.5 12.5-2 16-7-4.2 1.3-8.4 1.4-11.6.4 3.2-.4 6.4-2.4 7.6-4.8-4.4 1.6-8.8 1.8-12 1.6z"
          fill="url(#wingG)"
        />
        <rect x="46.2" y="35" width="7.6" height="23" rx="2.4" fill="#FF7A6B" />
        <rect x="39" y="42.7" width="22" height="7.6" rx="2.4" fill="#FF7A6B" />
        <text
          x="50"
          y="68.5"
          textAnchor="middle"
          fontSize="6.2"
          fontWeight="800"
          fill="#0F1B3D"
          letterSpacing=".4"
          style={{ fontFamily: "var(--f-display)" }}
        >
          USSMF
        </text>
      </symbol>
      <symbol id="i-arrow" viewBox="0 0 24 24">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </symbol>
      <symbol id="i-check" viewBox="0 0 24 24">
        <path d="M5 12.5l4.5 4.5L19 7" />
      </symbol>
      <symbol id="i-x" viewBox="0 0 24 24">
        <path d="M6 6l12 12M18 6L6 18" />
      </symbol>
      <symbol id="i-menu" viewBox="0 0 24 24">
        <path d="M4 7h16M4 12h16M4 17h10" />
      </symbol>
      <symbol id="i-trophy" viewBox="0 0 24 24">
        <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4.5a3 3 0 0 0 3 4.2M17 6h2.5a3 3 0 0 1-3 4.2" />
      </symbol>
      <symbol id="i-shield" viewBox="0 0 24 24">
        <path d="M12 3l8 3v6c0 4.6-3.4 8-8 9-4.6-1-8-4.4-8-9V6z" />
        <path d="M9 12l2 2 4-4" />
      </symbol>
      <symbol id="i-steth" viewBox="0 0 24 24">
        <path d="M6 3H5v6a4 4 0 0 0 8 0V3h-1" />
        <path d="M9 13v2a5 5 0 0 0 10 0v-3" />
        <circle cx="19" cy="10" r="2" />
      </symbol>
      <symbol id="i-pulse" viewBox="0 0 24 24">
        <path d="M2 12h4l2.5-6 4 12 2.5-6H22" />
      </symbol>
      <symbol id="i-heart" viewBox="0 0 24 24">
        <path d="M12 20s-8.5-5.2-8.5-11A4.8 4.8 0 0 1 12 6.2 4.8 4.8 0 0 1 20.5 9c0 5.8-8.5 11-8.5 11z" />
      </symbol>
      <symbol id="i-flask" viewBox="0 0 24 24">
        <path d="M9 3h6M10 3v6l-5.5 9.6A2 2 0 0 0 6.2 21.5h11.6a2 2 0 0 0 1.7-2.9L14 9V3M7 15h10" />
      </symbol>
      <symbol id="i-doc" viewBox="0 0 24 24">
        <rect x="5" y="4" width="14" height="17" rx="2.5" />
        <path d="M9 4V2.8h6V4M9 10h6M9 14h6M9 18h3" />
      </symbol>
      <symbol id="i-file" viewBox="0 0 24 24">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5M9 13h6M9 17h4" />
      </symbol>
      <symbol id="i-globe" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </symbol>
      <symbol id="i-star" viewBox="0 0 24 24">
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
      </symbol>
      <symbol id="i-micro" viewBox="0 0 24 24">
        <path d="M6 21h12M9 17.5h6M10.5 3.5l4 2-3 6-4-2zM12.5 11.5a5 5 0 0 1 2.5 9.5M8.5 9.5 7 12.5" />
      </symbol>
      <symbol id="i-dna" viewBox="0 0 24 24">
        <path d="M7 3c0 6 10 6 10 12s-10 3-10 6M17 3c0 6-10 6-10 12M17 21c0-1.5-.6-2.6-1.6-3.4M9 7h6M9 17h6M10 12h4" />
      </symbol>
      <symbol id="i-book" viewBox="0 0 24 24">
        <path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2zM4 20a2 2 0 0 0 2 2h13v-4" />
        <path d="M9 7h6" />
      </symbol>
      <symbol id="i-medal" viewBox="0 0 24 24">
        <circle cx="12" cy="15" r="6" />
        <path d="M8.5 10 6 3h4l2 4.5L14 3h4l-2.5 7M12 12.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z" />
      </symbol>
      <symbol id="i-cross" viewBox="0 0 24 24">
        <path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5z" />
      </symbol>
      <symbol id="i-scale" viewBox="0 0 24 24">
        <path d="M12 3v18M7 21h10M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z" />
      </symbol>
      <symbol id="i-users" viewBox="0 0 24 24">
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M16.5 14a5 5 0 0 1 5 5" />
      </symbol>
      <symbol id="i-building" viewBox="0 0 24 24">
        <path d="M3 21h18M5 21V9.5L12 4l7 5.5V21M9 21v-6h6v6M8 11h.01M12 11h.01M16 11h.01" />
      </symbol>
      <symbol id="i-upload" viewBox="0 0 24 24">
        <path d="M12 16V4M7 9l5-5 5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
      </symbol>
      <symbol id="i-search" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </symbol>
      <symbol id="i-qr" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <path d="M14 14h3v3h-3zM20 14v.01M17 20h4M20 17v3" />
      </symbol>
      <symbol id="i-mail" viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M3.5 7l8.5 6 8.5-6" />
      </symbol>
      <symbol id="i-phone" viewBox="0 0 24 24">
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
      </symbol>
      <symbol id="i-pin" viewBox="0 0 24 24">
        <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </symbol>
      <symbol id="i-cal" viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </symbol>
      <symbol id="i-target" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.2" />
      </symbol>
      <symbol id="i-eye" viewBox="0 0 24 24">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </symbol>
      <symbol id="i-rocket" viewBox="0 0 24 24">
        <path d="M5 15c-1.5 1.5-2 4-2 6 2 0 4.5-.5 6-2M9 15l-3-3c1.2-4.5 4.6-8.3 12-9-.7 7.4-4.5 10.8-9 12zM6 12H3l2-4h4M12 18v3l4-2v-4" />
        <circle cx="15" cy="9" r="1.5" />
      </symbol>
      <symbol id="i-lock" viewBox="0 0 24 24">
        <rect x="5" y="11" width="14" height="10" rx="2.5" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </symbol>
      <symbol id="i-copy" viewBox="0 0 24 24">
        <rect x="9" y="9" width="11" height="11" rx="2.5" />
        <path d="M5 15V6a2 2 0 0 1 2-2h8" />
      </symbol>
      <symbol id="i-download" viewBox="0 0 24 24">
        <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
      </symbol>
      <symbol id="i-share" viewBox="0 0 24 24">
        <circle cx="18" cy="5" r="2.5" />
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="18" cy="19" r="2.5" />
        <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
      </symbol>
      <symbol id="i-user" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </symbol>
      <symbol id="i-clip" viewBox="0 0 24 24">
        <path d="M20 11.5l-8.2 8.2a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.7 17.2a1.7 1.7 0 0 1-2.4-2.4l7.6-7.6" />
      </symbol>
      <symbol id="i-alert" viewBox="0 0 24 24">
        <path d="M12 3l10 18H2z" />
        <path d="M12 10v4M12 17.5v.01" />
      </symbol>
      <symbol id="i-clock" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </symbol>
      <symbol id="i-plane" viewBox="0 0 24 24">
        <path d="M21 3L3 10.5l7 2.5 2.5 7z" />
        <path d="M10 13l11-10" />
      </symbol>
      <symbol id="i-wings" viewBox="0 0 24 24">
        <path d="M12 7v13M3 8c3 0 6 1 9 4 3-3 6-4 9-4M5 12c2 0 4.5.6 7 2.5 2.5-1.9 5-2.5 7-2.5" />
        <circle cx="12" cy="5" r="1.6" />
      </symbol>
      {/* air sports */}
      <symbol id="i-parachute" viewBox="0 0 24 24">
        <path d="M3 10.5a9 7 0 0 1 18 0" />
        <path d="M3 10.5c1.5-1.2 3-1.2 4.5 0 1.5-1.2 3-1.2 4.5 0 1.5-1.2 3-1.2 4.5 0 1.5-1.2 3-1.2 4.5 0" />
        <path d="M3.2 10.8 11 18M20.8 10.8 13 18M12 10.5V18" />
        <rect x="10.5" y="18" width="3" height="3.5" rx="1" />
      </symbol>
      <symbol id="i-paraglider" viewBox="0 0 24 24">
        <path d="M2 8.5C5 4 19 4 22 8.5" />
        <path d="M2 8.5c3-1.4 17-1.4 20 0" />
        <path d="M4.5 8.8 11 17.5M19.5 8.8 13 17.5M12 7.6v9.9" />
        <circle cx="12" cy="19.4" r="1.8" />
      </symbol>
      <symbol id="i-hang" viewBox="0 0 24 24">
        <path d="M2 11 12 5l10 6-10 2z" />
        <path d="M12 13v4M8.5 17h7M12 17l-1.6 4M12 17l1.6 4" />
      </symbol>
      <symbol id="i-glider" viewBox="0 0 24 24">
        <path d="M1.5 11.5 11 11h2l9.5.5" />
        <path d="M9 11l1.5-3.5h3L15 11M11 11.5l.7 5.5h.6l.7-5.5M9.5 17.5h5" />
      </symbol>
      <symbol id="i-balloon" viewBox="0 0 24 24">
        <path d="M12 2.5a7 7 0 0 0-7 7c0 4 4 7 5 8.5h4c1-1.5 5-4.5 5-8.5a7 7 0 0 0-7-7z" />
        <path d="M12 2.5c-2 2-3 4.6-3 7s1 5.5 1 8.5M12 2.5c2 2 3 4.6 3 7s-1 5.5-1 8.5" />
        <rect x="10" y="19" width="4" height="3" rx=".8" />
      </symbol>
      <symbol id="i-drone" viewBox="0 0 24 24">
        <circle cx="5.5" cy="5.5" r="2.6" />
        <circle cx="18.5" cy="5.5" r="2.6" />
        <circle cx="5.5" cy="18.5" r="2.6" />
        <circle cx="18.5" cy="18.5" r="2.6" />
        <rect x="9" y="9" width="6" height="6" rx="1.8" />
        <path d="M7.5 7.5 9 9M16.5 7.5 15 9M7.5 16.5 9 15M16.5 16.5 15 15" />
      </symbol>
      <symbol id="i-aero" viewBox="0 0 24 24">
        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
      </symbol>
      <symbol id="i-paramotor" viewBox="0 0 24 24">
        <path d="M3 7.5C6 4 18 4 21 7.5" />
        <path d="M5.5 8 10.5 15M18.5 8 13.5 15" />
        <circle cx="12" cy="17.5" r="3.3" />
        <path d="M12 14.2v6.6M8.7 17.5h6.6" />
      </symbol>
      {/* portal extras, drawn in the same stroke style */}
      <symbol id="i-logout" viewBox="0 0 24 24">
        <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" />
      </symbol>
      <symbol id="i-grid" viewBox="0 0 24 24">
        <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
      </symbol>
      <symbol id="i-refresh" viewBox="0 0 24 24">
        <path d="M20 11a8 8 0 0 0-14.6-4.5M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5M20 20v-4h-4" />
      </symbol>
    </svg>
  );
}
