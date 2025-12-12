const timeElement = document.getElementById("time");
const statusElement = document.getElementById("status");
const sessionLog = document.getElementById("session-log");
const buttons = document.querySelectorAll("[data-minutes]");

let timerId = null;
let remainingSeconds = 0;

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
  clearTimer();
  remainingSeconds = minutes * 60;
  timeElement.textContent = formatTime(remainingSeconds);
  statusElement.textContent = "Stay focused!";

  timerId = setInterval(() => {
    remainingSeconds -= 1;
    timeElement.textContent = formatTime(Math.max(remainingSeconds, 0));

    if (remainingSeconds <= 0) {
      clearTimer();
      statusElement.textContent = "Session complete. Great job!";
      addSession(minutes);
    }
  }, 1000);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const minutes = Number(button.dataset.minutes);
    startTimer(minutes);
  });
});
