const STORE_KEY = "fitnessNutritionTracker-v1";

const state = loadState();

const workoutForm = document.getElementById("workout-form");
const mealForm = document.getElementById("meal-form");
const workoutList = document.getElementById("workout-list");
const mealList = document.getElementById("meal-list");

const statMinutes = document.getElementById("stat-minutes");
const statBurned = document.getElementById("stat-burned");
const statEaten = document.getElementById("stat-eaten");
const statNet = document.getElementById("stat-net");
const statProtein = document.getElementById("stat-protein");
const statCarbs = document.getElementById("stat-carbs");
const statFat = document.getElementById("stat-fat");

workoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const workout = {
    name: document.getElementById("workout-name").value.trim(),
    duration: Number(document.getElementById("workout-duration").value),
    calories: Number(document.getElementById("workout-calories").value),
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };

  state.workouts.push(workout);
  persistAndRender();
  workoutForm.reset();
});

mealForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const meal = {
    name: document.getElementById("meal-name").value.trim(),
    calories: Number(document.getElementById("meal-calories").value),
    protein: Number(document.getElementById("meal-protein").value),
    carbs: Number(document.getElementById("meal-carbs").value),
    fat: Number(document.getElementById("meal-fat").value),
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };

  state.meals.push(meal);
  persistAndRender();
  mealForm.reset();
});

document.getElementById("reset-btn").addEventListener("click", () => {
  state.workouts = [];
  state.meals = [];
  persistAndRender();
});

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { workouts: [], meals: [] };

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.workouts) || !Array.isArray(parsed.meals)) {
      return { workouts: [], meals: [] };
    }

    return parsed;
  } catch {
    return { workouts: [], meals: [] };
  }
}

function persistAndRender() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
  render();
}

function render() {
  renderList(
    workoutList,
    state.workouts,
    (w) => `${w.time} • ${w.name} — ${w.duration} min, ${w.calories} kcal burned`,
    "No workouts logged yet."
  );

  renderList(
    mealList,
    state.meals,
    (m) => `${m.time} • ${m.name} — ${m.calories} kcal (${m.protein}P/${m.carbs}C/${m.fat}F)`,
    "No meals logged yet."
  );

  const totals = {
    minutes: sum(state.workouts, "duration"),
    burned: sum(state.workouts, "calories"),
    eaten: sum(state.meals, "calories"),
    protein: sum(state.meals, "protein"),
    carbs: sum(state.meals, "carbs"),
    fat: sum(state.meals, "fat")
  };

  statMinutes.textContent = String(totals.minutes);
  statBurned.textContent = String(totals.burned);
  statEaten.textContent = String(totals.eaten);
  statNet.textContent = String(totals.eaten - totals.burned);
  statProtein.textContent = `${totals.protein}g`;
  statCarbs.textContent = `${totals.carbs}g`;
  statFat.textContent = `${totals.fat}g`;
}

function renderList(container, items, formatter, emptyText) {
  container.innerHTML = "";

  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = emptyText;
    container.append(li);
    return;
  }

  [...items].reverse().forEach((item) => {
    const li = document.createElement("li");
    li.textContent = formatter(item);
    container.append(li);
  });
}

function sum(items, key) {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0);
}

render();
