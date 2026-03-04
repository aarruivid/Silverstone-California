/* ══════════════════════════════════════════════════════════════════
   Fitness Tracker — SPA Router & View Logic
   ══════════════════════════════════════════════════════════════════ */

const state = {
  currentPage: 'home',
  viewMode: 'weekly',
  selectedDate: todayStr(),
  profile: null,
  charts: {},
};

/* ── Date Helpers ─────────────────────────────────────────────── */

function todayStr() { return new Date().toISOString().split('T')[0]; }

function weekMonday(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  return d.toISOString().split('T')[0];
}

function weekSunday(mondayStr) {
  const d = new Date(mondayStr + 'T12:00:00');
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-ES', { weekday: 'short' });
}

function shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/* ── Navigation ───────────────────────────────────────────────── */

function navigate(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pg = document.getElementById('page-' + page);
  if (pg) pg.classList.add('active');
  if (el) el.classList.add('active');
  else document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
  state.currentPage = page;
  const loaders = { home: loadHome, diet: loadDiet, gym: loadGym, body: loadBody, plan: loadPlan };
  if (loaders[page]) loaders[page]();
}

function toggleView(mode) {
  state.viewMode = mode;
  document.querySelectorAll('.view-toggle button').forEach(b => b.classList.remove('active'));
  document.querySelector(`.view-toggle button[data-mode="${mode}"]`)?.classList.add('active');
  navigate(state.currentPage);
}

function navigateDate(dir) {
  const shift = state.viewMode === 'weekly' ? dir * 7 : dir;
  state.selectedDate = shiftDate(state.selectedDate, shift);
  updateDateDisplay();
  navigate(state.currentPage);
}

function goToToday() {
  state.selectedDate = todayStr();
  updateDateDisplay();
  navigate(state.currentPage);
}

function updateDateDisplay() {
  const el = document.getElementById('date-display');
  if (!el) return;
  if (state.viewMode === 'weekly') {
    const mon = weekMonday(state.selectedDate);
    const sun = weekSunday(mon);
    el.textContent = `${formatDate(mon)} — ${formatDate(sun)}`;
  } else {
    el.textContent = formatDate(state.selectedDate);
  }
}

/* ── Toast ────────────────────────────────────────────────────── */

function showToast(msg, type = 'info') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}

/* ── Chart Helpers ────────────────────────────────────────────── */

function destroyChart(key) {
  if (state.charts[key]) { state.charts[key].destroy(); delete state.charts[key]; }
}

function pct(val, total) { return total > 0 ? Math.round(val / total * 100) : 0; }
function fmtNum(n) { return n != null ? n.toLocaleString('es-ES') : '—'; }

/* ══════════════════════════════════════════════════════════════════
   HOME VIEW
   ══════════════════════════════════════════════════════════════════ */

async function loadHome() {
  const container = document.getElementById('home-content');
  if (!container) return;
  container.innerHTML = '<div class="loading">Cargando...</div>';

  try {
    const dateStr = state.selectedDate;
    if (state.viewMode === 'weekly') {
      const data = await API.weeklySummary(dateStr);
      renderHomeWeekly(container, data);
    } else {
      const data = await API.dailySummary(dateStr);
      const targets = await API.getWeeklyTargets().catch(() => null);
      renderHomeDaily(container, data, targets);
    }
  } catch (e) {
    container.innerHTML = `<div class="error-msg">Error: ${e.message}</div>`;
  }
}

function renderHomeWeekly(el, data) {
  const target = data.targets?.weekly_kcal || (state.profile?.target_kcal_weekly) || 18200;
  const consumed = data.totals?.calories_kcal || 0;
  const pctUsed = pct(consumed, target);
  const budgetClass = pctUsed > 100 ? 'over' : pctUsed > 90 ? 'warn' : 'ok';
  const remaining = data.remaining || {};

  el.innerHTML = `
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">${fmtNum(consumed)}</div>
        <div class="stat-label">kcal consumidas</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${fmtNum(target)}</div>
        <div class="stat-label">objetivo semanal</div>
      </div>
      <div class="stat-card">
        <div class="stat-value ${budgetClass}">${fmtNum(remaining.weekly_remaining_kcal)}</div>
        <div class="stat-label">kcal restantes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${fmtNum(remaining.daily_avg_remaining_kcal)}</div>
        <div class="stat-label">kcal/día restante</div>
      </div>
    </div>

    <div class="card">
      <h3>Presupuesto Semanal</h3>
      <div class="budget-bar-container">
        <div class="budget-bar ${budgetClass}" style="width: ${Math.min(pctUsed, 100)}%"></div>
        <span class="budget-label">${pctUsed}%</span>
      </div>
    </div>

    <div class="card-row">
      <div class="card chart-card">
        <h3>Calorías por Día</h3>
        <canvas id="chart-daily-kcal"></canvas>
      </div>
      <div class="card chart-card">
        <h3>Macros Semana</h3>
        <canvas id="chart-weekly-macros"></canvas>
      </div>
    </div>

    <div class="card">
      <h3>Día a Día</h3>
      <table class="data-table">
        <thead><tr><th>Día</th><th>kcal</th><th>Prot</th><th>Carbs</th><th>Grasa</th></tr></thead>
        <tbody>
          ${(data.day_by_day || []).map(d => `
            <tr class="${d.calories_kcal === 0 ? 'empty-row' : ''}">
              <td>${formatDateShort(d.date)}</td>
              <td>${fmtNum(d.calories_kcal)}</td>
              <td>${fmtNum(d.protein_g)}g</td>
              <td>${fmtNum(d.carbs_g)}g</td>
              <td>${fmtNum(d.fat_g)}g</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Bar chart: daily kcal
  const days = data.day_by_day || [];
  const dailyTarget = target / 7;
  destroyChart('dailyKcal');
  const ctx1 = document.getElementById('chart-daily-kcal');
  if (ctx1) {
    state.charts.dailyKcal = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: days.map(d => formatDateShort(d.date)),
        datasets: [
          { label: 'kcal', data: days.map(d => d.calories_kcal), backgroundColor: '#22c55e88', borderColor: '#22c55e', borderWidth: 1 },
          { label: 'Objetivo', data: days.map(() => Math.round(dailyTarget)), type: 'line', borderColor: '#3b82f6', borderDash: [5, 5], pointRadius: 0, fill: false, borderWidth: 2 }
        ]
      },
      options: { responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } } } }
    });
  }

  // Doughnut: macro split
  const totals = data.totals || {};
  destroyChart('weeklyMacros');
  const ctx2 = document.getElementById('chart-weekly-macros');
  if (ctx2 && (totals.protein_g || totals.carbs_g || totals.fat_g)) {
    state.charts.weeklyMacros = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['Proteína', 'Carbohidratos', 'Grasa'],
        datasets: [{ data: [totals.protein_g || 0, totals.carbs_g || 0, totals.fat_g || 0], backgroundColor: ['#3b82f6', '#22c55e', '#eab308'] }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
    });
  }
}

