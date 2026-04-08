import { useState, useEffect, useRef } from "react";

// - SVG ICON SYSTEM -
const Icon = ({ name, size = 18, color = "currentColor", strokeWidth = 1.5 }) => {
  const icons = {
    home: <><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    building: <><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22V12h6v10M9 7h1m4 0h1M9 11h1m4 0h1"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M6 20v-1a6 6 0 0112 0v1"/></>,
    star: <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>,
    ai: <><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M9 11V7a3 3 0 016 0v4"/><circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="15" cy="16" r="1" fill="currentColor"/></>,
    key: <><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5L19 4l1 3 3-1-1.5 3.5"/></>,
    wifi: <><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></>,
    bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
    globe: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></>,
    mapPin: <><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
    chevronRight: <path d="M9 18l6-6-6-6"/>,
    send: <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>,
    check: <path d="M20 6L9 17l-5-5"/>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></>,
    car: <><path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h11l4 4v4a2 2 0 01-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M3 9h11"/></>,
    plane: <><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></>,
    shoppingBag: <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 01-8 0"/></>,
    sparkles: <><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17z"/><path d="M19 3l.5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5L19 3z"/></>,
    heart: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>,
    utensils: <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></>,
    flower: <><circle cx="12" cy="12" r="3"/><path d="M12 2a4 4 0 014 4c0 1.5-.8 2.8-2 3.5A4 4 0 0112 22a4 4 0 01-4-4c0-1.5.8-2.8 2-3.5A4 4 0 018 6a4 4 0 014-4zM2 12a4 4 0 014-4c1.5 0 2.8.8 3.5 2A4 4 0 0122 12a4 4 0 01-4 4c-1.5 0-2.8-.8-3.5-2A4 4 0 012 12z"/></>,
    tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    logOut: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></>,
    parking: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 010 6H9"/></>,
    slash: <><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></>,
    smoke: <><path d="M3 16h12M3 12h12"/><path d="M19 16h2M19 12h2M17 12a4 4 0 000-8"/></>,
    paw: <><circle cx="4.5" cy="9" r="2"/><circle cx="9" cy="4.5" r="2"/><circle cx="15" cy="4.5" r="2"/><circle cx="19.5" cy="9" r="2"/><path d="M12 19c-3.9 0-7-2.7-7-6.1C5 9.9 7.5 8 9.3 8h5.4c1.8 0 4.3 1.9 4.3 4.9C19 16.3 15.9 19 12 19z"/></>,
    swim: <><path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M15 5.5l3-2"/></>,
    tv: <><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M17 2l-5 5-5-5"/></>,
    coffee: <><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3"/></>,
    bath: <><path d="M9 6L6.5 3.5a1.5 1.5 0 00-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 002 2h12a2 2 0 002-2v-5M3 13h18"/></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
    trophy: <><path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M8 22V12M16 22V12M12 17v5M6 4v8a6 6 0 0012 0V4H6z"/></>,
    gift: <><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></>,
    messageCircle: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>,
    history: <><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 106 5.3L3 8"/><path d="M12 7v5l4 2"/></>,
    wallet: <><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 13h.01M2 7l10-5 10 5"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    repeat: <><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></>,
    concierge: <><path d="M3 20h18M12 4v4m-6 2a6 6 0 0112 0H6z"/></>,
    baby: <><circle cx="12" cy="7" r="4"/><path d="M3 20v-1a5 5 0 015-5h8a5 5 0 015 5v1M8 11h8"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }}>
      {icons[name] ?? <circle cx="12" cy="12" r="10"/>}
    </svg>
  );
};

// - DATA -
const RES = {
  guest: { firstName: "Marc", stays: 3, wallet: 180 },
  property: {
    name: "The Opus", district: "Business Bay", city: "Dubai",
    bedrooms: 2, bathrooms: 2, maxGuests: 4,
    cover: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    ],
    description: "Appartement de prestige au cœur de Business Bay, avec vue panoramique sur le canal de Dubaï et la skyline. Intérieur signé par un architecte d'intérieur de renom, finitions haut de gamme.",
    amenities: [
      { i: "swim",    l: "Piscine" }, { i: "trophy",  l: "Salle de sport" },
      { i: "parking", l: "Parking" }, { i: "sparkles",l: "Climatisation" },
      { i: "tv",      l: "Smart TV" },{ i: "coffee",  l: "Nespresso" },
      { i: "bath",    l: "Baignoire"},{ i: "shield",  l: "Conciergerie 24/7" },
      { i: "wifi",    l: "WiFi fibre"},{ i: "lock",   l: "Accès sécurisé" },
    ],
    rules: [
      { i: "clock",   t: "Arrivée après 15h00" },
      { i: "logOut",  t: "Départ avant 11h00" },
      { i: "smoke",   t: "Non-fumeur" },
      { i: "paw",     t: "Animaux non admis" },
      { i: "slash",   t: "Fêtes non autorisées" },
    ],
    nearby: [
      { n: "DIFC",         d: "5 min",  i: "building" },
      { n: "Dubai Mall",   d: "10 min", i: "shoppingBag" },
      { n: "Burj Khalifa", d: "12 min", i: "building" },
      { n: "Aéroport DXB", d: "20 min", i: "plane" },
    ],
    wifi: { ssid: "TheOpus_Premium", pass: "Dubai2025#" },
    access: { code: "4892", info: "Entrée principale P1, ascenseur 28e étage, app. 2804." },
    parking: "Niveau B2, place n°47, badge dans le tiroir de l'entrée.",
    checkin: "Check-in entièrement autonome. Code communiqué 24h avant l'arrivée. Livret numérique disponible sur la tablette.",
    checkout: "Laissez les clés dans la boîte à code. Fermez les fenêtres avant de partir.",
  },
  checkIn: "2025-05-12", checkOut: "2025-05-19",
  checkInTime: "15:00",  checkOutTime: "11:00",
  nights: 7, status: "active", ref: "YH-2025-0847",
};

