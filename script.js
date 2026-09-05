/* ---------- storage helpers ---------- */
async function sget(key, shared){ try{ const r = await window.storage.get(key, !!shared); return r ? r.value : null; }catch(e){ return null; } }
async function sset(key, value, shared){ try{ return await window.storage.set(key, value, !!shared); }catch(e){ return null; } }

function uid(){ return Math.random().toString(36).slice(2,10); }
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function seededShuffle(arr, seed){
  const rng = mulberry32(seed);
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function shuffleRandom(arr){ return seededShuffle(arr, Math.floor(Math.random()*1e9)); }

/* ---------- LEVELS: 10 levels x 5 questions, increasing difficulty ---------- */
const LEVELS = [
  { title:"Розминка", q:[
    {q:"Яке слово зайве?", o:["Кіт","Собака","Стіл","Кінь"], a:2},
    {q:"Продовжте: 1, 2, 3, 4, ?", o:["5","6","7","4"], a:0},
    {q:"Скільки днів у тижні?", o:["5","6","7","8"], a:2},
    {q:"Яка пора року йде після зими?", o:["Осінь","Весна","Літо","Зима"], a:1},
    {q:"Скільки буде 2 + 2 × 2?", o:["8","6","4","10"], a:1},
  ]},
  { title:"Легкий старт", q:[
    {q:"Продовжте: 5, 10, 15, 20, ?", o:["22","24","25","30"], a:2},
    {q:"Яке слово зайве?", o:["Яблуко","Банан","Морква","Груша"], a:2},
    {q:"Рука : Пальці = Дерево : ?", o:["Листя","Земля","Небо","Вода"], a:0},
    {q:"Продовжте: A, B, C, D, ?", o:["E","F","D","G"], a:0},
    {q:"Скільки місяців у році?", o:["10","11","12","13"], a:2},
  ]},
  { title:"Впевнений крок", q:[
    {q:"Продовжте: 2, 4, 8, 16, ?", o:["24","32","20","64"], a:1},
    {q:"Книга : Читати = Їжа : ?", o:["Готувати","Їсти","Купувати","Мити"], a:1},
    {q:"Яке слово зайве?", o:["Собака","Кіт","Стілець","Кінь"], a:2},
    {q:"Продовжте: 3, 6, 9, 12, ?", o:["14","16","15","18"], a:2},
    {q:"Годинник : Час = Термометр : ?", o:["Погода","Температура","Скло","Ртуть"], a:1},
  ]},
  { title:"Логічний ритм", q:[
    {q:"Продовжте: 1, 4, 9, 16, 25, ?", o:["30","36","32","49"], a:1},
    {q:"Птах : Гніздо = Людина : ?", o:["Робота","Дім","Місто","Сім'я"], a:1},
    {q:"Продовжте буквений ряд: A, C, E, G, ?", o:["H","I","F","J"], a:1},
    {q:"Яке слово зайве?", o:["Трикутник","Квадрат","Коло","Дерево"], a:3},
    {q:"Якщо всі коти — тварини, і Мурчик — кіт, то Мурчик — це:", o:["Птах","Рослина","Тварина","Річ"], a:2},
  ]},
  { title:"Числовий вимір", q:[
    {q:"Продовжте: 1, 1, 2, 3, 5, 8, ?", o:["11","12","13","10"], a:2},
    {q:"Продовжте буквений ряд: B, D, F, H, ?", o:["I","K","J","G"], a:2},
    {q:"У Марії 3 брати, і в кожного брата є одна сестра. Скільки сестер у братів?", o:["1","2","3","4"], a:0},
    {q:"Продовжте: 7, 14, 21, 28, ?", o:["30","35","32","42"], a:1},
    {q:"Що важче: кілограм пір'я чи кілограм заліза?", o:["Пір'я","Залізо","Однаково","Не можна визначити"], a:2},
  ]},
  { title:"Аналітичний рівень", q:[
    {q:"Продовжте: 2, 6, 18, 54, ?", o:["108","162","216","144"], a:1},
    {q:"Продовжте: 100, 90, 81, 73, ?", o:["66","65","64","67"], a:0},
    {q:"Художник : Пензель = Письменник : ?", o:["Папір","Ручка","Книга","Стіл"], a:1},
    {q:"Яке число зайве: 3, 5, 7, 9, 10?", o:["3","9","10","7"], a:2},
    {q:"Сьогодні вівторок. Яким днем буде через 10 днів?", o:["Четвер","П'ятниця","Субота","Середа"], a:1},
  ]},
  { title:"Розумний виклик", q:[
    {q:"Продовжте: 4, 9, 16, 25, 36, ?", o:["42","49","45","48"], a:1},
    {q:"5 машин фарбують 5 парканів за 5 днів. За скільки днів 100 машин пофарбують 100 парканів?", o:["100","20","5","1"], a:2},
    {q:"Лікар : Лікарня = Вчитель : ?", o:["Клас","Школа","Дошка","Учень"], a:1},
    {q:"Яке слово не належить до групи: Флейта, Труба, Саксофон, Барабан?", o:["Флейта","Труба","Саксофон","Барабан"], a:3},
    {q:"Продовжте: 12, 24, 36, 48, ?", o:["54","58","60","50"], a:2},
  ]},
  { title:"Стратег", q:[
    {q:"Продовжте: 1, 2, 6, 24, 120, ?", o:["720","600","840","360"], a:0},
    {q:"Три сестри мають по одному спільному брату. Скільки всього дітей у родині?", o:["3","4","6","7"], a:1},
    {q:"Насіння : Дерево = Яйце : ?", o:["Гніздо","Птах","Шкаралупа","Курка"], a:1},
    {q:"Продовжте: 2, 3, 5, 7, 11, ?", o:["12","13","14","15"], a:1},
    {q:"Потяг їде зі швидкістю 60 км/год. За скільки часу він проїде 150 км?", o:["2 год","2,5 год","3 год","1,5 год"], a:1},
  ]},
  { title:"Майстер логіки", q:[
    {q:"Продовжте: 3, 7, 15, 31, 63, ?", o:["120","125","127","130"], a:2},
    {q:"У кімнаті 4 кути, у кожному сидить кіт. Навпроти кожного кота — 3 коти. Скільки всього котів у кімнаті?", o:["4","12","16","8"], a:0},
    {q:"Океан : Крапля = Пустеля : ?", o:["Піщинка","Оазис","Верблюд","Спека"], a:0},
    {q:"Продовжте буквений ряд: Z, X, V, T, ?", o:["S","R","Q","U"], a:1},
    {q:"Один годинник зупинений, інший поспішає на хвилину щодня. Який з них точніший протягом року?", o:["Той, що поспішає","Зупинений","Обидва однаково","Жоден"], a:1},
  ]},
  { title:"Геній", q:[
    {q:"Продовжте: 1, 3, 6, 10, 15, ?", o:["18","20","21","22"], a:2},
    {q:"Скільки разів на добу годинникові стрілки накладаються одна на одну?", o:["12","22","24","20"], a:1},
    {q:"Симфонія : Композитор = Роман : ?", o:["Читач","Письменник","Сторінка","Бібліотека"], a:1},
    {q:"Продовжте: 5, 11, 23, 47, ?", o:["93","94","95","96"], a:2},
    {q:"Що можна зловити, але не можна кинути?", o:["М'яч","Застуду","Рибу","Метелика"], a:1},
  ]},
];
const ALL_QUESTIONS = LEVELS.flatMap(l=>l.q);

/* ---------- CLASSIC test bank ---------- */
const BANK = [
  {q:"Продовжте послідовність: 2, 4, 8, 16, ?", o:["24","32","20","64"], a:1},
  {q:"Продовжте послідовність: 1, 4, 9, 16, 25, ?", o:["30","36","32","49"], a:1},
  {q:"Продовжте послідовність: 3, 6, 9, 12, ?", o:["14","16","15","18"], a:2},
  {q:"Продовжте послідовність: 5, 10, 20, 40, ?", o:["60","70","80","50"], a:2},
  {q:"Продовжте послідовність: 1, 1, 2, 3, 5, 8, ?", o:["11","12","13","10"], a:2},
  {q:"Продовжте послідовність: 2, 6, 18, 54, ?", o:["108","162","216","144"], a:1},
  {q:"Яке слово зайве?", o:["Яблуко","Банан","Морква","Груша"], a:2},
  {q:"Яке слово зайве?", o:["Собака","Кіт","Стілець","Кінь"], a:2},
  {q:"Яке слово зайве?", o:["Трикутник","Квадрат","Коло","Дерево"], a:3},
  {q:"Яке слово зайве?", o:["Червоний","Синій","Зелений","Важкий"], a:3},
  {q:"Рука : Пальці = Дерево : ?", o:["Листя","Земля","Небо","Вода"], a:0},
  {q:"Книга : Читати = Їжа : ?", o:["Готувати","Їсти","Купувати","Мити"], a:1},
  {q:"Годинник : Час = Термометр : ?", o:["Погода","Температура","Скло","Ртуть"], a:1},
  {q:"Птах : Гніздо = Людина : ?", o:["Робота","Дім","Місто","Сім'я"], a:1},
  {q:"Продовжте буквений ряд: A, C, E, G, ?", o:["H","I","F","J"], a:1},
  {q:"Продовжте буквений ряд: B, D, F, H, ?", o:["I","K","J","G"], a:2},
  {q:"Якщо всі коти — тварини, і Мурчик — кіт, то Мурчик — це:", o:["Птах","Рослина","Тварина","Річ"], a:2},
  {q:"У Марії 3 брати, і в кожного брата є одна сестра. Скільки сестер у братів?", o:["1","2","3","4"], a:0},
  {q:"Що важче: кілограм пір'я чи кілограм заліза?", o:["Пір'я","Залізо","Однаково","Неможливо визначити"], a:2},
  {q:"Продовжте послідовність: 7, 14, 21, 28, ?", o:["30","35","32","42"], a:1}
];

/* ---------- IMAGE IQ test bank ---------- */
const IMAGE_BANK = [
  {
    q:"Яка фігура має бути наступною?",
    picture:`<svg viewBox="0 0 420 210" width="420" height="210"><rect width="420" height="210" rx="14" fill="#10101b"/><circle cx="75" cy="105" r="38" fill="none" stroke="#22d3ee" stroke-width="8"/><rect x="150" y="67" width="76" height="76" fill="none" stroke="#8b5cf6" stroke-width="8"/><polygon points="315,65 355,140 275,140" fill="none" stroke="#ec4899" stroke-width="8"/><text x="210" y="190" text-anchor="middle" fill="#8b899e" font-size="15">○ → □ → △ → ?</text></svg>`,
    o:[
      `<svg viewBox="0 0 120 100"><circle cx="60" cy="50" r="28" fill="none" stroke="#22d3ee" stroke-width="7"/></svg>`,
      `<svg viewBox="0 0 120 100"><polygon points="60,18 94,78 26,78" fill="none" stroke="#ec4899" stroke-width="7"/></svg>`,
      `<svg viewBox="0 0 120 100"><rect x="32" y="22" width="56" height="56" fill="none" stroke="#8b5cf6" stroke-width="7"/></svg>`,
      `<svg viewBox="0 0 120 100"><polygon points="60,15 90,35 90,70 60,88 30,70 30,35" fill="none" stroke="#f5c542" stroke-width="7"/></svg>`
    ], a:3
  },
  {
    q:"Знайди фігуру, яка продовжує закономірність.",
    picture:`<svg viewBox="0 0 420 210" width="420" height="210"><rect width="420" height="210" rx="14" fill="#10101b"/><circle cx="75" cy="105" r="32" fill="#22d3ee"/><circle cx="165" cy="105" r="32" fill="none" stroke="#22d3ee" stroke-width="7"/><circle cx="255" cy="105" r="32" fill="#22d3ee"/><circle cx="345" cy="105" r="32" fill="none" stroke="#22d3ee" stroke-width="7"/><text x="210" y="180" text-anchor="middle" fill="#8b899e" font-size="15">● → ○ → ● → ○ → ?</text></svg>`,
    o:[
      `<svg viewBox="0 0 120 100"><circle cx="60" cy="50" r="28" fill="#22d3ee"/></svg>`,
      `<svg viewBox="0 0 120 100"><rect x="32" y="22" width="56" height="56" fill="#22d3ee"/></svg>`,
      `<svg viewBox="0 0 120 100"><circle cx="60" cy="50" r="28" fill="none" stroke="#22d3ee" stroke-width="7"/></svg>`,
      `<svg viewBox="0 0 120 100"><polygon points="60,18 94,78 26,78" fill="#22d3ee"/></svg>`
    ], a:0
  },
  {
    q:"Яка плитка логічно завершує ряд?",
    picture:`<svg viewBox="0 0 420 210" width="420" height="210"><rect width="420" height="210" rx="14" fill="#10101b"/><g stroke="#8b5cf6" stroke-width="7" fill="none"><rect x="45" y="65" width="70" height="70"/><rect x="145" y="65" width="70" height="70"/><rect x="245" y="65" width="70" height="70"/></g><circle cx="80" cy="100" r="13" fill="#22d3ee"/><circle cx="180" cy="100" r="13" fill="#22d3ee"/><circle cx="180" cy="100" r="25" fill="none" stroke="#22d3ee" stroke-width="5"/><circle cx="280" cy="100" r="13" fill="#22d3ee"/><circle cx="280" cy="100" r="25" fill="none" stroke="#22d3ee" stroke-width="5"/><circle cx="280" cy="100" r="37" fill="none" stroke="#22d3ee" stroke-width="5"/></svg>`,
    o:[
      `<svg viewBox="0 0 120 100"><circle cx="60" cy="50" r="13" fill="#22d3ee"/><circle cx="60" cy="50" r="25" fill="none" stroke="#22d3ee" stroke-width="5"/><circle cx="60" cy="50" r="37" fill="none" stroke="#22d3ee" stroke-width="5"/></svg>`,
      `<svg viewBox="0 0 120 100"><circle cx="60" cy="50" r="13" fill="#22d3ee"/></svg>`,
      `<svg viewBox="0 0 120 100"><circle cx="60" cy="50" r="13" fill="#22d3ee"/><circle cx="60" cy="50" r="25" fill="none" stroke="#22d3ee" stroke-width="5"/></svg>`,
      `<svg viewBox="0 0 120 100"><rect x="25" y="20" width="70" height="60" fill="none" stroke="#ec4899" stroke-width="6"/></svg>`
    ], a:0
  },
  {
    q:"Яка стрілка продовжує обертання?",
    picture:`<svg viewBox="0 0 420 210" width="420" height="210"><rect width="420" height="210" rx="14" fill="#10101b"/><g fill="#f5c542"><path d="M75 55h18v75H75z"/><path d="M55 55l29-25 29 25z"/><path d="M165 75h75v18h-75z"/><path d="M240 55l25 29-25 29z"/><path d="M325 80h18v75h-18z"/><path d="M305 155l29 25 29-25z"/></g><text x="210" y="195" text-anchor="middle" fill="#8b899e" font-size="15">↑ → ↓ → ?</text></svg>`,
    o:[
      `<svg viewBox="0 0 120 100"><path d="M52 78h16V28h20L60 8 32 28h20z" fill="#f5c542"/></svg>`,
      `<svg viewBox="0 0 120 100"><path d="M42 32h48v16H42V68L20 50l22-18z" fill="#f5c542"/></svg>`,
      `<svg viewBox="0 0 120 100"><path d="M52 22h16v50h20L60 92 32 72h20z" fill="#f5c542"/></svg>`,
      `<svg viewBox="0 0 120 100"><path d="M78 32H28v16h50v20l22-28-22-28z" fill="#f5c542"/></svg>`
    ], a:2
  },
  {
    q:"Яка фігура зайва?",
    picture:`<svg viewBox="0 0 420 210" width="420" height="210"><rect width="420" height="210" rx="14" fill="#10101b"/><g stroke="#ec4899" stroke-width="7" fill="none"><circle cx="75" cy="105" r="34"/><rect x="135" y="71" width="68" height="68"/><polygon points="270,70 310,140 230,140"/><polygon points="350,72 390,105 350,138 310,105"/></g></svg>`,
    o:[
      `<svg viewBox="0 0 120 100"><circle cx="60" cy="50" r="30" fill="none" stroke="#ec4899" stroke-width="7"/></svg>`,
      `<svg viewBox="0 0 120 100"><rect x="30" y="20" width="60" height="60" fill="none" stroke="#ec4899" stroke-width="7"/></svg>`,
      `<svg viewBox="0 0 120 100"><polygon points="60,18 92,78 28,78" fill="none" stroke="#ec4899" stroke-width="7"/></svg>`,
      `<svg viewBox="0 0 120 100"><polygon points="60,15 92,50 60,85 28,50" fill="none" stroke="#f5c542" stroke-width="7"/></svg>`
    ], a:3
  },
  {
    q:"Що має бути замість знака питання?",
    picture:`<svg viewBox="0 0 420 210" width="420" height="210"><rect width="420" height="210" rx="14" fill="#10101b"/><g fill="none" stroke="#22d3ee" stroke-width="7"><rect x="45" y="65" width="70" height="70"/><rect x="175" y="65" width="70" height="70"/><rect x="305" y="65" width="70" height="70"/></g><circle cx="80" cy="100" r="18" fill="#22d3ee"/><circle cx="210" cy="100" r="18" fill="#22d3ee"/><text x="340" y="118" text-anchor="middle" fill="#ec4899" font-size="48" font-weight="700">?</text></svg>`,
    o:[
      `<svg viewBox="0 0 120 100"><circle cx="60" cy="50" r="18" fill="#22d3ee"/></svg>`,
      `<svg viewBox="0 0 120 100"><circle cx="60" cy="50" r="18" fill="#22d3ee"/><circle cx="60" cy="50" r="34" fill="none" stroke="#22d3ee" stroke-width="6"/></svg>`,
      `<svg viewBox="0 0 120 100"><rect x="30" y="20" width="60" height="60" fill="#22d3ee"/></svg>`,
      `<svg viewBox="0 0 120 100"><polygon points="60,18 92,78 28,78" fill="#22d3ee"/></svg>`
    ], a:1
  }
];

/* ---------- shop items ---------- */
const BODIES = [
  {id:"b1",name:"Смарагд",cost:0,bg:"#10b981"},
  {id:"b2",name:"Аметист",cost:50,bg:"#8b5cf6"},
  {id:"b3",name:"Вогонь",cost:80,bg:"#f97316"},
  {id:"b4",name:"Крига",cost:80,bg:"#22d3ee"},
  {id:"b5",name:"Золото",cost:150,bg:"#eab308"},
  {id:"b6",name:"Космос",cost:220,bg:"linear-gradient(135deg,#8b5cf6,#ec4899)"}
];
const HATS = [
  {id:"h0",name:"Без капелюха",cost:0,emoji:""},
  {id:"h1",name:"Корона",cost:120,emoji:"👑"},
  {id:"h2",name:"Кепка",cost:60,emoji:"🧢"},
  {id:"h3",name:"Циліндр",cost:100,emoji:"🎩"},
  {id:"h4",name:"Ковбойський",cost:90,emoji:"🤠"},
  {id:"h5",name:"Випускний",cost:110,emoji:"🎓"}
];
const FACES = [
  {id:"f0",name:"Звичайне",cost:0,emoji:""},
  {id:"f1",name:"Темні окуляри",cost:50,emoji:"🕶️"},
  {id:"f2",name:"Розумні окуляри",cost:70,emoji:"🤓"},
  {id:"f3",name:"Зірочки",cost:65,emoji:"🤩"},
  {id:"f4",name:"Робот",cost:130,emoji:"🤖"}
];
const AURAS = [
  {id:"a0",name:"Без аури",cost:0,glow:"none"},
  {id:"a1",name:"Неонова",cost:100,glow:"0 0 34px #22d3ee"},
  {id:"a2",name:"Вогняна",cost:100,glow:"0 0 34px #f97316"},
  {id:"a3",name:"Райдужна",cost:180,glow:"0 0 40px #ec4899"}
];
function findItem(cat,id){ const m={body:BODIES,hat:HATS,face:FACES,aura:AURAS}[cat]; return m.find(i=>i.id===id); }

/* ---------- state ---------- */
let profile = null;
let tab = "test";
let testMode = "levels"; // "levels" | "classic" | "image"
let shopCat = "body";
let testState = null; // {questions, idx, score, answered, coinsEarned, done, mode, levelNum}
let duelState = { screen:"menu", code:null, room:null, pollTimer:null };

const defaultProfile = ()=>({
  id: uid(), name:"Гравець", coins:0, bestScore:0, gamesPlayed:0,
  owned:["b1","h0","f0","a0"], equipped:{body:"b1",hat:"h0",face:"f0",aura:"a0"},
  unlockedLevel:1, levelStars:{}
});

async function loadProfile(){
  let p = await sget("profile", false);
  if(!p){ p = defaultProfile(); await sset("profile", p, false); }
  else if(typeof p === "string"){ try{ p = JSON.parse(p); }catch(e){ p = defaultProfile(); } }
  if(!p.unlockedLevel) p.unlockedLevel = 1;
  if(!p.levelStars) p.levelStars = {};
  profile = p;
}
async function saveProfile(){ await sset("profile", profile, false); }

/* ---------- avatar render ---------- */
function avatarHTML(size, equipped){
  const body = findItem("body", equipped.body) || BODIES[0];
  const hat = findItem("hat", equipped.hat) || HATS[0];
  const face = findItem("face", equipped.face) || FACES[0];
  const aura = findItem("aura", equipped.aura) || AURAS[0];
  return `<div class="avatar-body" style="width:${size}px;height:${size}px;background:${body.bg};box-shadow:${aura.glow};">
    ${hat.emoji ? `<div class="avatar-hat" style="font-size:${size*0.34}px;top:${-size*0.17}px;">${hat.emoji}</div>`:""}
    <div class="avatar-face" style="font-size:${size*0.26}px;">${face.emoji}</div>
  </div>`;
}

/* ---------- render root ---------- */
function render(){
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="topbar">
      <div class="brand"><div class="brand-orb"></div><div class="brand-name">IQ <span>Arena</span></div></div>
      <div class="coin-pill"><span class="dot"></span>${profile.coins} монет</div>
    </div>
    <div class="tabs">
      ${tabBtn("test","🧠 Тест")}
      ${tabBtn("shop","🛍 Магазин")}
      ${tabBtn("profile","👤 Профіль")}
      ${tabBtn("duel","⚔️ Дуель з другом")}
    </div>
    <div id="tab-content"></div>
  `;
  document.getElementById("tab-content").innerHTML =
    tab==="test" ? renderTest() :
    tab==="shop" ? renderShop() :
    tab==="profile" ? renderProfile() :
    renderDuel();
}
function tabBtn(id,label){ return `<button class="tab-btn ${tab===id?"active":""}" data-tab="${id}">${label}</button>`; }

/* ---------- TEST TAB ---------- */
function startLevelTest(levelNum){
  const level = LEVELS[levelNum-1];
  testState = { questions: level.q.slice(), idx:0, score:0, answered:false, coinsEarned:0, done:false, mode:"level", levelNum };
}
function startClassicTest(seed){
  const pool = seed!=null ? seededShuffle(BANK, seed) : shuffleRandom(BANK);
  testState = { questions: pool.slice(0,10), idx:0, score:0, answered:false, coinsEarned:0, done:false, mode:"classic" };
}
function startImageTest(seed){
  const pool = seed!=null ? seededShuffle(IMAGE_BANK, seed) : shuffleRandom(IMAGE_BANK);
  testState = { questions: pool.slice(0,6), idx:0, score:0, answered:false, coinsEarned:0, done:false, mode:"image" };
}
function startDuelTest(seed){
  const pool = seededShuffle(ALL_QUESTIONS, seed);
  testState = { questions: pool.slice(0,10), idx:0, score:0, answered:false, coinsEarned:0, done:false, mode:"duel" };
}

function totalStars(){ return Object.values(profile.levelStars).reduce((s,v)=>s+v,0); }

function renderTest(){
  if(!testState){
    const stars = totalStars();
    const pct = Math.round(stars/30*100);
    const modePills = `
      <div class="shop-cats">
        <button class="cat-chip ${testMode==="levels"?"active":""}" data-testmode="levels">Рівні</button>
        <button class="cat-chip ${testMode==="classic"?"active":""}" data-testmode="classic">Класичний</button>
        <button class="cat-chip ${testMode==="image"?"active":""}" data-testmode="image">Картинки</button>
        <button class="cat-chip ${testMode==="dima"?"active":""}" data-testmode="dima">Зображення</button>
      </div>`;
    let heroTitle, heroText, body;
    if(testMode==="levels"){
      heroTitle = "Шлях до генія 🧠";
      heroText = "10 рівнів, кожен наступний складніший за попередній. Пройди рівень мінімум на 3/5, щоб відкрити наступний.";
      body = `<div class="level-grid">${LEVELS.map((lvl,i)=>levelNode(lvl,i+1)).join("")}</div>`;
    } else if(testMode==="classic"){
      heroTitle = "Класичний IQ-тест 🧠";
      heroText = "10 випадкових числових, словесних та логічних завдань.";
      body = `
        <div class="image-test-menu">
          <div class="image-test-card">
            <div class="test-type-badge">КЛАСИЧНИЙ</div>
            <h3>Логічний тест</h3>
            <p>10 випадкових числових, словесних та логічних завдань. Кращий результат: ${profile.bestScore}/10.</p>
            <button class="grad-btn" data-action="start-classic">Почати тест</button>
          </div>
        </div>`;
    } else {
      heroTitle = "IQ по картинках 🧩";
      heroText = "6 завдань із фігурами, закономірностями та візуальною логікою.";
      body = `
        <div class="image-test-menu">
          <div class="image-test-card">
            <div class="test-type-badge">РЕЖИМ КАРТИНОК</div>
            <h3>IQ по картинках</h3>
            <p>6 завдань із фігурами, закономірностями та візуальною логікою.</p>
            <button class="grad-btn" data-action="start-image">Почати тест</button>
          </div>
        </div>`;
    }
    return `
      <div class="card">
        <div class="hero-row">
          ${gauge(pct, stars+"/30", "зірок за рівні")}
          <div class="hero-text">
            <h2>${heroTitle}</h2>
            <p>${heroText}</p>
          </div>
        </div>
        ${modePills}
        ${body}
      </div>`;
  }

  if(testState.done){
    if(testState.mode==="level"){
      const passed = testState.score>=3;
      const stars = testState.score>=5?3:testState.score>=4?2:testState.score>=3?1:0;
      return `
        <div class="card result-box">
          <div class="pass-tag ${passed?"win":"fail"}">${passed?"Рівень пройдено!":"Спробуй ще раз"}</div>
          <div class="big">${testState.score}/5</div>
          <div class="stars-big">${"★".repeat(stars)}${"☆".repeat(3-stars)}</div>
          <div class="result-row">
            <div class="result-stat"><b>+${testState.coinsEarned}</b><small>монет</small></div>
            <div class="result-stat"><b>${testState.levelNum}</b><small>рівень</small></div>
          </div>
          <button class="grad-btn" data-action="retry-level" data-lvl="${testState.levelNum}">Пройти ще раз</button>
          <button class="ghost-btn" data-action="to-map" style="margin-left:10px;">Карта рівнів</button>
        </div>`;
    }
    // classic / image results
    const iq = 70 + testState.score * (testState.mode==="image" ? 10 : 8);
    return `
      <div class="card result-box">
        <div class="muted" style="letter-spacing:1px;font-size:13px;">РЕЗУЛЬТАТ — ${testState.mode==="image" ? "IQ ПО КАРТИНКАХ" : "КЛАСИЧНИЙ ТЕСТ"}</div>
        <div class="big">${testState.score}/${testState.questions.length}</div>
        <div class="result-row">
          <div class="result-stat"><b>${iq}</b><small>ігровий IQ-бал</small></div>
          <div class="result-stat"><b>+${testState.coinsEarned}</b><small>монет</small></div>
          <div class="result-stat"><b>${profile.gamesPlayed}</b><small>тестів пройдено</small></div>
        </div>
        <button class="grad-btn" data-action="${testState.mode==="image" ? "start-image" : "start-classic"}">Пройти ще раз</button>
        <button class="ghost-btn" data-action="back-tests" style="margin-left:10px;">До тестів</button>
      </div>`;
  }

  const q = testState.questions[testState.idx];
  const total = testState.questions.length;
  const prog = testState.questions.map((_,i)=>{
    const cls = i<testState.idx ? "done" : i===testState.idx ? "now" : "";
    return `<i class="${cls}"></i>`;
  }).join("");
  const heading = testState.mode==="level" ? `Рівень ${testState.levelNum}: ${LEVELS[testState.levelNum-1].title}`
    : testState.mode==="duel" ? "Дуельний тест"
    : testState.mode==="image" ? "IQ по картинках"
    : "Класичний тест";

  if(testState.mode==="image"){
    return `
      <div class="card">
        <div class="muted" style="font-size:12.5px;margin-bottom:10px;letter-spacing:.3px;">${heading}</div>
        <div class="q-progress">${prog}</div>
        <div class="muted" style="font-size:13px;margin-bottom:6px;">Питання ${testState.idx+1} з ${total}</div>
        <div class="q-text">${q.q}</div>
        <div class="picture-box">${q.picture}</div>
        <div class="image-options">
          ${q.o.map((opt,i)=>`<button class="opt-btn image-opt" data-action="answer" data-i="${i}">${opt}</button>`).join("")}
        </div>
      </div>`;
  }
  return `
    <div class="card">
      <div class="muted" style="font-size:12.5px;margin-bottom:10px;letter-spacing:.3px;">${heading}</div>
      <div class="q-progress">${prog}</div>
      <div class="muted" style="font-size:13px;margin-bottom:6px;">Питання ${testState.idx+1} з ${total}</div>
      <div class="q-text">${q.q}</div>
      <div class="opts">
        ${q.o.map((opt,i)=>`<button class="opt-btn" data-action="answer" data-i="${i}">${opt}</button>`).join("")}
      </div>
    </div>`;
}

function levelNode(lvl, num){
  const unlocked = num <= profile.unlockedLevel;
  const stars = profile.levelStars[num] || 0;
  if(!unlocked){
    return `<div class="level-node locked"><div class="level-num">${num}</div><div class="level-title">${lvl.title}</div><div class="level-lock">🔒</div></div>`;
  }
  return `<div class="level-node unlocked" data-action="start-level" data-lvl="${num}">
    <div class="level-num">${num}</div>
    <div class="level-title">${lvl.title}</div>
    <div class="level-stars">${stars>0 ? "★".repeat(stars)+"☆".repeat(3-stars) : "Грати"}</div>
  </div>`;
}

function gauge(pct, big, label){
  return `
    <div class="gauge-wrap">
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r="64" fill="none" stroke="#26263a" stroke-width="12"/>
        <circle cx="75" cy="75" r="64" fill="none" stroke="url(#g1)" stroke-width="12" stroke-linecap="round"
          stroke-dasharray="${2*Math.PI*64}" stroke-dashoffset="${2*Math.PI*64*(1-pct/100)}" transform="rotate(-90 75 75)"/>
        <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#22d3ee"/>
        </linearGradient></defs>
      </svg>
      <div class="gauge-num"><b>${big}</b><small>${label}</small></div>
    </div>`;
}

async function handleAnswer(i){
  if(testState.answered) return;
  testState.answered = true;
  const q = testState.questions[testState.idx];
  const correct = i===q.a;
  if(correct) testState.score++;
  document.querySelectorAll(".opt-btn").forEach((btn,idx)=>{
    btn.disabled = true;
    if(idx===q.a) btn.classList.add("correct");
    else if(idx===i) btn.classList.add("wrong");
  });
  await new Promise(r=>setTimeout(r,650));
  testState.idx++;
  testState.answered = false;
  if(testState.idx >= testState.questions.length){
    testState.done = true;
    if(testState.mode==="duel"){
      finishDuelTest();
      return;
    }
    if(testState.mode==="level"){
      const passed = testState.score>=3;
      const stars = testState.score>=5?3:testState.score>=4?2:testState.score>=3?1:0;
      const coins = testState.score*10 + testState.levelNum*3;
      testState.coinsEarned = coins;
      profile.coins += coins;
      profile.gamesPlayed += 1;
      const prevStars = profile.levelStars[testState.levelNum] || 0;
      if(stars > prevStars) profile.levelStars[testState.levelNum] = stars;
      if(passed && testState.levelNum === profile.unlockedLevel && profile.unlockedLevel < LEVELS.length){
        profile.unlockedLevel += 1;
      }
    } else {
      const coins = testState.score*15 + (testState.score===testState.questions.length ? 50 : 0);
      testState.coinsEarned = coins;
      profile.coins += coins;
      profile.gamesPlayed += 1;
      if(testState.score > profile.bestScore) profile.bestScore = testState.score;
    }
    await saveProfile();
  }
  render();
}

/* ---------- SHOP TAB ---------- */
function renderShop(){
  const cats = [["body","Тіло"],["hat","Капелюх"],["face","Обличчя"],["aura","Аура"]];
  const map = {body:BODIES, hat:HATS, face:FACES, aura:AURAS};
  const items = map[shopCat];
  return `
    <div class="card">
      <div class="shop-cats">
        ${cats.map(([id,label])=>`<button class="cat-chip ${shopCat===id?"active":""}" data-shopcat="${id}">${label}</button>`).join("")}
      </div>
      <div class="shop-grid">
        ${items.map(it=>itemCard(it)).join("")}
      </div>
    </div>`;
}
function itemCard(it){
  const owned = profile.owned.includes(it.id);
  const equipped = profile.equipped[shopCat]===it.id;
  const preview = shopCat==="body"
    ? `<div class="item-preview" style="background:${it.bg};"></div>`
    : shopCat==="aura"
      ? `<div class="item-preview" style="background:#1a1a28;box-shadow:${it.glow};"></div>`
      : `<div class="item-preview">${it.emoji||"—"}</div>`;
  let btn;
  if(equipped) btn = `<button class="item-btn equipped" disabled>Одягнено ✓</button>`;
  else if(owned) btn = `<button class="item-btn owned" data-action="equip" data-cat="${shopCat}" data-id="${it.id}">Одягнути</button>`;
  else if(profile.coins>=it.cost) btn = `<button class="item-btn buy" data-action="buy" data-cat="${shopCat}" data-id="${it.id}">Купити за ${it.cost}</button>`;
  else btn = `<button class="item-btn locked" disabled>Потрібно ${it.cost}</button>`;
  return `<div class="item-card">${preview}<div class="item-name">${it.name}</div><div class="item-cost">${it.cost===0?"безкоштовно":it.cost+" 🪙"}</div>${btn}</div>`;
}
async function buyItem(cat,id){
  const it = findItem(cat,id);
  if(!it || profile.coins<it.cost || profile.owned.includes(id)) return;
  profile.coins -= it.cost;
  profile.owned.push(id);
  profile.equipped[cat] = id;
  await saveProfile();
  render();
}
async function equipItem(cat,id){
  profile.equipped[cat] = id;
  await saveProfile();
  render();
}

/* ---------- PROFILE TAB ---------- */
function renderProfile(){
  return `
    <div class="card">
      <div class="profile-top">
        <div class="avatar-shell">${avatarHTML(130, profile.equipped)}</div>
        <div>
          <div class="muted" style="font-size:12px;margin-bottom:6px;">ІМ'Я ГРАВЦЯ</div>
          <input class="name-input" id="name-input" value="${profile.name}" maxlength="16"/>
        </div>
      </div>
      <div class="stat-grid">
        <div class="stat-card"><b>${profile.coins}</b><small>монет</small></div>
        <div class="stat-card"><b>${profile.unlockedLevel}/10</b><small>відкритий рівень</small></div>
        <div class="stat-card"><b>${totalStars()}/30</b><small>зірок зібрано</small></div>
        <div class="stat-card"><b>${profile.bestScore}/10</b><small>кращий класичний результат</small></div>
        <div class="stat-card"><b>${profile.gamesPlayed}</b><small>тестів пройдено</small></div>
      </div>
    </div>`;
}

/* ---------- DUEL TAB ---------- */
function stopPoll(){ if(duelState.pollTimer){ clearInterval(duelState.pollTimer); duelState.pollTimer=null; } }

function renderDuel(){
  if(duelState.screen==="menu"){
    return `
      <div class="card">
        <h2 style="margin-top:0;">Дуель з другом ⚔️</h2>
        <p class="muted">Створи кімнату, поділись кодом із другом — і подивись, хто набере більше балів в однаковому тесті.</p>
        <div class="duel-choice">
          <div class="duel-card">
            <h3>Створити кімнату</h3>
            <p class="muted" style="font-size:13.5px;">Ти отримаєш код для друга.</p>
            <button class="grad-btn" data-action="duel-create">Створити</button>
          </div>
          <div class="duel-card">
            <h3>Приєднатися</h3>
            <p class="muted" style="font-size:13.5px;">Введи код кімнати друга.</p>
            <input class="code-input" id="join-code" placeholder="0000" maxlength="4"/>
            <button class="ghost-btn" data-action="duel-join">Увійти</button>
          </div>
        </div>
      </div>`;
  }
  if(duelState.screen==="waiting"){
    const players = duelState.room ? Object.values(duelState.room.players) : [];
    return `
      <div class="card" style="text-align:center;">
        <div class="muted" style="font-size:13px;">КОД КІМНАТИ — надішли другу</div>
        <div class="room-code-big">${duelState.code}</div>
        <div class="muted" style="margin:14px 0;"><span class="pulse-dot"></span>Очікуємо другого гравця (${players.length}/2)...</div>
        <button class="ghost-btn" data-action="duel-leave">Скасувати</button>
      </div>`;
  }
  if(duelState.screen==="ready"){
    const players = Object.values(duelState.room.players);
    return `
      <div class="card" style="text-align:center;">
        <div class="muted" style="font-size:13px;margin-bottom:6px;">КІМНАТА ${duelState.code}</div>
        <h2 style="margin:4px 0 14px;">Обидва гравці готові!</h2>
        <div class="vs-row">
          ${players.map(p=>`<div class="vs-player"><div class="vs-avatar" style="background:#8b5cf6;border-radius:50%;"></div><div>${escapeHTML(p.name)}</div></div>`).join(`<div class="vs-mid">VS</div>`)}
        </div>
        <button class="grad-btn" data-action="duel-start">Почати тест</button>
      </div>`;
  }
  if(duelState.screen==="playing"){
    return renderTest();
  }
  if(duelState.screen==="waitresult"){
    return `
      <div class="card" style="text-align:center;">
        <div class="big" style="font-size:34px;">Твій результат: ${testState.score}/10</div>
        <div class="muted" style="margin:14px 0;"><span class="pulse-dot"></span>Очікуємо результат друга...</div>
      </div>`;
  }
  if(duelState.screen==="result"){
    const me = duelState.room.players[profile.id];
    const other = Object.entries(duelState.room.players).find(([pid])=>pid!==profile.id);
    const otherP = other ? other[1] : {name:"Друг", score:0};
    let banner, color;
    if(me.score>otherP.score){ banner="Перемога! 🏆"; color="var(--good)"; }
    else if(me.score<otherP.score){ banner="Поразка 😅"; color="var(--danger)"; }
    else { banner="Нічия! 🤝"; color="var(--gold)"; }
    return `
      <div class="card" style="text-align:center;">
        <div class="winner-banner" style="color:${color};">${banner}</div>
        <div class="vs-row">
          <div class="vs-player"><b style="font-size:24px;">${me.score}/10</b><div>${escapeHTML(profile.name)} (ти)</div></div>
          <div class="vs-mid">VS</div>
          <div class="vs-player"><b style="font-size:24px;">${otherP.score}/10</b><div>${escapeHTML(otherP.name)}</div></div>
        </div>
        <button class="grad-btn" data-action="duel-leave">До меню дуелей</button>
      </div>`;
  }
}
function escapeHTML(s){ return (s||"").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

async function duelCreate(){
  const code = String(Math.floor(1000+Math.random()*9000));
  const room = { seed: Math.floor(Math.random()*1e9), players:{ [profile.id]: {name:profile.name, score:null, finished:false} } };
  await sset("room:"+code, room, true);
  duelState = { screen:"waiting", code, room, pollTimer:null };
  render();
  duelState.pollTimer = setInterval(pollRoom, 1800);
}
async function duelJoin(){
  const input = document.getElementById("join-code");
  const code = input ? input.value.trim() : "";
  if(!code || code.length<4){ alert("Введи 4-значний код кімнати"); return; }
  let room = await sget("room:"+code, true);
  if(typeof room === "string"){ try{ room = JSON.parse(room); }catch(e){ room=null; } }
  if(!room){ alert("Кімнату не знайдено"); return; }
  if(!room.players[profile.id]){
    if(Object.keys(room.players).length>=2){ alert("Кімната вже заповнена"); return; }
    room.players[profile.id] = {name:profile.name, score:null, finished:false};
    await sset("room:"+code, room, true);
  }
  duelState = { screen: Object.keys(room.players).length>=2 ? "ready" : "waiting", code, room, pollTimer:null };
  render();
  if(duelState.screen==="waiting") duelState.pollTimer = setInterval(pollRoom, 1800);
}
async function pollRoom(){
  if(!duelState.code) return;
  let room = await sget("room:"+duelState.code, true);
  if(typeof room === "string"){ try{ room = JSON.parse(room); }catch(e){ room=null; } }
  if(!room) return;
  duelState.room = room;
  const count = Object.keys(room.players).length;
  if(duelState.screen==="waiting" && count>=2){
    stopPoll();
    duelState.screen = "ready";
    render();
  } else if(duelState.screen==="waitresult"){
    const all = Object.values(room.players);
    if(all.length>=2 && all.every(p=>p.finished)){
      stopPoll();
      duelState.screen = "result";
      render();
    }
  }
}
async function duelStart(){
  stopPoll();
  duelState.screen = "playing";
  startDuelTest(duelState.room.seed);
  render();
}
async function duelLeave(){
  stopPoll();
  duelState = { screen:"menu", code:null, room:null, pollTimer:null };
  testState = null;
  render();
}
async function finishDuelTest(){
  let room = await sget("room:"+duelState.code, true);
  if(typeof room === "string"){ try{ room = JSON.parse(room); }catch(e){ room=null; } }
  if(!room) room = duelState.room;
  room.players[profile.id] = {name:profile.name, score:testState.score, finished:true};
  await sset("room:"+duelState.code, room, true);
  duelState.room = room;
  duelState.screen = "waitresult";
  render();
  duelState.pollTimer = setInterval(pollRoom, 1800);
  pollRoom();
}

/* ---------- events ---------- */
document.addEventListener("click", async (e)=>{
  const t = e.target.closest("[data-action], [data-tab], [data-shopcat], [data-testmode]");
  if(!t) return;
  if(t.dataset.tab){ tab = t.dataset.tab; render(); return; }
  if(t.dataset.testmode){ testMode = t.dataset.testmode; render(); return; }
  if(t.dataset.action==="start-level"){ startLevelTest(parseInt(t.dataset.lvl)); render(); return; }
  if(t.dataset.action==="retry-level"){ startLevelTest(parseInt(t.dataset.lvl)); render(); return; }
  if(t.dataset.action==="start-classic"){ startClassicTest(); render(); return; }
  if(t.dataset.action==="start-image"){ startImageTest(); render(); return; }
  if(t.dataset.action==="to-map"){ testState = null; render(); return; }
  if(t.dataset.action==="back-tests"){ testState = null; render(); return; }
  if(t.dataset.action==="answer"){ handleAnswer(parseInt(t.dataset.i)); return; }
  if(t.dataset.shopcat){ shopCat = t.dataset.shopcat; render(); return; }
  if(t.dataset.action==="buy"){ buyItem(t.dataset.cat, t.dataset.id); return; }
  if(t.dataset.action==="equip"){ equipItem(t.dataset.cat, t.dataset.id); return; }
  if(t.dataset.action==="duel-create"){ duelCreate(); return; }
  if(t.dataset.action==="duel-join"){ duelJoin(); return; }
  if(t.dataset.action==="duel-start"){ duelStart(); return; }
  if(t.dataset.action==="duel-leave"){ duelLeave(); return; }
});
document.addEventListener("change", async (e)=>{
  if(e.target.id==="name-input"){
    profile.name = e.target.value.trim() || "Гравець";
    await saveProfile();
  }
});

/* ---------- init ---------- */
(async function init(){
  await loadProfile();
  render();
})();