function renderHomeDaily(el, data, targets) {
  const totals = data.totals || {};
  const dailyTarget = targets?.targets?.daily_kcal || Math.round((state.profile?.target_kcal_weekly || 18200) / 7);
  const pctUsed = pct(totals.calories_kcal || 0, dailyTarget);

  el.innerHTML = `
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">${fmtNum(totals.calories_kcal)}</div>
        <div class="stat-label">kcal hoy</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${fmtNum(dailyTarget)}</div>
        <div class="stat-label">objetivo diario</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${fmtNum(totals.protein_g)}g</div>
        <div class="stat-label">proteína</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totals.meal_count || 0}</div>
        <div class="stat-label">comidas</div>
      </div>
    </div>

    <div class="card">
      <h3>Progreso del Día</h3>
      <div class="budget-bar-container">
        <div class="budget-bar ${pctUsed > 100 ? 'over' : pctUsed > 90 ? 'warn' : 'ok'}" style="width: ${Math.min(pctUsed, 100)}%"></div>
        <span class="budget-label">${pctUsed}%</span>
      </div>
    </div>

    <div class="card-row">
      <div class="card chart-card">
        <h3>Macros Hoy</h3>
        <canvas id="chart-daily-macros"></canvas>
      </div>
      <div class="card">
        <h3>Comidas</h3>
        ${(data.meals || []).length === 0 ? '<p class="empty-state">Sin comidas registradas</p>' :
          (data.meals || []).map(m => `
            <div class="meal-card">
              <div class="meal-header">
                <span class="meal-type">${m.meal_type}</span>
                <span class="meal-desc">${m.description || '—'}</span>
                <span class="meal-kcal">${fmtNum(m.calories_kcal)} kcal</span>
              </div>
            </div>
          `).join('')}
      </div>
    </div>

    ${data.workouts?.length ? `
      <div class="card">
        <h3>Entrenamiento</h3>
        ${data.workouts.map(w => `<div class="workout-entry">${w.exercise_name}: ${w.sets}x${w.reps} @ ${w.weight_kg}kg${w.rpe ? ` RPE ${w.rpe}` : ''}</div>`).join('')}
      </div>
    ` : ''}
  `;

  destroyChart('dailyMacros');
  const ctx = document.getElementById('chart-daily-macros');
  if (ctx && (totals.protein_g || totals.carbs_g || totals.fat_g)) {
    state.charts.dailyMacros = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Proteína', 'Carbohidratos', 'Grasa'],
        datasets: [{ data: [totals.protein_g || 0, totals.carbs_g || 0, totals.fat_g || 0], backgroundColor: ['#3b82f6', '#22c55e', '#eab308'] }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
    });
  }
}

/* ══════════════════════════════════════════════════════════════════
   DIET VIEW
   ══════════════════════════════════════════════════════════════════ */

async function loadDiet() {
  const container = document.getElementById('diet-content');
  if (!container) return;
  container.innerHTML = '<div class="loading">Cargando...</div>';

  try {
    if (state.viewMode === 'weekly') {
      const data = await API.weeklySummary(state.selectedDate);
      renderDietWeekly(container, data);
    } else {
      const data = await API.dailySummary(state.selectedDate);
      renderDietDaily(container, data);
    }
  } catch (e) {
    container.innerHTML = `<div class="error-msg">Error: ${e.message}</div>`;
  }
}

