// ─── 引用库 ────────────────────────────────────────
const QUOTES = {
  love: [
    '"我行过许多地方的桥，看过许多次数的云，喝过许多种类的酒，却只爱过一个正当最好年龄的人。" — 沈从文',
    '"春风十里不如你。" — 冯唐',
    '"爱情不是终日彼此对视，而是共同瞭望同一个方向。" — 《小王子》',
    '"世间所有的相遇，都是久别重逢。" — 《一代宗师》',
    '"一生一世一双人。" — 纳兰性德',
    '"I wish I knew how to quit you." — 《断背山》',
    '"你一笑，我的整个世界都亮了。"'
  ],
  friendship: [
    '"朋友是时间的果实。" — 莎士比亚',
    '"海内存知己，天涯若比邻。" — 王勃',
    '"Friends are the family we choose." — 《老友记》',
    '"山河不足重，重在遇知己。"',
    '"A real friend is one who walks in when the rest of the world walks out."',
    '"友谊是一颗心在两个身体里。" — 亚里士多德',
    '"桃花潭水深千尺，不及汪伦送我情。" — 李白'
  ],
  family: [
    '"家人闲坐，灯火可亲。" — 汪曾祺',
    '"Home is where your story begins."',
    '"Family is not an important thing, it\'s everything." — Michael J. Fox',
    '"树欲静而风不止，子欲养而亲不待。"',
    '"洛阳城里见秋风，欲作家书万意重。" — 张籍',
    '"谁言寸草心，报得三春晖。" — 孟郊',
    '"世界上最大的幸福之一，莫过于家人团聚。温馨的家，是最好的避风港。'
  ],
  birthday: [
    '"愿你在被打击时，记起你的珍贵，抵抗恶意。" — 《熔炉》',
    '"每个生日都是一个新的开始。"',
    '"年龄只是数字，心态才是王道。"',
    '"祝你不负光阴，不负自己。"',
    '"愿你出走半生，归来仍是少年。" — 苏轼（佚名改编）'
  ],
  anniversary: [
    '"愿有岁月可回首，且以深情共白头。" — 冯唐',
    '"Love is not about how many days you\'ve been together. It\'s about how much you love each other every single day."',
    '"执子之手，与子偕老。" — 《诗经》',
    '"珍惜当下，便是最好的纪念。"',
    '"所有值得珍惜的美好，都值得被记住。"'
  ],
  self: [
    '"认识你自己。" — 苏格拉底',
    '"To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment." — Emerson',
    '"人生如逆旅，我亦是行人。" — 苏轼',
    '"做自己的光，不需要太亮，足以挨过黑夜和寒冬就好。"',
    '"成长是一笔交易，用朴素的童真与未经人事的洁白交换长大的勇气。" — 宫崎骏'
  ],
  other: [
    '"每一个日子都是礼物。"',
    '"活在当下，珍惜所有。"',
    '"Tomorrow is another day." — 《乱世佳人》',
    '"生活不止眼前的苟且，还有诗和远方的田野。"',
    '"不乱于心，不困于情，不畏将来，不念过往。" — 丰子恺'
  ]
};

// 兼容旧分类
QUOTES.met = QUOTES.friendship;

// ─── 分类配置 ────────────────────────────────────────

const CATEGORY_INFO = {
  love:       { label: '爱情', emoji: '❤️' },
  friendship: { label: '友情', emoji: '🤝' },
  family:     { label: '亲情', emoji: '👨‍👩‍👧' },
  birthday:   { label: '生日', emoji: '🎂' },
  anniversary:{ label: '纪念日', emoji: '💍' },
  self:       { label: '自我', emoji: '🌟' },
  other:      { label: '其他', emoji: '📌' },
  met:        { label: '友情', emoji: '🤝' }
};

const PASSED_GROUPS = [
  { key: 'love',       mapFrom: ['love', 'anniversary'] },
  { key: 'friendship',  mapFrom: ['friendship', 'met'] },
  { key: 'family',      mapFrom: ['family'] },
  { key: 'self',        mapFrom: ['self', 'birthday', 'other'] }
];

const UPCOMING_GROUPS = [
  { key: 'birthday',    mapFrom: ['birthday'] },
  { key: 'anniversary', mapFrom: ['anniversary', 'love'] },
  { key: 'self',        mapFrom: ['self'] },
  { key: 'other',       mapFrom: ['other', 'friendship', 'family', 'met'] }
];

// ─── 状态 ──────────────────────────────────────────────
let editingId = null;
let editingItem = null;
let celebratedIds = new Set();

// ─── 工具函数 ──────────────────────────────────────

