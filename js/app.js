// ============================================================================
// Schedule Wallpaper (CSW) - Main Application Script
// ============================================================================

// ----------------------------------------------------------------------------
// Configuration & Constants
// ----------------------------------------------------------------------------
const CONFIG = {
  storageKeys: {
    theme: "swm-theme",
    scheduleProfile: "swm-schedule-profile",
    scheduleKeyFor: (profile) => `swm-schedule-${profile}`,
  },
  defaultBgSrc: "assets/default-bg.jpg",
  zoom: { min: 1, max: 6 },
  customSize: { min: 200, max: 8000 },
  timeRange: { start: 8.5, end: 16.5 },
  validProfiles: ["bank", "mickey", "film"],
  validThemes: ["dark", "light", "system"],
  dayLabels: { Mon: "MON", Tue: "TUE", Wed: "WED", Thu: "THU", Fri: "FRI", Sat: "SAT", Sun: "SUN" },
  profileTitles: {
    bank: "iCPE 2/2025 (Bank)",
    mickey: "iCPE 2/2025 (Mickey)",
    film: "iCPE 2/2025 (Film)",
  },
};

// Default schedules dataset
const DEFAULT_SCHEDULES = {
  bank: [
    { day: "Mon", start: 10.5, end: 12.5, title: "PHY103 S31", room: "CB2506", color: "#d9d7a5" },
    { day: "Tue", start: 11.5, end: 12.5, title: "PHY103 S31", room: "CB2506", color: "#d9a9d9" },
    { day: "Tue", start: 13.5, end: 16.5, title: "GEN121 S42", room: "ONLINE", color: "#d9a9d9" },
    { day: "Wed", start: 10.5, end: 12.5, title: "CPE112 S31", room: "CPE1121", color: "#a9d9a9" },
    { day: "Wed", start: 13.5, end: 15.5, title: "CPE112 S31", room: "CPE1121", color: "#a9d9a9" },
    { day: "Thu", start: 8.5,  end: 11.5, title: "MTH102 S32", room: "CB2507", color: "#d9bfa9" },
    { day: "Thu", start: 13.5, end: 15.5, title: "CPE121 S31", room: "CPE1115", color: "#d9bfa9" },
    { day: "Fri", start: 8.5,  end: 10.5, title: "CPE121 S31", room: "CPE1119", color: "#a9cfe0" },
    { day: "Fri", start: 13.5, end: 16.5, title: "LNG222 S9",  room: "CB1301", color: "#a9cfe0" },
  ],
  mickey: [
    { day: "Mon", start: 10.5, end: 12.5, title: "PHY103 S31", room: "CB2506", color: "#d9d7a5" },
    { day: "Tue", start: 11.5, end: 12.5, title: "PHY103 S31", room: "CB2506", color: "#d9a9d9" },
    { day: "Tue", start: 13.5, end: 16.5, title: "GEN121 S43", room: "ONLINE", color: "#d9a9d9" },
    { day: "Wed", start: 10.5, end: 12.5, title: "CPE112 S31", room: "CPE1121", color: "#a9d9a9" },
    { day: "Wed", start: 13.5, end: 15.5, title: "CPE112 S31", room: "CPE1121", color: "#a9d9a9" },
    { day: "Thu", start: 8.5,  end: 11.5, title: "MTH102 S31", room: "CB2506", color: "#d9bfa9" },
    { day: "Thu", start: 13.5, end: 15.5, title: "CPE121 S31", room: "CPE1115", color: "#d9bfa9" },
    { day: "Fri", start: 8.5,  end: 10.5, title: "CPE121 S31", room: "CPE1119", color: "#a9cfe0" },
    { day: "Fri", start: 13.5, end: 16.5, title: "LNG222 S9",  room: "CB1301", color: "#a9cfe0" },
  ],
  film: [
    { day: "Mon", start: 10.5, end: 12.5, title: "PHY103 S31", room: "CB2506", color: "#d9d7a5" },
    { day: "Tue", start: 11.5, end: 12.5, title: "PHY103 S31", room: "CB2506", color: "#d9a9d9" },
    { day: "Tue", start: 13.5, end: 16.5, title: "GEN121 S42", room: "ONLINE", color: "#d9a9d9" },
    { day: "Wed", start: 10.5, end: 12.5, title: "CPE112 S31", room: "CPE1121", color: "#a9d9a9" },
    { day: "Wed", start: 13.5, end: 15.5, title: "CPE112 S31", room: "CPE1121", color: "#a9d9a9" },
    { day: "Thu", start: 8.5,  end: 11.5, title: "MTH102 S32", room: "CB2507", color: "#d9bfa9" },
    { day: "Thu", start: 13.5, end: 15.5, title: "CPE121 S31", room: "CPE1115", color: "#d9bfa9" },
    { day: "Fri", start: 8.5,  end: 10.5, title: "CPE121 S31", room: "CPE1119", color: "#a9cfe0" },
    { day: "Fri", start: 13.5, end: 16.5, title: "LNG222 S9",  room: "CB1301", color: "#a9cfe0" },
  ],
};

