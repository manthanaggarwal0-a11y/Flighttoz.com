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

// Currency the visitor wants their quote in (no prices are shown on the site)
const CURRENCIES = ['USD', 'CAD', 'INR'];

// Default: saved choice, else guess from the visitor's time zone / language
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
}
document.querySelectorAll('.cur-btn').forEach(b => b.addEventListener('click', () => setCurrency(b.dataset.cur)));

// Messages go straight to WhatsApp or the visitor's email app — nothing is sent to or stored on a server
const SALES_EMAIL = "Sales@flighttoz.com";
const waUrl = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
const mailtoUrl = (subject, body) => `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

function sendMessage(via, subject, text) {
  if (via === "email") window.location.href = mailtoUrl(subject, text);
  else window.open(waUrl(text), "_blank", "noopener");
}
const viaOf = (e) => (e.submitter && e.submitter.dataset.via === "email") ? "email" : "whatsapp";

// Where the visitor came from (ad UTM tags), added to messages so each lead shows its source.
// Kept for this browser tab only; values are trimmed to letters, digits, - and _.
function leadSource() {
  const clean = (v) => (v || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40);
  try {
    const q = new URLSearchParams(location.search);
    const tags = ["utm_source", "utm_medium", "utm_campaign", "utm_content"].map(k => clean(q.get(k)));
    if (tags[0]) sessionStorage.setItem("ftz-source", tags.filter(Boolean).join(" / "));
    return sessionStorage.getItem("ftz-source") || "";
  } catch (e) {
    return "";
  }
}
const SOURCE = leadSource();
const sourceLine = () => SOURCE ? `\nSource: ${SOURCE}` : "";

// Popular routes: tap to prefill the quote form
const ROUTES = [
  ["YYZ","DEL","🇨🇦 → 🇮🇳"], ["YVR","DEL","🇨🇦 → 🇮🇳"], ["YYZ","ATQ","🇨🇦 → 🇮🇳"],
  ["YYC","DEL","🇨🇦 → 🇮🇳"], ["JFK","DEL","🇺🇸 → 🇮🇳"], ["SFO","BLR","🇺🇸 → 🇮🇳"]
];
const cityOf = (code) => (AIRPORTS.find(a => a[0] === code) || [code, code])[1];

document.getElementById('routeGrid').innerHTML = ROUTES.map(([from, to, flags]) => `
  <button type="button" class="route-card text-left rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm hover:shadow-md hover:ring-brand-500 transition" data-from="${esc(from)}" data-to="${esc(to)}">
    <span class="flex items-center justify-between text-sm text-slate-500"><span>${esc(flags)}</span><span>Round-trip</span></span>
    <span class="block mt-2 text-xl font-bold">${esc(cityOf(from))} → ${esc(cityOf(to))}</span>
    <span class="block text-sm text-slate-500">${esc(from)} → ${esc(to)}</span>
    <span class="block mt-4 font-semibold text-brand-700">Get a free quote →</span>
  </button>`).join('');

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

// Known airports get their full label; any other city is passed on as typed
function placeLabel(text) {
  const code = parseAirport(text);
  return code ? airportLabel(code) : text.trim().replace(/\s+/g, ' ').slice(0, 60);
}

const errorEl = document.getElementById('formError');
const showError = (msg) => { errorEl.textContent = msg; errorEl.classList.remove('hidden'); };
const quoteSent = document.getElementById('quoteSent');
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Quote form → WhatsApp or email
document.getElementById('flightForm').addEventListener('submit', (e) => {
  e.preventDefault();
  errorEl.classList.add('hidden');
  quoteSent.classList.add('hidden');

  const fromText = document.getElementById('from').value.trim();
  const toText = document.getElementById('to').value.trim();
  const from = placeLabel(fromText);
  const to = placeLabel(toText);
  const depart = departEl.value;
  const ret = tripType === "round" ? returnEl.value : "";
  const adult = +document.getElementById('adult').value;
  const child = +document.getElementById('child').value;
  const infant = +document.getElementById('infant').value;
  const cabinValue = document.getElementById('cabin').value;
  const cabin = CABINS.includes(cabinValue) ? cabinValue : 'Economy';
  const name = document.getElementById('qName').value.trim();
  const phone = document.getElementById('qPhone').value.trim();
  const notes = document.getElementById('qNotes').value.trim();

  if (from.length < 2 || to.length < 2) return showError("Please enter where you're flying from and to.");
  if (from.toLowerCase() === to.toLowerCase()) return showError("From and To can't be the same.");
  if (!depart) return showError("Please choose a departure date.");
  if (depart < todayISO()) return showError("Departure date can't be in the past.");
  if (tripType === "round" && !ret) return showError("Please choose a return date, or switch to One-way.");
  if (ret && ret < depart) return showError("Return date can't be before the departure date.");
  if (adult + child > MAX_PAX) return showError(`Maximum ${MAX_PAX} passengers (adults + children) per request. For groups, tell us in the notes.`);
  if (infant > adult) return showError("Each infant must travel with an adult — infants can't be more than adults.");
  if (!name) return showError("Please enter your name so we know who to reply to.");

  const text =
`Hello Flight to Z,

Please send me a quote for this trip:

Name: ${name}
Phone / WhatsApp: ${phone || "-"}
Trip: ${tripType === "round" ? "Round-trip" : "One-way"}
From: ${from}
To: ${to}
Depart: ${depart}
Return: ${ret || "-"}
Cabin: ${cabin}
Passengers: ${plural(adult, "adult", "adults")}, ${plural(child, "child", "children")}, ${plural(infant, "infant", "infants")}
Quote currency: ${currency}
Notes: ${notes || "-"}

Coupon: FirstFlight15${sourceLine()}`;

  const via = viaOf(e);
  sendMessage(via, `Flight quote request: ${from} to ${to}`, text);
  document.getElementById('quoteSentText').textContent = via === "email"
    ? "Your email app has opened with your trip details. Press Send, and our team will reply with the best fares."
    : "WhatsApp has opened with your trip details. Press Send, and our team will reply with the best fares.";
  quoteSent.classList.remove('hidden');
});

// Contact form → WhatsApp or email
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
  const text = `Hello Flight to Z,\n\nName: ${name}\nEmail: ${email}\n\n${message}${sourceLine() ? "\n" + sourceLine() : ""}`;
  sendMessage(viaOf(e), "Website enquiry from " + name, text);
});

setCurrency(currency);