const SVCS = [
  { id:1, cat:"Arrivée",      i:"plane",      n:"Transfert aéroport",       d:"Prise en charge DXB ou DWC",            p:"€65",          t:"paid" },
  { id:2, cat:"Arrivée",      i:"shoppingBag",n:"Courses avant arrivée",    d:"Panier préparé à votre arrivée",        p:"€45 + courses", t:"paid" },
  { id:3, cat:"Confort",      i:"sparkles",   n:"Ménage additionnel",        d:"Ménage complet pendant le séjour",      p:"€80",          t:"paid" },
  { id:4, cat:"Confort",      i:"logOut",     n:"Late check-out",            d:"Départ jusqu'à 14h selon dispo",        p:"€50",          t:"paid" },
  { id:5, cat:"Confort",      i:"clock",      n:"Early check-in",            d:"Arrivée dès 12h selon dispo",           p:"€50",          t:"paid" },
  { id:6, cat:"Famille",      i:"heart",      n:"Lit bébé",                  d:"Lit bébé + literie inclus",             p:"Inclus",       t:"included" },
  { id:7, cat:"Famille",      i:"baby",       n:"Chaise haute",              d:"Chaise haute homologuée",               p:"Inclus",       t:"included" },
  { id:8, cat:"Expériences",  i:"utensils",   n:"Réservation restaurant",    d:"Nous réservons la meilleure table",     p:"Sur demande",  t:"request" },
  { id:9, cat:"Expériences",  i:"flower",     n:"Massage à domicile",        d:"Thérapeute certifié à l'appartement",   p:"€120/h",       t:"paid" },
  { id:10,cat:"Expériences",  i:"gift",       n:"Occasion spéciale",         d:"Décoration anniversaire ou romantique", p:"Sur demande",  t:"request" },
  { id:11,cat:"Mobilité",     i:"car",        n:"Location véhicule",         d:"Partenaire de confiance",               p:"Sur demande",  t:"request" },
  { id:12,cat:"Mobilité",     i:"car",        n:"Chauffeur privé",           d:"Demi-journée ou journée complète",      p:"€180/j",       t:"paid" },
];

const CHIPS = [
  { i:"key",           l:"Arrivée" },
  { i:"wifi",          l:"WiFi" },
  { i:"parking",       l:"Parking" },
  { i:"concierge",     l:"Service" },
  { i:"logOut",        l:"Check-out" },
  { i:"alert",         l:"Problème" },
  { i:"utensils",      l:"Restaurant" },
  { i:"mapPin",        l:"Quartier" },
];

const AI_R = {
  "Arrivée":   "Check-in autonome. Code **4892** → entrée P1 → ascenseur → 28e étage → app. **2804**. Arrivée à partir de **15h00**.",
  "WiFi":      "Réseau : **TheOpus_Premium** · Mot de passe : **Dubai2025#** · Fibre disponible dans toutes les pièces.",
  "Parking":   "Place **B2 n°47**. Badge magnétique dans le tiroir de l'entrée. Rampe côté est du bâtiment.",
  "Check-out": "Départ prévu **19 mai à 11h**. Laissez les clés dans la boîte à code. Souhaitez-vous un late check-out ?",
  "Problème":  "Décrivez le problème, je crée un ticket immédiatement. Urgence : **+971 50 XXX XXXX** (24h/24).",
  "Restaurant":"Je recommande **Zuma** (japonais), **Scalini** (italien) ou **La Serre** (français, DIFC 5 min). Réservation souhaitée ?",
  "Quartier":  "**DIFC** 5 min · **Dubai Mall** 10 min · **Burj Khalifa** 12 min · Metro Business Bay 7 min à pied.",
  "Service":   "Services disponibles : ménage, late check-out, transfert, massage, chef privé... Quel est votre besoin ?",
};

// - HELPERS -
const fmtShort = d => new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"short"});
const fmtLong  = d => new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
const PHASE = { upcoming:{l:"À VENIR",c:"#C4A46B",bg:"rgba(196,164,107,.14)"}, active:{l:"EN COURS",c:"#3D7A56",bg:"rgba(61,122,86,.14)"}, completed:{l:"TERMINÉ",c:"#6A6050",bg:"rgba(106,96,80,.10)"} };