function getRandomQuote(category) {
  const quotes = QUOTES[category] || QUOTES.other;
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
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

// ─── 里程碑检测 ─────────────────────────────────────

const MILESTONES = [100, 365, 1000, 3650, 10000];

function checkMilestones(items) {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  for (const item of items) {
    if (item.days > 0 && MILESTONES.includes(item.days)) {
      const key = `${item.id}-${item.days}-${todayKey}`;
      if (!celebratedIds.has(key)) {
        celebratedIds.add(key);
        showCelebration(item.name, item.days);
        return;
      }
    }
  }
}

function showCelebration(name, days) {
  const el = document.getElementById('celebration');
  const textEl = document.getElementById('celebration-text');
  textEl.textContent = `${name} — ${days}天里程碑！`;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 4500);
}

// ─── Toast ──────────────────────────────────────────────

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2000);
}

// ─── 自定义确认框 ───────────────────────────────────

function showConfirm(msg) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirm-overlay');
    const msgEl = document.getElementById('confirm-msg');
    const okBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');
    msgEl.textContent = msg;
    overlay.classList.add('show');

    function cleanup(result) {
      overlay.classList.remove('show');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onOverlay);
      resolve(result);
    }
    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }
    function onOverlay(e) { if (e.target === overlay) cleanup(false); }
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    overlay.addEventListener('click', onOverlay);
  });
}

// ─── 搜索过滤 ────────────────────────────────────────

let searchTimer = null;

function setupSearch() {
  const input = document.getElementById('search-input');
  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const q = input.value.trim().toLowerCase();
      const activeSection = document.querySelector('.section.active');
      if (!activeSection) return;
      const cardList = activeSection.querySelector('.card-list');
      if (!cardList) return;
      const cards = cardList.querySelectorAll('.card');
      const dividers = cardList.querySelectorAll('.category-divider');
      const groups = cardList.querySelectorAll('.card-group');

      let hasVisible = false;
      cards.forEach((card) => {
        const name = card.querySelector('.card-name')?.textContent.toLowerCase() || '';
        const match = !q || name.includes(q);
        card.classList.toggle('search-hidden', !match);
        if (match) hasVisible = true;
      });

      groups.forEach((g) => {
        const groupCards = g.querySelectorAll('.card:not(.search-hidden)');
        g.classList.toggle('search-hidden', groupCards.length === 0);
      });

      dividers.forEach((div) => {
        const nextGroup = div.nextElementSibling;
        const hidden = !nextGroup || nextGroup.classList.contains('search-hidden');
        div.classList.toggle('search-hidden', hidden && !!q);
      });
    }, 150);
  });
}

// ─── 分组渲染 ─────────────────────────────────────

function renderGroup(listEl, items, type) {
  const groups = type === 'passed' ? PASSED_GROUPS : UPCOMING_GROUPS;

  const buckets = {};
  groups.forEach((g) => (buckets[g.key] = []));

  items.forEach((item) => {
    const cat = item.category;
    for (const g of groups) {
      if (g.mapFrom.includes(cat)) {
        buckets[g.key].push(item);
        return;
      }
    }
    buckets[groups[0]?.key]?.push(item);
  });

  // 每组内按 sortOrder 排序
  groups.forEach((g) => {
    const cards = buckets[g.key];
    if (!cards) return;
    cards.sort((a, b) => (a.sortOrder ?? 999999) - (b.sortOrder ?? 999999));
  });

  let html = '';
  groups.forEach((g) => {
    const cards = buckets[g.key];
    if (!cards || cards.length === 0) return;
    const info = CATEGORY_INFO[g.key] || CATEGORY_INFO.other;
    const cls = g.key;
    html += `<div class="category-divider">${info.emoji} ${info.label}</div>`;
    html += `<div class="card-group" data-type="${type}" data-group="${g.key}">`;
    html += cards.map((item) => cardHTML(item, type, cls)).join('');
    html += `</div>`;
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

    checkMilestones(passed);
    checkMilestones(upcoming);

    // 编辑/删除事件
    document.querySelectorAll('.card-action-btn.edit').forEach((btn) => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); startEdit(Number(btn.dataset.id)); });
    });
    document.querySelectorAll('.card-action-btn.delete').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.id);
        const confirmed = await showConfirm('确定删除这条记录吗？');
        if (!confirmed) return;
        db.remove(id).then(() => { showToast('已删除'); render(); });
      });
    });

    checkNotifications(upcoming);

    // 空状态
    document.querySelectorAll('.section').forEach((section) => {
      const list = section.querySelector('.card-list');
      const empty = section.querySelector('.empty-state');
      if (empty) {
        empty.style.display = list.children.length === 0 ? 'block' : 'none';
      }
    });

    // 初始化排序
    initSortable();
  });
}

// ─── 卡片 HTML（圆形风格） ─────────────────────────

