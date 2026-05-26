// ─── 分类配置 ────────────────────────────────────────

const CATEGORY_INFO = {
  love:       { label: '爱情', emoji: '❤️' },
  friendship: { label: '友情', emoji: '🤝' },
  family:     { label: '亲情', emoji: '👨‍👩‍👧' },
  birthday:   { label: '生日', emoji: '🎂' },
  anniversary:{ label: '纪念日', emoji: '💍' },
  self:       { label: '自我', emoji: '🌟' },
  other:      { label: '其他', emoji: '📌' },
  // 旧数据兼容
  met:        { label: '友情', emoji: '🤝' }
};

// 已过 tab 分组：爱情、友情、亲情、自我
const PASSED_GROUPS = [
  { key: 'love',       mapFrom: ['love', 'anniversary'] },
  { key: 'friendship',  mapFrom: ['friendship', 'met'] },
  { key: 'family',      mapFrom: ['family'] },
  { key: 'self',        mapFrom: ['self', 'birthday', 'other'] }
];

// 还有 tab 分组：生日、纪念日、自我、其他
const UPCOMING_GROUPS = [
  { key: 'birthday',    mapFrom: ['birthday'] },
  { key: 'anniversary', mapFrom: ['anniversary', 'love'] },
  { key: 'self',        mapFrom: ['self'] },
  { key: 'other',       mapFrom: ['other', 'friendship', 'family', 'met'] }
];

// ─── 状态 ──────────────────────────────────────────────
let editingId = null;

// ─── 日期计算 ────────────────────────────────────────

function daysBetween(a, b) {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function parseDate(str) {
  const p = str.split('-');
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

function calcDays(item) {
  const base = parseDate(item.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (item.type === 'passed') {
    const d = daysBetween(base, today);
    return { days: d, dateStr: formatDate(base) };
  } else {
    let target;
    if (item.repeat) {
      target = parseDate(`${today.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`);
      if (target < today) {
        target = parseDate(`${today.getFullYear() + 1}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`);
      }
    } else {
      target = base;
    }
    const d = daysBetween(today, target);
    return { days: d, dateStr: formatDate(base) };
  }
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

// ─── X年X月X天 转换 ──────────────────────────────────

function daysToYMD(days) {
  if (days <= 0) return { years: 0, months: 0, days: 0 };
  const years = Math.floor(days / 365);
  let rem = days % 365;
  const months = Math.floor(rem / 30);
  rem = rem % 30;
  return { years, months, days: rem };
}

function formatYMD(ymd, type) {
  const { years, months, days } = ymd;
  const parts = [];
  if (years > 0) parts.push(`${years}年`);
  if (months > 0) parts.push(`${months}月`);
  if (days > 0 || parts.length === 0) parts.push(`${days}天`);

  const text = parts.join('');
  if (type === 'passed') return `${text}前`;
  return text;
}

// ─── Toast ──────────────────────────────────────────────

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2000);
}

// ─── 分类分组渲染 ─────────────────────────────────────

function renderGroup(listEl, items, type) {
  const groups = type === 'passed' ? PASSED_GROUPS : UPCOMING_GROUPS;

  // 初始化分组桶
  const buckets = {};
  groups.forEach((g) => (buckets[g.key] = []));

  items.forEach((item) => {
    const cat = item.category;
    // 找到该 item 应属的分组
    for (const g of groups) {
      if (g.mapFrom.includes(cat)) {
        buckets[g.key].push(item);
        return;
      }
    }
    // fallback: 放到第一个分组
    buckets[groups[0]?.key]?.push(item);
  });

  let html = '';
  groups.forEach((g) => {
    const cards = buckets[g.key];
    if (!cards || cards.length === 0) return;
    const info = CATEGORY_INFO[g.key] || CATEGORY_INFO.other;
    const cls = g.key;
    html += `<div class="category-divider">${info.emoji} ${info.label}</div>`;
    html += cards.map((item) => cardHTML(item, type, cls)).join('');
  });

  listEl.innerHTML = html;
}

function render() {
  const passedList = document.getElementById('passed-list');
  const upcomingList = document.getElementById('upcoming-list');
  const passedCount = document.getElementById('passed-count');
  const upcomingCount = document.getElementById('upcoming-count');

  db.getAll().then((items) => {
    const passed = [];
    const upcoming = [];

    items.forEach((item) => {
      const { days, dateStr } = calcDays(item);
      if (item.type === 'passed') {
        passed.push({ ...item, days, dateStr, ymd: daysToYMD(days) });
      } else {
        upcoming.push({ ...item, days, dateStr, ymd: daysToYMD(days) });
      }
    });

    passed.sort((a, b) => b.days - a.days);
    upcoming.sort((a, b) => a.days - b.days);

    passedCount.textContent = passed.length;
    upcomingCount.textContent = upcoming.length;

    renderGroup(passedList, passed, 'passed');
    renderGroup(upcomingList, upcoming, 'upcoming');

    document.querySelectorAll('.card-action-btn.edit').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        startEdit(Number(btn.dataset.id));
      });
    });

    document.querySelectorAll('.card-action-btn.delete').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.id);
        if (confirm('确定删除这条记录吗？')) {
          db.remove(id).then(() => {
            showToast('已删除');
            render();
          });
        }
      });
    });

    checkNotifications(upcoming);

    document.querySelectorAll('.section').forEach((section) => {
      const list = section.querySelector('.card-list');
      const empty = section.querySelector('.empty-state');
      if (empty) {
        empty.style.display = list.children.length === 0 ? 'block' : 'none';
      }
    });
  });
}

