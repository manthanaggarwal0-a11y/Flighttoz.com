// Don't let other sites show this page inside a frame (GitHub Pages can't send X-Frame-Options)
if (window.top !== window.self) {
  try { window.top.location.replace(window.location.href); } catch (e) { document.documentElement.hidden = true; }
}

const WHATSAPP_NUMBER = "917009767211";
const MAX_PAX = 9;
const CABINS = ['Economy', 'Premium Economy', 'Business', 'First'];

// Escape text before putting it into HTML, so nothing typed or tampered with can inject markup
const esc = (v) => String(v).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');
menuBtn.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('hidden') === false;
  menuBtn.setAttribute('aria-expanded', open);
});
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileNav.classList.add('hidden');
  menuBtn.setAttribute('aria-expanded', false);
}));

// --- Airport list (IN / US / CA major). Type first 2 letters to match. Extend as needed. ---
const AIRPORTS = [
  // India
  ["DEL","New Delhi","Indira Gandhi Intl"],["BOM","Mumbai","Chhatrapati Shivaji"],["BLR","Bengaluru","Kempegowda"],
  ["MAA","Chennai","Chennai Intl"],["HYD","Hyderabad","Rajiv Gandhi"],["CCU","Kolkata","Netaji Subhas Chandra Bose"],
  ["AMD","Ahmedabad","Sardar Vallabhbhai Patel"],["COK","Kochi","Cochin Intl"],["PNQ","Pune","Pune"],
  ["GOI","Goa","Dabolim"],["GOX","Goa","Manohar Intl (Mopa)"],["TRV","Thiruvananthapuram","Trivandrum"],["ATQ","Amritsar","Sri Guru Ram Dass"],
  ["IXC","Chandigarh","Shaheed Bhagat Singh"],["JAI","Jaipur","Jaipur Intl"],["LKO","Lucknow","Chaudhary Charan Singh"],
  // USA
  ["JFK","New York","John F. Kennedy"],["EWR","Newark","Newark Liberty"],["LGA","New York","LaGuardia"],
  ["LAX","Los Angeles","Los Angeles Intl"],["SFO","San Francisco","San Francisco Intl"],["ORD","Chicago","O'Hare"],
  ["IAD","Washington","Dulles"],["SEA","Seattle","Sea-Tac"],["DFW","Dallas","Dallas/Fort Worth"],["MIA","Miami","Miami Intl"],
  ["BOS","Boston","Logan"],["ATL","Atlanta","Hartsfield–Jackson"],["IAH","Houston","George Bush"],
  // Canada
  ["YYZ","Toronto","Pearson"],["YVR","Vancouver","Vancouver Intl"],["YUL","Montréal","Trudeau"],
  ["YYC","Calgary","Calgary Intl"],["YOW","Ottawa","Macdonald–Cartier"],["YEG","Edmonton","Edmonton Intl"],
  ["YWG","Winnipeg","Winnipeg Intl"]
];
const airportLabel = (code) => {
  const a = AIRPORTS.find(x => x[0] === code);
  return a ? `${a[0]} — ${a[1]}` : code;
};

// Fill datalist
const dl = document.getElementById('airports');
dl.innerHTML = AIRPORTS.map(([code,city,name]) => `<option value="${esc(code)} — ${esc(city)}">${esc(name)}</option>`).join('');

// Passenger dropdowns
const fillSelect = (id, from, to, selected) => {
  document.getElementById(id).innerHTML = Array.from({length: to-from+1}, (_, i) => {
    const n = from + i;
    return `<option${n===selected?' selected':''}>${n}</option>`;
  }).join('');
};
fillSelect('adult', 1, 9, 1);
fillSelect('child', 0, 8, 0);
fillSelect('infant', 0, 9, 0);

// Dates: no past dates, return not before depart
const departEl = document.getElementById('depart');
const returnEl = document.getElementById('return');
const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0,10);
};
departEl.min = todayISO();
returnEl.min = todayISO();
departEl.addEventListener('change', () => {
  returnEl.min = departEl.value || todayISO();
  if (returnEl.value && returnEl.value < returnEl.min) returnEl.value = "";
});

// Trip type
let tripType = "round";
document.querySelectorAll('.trip-btn').forEach(btn => btn.addEventListener('click', () => {
  tripType = btn.dataset.trip;
  document.querySelectorAll('.trip-btn').forEach(b => {
    b.classList.toggle('active', b === btn);
    b.setAttribute('aria-pressed', b === btn);
  });
  const oneWay = tripType === "oneway";
  document.getElementById('returnWrap').classList.toggle('opacity-50', oneWay);
  returnEl.disabled = oneWay;
  if (oneWay) returnEl.value = "";
}));

