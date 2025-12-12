const timeElement = document.getElementById("time");
const statusElement = document.getElementById("status");
const sessionLog = document.getElementById("session-log");
const buttons = document.querySelectorAll("[data-minutes]");
const goalProgressElement = document.getElementById("goal-progress");
const goalInput = document.getElementById("goal-input");
const goalForm = document.getElementById("goal-form");

let timerId = null;
let remainingSeconds = 0;
let endTime = null;
let activeButton = null;
let goalState = null;

const DEFAULT_GOAL = 4;
const STORAGE_KEY = "focusbuddy-daily";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function loadGoalState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return { goal: DEFAULT_GOAL, progress: 0, date: getTodayDate() };
  }

  try {
    const parsed = JSON.parse(saved);
    const today = getTodayDate();

    if (parsed.date === today) {
      return {
        goal: Number(parsed.goal) || DEFAULT_GOAL,
        progress: Number(parsed.progress) || 0,
        date: today,
      };
    }

    return { goal: Number(parsed.goal) || DEFAULT_GOAL, progress: 0, date: today };
  } catch (error) {
    console.error("Failed to parse saved state", error);
    return { goal: DEFAULT_GOAL, progress: 0, date: getTodayDate() };
  }
}

function saveGoalState() {
  const currentDate = getTodayDate();
  const state = { ...goalState, date: currentDate };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function syncGoalDate() {
  const today = getTodayDate();

  if (goalState.date !== today) {
    goalState.progress = 0;
    goalState.date = today;
  }
}

function updateGoalProgress() {
  syncGoalDate();

  if (goalState.progress >= goalState.goal) {
    goalProgressElement.textContent = "Goal achieved 🎉";
    goalProgressElement.classList.add("achieved");
  } else {
    goalProgressElement.textContent = `${goalState.progress} / ${goalState.goal} sessions today`;
    goalProgressElement.classList.remove("achieved");
  }

  saveGoalState();
}

function setGoal(newGoal) {
  const parsedGoal = Math.max(1, Math.floor(newGoal) || DEFAULT_GOAL);
  goalState.goal = parsedGoal;
  goalInput.value = parsedGoal;
  updateGoalProgress();
}

function recordSessionCompletion() {
  goalState.progress += 1;
  updateGoalProgress();
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function clearTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  endTime = null;
  document.title = "FocusBuddy";

  if (activeButton) {
    activeButton.classList.remove("active");
    activeButton = null;
  }
}

function addSession(minutes) {
  const listItem = document.createElement("li");
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const label = document.createElement("span");
  label.textContent = `${minutes} minute focus`; 

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = `Done @ ${timestamp}`;

  listItem.append(label, badge);
  sessionLog.prepend(listItem);
}

function startTimer(minutes) {
  endTime = Date.now() + minutes * 60 * 1000;
  remainingSeconds = minutes * 60;
  timeElement.textContent = formatTime(remainingSeconds);
  statusElement.textContent = `${minutes}-minute session in progress. Stay focused!`;

  timerId = setInterval(() => {
    const now = Date.now();
    remainingSeconds = Math.max(0, Math.round((endTime - now) / 1000));
    timeElement.textContent = formatTime(remainingSeconds);
    document.title = `${timeElement.textContent} · FocusBuddy`;

    if (remainingSeconds <= 0) {
      clearTimer();
      statusElement.textContent = "Session complete. Great job!";
      addSession(minutes);
      recordSessionCompletion();
    }
  }, 250);

  document.title = `${formatTime(remainingSeconds)} · FocusBuddy`;
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const minutes = Number(button.dataset.minutes);
    clearTimer();
    activeButton?.classList.remove("active");
    button.classList.add("active");
    activeButton = button;

    startTimer(minutes);
  });
});

goalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  setGoal(Number(goalInput.value));
});

goalState = loadGoalState();
goalInput.value = goalState.goal;
updateGoalProgress();
