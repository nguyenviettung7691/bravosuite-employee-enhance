function convertToMinutes(timeString) {
  const timeRegex = /(\d+)h(\d+)m/;
  const match = timeString.match(timeRegex);

  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours * 60 + minutes;
  } else {
    throw new Error("Invalid time format");
  }
}

function getCurrentTimeString() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function parseTimeString(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
}

function convertToMinutesSinceMidnight(time) {
  return time.hours * 60 + time.minutes;
}

function calculateTimeDifference(timeString1, timeString2) {
  const time1 = parseTimeString(timeString1);
  const time2 = parseTimeString(timeString2);

  const minutes1 = convertToMinutesSinceMidnight(time1);
  const minutes2 = convertToMinutesSinceMidnight(time2);

  return Math.abs(minutes1 - minutes2);
}

function calculateRemainTime() {
  setTimeout(function () {
    const originalValueElement = document.querySelector(
      ".weekly-attendance-container__highcharts svg .highcharts-title"
    );
    console.log(originalValueElement)
    if (originalValueElement) {
      const header = document.querySelector(
        ".weekly-attendance-container__header > div"
      );

      let originalValue = convertToMinutes(
        originalValueElement.innerHTML.trim()
      );

      let remainMinute = 2400 - originalValue;
      let remainHour = (remainMinute / 60).toFixed(2);
      let newValueText = ` (Tuần này còn: ${remainMinute} phút = ${remainHour} giờ)`;

      const newValueElement = document.createElement("div");
      newValueElement.style.color = "orange";
      newValueElement.innerText = newValueText;
      header.appendChild(newValueElement);

      const timeCards = document.querySelectorAll(
        ".daily-attendance-container__daily-attendance-card"
      );
      const timeIn = timeCards[0].children[1].innerText.trim();
      const timeOut = timeCards[1].children[1].innerText.trim();
      let lastTime = "";

      if (timeOut.includes(":")) lastTime = timeOut;
      else if (timeIn.includes(":")) lastTime = timeIn;
      console.log(timeIn, timeOut, lastTime);

      const currentTime = getCurrentTimeString();
      console.log(currentTime);

      const differenceInMinutes = calculateTimeDifference(
        lastTime,
        currentTime
      );
      console.log(differenceInMinutes);

      let remainMinuteFromNow = remainMinute - differenceInMinutes;
      let remainHourFromNow = (remainMinuteFromNow / 60).toFixed(2);
      let remainMinuteFromNowText = ` (Bây giờ checkout sẽ còn: ${remainMinuteFromNow} phút = ${remainHourFromNow} giờ)`;

      const fromNowElement = document.createElement("div");
      fromNowElement.style.color = "red";
      fromNowElement.innerText = remainMinuteFromNowText;
      header.appendChild(fromNowElement);
    }
  }, 1000);
}

// Run the function when the content script is loaded
window.addEventListener("load", calculateRemainTime);