function renderDietDaily(el, data) {
  const totals = data.totals || {};
  const meals = data.meals || [];

  el.innerHTML = `
    <div class="stats-row">
      <div class="stat-card"><div class="stat-value">${fmtNum(totals.calories_kcal)}</div><div class="stat-label">kcal</div></div>
      <div class="stat-card accent-blue"><div class="stat-value">${fmtNum(totals.protein_g)}g</div><div class="stat-label">proteína</div></div>
      <div class="stat-card accent-green"><div class="stat-value">${fmtNum(totals.carbs_g)}g</div><div class="stat-label">carbos</div></div>
      <div class="stat-card accent-yellow"><div class="stat-value">${fmtNum(totals.fat_g)}g</div><div class="stat-label">grasa</div></div>
    </div>

    <div class="card-row">
      <div class="card chart-card">
        <h3>Macros</h3>
        <canvas id="chart-diet-macros"></canvas>
      </div>
      <div class="card">
        <h3>Micronutrientes</h3>
        <table class="data-table compact">
          <tr><td>Fibra</td><td>${fmtNum(totals.fiber_g)}g</td></tr>
          <tr><td>Sodio</td><td>${fmtNum(totals.sodium_mg)}mg</td></tr>
          <tr><td>Azúcar</td><td>${fmtNum(totals.sugar_g)}g</td></tr>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header-row">
        <h3>Comidas</h3>
        <button class="btn btn-primary btn-sm" onclick="showAddMealForm()">+ Añadir Comida</button>
      </div>
      <div id="add-meal-form" class="form-section hidden"></div>
      <div id="meals-list">
        ${meals.length === 0 ? '<p class="empty-state">Sin comidas registradas</p>' :
          meals.map(m => `
            <div class="meal-card" onclick="toggleMealExpand(this, ${m.id})">
              <div class="meal-header">
                <span class="badge badge-${mealTypeBadge(m.meal_type)}">${m.meal_type}</span>
                <span class="meal-desc">${m.description || '—'}</span>
                <span class="meal-kcal">${fmtNum(m.calories_kcal)} kcal</span>
                <span class="meal-macros">${fmtNum(m.protein_g)}P / ${fmtNum(m.carbs_g)}C / ${fmtNum(m.fat_g)}G</span>
                <button class="btn-icon" onclick="event.stopPropagation(); deleteMeal(${m.id})" title="Eliminar">&times;</button>
              </div>
              <div class="meal-details"></div>
            </div>
          `).join('')}
      </div>
    </div>
  `;

  destroyChart('dietMacros');
  const ctx = document.getElementById('chart-diet-macros');
  if (ctx && (totals.protein_g || totals.carbs_g || totals.fat_g)) {
    state.charts.dietMacros = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Proteína', 'Carbohidratos', 'Grasa'],
        datasets: [{ data: [totals.protein_g, totals.carbs_g, totals.fat_g], backgroundColor: ['#3b82f6', '#22c55e', '#eab308'] }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
    });
  }
}

function renderDietWeekly(el, data) {
  const days = data.day_by_day || [];
  const totals = data.totals || {};

  el.innerHTML = `
    <div class="stats-row">
      <div class="stat-card"><div class="stat-value">${fmtNum(totals.calories_kcal)}</div><div class="stat-label">kcal totales</div></div>
      <div class="stat-card accent-blue"><div class="stat-value">${fmtNum(totals.protein_g)}g</div><div class="stat-label">proteína</div></div>
      <div class="stat-card"><div class="stat-value">${totals.days_logged || 0}/7</div><div class="stat-label">días registrados</div></div>
      <div class="stat-card"><div class="stat-value">${totals.meal_count || 0}</div><div class="stat-label">comidas</div></div>
    </div>

    <div class="card-row">
      <div class="card chart-card">
        <h3>Calorías por Día</h3>
        <canvas id="chart-diet-daily"></canvas>
      </div>
      <div class="card chart-card">
        <h3>Macros Semana</h3>
        <canvas id="chart-diet-weekly-macros"></canvas>
      </div>
    </div>

    <div class="card">
      <h3>Detalle Diario</h3>
      <table class="data-table">
        <thead><tr><th>Día</th><th>kcal</th><th>Prot</th><th>Carbs</th><th>Grasa</th><th>Fibra</th></tr></thead>
        <tbody>
          ${days.map(d => `
            <tr class="${d.calories_kcal === 0 ? 'empty-row' : ''}">
              <td>${formatDateShort(d.date)}</td>
              <td>${fmtNum(d.calories_kcal)}</td>
              <td>${fmtNum(d.protein_g)}g</td>
              <td>${fmtNum(d.carbs_g)}g</td>
              <td>${fmtNum(d.fat_g)}g</td>
              <td>${fmtNum(d.fiber_g)}g</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  destroyChart('dietDaily');
  const ctx1 = document.getElementById('chart-diet-daily');
  if (ctx1) {
    state.charts.dietDaily = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: days.map(d => formatDateShort(d.date)),
        datasets: [{ label: 'kcal', data: days.map(d => d.calories_kcal), backgroundColor: '#22c55e88', borderColor: '#22c55e', borderWidth: 1 }]
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } } } }
    });
  }

  destroyChart('dietWeeklyMacros');
  const ctx2 = document.getElementById('chart-diet-weekly-macros');
  if (ctx2 && (totals.protein_g || totals.carbs_g || totals.fat_g)) {
    state.charts.dietWeeklyMacros = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['Proteína', 'Carbohidratos', 'Grasa'],
        datasets: [{ data: [totals.protein_g, totals.carbs_g, totals.fat_g], backgroundColor: ['#3b82f6', '#22c55e', '#eab308'] }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
    });
  }
}

