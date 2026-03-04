import { useState, useEffect } from 'react'
import ReactApexChart from 'react-apexcharts'
import { Flame, Beef, Wheat, Droplets, Dumbbell, Weight, ChevronDown, ChevronUp, Trophy } from 'lucide-react'
import { getApi } from '../lib/api'
import { useTheme } from '../contexts/ThemeContext'
import { StatCard, ChartCard, CardSkeleton, ChartSkeleton } from '../components/ui'
import type { DailySummary, Meal, Workout, WeightEntry, PersonalRecord } from '../types/fitness'

const TABS = ['Inicio', 'Dieta', 'Gym', 'Cuerpo'] as const
type Tab = typeof TABS[number]

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function pct(consumed: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((consumed / target) * 100))
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const p = pct(value, max)
  return (
    <div className="w-full h-2 rounded-full" style={{ background: 'var(--bg-surface-3)' }}>
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${p}%`, background: color }}
      />
    </div>
  )
}

export function Fitness() {
  const { theme } = useTheme()
  const [tab, setTab] = useState<Tab>('Inicio')
  const [daily, setDaily] = useState<DailySummary | null>(null)
  const [meals, setMeals] = useState<Meal[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [weights, setWeights] = useState<WeightEntry[]>([])
  const [prs, setPrs] = useState<PersonalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null)
  const [expandedWorkout, setExpandedWorkout] = useState<number | null>(null)

  useEffect(() => {
    const api = getApi()
    const d = today()
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)

    Promise.all([
      api.get<DailySummary>(`/fitness/summary/daily/${d}`),
      api.get<Meal[]>(`/fitness/meals?from=${weekAgo}&to=${d}`),
      api.get<Workout[]>(`/fitness/gym/workouts?from=${weekAgo}&to=${d}`),
      api.get<WeightEntry[]>('/fitness/body/weight?limit=30'),
      api.get<PersonalRecord[]>('/fitness/gym/prs'),
    ])
      .then(([da, ml, wk, wt, pr]) => {
        setDaily(da && typeof da === 'object' && 'calories' in da ? da : null)
        setMeals(Array.isArray(ml) ? ml : [])
        setWorkouts(Array.isArray(wk) ? wk : [])
        setWeights(Array.isArray(wt) ? wt : [])
        setPrs(Array.isArray(pr) ? pr : [])
      })
      .catch(() => {
        setDaily(null)
        setMeals([])
        setWorkouts([])
        setWeights([])
        setPrs([])
      })
      .finally(() => setLoading(false))
  }, [])

  const weightChart: ApexCharts.ApexOptions = {
    chart: { type: 'line', background: 'transparent', foreColor: 'var(--text)', toolbar: { show: false } },
    colors: ['var(--accent)'],
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: [...weights].reverse().map(w => w.date) },
    yaxis: { labels: { formatter: (v: number) => `${v.toFixed(1)} kg` } },
    tooltip: { theme: theme === 'dark' ? 'dark' : 'light' },
    grid: { borderColor: 'var(--border)' },
    markers: { size: 3 },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Fitness</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Nutricion, entrenamiento y seguimiento corporal
        </p>
      </div>

      {/* Tab Bar */}
      <div
        className="flex gap-1 p-1 rounded-[var(--radius)]"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium cursor-pointer transition-all duration-150"
            style={{
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? 'var(--text-on-accent)' : 'var(--text-secondary)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Inicio Tab */}
      {tab === 'Inicio' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : daily ? (
            <>
              {/* Calories budget */}
              <div
                className="rounded-[var(--radius)] p-5"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    Calorias del dia
                  </h3>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {daily.calories.remaining > 0
                      ? `${daily.calories.remaining} kcal restantes`
                      : `${Math.abs(daily.calories.remaining)} kcal excedidas`}
                  </span>
                </div>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-3xl font-bold font-mono" style={{ color: 'var(--accent)' }}>
                    {daily.calories.consumed}
                  </span>
                  <span className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                    / {daily.calories.target} kcal
                  </span>
                </div>
                <ProgressBar
                  value={daily.calories.consumed}
                  max={daily.calories.target}
                  color={daily.calories.remaining >= 0 ? 'var(--status-ok)' : 'var(--status-error)'}
                />
              </div>

              {/* Macro cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  label="Proteina"
                  value={`${daily.protein.consumed}g`}
                  icon={Beef}
                  accent="red"
                  subtitle={`Meta: ${daily.protein.target}g (${pct(daily.protein.consumed, daily.protein.target)}%)`}
                />
                <StatCard
                  label="Carbohidratos"
                  value={`${daily.carbs.consumed}g`}
                  icon={Wheat}
                  accent="yellow"
                  subtitle={`Meta: ${daily.carbs.target}g (${pct(daily.carbs.consumed, daily.carbs.target)}%)`}
                />
                <StatCard
                  label="Grasa"
                  value={`${daily.fat.consumed}g`}
                  icon={Droplets}
                  accent="blue"
                  subtitle={`Meta: ${daily.fat.target}g (${pct(daily.fat.consumed, daily.fat.target)}%)`}
                />
              </div>

              {/* Today's meals quick view */}
              {daily.meals.length > 0 && (
                <div
                  className="rounded-[var(--radius)] p-5"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
                    Comidas de hoy
                  </h3>
                  <div className="space-y-2">
                    {daily.meals.map((m: Meal, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 px-3 rounded-[var(--radius-sm)]"
                        style={{ background: 'var(--bg-surface-2)' }}
                      >
                        <span className="text-sm" style={{ color: 'var(--text)' }}>{m.name}</span>
                        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                          {m.calories} kcal
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No se pudieron cargar los datos de fitness.</p>
          )}
        </div>
      )}

      {/* Dieta Tab */}
      {tab === 'Dieta' && (
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          ) : meals.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No hay comidas registradas esta semana.</p>
          ) : (
            meals.map((meal, i) => (
              <div
                key={i}
                className="rounded-[var(--radius)] overflow-hidden"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <button
                  className="w-full flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpandedMeal(expandedMeal === i ? null : i)}
                  style={{ color: 'var(--text)' }}
                >
                  <div className="flex items-center gap-3">
                    <Flame size={16} style={{ color: 'var(--status-warn)' }} />
                    <div className="text-left">
                      <div className="text-sm font-semibold">{meal.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{meal.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {meal.calories} kcal
                    </span>
                    {expandedMeal === i
                      ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />
                      : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                    }
                  </div>
                </button>
                {expandedMeal === i && (
                  <div
                    className="px-4 pb-4 pt-0"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <div className="grid grid-cols-3 gap-4 pt-3">
                      <div>
                        <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Proteina</div>
                        <div className="text-sm font-mono font-bold" style={{ color: 'var(--text)' }}>{meal.protein}g</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Carbos</div>
                        <div className="text-sm font-mono font-bold" style={{ color: 'var(--text)' }}>{meal.carbs}g</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Grasa</div>
                        <div className="text-sm font-mono font-bold" style={{ color: 'var(--text)' }}>{meal.fat}g</div>
                      </div>
                    </div>
                    {meal.items && meal.items.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Items</div>
                        <ul className="space-y-1">
                          {meal.items.map((item, j) => (
                            <li key={j} className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              - {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Gym Tab */}
      {tab === 'Gym' && (
        <div className="space-y-6">
          {/* PRs Section */}
          {!loading && prs.length > 0 && (
            <div
              className="rounded-[var(--radius)] p-5"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={16} style={{ color: 'var(--status-warn)' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  Records Personales
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {prs.map((pr, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 rounded-[var(--radius-sm)]"
                    style={{ background: 'var(--bg-surface-2)' }}
                  >
                    <span className="text-sm" style={{ color: 'var(--text)' }}>{pr.exercise}</span>
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent)' }}>
                      {pr.weight}kg x{pr.reps}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workouts */}
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            ) : workouts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No hay entrenamientos registrados esta semana.</p>
            ) : (
              workouts.map((wk, i) => (
                <div
                  key={i}
                  className="rounded-[var(--radius)] overflow-hidden"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                  <button
                    className="w-full flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => setExpandedWorkout(expandedWorkout === i ? null : i)}
                    style={{ color: 'var(--text)' }}
                  >
                    <div className="flex items-center gap-3">
                      <Dumbbell size={16} style={{ color: 'var(--accent)' }} />
                      <div className="text-left">
                        <div className="text-sm font-semibold">{wk.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{wk.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {wk.duration_min} min — {wk.exercises.length} ejercicios
                      </span>
                      {expandedWorkout === i
                        ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />
                        : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                      }
                    </div>
                  </button>
                  {expandedWorkout === i && (
                    <div
                      className="px-4 pb-4"
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      <div className="space-y-3 pt-3">
                        {wk.exercises.map((ex, j) => (
                          <div key={j}>
                            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{ex.name}</div>
                            <div className="flex flex-wrap gap-2">
                              {ex.sets.map((s, k) => (
                                <span
                                  key={k}
                                  className="text-xs font-mono px-2 py-1 rounded-[var(--radius-sm)]"
                                  style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)' }}
                                >
                                  {s.weight}kg x {s.reps}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Cuerpo Tab */}
      {tab === 'Cuerpo' && (
        <div className="space-y-6">
          {loading ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
              <ChartSkeleton />
            </>
          ) : (
            <>
              {weights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    label="Peso Actual"
                    value={`${weights[0].weight} kg`}
                    icon={Weight}
                    accent="accent"
                    subtitle={weights[0].date}
                  />
                  {weights.length >= 7 && (
                    <StatCard
                      label="Cambio Semanal"
                      value={`${(weights[0].weight - weights[Math.min(6, weights.length - 1)].weight).toFixed(1)} kg`}
                      icon={Weight}
                      accent={weights[0].weight <= weights[Math.min(6, weights.length - 1)].weight ? 'green' : 'red'}
                    />
                  )}
                  {weights.length >= 2 && (
                    <StatCard
                      label="Cambio Total"
                      value={`${(weights[0].weight - weights[weights.length - 1].weight).toFixed(1)} kg`}
                      icon={Weight}
                      accent="blue"
                      subtitle={`desde ${weights[weights.length - 1].date}`}
                    />
                  )}
                </div>
              )}

              {weights.length > 1 ? (
                <ChartCard title="Tendencia de Peso">
                  <ReactApexChart
                    options={weightChart}
                    series={[{ name: 'Peso', data: [...weights].reverse().map(w => w.weight) }]}
                    type="line"
                    height={320}
                  />
                </ChartCard>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No hay suficientes datos de peso para graficar.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
