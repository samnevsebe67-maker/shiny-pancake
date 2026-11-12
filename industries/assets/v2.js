/* KINETIA — Industry Solutions 2.0
   Engine: 3D traffic-flow scenes + per-niche CRM demo + section rail.
   No dependencies except Three.js (lazy-loaded) and optional GSAP from base.js. */
(function () {
  'use strict';

  var RM = false;
  try { RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ------------------------------------------------------------------ *
   *  Section rail
   * ------------------------------------------------------------------ */
  (function rail() {
    var nav = document.querySelector('.rail');
    if (!nav) return;
    var links = [].slice.call(nav.querySelectorAll('a[href^="#"]'));
    var targets = links.map(function (a) {
      return document.getElementById(a.getAttribute('href').slice(1));
    }).filter(Boolean);
    if (!targets.length) return;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (a) {
            a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      targets.forEach(function (t) { io.observe(t); });
    }
  })();

  /* ------------------------------------------------------------------ *
   *  CRM demo data (all values are demonstration data)
   * ------------------------------------------------------------------ */
  var CRM = {};

  CRM.beauty = {
    title: 'Салон красоты / демо',
    kpi: [['12', 'Новые заявки'], ['34', 'Записи'], ['78%', 'Загрузка'], ['41%', 'Возвраты']],
    nav: [
      { id: 'req', n: 'Заявки', v: { type: 'table', title: 'Новые заявки', cols: [['title', 'Клиент'], ['sub', 'Услуга'], ['chip', 'Статус']], ids: ['b1', 'b2', 'b3', 'b4', 'b5'] } },
      { id: 'cal', n: 'Календарь', v: { type: 'cal', title: 'Календарь мастеров', days: ['Пн', 'Вт', 'Ср'], rows: [
        { time: '10:00', cells: [['b6'], [], ['b2']] },
        { time: '12:00', cells: [[], ['b4'], []] },
        { time: '14:30', cells: [['b1'], ['b3'], []] },
        { time: '17:00', cells: [[], [], ['b5']] }
      ] } },
      { id: 'cl', n: 'Клиенты', v: { type: 'table', title: 'Карточки клиентов', cols: [['title', 'Клиент'], ['sub', 'Мастер'], ['chip', 'Статус']], ids: ['b1', 'b3', 'b4', 'b6'] } },
      { id: 'sv', n: 'Услуги', v: { type: 'bars', title: 'Спрос по услугам', rows: [['Стрижка', 74, 'часто'], ['Окрашивание', 58, 'часто'], ['Уход', 41, 'средне'], ['Маникюр', 33, 'средне']], note: 'Демонстрационные данные. Показывает, какие услуги чаще выбирают в записи.' } },
      { id: 'rp', n: 'Повторные', v: { type: 'board', title: 'Повторная запись', cols: [
        { h: 'Напомнить', ids: ['b2', 'b5'], c: 'new' },
        { h: 'Ждёт ответа', ids: ['b3'], c: 'wait' },
        { h: 'Записан', ids: ['b1', 'b6'], c: 'ok' }
      ] } }
    ],
    ents: {
      b1: { title: 'Алина Р.', sub: 'Стрижка · мастер Анна', ct: 'Записан', st: 'ok', f: [['Когда', 'Пн, 14:30'], ['Контакт', 'Telegram'], ['Источник', 'Instagram / Meta Ads'], ['Напоминание', 'за 2 часа']], n: 'Клиентка записана повторно. Напоминание уйдёт автоматически.' },
      b2: { title: 'Марина К.', sub: 'Окрашивание · мастер Ольга', ct: 'Новая', st: 'new', f: [['Когда', 'Вт, 10:00'], ['Контакт', 'Телефон'], ['Источник', 'Карты'], ['Ответственный', 'Администратор']], n: 'Заявка с сайта. Нужно подтвердить окно и мастера.' },
      b3: { title: 'Дарья Л.', sub: 'Уход · мастер Анна', ct: 'В работе', st: 'work', f: [['Когда', 'Вт, 14:30'], ['Контакт', 'Telegram'], ['Источник', 'Google Ads'], ['Следующий шаг', 'Уточнить аллергии']], n: 'Клиентка попросила перенести визит. Открыто окно на среду.' },
      b4: { title: 'Игорь С.', sub: 'Стрижка · мастер Пётр', ct: 'Записан', st: 'ok', f: [['Когда', 'Вт, 12:00'], ['Контакт', 'Телефон'], ['Источник', 'Органика'], ['Повторный визит', 'через 4 недели']], n: 'Постоянный клиент. Предпочтение — утренние окна.' },
      b5: { title: 'София М.', sub: 'Маникюр · мастер Ирина', ct: 'Новая', st: 'new', f: [['Когда', 'Ср, 17:00'], ['Контакт', 'Instagram'], ['Источник', 'Ретаргетинг'], ['Ответственный', 'Администратор']], n: 'Первый визит. Отправить схему проезда и правила подготовки.' },
      b6: { title: 'Елена В.', sub: 'Стрижка · мастер Анна', ct: 'Записан', st: 'ok', f: [['Когда', 'Пн, 10:00'], ['Контакт', 'Telegram'], ['Источник', 'Постоянный клиент'], ['Повторный визит', 'запланирован']], n: 'Визит подтверждён. Повторная запись создана на следующий цикл.' }
    }
  };

  CRM.dentistry = {
    title: 'Стоматология / демо',
    kpi: [['9', 'Обращения'], ['21', 'Приёмы'], ['6', 'Планы лечения'], ['38%', 'Повторные']],
    nav: [
      { id: 'req', n: 'Обращения', v: { type: 'table', title: 'Обращения пациентов', cols: [['title', 'Пациент'], ['sub', 'Повод'], ['chip', 'Статус']], ids: ['d1', 'd2', 'd3', 'd4'] } },
      { id: 'ap', n: 'Приёмы', v: { type: 'cal', title: 'Планирование приёмов', days: ['Пн', 'Вт', 'Ср'], rows: [
        { time: '09:30', cells: [['d5'], [], ['d2']] },
        { time: '11:00', cells: [[], ['d3'], []] },
        { time: '14:00', cells: [['d1'], [], ['d6']] },
        { time: '16:30', cells: [[], ['d4'], []] }
      ] } },
      { id: 'pt', n: 'Пациенты', v: { type: 'table', title: 'Карточки пациентов', cols: [['title', 'Пациент'], ['sub', 'Направление'], ['chip', 'Статус']], ids: ['d1', 'd3', 'd5', 'd6'] } },
      { id: 'fn', n: 'Воронка', v: { type: 'board', title: 'Воронка консультаций и лечения', cols: [
        { h: 'Обращение', ids: ['d2', 'd4'], c: 'new' },
        { h: 'Консультация', ids: ['d1'], c: 'work' },
        { h: 'План лечения', ids: ['d3', 'd5'], c: 'wait' },
        { h: 'Лечение', ids: ['d6'], c: 'ok' }
      ] } },
      { id: 'rp', n: 'Повторные', v: { type: 'bars', title: 'Повторные визиты', rows: [['Гигиена', 66, 'план'], ['Пломбы', 49, 'план'], ['Ортодонтия', 31, 'план'], ['Имплантация', 22, 'наблюдение']], note: 'Демонстрационные данные. Показывает, по каким направлениям стоит планировать напоминания.' } }
    ],
    ents: {
      d1: { title: 'Пациент A.', sub: 'Консультация · терапия', ct: 'Записан', st: 'ok', f: [['Когда', 'Пн, 14:00'], ['Контакт', 'Телефон'], ['Источник', 'Google Ads'], ['Администратор', 'Назначен']], n: 'Обращение с формы на странице услуги. Приём подтверждён.' },
      d2: { title: 'Пациент B.', sub: 'Боль · срочно', ct: 'Новое', st: 'new', f: [['Когда', 'Ср, 09:30'], ['Контакт', 'Telegram'], ['Источник', 'Органика'], ['Ответственный', 'Администратор']], n: 'Нужен звонок в течение рабочего дня: уточнить характер боли.' },
      d3: { title: 'Пациент C.', sub: 'План лечения · ортодонтия', ct: 'В работе', st: 'work', f: [['Когда', 'Вт, 11:00'], ['Контакт', 'Телефон'], ['Источник', 'Рекомендация'], ['Следующий шаг', 'Согласовать этапы']], n: 'План составлен. Ждём решение по срокам, напоминание запланировано.' },
      d4: { title: 'Пациент D.', sub: 'Профгигиена', ct: 'Новое', st: 'new', f: [['Когда', 'Вт, 16:30'], ['Контакт', 'Instagram'], ['Источник', 'Meta Ads'], ['Ответственный', 'Администратор']], n: 'Первый визит. Отправить анкету и памятку по подготовке.' },
      d5: { title: 'Пациент E.', sub: 'Имплантация · консультация', ct: 'План', st: 'wait', f: [['Когда', 'Пн, 09:30'], ['Контакт', 'Телефон'], ['Источник', 'Google Ads'], ['Следующий шаг', 'Согласовать КП']], n: 'Ждёт расчёт по этапам лечения. Сделка на этапе плана.' },
      d6: { title: 'Пациент F.', sub: 'Лечение · терапия', ct: 'Лечение', st: 'ok', f: [['Когда', 'Ср, 14:00'], ['Контакт', 'Telegram'], ['Источник', 'Повторный'], ['Повторный визит', 'через 6 месяцев']], n: 'Этап лечения завершён. Следующий контрольный визит запланирован.' }
    }
  };

  CRM.construction = {
    title: 'Строительство / демо',
    kpi: [['7', 'Заявки'], ['5', 'Объекты'], ['4', 'КП'], ['2', 'Сделки']],
    nav: [
      { id: 'req', n: 'Заявки', v: { type: 'table', title: 'Заявки на строительство', cols: [['title', 'Объект'], ['sub', 'Тип работ'], ['chip', 'Статус']], ids: ['c1', 'c2', 'c3', 'c4'] } },
      { id: 'ob', n: 'Объекты', v: { type: 'table', title: 'Объекты и проекты', cols: [['title', 'Объект'], ['sub', 'Стадия'], ['chip', 'Статус']], ids: ['c1', 'c3', 'c5'] } },
      { id: 'ng', n: 'Переговоры', v: { type: 'board', title: 'Стадии переговоров', cols: [
        { h: 'Новая заявка', ids: ['c2', 'c4'], c: 'new' },
        { h: 'Квалификация', ids: ['c1'], c: 'work' },
        { h: 'Расчёт', ids: ['c3'], c: 'wait' },
        { h: 'Договор', ids: ['c5'], c: 'ok' }
      ] } },
      { id: 'kp', n: 'КП', v: { type: 'table', title: 'Коммерческие предложения', cols: [['title', 'КП'], ['sub', 'Объект'], ['chip', 'Статус']], ids: ['c3', 'c5', 'c6'] } },
      { id: 'dl', n: 'Сделки', v: { type: 'bars', title: 'Контроль сделок', rows: [['Заявки', 88, 'этап'], ['Квалификация', 61, 'этап'], ['Расчёт', 42, 'этап'], ['Договор', 24, 'этап']], note: 'Демонстрационные данные. Показывает, на каком этапе чаще останавливаются сделки.' } }
    ],
    ents: {
      c1: { title: 'Объект 01', sub: 'Реконструкция · расчёт', ct: 'В работе', st: 'work', f: [['Тип', 'Частный дом'], ['Стадия', 'Квалификация'], ['Источник', 'Google Ads'], ['Следующий шаг', 'Выезд на объект']], n: 'Заявка с лендинга. Нужно уточнить площадь и сроки, затем выезд.' },
      c2: { title: 'Объект 02', sub: 'Отделка · консультация', ct: 'Новая', st: 'new', f: [['Тип', 'Квартира'], ['Стадия', 'Новая заявка'], ['Источник', 'Meta Ads'], ['Ответственный', 'Менеджер']], n: 'Запрос расчёта с формы. Связаться и собрать вводные по объекту.' },
      c3: { title: 'Объект 03', sub: 'Фасад · КП отправлено', ct: 'Расчёт', st: 'wait', f: [['Тип', 'Коммерческий'], ['Стадия', 'Расчёт'], ['Источник', 'Органика'], ['Следующий шаг', 'Ответ на КП']], n: 'КП отправлено. Напоминание через два рабочих дня.' },
      c4: { title: 'Объект 04', sub: 'Фундамент · входящая', ct: 'Новая', st: 'new', f: [['Тип', 'Частный дом'], ['Стадия', 'Новая заявка'], ['Источник', 'Ретаргетинг'], ['Ответственный', 'Менеджер']], n: 'Нужна первичная квалификация: бюджет, участок, сроки.' },
      c5: { title: 'Объект 05', sub: 'Под ключ · договор', ct: 'Договор', st: 'ok', f: [['Тип', 'Частный дом'], ['Стадия', 'Договор'], ['Источник', 'Рекомендация'], ['Следующий шаг', 'Подписание']], n: 'Сделка переходит к договору. Состав работ зафиксирован в КП.' },
      c6: { title: 'КП · версия 2', sub: 'Объект 03 · фасад', ct: 'Отправлено', st: 'wait', f: [['Состав', 'Работы и материалы'], ['Статус', 'Ожидает ответа'], ['Канал', 'Email'], ['Напоминание', 'через 2 дня']], n: 'Демонстрационный документ. Суммы и сроки в макете не указаны.' }
    }
  };

  CRM.auto = {
    title: 'Автосервис / демо',
    kpi: [['14', 'Записи'], ['11', 'Автомобили'], ['8', 'В работе'], ['37%', 'Повторные']],
    nav: [
      { id: 'ap', n: 'Записи', v: { type: 'table', title: 'Запись на обслуживание', cols: [['title', 'Клиент'], ['sub', 'Работа'], ['chip', 'Статус']], ids: ['a1', 'a2', 'a3', 'a4'] } },
      { id: 'cr', n: 'Автомобили', v: { type: 'table', title: 'Автомобили клиентов', cols: [['title', 'Автомобиль'], ['sub', 'Клиент'], ['chip', 'Статус']], ids: ['a5', 'a6', 'a7'] } },
      { id: 'rm', n: 'Ремонт', v: { type: 'board', title: 'Статусы ремонта', cols: [
        { h: 'Принят', ids: ['a2'], c: 'new' },
        { h: 'В работе', ids: ['a4', 'a6'], c: 'work' },
        { h: 'Ждёт деталь', ids: ['a3'], c: 'wait' },
        { h: 'Готов', ids: ['a1'], c: 'ok' }
      ] } },
      { id: 'or', n: 'Заказы', v: { type: 'cal', title: 'Загрузка постов', days: ['Пн', 'Вт', 'Ср'], rows: [
        { time: '09:00', cells: [['a1'], [], ['a5']] },
        { time: '11:30', cells: [['a2'], ['a4'], []] },
        { time: '14:00', cells: [[], ['a3'], ['a6']] },
        { time: '17:00', cells: [[], [], ['a7']] }
      ] } },
      { id: 'rp', n: 'Повторные', v: { type: 'bars', title: 'Повторное обслуживание', rows: [['ТО', 71, 'план'], ['Шины', 52, 'сезон'], ['Диагностика', 44, 'план'], ['Детейлинг', 27, 'наблюдение']], note: 'Демонстрационные данные. Показывает, какие работы стоит предлагать повторно.' } }
    ],
    ents: {
      a1: { title: 'Клиент A.', sub: 'ТО · готов', ct: 'Готов', st: 'ok', f: [['Когда', 'Пн, 09:00'], ['Автомобиль', 'Седан · демо'], ['Источник', 'Google Search'], ['Следующий шаг', 'Выдать авто']], n: 'Работы завершены. Напоминание о следующем ТО создаётся автоматически.' },
      a2: { title: 'Клиент B.', sub: 'Диагностика · принят', ct: 'Принят', st: 'new', f: [['Когда', 'Пн, 11:30'], ['Автомобиль', 'Кроссовер · демо'], ['Источник', 'Meta Ads'], ['Пост', 'Свободен']], n: 'Новая запись с сайта. Нужно подтвердить время и назначить пост.' },
      a3: { title: 'Клиент C.', sub: 'Ремонт · ждёт деталь', ct: 'Ожидание', st: 'wait', f: [['Когда', 'Вт, 14:00'], ['Автомобиль', 'Универсал · демо'], ['Источник', 'Повторный'], ['Следующий шаг', 'Сообщить срок']], n: 'Клиент ждёт поставку. Статус обновляется вручную, клиенту уходит сообщение.' },
      a4: { title: 'Клиент D.', sub: 'Шины · в работе', ct: 'В работе', st: 'work', f: [['Когда', 'Вт, 11:30'], ['Автомобиль', 'Хэтчбек · демо'], ['Источник', 'Карты'], ['Пост', 'Пост 2']], n: 'Работа в процессе. Дополнительные услуги согласуются до выполнения.' },
      a5: { title: 'Автомобиль A.', sub: 'Владелец · клиент A', ct: 'ТО', st: 'ok', f: [['Пробег', 'указан в карточке'], ['Последний визит', 'Пн'], ['История', '3 обращения'], ['Следующий визит', 'по регламенту']], n: 'История обращений и работ хранится в карточке автомобиля.' },
      a6: { title: 'Автомобиль B.', sub: 'Владелец · клиент C', ct: 'Ремонт', st: 'work', f: [['Пробег', 'указан в карточке'], ['Последний визит', 'Вт'], ['История', '2 обращения'], ['Статус', 'В работе']], n: 'Демонстрационная карточка. Реальные данные клиентов не используются.' },
      a7: { title: 'Автомобиль C.', sub: 'Владелец · клиент D', ct: 'Запись', st: 'new', f: [['Пробег', 'указан в карточке'], ['Последний визит', '—'], ['История', '1 обращение'], ['Статус', 'Записан']], n: 'Первый визит. Запись пришла из карточки на картах.' }
    }
  };

  CRM.ecommerce = {
    title: 'Интернет-магазин / демо',
    kpi: [['48', 'Заказы'], ['19', 'Корзины'], ['23%', 'Повторные'], ['4', 'Источника']],
    nav: [
      { id: 'or', n: 'Заказы', v: { type: 'table', title: 'Заказы', cols: [['title', 'Заказ'], ['sub', 'Покупатель'], ['chip', 'Статус']], ids: ['e1', 'e2', 'e3', 'e4'] } },
      { id: 'ct', n: 'Покупатели', v: { type: 'table', title: 'Карточки покупателей', cols: [['title', 'Покупатель'], ['sub', 'Сегмент'], ['chip', 'Статус']], ids: ['e1', 'e3', 'e5'] } },
      { id: 'fn', n: 'Воронка', v: { type: 'bars', title: 'Воронка продаж', rows: [['Визиты', 92, 'этап'], ['Каталог', 74, 'этап'], ['Корзина', 46, 'этап'], ['Заказ', 28, 'этап']], note: 'Демонстрационные данные. Показывает, где чаще всего останавливаются покупатели.' } },
      { id: 'bs', n: 'Корзины', v: { type: 'board', title: 'Брошенные корзины', cols: [
        { h: 'Без действия', ids: ['e2', 'e4'], c: 'new' },
        { h: 'Напоминание', ids: ['e6'], c: 'wait' },
        { h: 'Вернулись', ids: ['e5'], c: 'ok' }
      ] } },
      { id: 'src', n: 'Источники', v: { type: 'bars', title: 'Источники заказов', rows: [['Meta Ads', 68, 'канал'], ['Google Shopping', 57, 'канал'], ['Organic', 44, 'канал'], ['Email', 21, 'канал']], note: 'Демонстрационные данные. Показывает распределение заказов по каналам в макете.' } }
    ],
    ents: {
      e1: { title: 'Заказ 1042', sub: 'Покупатель A · оплачен', ct: 'Оплачен', st: 'ok', f: [['Состав', '2 позиции'], ['Источник', 'Meta Ads'], ['Доставка', 'Готов к отправке'], ['Следующий шаг', 'Передать в сборку']], n: 'Демонстрационный заказ. Суммы и адреса в макете не указаны.' },
      e2: { title: 'Заказ 1043', sub: 'Покупатель B · создан', ct: 'Новый', st: 'new', f: [['Состав', '1 позиция'], ['Источник', 'Google Shopping'], ['Доставка', 'Ожидает подтверждения'], ['Следующий шаг', 'Подтвердить заказ']], n: 'Требуется подтверждение наличия и способа доставки.' },
      e3: { title: 'Покупатель A.', sub: 'Сегмент · повторный', ct: 'Повторный', st: 'ok', f: [['Заказов', '4'], ['Канал', 'Meta Ads'], ['Средний чек', 'в карточке'], ['Следующий шаг', 'Персональный оффер']], n: 'Постоянный покупатель. Можно предложить повторную покупку.' },
      e4: { title: 'Корзина 221', sub: 'Покупатель C · без действия', ct: 'Брошена', st: 'new', f: [['Состав', '2 позиции'], ['Источник', 'Organic'], ['Оставлена', 'сегодня'], ['Следующий шаг', 'Напоминание']], n: 'Корзина брошена на этапе оформления. Запланировано напоминание.' },
      e5: { title: 'Корзина 198', sub: 'Покупатель D · вернулся', ct: 'Возврат', st: 'ok', f: [['Состав', '1 позиция'], ['Источник', 'Email'], ['Статус', 'Заказ создан'], ['Следующий шаг', 'Сборка']], n: 'Покупатель вернулся после напоминания и завершил заказ.' },
      e6: { title: 'Корзина 205', sub: 'Покупатель E · напоминание', ct: 'Напоминание', st: 'wait', f: [['Состав', '3 позиции'], ['Источник', 'Meta Ads'], ['Оставлена', 'вчера'], ['Следующий шаг', 'Ожидание ответа']], n: 'Отправлено одно напоминание. Повторное — не раньше следующего дня.' }
    }
  };

  /* ------------------------------------------------------------------ *
   *  CRM renderer
   * ------------------------------------------------------------------ */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function chipClass(st) {
    return st === 'new' ? 'new' : st === 'work' ? 'work' : st === 'ok' ? 'ok' : 'wait';
  }

  function chipHtml(e) {
    return '<span class="crm-chip ' + chipClass(e.st) + '">' + esc(e.ct) + '</span>';
  }

  function renderCrm(root, cfg) {
    if (!cfg) return;
    var state = { view: 0, filter: 'all', sel: null };

    root.innerHTML =
      '<div class="crm-side">' +
        '<div class="crm-brand"><i aria-hidden="true"></i><b>KINETIA CRM</b><span>DEMO</span></div>' +
        '<nav class="crm-nav" aria-label="Разделы демонстрационной CRM">' +
          cfg.nav.map(function (s, i) {
            return '<button type="button" data-view="' + i + '"' + (i === 0 ? ' class="on" aria-current="true"' : '') + '><u aria-hidden="true"></u>' + esc(s.n) + '</button>';
          }).join('') +
        '</nav>' +
        '<div class="crm-side-foot">' + esc(cfg.title) + '<br>Демонстрационные данные</div>' +
      '</div>' +
      '<div class="crm-main">' +
        '<div class="crm-top"><h3>' + esc(cfg.nav[0].v.title) + '</h3><span class="demo-tag">Demo</span></div>' +
        '<div class="crm-kpis">' + cfg.kpi.map(function (k) {
          return '<div class="crm-kpi"><b>' + esc(k[0]) + '</b><span>' + esc(k[1]) + '</span></div>';
        }).join('') + '</div>' +
        '<div class="crm-toolbar" role="group" aria-label="Фильтр демонстрационных записей">' +
          '<button class="crm-tab" type="button" data-filter="all" aria-selected="true">Все</button>' +
          '<button class="crm-tab" type="button" data-filter="new" aria-selected="false">Новые</button>' +
          '<button class="crm-tab" type="button" data-filter="work" aria-selected="false">В работе</button>' +
          '<button class="crm-tab" type="button" data-filter="ok" aria-selected="false">Завершено</button>' +
        '</div>' +
        '<div class="crm-views" aria-live="polite"></div>' +
      '</div>' +
      '<aside class="crm-detail" aria-label="Карточка выбранной записи"></aside>';

    var viewsEl = root.querySelector('.crm-views');
    var titleEl = root.querySelector('.crm-top h3');
    var detailEl = root.querySelector('.crm-detail');
    var toolbar = root.querySelector('.crm-toolbar');

    function ent(id) { return cfg.ents[id]; }

    function passes(id) {
      if (state.filter === 'all') return true;
      var e = ent(id);
      return !!e && e.st === state.filter;
    }

    function renderDetail() {
      var e = state.sel ? ent(state.sel) : null;
      if (!e) {
        detailEl.innerHTML =
          '<div class="crm-detail-head"><div><b>Карточка записи</b><span>Выберите строку или карточку</span></div></div>' +
          '<div class="crm-detail-note">Демонстрационный интерфейс. Данные условные и не связаны с реальной CRM.</div>' +
          '<div class="crm-detail-foot">KINETIA CRM · demo build</div>';
        return;
      }
      detailEl.innerHTML =
        '<div class="crm-detail-head"><div><b>' + esc(e.title) + '</b><span>' + esc(e.sub) + '</span></div>' + chipHtml(e) + '</div>' +
        e.f.map(function (f) {
          return '<div class="crm-fld"><span>' + esc(f[0]) + '</span><b>' + esc(f[1]) + '</b></div>';
        }).join('') +
        '<div class="crm-detail-note">' + esc(e.n) + '</div>' +
        '<div class="crm-detail-foot">Демонстрационные данные · реальная CRM не подключена</div>';
    }

    function renderView() {
      var v = cfg.nav[state.view].v;
      titleEl.textContent = v.title;
      toolbar.hidden = (v.type === 'bars');
      state.sel = null;

      if (v.type === 'table') {
        var ids = v.ids.filter(passes);
        viewsEl.innerHTML =
          '<div class="crm-view on"><div class="crm-scroll"><table class="crm-table"><thead><tr>' +
          v.cols.map(function (c) { return '<th>' + esc(c[1]) + '</th>'; }).join('') +
          '</tr></thead><tbody>' +
          (ids.length ? ids.map(function (id) {
            var e = ent(id);
            if (!e) return '';
            return '<tr data-id="' + id + '" tabindex="0"><td><b>' + esc(e.title) + '</b></td><td>' + esc(e.sub) + '</td><td>' + chipHtml(e) + '</td></tr>';
          }).join('') : '<tr><td colspan="3" class="crm-muted">Нет записей в этом фильтре</td></tr>') +
          '</tbody></table></div></div>';
      } else if (v.type === 'board') {
        viewsEl.innerHTML =
          '<div class="crm-view on"><div class="crm-board c' + Math.min(v.cols.length, 4) + '">' +
          v.cols.map(function (col) {
            var ids = col.ids.filter(passes);
            return '<div class="crm-col"><header>' + esc(col.h) + '<em>' + ids.length + '</em></header>' +
              (ids.length ? ids.map(function (id) {
                var e = ent(id);
                if (!e) return '';
                return '<article class="crm-card" data-id="' + id + '" tabindex="0"><b>' + esc(e.title) + '</b><span>' + esc(e.sub) + '</span>' + chipHtml(e) + '</article>';
              }).join('') : '<p class="crm-muted">Пусто</p>') +
              '</div>';
          }).join('') + '</div></div>';
      } else if (v.type === 'cal') {
        viewsEl.innerHTML =
          '<div class="crm-view on"><div class="crm-cal">' +
          '<div class="h"></div>' + v.days.map(function (d, i) { return '<div class="h' + (i === 2 ? ' col3' : '') + '">' + esc(d) + '</div>'; }).join('') +
          v.rows.map(function (r) {
            return '<div class="t">' + esc(r.time) + '</div>' + r.cells.map(function (cell, i) {
              var id = cell[0];
              var e = id ? ent(id) : null;
              var html = '';
              if (e && passes(id)) {
                html = '<div class="ev ' + (e.st === 'new' ? 'new' : e.st === 'work' ? 'busy' : '') + '" data-id="' + id + '" tabindex="0">' + esc(e.title) + '<span>' + esc(e.sub.split(' · ')[0]) + '</span></div>';
              }
              return '<div class="' + (i === 2 ? 'col3' : '') + '">' + html + '</div>';
            }).join('');
          }).join('') + '</div></div>';
      } else if (v.type === 'bars') {
        viewsEl.innerHTML =
          '<div class="crm-view on"><div class="crm-bars">' +
          v.rows.map(function (r) {
            return '<div class="crm-bar"><span>' + esc(r[0]) + '</span><u><i style="width:' + Math.max(6, Math.min(100, r[1])) + '%"></i></u><b>' + esc(r[2]) + '</b></div>';
          }).join('') +
          '</div><p class="demo-foot">' + esc(v.note) + '</p></div>';
      }
      renderDetail();
    }

    function select(id) {
      state.sel = id;
      [].slice.call(viewsEl.querySelectorAll('[data-id]')).forEach(function (n) {
        n.classList.toggle('on', n.getAttribute('data-id') === id);
      });
      renderDetail();
    }

    root.addEventListener('click', function (ev) {
      var navBtn = ev.target.closest('.crm-nav button');
      if (navBtn && root.contains(navBtn)) {
        state.view = +navBtn.getAttribute('data-view');
        [].slice.call(root.querySelectorAll('.crm-nav button')).forEach(function (b) {
          var on = b === navBtn;
          b.classList.toggle('on', on);
          if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
        });
        renderView();
        return;
      }
      var tab = ev.target.closest('.crm-tab');
      if (tab) {
        state.filter = tab.getAttribute('data-filter');
        [].slice.call(root.querySelectorAll('.crm-tab')).forEach(function (b) {
          b.setAttribute('aria-selected', String(b === tab));
        });
        renderView();
        return;
      }
      var item = ev.target.closest('[data-id]');
      if (item && root.contains(item)) select(item.getAttribute('data-id'));
    });

    root.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      var item = ev.target.closest('[data-id], .crm-nav button, .crm-tab');
      if (!item) return;
      ev.preventDefault();
      item.click();
    });

    renderView();
  }

  [].slice.call(document.querySelectorAll('.crm[data-crm]')).forEach(function (root) {
    renderCrm(root, CRM[root.getAttribute('data-crm')]);
  });

  /* ------------------------------------------------------------------ *
   *  Traffic-flow scenes
   * ------------------------------------------------------------------ */
  var FLOW = {};

  FLOW.beauty = {
    layout: 'beau',
    base: 1240,
    period: 'мес',
    sources: [
      { n: 'Instagram / Meta', d: 'Показ работ и офферов рядом с салоном.', share: .38 },
      { n: 'Google Ads / Карты', d: 'Поиск услуги и салона по району.', share: .24 },
      { n: 'Organic', d: 'Страницы услуг и мастеров в поиске.', share: .17 },
      { n: 'Social', d: 'Контент мастеров и отзывы клиентов.', share: .11 },
      { n: 'Ретаргетинг', d: 'Возврат тех, кто смотрел услуги и ушёл.', share: .10 }
    ],
    stages: [
      { n: 'Сайт', d: 'Страница салона: услуги, мастера, окна для записи.', conv: 1, metric: 'визитов' },
      { n: 'Услуга', d: 'Клиент открывает процедуру, цену и свободное время.', conv: .42, metric: 'просмотров услуги' },
      { n: 'Запись', d: 'Заявка создаётся сразу с услугой, мастером и контактом.', conv: .31, metric: 'заявок' },
      { n: 'CRM', d: 'Заявка попадает администратору со статусом и источником.', conv: .97, metric: 'заявок в работе' },
      { n: 'Менеджер', d: 'Администратор подтверждает визит и отвечает клиенту.', val: '12 мин', metric: 'среднее время ответа' },
      { n: 'Визит', d: 'Клиент приходит в салон, мастер закрывает визит.', conv: .78, metric: 'визитов' },
      { n: 'Повторный визит', d: 'Система предлагает следующий визит к мастеру.', conv: .46, metric: 'повторных визитов' }
    ]
  };

  FLOW.dentistry = {
    layout: 'arch',
    sources: [
      { n: 'Google Ads', d: 'Запросы по услугам и боли — на страницу направления.' },
      { n: 'Карты', d: 'Клиники рядом: маршрут, часы, отзывы.' },
      { n: 'Organic', d: 'Статьи и страницы лечения в поиске.' },
      { n: 'Social', d: 'Доверие: врачи, оборудование, ответы на вопросы.' },
      { n: 'Ретаргетинг', d: 'Возврат к тем, кто читал про лечение.' }
    ],
    stages: [
      { n: 'Страница услуги', d: 'Объяснение лечения, врачи, показания и запись.' },
      { n: 'Заявка', d: 'Пациент оставляет обращение на консультацию.' },
      { n: 'CRM', d: 'Обращение получает администратор и следующий шаг.' },
      { n: 'Звонок', d: 'Уточнение запроса, подбор врача и времени.' },
      { n: 'Запись', d: 'Приём подтверждён, пациент получает памятку.' },
      { n: 'Приём', d: 'Визит состоялся, план лечения и повторный визит — в CRM.' }
    ]
  };

  FLOW.construction = {
    layout: 'stairs',
    sources: [
      { n: 'Google Ads', d: 'Запросы на ремонт, фасады, дома под ключ.' },
      { n: 'Meta Ads', d: 'Офферы на расчёт и примеры объектов.' },
      { n: 'Organic', d: 'Страницы услуг и статей о технологиях.' },
      { n: 'Карты', d: 'Локальные запросы по городу и району.' },
      { n: 'Ретаргетинг', d: 'Возврат тех, кто смотрел объекты и кейсы.' }
    ],
    stages: [
      { n: 'Landing', d: 'Страница под расчёт: состав работ, объекты, форма.' },
      { n: 'Запрос расчёта', d: 'Заявка с вводными по объекту и задачей.' },
      { n: 'CRM', d: 'Заявка попадает менеджеру с источником и стадией.' },
      { n: 'Квалификация', d: 'Уточнение объёма, сроков и бюджета.' },
      { n: 'Консультация', d: 'Разбор объекта и следующий шаг по проекту.' },
      { n: 'Договор', d: 'Сделка переходит в договор, объект — в работу.' }
    ]
  };

  FLOW.auto = {
    layout: 'lanes',
    sources: [
      { n: 'Google Search', d: 'Срочные запросы: ремонт, диагностика, ТО.' },
      { n: 'Meta Ads', d: 'Услуги и сезонные предложения сервиса.' },
      { n: 'Карты', d: 'Ближайший сервис, маршрут и отзывы.' },
      { n: 'Organic', d: 'Страницы работ и цен — без звонка.' },
      { n: 'Ретаргетинг', d: 'Возврат тех, кто смотрел услугу и ушёл.' }
    ],
    stages: [
      { n: 'Страница услуги', d: 'Работа, сроки, что входит и форма записи.' },
      { n: 'Заявка', d: 'Клиент оставляет запрос на обслуживание.' },
      { n: 'CRM', d: 'Запись получает пост, статус и ответственного.' },
      { n: 'Запись', d: 'Клиент подтверждает время, пост закреплён.' },
      { n: 'Обслуживание', d: 'Статус ремонта и допуслуги — в карточке авто.' },
      { n: 'Повторный визит', d: 'Напоминание о следующем ТО или сезоне.' }
    ]
  };

  FLOW.ecommerce = {
    layout: 'funnel',
    sources: [
      { n: 'Meta Ads', d: 'Каталог и товары для холодной аудитории.' },
      { n: 'Google Shopping', d: 'Спрос с конкретным товаром и ценой.' },
      { n: 'Organic', d: 'Категории и карточки товаров в поиске.' },
      { n: 'Email', d: 'Возврат к брошенной корзине и повторные продажи.' },
      { n: 'Ретаргетинг', d: 'Просмотренные товары и категории.' }
    ],
    stages: [
      { n: 'Каталог', d: 'Категории, фильтры и подборки товаров.' },
      { n: 'Карточка товара', d: 'Фото, состав, доставка и добавление в корзину.' },
      { n: 'Корзина', d: 'Оформление заказа без лишних шагов.' },
      { n: 'Заказ', d: 'Заказ создан и передан в обработку.' },
      { n: 'CRM', d: 'Заказ, покупатель и источник — в одной карточке.' },
      { n: 'Повторная продажа', d: 'Сегменты, напоминания и персональные офферы.' }
    ]
  };

  var THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js';
  var threeState = { loading: false, ready: false, queue: [] };

  function withThree(cb) {
    if (window.THREE) { cb(); return; }
    threeState.queue.push(cb);
    if (threeState.loading) return;
    threeState.loading = true;
    var s = document.createElement('script');
    s.src = THREE_URL;
    s.async = true;
    s.onload = function () {
      threeState.ready = true;
      var q = threeState.queue.slice();
      threeState.queue.length = 0;
      q.forEach(function (fn) { try { fn(); } catch (e) {} });
    };
    s.onerror = function () {
      threeState.queue.length = 0;
      [].slice.call(document.querySelectorAll('.flow-fallback')).forEach(function (f) {
        f.classList.add('on');
        var p = f.querySelector('p');
        if (p) p.textContent = 'Не удалось загрузить 3D-модуль. Схема системы описана в шагах рядом.';
      });
    };
    document.head.appendChild(s);
  }

  var POS = {
    beau: [[-3.05, .05, .3], [-1.9, .62, .8], [-.75, .98, .15], [.4, 1.12, -.6], [1.55, .82, .6], [2.6, .28, -.4], [3.4, -.42, .85]],
    arc: [[-2.5, .1, 0], [-1.0, .7, .4], [.5, 1.15, .1], [2.0, .75, -.3], [3.0, -.1, .1], [3.2, -1.0, .5]],
    arch: [[-2.5, -.2, 0], [-1.1, .2, .3], [.4, .95, .1], [1.8, 1.35, -.2], [2.9, .7, .2], [3.3, -.4, .4]],
    stairs: [[-2.6, 1.2, 0], [-1.2, .55, .3], [.2, 0, .1], [1.6, -.55, -.3], [2.8, -1.15, .1], [3.4, -1.7, .4]],
    lanes: [[-2.6, 0, 0], [-1.2, .55, -.5], [.2, -.4, -.5], [1.6, .55, .5], [2.8, -.4, .5], [3.4, 0, 0]],
    funnel: [[-2.7, -.1, 0], [-1.2, .5, 0], [.3, .85, 0], [1.8, .45, 0], [2.9, -.1, 0], [3.4, -.8, 0]]
  };

  var SOURCE_POS = [[-4.4, 2.15, 1.3], [-4.75, 1.1, .5], [-4.9, 0, .2], [-4.75, -1.1, .7], [-4.4, -2.05, 1.4]];

  var glowTex = null;
  function makeGlow() {
    if (glowTex) return glowTex;
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(122,255,203,.9)');
    grd.addColorStop(.28, 'rgba(25,223,160,.35)');
    grd.addColorStop(1, 'rgba(25,223,160,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    var tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    glowTex = tex;
    return tex;
  }

  function buildFlow(stage, cfg) {
    var canvas = stage.querySelector('canvas');
    var tip = stage.querySelector('.flow-tip');
    var stepsWrap = stage.parentNode.querySelector('.flow-steps');
    var copyWrap = stage.parentNode.querySelector('.flow-copy');
    var hud = stage.querySelector('.flow-chips');

    var three = window.THREE;
    var renderer;
    try {
      renderer = new three.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { return false; }

    var small = window.innerWidth < 760;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.4 : 1.75));
    var scene = new three.Scene();
    scene.fog = new three.FogExp2(0x050807, 0.052);

    var camCfg = small
      ? { x: 0, y: 1.4, z: 11.4, fov: 46 }
      : { x: .2, y: 1.1, z: 8.6, fov: 42 };
    var camera = new three.PerspectiveCamera(camCfg.fov, 1, .1, 60);
    camera.position.set(camCfg.x, camCfg.y, camCfg.z);
    var look = new three.Vector3(.3, 0, 0);
    camera.lookAt(look);

    scene.add(new three.AmbientLight(0x89c9b8, .55));
    var key = new three.DirectionalLight(0x9dffdd, .95);
    key.position.set(-4, 6, 7);
    scene.add(key);
    var rim = new three.PointLight(0x19dfa0, 1.1, 18);
    rim.position.set(2.4, .4, 2);
    scene.add(rim);

    var world = new three.Group();
    scene.add(world);

    var grid = new three.GridHelper(24, 24, 0x0b4232, 0x07231b);
    grid.position.y = -2.6;
    grid.material.transparent = true;
    grid.material.opacity = .5;
    world.add(grid);

    var positions = POS[cfg.layout] || POS.arc;
    var pickables = [];
    var stations = [];

    function glowSprite(color, size) {
      var mat = new three.SpriteMaterial({
        map: makeGlow(), color: color, transparent: true,
        blending: three.AdditiveBlending, depthWrite: false, opacity: .85
      });
      var sp = new three.Sprite(mat);
      sp.scale.set(size, size, 1);
      return sp;
    }

    positions.forEach(function (p, i) {
      var g = new three.Group();
      g.position.set(p[0], p[1], p[2]);
      world.add(g);

      var geo;
      if (i === 0) geo = new three.BoxGeometry(.62, .44, .1);
      else if (i === 1) geo = new three.OctahedronGeometry(.26, 0);
      else if (i === positions.length - 1) geo = new three.TorusGeometry(.27, .055, 8, 34);
      else geo = new three.IcosahedronGeometry(.25, 0);

      var mat = new three.MeshStandardMaterial({
        color: 0x0b3d30, emissive: 0x0f7a58, emissiveIntensity: .85,
        metalness: .85, roughness: .28, flatShading: true
      });
      var mesh = new three.Mesh(geo, mat);
      mesh.userData = { stage: i };
      g.add(mesh);

      var edges = new three.LineSegments(
        new three.EdgesGeometry(geo),
        new three.LineBasicMaterial({ color: 0x7affcb, transparent: true, opacity: .55 })
      );
      g.add(edges);

      var halo = glowSprite(0x19dfa0, i === 0 ? 1.5 : 1.15);
      g.add(halo);

      pickables.push(mesh);
      stations.push({ g: g, mesh: mesh, halo: halo, base: p, edges: edges });
    });

    var sourceNodes = [];
    var sourceLinks = [];
    cfg.sources.forEach(function (s, i) {
      var p = SOURCE_POS[i] || SOURCE_POS[0];
      var g = new three.Group();
      g.position.set(p[0], p[1], p[2]);
      world.add(g);

      var geo = new three.OctahedronGeometry(.16, 0);
      var mat = new three.MeshStandardMaterial({
        color: 0x0d4a39, emissive: 0x0c5f46, emissiveIntensity: .7,
        metalness: .7, roughness: .4, flatShading: true
      });
      var mesh = new three.Mesh(geo, mat);
      mesh.userData = { src: i };
      g.add(mesh);
      g.add(new three.LineSegments(
        new three.EdgesGeometry(geo),
        new three.LineBasicMaterial({ color: 0x7affcb, transparent: true, opacity: .4 })
      ));
      var halo = glowSprite(0x087a58, .75);
      g.add(halo);
      g.scale.setScalar(.92 + i * .03);
      pickables.push(mesh);
      sourceNodes.push({ g: g, mesh: mesh, halo: halo });
    });

    // connections
    function curve(a, b, lift) {
      var mid = new three.Vector3(
        (a.x + b.x) / 2,
        Math.max(a.y, b.y) + (lift == null ? .55 : lift),
        (a.z + b.z) / 2 + .15
      );
      return new three.CatmullRomCurve3([a.clone(), mid, b.clone()]);
    }

    var links = [];
    var siteVec = new three.Vector3(positions[0][0], positions[0][1], positions[0][2]);

    sourceNodes.forEach(function (n, si) {
      var c = curve(n.g.position, siteVec, .35);
      var line = new three.Line(
        new three.BufferGeometry().setFromPoints(c.getPoints(26)),
        new three.LineBasicMaterial({ color: 0x19dfa0, transparent: true, opacity: .18 })
      );
      world.add(line);
      sourceLinks[si] = line;
      links.push({ curve: c, source: true, si: si });
    });

    for (var i = 0; i < positions.length - 1; i++) {
      var a = new three.Vector3(positions[i][0], positions[i][1], positions[i][2]);
      var b = new three.Vector3(positions[i + 1][0], positions[i + 1][1], positions[i + 1][2]);
      var c2 = curve(a, b, .32);
      links.push({ curve: c2, source: false, stage: i });
      var pts2 = c2.getPoints(28);
      world.add(new three.Line(new three.BufferGeometry().setFromPoints(pts2), new three.LineBasicMaterial({
        color: 0x19dfa0, transparent: true, opacity: .22
      })));
    }

    // particles
    var perLink = small ? 16 : 30;
    var total = links.length * perLink;
    var posArr = new Float32Array(total * 3);
    var colArr = new Float32Array(total * 3);
    var meta = [];
    var cA = new three.Color(0x19dfa0);
    var cB = new three.Color(0x7affcb);
    for (var li = 0; li < links.length; li++) {
      for (var k = 0; k < perLink; k++) {
        var idx = li * perLink + k;
        meta.push({ link: li, t: k / perLink, speed: .16 + Math.random() * .14 });
        var col = links[li].source ? cA : cB;
        colArr[idx * 3] = col.r;
        colArr[idx * 3 + 1] = col.g;
        colArr[idx * 3 + 2] = col.b;
      }
    }
    var pGeo = new three.BufferGeometry();
    pGeo.setAttribute('position', new three.BufferAttribute(posArr, 3));
    pGeo.setAttribute('color', new three.BufferAttribute(colArr, 3));
    var pMat = new three.PointsMaterial({
      size: small ? .075 : .058, vertexColors: true, transparent: true,
      opacity: .95, blending: three.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    });
    var points = new three.Points(pGeo, pMat);
    world.add(points);

    var dimCol = new three.Color(0x0d3228);
    function paintParticles(srcIdx) {
      for (var pi = 0; pi < meta.length; pi++) {
        var lk = links[meta[pi].link];
        var on = srcIdx < 0 || !lk.source || lk.si === srcIdx;
        var col = !on ? dimCol : (lk.source ? cA : cB);
        colArr[pi * 3] = col.r;
        colArr[pi * 3 + 1] = col.g;
        colArr[pi * 3 + 2] = col.b;
      }
      pGeo.attributes.color.needsUpdate = true;
    }
    paintParticles(-1);

    // ambient dust
    var dustCount = small ? 110 : 220;
    var dustArr = new Float32Array(dustCount * 3);
    for (var d = 0; d < dustCount; d++) {
      dustArr[d * 3] = (Math.random() - .5) * 15;
      dustArr[d * 3 + 1] = (Math.random() - .5) * 8;
      dustArr[d * 3 + 2] = (Math.random() - .5) * 8;
    }
    var dustGeo = new three.BufferGeometry();
    dustGeo.setAttribute('position', new three.BufferAttribute(dustArr, 3));
    var dust = new three.Points(dustGeo, new three.PointsMaterial({
      color: 0x0f7a58, size: .035, transparent: true, opacity: .5, depthWrite: false
    }));
    world.add(dust);

    // HUD chips + steps
    var hudBar = stage.querySelector('.flow-hud');
    var live = hudBar ? hudBar.querySelector('.flow-live') : null;
    var playBtn = null;
    var chips = [];
    if (hud) {
      hud.innerHTML = cfg.sources.map(function (s, i) {
        return '<button class="flow-chip" type="button" data-src="' + i + '" aria-pressed="false" style="--c:' + ['#19DFA0', '#7AFFCB', '#0f9c74', '#5fe6bb', '#2fb98c'][i % 5] + '">' + s.n + '</button>';
      }).join('');
      chips = [].slice.call(hud.querySelectorAll('.flow-chip'));
      var right = document.createElement('div');
      right.className = 'flow-hud-right';
      if (live) right.appendChild(live);
      playBtn = document.createElement('button');
      playBtn.className = 'flow-play';
      playBtn.type = 'button';
      playBtn.setAttribute('aria-pressed', 'false');
      playBtn.innerHTML = '<span class="flow-play-ico" aria-hidden="true"></span><span class="flow-play-txt">Пауза</span>';
      right.appendChild(playBtn);
      if (hudBar) hudBar.appendChild(right);

      hud.addEventListener('click', function (ev) {
        var chip = ev.target.closest('.flow-chip');
        if (!chip) return;
        var si = +chip.getAttribute('data-src');
        setSource(activeSource === si ? -1 : si);
      });
    }

    function fmtNum(n) {
      return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    function stageMetric(i, srcIdx) {
      var s = cfg.stages[i];
      if (s.val) return s.val;
      if (!cfg.base) return s.metric || '';
      var n = cfg.base;
      if (srcIdx >= 0) {
        var sh = cfg.sources[srcIdx].share;
        n *= (sh != null ? sh : 1 / cfg.sources.length);
      }
      for (var j = 0; j <= i; j++) {
        if (cfg.stages[j].conv != null) n *= cfg.stages[j].conv;
      }
      return fmtNum(Math.max(1, n)) + ' ' + (s.metric || '') + (cfg.period ? ' / ' + cfg.period : '');
    }

    var activeSource = -1;
    var active = -1;

    function renderCopy(i) {
      if (!copyWrap) return;
      var s = cfg.stages[i];
      var met = stageMetric(i, activeSource);
      copyWrap.innerHTML = '<b>' + s.n + '</b><p>' + s.d + '</p>' +
        (met ? '<div class="flow-kpi"><b>' + met + '</b><span>демо-показатель</span></div>' : '') +
        '<em>Этап ' + (i + 1) + ' из ' + cfg.stages.length + ' · данные условные</em>';
    }

    function setActive(i) {
      active = i;
      stations.forEach(function (s, idx) {
        var on = idx === i;
        s.mesh.material.emissiveIntensity = on ? 2.1 : .85;
        s.edges.material.opacity = on ? .95 : .55;
        s.halo.material.opacity = on ? 1 : .8;
        s.g.scale.setScalar(on ? 1.22 : 1);
      });
      if (stepsWrap) {
        [].slice.call(stepsWrap.querySelectorAll('.flow-step')).forEach(function (b, idx) {
          b.setAttribute('aria-pressed', String(idx === i));
        });
      }
      renderCopy(i);
    }

    function setSource(si) {
      activeSource = si;
      sourceNodes.forEach(function (n, idx) {
        var on = si < 0 || idx === si;
        n.mesh.material.emissiveIntensity = on ? 1.15 : .32;
        n.halo.material.opacity = on ? .9 : .22;
        n.g.scale.setScalar((.92 + idx * .03) * (si < 0 ? 1 : (on ? 1.16 : .86)));
      });
      sourceLinks.forEach(function (line, idx) {
        line.material.opacity = si < 0 ? .18 : (idx === si ? .38 : .045);
      });
      paintParticles(si);
      chips.forEach(function (c, idx) {
        c.setAttribute('aria-pressed', String(idx === si));
      });
      if (live) live.textContent = 'demo · ' + (si < 0 ? 'все источники' : cfg.sources[si].n);
      if (active >= 0) renderCopy(active);
      if (!running) draw(0);
    }

    if (stepsWrap) {
      stepsWrap.innerHTML = cfg.stages.map(function (s, i) {
        return '<button class="flow-step" type="button" data-step="' + i + '" aria-pressed="false"><b>' + String(i + 1).padStart(2, '0') + '</b>' + s.n + '</button>';
      }).join('');
      stepsWrap.addEventListener('click', function (ev) {
        var b = ev.target.closest('.flow-step');
        if (b) setActive(+b.getAttribute('data-step'));
      });
    }

    // raycast
    var ray = new three.Raycaster();
    var ndc = new three.Vector2();
    function hitTest(clientX, clientY) {
      var r = canvas.getBoundingClientRect();
      ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      var hits = ray.intersectObjects(pickables, false);
      return hits.length ? hits[0].object : null;
    }

    function showTip(obj, clientX, clientY) {
      if (!tip) return;
      var r = stage.getBoundingClientRect();
      var data, extra = '';
      if (obj.userData.stage != null) {
        data = cfg.stages[obj.userData.stage];
        extra = stageMetric(obj.userData.stage, activeSource) + ' · демо';
      } else {
        data = cfg.sources[obj.userData.src];
        if (data && data.share != null) {
          extra = Math.round(data.share * 100) + '% трафика · демо';
        }
      }
      if (!data) return;
      tip.innerHTML = '<b>' + data.n + '</b><span>' + data.d + '</span>' + (extra ? '<i>' + extra + '</i>' : '');
      tip.style.left = (clientX - r.left) + 'px';
      tip.style.top = (clientY - r.top) + 'px';
      tip.classList.add('show');
    }

    var hoverObj = null;
    canvas.addEventListener('pointermove', function (ev) {
      if (ev.pointerType === 'touch') return;
      hoverObj = hitTest(ev.clientX, ev.clientY);
      canvas.style.cursor = hoverObj ? 'pointer' : '';
      if (hoverObj) showTip(hoverObj, ev.clientX, ev.clientY);
      else if (tip) tip.classList.remove('show');
      if (!running) draw(0);
    });
    canvas.addEventListener('pointerleave', function () {
      hoverObj = null;
      if (tip) tip.classList.remove('show');
    });
    canvas.addEventListener('click', function (ev) {
      var obj = hitTest(ev.clientX, ev.clientY);
      if (!obj) return;
      if (obj.userData.stage != null) setActive(obj.userData.stage);
      else if (obj.userData.src != null) setSource(activeSource === obj.userData.src ? -1 : obj.userData.src);
    });

    // pointer parallax
    var px = 0, py = 0, tx = 0, ty = 0;
    stage.addEventListener('pointermove', function (ev) {
      var r = stage.getBoundingClientRect();
      tx = ((ev.clientX - r.left) / r.width - .5) * 2;
      ty = ((ev.clientY - r.top) / r.height - .5) * 2;
    });
    stage.addEventListener('pointerleave', function () { tx = 0; ty = 0; });

    var running = false, raf = 0, visible = false, clock = 0, animOn = !RM;

    function place() {
      var w = stage.clientWidth, h = stage.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function draw(dt) {
      clock += dt;
      for (var m = 0; m < meta.length; m++) {
        var item = meta[m];
        if (animOn) {
          item.t += dt * item.speed;
          if (item.t > 1) item.t -= 1;
        }
        var link = links[item.link];
        var pt = link.curve.getPoint(item.t);
        posArr[m * 3] = pt.x;
        posArr[m * 3 + 1] = pt.y;
        posArr[m * 3 + 2] = pt.z;
      }
      pGeo.attributes.position.needsUpdate = true;

      if (animOn) {
        px += (tx - px) * .05;
        py += (ty - py) * .05;
        camera.position.x = camCfg.x + px * .55;
        camera.position.y = camCfg.y + py * .28 + Math.sin(clock * .35) * .06;
        camera.lookAt(look);
        world.rotation.y = Math.sin(clock * .12) * .045;
        dust.rotation.y = clock * .012;
        stations.forEach(function (s, idx) {
          if (idx === active) s.g.scale.setScalar(1.2 + Math.sin(clock * 3) * .05);
        });
      }
      renderer.render(scene, camera);
    }

    function loop() {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      draw(1 / 60);
    }

    function start() {
      if (running || !animOn) { draw(0); return; }
      running = true;
      loop();
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function syncPlay() {
      if (!playBtn) return;
      playBtn.setAttribute('aria-pressed', String(animOn));
      var lbl = playBtn.querySelector('.flow-play-txt');
      if (lbl) lbl.textContent = animOn ? 'Пауза' : 'Запуск';
    }

    if (playBtn) {
      playBtn.addEventListener('click', function () {
        animOn = !animOn;
        syncPlay();
        if (animOn) {
          if (visible && !document.hidden) start();
        } else {
          stop();
          draw(0);
        }
      });
    }

    place();
    if (!animOn) draw(0);

    var resizeT;
    window.addEventListener('resize', function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () {
        place();
        if (!running) draw(0);
      }, 150);
    });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          visible = en.isIntersecting;
          if (visible && !document.hidden && animOn) start(); else stop();
        });
      }, { rootMargin: '180px 0px' });
      io.observe(stage);
    } else {
      start();
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (visible) start();
    });

    setActive(0);
    setSource(-1);
    syncPlay();

    window.addEventListener('pagehide', function () {
      stop();
      world.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach(function (m) { m.dispose(); });
          else o.material.dispose();
        }
      });
      pGeo.dispose(); dustGeo.dispose(); pMat.dispose();
      renderer.dispose();
    });

    var fb = stage.querySelector('.flow-fallback');
    if (fb) fb.classList.remove('on');
    stage.classList.add('flow-ready');
    return true;
  }

  [].slice.call(document.querySelectorAll('.flow-stage[data-flow]')).forEach(function (stage) {
    var cfg = FLOW[stage.getAttribute('data-flow')];
    if (!cfg) return;
    var go = function () {
      try { buildFlow(stage, cfg); } catch (e) {}
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.disconnect();
          withThree(go);
        });
      }, { rootMargin: '600px 0px' });
      io.observe(stage);
    } else {
      withThree(go);
    }
  });

  /* ------------------------------------------------------------------ *
   *  Site showcase: scenario chips toggle inside the mini site
   * ------------------------------------------------------------------ */
  [].slice.call(document.querySelectorAll('.site-scenario')).forEach(function (row) {
    var chips = [].slice.call(row.querySelectorAll('[data-scn]'));
    if (!chips.length) return;
    var box = row.closest('.site-side');
    var frames = box ? [].slice.call(box.querySelectorAll('.scn-frame')) : [];
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.toggle('on', c === chip); });
        frames.forEach(function (f) {
          f.hidden = f.getAttribute('data-frame') !== chip.getAttribute('data-scn');
        });
      });
    });
  });
})();