function cardHTML(item, type, groupKey) {
  const cls = groupKey || 'self';

  let subtitle;
  if (type === 'passed') {
    subtitle = `${item.dateStr} — 今天`;
  } else {
    subtitle = item.repeat ? `每年 ${item.dateStr.slice(5)}` : item.dateStr;
  }

  const displayText = item.days === 0
    ? (type === 'passed' ? '就是今天' : '就是今天')
    : formatYMD(item.ymd, type);

  return `
    <div class="card card-${cls}">
      <div class="card-actions">
        <button class="card-action-btn edit" data-id="${item.id}" title="编辑">✎</button>
        <button class="card-action-btn delete" data-id="${item.id}" title="删除">×</button>
      </div>
      <div class="card-top-row">
        <div class="card-days-wrap">
          <span class="card-days">${displayText}</span>
        </div>
      </div>
      <div class="card-name-wrap">
        <span class="card-name">${item.name}</span>
      </div>
      <div class="card-meta">
        <span class="card-date">
          <span class="card-date-icon">📅</span>
          ${subtitle}
        </span>
      </div>
      ${item.note ? `
        <div class="card-note">
          <span class="card-note-icon">✎</span>
          <span>${item.note}</span>
        </div>
      ` : ''}
    </div>
  `;
}

// ─── 编辑 ──────────────────────────────────────────────

function startEdit(id) {
  editingId = id;
  db.getAll().then((items) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    document.getElementById('form-title').textContent = '编辑日子';
    document.getElementById('event-name').value = item.name;
    document.getElementById('event-date').value = item.date;
    document.querySelector(`input[name="type"][value="${item.type}"]`).checked = true;
    document.getElementById('event-category').value = item.category;
    document.getElementById('event-repeat').checked = item.repeat || false;
    document.getElementById('event-note').value = item.note || '';

    document.querySelectorAll('input[name="type"]').forEach((r) => {
      r.dispatchEvent(new Event('change'));
    });

    showAddForm();
  });
}

// ─── 统一表单提交 ─────────────────────────────────────

function handleSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('event-name').value.trim();
  const date = document.getElementById('event-date').value;
  const type = document.querySelector('input[name="type"]:checked').value;
  const category = document.getElementById('event-category').value;
  const repeat = document.getElementById('event-repeat').checked;
  const note = document.getElementById('event-note').value.trim();

  if (!name || !date) {
    alert('请填写名称和日期');
    return;
  }

  if (editingId !== null) {
    db.update({ id: editingId, name, date, type, category, repeat, note }).then(() => {
      editingId = null;
      resetForm();
      showToast('已更新');
      render();
    });
  } else {
    db.add({ name, date, type, category, repeat, note }).then(() => {
      resetForm();
      showToast('已添加');
      render();
    });
  }
}

function resetForm() {
  hideAddForm();
  document.getElementById('form-title').textContent = '记录新日子';
  document.getElementById('add-form-inner').reset();
  document.getElementById('event-date').valueAsDate = new Date();
}

// ─── 通知 ────────────────────────────────────────────

function checkNotifications(upcoming) {
  if (!('Notification' in window)) return;

  const today = upcoming.filter((item) => item.days === 0);
  const tomorrow = upcoming.filter((item) => item.days === 1);

  if (today.length === 0 && tomorrow.length === 0) return;

  if (Notification.permission === 'granted') {
    sendNotif(today, tomorrow);
  } else if (Notification.permission === 'default') {
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') sendNotif(today, tomorrow);
    });
  }
}

function sendNotif(today, tomorrow) {
  let body = '';
  if (today.length > 0) {
    body += '今天：' + today.map((item) => item.name).join('、');
  }
  if (tomorrow.length > 0) {
    if (body) body += '；';
    body += '明天：' + tomorrow.map((item) => item.name).join('、');
  }
  if (body) {
    new Notification('🐱 重要日子提醒', { body, icon: 'icons/icon-192.png' });
  }
}

// ─── 添加表单 ────────────────────────────────────────

function showAddForm() {
  document.getElementById('modal-overlay').classList.add('show');
  document.getElementById('add-form').classList.add('show');
}

function hideAddForm() {
  document.getElementById('modal-overlay').classList.remove('show');
  document.getElementById('add-form').classList.remove('show');
}

function setupForm() {
  document.getElementById('add-form-inner').addEventListener('submit', handleSubmit);
  document.getElementById('modal-overlay').addEventListener('click', () => {
    editingId = null;
    document.getElementById('form-title').textContent = '记录新日子';
    hideAddForm();
  });
  document.getElementById('btn-cancel').addEventListener('click', () => {
    editingId = null;
    document.getElementById('form-title').textContent = '记录新日子';
    hideAddForm();
  });
  document.getElementById('event-date').valueAsDate = new Date();
}

// ─── 启动 ────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  setupForm();
  render();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }

  document.getElementById('fab').addEventListener('click', () => {
    editingId = null;
    document.getElementById('form-title').textContent = '记录新日子';
    showAddForm();
  });

  document.querySelectorAll('.tab-btn').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.section').forEach((s) => s.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('section-' + tab.dataset.tab).classList.add('active');
    });
  });
});