function cardHTML(item, type, groupKey) {
  const cls = groupKey || 'self';
  const isToday = item.days === 0;

  let subtitle;
  if (type === 'passed') {
    subtitle = `${item.dateStr} — 今天`;
  } else {
    subtitle = item.repeat ? `每年 ${item.dateStr.slice(5)}` : item.dateStr;
  }

  let timeHtml;
  if (isToday) {
    timeHtml = '<div class="card-time"><span class="card-time-main">🎉</span><span class="card-time-sub">就是今天</span></div>';
  } else {
    const ymd = formatYMD(item.ymd, type);
    const m = ymd.match(/^(.+?[年月])(.+)$/);
    timeHtml = m
      ? `<div class="card-time"><span class="card-time-main">${m[1]}</span><span class="card-time-sub">${m[2]}</span></div>`
      : `<div class="card-time"><span class="card-time-main">${ymd}</span></div>`;
  }

  const quote = getRandomQuote(item.category);

  return `
    <div class="card card-${cls}" data-id="${item.id}">
      <div class="card-actions">
        <button class="card-action-btn edit" data-id="${item.id}" title="编辑">✎</button>
        <button class="card-action-btn delete" data-id="${item.id}" title="删除">×</button>
      </div>
      <div class="card-inner">
        ${timeHtml}
        <div class="card-name">${item.name}</div>
        <div class="card-date">${subtitle}</div>
        ${item.note ? `<div class="card-note">${item.note}</div>` : ''}
        <div class="card-quote">${quote}</div>
      </div>
    </div>
  `;
}

// ─── 长按排序 ────────────────────────────────────────

function initSortable() {
  document.querySelectorAll('.card-group').forEach((group) => {
    if (group._sortableInited) return;
    group._sortableInited = true;

    let dragEl = null;
    let timer = null;
    let isDragging = false;
    let startY = 0;
    let clone = null;
    let dragOffsetY = 0;

    function onPointerDown(e) {
      const card = e.target.closest('.card');
      if (!card || e.target.closest('.card-action-btn, .card-actions')) return;

      startY = e.clientY;
      dragOffsetY = e.clientY - card.getBoundingClientRect().top;

      timer = setTimeout(() => {
        isDragging = true;
        dragEl = card;
        card.classList.add('dragging');

        clone = document.createElement('div');
        clone.className = 'card drag-clone';
        clone.style.height = card.offsetHeight + 'px';
        clone.style.visibility = 'hidden';
        card.parentNode.insertBefore(clone, card.nextSibling);

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
      }, 500);
    }

    function onPointerMove(e) {
      if (!isDragging || !dragEl) return;
      e.preventDefault();

      const y = e.clientY;
      const parent = dragEl.parentNode;
      const siblings = parent.querySelectorAll('.card:not(.dragging):not(.drag-clone)');

      let inserted = false;
      siblings.forEach((s) => {
        const rect = s.getBoundingClientRect();
        if (y >= rect.top && y <= rect.bottom && !inserted) {
          const mid = rect.top + rect.height / 2;
          if (y < mid) {
            parent.insertBefore(dragEl, s);
          } else {
            parent.insertBefore(dragEl, s.nextSibling);
          }
          // Re-insert clone after dragEl
          parent.insertBefore(clone, dragEl.nextSibling);
          inserted = true;
        }
      });
    }

    function onPointerUp() {
      clearTimeout(timer);
      if (isDragging && dragEl) {
        dragEl.classList.remove('dragging');
        if (clone && clone.parentNode) clone.parentNode.removeChild(clone);

        // 保存新顺序
        const order = [];
        const parent = dragEl.parentNode;
        const cards = parent.querySelectorAll('.card');
        cards.forEach((c, i) => {
          const id = Number(c.dataset.id);
          if (id) order.push({ id, sortOrder: i });
        });
        if (order.length > 0) {
          db.updateSortOrders(order);
        }
      }
      isDragging = false;
      dragEl = null;
      clone = null;
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    }

    group.addEventListener('pointerdown', onPointerDown);
    group.addEventListener('pointerup', onPointerUp);
    group.addEventListener('pointerleave', () => { clearTimeout(timer); });
    group.addEventListener('touchmove', (e) => { if (isDragging) e.preventDefault(); }, { passive: false });

    // 鼠标移动后取消长按
    group.addEventListener('pointermove', (e) => {
      if (timer && !isDragging && Math.abs(e.clientY - startY) > 10) {
        clearTimeout(timer);
        timer = null;
      }
    });
  });
}

// ─── 编辑 ──────────────────────────────────────────────