/* ── Diet Actions ─────────────────────────────────────────────── */

function mealTypeBadge(type) {
  const map = { desayuno: 'blue', almuerzo: 'green', cena: 'purple', snack: 'yellow', other: 'gray' };
  return map[type] || 'gray';
}

function showAddMealForm() {
  const form = document.getElementById('add-meal-form');
  if (!form) return;
  form.classList.toggle('hidden');
  if (!form.classList.contains('hidden') && !form.innerHTML.trim()) {
    form.innerHTML = `
      <div class="form-row">
        <div class="form-group">
          <label>Tipo</label>
          <select id="meal-type">
            <option value="desayuno">Desayuno</option>
            <option value="almuerzo" selected>Almuerzo</option>
            <option value="cena">Cena</option>
            <option value="snack">Snack</option>
          </select>
        </div>
        <div class="form-group flex-2">
          <label>Descripción</label>
          <input type="text" id="meal-desc" placeholder="Ej: Pollo con arroz">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group flex-2">
          <label>Buscar Alimento</label>
          <div class="input-with-btn">
            <input type="text" id="food-search" placeholder="Ej: pechuga de pollo">
            <button class="btn btn-sm" onclick="lookupFood()">Buscar</button>
          </div>
        </div>
        <div class="form-group">
          <label>Cantidad (g)</label>
          <input type="number" id="food-qty" value="100" min="1">
        </div>
        <div class="form-group">
          <label>Cocción</label>
          <select id="food-cooking">
            <option value="crudo">Crudo</option>
            <option value="hervido">Hervido</option>
            <option value="vapor">Vapor</option>
            <option value="plancha" selected>Plancha</option>
            <option value="horno">Horno</option>
            <option value="frito">Frito</option>
          </select>
        </div>
      </div>
      <div id="lookup-result" class="hidden"></div>
      <div class="form-row">
        <div class="form-group"><label>kcal</label><input type="number" id="meal-kcal" value="0"></div>
        <div class="form-group"><label>Proteína (g)</label><input type="number" id="meal-prot" value="0"></div>
        <div class="form-group"><label>Carbos (g)</label><input type="number" id="meal-carbs" value="0"></div>
        <div class="form-group"><label>Grasa (g)</label><input type="number" id="meal-fat" value="0"></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="submitMeal()">Guardar Comida</button>
        <button class="btn" onclick="document.getElementById('add-meal-form').classList.add('hidden')">Cancelar</button>
      </div>
    `;
  }
}

async function lookupFood() {
  const query = document.getElementById('food-search')?.value?.trim();
  if (!query) return;
  const resultEl = document.getElementById('lookup-result');
  resultEl.classList.remove('hidden');
  resultEl.innerHTML = '<div class="loading-sm">Buscando...</div>';
  try {
    const data = await API.lookupFood(query);
    resultEl.innerHTML = `
      <div class="lookup-found">
        <strong>${data.food_name}</strong> (${data.data_source})
        <span class="muted">por 100g: ${data.calories_kcal_per_100g} kcal, ${data.protein_g_per_100g}P, ${data.carbs_g_per_100g}C, ${data.fat_g_per_100g}G</span>
      </div>
    `;
    // Auto-fill based on quantity
    const qty = parseFloat(document.getElementById('food-qty')?.value || 100);
    const scale = qty / 100;
    document.getElementById('meal-kcal').value = Math.round(data.calories_kcal_per_100g * scale);
    document.getElementById('meal-prot').value = Math.round(data.protein_g_per_100g * scale);
    document.getElementById('meal-carbs').value = Math.round(data.carbs_g_per_100g * scale);
    document.getElementById('meal-fat').value = Math.round(data.fat_g_per_100g * scale);
  } catch (e) {
    resultEl.innerHTML = '<div class="error-sm">No encontrado — rellena manualmente</div>';
  }
}

