/**
 * Приёмник заявок с сайта → Telegram.
 * Cloudflare Worker. Токен бота и chat_id лежат в секретах Cloudflare,
 * в коде сайта их нет и быть не должно.
 *
 * Секреты (ставятся командой wrangler secret put):
 *   BOT_TOKEN — токен бота от @BotFather
 *   CHAT_ID   — куда слать заявку (личный id Евгения или id группы)
 */

const SITES = {
  'https://faktlab.ru':        'упаковка активов',
  'https://www.faktlab.ru':    'упаковка активов',
  'https://visitblg.ru':       'Амур Атлас · гид по Благовещенску',
  'https://www.visitblg.ru':   'Амур Атлас · гид по Благовещенску',
  'http://localhost:8143':     'локальная проверка (faktlab)',
  'http://127.0.0.1:8143':     'локальная проверка (faktlab)',
  'http://localhost:8765':     'локальная проверка (Амур Атлас)',
  'http://127.0.0.1:8765':     'локальная проверка (Амур Атлас)',
};

const ALLOWED = Object.keys(SITES);

const LIMITS = { name: 120, contact: 160, type: 80, msg: 2000 };

function corsHeaders(origin) {
  const allow = ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

const esc = (s) => String(s || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const clean = (s, max) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, max);

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    /* Диагностический режим (?probe=me / ?probe=updates) был нужен на настройке:
       api.telegram.org из России отвечает нестабильно, а из Worker'а доступен всегда.
       Настройка закончена 15.08.2026 — режим снят, чтобы наружу не торчал лишний вход. */

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: cors });
    }
    if (origin && !ALLOWED.includes(origin)) {
      return new Response(JSON.stringify({ ok: false, error: 'origin' }), {
        status: 403, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'json' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // ловушка для ботов: поле скрыто от людей, заполняется только автозаполнялкой спамера
    if (clean(data.company, 50)) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const name = clean(data.name, LIMITS.name);
    const contact = clean(data.contact, LIMITS.contact);
    const type = clean(data.type, LIMITS.type);
    const msg = clean(data.msg, LIMITS.msg);
    const page = clean(data.page, 200);

    if (!name || !contact) {
      return new Response(JSON.stringify({ ok: false, error: 'fields' }), {
        status: 422, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const when = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Yakutsk' });
    const text = [
      `<b>Заявка с сайта</b> — ${SITES[origin] || 'сайт'}`,
      '',
      `<b>Имя:</b> ${esc(name)}`,
      `<b>Связь:</b> ${esc(contact)}`,
      `<b>С чем приходит:</b> ${esc(type) || '—'}`,
      msg ? `\n${esc(msg)}` : '',
      '',
      `<i>${esc(when)} · ${esc(page) || 'сайт'}</i>`,
      `<i>Согласие на обработку данных: ${data.agree === true ? 'отмечено' : 'НЕ отмечено'}</i>`,
    ].filter(Boolean).join('\n');

    const tg = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!tg.ok) {
      const detail = await tg.text();
      console.log('telegram error', tg.status, detail);
      return new Response(JSON.stringify({ ok: false, error: 'telegram' }), {
        status: 502, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};
