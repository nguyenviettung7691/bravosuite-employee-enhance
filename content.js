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
    if (originalValueElement) {
      const header = document.querySelector(
        ".weekly-attendance-container__header > div"
      );

      let originalValue = convertToMinutes(
        originalValueElement.innerHTML.trim()
      );

      let annualLeave = 0
      const weekdayContainersTimelogs = document.querySelectorAll('.weekly-attendance-container__day-card .flex-fill .mt-1 .d-flex div')
      weekdayContainersTimelogs.forEach(element => {
        if(element.innerText.trim() == "AL") annualLeave += 480
      })

      if(annualLeave > 0) {
        const annualLeaveHours = (annualLeave / 60).toFixed(2)
        const annualLeaveDays = (annualLeaveHours / 8).toFixed(2)
        const alElement = document.createElement("div");
        alElement.style.color = "blue";
        alElement.innerText = `Trừ ngày phép: ${annualLeave} phút = ${annualLeaveHours} giờ = ${annualLeaveDays} ngày`;
        header.appendChild(alElement);
      }

      let remainMinute = 2400 - originalValue - annualLeave;
      let remainHour = (remainMinute / 60).toFixed(2);
      let remainDays = (remainHour / 8).toFixed()
      let newValueText = (remainMinute > 0) ? `Tuần này còn: ${remainMinute} phút = ${remainHour} giờ = ${remainDays} ngày` : 'Tuần này đủ giờ rồi mấy ní';

      const newValueElement = document.createElement("div");
      newValueElement.style.color = (remainMinute > 0) ? "red" : "green";
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

      const currentTime = getCurrentTimeString();

      const differenceInMinutes = calculateTimeDifference(
        lastTime,
        currentTime
      );

      let remainMinuteFromNow = remainMinute - differenceInMinutes;
      let remainHourFromNow = (remainMinuteFromNow / 60).toFixed(2);
      let remainDaysFromNow = remainHourFromNow / 8
      let remainMinuteFromNowText = (remainMinuteFromNow > 0) ? `Bây giờ checkout sẽ còn: ${remainMinuteFromNow} phút = ${remainHourFromNow} giờ = ${remainDaysFromNow} ngày` : 'Bây giờ checkout sẽ đủ giờ nha mấy ní';

      const fromNowElement = document.createElement("div");
      fromNowElement.style.color = (remainMinuteFromNow > 0) ? "orange" : "green";
      fromNowElement.innerText = remainMinuteFromNowText;
      header.appendChild(fromNowElement);
    } else {
      calculateRemainTime();
    }
  }, 1000);
}

// Run the function when the content script is loaded
window.addEventListener("load", calculateRemainTime);
