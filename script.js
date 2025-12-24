const API_KEY = "984874ae9e25ed523b16559571cd3d0f";
const UNITS = "metric";
const LANG = "en";

const CURRENT_URL  = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
const GEO_URL      = "https://api.openweathermap.org/geo/1.0/direct";

const iconUrl = (iconCode) => `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

/* HERO images (your full mapping) */
const HERO_IMAGES = {
  clear: "url('images/CLEARSKY.jpg')",
  "clouds-few": "url('images/CLOUDSFEW.jpg')",
  "clouds-scattered": "url('images/SCATTERED.jpeg')",
  "clouds-broken": "url('images/BROKEN.jpg')",
  "clouds-overcast": "url('images/OVERCAST.jpg')",
  rain: "url('images/RAIN.jpg')",
  drizzle: "url('images/DRIZZLE.jpg')",
  thunderstorm: "url('images/THUNDERSTORM.jpg')",
  snow: "url('images/SNOWS.jpg')",
  mist: "url('images/MIST.jpg')",
  fog: "url('images/FOG.jpg')",
  haze: "url('images/HAZE.jpg')",
  smoke: "url('images/SMOKE.jpg')",
  dust: "url('images/DUST.jpg')",
  sand: "url('images/SAND.jpg')",
  ash: "url('images/ASHES.jpg')",
  squall: "url('images/WIND.jpg')",
  tornado: "url('images/TORNADO.jpg')",
};

// DOM
const appEl = document.getElementById("app");
const bgEl = document.getElementById("bg");

const themeBtn = document.getElementById("themeBtn");
const cityInput = document.getElementById("cityInput");
const dropdown = document.getElementById("dropdown");
const searchBtn = document.getElementById("searchBtn");
const statusEl = document.getElementById("status");

const cityNameEl = document.getElementById("cityName");
const metaLineEl = document.getElementById("metaLine");
const tempValueEl = document.getElementById("tempValue");
const feelsValueEl = document.getElementById("feelsValue");
const humidityValueEl = document.getElementById("humidityValue");
const weatherDescEl = document.getElementById("weatherDesc");
const weatherIconEl = document.getElementById("weatherIcon");

const forecastGridEl = document.getElementById("forecastGrid");
const forecastSkeletonEl = document.getElementById("forecastSkeleton");

// Sidebar (non-redundant)
const sideStatusTextEl = document.querySelector(".sideStatusText");
const windValueSideEl = document.getElementById("windValueSide");
const pressureValueSideEl = document.getElementById("pressureValueSide");
const visValueSideEl = document.getElementById("visValueSide");
const sunValueSideEl = document.getElementById("sunValueSide");

// State
let manualTheme = localStorage.getItem("manualTheme") || "";
let theme = localStorage.getItem("theme") || "night";     // DEFAULT = DARK
let selectedPlace = null;
let lastBg = localStorage.getItem("lastBg") || "clear";

/* =========================
   Theme
   ========================= */
function applyTheme(t) {
  theme = t;
  appEl.setAttribute("data-theme", theme);
  bgEl.setAttribute("data-theme", theme);

  // keep weather background when toggling themes
  bgEl.dataset.bg = lastBg;

  localStorage.setItem("theme", theme);
}

function setAutoThemeFromIcon(iconCode) {
  // If user manually toggled at least once, don't auto-switch.
  if (manualTheme) return;

  // Keep default as NIGHT unless the API clearly indicates daytime icons.
  // OpenWeather icon ends with 'n' for night, 'd' for day.
  if (typeof iconCode === "string" && iconCode.endsWith("d")) applyTheme("day");
  else applyTheme("night");
}

themeBtn.addEventListener("click", () => {
  const next = (appEl.getAttribute("data-theme") === "day") ? "night" : "day";
  applyTheme(next);
  manualTheme = next;
  localStorage.setItem("manualTheme", manualTheme);
});

// Apply initial theme
applyTheme(theme);
bgEl.dataset.bg = lastBg;

/* =========================
   Status + loading
   ========================= */
function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.style.opacity = msg ? "0.95" : "0";
  statusEl.style.fontWeight = isError ? "800" : "700";
}

function setLoading(isLoading) {
  if (isLoading) {
    appEl.classList.add("is-loading");
    searchBtn.disabled = true;
    forecastSkeletonEl.style.display = "grid";
    forecastGridEl.style.display = "none";
  } else {
    appEl.classList.remove("is-loading");
    searchBtn.disabled = false;
    forecastSkeletonEl.style.display = "none";
    forecastGridEl.style.display = "grid";
  }
}

// Helpers
function safeText(s){ return (s || "").toString().trim(); }
function fmtTemp(x){ return (typeof x === "number") ? `${Math.round(x)}°` : "—"; }
function weekdayShortFromDate(d){ return d.toLocaleDateString(undefined, { weekday: "short" }); }
function kmFromMeters(m){ return (typeof m === "number") ? `${(m/1000).toFixed(1)} km` : "—"; }

function debounce(fn, delay=250){
  let t=null;
  return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), delay); };
}

function fmtTimeFromUnix(unix, tzOffsetSec){
  if (typeof unix !== "number") return "—";
  const off = typeof tzOffsetSec === "number" ? tzOffsetSec : 0;
  const dt = new Date((unix + off) * 1000);
  // Use UTC getters because we've already applied timezone offset manually
  const hh = String(dt.getUTCHours()).padStart(2,"0");
  const mm = String(dt.getUTCMinutes()).padStart(2,"0");
  return `${hh}:${mm}`;
}

/* =========================
   Background picking (includes 801-804)
   ========================= */
function pickBgKeyword(current) {
  const w = current?.weather?.[0];
  const main = safeText(w?.main).toLowerCase();
  const desc = safeText(w?.description).toLowerCase();
  const id = w?.id;

  if (typeof id === "number" && id >= 801 && id <= 804) {
    if (id === 801) return "clouds-few";
    if (id === 802) return "clouds-scattered";
    if (id === 803) return "clouds-broken";
    if (id === 804) return "clouds-overcast";
  }

  if (main.includes("thunder")) return "thunderstorm";
  if (main.includes("drizzle")) return "drizzle";
  if (main.includes("rain")) return "rain";
  if (main.includes("snow")) return "snow";
  if (main.includes("cloud")) return "clouds-scattered";

  if (main.includes("mist")) return "mist";
  if (main.includes("fog")) return "fog";
  if (main.includes("haze")) return "haze";
  if (main.includes("smoke")) return "smoke";

  if (main.includes("dust")) return "dust";
  if (main.includes("sand")) return "sand";
  if (main.includes("ash")) return "ash";

  if (main.includes("squall")) return "squall";
  if (main.includes("tornado")) return "tornado";

  if (desc.includes("overcast")) return "clouds-overcast";
  if (desc.includes("broken")) return "clouds-broken";
  if (desc.includes("scattered")) return "clouds-scattered";
  if (desc.includes("few")) return "clouds-few";

  if (main.includes("clear") || id === 800) return "clear";

  if (typeof id === "number") {
    if (id >= 200 && id < 300) return "thunderstorm";
    if (id >= 300 && id < 400) return "drizzle";
    if (id >= 500 && id < 600) return "rain";
    if (id >= 600 && id < 700) return "snow";
    if (id >= 700 && id < 800) return "mist";
    if (id === 800) return "clear";
    if (id > 800) return "clouds-scattered";
  }

  return "clear";
}

function setHeroImageFromBg(bgKey){
  const chosen = HERO_IMAGES[bgKey] || HERO_IMAGES.clear;
  appEl.style.setProperty("--hero-img", chosen);
}

function setDynamicBackgroundFromCurrent(current) {
  lastBg = pickBgKeyword(current);
  bgEl.dataset.bg = lastBg;
  localStorage.setItem("lastBg", lastBg);

  setHeroImageFromBg(lastBg);
}

// API helpers
async function fetchJson(url){
  const res = await fetch(url);
  let data;
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok) {
    const msg = data && data.message ? data.message : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

async function geocodeCity(query){
  const q = encodeURIComponent(query);
  const url = `${GEO_URL}?q=${q}&limit=6&appid=${API_KEY}`;
  return await fetchJson(url);
}

async function getWeatherByCoords(lat, lon){
  const urlCurrent  = `${CURRENT_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${UNITS}&lang=${LANG}`;
  const urlForecast = `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${UNITS}&lang=${LANG}`;
  const [current, forecast] = await Promise.all([fetchJson(urlCurrent), fetchJson(urlForecast)]);
  return { current, forecast };
}

// Forecast selection (pick ~noon)
function buildDailyForecast(list){
  const byDate = new Map();
  for (const item of list) {
    const date = item.dt_txt.slice(0,10);
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date).push(item);
  }

  const days = [];
  for (const [date, items] of byDate.entries()) {
    let best = items[0], bestScore = Infinity;
    for (const it of items) {
      const hour = Number(it.dt_txt.slice(11,13));
      const score = Math.abs(hour - 12);
      if (score < bestScore) { bestScore = score; best = it; }
    }
    days.push({ date, item: best });
  }
  return days.slice(0,5);
}

/* =========================
   Sidebar “status” (simple)
   ========================= */
function computeStatusPill(current){
  const t = current?.main?.temp;
  const hum = current?.main?.humidity;
  const wind = current?.wind?.speed;

  if (typeof t === "number" && t >= 36) return "Very Hot";
  if (typeof t === "number" && t >= 32) return "Hot";
  if (typeof t === "number" && t <= 12) return "Cold";
  if (typeof hum === "number" && hum >= 85) return "Humid";
  if (typeof wind === "number" && wind >= 10) return "Windy";
  return "Normal";
}

// Render
function renderCurrent(current){
  const name = current.name;
  const country = current.sys?.country || "";
  const icon = current.weather?.[0]?.icon;
  const desc = current.weather?.[0]?.description || "";

  const temp = current.main?.temp;
  const feels = current.main?.feels_like;
  const humidity = current.main?.humidity;

  // Sidebar metrics (non-redundant)
  const windSpeed = current.wind?.speed;      // m/s
  const windDeg = current.wind?.deg;          // degrees
  const pressure = current.main?.pressure;    // hPa
  const vis = current.visibility;             // meters
  const tz = current.timezone;                // seconds offset from UTC
  const sunrise = current.sys?.sunrise;       // unix
  const sunset = current.sys?.sunset;         // unix

  const cityText = `${name}${country ? ", " + country : ""}`;
  const metaText = `Now • ${new Date().toLocaleString()}`;

  // HERO (location appears only here)
  cityNameEl.textContent = cityText;
  metaLineEl.textContent = metaText;
  tempValueEl.textContent = fmtTemp(temp);
  feelsValueEl.textContent = fmtTemp(feels);
  humidityValueEl.textContent = (typeof humidity === "number") ? `${humidity}%` : "—";
  weatherDescEl.textContent = desc || "—";

  if (icon) {
    weatherIconEl.src = iconUrl(icon);
    weatherIconEl.alt = desc ? `Icon: ${desc}` : "Weather icon";
  } else {
    weatherIconEl.removeAttribute("src");
    weatherIconEl.alt = "Weather icon";
  }

  // Sidebar
  sideStatusTextEl.textContent = computeStatusPill(current);

  if (typeof windSpeed === "number") {
    const dir = (typeof windDeg === "number") ? ` • ${Math.round(windDeg)}°` : "";
    windValueSideEl.textContent = `${windSpeed.toFixed(1)} m/s${dir}`;
  } else {
    windValueSideEl.textContent = "—";
  }

  pressureValueSideEl.textContent = (typeof pressure === "number") ? `${pressure} hPa` : "—";
  visValueSideEl.textContent = kmFromMeters(vis);

  const sr = fmtTimeFromUnix(sunrise, tz);
  const ss = fmtTimeFromUnix(sunset, tz);
  sunValueSideEl.textContent = (sr !== "—" && ss !== "—") ? `↑ ${sr} • ↓ ${ss}` : "—";

  // Theme + backgrounds
  setAutoThemeFromIcon(icon);
  setDynamicBackgroundFromCurrent(current);
}

function renderForecast(forecast){
  const daily = buildDailyForecast(forecast.list || []);
  forecastGridEl.innerHTML = "";

  for (const d of daily) {
    const it = d.item;
    const icon = it.weather?.[0]?.icon;
    const desc = it.weather?.[0]?.description || "";
    const temp = it.main?.temp;
    const hum  = it.main?.humidity;

    const dateObj = new Date(it.dt * 1000);

    const card = document.createElement("div");
    card.className = "day";

    const h4 = document.createElement("h4");
    h4.textContent = weekdayShortFromDate(dateObj);

    const img = document.createElement("img");
    if (icon) img.src = iconUrl(icon);
    img.alt = desc ? `Icon: ${desc}` : "Forecast icon";

    const t = document.createElement("div");
    t.className = "t";
    t.textContent = fmtTemp(temp);

    const h = document.createElement("div");
    h.className = "h";
    h.textContent = (typeof hum === "number") ? `Hum: ${hum}%` : "";

    card.append(h4, img, t, h);
    forecastGridEl.appendChild(card);
  }
}

/* =========================
   Dropdown
   ========================= */
function closeDropdown(){
  dropdown.hidden = true;
  dropdown.innerHTML = "";
}

function openDropdown(items){
  dropdown.innerHTML = "";

  if (!items || items.length === 0) {
    closeDropdown();
    return;
  }

  for (const place of items) {
    const main = `${place.name}, ${place.country}`;
    const sub  = place.state ? place.state : `lat ${place.lat.toFixed(2)}, lon ${place.lon.toFixed(2)}`;

    const row = document.createElement("div");
    row.className = "dropitem";

    row.innerHTML = `
      <div>
        <div class="dropmain">${main}</div>
        <div class="dropsub">${sub}</div>
      </div>
      <div class="dropsub">${place.lat.toFixed(2)}, ${place.lon.toFixed(2)}</div>
    `;

    row.addEventListener("click", () => {
      selectedPlace = place;
      cityInput.value = main + (place.state ? ` (${place.state})` : "");
      closeDropdown();
      runSearch();
    });

    dropdown.appendChild(row);
  }

  dropdown.hidden = false;
}

const handleType = debounce(async () => {
  const q = safeText(cityInput.value);
  selectedPlace = null;

  if (q.length < 2) {
    closeDropdown();
    return;
  }

  try {
    const results = await geocodeCity(q);
    const items = results.map(r => ({
      name: r.name,
      country: r.country,
      state: r.state || "",
      lat: r.lat,
      lon: r.lon,
    }));
    openDropdown(items);
  } catch {
    closeDropdown();
  }
}, 250);

cityInput.addEventListener("input", handleType);

cityInput.addEventListener("focus", () => {
  if (dropdown.innerHTML.trim()) dropdown.hidden = false;
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".searchbox")) closeDropdown();
});

/* =========================
   Search
   ========================= */
async function runSearch(){
  const raw = safeText(cityInput.value);
  if (!raw) { setStatus("Type a city first.", true); return; }

  setStatus("Loading...");
  setLoading(true);

  try {
    let place = selectedPlace;

    if (!place) {
      const results = await geocodeCity(raw);
      if (!results || results.length === 0) throw new Error("City not found. Use the dropdown suggestions.");
      const r = results[0];
      place = { name:r.name, country:r.country, state:r.state || "", lat:r.lat, lon:r.lon };
    }

    const { current, forecast } = await getWeatherByCoords(place.lat, place.lon);
    renderCurrent(current);
    renderForecast(forecast);
    setStatus("");
  } catch (err) {
    setStatus(`Error: ${err.message}`, true);
  } finally {
    setLoading(false);
  }
}

searchBtn.addEventListener("click", runSearch);
cityInput.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearch(); });

/* =========================
   Default on boot
   ========================= */
cityInput.value = "Manila";
setHeroImageFromBg(lastBg);   // ensure hero has an image on boot
setLoading(false);

// Auto-load Manila so UI isn't empty
runSearch();