// - STYLES -
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Raleway:wght@200;300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
:root{--bg:#F7F4EF;--card:#fff;--text:#1A1510;--sub:#6A6050;--muted:#A09880;--gold:#C4A46B;--gold-dk:#8A6A38;--green:#3D7A56;--bd:#EDE8E0;--r:20px;--rs:12px;--px:22px}
body{background:var(--bg);font-family:'Raleway',sans-serif;color:var(--text);-webkit-font-smoothing:antialiased}
.app{max-width:430px;margin:0 auto;min-height:100vh;background:var(--bg)}

/* HEADER */
.hdr{display:flex;align-items:center;justify-content:space-between;padding:16px var(--px) 12px;background:var(--bg);position:sticky;top:0;z-index:50}
.hdr-brand{font-weight:600;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--text)}
.hdr-sub{font-size:9px;letter-spacing:2px;color:var(--muted);text-transform:uppercase;font-weight:300}
.hdr-r{display:flex;gap:8px}
.hbtn{width:38px;height:38px;border-radius:12px;border:none;background:var(--card);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted);box-shadow:0 1px 4px rgba(0,0,0,.06);position:relative;flex-shrink:0}
.hnotif{position:absolute;top:7px;right:7px;width:7px;height:7px;border-radius:50%;background:var(--gold);border:1.5px solid var(--bg)}

/* NAV */
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--card);border-top:1px solid var(--bd);display:flex;align-items:stretch;padding:0 0 20px;z-index:50}
.ni{display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;padding:10px 6px 0;flex:1;color:var(--muted)}
.ni.on{color:var(--gold-dk)}
.nibar{width:16px;height:2px;background:var(--gold);border-radius:2px;margin-bottom:2px}
.nilbl{font-size:9px;letter-spacing:.5px;font-weight:500;text-transform:uppercase;font-family:'Raleway',sans-serif}

/* PAGE */
.page{padding:0 0 100px;animation:fi .3s ease}
@keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
.ptitle{font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:300;padding:18px var(--px) 4px}
.psub{font-size:12px;color:var(--muted);padding:0 var(--px) 20px;font-weight:300;letter-spacing:.3px}
.slbl{font-size:9px;letter-spacing:2px;font-weight:600;color:var(--muted);text-transform:uppercase;padding:18px var(--px) 10px}

/* HERO */
.hero{position:relative;height:290px;overflow:hidden;margin:4px var(--px) 0;border-radius:var(--r)}
.hero img{width:100%;height:100%;object-fit:cover}
.hero-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(15,10,5,.78) 0%,rgba(15,10,5,.05) 55%,transparent 100%)}
.hero-ct{position:absolute;bottom:20px;left:20px;right:20px;color:#fff}
.hbadge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:9px;letter-spacing:1.5px;font-weight:600;text-transform:uppercase;margin-bottom:8px}
.htitle{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:400;line-height:1.2}
.hsub{font-size:11px;color:rgba(255,255,255,.7);font-weight:300;margin-top:3px}
.hdates{font-size:11px;color:rgba(255,255,255,.5);font-weight:300;margin-top:6px;display:flex;align-items:center;gap:5px}

/* BANNER */
.pbanner{margin:12px var(--px);padding:13px 16px;border-radius:var(--rs);display:flex;align-items:center;gap:11px}
.pdot{width:7px;height:7px;border-radius:50%;flex-shrink:0}

/* QUICK GRID */
.qgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 var(--px)}
.qi{background:var(--card);border-radius:16px;padding:16px 8px 14px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;box-shadow:0 1px 6px rgba(0,0,0,.04);transition:transform .15s}
.qi:active{transform:scale(.96)}
.qico{width:42px;height:42px;border-radius:13px;background:rgba(196,164,107,.09);display:flex;align-items:center;justify-content:center}
.qlbl{font-size:10px;font-weight:500;color:var(--sub);text-align:center;letter-spacing:.2px}