async function submitMeal() {
  const data = {
    date: state.selectedDate,
    meal_type: document.getElementById('meal-type')?.value || 'almuerzo',
    description: document.getElementById('meal-desc')?.value || '',
    calories_kcal: parseFloat(document.getElementById('meal-kcal')?.value || 0),
    protein_g: parseFloat(document.getElementById('meal-prot')?.value || 0),
    carbs_g: parseFloat(document.getElementById('meal-carbs')?.value || 0),
    fat_g: parseFloat(document.getElementById('meal-fat')?.value || 0),
    source: 'web_form',
  };
  try {
    await API.createMeal(data);
    showToast('Comida registrada', 'success');
    loadDiet();
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

async function deleteMeal(id) {
  if (!confirm('¿Eliminar esta comida?')) return;
  try {
    await API.deleteMeal(id);
    showToast('Comida eliminada', 'success');
    loadDiet();
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

async function toggleMealExpand(el, mealId) {
  const details = el.querySelector('.meal-details');
  if (el.classList.contains('expanded')) {
    el.classList.remove('expanded');
    details.innerHTML = '';
    return;
  }
  try {
    const meal = await API.getMeal(mealId);
    const items = meal.items || [];
    details.innerHTML = items.length === 0 ? '<p class="empty-state-sm">Sin items detallados</p>' :
      `<table class="data-table compact">
        <thead><tr><th>Alimento</th><th>Cant.</th><th>kcal</th><th>P</th><th>C</th><th>G</th><th>Fuente</th></tr></thead>
        <tbody>${items.map(i => `
          <tr>
            <td>${i.food_name}</td><td>${i.quantity_g}g</td>
            <td>${fmtNum(i.calories_kcal)}</td><td>${fmtNum(i.protein_g)}g</td>
            <td>${fmtNum(i.carbs_g)}g</td><td>${fmtNum(i.fat_g)}g</td>
            <td><span class="badge badge-sm">${i.data_source || '—'}</span></td>
          </tr>
        `).join('')}</tbody>
      </table>`;
    el.classList.add('expanded');
  } catch (e) { details.innerHTML = '<p class="error-sm">Error cargando detalles</p>'; }
}

/* ══════════════════════════════════════════════════════════════════
   GYM VIEW
   ══════════════════════════════════════════════════════════════════ */

async function loadGym() {
  const container = document.getElementById('gym-content');
  if (!container) return;
  container.innerHTML = '<div class="loading">Cargando...</div>';

  try {
    if (state.viewMode === 'weekly') {
      await renderGymWeekly(container);
    } else {
      await renderGymDaily(container);
    }
  } catch (e) {
    container.innerHTML = `<div class="error-msg">Error: ${e.message}</div>`;
  }
}

async function renderGymDaily(el) {
  const dateStr = state.selectedDate;
  const workouts = await API.getWorkouts(dateStr, dateStr);
  const exercises = await API.getExercises();

  const volume = workouts.reduce((s, w) => s + (w.sets * w.reps * w.weight_kg), 0);

  el.innerHTML = `
    <div class="stats-row">
      <div class="stat-card"><div class="stat-value">${workouts.length}</div><div class="stat-label">ejercicios</div></div>
      <div class="stat-card"><div class="stat-value">${fmtNum(Math.round(volume))}</div><div class="stat-label">volumen (kg)</div></div>
    </div>

    <div class="card">
      <div class="card-header-row">
        <h3>Entrenamiento</h3>
        <button class="btn btn-primary btn-sm" onclick="showAddWorkoutForm()">+ Añadir Ejercicio</button>
      </div>
      <div id="add-workout-form" class="form-section hidden"></div>
      <div id="workouts-list">
        ${workouts.length === 0 ? '<p class="empty-state">Sin ejercicios registrados hoy</p>' :
          workouts.map(w => `
            <div class="workout-card">
              <div class="workout-main">
                <span class="workout-name">${w.exercise_name || 'Ejercicio #' + w.exercise_id}</span>
                <span class="workout-detail">${w.sets}×${w.reps} @ ${w.weight_kg}kg</span>
                ${w.rpe ? `<span class="badge badge-rpe">RPE ${w.rpe}</span>` : ''}
                <span class="workout-volume">${fmtNum(w.sets * w.reps * w.weight_kg)} kg vol.</span>
                <button class="btn-icon" onclick="deleteWorkout(${w.id})" title="Eliminar">&times;</button>
              </div>
              ${w.notes ? `<div class="workout-notes">${w.notes}</div>` : ''}
            </div>
          `).join('')}
      </div>
    </div>
  `;

  // Store exercises for the form
  state._exercises = exercises;
}

async function renderGymWeekly(el) {
  const mon = weekMonday(state.selectedDate);
  const sun = weekSunday(mon);
  const [workouts, prs] = await Promise.all([
    API.getWorkouts(mon, sun),
    API.getPRs()
  ]);

  // Group by muscle group
  const byMuscle = {};
  workouts.forEach(w => {
    const mg = w.muscle_group || 'otro';
    if (!byMuscle[mg]) byMuscle[mg] = 0;
    byMuscle[mg] += w.sets * w.reps * w.weight_kg;
  });

  const totalVolume = Object.values(byMuscle).reduce((s, v) => s + v, 0);
  const trainingDays = new Set(workouts.map(w => w.date)).size;

  el.innerHTML = `
    <div class="stats-row">
      <div class="stat-card"><div class="stat-value">${trainingDays}/7</div><div class="stat-label">días entreno</div></div>
      <div class="stat-card"><div class="stat-value">${fmtNum(Math.round(totalVolume))}</div><div class="stat-label">volumen total</div></div>
      <div class="stat-card"><div class="stat-value">${workouts.length}</div><div class="stat-label">ejercicios</div></div>
    </div>

    <div class="card-row">
      <div class="card chart-card">
        <h3>Volumen por Grupo Muscular</h3>
        <canvas id="chart-gym-volume"></canvas>
      </div>
      <div class="card">
        <h3>Records Personales</h3>
        ${prs.length === 0 ? '<p class="empty-state">Sin PRs registrados</p>' :
          prs.slice(0, 10).map(p => `
            <div class="pr-card">
              <span class="pr-name">${p.exercise_name || p.name}</span>
              <span class="pr-weight">${p.max_weight_kg || p.max_weight} kg</span>
              <span class="pr-group badge badge-sm">${p.muscle_group}</span>
            </div>
          `).join('')}
      </div>
    </div>
  `;

  destroyChart('gymVolume');
  const ctx = document.getElementById('chart-gym-volume');
  if (ctx && Object.keys(byMuscle).length > 0) {
    const labels = Object.keys(byMuscle);
    const colors = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7', '#06b6d4', '#f97316'];
    state.charts.gymVolume = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{ label: 'Volumen (kg)', data: labels.map(l => Math.round(byMuscle[l])), backgroundColor: labels.map((_, i) => colors[i % colors.length]) }]
      },
      options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } } } }
    });
  }
}