// ----------------------------------------------------------------------------
// Theme Controller
// ----------------------------------------------------------------------------
(() => {
  const root = document.documentElement;
  const pill = document.getElementById("themePill");
  const statusBtn = document.getElementById("themeStatus");
  const options = document.getElementById("themeOptions");
  if (!pill || !statusBtn || !options) return;

  const optionBtns = [...pill.querySelectorAll(".themeBtn[data-theme-choice]")];
  const mql = window.matchMedia("(prefers-color-scheme: light)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const ICON_SUN = `
    <svg class="themeIcon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="M4.93 4.93l1.41 1.41"></path>
      <path d="M17.66 17.66l1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="M4.93 19.07l1.41-1.41"></path>
      <path d="M17.66 6.34l1.41-1.41"></path>
    </svg>`;

  const ICON_MOON = `
    <svg class="themeIcon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"></path>
    </svg>`;

  function normalizeTheme(choice) {
    return CONFIG.validThemes.includes(choice) ? choice : "system";
  }

  function effectiveTheme(choice) {
    const c = normalizeTheme(choice);
    return c === "system" ? (mql.matches ? "light" : "dark") : c;
  }

  let currentChoice = normalizeTheme(localStorage.getItem(CONFIG.storageKeys.theme));
  let anim = null;

  function syncUI() {
    optionBtns.forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset.themeChoice === currentChoice ? "true" : "false");
    });
    const eff = effectiveTheme(currentChoice);
    statusBtn.innerHTML = eff === "light" ? ICON_SUN : ICON_MOON;
    statusBtn.dataset.system = currentChoice === "system" ? "true" : "false";
  }

  function applyChoice(next) {
    currentChoice = normalizeTheme(next);
    if (currentChoice === "dark" || currentChoice === "light") {
      root.dataset.theme = currentChoice;
    } else {
      delete root.dataset.theme;
    }
    localStorage.setItem(CONFIG.storageKeys.theme, currentChoice);
    syncUI();
  }

  function spring(open) {
    if (reduceMotion.matches) return;
    try { anim?.cancel(); } catch {}
    const keyframes = open
      ? [
          { transform: "translateY(0px) scale(1)" },
          { transform: "translateY(-1px) scale(1.065)" },
          { transform: "translateY(0px) scale(0.985)" },
          { transform: "translateY(0px) scale(1)" },
        ]
      : [
          { transform: "translateY(0px) scale(1)" },
          { transform: "translateY(0px) scale(0.985)" },
          { transform: "translateY(0px) scale(1.02)" },
          { transform: "translateY(0px) scale(1)" },
        ];

    anim = pill.animate(keyframes, {
      duration: open ? 420 : 320,
      easing: "cubic-bezier(0.18, 0.9, 0.22, 1)",
      fill: "both",
    });
  }

  function setOpen(open) {
    const isOpen = open ? "true" : "false";
    pill.dataset.open = isOpen;
    statusBtn.setAttribute("aria-expanded", isOpen);
    options.setAttribute("aria-hidden", open ? "false" : "true");
    spring(open);
  }

  statusBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(pill.dataset.open !== "true");
  });

  optionBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      applyChoice(btn.dataset.themeChoice);
      setOpen(false);
    });
  });

  document.addEventListener("click", (e) => {
    if (!pill.contains(e.target)) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  mql.addEventListener?.("change", () => {
    if (currentChoice === "system") syncUI();
  });

  applyChoice(currentChoice);
  setOpen(false);
})();

// ----------------------------------------------------------------------------
// DOM References
// ----------------------------------------------------------------------------
const deviceSel = document.getElementById("device");
const customRow = document.getElementById("customRow");
const cw = document.getElementById("cw");
const ch = document.getElementById("ch");
const phoneFrame = document.getElementById("phoneFrame");
const pxInfo = document.getElementById("pxInfo");

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const loadingEl = document.getElementById("loading");
const toastEl = document.getElementById("toast");
const userBtn = document.getElementById("userBtn");

const bgInput = document.getElementById("bg");
const pickBgBtn = document.getElementById("pickBg");
const useDefaultBtn = document.getElementById("removeBg");
const bgTitle = document.getElementById("bgTitle");
const bgName = document.getElementById("bgName");
const thumb = document.getElementById("thumb");
const thumbPh = document.getElementById("thumbPh");

const scheduleJson = document.getElementById("scheduleJson");
const applyScheduleBtn = document.getElementById("applySchedule");
const jsonMsg = document.getElementById("jsonMsg");
const scheduleProfileSel = document.getElementById("profile");

const resetViewBtn = document.getElementById("resetView");
const downloadBtn = document.getElementById("download");

// ----------------------------------------------------------------------------
// General Helper Functions
// ----------------------------------------------------------------------------
let toastTimer = null;
function toast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("on"), 1600);
}

function setLoading(on) {
  if (!loadingEl) return;
  loadingEl.classList.toggle("on", !!on);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function cloneData(v) {
  try {
    return typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v));
  } catch {
    return JSON.parse(JSON.stringify(v));
  }
}

// ----------------------------------------------------------------------------
// Background Image & Crop State Management
// ----------------------------------------------------------------------------
let defaultBgImg = null;
let bgImg = null;
let bgObjectUrl = null;

const bgState = { zoom: 1, sx: 0, sy: 0, key: "" };

function getActiveBg() {
  return bgImg || defaultBgImg;
}

function getImageKey(img) {
  return `${img.src || "mem"}::${img.naturalWidth}x${img.naturalHeight}`;
}

function coverBaseScale(iw, ih, cw, ch) {
  return Math.max(cw / iw, ch / ih);
}

function computeCrop(img, cw, ch, zoom) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const base = coverBaseScale(iw, ih, cw, ch);
  const scale = base * zoom;

  const sw = cw / scale;
  const sh = ch / scale;

  const sxMin = 0;
  const syMin = 0;
  const sxMax = Math.max(0, iw - sw);
  const syMax = Math.max(0, ih - sh);

  return { iw, ih, base, scale, sw, sh, sxMin, syMin, sxMax, syMax };
}

function recenterBg() {
  const img = getActiveBg();
  bgState.zoom = 1;

  if (!img) {
    bgState.sx = 0;
    bgState.sy = 0;
    bgState.key = "";
    return;
  }

  const crop = computeCrop(img, canvas.width, canvas.height, bgState.zoom);
  bgState.sx = crop.sxMax / 2;
  bgState.sy = crop.syMax / 2;
  bgState.key = getImageKey(img);
}

function ensureBgState() {
  const img = getActiveBg();
  if (!img) return;

  const key = getImageKey(img);
  const changed = bgState.key !== key;

  if (changed) {
    bgState.zoom = 1;
    const crop = computeCrop(img, canvas.width, canvas.height, bgState.zoom);
    bgState.sx = crop.sxMax / 2;
    bgState.sy = crop.syMax / 2;
    bgState.key = key;
    return;
  }

  const crop = computeCrop(img, canvas.width, canvas.height, bgState.zoom);
  bgState.sx = clamp(bgState.sx, crop.sxMin, crop.sxMax);
  bgState.sy = clamp(bgState.sy, crop.syMin, crop.syMax);
}

// ----------------------------------------------------------------------------
// Schedule Data & Profile Persistence
// ----------------------------------------------------------------------------
function loadSchedule(profile) {
  try {
    const raw = localStorage.getItem(CONFIG.storageKeys.scheduleKeyFor(profile));
    if (!raw) return cloneData(DEFAULT_SCHEDULES[profile]);
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error("Schedule must be an array");
    return data;
  } catch {
    return cloneData(DEFAULT_SCHEDULES[profile]);
  }
}

function saveSchedule(profile, data) {
  try {
    localStorage.setItem(CONFIG.storageKeys.scheduleKeyFor(profile), JSON.stringify(data));
  } catch {}
}

function loadProfile() {
  const p = localStorage.getItem(CONFIG.storageKeys.scheduleProfile) || "bank";
  return CONFIG.validProfiles.includes(p) ? p : "bank";
}

function saveProfile(p) {
  try {
    localStorage.setItem(CONFIG.storageKeys.scheduleProfile, p);
  } catch {}
}

const schedules = {
  bank: loadSchedule("bank"),
  mickey: loadSchedule("mickey"),
  film: loadSchedule("film"),
};

let activeProfile = loadProfile();
let currentSchedule = schedules[activeProfile];

if (scheduleProfileSel) {
  scheduleProfileSel.value = activeProfile;
}

scheduleJson.value = JSON.stringify(currentSchedule, null, 2);

// ----------------------------------------------------------------------------
// Canvas Size & Drawing Engine
// ----------------------------------------------------------------------------
function parseSize() {
  if (deviceSel.value === "custom") {
    const rawW = Number(cw.value || 1290);
    const rawH = Number(ch.value || 2796);
    const w = clamp(rawW, CONFIG.customSize.min, CONFIG.customSize.max);
    const h = clamp(rawH, CONFIG.customSize.min, CONFIG.customSize.max);
    return { w, h };
  }
  const [w, h] = deviceSel.value.split("x").map(Number);
  return { w, h };
}

function setCanvasSize() {
  const { w, h } = parseSize();
  canvas.width = w;
  canvas.height = h;

  phoneFrame.style.aspectRatio = `${w} / ${h}`;
  pxInfo.textContent = `${w}×${h}px`;

  ensureBgState();
}

function roundRect(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawBackground() {
  const img = getActiveBg();
  if (!img) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  ensureBgState();

  const crop = computeCrop(img, canvas.width, canvas.height, bgState.zoom);
  const sx = clamp(bgState.sx, crop.sxMin, crop.sxMax);
  const sy = clamp(bgState.sy, crop.syMin, crop.syMax);
  bgState.sx = sx;
  bgState.sy = sy;

  ctx.drawImage(img, sx, sy, crop.sw, crop.sh, 0, 0, canvas.width, canvas.height);
}

function fmtTime(t) {
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function drawSchedule() {
  const W = canvas.width;
  const H = canvas.height;
  const FONT_SCALE = 1.3;

  const panelW = Math.round(W * 0.80);
  const panelH = Math.round(H * 0.46);
  const panelX = Math.round((W - panelW) / 2);

  const aspect = H / W;
  const topFrac = aspect >= 2.05 ? 0.29 : aspect >= 1.85 ? 0.27 : 0.24;
  const panelY = Math.round(H * topFrac);

  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = "rgba(28,28,30,.58)";
  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.lineWidth = Math.max(2, Math.round(W * 0.002));
  roundRect(panelX, panelY, panelW, panelH, Math.round(W * 0.038));
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  const ix = panelX + Math.round(panelW * 0.06);
  const iy = panelY + Math.round(panelH * 0.14);
  const iw = panelW - Math.round(panelW * 0.12);
  const ih = panelH - Math.round(panelH * 0.20);

  // Profile Wallpaper Title
  const titleText = CONFIG.profileTitles[activeProfile] || "iCPE 2/2025";
  ctx.fillStyle = "rgba(255,255,255,.88)";
  ctx.font = `800 ${Math.max(20, Math.round(W * 0.019 * FONT_SCALE))}px ui-sans-serif, system-ui`;
  ctx.fillText(titleText, panelX + Math.round(panelW * 0.07), panelY + Math.round(panelH * 0.10));

  const useDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const cols = useDays.length;
  const rows = 8;
  const colW = iw / cols;
  const rowH = ih / rows;

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.10)";
  ctx.lineWidth = 1;
  for (let c = 0; c <= cols; c++) {
    const x = ix + c * colW;
    ctx.beginPath();
    ctx.moveTo(x, iy);
    ctx.lineTo(x, iy + ih);
    ctx.stroke();
  }
  for (let r = 0; r <= rows; r++) {
    const y = iy + r * rowH;
    ctx.beginPath();
    ctx.moveTo(ix, y);
    ctx.lineTo(ix + iw, y);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = "rgba(255,255,255,.70)";
  ctx.font = `800 ${Math.max(12, Math.round(W * 0.012 * FONT_SCALE))}px ui-sans-serif, system-ui`;
  useDays.forEach((d, i) => {
    ctx.fillText(CONFIG.dayLabels[d] || d, ix + i * colW + 6, iy - 10);
  });

  const tRange = CONFIG.timeRange.end - CONFIG.timeRange.start;
  currentSchedule.forEach((item) => {
    const dayIndex = useDays.indexOf(item.day);
    if (dayIndex === -1) return;

    const s = Math.max(CONFIG.timeRange.start, item.start);
    const e = Math.min(CONFIG.timeRange.end, item.end);
    if (e <= s) return;

    const y1 = iy + ((s - CONFIG.timeRange.start) / tRange) * ih;
    const y2 = iy + ((e - CONFIG.timeRange.start) / tRange) * ih;

    const bx = ix + dayIndex * colW + 6;
    const by = y1 + 6;
    const bw = colW - 12;
    const bh = y2 - y1 - 12;

    ctx.save();
    ctx.globalAlpha = 0.94;
    ctx.fillStyle = item.color || "rgba(160,200,255,1)";
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.lineWidth = 1.2;
    roundRect(bx, by, bw, bh, 16);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "rgba(10,12,20,.88)";
    const titleSize = Math.max(14, Math.round(W * 0.014 * FONT_SCALE));
    const subSize = Math.max(11, Math.round(W * 0.011 * FONT_SCALE));

    ctx.font = `900 ${titleSize}px ui-sans-serif, system-ui`;
    ctx.fillText(item.title || "", bx + 12, by + 24);

    ctx.font = `800 ${subSize}px ui-sans-serif, system-ui`;
    ctx.fillText(`${fmtTime(item.start)}–${fmtTime(item.end)}`, bx + 12, by + 24 + Math.round(titleSize * 1.25));

    if (item.room) {
      ctx.fillText(item.room, bx + 12, by + 24 + Math.round(titleSize * 1.25) + Math.round(subSize * 1.25));
    }
  });
}

function render() {
  drawBackground();
  drawSchedule();
}

// ----------------------------------------------------------------------------
// Pan & Zoom Gesture Engine
// ----------------------------------------------------------------------------
function panBy(dxCanvasPx, dyCanvasPx) {
  const img = getActiveBg();
  if (!img) return;

  const crop = computeCrop(img, canvas.width, canvas.height, bgState.zoom);
  bgState.sx = clamp(bgState.sx - dxCanvasPx / crop.scale, crop.sxMin, crop.sxMax);
  bgState.sy = clamp(bgState.sy - dyCanvasPx / crop.scale, crop.syMin, crop.syMax);

  render();
}

function zoomAt(clientX, clientY, newZoom) {
  const img = getActiveBg();
  if (!img) return;

  const rect = canvas.getBoundingClientRect();
  const px = (clientX - rect.left) * (canvas.width / rect.width);
  const py = (clientY - rect.top) * (canvas.height / rect.height);

  const oldZoom = bgState.zoom;
  const z = clamp(newZoom, CONFIG.zoom.min, CONFIG.zoom.max);
  if (z === oldZoom) return;

  const oldCrop = computeCrop(img, canvas.width, canvas.height, oldZoom);
  const srcX = bgState.sx + px / oldCrop.scale;
  const srcY = bgState.sy + py / oldCrop.scale;

  bgState.zoom = z;

  const newCrop = computeCrop(img, canvas.width, canvas.height, bgState.zoom);
  bgState.sx = clamp(srcX - px / newCrop.scale, newCrop.sxMin, newCrop.sxMax);
  bgState.sy = clamp(srcY - py / newCrop.scale, newCrop.syMin, newCrop.syMax);

  render();
}

let isDragging = false;
let lastX = 0;
let lastY = 0;

const pointers = new Map();
let pinchStartDist = 0;
let pinchStartZoom = 1;

function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

canvas.addEventListener("pointerdown", (e) => {
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 1) {
    isDragging = true;
    canvas.classList.add("isDragging");
    lastX = e.clientX;
    lastY = e.clientY;
  }

  if (pointers.size === 2) {
    const [p1, p2] = [...pointers.values()];
    pinchStartDist = dist(p1, p2);
    pinchStartZoom = bgState.zoom;
    isDragging = false;
    canvas.classList.remove("isDragging");
  }
});

canvas.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 2) {
    const [p1, p2] = [...pointers.values()];
    const d = dist(p1, p2);
    if (pinchStartDist > 0) {
      const factor = d / pinchStartDist;
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      zoomAt(midX, midY, pinchStartZoom * factor);
    }
    return;
  }

  if (!isDragging) return;

  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;

  panBy(dx, dy);
});

function endPointer(e) {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinchStartDist = 0;
  if (pointers.size === 0) {
    isDragging = false;
    canvas.classList.remove("isDragging");
  }
}

canvas.addEventListener("pointerup", endPointer);
canvas.addEventListener("pointercancel", endPointer);

canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    zoomAt(e.clientX, e.clientY, bgState.zoom * factor);
  },
  { passive: false }
);

canvas.addEventListener("dblclick", () => {
  recenterBg();
  render();
  toast("Reset.");
});

// ----------------------------------------------------------------------------
// Upload UI Logic & Object URL Cleanup
// ----------------------------------------------------------------------------
function setThumb(url) {
  if (!url) {
    thumb.style.display = "none";
    thumb.removeAttribute("src");
    thumbPh.style.display = "block";
    return;
  }
  thumb.src = url;
  thumb.style.display = "block";
  thumbPh.style.display = "none";
}

function setUploadUI(isCustom, filename) {
  if (!isCustom) {
    bgTitle.textContent = "Default";
    bgName.textContent = CONFIG.defaultBgSrc;
    useDefaultBtn.disabled = true;
    setThumb(CONFIG.defaultBgSrc);
  } else {
    bgTitle.textContent = "Selected";
    bgName.textContent = filename || "Image";
    useDefaultBtn.disabled = false;
  }
}

function revokeBgObjectUrl() {
  if (bgObjectUrl) {
    URL.revokeObjectURL(bgObjectUrl);
    bgObjectUrl = null;
  }
}

pickBgBtn.addEventListener("click", () => bgInput.click());
thumbPh.addEventListener("click", () => bgInput.click());
thumb.addEventListener("click", () => bgInput.click());

bgInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setLoading(true);
  revokeBgObjectUrl();
  bgObjectUrl = URL.createObjectURL(file);

  const img = new Image();
  img.onload = () => {
    bgImg = img;
    bgState.key = "";
    recenterBg();

    setUploadUI(true, file.name);
    setThumb(bgObjectUrl);

    render();
    setLoading(false);
    toast("Updated.");
  };

  img.onerror = () => {
    setLoading(false);
    toast("Couldn’t load that image.");
  };

  img.src = bgObjectUrl;
});

useDefaultBtn.addEventListener("click", () => {
  bgImg = null;
  bgInput.value = "";
  revokeBgObjectUrl();

  bgState.key = "";
  recenterBg();

  setUploadUI(false);
  render();
  toast("Back to default.");
});

window.addEventListener("unload", () => {
  revokeBgObjectUrl();
});

// ----------------------------------------------------------------------------
// Controls & Form Event Handlers
// ----------------------------------------------------------------------------
scheduleProfileSel?.addEventListener("change", () => {
  const next = scheduleProfileSel.value;
  activeProfile = CONFIG.validProfiles.includes(next) ? next : "bank";
  saveProfile(activeProfile);

  currentSchedule = schedules[activeProfile];
  scheduleJson.value = JSON.stringify(currentSchedule, null, 2);

  render();
  toast("Class Schedule: " + (CONFIG.profileTitles[activeProfile] || activeProfile));
});

deviceSel.addEventListener("change", () => {
  customRow.style.display = deviceSel.value === "custom" ? "grid" : "none";
  setCanvasSize();
  ensureBgState();
  render();
});

[cw, ch].forEach((el) =>
  el.addEventListener("input", () => {
    if (deviceSel.value !== "custom") return;
    setCanvasSize();
    ensureBgState();
    render();
  })
);

resetViewBtn.addEventListener("click", () => {
  recenterBg();
  render();
  toast("Reset.");
});

applyScheduleBtn.addEventListener("click", () => {
  try {
    const data = JSON.parse(scheduleJson.value);
    if (!Array.isArray(data)) throw new Error("Must be an array");

    schedules[activeProfile] = data;
    currentSchedule = data;
    saveSchedule(activeProfile, data);

    scheduleJson.value = JSON.stringify(currentSchedule, null, 2);

    jsonMsg.textContent = "Applied.";
    jsonMsg.className = "meta msg-success";
    render();
    toast("Applied.");
  } catch (err) {
    jsonMsg.textContent = "Can’t read that JSON: " + err.message;
    jsonMsg.className = "meta msg-error";
    toast("Check JSON.");
  }
});

downloadBtn.addEventListener("click", () => {
  render();
  toast("Preparing…");

  canvas.toBlob(
    (blob) => {
      if (!blob) {
        toast("Couldn’t save.");
        return;
      }
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = `schedule-wallpaper_${canvas.width}x${canvas.height}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Saved.");
    },
    "image/png",
    1.0
  );
});

userBtn?.addEventListener("click", () => {
  toast("Coming soon.");
});

// ----------------------------------------------------------------------------
// Initialization
// ----------------------------------------------------------------------------
function loadDefaultBg() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = CONFIG.defaultBgSrc;
  });
}

(async function init() {
  setCanvasSize();
  defaultBgImg = await loadDefaultBg();
  bgState.key = "";
  recenterBg();

  setUploadUI(false);
  render();
})();
