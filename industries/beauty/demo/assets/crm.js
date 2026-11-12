/* ============================================================
   AUREL OS — CRM demo (beauty)
   Data is fictional and local. Status changes are not persisted.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var money = function (n) { return Math.round(n).toLocaleString('ru-RU') + ' ₴'; };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function parseISO(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  var DOW = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  var DOW_FULL = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  function fmtDate(s) {
    var d = parseISO(s);
    return DOW[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
  }
  function fmtShort(s) {
    var d = parseISO(s);
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1);
  }

  function seed(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967295;
  }

  /* ---------------- data ---------------- */
  var MASTERS = [
    { id: 'anna', name: 'Анна Коваль', role: 'стилист · колорист' },
    { id: 'olga', name: 'Ольга Мельник', role: 'колорист' },
    { id: 'irina', name: 'Ирина Савчук', role: 'стилист' },
    { id: 'daria', name: 'Дарья Литвин', role: 'ногтевой сервис' }
  ];

  var SERVICES = [
    { id: 'h1', cat: 'Стрижка', name: 'Женская стрижка', price: 1400, min: 90, on: true },
    { id: 'h2', cat: 'Стрижка', name: 'Мужская стрижка', price: 900, min: 60, on: true },
    { id: 'h3', cat: 'Стрижка', name: 'Укладка', price: 900, min: 45, on: true },
    { id: 'c1', cat: 'Окрашивание', name: 'Тон в тон', price: 3200, min: 120, on: true },
    { id: 'c2', cat: 'Окрашивание', name: 'Балаяж', price: 5200, min: 180, on: true },
    { id: 'c3', cat: 'Окрашивание', name: 'Сложный блонд', price: 6800, min: 240, on: true },
    { id: 'r1', cat: 'Уход', name: 'Ритуал восстановления', price: 1800, min: 75, on: true },
    { id: 'r2', cat: 'Уход', name: 'Кератиновое восстановление', price: 3200, min: 120, on: true },
    { id: 'n1', cat: 'Маникюр', name: 'Маникюр', price: 1100, min: 60, on: true },
    { id: 'n2', cat: 'Маникюр', name: 'Маникюр + покрытие', price: 1400, min: 75, on: true },
    { id: 'n3', cat: 'Маникюр', name: 'Педикюр', price: 1600, min: 90, on: true },
    { id: 'b1', cat: 'Брови', name: 'Архитектура бровей', price: 900, min: 45, on: true },
    { id: 'b2', cat: 'Брови', name: 'Ламинирование бровей', price: 1400, min: 60, on: false }
  ];

  var SOURCES = [
    { id: 'instagram', name: 'Instagram / Meta Ads', short: 'Instagram', spend: 18400, leads: 126, color: '#C08A5C' },
    { id: 'google', name: 'Google Ads', short: 'Google Ads', spend: 12200, leads: 74, color: '#E6D7C2' },
    { id: 'organic', name: 'Органический поиск', short: 'Органика', spend: 4200, leads: 58, color: '#8FBF9A' },
    { id: 'retarget', name: 'Ретаргетинг', short: 'Ретаргетинг', spend: 6100, leads: 39, color: '#9DB4C8' }
  ];

  var CLIENTS = [
    { id: 1, name: 'Екатерина Мороз', phone: '+380 67 ••• 41 20', src: 'instagram', visits: 14, lastOff: -12, nextOff: 3, spend: 18400, tag: 'vip', note: 'Тонкие волосы, холодный блонд. Чувствительная кожа головы, без сильных ароматов.', svc: ['Тон в тон', 'Ритуал восстановления'] },
    { id: 2, name: 'Дарья Шевченко', phone: '+380 93 ••• 08 74', src: 'google', visits: 6, lastOff: -34, nextOff: 9, spend: 9600, tag: 'regular', note: 'Средняя длина, тёплый оттенок. Любит укладку без стайлинга.', svc: ['Женская стрижка', 'Укладка'] },
    { id: 3, name: 'Ирина Литвин', phone: '+380 50 ••• 77 15', src: 'organic', visits: 22, lastOff: -8, nextOff: 5, spend: 27600, tag: 'vip', note: 'Постоянная клиентка с 2019 года. Короткая форма, стрижка каждые 5 недель.', svc: ['Женская стрижка', 'Тон в тон'] },
    { id: 4, name: 'Наталья Кравченко', phone: '+380 63 ••• 22 90', src: 'retarget', visits: 2, lastOff: -3, nextOff: 0, spend: 2800, tag: 'new', note: 'Первый визит по ретаргетингу. Интересуется балаяжем, боится осветления.', svc: ['Балаяж'] },
    { id: 5, name: 'Анна Сидоренко', phone: '+380 67 ••• 15 33', src: 'instagram', visits: 9, lastOff: -21, nextOff: 12, spend: 12900, tag: 'regular', note: 'Кудри, сухой диффузор. Просит не трогать длину.', svc: ['Женская стрижка', 'Ритуал восстановления'] },
    { id: 6, name: 'Марина Гнатюк', phone: '+380 95 ••• 60 18', src: 'organic', visits: 17, lastOff: -63, nextOff: -1, spend: 21300, tag: 'vip', note: 'Не была 2 месяца: переезд. Готова вернуться, нужен звонок администратора.', svc: ['Сложный блонд', 'Уход'] },
    { id: 7, name: 'Оксана Петренко', phone: '+380 68 ••• 44 07', src: 'google', visits: 1, lastOff: -2, nextOff: 1, spend: 1400, tag: 'new', note: 'Новая заявка с Google. Маникюр + покрытие, вечерние окна.', svc: ['Маникюр + покрытие'] },
    { id: 8, name: 'Юлия Романюк', phone: '+380 44 ••• 91 62', src: 'retarget', visits: 4, lastOff: -95, nextOff: -10, spend: 6100, tag: 'regular', note: 'Давно не была. Раньше ходила на педикюр раз в 6 недель.', svc: ['Педикюр'] },
    { id: 9, name: 'София Мельник', phone: '+380 73 ••• 30 55', src: 'instagram', visits: 11, lastOff: -15, nextOff: 6, spend: 16800, tag: 'regular', note: 'Брови и ресницы. Записывается в субботу утром.', svc: ['Архитектура бровей', 'Ламинирование бровей'] },
    { id: 10, name: 'Виктория Захарчук', phone: '+380 99 ••• 12 48', src: 'organic', visits: 3, lastOff: -7, nextOff: 2, spend: 4200, tag: 'new', note: 'Пришла из органики по запросу «стрижка Печерск».', svc: ['Женская стрижка'] }
  ];

  function clientById(id) {
    for (var i = 0; i < CLIENTS.length; i++) if (CLIENTS[i].id === id) return CLIENTS[i];
    return CLIENTS[0];
  }
  function sourceById(id) {
    for (var i = 0; i < SOURCES.length; i++) if (SOURCES[i].id === id) return SOURCES[i];
    return SOURCES[0];
  }
  function masterById(id) {
    for (var i = 0; i < MASTERS.length; i++) if (MASTERS[i].id === id) return MASTERS[i];
    return MASTERS[0];
  }

  var STATUS = {
    new: { label: 'Новая', pill: 'new' },
    ok: { label: 'Подтверждена', pill: 'ok' },
    done: { label: 'Пришла', pill: 'ok' },
    off: { label: 'Не пришла', pill: 'off' }
  };
  var STATUS_ORDER = ['new', 'ok', 'done', 'off'];

  var TIMES = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00'];
  var APPTS = [];

  (function buildAppointments() {
    for (var d = 0; d < 7; d++) {
      var day = addDays(today, d);
      var key = iso(day);
      MASTERS.forEach(function (m, mi) {
        TIMES.forEach(function (t, ti) {
          var s = seed(key + '|' + m.id + '|' + t);
          if (s < 0.4) return;
          var c = CLIENTS[Math.floor(seed(m.id + t + key + 'c') * CLIENTS.length)];
          var svc = SERVICES[Math.floor(seed(m.id + t + key + 's') * SERVICES.length)];
          var st = s > 0.84 ? 'new' : s > 0.66 ? 'ok' : s > 0.53 ? 'done' : 'off';
          APPTS.push({
            id: 'a-' + d + '-' + mi + '-' + ti,
            date: key,
            time: t,
            clientId: c.id,
            masterId: m.id,
            service: svc.name,
            price: svc.price,
            status: st
          });
        });
      });
    }
  })();

  var state = { view: 'dash', dayOffset: 0, filter: 'all', q: '', sel: null };

  function todayAppts() { return APPTS.filter(function (a) { return a.date === iso(today); }); }
  function weekAppts() { return APPTS; }
  function apptById(id) {
    for (var i = 0; i < APPTS.length; i++) if (APPTS[i].id === id) return APPTS[i];
    return null;
  }
  function countByStatus(st) { return APPTS.filter(function (a) { return a.status === st; }).length; }
  function confirmedRevenue() {
    return APPTS.reduce(function (sum, a) {
      return sum + (a.status === 'ok' || a.status === 'done' ? a.price : 0);
    }, 0);
  }

  var VIEW_META = {
    dash: { t: 'Обзор', s: 'Сводка по салону · демо-данные' },
    calendar: { t: 'Записи и календарь', s: 'Расписание мастеров · демо-данные' },
    clients: { t: 'Клиенты', s: 'База салона · последние 10 карточек' },
    repeat: { t: 'Повторные визиты', s: 'Возвраты и риск оттока · демо' },
    sources: { t: 'Источники привлечения', s: 'Каналы и стоимость записи · демо' },
    analytics: { t: 'Аналитика маркетинга', s: 'Воронка, выручка и кампании · демо' },
    services: { t: 'Услуги и прайс', s: 'Демонстрационный прайс салона' }
  };

  /* ---------------- charts ---------------- */
  function donutSVG() {
    var counts = SOURCES.map(function (s) {
      return APPTS.filter(function (a) { return clientById(a.clientId).src === s.id; }).length;
    });
    var total = counts.reduce(function (a, b) { return a + b; }, 0) || 1;
    var segs = '';
    var offset = 0;
    counts.forEach(function (n, i) {
      var part = n / total * 100;
      segs += '<circle cx="21" cy="21" r="15.9" fill="none" stroke="' + SOURCES[i].color + '" stroke-width="4" ' +
        'stroke-dasharray="' + part.toFixed(2) + ' ' + (100 - part).toFixed(2) + '" ' +
        'stroke-dashoffset="' + (-offset).toFixed(2) + '"></circle>';
      offset += part;
    });
    return '<svg viewBox="0 0 42 42" role="img" aria-label="Распределение записей по источникам">' +
      '<circle cx="21" cy="21" r="15.9" fill="none" stroke="rgba(242,236,227,.08)" stroke-width="4"></circle>' +
      '<g transform="rotate(-90 21 21)">' + segs + '</g></svg>';
  }

  function donutLegend() {
    return SOURCES.map(function (s) {
      var n = APPTS.filter(function (a) { return clientById(a.clientId).src === s.id; }).length;
      return '<div><i style="background:' + s.color + '"></i>' + s.short + '<b>' + n + '</b></div>';
    }).join('');
  }

  function barsChart() {
    var days = [];
    for (var i = 0; i < 7; i++) {
      var d = addDays(today, i);
      var n = APPTS.filter(function (a) { return a.date === iso(d); }).length;
      days.push({ d: d, n: n });
    }
    var max = Math.max.apply(null, days.map(function (x) { return x.n; })) || 1;
    return '<div class="bars">' + days.map(function (x) {
      var h = Math.max(4, Math.round(x.n / max * 100));
      return '<div class="bar" title="' + fmtDate(iso(x.d)) + ': ' + x.n + ' записей">' +
        '<i style="height:' + h + '%"></i><b>' + DOW[x.d.getDay()] + '</b></div>';
    }).join('') + '</div>';
  }

  function revenueBars() {
    var days = [];
    for (var i = 0; i < 7; i++) {
      var d = addDays(today, i);
      var sum = APPTS.filter(function (a) { return a.date === iso(d) && (a.status === 'ok' || a.status === 'done'); })
        .reduce(function (s, a) { return s + a.price; }, 0);
      days.push({ d: d, n: sum });
    }
    var max = Math.max.apply(null, days.map(function (x) { return x.n; })) || 1;
    return '<div class="bars">' + days.map(function (x) {
      var h = Math.max(4, Math.round(x.n / max * 100));
      return '<div class="bar" title="' + fmtDate(iso(x.d)) + ': ' + money(x.n) + '">' +
        '<i style="height:' + h + '%"></i><b>' + DOW[x.d.getDay()] + '</b></div>';
    }).join('') + '</div>';
  }

  function funnel() {
    var rows = [
      { l: 'Визиты сайта', v: 4820 },
      { l: 'Заявки и звонки', v: 412 },
      { l: 'Записи в CRM', v: 236 },
      { l: 'Пришли в салон', v: 198 },
      { l: 'Повторные визиты', v: 149 }
    ];
    var top = rows[0].v;
    return '<div class="hbar">' + rows.map(function (r) {
      var w = Math.max(3, Math.round(r.v / top * 100));
      return '<div class="hbar-row"><span>' + r.l + '</span><u><i style="width:' + w + '%"></i></u><b>' + r.v.toLocaleString('ru-RU') + '</b></div>';
    }).join('') + '</div>';
  }

  /* ---------------- views ---------------- */
  function kpi(label, value, note, cls) {
    return '<div class="kpi"><span>' + label + '</span><b>' + value + '</b><em class="' + (cls || '') + '">' + note + '</em></div>';
  }

  function apptRow(a) {
    var c = clientById(a.clientId);
    var m = masterById(a.masterId);
    var st = STATUS[a.status];
    return '<button type="button" class="list-row" data-appt="' + a.id + '" style="width:100%;text-align:left;border-left:0;border-right:0;border-top:0;background:none">' +
      '<span><b>' + esc(c.name) + '</b><span>' + esc(a.service) + ' · ' + esc(m.name.split(' ')[0]) + '</span></span>' +
      '<span class="when"><span class="pill ' + st.pill + '">' + st.label + '</span><br>' + a.time + '</span>' +
      '</button>';
  }

  function viewDash() {
    var ta = todayAppts();
    var load = Math.round(ta.length / (MASTERS.length * TIMES.length) * 100);
    var h = '<div class="crm-kpis">' +
      kpi('Записей сегодня', ta.length, '+ 6 к прошлой среде', 'up') +
      kpi('Загрузка зала', load + '%', 'по 4 мастерам', '') +
      kpi('Новые заявки', countByStatus('new'), 'требуют подтверждения', 'down') +
      kpi('Повторные визиты', '68%', 'за последние 8 недель', 'up') +
      '</div>';

    h += '<div class="crm-grid">' +
      '<div class="card"><div class="card-head"><h2>Записи по дням</h2><span>7 дней</span></div>' +
      '<p class="card-sub">Все статусы, включая новые заявки.</p>' + barsChart() + '</div>' +
      '<div class="card"><div class="card-head"><h2>Источники записей</h2><span>Неделя</span></div>' +
      '<div class="donut">' + donutSVG() + '<div class="donut-legend">' + donutLegend() + '</div></div>' +
      '<p class="card-sub" style="margin:14px 0 0">Демонстрационное распределение по каналам.</p></div>' +
      '</div>';

    h += '<div class="crm-grid" style="margin-top:10px">' +
      '<div class="card"><div class="card-head"><h2>Сегодня в салоне</h2><span>' + fmtDate(iso(today)) + '</span></div>' +
      (ta.length ? '<div class="list">' + ta.slice(0, 6).map(apptRow).join('') + '</div>' : '<p class="crm-empty">На сегодня записей нет.</p>') +
      '</div>' +
      '<div class="card"><div class="card-head"><h2>Заявки в работе</h2><span>' + countByStatus('new') + '</span></div>' +
      (APPTS.filter(function (a) { return a.status === 'new'; }).length ?
        '<div class="list">' + APPTS.filter(function (a) { return a.status === 'new'; }).slice(0, 5).map(apptRow).join('') + '</div>' :
        '<p class="crm-empty">Новых заявок нет.</p>') +
      '<p class="card-sub" style="margin:14px 0 0">Откройте запись, чтобы изменить статус.</p></div>' +
      '</div>';

    return h;
  }

  function viewCalendar() {
    var d = addDays(today, state.dayOffset);
    var key = iso(d);
    var dayList = APPTS.filter(function (a) { return a.date === key; });
    var h = '<div class="crm-toolbar">' +
      '<button type="button" class="crm-btn" data-day="-1" aria-label="Предыдущий день">←</button>' +
      '<span class="crm-day">' + DOW_FULL[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + '</span>' +
      '<button type="button" class="crm-btn" data-day="1" aria-label="Следующий день">→</button>' +
      '<button type="button" class="crm-btn" data-day="0"' + (state.dayOffset === 0 ? ' disabled' : '') + '>Сегодня</button>' +
      '<span class="card-sub" style="margin:0 0 0 auto">' + dayList.length + ' записей · 4 мастера</span>' +
      '</div>';

    h += '<div class="cal-wrap"><div class="cal">';
    h += '<div class="ch">Время</div>';
    MASTERS.forEach(function (m) {
      h += '<div class="ch">' + esc(m.name.split(' ')[0]) + '<b>' + esc(m.role) + '</b></div>';
    });
    TIMES.forEach(function (t) {
      h += '<div class="time">' + t + '</div>';
      MASTERS.forEach(function (m) {
        var ev = null;
        for (var i = 0; i < dayList.length; i++) {
          if (dayList[i].masterId === m.id && dayList[i].time === t) { ev = dayList[i]; break; }
        }
        h += '<div class="cell">';
        if (ev) {
          var c = clientById(ev.clientId);
          h += '<button type="button" class="ev ' + STATUS[ev.status].pill + '" data-appt="' + ev.id + '">' +
            esc(c.name.split(' ')[0]) + ' · ' + esc(ev.service.split(' ')[0]) +
            '<span>' + money(ev.price) + '</span></button>';
        }
        h += '</div>';
      });
    });
    h += '</div></div>';
    h += '<p class="card-sub" style="margin-top:12px">Клик по записи открывает карточку: можно изменить статус.</p>';
    return h;
  }

  function viewClients() {
    var q = state.q.trim().toLowerCase();
    var list = CLIENTS.filter(function (c) {
      if (state.filter !== 'all' && c.tag !== state.filter) return false;
      if (!q) return true;
      return (c.name + ' ' + c.phone).toLowerCase().indexOf(q) !== -1;
    });

    var h = '<div class="crm-toolbar">' +
      '<span class="seg" role="group" aria-label="Фильтр клиентов">' +
      [['all', 'Все'], ['new', 'Новые'], ['regular', 'Постоянные'], ['vip', 'VIP']].map(function (f) {
        return '<button type="button" data-seg="' + f[0] + '" class="' + (state.filter === f[0] ? 'on' : '') + '">' + f[1] + '</button>';
      }).join('') + '</span>' +
      '<span class="card-sub" style="margin:0 0 0 auto">' + list.length + ' из ' + CLIENTS.length + ' карточек</span>' +
      '</div>';

    if (!list.length) {
      h += '<div class="card"><p class="crm-empty">Ничего не найдено. Измените фильтр или поисковый запрос.</p></div>';
      return h;
    }

    h += '<div class="card" style="padding:0"><div class="crm-scroll"><table class="crm-table">' +
      '<thead><tr><th>Клиент</th><th>Источник</th><th>Визитов</th><th>Последний</th><th>Следующий</th><th>Статус</th></tr></thead><tbody>' +
      list.map(function (c) {
        var s = sourceById(c.src);
        var tag = c.tag === 'vip' ? 'VIP' : c.tag === 'new' ? 'Новый' : 'Постоянный';
        var pill = c.tag === 'vip' ? 'ok' : c.tag === 'new' ? 'new' : 'work';
        return '<tr data-client="' + c.id + '">' +
          '<td><b>' + esc(c.name) + '</b><small>' + esc(c.phone) + '</small></td>' +
          '<td>' + esc(s.short) + '</td>' +
          '<td class="mono">' + c.visits + '</td>' +
          '<td>' + (c.lastOff === 0 ? 'сегодня' : fmtShort(iso(addDays(today, c.lastOff)))) + '</td>' +
          '<td>' + (c.nextOff >= 0 ? fmtShort(iso(addDays(today, c.nextOff))) : '<span style="color:rgba(242,236,227,.32)">—</span>') + '</td>' +
          '<td><span class="pill ' + pill + '">' + tag + '</span></td>' +
          '</tr>';
      }).join('') +
      '</tbody></table></div></div>';
    h += '<p class="card-sub" style="margin-top:12px">Показаны последние карточки демо-базы. Клик по строке открывает карточку.</p>';
    return h;
  }

  function viewRepeat() {
    var week = CLIENTS.filter(function (c) { return c.nextOff >= 0 && c.nextOff <= 7; });
    var risk = CLIENTS.filter(function (c) { return c.lastOff <= -60; });
    var h = '<div class="crm-kpis">' +
      kpi('Повторных на неделе', week.length, 'записи уже созданы', 'up') +
      kpi('Риск оттока', risk.length, 'нет визита 60+ дней', 'down') +
      kpi('Возврат после напоминания', '34%', 'демо-показатель', 'up') +
      kpi('Средний интервал', '38 дней', 'между визитами', '') +
      '</div>';

    h += '<div class="card" style="margin-top:10px"><div class="card-head"><h2>Записи на этой неделе</h2><span>' + week.length + '</span></div>' +
      '<div class="repeat-grid">' + week.map(function (c) {
        return '<div class="repeat-card"><b>' + esc(c.name) + '</b>' +
          '<span>' + esc(sourceById(c.src).short) + ' · ' + c.visits + ' визитов</span>' +
          '<span>' + fmtDate(iso(addDays(today, c.nextOff))) + '</span>' +
          '<div class="meta"><em>' + esc(c.svc[0]) + '</em>' +
          '<button type="button" class="crm-btn" data-client="' + c.id + '">Карточка</button></div></div>';
      }).join('') + '</div></div>';

    h += '<div class="crm-grid" style="margin-top:10px">' +
      '<div class="card"><div class="card-head"><h2>Кого вернуть</h2><span>60+ дней</span></div>' +
      '<div class="list">' + risk.map(function (c) {
        return '<div class="list-row"><span><b>' + esc(c.name) + '</b><span>Последний визит ' + fmtShort(iso(addDays(today, c.lastOff))) + ' · ' + esc(c.svc[0]) + '</span></span>' +
          '<button type="button" class="crm-btn" data-remind="' + c.id + '">Напомнить</button></div>';
      }).join('') + '</div></div>' +
      '<div class="card"><div class="card-head"><h2>Возвраты по когортам</h2><span>Демо</span></div>' +
      '<div class="hbar">' +
      [['Ноябрь', 71], ['Октябрь', 66], ['Сентябрь', 63], ['Август', 58], ['Июль', 54]].map(function (r) {
        return '<div class="hbar-row"><span>' + r[0] + '</span><u><i style="width:' + r[1] + '%"></i></u><b>' + r[1] + '%</b></div>';
      }).join('') + '</div>' +
      '<p class="card-sub" style="margin-top:14px">Доля клиентов, вернувшихся в течение 8 недель.</p></div>' +
      '</div>';
    return h;
  }

  function viewSources() {
    var h = '<div class="src-grid">' + SOURCES.map(function (s) {
      var bookings = APPTS.filter(function (a) { return clientById(a.clientId).src === s.id; }).length;
      var cpl = s.leads ? s.spend / s.leads : 0;
      var cac = bookings ? s.spend / bookings : 0;
      var share = Math.min(100, Math.round(bookings / APPTS.length * 100));
      return '<div class="src-card"><header><b>' + esc(s.name) + '</b><span>7 дней</span></header>' +
        '<div class="metric">' +
        '<div><b>' + money(s.spend) + '</b><span>расход</span></div>' +
        '<div><b>' + s.leads + '</b><span>лидов</span></div>' +
        '<div><b>' + bookings + '</b><span>записей</span></div>' +
        '</div>' +
        '<div class="meter"><i style="width:' + share + '%"></i></div>' +
        '<p class="card-sub" style="margin:10px 0 0">CPL ' + money(cpl) + ' · CAC ' + money(cac) + ' · ' + share + '% записей</p>' +
        '</div>';
    }).join('') + '</div>';

    h += '<div class="card" style="margin-top:10px"><div class="card-head"><h2>Кампании</h2><span>Демо-данные</span></div>' +
      '<div class="crm-scroll"><table class="crm-table"><thead><tr><th>Кампания</th><th>Канал</th><th>Расход</th><th>Лиды</th><th>Записи</th><th>Статус</th></tr></thead><tbody>' +
      [['Блонд · Печерск', 'instagram', 8400, 52, 14, 'ok'],
        ['Стрижка · поиск', 'google', 7200, 38, 9, 'ok'],
        ['Уход · ретаргет', 'retarget', 6100, 39, 7, 'ok'],
        ['Маникюр · сторис', 'instagram', 5200, 41, 8, 'wait'],
        ['SEO · услуги', 'organic', 4200, 58, 11, 'ok'],
        ['Бренд · Киев', 'google', 5000, 36, 4, 'off']].map(function (r) {
        var s = sourceById(r[1]);
        var pill = r[5] === 'ok' ? 'ok' : r[5] === 'wait' ? 'wait' : 'off';
        var label = r[5] === 'ok' ? 'Активна' : r[5] === 'wait' ? 'Пауза' : 'Завершена';
        return '<tr><td><b>' + esc(r[0]) + '</b><small>' + esc(s.short) + '</small></td>' +
          '<td>' + esc(s.short) + '</td><td class="mono">' + money(r[2]) + '</td>' +
          '<td class="mono">' + r[3] + '</td><td class="mono">' + r[4] + '</td>' +
          '<td><span class="pill ' + pill + '">' + label + '</span></td></tr>';
      }).join('') + '</tbody></table></div></div>';

    h += '<p class="card-sub" style="margin-top:12px">Все кампании и суммы вымышлены. В реальном проекте данные приходят из рекламных кабинетов и CRM.</p>';
    return h;
  }

  function viewAnalytics() {
    var revenue = confirmedRevenue();
    var avg = Math.round(revenue / Math.max(1, APPTS.filter(function (a) { return a.status === 'ok' || a.status === 'done'; }).length));
    var h = '<div class="crm-kpis">' +
      kpi('Выручка · 7 дней', money(revenue), 'по подтверждённым', 'up') +
      kpi('Средний чек', money(avg), 'демо-расчёт', '') +
      kpi('Записей · 7 дней', APPTS.length, 'все статусы', 'up') +
      kpi('CAC', money(40900 / Math.max(1, APPTS.length)), 'по 4 каналам', 'down') +
      '</div>';

    h += '<div class="crm-grid">' +
      '<div class="card"><div class="card-head"><h2>Выручка по дням</h2><span>подтверждено</span></div>' + revenueBars() + '</div>' +
      '<div class="card"><div class="card-head"><h2>Воронка</h2><span>7 дней</span></div>' + funnel() +
      '<p class="card-sub" style="margin:14px 0 0">Сайт → заявка → запись → визит → возврат.</p></div>' +
      '</div>';

    h += '<div class="crm-grid" style="margin-top:10px">' +
      '<div class="card"><div class="card-head"><h2>Выручка по источникам</h2><span>демо</span></div>' +
      '<div class="hbar">' + SOURCES.map(function (s) {
        var sum = APPTS.filter(function (a) {
          return clientById(a.clientId).src === s.id && (a.status === 'ok' || a.status === 'done');
        }).reduce(function (x, a) { return x + a.price; }, 0);
        var max = 30000;
        return '<div class="hbar-row"><span>' + esc(s.short) + '</span><u><i style="width:' + Math.min(100, Math.round(sum / max * 100)) + '%"></i></u><b>' + money(sum) + '</b></div>';
      }).join('') + '</div></div>' +
      '<div class="card"><div class="card-head"><h2>Источники записей</h2><span>неделя</span></div>' +
      '<div class="donut">' + donutSVG() + '<div class="donut-legend">' + donutLegend() + '</div></div></div>' +
      '</div>';
    return h;
  }

  function viewServices() {
    var cats = [];
    SERVICES.forEach(function (s) { if (cats.indexOf(s.cat) === -1) cats.push(s.cat); });
    var h = '<div class="card"><div class="card-head"><h2>Прайс салона</h2><span>' + SERVICES.length + ' услуг</span></div>' +
      '<div class="crm-scroll"><table class="crm-table"><thead><tr><th>Услуга</th><th>Категория</th><th>Длительность</th><th>Цена</th><th>Онлайн-запись</th></tr></thead><tbody>';
    cats.forEach(function (cat) {
      h += '<tr><td colspan="5" style="padding-top:16px;color:#C08A5C;font:400 9px/1 var(--sans);letter-spacing:.16em;text-transform:uppercase">' + esc(cat) + '</td></tr>';
      SERVICES.filter(function (s) { return s.cat === cat; }).forEach(function (s) {
        h += '<tr><td><b>' + esc(s.name) + '</b></td><td>' + esc(s.cat) + '</td>' +
          '<td class="mono">' + s.min + ' мин</td><td class="mono">' + money(s.price) + '</td>' +
          '<td><button type="button" class="crm-btn" data-svc="' + s.id + '" aria-pressed="' + s.on + '" style="' + (s.on ? '' : 'opacity:.5') + '">' + (s.on ? 'Активна' : 'Выключена') + '</button></td></tr>';
      });
    });
    h += '</tbody></table></div></div>';
    h += '<p class="card-sub" style="margin-top:12px">Переключатель показывает, как управляется доступность услуги в записи. Цены демонстрационные.</p>';
    return h;
  }

  /* ---------------- drawer ---------------- */
  function pill(st) { return '<span class="pill ' + STATUS[st].pill + '">' + STATUS[st].label + '</span>'; }

  function historyFor(c) {
    var rows = [];
    for (var i = 0; i < 4; i++) {
      var off = c.lastOff - i * 35 - Math.round(seed(c.name + i) * 8);
      var d = iso(addDays(today, off));
      rows.push({ date: d, service: c.svc[i % c.svc.length], price: 900 + Math.round(seed(c.name + i + 'p') * 34) * 100 });
    }
    return rows;
  }

  function drawerClient(c) {
    var s = sourceById(c.src);
    var tag = c.tag === 'vip' ? 'VIP-клиент' : c.tag === 'new' ? 'Новый клиент' : 'Постоянный клиент';
    var hist = historyFor(c);
    var h = '<div class="dr-fields">' +
      '<div><span>Телефон</span><b>' + esc(c.phone) + '</b></div>' +
      '<div><span>Источник</span><b>' + esc(s.short) + '</b></div>' +
      '<div><span>Визитов</span><b>' + c.visits + '</b></div>' +
      '<div><span>Средний чек</span><b>' + money(c.spend / Math.max(1, c.visits)) + '</b></div>' +
      '<div><span>Последний визит</span><b>' + (c.lastOff === 0 ? 'сегодня' : fmtDate(iso(addDays(today, c.lastOff)))) + '</b></div>' +
      '<div><span>Следующая запись</span><b>' + (c.nextOff >= 0 ? fmtDate(iso(addDays(today, c.nextOff))) : 'не назначена') + '</b></div>' +
      '</div>';
    h += '<div class="dr-h">Заметка мастера</div><p class="dr-note">' + esc(c.note) + '</p>';
    h += '<div class="dr-h">История визитов</div><div class="dr-visits">' + hist.map(function (r) {
      return '<div><span>' + fmtShort(r.date) + ' · ' + esc(r.service) + '</span><b>' + money(r.price) + '</b></div>';
    }).join('') + '</div>';
    h += '<div class="dr-h">Действия</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
      '<button type="button" class="crm-btn solid" data-remind="' + c.id + '">Напомнить о визите</button>' +
      '<button type="button" class="crm-btn" data-act="new-appt">Новая запись</button>' +
      '</div>';
    h += '<p class="card-sub" style="margin-top:12px">Карточка демонстрационная. Данные не отправляются и не сохраняются.</p>';
    return { title: c.name, sub: tag + ' · с ' + (2019 + (c.id % 4)) + ' года', body: h };
  }

  function drawerAppt(a) {
    var c = clientById(a.clientId);
    var m = masterById(a.masterId);
    var s = sourceById(c.src);
    var h = '<div class="dr-fields">' +
      '<div><span>Дата</span><b>' + fmtDate(a.date) + '</b></div>' +
      '<div><span>Время</span><b>' + a.time + '</b></div>' +
      '<div><span>Мастер</span><b>' + esc(m.name) + '</b></div>' +
      '<div><span>Услуга</span><b>' + esc(a.service) + '</b></div>' +
      '<div><span>Стоимость</span><b>' + money(a.price) + '</b></div>' +
      '<div><span>Источник</span><b>' + esc(s.short) + '</b></div>' +
      '</div>';
    h += '<div class="dr-h">Статус заявки</div><div class="dr-status">' +
      STATUS_ORDER.map(function (k) {
        return '<button type="button" data-status="' + k + '" class="' + (a.status === k ? 'on' : '') + '">' + STATUS[k].label + '</button>';
      }).join('') + '</div>';
    h += '<div class="dr-h">Клиент</div><div class="dr-fields">' +
      '<div><span>Имя</span><b>' + esc(c.name) + '</b></div>' +
      '<div><span>Телефон</span><b>' + esc(c.phone) + '</b></div>' +
      '<div><span>Визитов</span><b>' + c.visits + '</b></div>' +
      '</div>';
    h += '<p class="dr-note">' + esc(c.note) + '</p>';
    h += '<div class="dr-h">Действия</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
      '<button type="button" class="crm-btn solid" data-remind="' + c.id + '">Напомнить</button>' +
      '<button type="button" class="crm-btn" data-client="' + c.id + '">Карточка клиента</button>' +
      '</div>';
    h += '<p class="card-sub" style="margin-top:12px">Изменение статуса работает локально в демо и не сохраняется после перезагрузки.</p>';
    return { title: c.name, sub: a.time + ' · ' + m.name + ' · ' + STATUS[a.status].label, body: h };
  }

  function renderDrawer() {
    var dr = $('#crmDrawer');
    if (!state.sel) { dr.classList.remove('open'); dr.setAttribute('aria-hidden', 'true'); return; }
    var data = null;
    if (state.sel.type === 'client') data = drawerClient(clientById(state.sel.id));
    if (state.sel.type === 'appt') {
      var a = apptById(state.sel.id);
      data = a ? drawerAppt(a) : null;
    }
    if (!data) { state.sel = null; dr.classList.remove('open'); dr.setAttribute('aria-hidden', 'true'); return; }
    $('#drTitle').textContent = data.title;
    $('#drSub').textContent = data.sub;
    $('#drBody').innerHTML = data.body;
    dr.classList.add('open');
    dr.setAttribute('aria-hidden', 'false');
  }

  function openClient(id) { state.sel = { type: 'client', id: id }; renderDrawer(); }
  function openAppt(id) { state.sel = { type: 'appt', id: id }; renderDrawer(); }

  function toast(msg) {
    var t = $('#crmToast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ---------------- render ---------------- */
  function render() {
    var meta = VIEW_META[state.view];
    $('#crmTitle').textContent = meta.t;
    $('#crmSub').textContent = meta.s;
    $$('.crm-nav button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-view') === state.view);
    });
    $('#navToday').textContent = todayAppts().length;

    var view = $('#crmView');
    if (state.view === 'dash') view.innerHTML = viewDash();
    else if (state.view === 'calendar') view.innerHTML = viewCalendar();
    else if (state.view === 'clients') view.innerHTML = viewClients();
    else if (state.view === 'repeat') view.innerHTML = viewRepeat();
    else if (state.view === 'sources') view.innerHTML = viewSources();
    else if (state.view === 'analytics') view.innerHTML = viewAnalytics();
    else view.innerHTML = viewServices();
    view.scrollTop = 0;
  }

  function changeStatus(id, st) {
    var a = apptById(id);
    if (!a || !STATUS[st]) return;
    a.status = st;
    render();
    renderDrawer();
    toast('Статус изменён: ' + STATUS[st].label + ' · демо');
  }

  /* ---------------- events ---------------- */
  $('#crmView').addEventListener('click', function (e) {
    var t = e.target;
    var nav = t.closest('[data-view]');
    if (nav) { state.view = nav.getAttribute('data-view'); state.q = ''; $('#crmSearch').value = ''; render(); return; }

    var dayBtn = t.closest('[data-day]');
    if (dayBtn) {
      var delta = +dayBtn.getAttribute('data-day');
      if (delta === 0) state.dayOffset = 0;
      else state.dayOffset = Math.min(6, Math.max(0, state.dayOffset + delta));
      render();
      return;
    }

    var seg = t.closest('[data-seg]');
    if (seg) { state.filter = seg.getAttribute('data-seg'); render(); return; }

    var cl = t.closest('[data-client]');
    if (cl) { openClient(+cl.getAttribute('data-client')); return; }

    var ap = t.closest('[data-appt]');
    if (ap) { openAppt(ap.getAttribute('data-appt')); return; }

    var rem = t.closest('[data-remind]');
    if (rem) {
      var c = clientById(+rem.getAttribute('data-remind'));
      toast('Напоминание отправлено (демо): ' + c.name);
      return;
    }

    var svc = t.closest('[data-svc]');
    if (svc) {
      var id = svc.getAttribute('data-svc');
      SERVICES.forEach(function (s) { if (s.id === id) s.on = !s.on; });
      render();
      toast('Доступность услуги обновлена · демо');
      return;
    }

    if (t.closest('[data-act="new-appt"]')) { toast('Демо: форма записи доступна на сайте салона'); return; }
  });

  $('#drBody').addEventListener('click', function (e) {
    var st = e.target.closest('[data-status]');
    if (st) {
      if (state.sel && state.sel.type === 'appt') changeStatus(state.sel.id, st.getAttribute('data-status'));
      return;
    }
    var cl = e.target.closest('[data-client]');
    if (cl) { openClient(+cl.getAttribute('data-client')); return; }
    var rem = e.target.closest('[data-remind]');
    if (rem) { toast('Напоминание отправлено (демо): ' + clientById(+rem.getAttribute('data-remind')).name); return; }
    if (e.target.closest('[data-act="new-appt"]')) toast('Демо: форма записи доступна на сайте салона');
  });

  $$('.crm-nav button').forEach(function (b) {
    b.addEventListener('click', function () {
      state.view = b.getAttribute('data-view');
      state.q = '';
      $('#crmSearch').value = '';
      render();
      $('#crm').classList.remove('side-open');
      $('#crmBurger').setAttribute('aria-expanded', 'false');
    });
  });

  $('#crmSearch').addEventListener('input', function (e) {
    state.q = e.target.value;
    if (state.view !== 'clients') state.view = 'clients';
    render();
  });

  $('#crmBurger').addEventListener('click', function () {
    var open = $('#crm').classList.toggle('side-open');
    $('#crmBurger').setAttribute('aria-expanded', String(open));
  });

  $('#drClose').addEventListener('click', function () {
    state.sel = null;
    renderDrawer();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if ($('#crmDrawer').classList.contains('open')) { state.sel = null; renderDrawer(); }
      else if ($('#crm').classList.contains('side-open')) {
        $('#crm').classList.remove('side-open');
        $('#crmBurger').setAttribute('aria-expanded', 'false');
      }
    }
  });

  /* deep link: ?view=clients */
  try {
    var p = new URLSearchParams(location.search).get('view');
    if (p && VIEW_META[p]) state.view = p;
    var cid = new URLSearchParams(location.search).get('client');
    if (cid && clientById(+cid)) state.sel = { type: 'client', id: +cid };
  } catch (err) {}

  render();
  if (state.sel) renderDrawer();
})();