/* ── Gym Actions ──────────────────────────────────────────────── */

function showAddWorkoutForm() {
  const form = document.getElementById('add-workout-form');
  if (!form) return;
  form.classList.toggle('hidden');
  if (!form.classList.contains('hidden') && !form.innerHTML.trim()) {
    const exercises = state._exercises || [];
    const byGroup = {};
    exercises.forEach(e => {
      if (!byGroup[e.muscle_group]) byGroup[e.muscle_group] = [];
      byGroup[e.muscle_group].push(e);
    });

    form.innerHTML = `
      <div class="form-row">
        <div class="form-group flex-2">
          <label>Ejercicio</label>
          <select id="workout-exercise">
            ${Object.entries(byGroup).map(([grp, exs]) =>
              `<optgroup label="${grp}">${exs.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}</optgroup>`
            ).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Series</label><input type="number" id="workout-sets" value="4" min="1"></div>
        <div class="form-group"><label>Reps</label><input type="number" id="workout-reps" value="10" min="1"></div>
        <div class="form-group"><label>Peso (kg)</label><input type="number" id="workout-weight" value="0" step="0.5"></div>
        <div class="form-group"><label>RPE</label><input type="number" id="workout-rpe" min="1" max="10" placeholder="—"></div>
      </div>
      <div class="form-row">
        <div class="form-group flex-2"><label>Notas</label><input type="text" id="workout-notes" placeholder="Opcional"></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="submitWorkout()">Guardar</button>
        <button class="btn" onclick="document.getElementById('add-workout-form').classList.add('hidden')">Cancelar</button>
      </div>
    `;
  }
}

