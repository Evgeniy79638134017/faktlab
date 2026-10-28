/* Native vector illustrations for the five installation actions. No account state. */
var InstallVisuals = (() => {
  "use strict";
  const titles = [
    "ChatGPT и Codex: пространство проекта",
    "Загрузка ZIP со сборкой",
    "Файлы соединяются с проектом",
    "Первое сообщение учебному агенту",
    "Контекст и диалог продолжаются вместе"
  ];
  const descriptions = [
    "Объёмный компьютер, стеклянные карточки ChatGPT и Codex и пространственное светящееся кольцо. Иллюстрация перехода к локальному проекту, не снимок аккаунта.",
    "Стеклянная папка и карточка ZIP над объёмным кольцом со стрелкой загрузки. Иллюстрация действия, не подтверждение скачивания.",
    "Слои AGENTS.md, ДАННЫЕ и tools соединены линиями с карточкой проекта. Иллюстрация структуры папки и её связи с проектом.",
    "Стеклянное окно диалога с сообщением «Начинай работать» и абстрактным светящимся ядром. Иллюстрация отправной точки разговора.",
    "Папка контекста связана с окном диалога; подпись «Дальше — в ChatGPT». Иллюстрация продолжения работы, не подтверждение установки."
  ];
  const url = (id, name) => `url(#${id}-${name})`;

  function definitions(id) {
    return `<defs>
      <linearGradient id="${id}-glass" x1="0" y1="0" x2=".95" y2="1">
        <stop stop-color="#ffffff" stop-opacity=".96"/><stop offset=".48" stop-color="#edf4ff" stop-opacity=".84"/><stop offset="1" stop-color="#b9cde8" stop-opacity=".69"/>
      </linearGradient>
      <linearGradient id="${id}-ice" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#ffffff" stop-opacity=".96"/><stop offset=".48" stop-color="#eaf3ff" stop-opacity=".75"/><stop offset="1" stop-color="#adc4e9" stop-opacity=".86"/>
      </linearGradient>
      <linearGradient id="${id}-edge" x1="0" y1="0" x2=".3" y2="1">
        <stop stop-color="#ffffff"/><stop offset=".45" stop-color="#d5e0f0"/><stop offset="1" stop-color="#9fb6d6"/>
      </linearGradient>
      <linearGradient id="${id}-navy" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#344f7d"/><stop offset=".5" stop-color="#203b66"/><stop offset="1" stop-color="#142342"/>
      </linearGradient>
      <linearGradient id="${id}-blue" x1="0" y1="0" x2=".75" y2="1">
        <stop stop-color="#b0c9ff"/><stop offset=".34" style="stop-color:var(--accent,#4160ff)"/><stop offset="1" stop-color="#253aa4"/>
      </linearGradient>
      <linearGradient id="${id}-mint" x1="0" y1="0" x2=".8" y2="1">
        <stop stop-color="#e0fff8"/><stop offset=".4" style="stop-color:var(--mint,#69e0ce)"/><stop offset="1" stop-color="#26aeb7"/>
      </linearGradient>
      <linearGradient id="${id}-rim" x1=".1" y1=".1" x2=".9" y2=".9">
        <stop stop-color="#f7fcff"/><stop offset=".28" stop-color="#b8d3ff"/><stop offset=".62" stop-color="#536eae"/><stop offset="1" stop-color="#192d57"/>
      </linearGradient>
      <linearGradient id="${id}-sheen" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#ffffff" stop-opacity=".68"/><stop offset=".45" stop-color="#ffffff" stop-opacity=".14"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="${id}-ground"><stop stop-color="#18294e" stop-opacity=".25"/><stop offset=".48" stop-color="#29497f" stop-opacity=".12"/><stop offset="1" stop-color="#29497f" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}-contact"><stop stop-color="#152a50" stop-opacity=".32"/><stop offset="1" stop-color="#152a50" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}-aura"><stop style="stop-color:var(--mint,#69e0ce)" stop-opacity=".28"/><stop offset=".48" stop-color="#8aaaff" stop-opacity=".13"/><stop offset="1" stop-color="#8aaaff" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}-center" cx=".35" cy=".2"><stop stop-color="#ffffff" stop-opacity=".9"/><stop offset=".65" stop-color="#d3e6fb" stop-opacity=".5"/><stop offset="1" stop-color="#90b3db" stop-opacity=".14"/></radialGradient>
      <filter id="${id}-lift" x="-18%" y="-18%" width="138%" height="148%" color-interpolation-filters="sRGB"><feDropShadow dx="0" dy="9" stdDeviation="7" flood-color="#203b67" flood-opacity=".14"/></filter>
      <filter id="${id}-small" x="-18%" y="-25%" width="138%" height="155%" color-interpolation-filters="sRGB"><feDropShadow dx="0" dy="5" stdDeviation="3" flood-color="#1b3157" flood-opacity=".15"/></filter>
    </defs>`;
  }

  function ground(id, cx=244, cy=323, rx=202) {
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="34" fill="${url(id,"ground")}"/><ellipse cx="${cx+8}" cy="${cy-3}" rx="${rx*.62}" ry="13" fill="${url(id,"contact")}" opacity=".5"/><ellipse cx="260" cy="185" rx="205" ry="165" fill="${url(id,"aura")}"/>`;
  }

  function core(id, x, y, scale=1) {
    return `<g transform="translate(${x} ${y}) scale(${scale})"><g class="iv-core-drift">
      <ellipse cx="0" cy="40" rx="91" ry="29" fill="${url(id,"ground")}"/>
      <ellipse cx="0" cy="12" rx="76" ry="48" fill="none" stroke="#203866" stroke-width="18" opacity=".9"/>
      <ellipse cx="0" cy="4" rx="76" ry="48" fill="none" stroke="${url(id,"rim")}" stroke-width="20"/>
      <ellipse cx="0" cy="-2" rx="76" ry="48" fill="none" stroke="${url(id,"blue")}" stroke-width="16"/>
      <path d="M-70 16A76 48 0 0 1-24-47" fill="none" stroke="${url(id,"mint")}" stroke-width="17"/>
      <path d="M27-47A76 48 0 0 1 74-11" fill="none" stroke="#a9e9fb" stroke-width="16"/>
      <ellipse cx="0" cy="-4" rx="76" ry="48" fill="none" stroke="#ffffff" stroke-opacity=".6" stroke-width="1.1"/>
      <ellipse cx="0" cy="0" rx="58" ry="34" fill="${url(id,"center")}"/>
      <ellipse cx="0" cy="3" rx="58" ry="34" fill="none" stroke="#3d5c9a" stroke-opacity=".37" stroke-width="1.5"/>
      <path d="M-48-20A58 34 0 0 1 26-31" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2"/>
      <ellipse class="iv-glint" cx="0" cy="-12" rx="29" ry="14" fill="#fff" fill-opacity=".28"/>
      <ellipse cx="0" cy="-4" rx="97" ry="62" fill="none" stroke="#6689bf" stroke-opacity=".32" stroke-width=".9"/>
      <circle cx="-95" cy="-16" r="3.6" fill="#b9fff2"/><circle cx="88" cy="20" r="3" fill="#91adff"/>
    </g></g>`;
  }

  function folder(id, x, y, scale=1, label="Контекст") {
    return `<g transform="translate(${x} ${y}) scale(${scale})">
      <path d="M8 38V17Q8 7 19 7H73L93 25H180Q191 25 191 37V126Q191 139 178 139H21Q8 139 8 126Z" fill="${url(id,"edge")}" stroke="#c8d8eb"/>
      <path d="M3 32V12Q3 2 15 2H69L89 20H175Q187 20 187 33V119Q187 133 173 133H17Q3 133 3 119Z" fill="${url(id,"glass")}" stroke="#fff" stroke-opacity=".9"/>
      <path d="M16 32H173V112H16Z" fill="#f3f9ff" fill-opacity=".5"/>
      <path d="M20 44H176Q191 44 188 59L177 125Q176 138 163 138H18Q5 138 7 124L13 55Q13 44 20 44Z" fill="${url(id,"ice")}" stroke="#fff" stroke-opacity=".9"/>
      <path d="M15 54H178" stroke="#fff" stroke-opacity=".8"/><path d="M22 129H162" stroke="#96b5dc" stroke-opacity=".5"/>
      <path d="M24 56H101L57 130H15Z" fill="${url(id,"sheen")}" opacity=".46"/>
      <rect x="26" y="78" width="25" height="30" rx="6" fill="${url(id,"blue")}"/>
      <path d="M33 86H44M33 92H44M33 98H41" stroke="#fff" stroke-opacity=".82" stroke-width="1.5" stroke-linecap="round"/>
      <text x="62" y="99" class="iv-label" font-size="19">${label}</text>
    </g>`;
  }

  function computer(id) {
    return `${ground(id)}<g class="iv-float-main">
      <g filter="${url(id,"lift")}">
        <path d="M83 63H325Q343 63 343 82V247Q343 262 327 262H88Q70 262 70 246V82Q70 63 83 63Z" fill="${url(id,"edge")}"/>
        <rect x="63" y="54" width="274" height="202" rx="21" fill="${url(id,"glass")}" stroke="#fff" stroke-opacity=".95"/>
        <rect x="74" y="65" width="252" height="167" rx="13" fill="${url(id,"navy")}" stroke="#6c88b3" stroke-opacity=".4"/>
        <path d="M88 66H271L136 231H88Q75 231 75 217V80Q75 66 88 66Z" fill="${url(id,"sheen")}" opacity=".25"/>
        <path d="M176 257H226L232 292H169Z" fill="${url(id,"edge")}"/><path d="M159 292H241L254 304Q255 308 249 309H151Q145 308 148 304Z" fill="${url(id,"glass")}" stroke="#fff"/>
        <path d="M150 309H250L247 314H153Z" fill="#9eb4d1" opacity=".7"/>
        <circle cx="200" cy="244" r="3" fill="#fff" fill-opacity=".8"/>
      </g>
      <g transform="rotate(-7 162 122)" filter="${url(id,"small")}"><rect x="94" y="94" width="157" height="57" rx="13" fill="${url(id,"glass")}" stroke="#fff"/><rect x="107" y="107" width="29" height="29" rx="10" fill="#edf8ff" stroke="#ceddf1"/><path d="M114 116H129M114 122H126M114 128H121" stroke="#6e91b0" stroke-width="2" stroke-linecap="round"/><text x="145" y="129" font-size="20" class="iv-label">ChatGPT</text><path d="M100 99H239" stroke="#fff" stroke-opacity=".7"/></g>
      <path d="M177 157C177 170 189 170 198 177" fill="none" stroke="#8fbee8" stroke-width="2"/><path d="M192 175L200 178L197 170" fill="none" stroke="#b9f4ee" stroke-width="2" stroke-linecap="round"/>
      <g transform="rotate(5 250 195)" filter="${url(id,"small")}"><rect x="176" y="169" width="150" height="58" rx="13" fill="${url(id,"blue")}" stroke="#bcd4ff"/><rect x="188" y="183" width="30" height="29" rx="9" fill="#f0f5ff" fill-opacity=".16" stroke="#d7e5ff" stroke-opacity=".25"/><path d="M196 191L202 197L196 203M205 203H212" fill="none" stroke="#e0fff8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><text x="229" y="205" font-size="22" fill="#fff" font-weight="600">Codex</text><path d="M185 175H307" stroke="#fff" stroke-opacity=".4"/></g>
    </g>${core(id,352,270,.87)}<g class="iv-drift-soft"><path d="M367 87L378 94L367 101L356 94Z" fill="${url(id,"mint")}" stroke="#fff"/><circle cx="402" cy="142" r="5" fill="#f8fdff" stroke="#cadcf2"/><path d="M70 285L76 288L70 292L64 288Z" fill="#c5d6ef"/></g>`;
  }

  function download(id) {
    return `${ground(id,248,324,204)}<g class="iv-float-main">
      <g filter="${url(id,"lift")}">${folder(id,94,107,1.4,"Сборка")}</g>
      <g transform="rotate(-11 178 126)" filter="${url(id,"small")}">
        <path d="M129 57H205L227 80V165Q227 174 217 174H132Q122 174 122 164V67Q122 57 129 57Z" fill="${url(id,"glass")}" stroke="#fff"/>
        <path d="M205 58V78Q205 82 210 82H225" fill="#c0d4ef" stroke="#fff"/>
        <path d="M168 59V103M163 64H172M163 74H172M163 84H172M163 94H172" stroke="#9fb4d2" stroke-width="2"/>
        <rect x="140" y="111" width="68" height="39" rx="11" fill="${url(id,"blue")}"/><text x="174" y="137" text-anchor="middle" font-size="21" font-weight="650" fill="#fff">ZIP</text>
      </g>
    </g>${core(id,321,279,.95)}
      <g class="iv-download-drift" filter="${url(id,"small")}"><path d="M300 117H327V193H345L313 228L281 193H300Z" fill="#2e4eb5"/><path d="M295 111H322V187H340L308 222L276 187H295Z" fill="${url(id,"mint")}" stroke="#d9fff6" stroke-width="1.1"/><path d="M301 118V184" stroke="#fff" stroke-width="2" stroke-opacity=".6" stroke-linecap="round"/></g>
      <path d="M361 109C391 125 401 148 396 173" fill="none" stroke="#b9cfe9" stroke-width="1.2" stroke-dasharray="3 7"/><circle cx="397" cy="177" r="4" fill="#b1f7e7"/>
      <path d="M71 231L80 236L71 241L62 236Z" fill="${url(id,"mint")}" stroke="#fff"/>`;
  }

  function fileSlab(id,x,y,label,accent,angle) {
    return `<g transform="translate(${x} ${y}) rotate(${angle})"><g filter="${url(id,"small")}"><path d="M0 11L184 0L203 13V57L17 69L0 57Z" fill="${url(id,"edge")}"/><path d="M0 5L184-6L203 7L17 21Z" fill="#f9fcff" fill-opacity=".95" stroke="#fff"/><path d="M17 21L203 7V51L17 65Z" fill="${url(id,"ice")}" stroke="#f7fcff"/><path d="M0 5L17 21V65L0 51Z" fill="#c8d8ed"/><rect x="30" y="31" width="21" height="22" rx="6" fill="${url(id,accent)}"/><path d="M36 37H45M36 42H45M36 47H42" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/><text x="61" y="47" font-size="18" class="iv-label">${label}</text><path d="M23 25L193 12" stroke="#fff" stroke-opacity=".8"/></g></g>`;
  }

  function project(id) {
    return `${ground(id,246,323,202)}
      <g opacity=".82" stroke="#8aa9d7" stroke-width="1.4" fill="none"><path d="M215 115C279 115 252 185 327 185"/><path d="M226 176C283 176 276 191 327 191"/><path d="M238 241C294 241 277 199 327 199"/></g>
      <g class="iv-glint"><circle cx="268" cy="143" r="4.4" fill="#91e6d5" stroke="#ecfffa"/><circle cx="282" cy="189" r="4.4" fill="#8aa7ff" stroke="#fff"/><circle cx="279" cy="226" r="4.4" fill="#91e6d5" stroke="#ecfffa"/></g>
      <g class="iv-float-main">${fileSlab(id,57,75,"AGENTS.md","blue",-7)}${fileSlab(id,68,143,"ДАННЫЕ","mint",-7)}${fileSlab(id,80,212,"tools","blue",-7)}</g>
      <g transform="translate(307 106) rotate(8 52 84)"><g class="iv-drift-soft" filter="${url(id,"lift")}">
        <path d="M7 7H99Q110 7 110 20V174Q110 185 99 185H7Q-4 185-4 174V20Q-4 7 7 7Z" fill="#b5c9e3"/>
        <rect x="-10" y="0" width="114" height="180" rx="17" fill="${url(id,"glass")}" stroke="#fff"/>
        <rect x="3" y="14" width="88" height="108" rx="12" fill="${url(id,"navy")}"/>
        <path d="M18 82L41 49L74 74L47 99Z" fill="none" stroke="#7bdacc" stroke-width="1.8"/>
        <path d="M18 82L74 74M41 49L47 99" stroke="#9bb4ff" stroke-width="1.2"/>
        <circle cx="18" cy="82" r="5" fill="#8fe9d5"/><circle cx="41" cy="49" r="6" fill="#c4d8ff"/><circle cx="74" cy="74" r="5" fill="#8aa3ff"/><circle cx="47" cy="99" r="4.5" fill="#e6fff9"/>
        <text x="47" y="150" text-anchor="middle" font-size="18" class="iv-label">Проект</text><path d="M17 163H77" stroke="#b3c8e4" stroke-width="2" stroke-linecap="round"/>
      </g></g><ellipse cx="369" cy="306" rx="54" ry="12" fill="${url(id,"ground")}"/>
      <path d="M76 47L83 51L76 56L69 51Z" fill="#b2edec"/><circle cx="421" cy="95" r="4" fill="#fff" stroke="#c2d6ee"/>`;
  }

  function chat(id) {
    return `${ground(id,247,326,209)}<g class="iv-float-main" filter="${url(id,"lift")}">
      <path d="M117 73H405Q420 73 420 88V253Q420 270 403 270H117Q101 270 101 254V89Q101 73 117 73Z" fill="${url(id,"edge")}"/>
      <rect x="93" y="64" width="320" height="199" rx="22" fill="${url(id,"glass")}" stroke="#fff" stroke-width="1.1"/>
      <path d="M94 106H412" stroke="#b7cde9" stroke-opacity=".7"/><path d="M113 68H390" stroke="#fff" stroke-opacity=".75"/>
      <circle cx="115" cy="86" r="4" fill="#c4d4ec"/><circle cx="129" cy="86" r="4" fill="#b6cadf"/><circle cx="143" cy="86" r="4" fill="#c3e8e6"/>
      <text x="389" y="91" text-anchor="end" class="iv-label iv-fine" font-size="13">Диалог</text>
      <path d="M140 130H374Q387 130 387 143V183Q387 197 374 197H162L145 211V197H140Q126 197 126 183V144Q126 130 140 130Z" fill="${url(id,"blue")}" stroke="#afc9ff"/>
      <path d="M143 135H369" stroke="#fff" stroke-opacity=".4"/>
      <text x="257" y="171" text-anchor="middle" font-size="22" font-weight="600" fill="#fff">Начинай работать</text>
      <rect x="144" y="224" width="228" height="19" rx="9.5" fill="#eff5ff" fill-opacity=".76" stroke="#b4cbea"/>
      <path d="M158 234H280" stroke="#b1c5df" stroke-width="2" stroke-linecap="round"/>
      <path d="M354 229L360 234L354 239" fill="none" stroke="#4160ff" stroke-width="1.7" stroke-linecap="round"/>
    </g>${core(id,129,281,.9)}
      <g class="iv-drift-soft"><path d="M64 142L76 149L64 157L52 149Z" fill="${url(id,"mint")}" stroke="#fff"/><circle cx="383" cy="304" r="6" fill="#f4fbff" stroke="#c3d8ed"/><path d="M375 40L381 44L375 48L369 44Z" fill="#bfd2f3"/></g>`;
  }

  function continueChat(id) {
    return `${ground(id,244,316,210)}
      <g class="iv-float-main" filter="${url(id,"lift")}">${folder(id,45,122,1.08,"Контекст")}</g>
      <path d="M221 199C245 217 261 212 283 190" fill="none" stroke="#bfd0eb" stroke-width="18" stroke-linecap="round"/>
      <path d="M221 193C245 211 261 206 283 184" fill="none" stroke="${url(id,"mint")}" stroke-width="13" stroke-linecap="round"/>
      <path d="M225 189C246 204 261 199 278 184" fill="none" stroke="#effff9" stroke-opacity=".7" stroke-width="1.7" stroke-linecap="round"/>
      <g transform="rotate(7 342 155)"><g class="iv-drift-soft" filter="${url(id,"lift")}">
        <path d="M275 88H411Q427 88 427 104V217Q427 234 411 234H286L268 250V104Q268 88 275 88Z" fill="#acbfdc"/>
        <path d="M269 81H405Q421 81 421 97V210Q421 227 405 227H280L262 243V97Q262 81 269 81Z" fill="${url(id,"glass")}" stroke="#fff"/>
        <text x="284" y="117" font-size="20" class="iv-label">Диалог</text>
        <path d="M279 129H405" stroke="#bed0e8"/>
        <rect x="282" y="147" width="116" height="26" rx="10" fill="${url(id,"blue")}"/>
        <path d="M295 160H379" stroke="#e9f2ff" stroke-width="2" stroke-linecap="round"/>
        <rect x="282" y="185" width="83" height="18" rx="8" fill="${url(id,"mint")}" fill-opacity=".76"/>
        <path d="M290 194H350" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-linecap="round"/>
      </g></g>
      <g filter="${url(id,"small")}"><rect x="91" y="293" width="302" height="49" rx="16" fill="${url(id,"glass")}" stroke="#fff"/><text x="242" y="324" text-anchor="middle" font-size="21" font-weight="600" class="iv-label">Дальше — в ChatGPT</text></g>
      <g class="iv-glint"><circle cx="232" cy="184" r="4.5" fill="#e1fff6" stroke="#b3e4e1"/><circle cx="265" cy="187" r="3.3" fill="#f2f8ff" stroke="#afc5eb"/></g>
      <path d="M221 72L232 79L221 86L210 79Z" fill="${url(id,"mint")}" stroke="#fff"/><ellipse cx="368" cy="53" rx="22" ry="12" fill="none" stroke="#c0d3ed" stroke-width="1.3"/>`;
  }

  const scenes=[computer,download,project,chat,continueChat];
  function render(index) {
    const step=Number.isInteger(index)&&index>=0&&index<scenes.length?index:0;
    const id=`iv${step}`;
    return `<div class="iv-scene iv-scene--${step}"><svg class="iv-art" viewBox="0 0 480 380" width="480" height="380" role="img" aria-labelledby="${id}-title ${id}-desc" focusable="false"><title id="${id}-title">${titles[step]}</title><desc id="${id}-desc">${descriptions[step]}</desc>${definitions(id)}${scenes[step](id)}</svg></div>`;
  }
  return {render};
})();
if(typeof module!=="undefined"&&module.exports)module.exports=InstallVisuals;