/* INFO BLOCK */
.ib{background:var(--card);border-radius:var(--r);margin:0 var(--px) 12px;overflow:hidden}
.ir{display:flex;gap:13px;padding:15px 18px;border-bottom:1px solid var(--bd);align-items:flex-start}
.ir:last-child{border-bottom:none}
.iico{width:34px;height:34px;border-radius:11px;background:rgba(196,164,107,.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.ilbl{font-size:9px;letter-spacing:1.2px;color:var(--muted);text-transform:uppercase;font-weight:600;margin-bottom:4px}
.ival{font-size:13px;color:var(--text);font-weight:400;line-height:1.5}
.ival.code{font-family:'Courier New',monospace;font-size:22px;font-weight:700;color:var(--gold-dk);letter-spacing:6px}

/* GALLERY */
.gscr{display:flex;gap:10px;padding:12px var(--px) 0;overflow-x:auto;scrollbar-width:none}
.gscr::-webkit-scrollbar{display:none}
.gthm{width:110px;height:76px;border-radius:12px;object-fit:cover;flex-shrink:0;cursor:pointer;transition:opacity .2s}

/* AMENITIES */
.agrid{display:flex;flex-wrap:wrap;gap:8px;padding:0 var(--px)}
.achip{background:var(--card);border:1px solid var(--bd);border-radius:20px;padding:7px 13px;font-size:12px;color:var(--sub);display:flex;align-items:center;gap:7px;font-weight:400}

/* CATEGORY TABS */
.ctabs{display:flex;gap:8px;padding:0 var(--px);overflow-x:auto;scrollbar-width:none;margin-bottom:16px}
.ctabs::-webkit-scrollbar{display:none}
.ctab{padding:8px 16px;border-radius:20px;font-size:11px;font-weight:500;white-space:nowrap;cursor:pointer;border:1.5px solid var(--bd);background:transparent;color:var(--sub);font-family:'Raleway',sans-serif;transition:all .2s}
.ctab.on{background:var(--gold);border-color:var(--gold);color:#fff}

/* SERVICE CARDS */
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 var(--px)}
.sc{background:var(--card);border-radius:var(--rs);overflow:hidden;cursor:pointer;box-shadow:0 1px 6px rgba(0,0,0,.04);transition:transform .15s}
.sc:active{transform:scale(.97)}
.simg{width:100%;height:80px;display:flex;align-items:center;justify-content:center;background:rgba(196,164,107,.07)}
.sbod{padding:12px}
.sn{font-size:12px;font-weight:500;color:var(--text);margin-bottom:3px;line-height:1.3}
.sd{font-size:10px;color:var(--muted);margin-bottom:8px;font-weight:300;line-height:1.4}
.sf{display:flex;align-items:center;justify-content:space-between}
.sp{font-size:11px;font-weight:600;color:var(--gold-dk)}
.sbg{font-size:9px;padding:3px 8px;border-radius:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.inc{background:rgba(61,122,86,.1);color:var(--green)}
.paid{background:rgba(196,164,107,.1);color:var(--gold-dk)}
.req{background:rgba(106,96,80,.1);color:var(--sub)}

/* CHAT */
.cwrap{padding:0 var(--px);display:flex;flex-direction:column;gap:12px}
.bbl{max-width:85%;padding:13px 16px;border-radius:18px;font-size:13px;line-height:1.55;font-weight:300}
.bbl.ai{background:var(--card);color:var(--text);border-bottom-left-radius:4px;align-self:flex-start;box-shadow:0 1px 6px rgba(0,0,0,.05)}
.bbl.usr{background:var(--gold);color:#fff;border-bottom-right-radius:4px;align-self:flex-end}
.bsndr{font-size:9px;letter-spacing:1px;color:var(--muted);text-transform:uppercase;font-weight:600;margin-bottom:5px}
.cbar{position:fixed;bottom:78px;left:50%;transform:translateX(-50%);width:100%;max-width:430px;padding:10px var(--px);background:var(--bg);border-top:1px solid var(--bd);display:flex;gap:10px;align-items:center}
.cinp{flex:1;background:var(--card);border:1.5px solid var(--bd);border-radius:22px;padding:12px 18px;font-family:'Raleway',sans-serif;font-size:13px;color:var(--text);outline:none}
.cinp::placeholder{color:var(--muted)}
.csnd{width:44px;height:44px;border-radius:14px;background:var(--gold);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;flex-shrink:0}
.chips{display:flex;gap:8px;padding:0 var(--px) 10px;overflow-x:auto;scrollbar-width:none}
.chips::-webkit-scrollbar{display:none}
.chip{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:20px;background:var(--card);border:1.5px solid var(--bd);font-size:11px;color:var(--sub);white-space:nowrap;cursor:pointer;font-family:'Raleway',sans-serif;transition:all .15s}
.chip:active{background:var(--gold);border-color:var(--gold);color:#fff}

/* LOYALTY */
.lcard{background:linear-gradient(135deg,#1A1510,#2D2418);border-radius:var(--r);margin:0 var(--px) 12px;padding:22px;color:#fff;position:relative;overflow:hidden}
.lcard::before{content:'';position:absolute;top:-40px;right:-40px;width:150px;height:150px;border-radius:50%;background:rgba(196,164,107,.07)}
.lbdg{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold);font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:6px}
.ltit{font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:300;color:#fff;margin-bottom:4px}
.lsub{font-size:11px;color:rgba(255,255,255,.4);font-weight:300}
.lwlt{display:flex;align-items:baseline;gap:4px;margin-top:18px}
.lamt{font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:300;color:var(--gold)}
.lunt{font-size:11px;color:rgba(255,255,255,.4);letter-spacing:.5px}
.lavs{display:flex;gap:8px;margin-top:14px}
.lav{flex:1;background:rgba(255,255,255,.05);border-radius:11px;padding:10px 11px;font-size:10px;color:rgba(255,255,255,.5)}
.lav strong{display:block;color:var(--gold);font-weight:500;margin-bottom:2px;font-size:10px}

/* STAY CARDS */
.stcard{background:var(--card);border-radius:var(--r);margin:0 var(--px) 12px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.04)}
.stph{width:100%;height:140px;object-fit:cover}
.stbd{padding:16px 18px}
.stn{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:400}
.stm{font-size:11px;color:var(--muted);margin-top:3px;font-weight:300;display:flex;align-items:center;gap:5px}

/* MODAL */
.mov{position:fixed;inset:0;background:rgba(0,0,0,.52);z-index:200;display:flex;align-items:flex-end}
.msh{background:var(--bg);border-radius:24px 24px 0 0;padding:20px var(--px) 40px;width:100%;max-width:430px;margin:0 auto;animation:su .3s ease}
@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}
.mhnd{width:36px;height:4px;background:var(--bd);border-radius:2px;margin:0 auto 20px}
.mtit{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:400;margin-bottom:6px}
.mpr{font-size:24px;font-weight:300;color:var(--gold-dk);font-family:'Cormorant Garamond',serif;margin-bottom:12px}
.mds{font-size:13px;color:var(--sub);line-height:1.6;font-weight:300;margin-bottom:20px}

/* BUTTONS */
.btn-p{background:var(--gold);color:#fff;border:none;border-radius:14px;padding:14px 28px;font-family:'Raleway',sans-serif;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;width:100%;transition:background .2s;display:flex;align-items:center;justify-content:center;gap:8px}
.btn-p:active{background:var(--gold-dk)}
.btn-o{background:transparent;color:var(--gold-dk);border:1.5px solid var(--bd);border-radius:14px;padding:12px 24px;font-family:'Raleway',sans-serif;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;width:100%}

/* STAR */
.srat{display:flex;gap:8px;justify-content:center;margin:16px 0}
.sst{font-size:32px;cursor:pointer;transition:transform .15s;user-select:none}
.rtxt{width:100%;background:var(--card);border:1.5px solid var(--bd);border-radius:14px;padding:14px 16px;font-family:'Raleway',sans-serif;font-size:13px;color:var(--text);outline:none;resize:none;min-height:100px;margin-bottom:16px}

/* DOTS */
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.dot{width:7px;height:7px;border-radius:50%;background:var(--gold)}
`;

// - COMPONENTS -
function Hdr({ right }) {
  return (
    <div className="hdr">
      <div><div className="hdr-brand">Your Home</div><div className="hdr-sub">· Conciergerie</div></div>
      <div className="hdr-r">
        <button className="hbtn"><Icon name="globe" size={15}/></button>
        <button className="hbtn"><Icon name="bell" size={15}/><span className="hnotif"/></button>
        {right ?? <button className="hbtn"><Icon name="user" size={15}/></button>}
      </div>
    </div>
  );
}

function IR({ ico, lbl, children, onClick, extra }) {
  return (
    <div className="ir" style={onClick ? { cursor:"pointer" } : {}} onClick={onClick}>
      <div className="iico"><Icon name={ico} size={15} color="var(--gold-dk)"/></div>
      <div style={{ flex:1 }}>
        <div className="ilbl">{lbl}</div>
        <div className="ival">{children}</div>
        {extra}
      </div>
    </div>
  );
}

// - HOME -
function HomeScreen({ onNav }) {
  const ph = PHASE[RES.status];
  const bn = {
    upcoming: { bg:"rgba(196,164,107,.08)", dot:"#C4A46B", txt:`Séjour le ${fmtShort(RES.checkIn)}. Préparez votre arrivée.` },
    active:   { bg:"rgba(61,122,86,.08)",   dot:"#3D7A56", txt:"Bienvenue ! Votre séjour est en cours. Comment pouvons-nous vous aider ?" },
    completed:{ bg:"rgba(106,96,80,.08)",   dot:"#A09880", txt:"Merci pour votre séjour. Votre avis nous est précieux." },
  }[RES.status];
  const qa = [
    { i:"key",          l:"Arrivée",   t:1 },{ i:"wifi",         l:"WiFi",      t:1 },
    { i:"concierge",    l:"Services",  t:3 },{ i:"messageCircle",l:"Assistant", t:4 },
    { i:"building",     l:"Logement",  t:2 },{ i:"alert",        l:"Problème",  t:4 },
  ];
  return (
    <div className="page">
      <Hdr/>
      <div className="hero">
        <img src={RES.property.cover} alt={RES.property.name}/>
        <div className="hero-ov"/>
        <div className="hero-ct">
          <div className="hbadge" style={{ background:ph.bg, color:ph.c }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:ph.c,display:"inline-block" }}/>
            {ph.l}
          </div>
          <div className="htitle">{RES.property.name}</div>
          <div className="hsub">{RES.property.district} · {RES.property.city}</div>
          <div className="hdates">
            <Icon name="calendar" size={11} color="rgba(255,255,255,.5)"/>
            {fmtShort(RES.checkIn)} → {fmtShort(RES.checkOut)} · {RES.nights} nuits
          </div>
        </div>
      </div>

      <div className="pbanner" style={{ background:bn.bg }}>
        <div className="pdot" style={{ background:bn.dot }}/>
        <div style={{ fontSize:12,color:"var(--sub)",fontWeight:400,lineHeight:1.5 }}>{bn.txt}</div>
      </div>

      <div className="slbl">Accès rapide</div>
      <div className="qgrid">
        {qa.map(a => (
          <div key={a.l} className="qi" onClick={() => onNav(a.t)}>
            <div className="qico"><Icon name={a.i} size={18} color="var(--gold-dk)"/></div>
            <div className="qlbl">{a.l}</div>
          </div>
        ))}
      </div>

      <div className="slbl">Réservation</div>
      <div className="ib">
        <IR ico="calendar" lbl="Arrivée">{fmtLong(RES.checkIn)} · {RES.checkInTime}</IR>
        <IR ico="calendar" lbl="Départ">{fmtLong(RES.checkOut)} · {RES.checkOutTime}</IR>
        <IR ico="tag" lbl="Confirmation">{RES.ref}</IR>
      </div>
    </div>
  );
}

// - STAY -
function StayScreen() {
  const [show, setShow] = useState({ code:false, wifi:false });
  const reveal = (k) => setShow(s => ({ ...s, [k]:!s[k] }));
  return (
    <div className="page">
      <Hdr/>
      <div className="ptitle">Mon séjour</div>
      <div className="psub">{RES.property.name} · {RES.nights} nuits</div>

      <div className="slbl">Check-in</div>
      <div className="ib">
        <IR ico="clock"  lbl="Heure d'arrivée">À partir de {RES.checkInTime}</IR>
        <IR ico="mapPin" lbl="Adresse">{RES.property.name}, {RES.property.district}</IR>
        <IR ico="shield" lbl="Procédure">{RES.property.checkin}</IR>
      </div>

      <div className="slbl">Codes d'accès</div>
      <div className="ib">
        <IR ico="key" lbl="Code d'accès" onClick={() => reveal("code")}
          extra={<div style={{ fontSize:11,color:"var(--muted)",marginTop:4,fontWeight:300 }}>{RES.property.access.info}</div>}>
          {show.code
            ? <span className="ival code">{RES.property.access.code}</span>
            : <span style={{ display:"flex",alignItems:"center",gap:10 }}>
                <span style={{ letterSpacing:6,color:"var(--muted)",fontSize:16 }}>••••</span>
                <span style={{ display:"flex",alignItems:"center",gap:4,color:"var(--gold)",fontSize:9,fontWeight:700,letterSpacing:1 }}>
                  <Icon name="eye" size={12} color="var(--gold)"/> RÉVÉLER
                </span>
              </span>
          }
        </IR>
        <IR ico="wifi" lbl="WiFi" onClick={() => reveal("wifi")}
          extra={show.wifi ? <div style={{ fontSize:13,color:"var(--gold-dk)",fontWeight:600,marginTop:4 }}>{RES.property.wifi.pass}</div>
            : <span style={{ display:"flex",alignItems:"center",gap:10,marginTop:4 }}>
                <span style={{ letterSpacing:4,color:"var(--muted)",fontSize:12 }}>••••••••</span>
                <span style={{ display:"flex",alignItems:"center",gap:4,color:"var(--gold)",fontSize:9,fontWeight:700,letterSpacing:1 }}>
                  <Icon name="eye" size={12} color="var(--gold)"/> VOIR
                </span>
              </span>
          }>
          {RES.property.wifi.ssid}
        </IR>
        <IR ico="parking" lbl="Parking">{RES.property.parking}</IR>
      </div>

      <div className="slbl">Check-out</div>
      <div className="ib">
        <IR ico="clock"  lbl="Heure de départ">Avant {RES.checkOutTime} · {fmtLong(RES.checkOut)}</IR>
        <IR ico="shield" lbl="Procédure">{RES.property.checkout}</IR>
      </div>
      <div style={{ padding:"8px var(--px)" }}>
        <button className="btn-o" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
          <Icon name="clock" size={14} color="var(--gold-dk)"/> Demander un late check-out
        </button>
      </div>
    </div>
  );
}

// - PROPERTY -
function PropertyScreen() {
  const [act, setAct] = useState(0);
  return (
    <div className="page">
      <Hdr/>
      <div style={{ padding:"4px var(--px) 0" }}>
        <img src={RES.property.photos[act]} alt="" style={{ width:"100%",height:240,objectFit:"cover",borderRadius:"var(--r)" }}/>
      </div>
      <div className="gscr">
        {RES.property.photos.map((p,i) => (
          <img key={i} src={p} className="gthm" style={{ opacity:i===act?1:.55,outline:i===act?"2px solid var(--gold)":"none",outlineOffset:2 }} onClick={() => setAct(i)}/>
        ))}
      </div>

      <div style={{ padding:"18px var(--px) 4px" }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:400 }}>{RES.property.name}</h1>
        <div style={{ fontSize:12,color:"var(--muted)",marginTop:4,fontWeight:300,display:"flex",gap:12,flexWrap:"wrap" }}>
          <span style={{ display:"flex",alignItems:"center",gap:4 }}><Icon name="mapPin" size={12} color="var(--muted)"/>{RES.property.district}</span>
          <span style={{ display:"flex",alignItems:"center",gap:4 }}><Icon name="user" size={12} color="var(--muted)"/>{RES.property.maxGuests} pers. · {RES.property.bedrooms} ch. · {RES.property.bathrooms} sdb</span>
        </div>
        <p style={{ fontSize:13,color:"var(--sub)",lineHeight:1.7,marginTop:14,fontWeight:300 }}>{RES.property.description}</p>
      </div>

      <div className="slbl">Équipements</div>
      <div className="agrid">
        {RES.property.amenities.map(a => (
          <div key={a.l} className="achip">
            <Icon name={a.i} size={14} color="var(--gold-dk)"/>
            <span>{a.l}</span>
          </div>
        ))}
      </div>

      <div className="slbl">Règles du logement</div>
      <div className="ib">
        {RES.property.rules.map((r,i) => (
          <div key={i} className="ir">
            <div className="iico"><Icon name={r.i} size={15} color="var(--gold-dk)"/></div>
            <div className="ival">{r.t}</div>
          </div>
        ))}
      </div>

      <div className="slbl">À proximité</div>
      <div className="ib" style={{ margin:"0 var(--px) 12px" }}>
        {RES.property.nearby.map(n => (
          <div key={n.n} className="ir">
            <div className="iico"><Icon name={n.i} size={15} color="var(--gold-dk)"/></div>
            <div className="ival" style={{ flex:1 }}>{n.n}</div>
            <div style={{ fontSize:11,color:"var(--muted)",fontWeight:300 }}>{n.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// - SERVICES -
function ServicesScreen() {
  const [cat, setCat] = useState("Tous");
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState([]);
  const cats = ["Tous",...Array.from(new Set(SVCS.map(s => s.cat)))];
  const list = cat === "Tous" ? SVCS : SVCS.filter(s => s.cat === cat);
  return (
    <div className="page">
      <Hdr/>
      <div className="ptitle">Services</div>
      <div className="psub">Un accompagnement premium à chaque étape</div>
      <div className="ctabs">
        {cats.map(c => <button key={c} className={`ctab${cat===c?" on":""}`} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div className="sgrid">
        {list.map(s => (
          <div key={s.id} className="sc" onClick={() => setSel(s)}>
            <div className="simg"><Icon name={s.i} size={30} color="var(--gold)" strokeWidth={1.3}/></div>
            <div className="sbod">
              <div className="sn">{s.n}</div>
              <div className="sd">{s.d}</div>
              <div className="sf">
                <div className="sp">{s.p}</div>
                {done.includes(s.id)
                  ? <div className="sbg inc" style={{ display:"flex",alignItems:"center",gap:3 }}><Icon name="check" size={9} color="var(--green)"/>OK</div>
                  : <div className={`sbg ${s.t}`}>{s.t==="included"?"Inclus":s.t==="request"?"Demande":"Payant"}</div>
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      {sel && (
        <div className="mov" onClick={() => setSel(null)}>
          <div className="msh" onClick={e => e.stopPropagation()}>
            <div className="mhnd"/>
            <div style={{ width:56,height:56,borderRadius:18,background:"rgba(196,164,107,.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
              <Icon name={sel.i} size={26} color="var(--gold-dk)" strokeWidth={1.3}/>
            </div>
            <div className="mtit">{sel.n}</div>
            <div className="mpr">{sel.p}</div>
            <div className="mds">{sel.d}</div>
            {done.includes(sel.id)
              ? <div style={{ textAlign:"center",padding:14,color:"var(--green)",fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                  <Icon name="check" size={15} color="var(--green)"/> Demande envoyée
                </div>
              : <button className="btn-p" onClick={() => { setDone(d => [...d,sel.id]); setSel(null); }}>
                  <Icon name="concierge" size={14} color="#fff"/> Demander ce service
                </button>
            }
            <button className="btn-o" style={{ marginTop:10 }} onClick={() => setSel(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

// - ASSISTANT -
function AssistantScreen() {
  const [msgs, setMsgs] = useState([{ r:"ai", c:`Bonjour ${RES.guest.firstName} ! Je connais votre logement et votre séjour. Comment puis-je vous aider ?` }]);
  const [inp, setInp] = useState("");
  const [load, setLoad] = useState(false);
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const send = (txt) => {
    if (!txt.trim()) return;
    setMsgs(m => [...m,{ r:"usr",c:txt }]); setInp(""); setLoad(true);
    setTimeout(() => {
      let rep = "Je comprends votre demande. Notre équipe reste disponible si vous avez besoin d'une assistance immédiate.";
      for (const [k,v] of Object.entries(AI_R)) { if (txt.toLowerCase().includes(k.toLowerCase())||txt===k){ rep=v; break; } }
      setMsgs(m => [...m,{ r:"ai",c:rep }]); setLoad(false);
    }, 900);
  };

  return (
    <div className="page" style={{ paddingBottom:160 }}>
      <Hdr right={
        <div style={{ fontSize:11,color:"var(--green)",fontWeight:600,display:"flex",alignItems:"center",gap:5 }}>
          <span style={{ width:7,height:7,borderRadius:"50%",background:"var(--green)",display:"inline-block" }}/>En ligne
        </div>
      }/>

      <div style={{ padding:"8px var(--px) 14px" }}>
        <div style={{ background:"var(--card)",borderRadius:"var(--r)",padding:"15px 17px",display:"flex",gap:12,alignItems:"center" }}>
          <div style={{ width:46,height:46,borderRadius:15,background:"linear-gradient(135deg,#C4A46B,#8A6A38)",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Icon name="sparkles" size={20} color="#fff" strokeWidth={1.5}/>
          </div>
          <div>
            <div style={{ fontSize:13,fontWeight:500 }}>Assistant Your Home</div>
            <div style={{ fontSize:11,color:"var(--muted)",fontWeight:300 }}>{RES.property.name} · {RES.property.district}</div>
          </div>
        </div>
      </div>

      <div className="chips">
        {CHIPS.map(s => (
          <div key={s.l} className="chip" onClick={() => send(s.l)}>
            <Icon name={s.i} size={13}/> <span>{s.l}</span>
          </div>
        ))}
      </div>

      <div className="cwrap">
        {msgs.map((m,i) => (
          <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:m.r==="usr"?"flex-end":"flex-start" }}>
            {m.r==="ai" && <div className="bsndr">Assistant</div>}
            <div className={`bbl ${m.r==="ai"?"ai":"usr"}`}
              dangerouslySetInnerHTML={{ __html:m.c.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>") }}/>
          </div>
        ))}
        {load && (
          <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-start" }}>
            <div className="bsndr">Assistant</div>
            <div className="bbl ai" style={{ display:"flex",gap:6,alignItems:"center" }}>
              {[0,1,2].map(i => <div key={i} className="dot" style={{ animation:`bounce 1s ${i*.2}s infinite` }}/>)}
            </div>
          </div>
        )}
        <div ref={ref}/>
      </div>

      <div className="cbar">
        <input className="cinp" placeholder="Posez votre question..." value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key==="Enter"&&send(inp)}/>
        <button className="csnd" onClick={() => send(inp)}><Icon name="send" size={15} color="#fff"/></button>
      </div>
    </div>
  );
}

// - HISTORY -
function HistoryScreen() {
  const [rev, setRev] = useState(false);
  const [rat, setRat] = useState(0);
  const [hov, setHov] = useState(0);
  const [txt, setTxt] = useState("");
  const [done, setDone] = useState(false);
  const past = [
    { n:"Marina Skyline", d:"Dubai Marina", ni:5, dt:"Jan. 2025", r:5,   ph:"https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=600&q=80" },
    { n:"HADO by Beyond", d:"Dubai Islands",ni:7, dt:"Oct. 2024", r:4.8, ph:"https://images.unsplash.com/photo-1582407947304-fd86f28f4e3e?w=600&q=80" },
  ];
  return (
    <div className="page">
      <Hdr/>
      <div className="ptitle">Après séjour</div>

      <div style={{ padding:"0 var(--px) 12px" }}>
        <div className="lcard">
          <div className="lbdg"><Icon name="sparkles" size={12} color="var(--gold)"/> Preferred Guest</div>
          <div className="ltit">Bonjour, {RES.guest.firstName}</div>
          <div className="lsub">{RES.guest.stays} séjours · Membre depuis 2024</div>
          <div className="lwlt">
            <div className="lamt">€{RES.guest.wallet}</div>
            <div className="lunt">de cagnotte</div>
          </div>
          <div className="lavs">
            <div className="lav"><strong>Late check-out offert</strong>Jusqu'au 31 déc.</div>
            <div className="lav"><strong>Welcome gift</strong>Prochain séjour</div>
          </div>
        </div>
      </div>

      <div className="slbl">Séjour actuel</div>
      <div className="ib" style={{ margin:"0 var(--px) 12px" }}>
        <div className="ir">
          <img src={RES.property.cover} style={{ width:52,height:52,borderRadius:11,objectFit:"cover",flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:400 }}>{RES.property.name}</div>
            <div style={{ fontSize:11,color:"var(--muted)",fontWeight:300,marginTop:2 }}>{fmtShort(RES.checkIn)} → {fmtShort(RES.checkOut)}</div>
          </div>
        </div>
        <div style={{ padding:"14px 18px" }}>
          {!done
            ? <button className="btn-p" onClick={() => setRev(true)}><Icon name="star" size={13} color="#fff"/> Laisser un avis</button>
            : <div style={{ textAlign:"center",color:"var(--green)",fontWeight:500,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                <Icon name="check" size={14} color="var(--green)"/> Merci pour votre avis !
              </div>
          }
        </div>
      </div>

      <div className="slbl">Séjours passés</div>
      {past.map((s,i) => (
        <div key={i} className="stcard">
          <img src={s.ph} className="stph" alt={s.n}/>
          <div className="stbd">
            <div className="stn">{s.n}</div>
            <div className="stm"><Icon name="mapPin" size={11} color="var(--muted)"/>{s.d} · {s.ni} nuits · {s.dt}</div>
            <div style={{ display:"flex",alignItems:"center",gap:5,marginTop:9 }}>
              <Icon name="star" size={13} color="#C4A46B"/>
              <span style={{ fontSize:12,color:"var(--muted)",fontWeight:300 }}>{s.r}/5</span>
            </div>
            <div style={{ display:"flex",gap:8,marginTop:12 }}>
              <button className="btn-o" style={{ fontSize:9,padding:"10px 8px" }}>Voir le logement</button>
              <button className="btn-p" style={{ fontSize:9,padding:"10px 8px" }}>
                <Icon name="repeat" size={11} color="#fff"/> Réserver
              </button>
            </div>
          </div>
        </div>
      ))}

      {rev && (
        <div className="mov" onClick={() => setRev(false)}>
          <div className="msh" onClick={e => e.stopPropagation()}>
            <div className="mhnd"/>
            <div style={{ textAlign:"center" }}>
              <div className="mtit">Votre avis</div>
              <div style={{ fontSize:12,color:"var(--muted)",marginBottom:8,fontWeight:300 }}>{RES.property.name}</div>
              <div className="srat">
                {[1,2,3,4,5].map(n => (
                  <span key={n} className="sst" style={{ color:n<=(hov||rat)?"#C4A46B":"#EDE8E0" }}
                    onClick={() => setRat(n)} onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}>★</span>
                ))}
              </div>
            </div>
            <textarea className="rtxt" placeholder="Partagez votre expérience... (optionnel)" value={txt} onChange={e => setTxt(e.target.value)}/>
            <button className="btn-p" onClick={() => { setDone(true); setRev(false); }}>
              <Icon name="send" size={13} color="#fff"/> Envoyer mon avis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// - ROOT -
export default function App() {
  const [tab, setTab] = useState(0);
  const tabs = [
    { i:"home",          l:"Accueil" },
    { i:"calendar",      l:"Séjour" },
    { i:"building",      l:"Logement" },
    { i:"concierge",     l:"Services" },
    { i:"messageCircle", l:"Assistant" },
    { i:"history",       l:"Historique" },
  ];
  const screens = [
    <HomeScreen onNav={setTab}/>,
    <StayScreen/>,
    <PropertyScreen/>,
    <ServicesScreen/>,
    <AssistantScreen/>,
    <HistoryScreen/>,
  ];
  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div style={{ overflowY:"auto", height:"100vh" }}>{screens[tab]}</div>
        <nav className="bnav">
          {tabs.map((t,i) => (
            <div key={i} className={`ni${tab===i?" on":""}`} onClick={() => setTab(i)}>
              {tab===i && <div className="nibar"/>}
              <Icon name={t.i} size={20} color={tab===i?"var(--gold-dk)":"var(--muted)"} strokeWidth={tab===i?2:1.5}/>
              <div className="nilbl">{t.l}</div>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