// --- Airlines + logo filenames (place files in /assets/logos/) ---
const AIRLINES = [
  { code:"QR", name:"Qatar Airways", logo:"qatar.png" },
  { code:"EK", name:"Emirates", logo:"emirates.png" },
  { code:"EY", name:"Etihad", logo:"etihad.png" },
  { code:"AI", name:"Air India", logo:"air-india.png" },
  { code:"AC", name:"Air Canada", logo:"air-canada.png" },
  { code:"UA", name:"United Airlines", logo:"united.png" },
  { code:"LH", name:"Lufthansa", logo:"lufthansa.png" },
  { code:"LX", name:"SWISS", logo:"swiss.png" },
  { code:"AF", name:"Air France", logo:"air-france.png" },
  { code:"KL", name:"KLM", logo:"klm.png" },
  { code:"DL", name:"Delta Air Lines", logo:"delta.png" }
];

document.getElementById('airlineStrip').innerHTML = AIRLINES.map(a => `
  <div class="flex h-16 w-28 md:w-32 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200 p-2" title="${esc(a.name)}">
    <img src="assets/logos/${esc(a.logo)}" alt="${esc(a.name)}" loading="lazy" class="max-h-12 max-w-full object-contain"/>
  </div>`).join('');

// Simple currency converter (approx mid-market rates, mid-2026 — update occasionally)
const FX = { USD:1, CAD:1.40, INR:96 };
const CURRENCIES = Object.keys(FX);
const fmt = (amtUSD, cur) => {
  const val = Math.round(amtUSD * FX[cur]);
  return (cur==="INR" ? "₹" : cur==="CAD" ? "CA$" : "$") + val.toLocaleString() + " " + cur;
};

// Default currency: saved choice, else guess from the visitor's time zone / language
function guessCurrency() {
  try {
    const saved = localStorage.getItem('ftz-currency');
    if (CURRENCIES.includes(saved)) return saved;
  } catch (e) {}
  const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || "");
  const lang = (navigator.language || "");
  const CA_ZONES = /^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Moncton|Montreal|Glace_Bay|Goose_Bay|Whitehorse|Dawson|Dawson_Creek|Yellowknife|Iqaluit|Rankin_Inlet|Resolute|Cambridge_Bay|Inuvik|Swift_Current|Creston|Fort_Nelson|Atikokan|Blanc-Sablon|Nipigon|Thunder_Bay|Rainy_River|Pangnirtung)$/;
  if (CA_ZONES.test(tz) || /-CA$/i.test(lang)) return "CAD";
  if (/^Asia\/(Kolkata|Calcutta)$/.test(tz) || /-IN$/i.test(lang)) return "INR";
  return "USD";
}
let currency = guessCurrency();

function setCurrency(cur) {
  currency = cur;
  try { localStorage.setItem('ftz-currency', cur); } catch (e) {}
  document.querySelectorAll('.cur-btn').forEach(b => {
    const on = b.dataset.cur === cur;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', on);
  });
  renderRoutes();
  if (lastSearch) { lastSearch.cur = cur; renderResults(); }
}
document.querySelectorAll('.cur-btn').forEach(b => b.addEventListener('click', () => setCurrency(b.dataset.cur)));

// Build a wa.me link with a prefilled message
const waUrl = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

function waLink(action, details) {
  const msg =
`Hello Flight to Z,

${action.toUpperCase()}:

Trip: ${details.trip}
From: ${details.from}
To: ${details.to}
Depart: ${details.depart || "-"}
Return: ${details.return || "-"}
Cabin: ${details.cabin}
Pax: A${details.adult}/C${details.child}/I${details.infant}

Selected: ${details.airline} (${details.stops}), Indicative price: ${details.price}

Coupon: FirstFlight15`;
  return waUrl(msg);
}