async function submitWorkout() {
  const data = {
    date: state.selectedDate,
    exercise_id: parseInt(document.getElementById('workout-exercise')?.value),
    sets: parseInt(document.getElementById('workout-sets')?.value || 4),
    reps: parseInt(document.getElementById('workout-reps')?.value || 10),
    weight_kg: parseFloat(document.getElementById('workout-weight')?.value || 0),
    rpe: document.getElementById('workout-rpe')?.value ? parseInt(document.getElementById('workout-rpe').value) : null,
    notes: document.getElementById('workout-notes')?.value || null,
  };
  try {
    await API.createWorkout(data);
    showToast('Ejercicio registrado', 'success');
    loadGym();
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

async function deleteWorkout(id) {
  if (!confirm('¿Eliminar este ejercicio?')) return;
  try {
    await API.deleteWorkout(id);
    showToast('Ejercicio eliminado', 'success');
    loadGym();
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

/* ══════════════════════════════════════════════════════════════════
   BODY VIEW
   ══════════════════════════════════════════════════════════════════ */

async function loadBody() {
  const container = document.getElementById('body-content');
  if (!container) return;
  container.innerHTML = '<div class="loading">Cargando...</div>';

  try {
    const [weightLog, photos] = await Promise.all([
      API.getWeightLog(52),
      API.getPhotos()
    ]);
    renderBody(container, weightLog, photos);
  } catch (e) {
    container.innerHTML = `<div class="error-msg">Error: ${e.message}</div>`;
  }
}

function renderBody(el, weightLog, photos) {
  const latest = weightLog[0];
  const profile = state.profile || {};
  const targetBF = profile.goal_body_fat_pct || 12;
  const projection = projectWeeksToGoal(weightLog, targetBF, profile.height_cm);

  el.innerHTML = `
    <div class="stats-row">
      <div class="stat-card"><div class="stat-value">${latest ? latest.weight_kg + ' kg' : '—'}</div><div class="stat-label">último peso</div></div>
      <div class="stat-card"><div class="stat-value">${latest?.body_fat_pct ? latest.body_fat_pct + '%' : '—'}</div><div class="stat-label">grasa corporal</div></div>
      <div class="stat-card"><div class="stat-value">${weightLog.length}</div><div class="stat-label">mediciones</div></div>
      <div class="stat-card"><div class="stat-value">${projection ? projection + ' sem' : '—'}</div><div class="stat-label">est. al objetivo</div></div>
    </div>

    <div class="card">
      <div class="card-header-row">
        <h3>Registrar Peso</h3>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Peso (kg)</label><input type="number" id="body-weight" step="0.1" value="${latest?.weight_kg || ''}" placeholder="73.5"></div>
        <div class="form-group"><label>Grasa %</label><input type="number" id="body-bf" step="0.1" placeholder="Opcional"></div>
        <div class="form-group"><label>Notas</label><input type="text" id="body-notes" placeholder="Opcional"></div>
        <div class="form-group form-actions-inline"><button class="btn btn-primary" onclick="submitWeight()">Guardar</button></div>
      </div>
    </div>

    <div class="card chart-card">
      <h3>Tendencia de Peso</h3>
      <canvas id="chart-weight-trend"></canvas>
    </div>

    ${photos.length > 0 ? `
      <div class="card">
        <h3>Fotos de Progreso</h3>
        <div class="photo-grid">
          ${photos.map(p => `<div class="photo-item"><img src="/data/photos/${p.file_path}" alt="${p.date}"><span>${p.date}</span></div>`).join('')}
        </div>
      </div>
    ` : ''}
  `;

  // Weight trend chart
  destroyChart('weightTrend');
  const ctx = document.getElementById('chart-weight-trend');
  if (ctx && weightLog.length > 0) {
    const sorted = [...weightLog].reverse();
    state.charts.weightTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: sorted.map(w => w.date),
        datasets: [
          { label: 'Peso (kg)', data: sorted.map(w => w.weight_kg), borderColor: '#3b82f6', backgroundColor: '#3b82f622', fill: true, tension: 0.3, pointRadius: 3 },
          ...(sorted.some(w => w.body_fat_pct) ? [{ label: 'Grasa %', data: sorted.map(w => w.body_fat_pct), borderColor: '#ef4444', borderDash: [5, 5], yAxisID: 'bf', pointRadius: 2, tension: 0.3 }] : [])
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
          x: { ticks: { color: '#94a3b8', maxTicksLimit: 12 }, grid: { color: '#1e293b' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' }, title: { display: true, text: 'kg', color: '#94a3b8' } },
          ...(sorted.some(w => w.body_fat_pct) ? { bf: { position: 'right', ticks: { color: '#ef4444' }, grid: { display: false }, title: { display: true, text: '%', color: '#ef4444' } } } : {})
        }
      }
    });
  }
}

function projectWeeksToGoal(weightLog, targetBF, heightCm) {
  if (weightLog.length < 3) return null;
  const recent = weightLog.slice(0, 8);
  if (!recent[0]?.body_fat_pct) {
    // Fallback: use weight trend towards a lean mass target
    const weeklyChange = (recent[recent.length - 1].weight_kg - recent[0].weight_kg) / recent.length;
    if (weeklyChange >= 0) return null;
    // Estimate target weight for target BF%
    const leanMass = recent[0].weight_kg * (1 - (recent[0].body_fat_pct || 21) / 100);
    const targetWeight = leanMass / (1 - targetBF / 100);
    const remaining = recent[0].weight_kg - targetWeight;
    if (remaining <= 0) return null;
    return Math.ceil(remaining / Math.abs(weeklyChange));
  }
  const weeklyBFChange = (recent[recent.length - 1].body_fat_pct - recent[0].body_fat_pct) / recent.length;
  if (weeklyBFChange >= 0) return null;
  const remaining = recent[0].body_fat_pct - targetBF;
  if (remaining <= 0) return null;
  return Math.ceil(remaining / Math.abs(weeklyBFChange));
}

async function submitWeight() {
  const weight = parseFloat(document.getElementById('body-weight')?.value);
  if (!weight) { showToast('Ingresa un peso válido', 'error'); return; }
  const data = {
    date: state.selectedDate,
    weight_kg: weight,
    body_fat_pct: document.getElementById('body-bf')?.value ? parseFloat(document.getElementById('body-bf').value) : null,
    notes: document.getElementById('body-notes')?.value || null,
  };
  try {
    await API.logWeight(data);
    showToast('Peso registrado', 'success');
    // Update profile weight only if logging for today
    if (state.selectedDate === todayStr()) {
      await API.updateProfile({ weight_kg: weight });
    }
    state.profile = await API.getProfile();
    loadBody();
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

/* ══════════════════════════════════════════════════════════════════
   PLAN & GOALS VIEW
   ══════════════════════════════════════════════════════════════════ */

async function loadPlan() {
  const container = document.getElementById('plan-content');
  if (!container) return;
  container.innerHTML = '<div class="loading">Cargando...</div>';

  try {
    const [profile, targets, reminders] = await Promise.all([
      API.getProfile(),
      API.getWeeklyTargets().catch(() => null),
      API.getReminders().catch(() => [])
    ]);
    state.profile = profile;
    renderPlan(container, profile, targets, reminders);
  } catch (e) {
    container.innerHTML = `<div class="error-msg">Error: ${e.message}</div>`;
  }
}

function renderPlan(el, profile, targets, reminders) {
  const t = targets?.targets || {};
  const fatMass = profile.weight_kg * (profile.body_fat_pct || 21) / 100;
  const leanMass = profile.weight_kg - fatMass;
  const goalFatMass = leanMass / (1 - (profile.goal_body_fat_pct || 12) / 100) * ((profile.goal_body_fat_pct || 12) / 100);
  const fatToLose = fatMass - goalFatMass;

  el.innerHTML = `
    <div class="stats-row">
      <div class="stat-card"><div class="stat-value">${profile.weight_kg} kg</div><div class="stat-label">peso actual</div></div>
      <div class="stat-card"><div class="stat-value">${profile.body_fat_pct || '—'}%</div><div class="stat-label">grasa actual</div></div>
      <div class="stat-card accent-green"><div class="stat-value">${profile.goal_body_fat_pct || 12}%</div><div class="stat-label">objetivo grasa</div></div>
      <div class="stat-card accent-blue"><div class="stat-value">${fatToLose > 0 ? fatToLose.toFixed(1) + ' kg' : '—'}</div><div class="stat-label">grasa por perder</div></div>
    </div>

    <div class="card-row">
      <div class="card">
        <h3>Perfil & Objetivos</h3>
        <div class="form-row">
          <div class="form-group"><label>Peso (kg)</label><input type="number" id="plan-weight" step="0.1" value="${profile.weight_kg}"></div>
          <div class="form-group"><label>Grasa % actual</label><input type="number" id="plan-bf" step="0.1" value="${profile.body_fat_pct || ''}"></div>
          <div class="form-group"><label>Grasa % objetivo</label><input type="number" id="plan-goal-bf" step="0.1" value="${profile.goal_body_fat_pct || 12}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>TDEE (kcal)</label><input type="number" id="plan-tdee" value="${profile.tdee_kcal || 2950}"></div>
          <div class="form-group"><label>Proteína g/kg</label><input type="number" id="plan-prot" step="0.1" value="${profile.protein_g_per_kg || 2.0}"></div>
          <div class="form-group"><label>Edad</label><input type="number" id="plan-age" value="${profile.age || 23}"></div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" onclick="updatePlanProfile()">Guardar Cambios</button>
          <button class="btn" onclick="recalcTargets()">Recalcular Objetivos</button>
        </div>
      </div>

      <div class="card chart-card">
        <h3>Distribución de Macros</h3>
        <canvas id="chart-plan-macros"></canvas>
        <div class="macro-legend">
          <span>Proteína: ${t.daily_protein_g || '—'}g/día</span>
          <span>Carbos: ${t.daily_carbs_g || '—'}g/día</span>
          <span>Grasa: ${t.daily_fat_g || '—'}g/día</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Objetivos Semanales</h3>
      <div class="targets-grid">
        <div class="target-item"><span class="target-label">Calorías semanales</span><span class="target-value">${fmtNum(t.weekly_kcal)} kcal</span></div>
        <div class="target-item"><span class="target-label">Calorías diarias</span><span class="target-value">${fmtNum(t.daily_kcal)} kcal</span></div>
        <div class="target-item"><span class="target-label">Proteína semanal</span><span class="target-value">${fmtNum(t.weekly_protein_g)}g</span></div>
        <div class="target-item"><span class="target-label">Carbohidratos semanal</span><span class="target-value">${fmtNum(t.weekly_carbs_g)}g</span></div>
        <div class="target-item"><span class="target-label">Grasa semanal</span><span class="target-value">${fmtNum(t.weekly_fat_g)}g</span></div>
      </div>
    </div>

    <div class="card">
      <h3>Composición Corporal</h3>
      <div class="body-comp">
        <div class="comp-bar">
          <div class="comp-lean" style="width: ${pct(leanMass, profile.weight_kg)}%">
            <span>Masa Magra: ${leanMass.toFixed(1)} kg</span>
          </div>
          <div class="comp-fat" style="width: ${pct(fatMass, profile.weight_kg)}%">
            <span>Grasa: ${fatMass.toFixed(1)} kg</span>
          </div>
        </div>
      </div>
    </div>

    ${reminders.length > 0 ? `
      <div class="card">
        <h3>Recordatorios</h3>
        ${reminders.map(r => `
          <div class="reminder-item">
            <span class="reminder-type badge">${r.type}</span>
            <span class="reminder-msg">${r.message}</span>
            <span class="reminder-time">${r.day_of_week === -1 ? 'Diario' : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][r.day_of_week]} ${r.time}</span>
            <span class="reminder-status ${r.enabled ? 'on' : 'off'}">${r.enabled ? 'Activo' : 'Inactivo'}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;

  destroyChart('planMacros');
  const ctx = document.getElementById('chart-plan-macros');
  if (ctx && t.daily_protein_g) {
    state.charts.planMacros = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Proteína', 'Carbohidratos', 'Grasa'],
        datasets: [{ data: [t.daily_protein_g * 4, t.daily_carbs_g * 4, t.daily_fat_g * 9], backgroundColor: ['#3b82f6', '#22c55e', '#eab308'] }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
    });
  }
}

async function updatePlanProfile() {
  const data = {
    weight_kg: parseFloat(document.getElementById('plan-weight')?.value),
    body_fat_pct: parseFloat(document.getElementById('plan-bf')?.value) || null,
    goal_body_fat_pct: parseFloat(document.getElementById('plan-goal-bf')?.value) || 12,
    tdee_kcal: parseInt(document.getElementById('plan-tdee')?.value),
    protein_g_per_kg: parseFloat(document.getElementById('plan-prot')?.value),
    age: parseInt(document.getElementById('plan-age')?.value),
  };
  try {
    await API.updateProfile(data);
    state.profile = await API.getProfile();
    showToast('Perfil actualizado', 'success');
    loadPlan();
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

async function recalcTargets() {
  try {
    const result = await API.recalculateTargets();
    showToast(`TDEE: ${result.tdee || result.tdee_kcal} kcal — Objetivos recalculados`, 'success');
    state.profile = await API.getProfile();
    loadPlan();
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

/* ══════════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════════ */

(async () => {
  try {
    state.profile = await API.getProfile();
  } catch (e) {
    console.warn('Could not load profile:', e);
  }
  updateDateDisplay();
  loadHome();
})();