function startEdit(id) {
  editingId = id;
  db.getAll().then((items) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    editingItem = item;
    document.getElementById('form-title').textContent = '编辑日子';
    document.getElementById('event-name').value = item.name;
    document.getElementById('event-date').value = item.date;
    document.querySelector(`input[name="type"][value="${item.type}"]`).checked = true;
    document.getElementById('event-category').value = item.category;
    document.getElementById('event-repeat').checked = item.repeat || false;
    document.getElementById('event-note').value = item.note || '';
    document.querySelectorAll('input[name="type"]').forEach((r) => r.dispatchEvent(new Event('change')));
    showAddForm();
  });
}

// ─── 表单提交 ─────────────────────────────────────

function handleSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('event-name').value.trim();
  const date = document.getElementById('event-date').value;
  const type = document.querySelector('input[name="type"]:checked').value;
  const category = document.getElementById('event-category').value;
  const repeat = document.getElementById('event-repeat').checked;
  const note = document.getElementById('event-note').value.trim();

  if (!name || !date) { showToast('请填写名称和日期'); return; }

  if (editingId !== null) {
    db.update({ ...editingItem, name, date, type, category, repeat, note }).then(() => {
      editingId = null; editingItem = null; resetForm(); showToast('已更新'); render();
    });
  } else {
    db.add({ name, date, type, category, repeat, note }).then(() => {
      resetForm(); showToast('已添加'); render();
    });
  }
}

function resetForm() {
  hideAddForm();
  document.getElementById('form-title').textContent = '记录新日子';
  document.getElementById('add-form-inner').reset();
  document.getElementById('event-date').valueAsDate = new Date();
}

// ─── 数据导出导入 ──────────────────────────────────────

async function exportData() {
  const json = await db.exportAll();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `重要日子-备份-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('数据已导出');
}

async function importData() {
  const confirmed = await showConfirm('导入将覆盖现有数据，确定继续？');
  if (!confirmed) return;
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.style.display = 'none'; document.body.appendChild(input); input.click();
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) { document.body.removeChild(input); return; }
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('格式错误');
      const count = await db.importAll(data);
      document.body.removeChild(input);
      celebratedIds.clear();
      showToast(`已导入 ${count} 条记录`); render();
    } catch (e) {
      document.body.removeChild(input);
      showToast('导入失败：文件格式不正确');
    }
  };
}

// ─── 暗色模式 ──────────────────────────────────────────

function getPreferredTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getTheme() {
  return localStorage.getItem('theme') || getPreferredTheme();
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  setTheme(current === 'dark' ? 'light' : 'dark');
}

// ─── 反馈提交 ────────────────────────────────────────

function setupFeedback() {
  const submitBtn = document.getElementById('feedback-submit');
  const statusEl = document.getElementById('feedback-status');

  submitBtn.addEventListener('click', async () => {
    const content = document.getElementById('feedback-content').value.trim();

    if (!content) {
      statusEl.textContent = '请填写反馈内容';
      statusEl.style.color = 'var(--crimson)';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '提交中...';
    statusEl.textContent = '';

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();

      if (data.ok) {
        statusEl.textContent = '✅ 感谢你的反馈！';
        statusEl.style.color = 'var(--forest)';
        document.getElementById('feedback-content').value = '';
      } else {
        statusEl.textContent = '❌ ' + (data.error || '提交失败，请稍后再试');
        statusEl.style.color = 'var(--crimson)';
      }
    } catch (err) {
      statusEl.textContent = '❌ 提交失败，请检查网络连接';
      statusEl.style.color = 'var(--crimson)';
    }

    submitBtn.disabled = false;
    submitBtn.textContent = '提交反馈';
  });
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
  if (today.length > 0) body += '今天：' + today.map((item) => item.name).join('、');
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
    editingId = null; editingItem = null;
    document.getElementById('form-title').textContent = '记录新日子';
    hideAddForm();
  });
  document.getElementById('btn-cancel').addEventListener('click', () => {
    editingId = null; editingItem = null;
    document.getElementById('form-title').textContent = '记录新日子';
    hideAddForm();
  });
  document.getElementById('event-date').valueAsDate = new Date();
}
// ─── 启动 ────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  setTheme(getTheme());

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) setTheme(e.matches ? 'dark' : 'light');
  });

  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('btn-export').addEventListener('click', exportData);
  document.getElementById('btn-import').addEventListener('click', importData);

  setupForm();
  render();
  setupSearch();
  setupFeedback();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // 检测到新 SW → 页面接管后自动刷新
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            sw.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  document.getElementById('fab').addEventListener('click', () => {
    editingId = null; editingItem = null;
    document.getElementById('form-title').textContent = '记录新日子';
    showAddForm();
  });

  document.querySelectorAll('.tab-btn').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.section').forEach((s) => s.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('section-' + tab.dataset.tab).classList.add('active');
      const input = document.getElementById('search-input');
      if (input.value.trim()) input.dispatchEvent(new Event('input'));
    });
  });
});
