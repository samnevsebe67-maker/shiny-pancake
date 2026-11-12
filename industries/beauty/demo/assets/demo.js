/* ============================================================
   AUREL — demo site behaviour (no dependencies)
   Booking is demonstration-only and posts to KINETIA /api/lead.
   ============================================================ */
(function () {
  'use strict';

  var RM = false;
  try { RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* ---------- year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- header ---------- */
  var hdr = $('.hdr');
  if (hdr) {
    var onScroll = function () {
      hdr.classList.toggle('solid', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- mobile nav ---------- */
  var burger = $('#burger');
  var mnav = $('#mnav');
  if (burger && mnav) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      mnav.classList.toggle('open', open);
      document.body.classList.toggle('lock', open);
      if (open) {
        var f = mnav.querySelector('a');
        if (f) f.focus({ preventScroll: true });
      }
    };
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mnav.classList.contains('open')) setMenu(false);
    });
  }

  /* ---------- reveal ---------- */
  var rv = $$('[data-rv]');
  if (rv.length) {
    if (RM || !('IntersectionObserver' in window)) {
      rv.forEach(function (el) { el.classList.add('in'); });
    } else {
      var rio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add('in');
          rio.unobserve(en.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
      rv.forEach(function (el) { rio.observe(el); });
    }
  }

  /* ---------- gallery filter ---------- */
  var gal = $('[data-gal]');
  if (gal) {
    var fbtns = $$('[data-gal-filter]');
    var items = $$('[data-cat]', gal);
    fbtns.forEach(function (b) {
      b.addEventListener('click', function () {
        fbtns.forEach(function (x) { x.classList.toggle('on', x === b); });
        var cat = b.getAttribute('data-gal-filter');
        items.forEach(function (it) {
          it.hidden = cat !== 'all' && it.getAttribute('data-cat') !== cat;
        });
      });
    });

    /* lightbox */
    var lb = $('#lightbox');
    if (lb) {
      var lbImg = $('img', lb);
      var lbCap = $('figcaption', lb);
      var visible = [];
      var idx = 0;
      var render = function () {
        var it = visible[idx];
        if (!it) return;
        var img = $('img', it);
        lbImg.src = img.getAttribute('data-full') || img.src;
        lbImg.alt = img.alt;
        lbCap.innerHTML = '<span>' + img.alt + '</span><span>' + (idx + 1) + ' / ' + visible.length + '</span>';
      };
      var openLb = function (it) {
        visible = items.filter(function (x) { return !x.hidden; });
        idx = Math.max(0, visible.indexOf(it));
        render();
        lb.classList.add('open');
        document.body.classList.add('lock');
        $('.lightbox-close', lb).focus();
      };
      var closeLb = function () {
        lb.classList.remove('open');
        document.body.classList.remove('lock');
      };
      var step = function (d) {
        if (!visible.length) return;
        idx = (idx + d + visible.length) % visible.length;
        render();
      };
      items.forEach(function (it) {
        it.addEventListener('click', function () { openLb(it); });
        it.setAttribute('tabindex', '0');
        it.setAttribute('role', 'button');
        it.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(it); }
        });
      });
      $('.lightbox-close', lb).addEventListener('click', closeLb);
      $('.lightbox-nav.prev', lb).addEventListener('click', function () { step(-1); });
      $('.lightbox-nav.next', lb).addEventListener('click', function () { step(1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') closeLb();
        if (e.key === 'ArrowLeft') step(-1);
        if (e.key === 'ArrowRight') step(1);
      });
    }
  }

  /* ---------- contact form (demo) ---------- */
  $$('[data-demo-form]').forEach(function (form) {
    var send = $('button[type=submit]', form);
    var sl = $('.sl', send);
    var bad = $('.banner', form);
    var ok = $('.form-ok', form);
    var consent = $('input[name=consent]', form);

    var setErr = function (name, text) {
      var fld = form.querySelector('[data-f="' + name + '"]');
      if (!fld) return;
      fld.classList.toggle('bad', !!text);
      var msg = $('.msg', fld);
      if (msg) msg.textContent = text || '';
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (send.disabled) return;
      if (bad) bad.classList.remove('show');

      var name = (form.name.value || '').trim();
      var ct = (form.contact.value || '').trim();
      var valid = true;
      if (name.length < 2) { valid = false; setErr('name', 'Укажите имя'); } else setErr('name', '');
      var validCt = /^@?[A-Za-z0-9_]{5,32}$/.test(ct) || /^\+?[\d\s()\-]{7,}$/.test(ct);
      if (ct.length < 5 || !validCt) { valid = false; setErr('contact', 'Укажите Telegram (@username) или телефон'); } else setErr('contact', '');
      if (consent && !consent.checked) { valid = false; consent.closest('.consent').classList.add('bad'); }
      else if (consent) consent.closest('.consent').classList.remove('bad');
      if (!valid) {
        var first = form.querySelector('.fld.bad input') || (consent && !consent.checked ? consent : null);
        if (first) first.focus();
        return;
      }

      send.disabled = true;
      if (sl) sl.textContent = 'Отправляем…';

      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          company: 'AUREL — демонстрационный салон',
          contact: ct,
          site: '',
          message: (form.message ? form.message.value : '') + '\n\n[Демо-сайт AUREL · обратная форма]',
          budget: '',
          services: ['Салоны красоты'],
          industry: 'Beauty demo — AUREL (тестовая заявка)',
          website_hp: form.website_hp ? form.website_hp.value : '',
          consent: consent && consent.checked ? 'yes' : 'no'
        })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok || !j.ok) throw 0;
          form.reset();
          if (ok) {
            ok.classList.add('show');
            ok.scrollIntoView({ block: 'center', behavior: RM ? 'auto' : 'smooth' });
          }
          send.disabled = false;
          if (sl) sl.textContent = 'Отправить';
        });
      }).catch(function () {
        if (bad) bad.classList.add('show');
        send.disabled = false;
        if (sl) sl.textContent = 'Отправить';
      });
    });
  });

  /* ---------- booking ---------- */
  var bk = $('#booking');
  if (!bk) return;

  var SERVICES = {
    hair: { name: 'Стрижка и укладка', price: 1400, min: 90, note: 'Форма, движение, укладка' },
    color: { name: 'Окрашивание', price: 3200, min: 180, note: 'Тон, блики, уход после' },
    care: { name: 'Уход и восстановление', price: 1800, min: 75, note: 'Диагностика и протокол' },
    nails: { name: 'Маникюр', price: 1100, min: 75, note: 'Форма, покрытие, дизайн' },
    brows: { name: 'Брови и ресницы', price: 900, min: 60, note: 'Архитектура и окрашивание' }
  };
  var MASTERS = {
    any: { name: 'Любой мастер', role: 'Подберём по услуге и времени', av: '' },
    anna: { name: 'Анна Коваль', role: 'Стилист · колорист', av: 'А' },
    olga: { name: 'Ольга Мельник', role: 'Колорист', av: 'О' },
    irina: { name: 'Ирина Савчук', role: 'Стилист', av: 'И' },
    marina: { name: 'Марина Бондар', role: 'Уход · брови', av: 'М' },
    daria: { name: 'Дарья Литвин', role: 'Ногтевой сервис', av: 'Д' }
  };
  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var DOW = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  var MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  var state = { step: 1, service: '', master: 'any', date: null, time: '', name: '', contact: '', comment: '' };

  var q = new URLSearchParams(location.search);
  if (q.get('service') && SERVICES[q.get('service')]) state.service = q.get('service');
  if (q.get('master') && MASTERS[q.get('master')]) state.master = q.get('master');

  var stepsEl = $('#bkSteps');
  var views = $$('.bk-view', bk);
  var sumEl = $('#bkSummary');
  var errEl = $('#bkErr');

  var fmtDate = function (d) {
    return DOW[(d.getDay() + 6) % 7] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
  };
  var money = function (n) { return n.toLocaleString('ru-RU') + ' ₴'; };
  var pad = function (n) { return String(n).padStart(2, '0'); };

  var dates = (function () {
    var out = [];
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    for (var i = 0; i < 21; i++) {
      var x = new Date(d);
      x.setDate(d.getDate() + i);
      out.push(x);
    }
    return out;
  })();

  function seed(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967295;
  }

  function slotsFor(date, masterId) {
    var out = [];
    var start = 9 * 60;
    var end = 19 * 60 + 30;
    for (var m = start; m <= end; m += 90) {
      var label = pad(Math.floor(m / 60)) + ':' + pad(m % 60);
      var key = (date ? date.toISOString().slice(0, 10) : '') + '|' + masterId + '|' + label;
      var busy = seed(key) > .58;
      out.push({ label: label, busy: busy });
    }
    return out;
  }

  function serviceOf() { return SERVICES[state.service] || null; }

  function renderSteps() {
    if (!stepsEl) return;
    var labels = ['Услуга', 'Мастер', 'Дата', 'Время', 'Контакты'];
    stepsEl.innerHTML = labels.map(function (l, i) {
      var n = i + 1;
      var cls = state.step === n ? 'on' : state.step > n ? 'done' : '';
      return '<li class="' + cls + '"><i>' + (state.step > n ? '✓' : n) + '</i>' + l + '</li>';
    }).join('');
  }

  function renderSummary() {
    if (!sumEl) return;
    var s = serviceOf();
    var m = MASTERS[state.master];
    var rows = [
      ['Услуга', s ? s.name : '—'],
      ['Мастер', m ? m.name : '—'],
      ['Дата', state.date ? fmtDate(state.date) : '—'],
      ['Время', state.time || '—']
    ];
    sumEl.innerHTML =
      '<h3>Ваша запись</h3>' +
      '<div class="bk-sum-list">' + rows.map(function (r) {
        return '<div><span>' + r[0] + '</span><b>' + r[1] + '</b></div>';
      }).join('') + '</div>' +
      '<div class="bk-sum-total"><span>Демо-стоимость</span><b>' + (s ? money(s.price) : '—') + '</b></div>' +
      '<p class="form-note">Расчёт указан для демонстрации. Это не подтверждение брони: заявку проверит администратор.</p>' +
      '<span class="tag soft" style="margin-top:14px">Демо-запись</span>';
  }

  function renderService() {
    var box = $('#bkServices');
    var s = serviceOf();
    box.innerHTML = Object.keys(SERVICES).map(function (id) {
      var it = SERVICES[id];
      return '<button type="button" class="bk-opt' + (state.service === id ? ' on' : '') + '" data-service="' + id + '" aria-pressed="' + (state.service === id) + '">' +
        '<b>' + it.name + '<em>' + money(it.price) + '</em></b>' +
        '<span>' + it.note + ' · ' + it.min + ' мин</span>' +
        '</button>';
    }).join('');
    $$('[data-service]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        state.service = b.getAttribute('data-service');
        renderService();
        renderSummary();
      });
    });
  }

  function renderMasters() {
    var box = $('#bkMasters');
    box.innerHTML = Object.keys(MASTERS).map(function (id) {
      var m = MASTERS[id];
      var av = id === 'any' ? '<span class="any">—</span>' : '<span class="av">' + m.av + '</span>';
      return '<button type="button" class="bk-master' + (state.master === id ? ' on' : '') + '" data-master="' + id + '" aria-pressed="' + (state.master === id) + '">' +
        av + '<span><b>' + m.name + '</b><span>' + m.role + '</span></span>' +
        '</button>';
    }).join('');
    $$('[data-master]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        state.master = b.getAttribute('data-master');
        renderMasters();
        renderSummary();
      });
    });
  }

  function renderDates() {
    var box = $('#bkCal');
    var head = DOW.map(function (d) { return '<span class="dow">' + d + '</span>'; }).join('');
    var first = dates[0];
    var lead = (first.getDay() + 6) % 7;
    var cells = '';
    for (var i = 0; i < lead; i++) cells += '<span></span>';
    dates.forEach(function (d, i) {
      var closed = d.getDay() === 1;
      var on = state.date && d.toDateString() === state.date.toDateString();
      cells += '<button type="button" class="bk-day' + (on ? ' on' : '') + '" data-day="' + i + '"' + (closed ? ' disabled' : '') + ' aria-pressed="' + !!on + '">' +
        d.getDate() + '<small>' + MONTHS_SHORT[d.getMonth()] + '</small>' +
        '</button>';
    });
    box.innerHTML = head + cells;
    $$('[data-day]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        state.date = dates[+b.getAttribute('data-day')];
        state.time = '';
        renderDates();
        renderSummary();
      });
    });
    if (state.date) {
      var note = $('#bkCalNote');
      if (note) note.textContent = 'Выбрано: ' + fmtDate(state.date) + '. Понедельник — выходной.';
    }
  }

  function renderTimes() {
    var box = $('#bkSlots');
    if (!state.date) {
      box.innerHTML = '<p class="crm-empty" style="color:var(--muted)">Сначала выберите дату.</p>';
      return;
    }
    var list = slotsFor(state.date, state.master);
    box.innerHTML = list.map(function (s) {
      return '<button type="button" class="bk-slot' + (state.time === s.label ? ' on' : '') + '" data-time="' + s.label + '"' + (s.busy ? ' disabled' : '') + ' aria-pressed="' + (state.time === s.label) + '">' + s.label + '</button>';
    }).join('');
    $$('[data-time]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        state.time = b.getAttribute('data-time');
        renderTimes();
        renderSummary();
      });
    });
  }

  function showStep(n) {
    state.step = n;
    views.forEach(function (v) { v.hidden = +v.getAttribute('data-step') !== n; });
    var panel = $('#bkPanel');
    if (panel) panel.setAttribute('data-step', String(n));
    renderSteps();
    renderSummary();
    if (n === 2) renderMasters();
    if (n === 3) renderDates();
    if (n === 4) renderTimes();
    var top = $('#bkTop');
    if (top) top.scrollIntoView({ block: 'start', behavior: RM ? 'auto' : 'smooth' });
    if (errEl) errEl.textContent = '';
  }

  function canNext() {
    if (state.step === 1) return !!state.service;
    if (state.step === 2) return !!state.master;
    if (state.step === 3) return !!state.date;
    if (state.step === 4) return !!state.time;
    return true;
  }

  $('#bkNext').addEventListener('click', function () {
    if (!canNext()) {
      if (errEl) errEl.textContent = state.step === 1 ? 'Выберите услугу, чтобы продолжить.' : state.step === 3 ? 'Выберите дату визита.' : 'Выберите удобное время.';
      return;
    }
    if (state.step < 5) showStep(state.step + 1);
  });
  $('#bkPrev').addEventListener('click', function () {
    if (state.step > 1) showStep(state.step - 1);
  });

  /* jump back by clicking completed step */
  if (stepsEl) {
    stepsEl.addEventListener('click', function (e) {
      var li = e.target.closest('li');
      if (!li) return;
      var n = $$('li', stepsEl).indexOf(li) + 1;
      if (n < state.step) showStep(n);
    });
  }

  /* submit */
  var submit = $('#bkSubmit');
  submit.addEventListener('click', function () {
    var nameEl = $('#bkName');
    var ctEl = $('#bkContact');
    var cons = $('#bkConsent');
    var name = (nameEl.value || '').trim();
    var ct = (ctEl.value || '').trim();
    var valid = true;

    var setF = function (el, text) {
      var fld = el.closest('.fld');
      fld.classList.toggle('bad', !!text);
      var m = $('.msg', fld);
      if (m) m.textContent = text || '';
    };

    if (name.length < 2) { valid = false; setF(nameEl, 'Укажите имя'); } else setF(nameEl, '');
    var okCt = /^@?[A-Za-z0-9_]{5,32}$/.test(ct) || /^\+?[\d\s()\-]{7,}$/.test(ct);
    if (ct.length < 5 || !okCt) { valid = false; setF(ctEl, 'Укажите Telegram (@username) или телефон'); } else setF(ctEl, '');
    if (!cons.checked) { valid = false; cons.closest('.consent').classList.add('bad'); }
    else cons.closest('.consent').classList.remove('bad');

    if (!valid) {
      var first = bk.querySelector('.fld.bad input') || (!cons.checked ? cons : null);
      if (first) first.focus();
      return;
    }

    if (submit.disabled) return;
    submit.disabled = true;
    var label = $('.sl', submit);
    if (label) label.textContent = 'Отправляем…';
    if (errEl) errEl.textContent = '';

    var s = serviceOf();
    var m = MASTERS[state.master];
    var msg = 'Демо-запись AUREL\n' +
      'Услуга: ' + (s ? s.name : '—') + '\n' +
      'Мастер: ' + m.name + '\n' +
      'Дата: ' + (state.date ? fmtDate(state.date) : '—') + '\n' +
      'Время: ' + state.time + '\n' +
      'Комментарий: ' + (($('#bkComment') && $('#bkComment').value) || '—');

    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        company: 'AUREL — демонстрационный салон',
        contact: ct,
        site: '',
        message: msg,
        budget: '',
        services: ['Салоны красоты'],
        industry: 'Beauty demo — AUREL (тестовая запись)',
        website_hp: '',
        consent: 'yes'
      })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok || !j.ok) throw 0;
        var ref = 'DEMO-' + String(Math.floor(seed(name + ct + state.time) * 9000) + 1000);
        $('#bkPanel').hidden = true;
        var done = $('#bkDone');
        done.hidden = false;
        $('#bkRef').textContent = ref;
        $('#bkDoneWho').textContent = name + ', ' + (s ? s.name.toLowerCase() : 'визит') + ' · ' + (state.date ? fmtDate(state.date) : '') + ' · ' + state.time + ' · ' + m.name;
        done.scrollIntoView({ block: 'center', behavior: RM ? 'auto' : 'smooth' });
        submit.disabled = false;
        if (label) label.textContent = 'Подтвердить запись';
      });
    }).catch(function () {
      if (errEl) errEl.textContent = 'Не удалось отправить запись. Проверьте соединение и попробуйте снова.';
      submit.disabled = false;
      if (label) label.textContent = 'Подтвердить запись';
    });
  });

  /* restore submitted values on back navigation */
  var remember = function () {
    state.name = ($('#bkName').value || '').trim();
    state.contact = ($('#bkContact').value || '').trim();
  };
  ['bkName', 'bkContact'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', remember);
  });

  renderSteps();
  renderService();
  renderSummary();
  if (state.service) showStep(2); else showStep(1);

})();
