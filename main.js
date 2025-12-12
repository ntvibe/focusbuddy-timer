const timeElement = document.getElementById("time");
const statusElement = document.getElementById("status");
const sessionLog = document.getElementById("session-log");
const buttons = document.querySelectorAll("[data-minutes]");

let timerId = null;
let remainingSeconds = 0;
let endTime = null;
let activeButton = null;

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
