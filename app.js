const storageKeys = {
  workouts: "fitnessTrackerWorkouts",
  meals: "fitnessTrackerMeals",
};

const state = {
  workouts: loadItems(storageKeys.workouts),
  meals: loadItems(storageKeys.meals),
};

const workoutForm = document.getElementById("workoutForm");
const mealForm = document.getElementById("mealForm");
const workoutList = document.getElementById("workoutList");
const mealList = document.getElementById("mealList");

const caloriesBurnedEl = document.getElementById("caloriesBurned");
const caloriesConsumedEl = document.getElementById("caloriesConsumed");
const netCaloriesEl = document.getElementById("netCalories");

workoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const exercise = document.getElementById("exercise").value.trim();
  const duration = Number(document.getElementById("duration").value);
  const burned = Number(document.getElementById("burned").value);

  if (!exercise || duration <= 0 || burned < 0) {
    return;
  }

  state.workouts.push({
    id: crypto.randomUUID(),
    exercise,
    duration,
    calories: burned,
  });

  persist();
  workoutForm.reset();
  render();
});

mealForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const food = document.getElementById("food").value.trim();
  const quantity = document.getElementById("quantity").value.trim();
  const consumed = Number(document.getElementById("consumed").value);

  if (!food || !quantity || consumed < 0) {
    return;
  }

  state.meals.push({
    id: crypto.randomUUID(),
    food,
    quantity,
    calories: consumed,
  });

  persist();
  mealForm.reset();
  render();
});

workoutList.addEventListener("click", (event) => {
  if (event.target.matches("button[data-delete-workout]")) {
    const id = event.target.getAttribute("data-delete-workout");
    state.workouts = state.workouts.filter((workout) => workout.id !== id);
    persist();
    render();
  }
});

mealList.addEventListener("click", (event) => {
  if (event.target.matches("button[data-delete-meal]")) {
    const id = event.target.getAttribute("data-delete-meal");
    state.meals = state.meals.filter((meal) => meal.id !== id);
    persist();
    render();
  }
});

function render() {
  renderWorkouts();
  renderMeals();
  renderSummary();
}

function renderWorkouts() {
  if (state.workouts.length === 0) {
    workoutList.innerHTML = "<li>No workouts logged yet.</li>";
    return;
  }

  workoutList.innerHTML = state.workouts
    .map(
      (workout) => `
        <li>
          <span><strong>${escapeHtml(workout.exercise)}</strong> · ${workout.duration} min · ${workout.calories} kcal</span>
          <button type="button" data-delete-workout="${workout.id}">Delete</button>
        </li>
      `
    )
    .join("");
}

function renderMeals() {
  if (state.meals.length === 0) {
    mealList.innerHTML = "<li>No meals logged yet.</li>";
    return;
  }

  mealList.innerHTML = state.meals
    .map(
      (meal) => `
        <li>
          <span><strong>${escapeHtml(meal.food)}</strong> · ${escapeHtml(meal.quantity)} · ${meal.calories} kcal</span>
          <button type="button" data-delete-meal="${meal.id}">Delete</button>
        </li>
      `
    )
    .join("");
}

function renderSummary() {
  const burned = sumCalories(state.workouts);
  const consumed = sumCalories(state.meals);
  const net = consumed - burned;

  caloriesBurnedEl.textContent = burned;
  caloriesConsumedEl.textContent = consumed;
  netCaloriesEl.textContent = net;
  netCaloriesEl.style.color = net <= 0 ? "#136f3c" : "#b22222";
}

function sumCalories(items) {
  return items.reduce((total, item) => total + Number(item.calories || 0), 0);
}

function loadItems(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(storageKeys.workouts, JSON.stringify(state.workouts));
  localStorage.setItem(storageKeys.meals, JSON.stringify(state.meals));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

render();
