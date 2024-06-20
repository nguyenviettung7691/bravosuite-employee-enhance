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

function convertMinutesToHours(minutes) {
  // Calculate hours
  const hours = Math.floor(minutes / 60);
  // Calculate remaining minutes
  const remainingMinutes = minutes % 60;
  return `${hours} giờ ${remainingMinutes} phút`
}

function addMinutesToCurrentTime(minutesToAdd) {
  // Get the current date and time
  const currentDate = new Date();
  
  // Add the minutes to the current date
  currentDate.setMinutes(currentDate.getMinutes() + minutesToAdd);
  
  // Get the new hours and minutes
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  
  // Format the hours and minutes as "HH:MM"
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  return `${formattedHours}:${formattedMinutes}`;
}

function isTimeAfter(inputTime, referenceTime = "20:00") {
  // Parse the input time and reference time
  const [inputHours, inputMinutes] = inputTime.split(':').map(Number);
  const [refHours, refMinutes] = referenceTime.split(':').map(Number);
  
  // Compare hours first
  if (inputHours > refHours) {
      return true;
  } else if (inputHours < refHours) {
      return false;
  } else {
      // If hours are the same, compare minutes
      return inputMinutes > refMinutes;
  }
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
      let annualLeaveMinutes = 0
      const weekdayContainersTimelogs = document.querySelectorAll('.weekly-attendance-container__day-card .flex-fill .mt-1 .d-flex div')
      weekdayContainersTimelogs.forEach(element => {
        if(["AL", "WFH", "WFA"].includes(element.innerText.trim())) annualLeaveMinutes += 480
      })
      if(annualLeaveMinutes > 0) {
        const annualLeaveHours = convertMinutesToHours(annualLeaveMinutes)
        const annualLeaveDays = (annualLeaveMinutes / (8*60)).toFixed(2)
        const alElement = document.createElement("div");
        alElement.style.color = "blue";
        alElement.innerText = `Trừ ngày phép: ${annualLeaveMinutes} phút = ${annualLeaveHours} = ${annualLeaveDays} ngày`;
        header.appendChild(alElement);
      }

      let remainMinute = 2400 - originalValue - annualLeaveMinutes;
      let remainHour = convertMinutesToHours(remainMinute)
      let remainDays = (remainMinute / (8*60)).toFixed(2)
      let newValueText = (remainMinute > 0) ? `Tuần này còn: ${remainMinute} phút = ${remainHour} = ${remainDays} ngày` : 'Tuần này đủ giờ rồi mấy ní';
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
      let remainHourFromNow = convertMinutesToHours(remainMinuteFromNow)
      let remainDaysFromNow = (remainMinuteFromNow / (8*60)).toFixed(2)
      const hasRemainMinute = remainMinuteFromNow > 0;
      let remainMinuteFromNowText = hasRemainMinute ? `Bây giờ checkout sẽ còn: ${remainMinuteFromNow} phút = ${remainHourFromNow} = ${remainDaysFromNow} ngày` : 'Bây giờ checkout sẽ đủ giờ nha mấy ní';
      const fromNowElement = document.createElement("div");
      fromNowElement.style.color = hasRemainMinute ? "orange" : "green";
      fromNowElement.innerText = remainMinuteFromNowText;
      header.appendChild(fromNowElement);

      let remainMinuteInOneDay = remainMinuteFromNow < (60 * 10)
      const checkoutTime = (hasRemainMinute && remainMinuteInOneDay) ? addMinutesToCurrentTime(remainMinuteFromNow) : 0
      if(checkoutTime) {
        const checkoutTimeElement = document.createElement("div");
        checkoutTimeElement.style.color = "purple";
        checkoutTimeElement.innerText = isTimeAfter(checkoutTime) ? 'Hôm nay không kịp đủ giờ tuần này đâu, ngày mai đi làm tiếp' : `Sẽ đủ giờ khi checkout lúc ${checkoutTime} hôm nay`;
        header.appendChild(checkoutTimeElement);
      }

    } else {
      calculateRemainTime();
    }
  }, 1000);
}

// Run the function when the content script is loaded
window.addEventListener("load", calculateRemainTime);