// Same route always gives the same estimate, so Popular Routes "from" prices match the search results
function routeSeed(str) {
  let h = 0;
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

// Indicative offers for the entered route
function mockOffers(from, to) {
  const baseUSD = 650 + (routeSeed(from + to) % 400); // 650–1049
  const picks = [
    { airline:"Qatar Airways", code:"QR", stops:"1 Stop",  usd: baseUSD+40, duration:"18h 20m" },
    { airline:"Emirates",      code:"EK", stops:"1 Stop",  usd: baseUSD+20, duration:"17h 55m" },
    { airline:"Etihad",        code:"EY", stops:"1 Stop",  usd: baseUSD+10, duration:"18h 05m" },
    { airline:"Air India",     code:"AI", stops:"Non-stop",usd: baseUSD+80, duration:"14h 50m" },
    { airline:"Air Canada",    code:"AC", stops:"Non-stop",usd: baseUSD+90, duration:"14h 40m" },
    { airline:"United Airlines",code:"UA",stops:"1 Stop",  usd: baseUSD-10, duration:"19h 15m" },
    { airline:"Lufthansa",     code:"LH", stops:"1 Stop",  usd: baseUSD+60, duration:"16h 30m" },
    { airline:"SWISS",         code:"LX", stops:"2 Stops", usd: baseUSD-30, duration:"22h 10m" },
    { airline:"Air France",    code:"AF", stops:"2 Stops", usd: baseUSD-50, duration:"22h 45m" },
    { airline:"KLM",           code:"KL", stops:"1 Stop",  usd: baseUSD+15, duration:"17h 35m" },
    { airline:"Delta Air Lines",code:"DL",stops:"Multi",   usd: baseUSD-70, duration:"24h 20m" }
  ];
  return picks.map(p => {
    const logo = AIRLINES.find(a=>a.code===p.code)?.logo || "airline.png";
    return { ...p, logo, from, to };
  });
}

// Popular routes: tap to prefill the search form
const ROUTES = [
  ["YYZ","DEL","🇨🇦 → 🇮🇳"], ["YVR","DEL","🇨🇦 → 🇮🇳"], ["YYZ","ATQ","🇨🇦 → 🇮🇳"],
  ["YYC","DEL","🇨🇦 → 🇮🇳"], ["JFK","DEL","🇺🇸 → 🇮🇳"], ["SFO","BLR","🇺🇸 → 🇮🇳"]
];
const cityOf = (code) => (AIRPORTS.find(a => a[0] === code) || [code, code])[1];

function renderRoutes() {
  document.getElementById('routeGrid').innerHTML = ROUTES.map(([from, to, flags]) => {
    const fromUSD = Math.min(...mockOffers(from, to).map(o => o.usd));
    return `
      <button type="button" class="route-card text-left rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm hover:shadow-md hover:ring-brand-500 transition" data-from="${esc(from)}" data-to="${esc(to)}">
        <span class="flex items-center justify-between text-sm text-slate-500"><span>${esc(flags)}</span><span>Round-trip</span></span>
        <span class="block mt-2 text-xl font-bold">${esc(cityOf(from))} → ${esc(cityOf(to))}</span>
        <span class="block text-sm text-slate-500">${esc(from)} → ${esc(to)}</span>
        <span class="block mt-4 text-sm text-slate-600">from <span class="text-2xl font-extrabold text-brand-600">${esc(fmt(fromUSD, currency))}</span></span>
        <span class="block mt-1 text-xs text-slate-500">Indicative estimate</span>
      </button>`;
  }).join('');
}
document.getElementById('routeGrid').addEventListener('click', (e) => {
  const card = e.target.closest('.route-card');
  if (!card) return;
  document.getElementById('from').value = airportLabel(card.dataset.from);
  document.getElementById('to').value = airportLabel(card.dataset.to);
  document.querySelector('.trip-btn[data-trip="round"]').click();
  // Focus before scrolling: focusing during a smooth scroll cancels it
  departEl.focus({ preventScroll: true });
  document.getElementById('search').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Lowercase and strip accents/punctuation so "Montréal", "montreal" and "Montreal," all match
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();
const CITY_ALIASES = {
  "delhi":"DEL", "bombay":"BOM", "bangalore":"BLR", "madras":"MAA", "calcutta":"CCU",
  "cochin":"COK", "trivandrum":"TRV", "nyc":"JFK", "new york city":"JFK",
  "washington dc":"IAD", "sf":"SFO", "la":"LAX", "montreal":"YUL"
};

// Accept "DEL — New Delhi", "DEL", "del" or a city name like "Toronto"
function parseAirport(text) {
  const t = (text || "").trim();
  if (!t) return "";
  const m = t.match(/^([A-Za-z]{3})(?![A-Za-z])/);
  if (m && AIRPORTS.some(a => a[0] === m[1].toUpperCase())) return m[1].toUpperCase();
  const key = norm(t);
  if (CITY_ALIASES[key]) return CITY_ALIASES[key];
  const byCity = AIRPORTS.find(a => norm(a[1]) === key);
  return byCity ? byCity[0] : "";
}

const errorEl = document.getElementById('formError');
const showError = (msg) => { errorEl.textContent = msg; errorEl.classList.remove('hidden'); };

let lastSearch = null;
let stopFilter = "all";

function renderResults() {
  if (!lastSearch) return;
  const { offers, details, cur } = lastSearch;
  const shown = offers.filter(o => stopFilter === "all" || o.stops === stopFilter);
  const resultsGrid = document.getElementById('resultsGrid');
  if (!shown.length) {
    resultsGrid.innerHTML = `<p class="text-sm text-slate-600 md:col-span-2">No ${esc(stopFilter.toLowerCase())} options for this route. Message us on WhatsApp and we'll find one.</p>`;
    return;
  }
  resultsGrid.innerHTML = shown.map(o=>{
    const price = fmt(o.usd, cur);
    const d = { ...details, airline:o.airline, stops:o.stops, price };
    const bookLink = waLink('Book Now', d);
    const holdLink = waLink('Hold Now', d);
    return `
      <div class="p-4 bg-white rounded-xl shadow-sm ring-1 ring-slate-200 flex gap-4">
        <img src="assets/logos/${esc(o.logo)}" alt="${esc(o.airline)}" loading="lazy" class="w-14 h-14 object-contain rounded bg-white border"/>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <div>
              <p class="font-semibold">${esc(o.airline)}</p>
              <p class="text-xs text-slate-600">${esc(o.stops)} • ~${esc(o.duration)}</p>
            </div>
            <div>
              <p class="text-brand-600 font-extrabold">from ${esc(price)}</p>
              <p class="text-[11px] text-slate-500">estimate • coupon <span class="font-semibold">FirstFlight15</span></p>
            </div>
          </div>
          <p class="text-sm text-slate-700 mt-1">${esc(o.from)} → ${esc(o.to)} &nbsp;|&nbsp; ${esc(d.cabin)} &nbsp;|&nbsp; Pax A${esc(d.adult)}/C${esc(d.child)}/I${esc(d.infant)}</p>
          <div class="mt-3 flex gap-2">
            <a href="${esc(bookLink)}" target="_blank" rel="noopener" class="px-3 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700">Book Now</a>
            <a href="${esc(holdLink)}" target="_blank" rel="noopener" class="px-3 py-2 rounded-lg bg-white border text-sm font-semibold hover:bg-slate-50">Hold Now</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

document.querySelectorAll('.stop-chip').forEach(chip => chip.addEventListener('click', () => {
  stopFilter = chip.dataset.stops;
  document.querySelectorAll('.stop-chip').forEach(c => {
    c.classList.toggle('active', c === chip);
    c.setAttribute('aria-pressed', c === chip);
  });
  renderResults();
}));

// Form handling
document.getElementById('flightForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  errorEl.classList.add('hidden');

  const from = parseAirport(document.getElementById('from').value);
  const to = parseAirport(document.getElementById('to').value);
  const depart = departEl.value;
  const ret = returnEl.value;
  const adult = +document.getElementById('adult').value;
  const child = +document.getElementById('child').value;
  const infant = +document.getElementById('infant').value;

  if (!from || !to) return showError("Please select valid airports from the list (e.g., DEL — New Delhi).");
  if (from === to) return showError("From and To airports can't be the same.");
  if (!depart) return showError("Please choose a departure date.");
  if (depart < todayISO()) return showError("Departure date can't be in the past.");
  if (tripType === "round" && !ret) return showError("Please choose a return date, or switch to One-way.");
  if (ret && ret < depart) return showError("Return date can't be before the departure date.");
  if (adult + child > MAX_PAX) return showError(`Maximum ${MAX_PAX} passengers (adults + children) per booking. For groups, message us on WhatsApp.`);
  if (infant > adult) return showError("Each infant must travel with an adult — infants can't be more than adults.");

  const details = {
    trip: tripType === "round" ? "Round-trip" : "One-way",
    from, to, depart, return: tripType === "round" ? ret : "",
    cabin: CABINS.includes(document.getElementById('cabin').value) ? document.getElementById('cabin').value : 'Economy', adult, child, infant
  };
  lastSearch = { offers: mockOffers(from, to), details, cur: currency };

  document.getElementById('resultsWrap').classList.remove('hidden');
  renderResults();
  document.getElementById('resultsWrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Contact form → WhatsApp or email (no server needed)
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  if (!form.reportValidity()) return;
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const message = form.elements.message.value.trim();
  if (!name || !message) {
    (name ? form.elements.message : form.elements.name).focus();
    return;
  }
  const text = `Hello Flight to Z,\n\nName: ${name}\nEmail: ${email}\n\n${message}`;
  if (e.submitter && e.submitter.dataset.via === "email") {
    window.location.href = `mailto:Sales@flighttoz.com?subject=${encodeURIComponent("Website enquiry from " + name)}&body=${encodeURIComponent(text)}`;
  } else {
    window.open(waUrl(text), "_blank", "noopener");
  }
});

setCurrency(currency);
