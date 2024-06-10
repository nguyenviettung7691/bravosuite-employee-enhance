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

function calculateRemainTime() {
  setTimeout(function () {
    const originalValueElement = document.querySelector(
      ".weekly-attendance-container__highcharts svg .highcharts-title"
    );
    if (originalValueElement) {
      let originalValue = convertToMinutes(
        originalValueElement.innerHTML.trim()
      );

      let remainMinute = 2400 - originalValue;
      let remainHour = (remainMinute / 60).toFixed(2);
      let newValueText = ` (Tuần này còn: ${remainMinute} phút = ${remainHour} giờ)`;

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
      let remainMinuteFromNowText = ` (Bây giờ checkout sẽ còn: ${remainMinuteFromNow} phút = ${remainHourFromNow} giờ)`;

      return {
        newValueText,
        remainMinuteFromNowText
      }
    } else {
      calculateRemainTime();
    }
  }, 500);
}

function onLoad() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: calculateRemainTime,
    },
    (results) => {
      if (results && results[0] && results[0].result) {
        const timeObject = results[0].result;
        document.getElementById('remain-minutes').innerText = timeObject.newValueText;
        document.getElementById('remain-minutes-from-now').innerText = timeObject.remainMinuteFromNowText;
      }
    });
  });
}

// Run the function when the content script is loaded
window.addEventListener("load", onLoad);
