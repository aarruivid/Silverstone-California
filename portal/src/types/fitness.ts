export interface MacroInfo {
  consumed: number
  target: number
}

export interface DailySummary {
  date: string
  calories: { consumed: number; target: number; remaining: number }
  protein: MacroInfo
  carbs: MacroInfo
  fat: MacroInfo
  meals: Meal[]
  workouts: Workout[]
}

export interface WeeklySummary {
  start: string
  end: string
  avg_calories: number
  avg_protein: number
  days: DailySummary[]
  workouts_count: number
}

export interface Meal {
  name: string
  time: string
  calories: number
  protein: number
  carbs: number
  fat: number
  items?: string[]
}

export interface Workout {
  name: string
  date: string
  duration_min: number
  exercises: Exercise[]
}

export interface Exercise {
  name: string
  sets: { reps: number; weight: number }[]
}

export interface WeightEntry {
  date: string
  weight: number
}

export interface PersonalRecord {
  exercise: string
  weight: number
  reps: number
  date: string
}
