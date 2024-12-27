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
  return (time.hours * 60) + time.minutes;
}

function calculateTimeDifference(timeString1, timeString2) {
  const time1 = parseTimeString(timeString1);
  const time2 = parseTimeString(timeString2);

  const minutes1 = convertToMinutesSinceMidnight(time1);
  const minutes2 = convertToMinutesSinceMidnight(time2);

  let lunchBreakOffset = 0;
  if((time1.hours < 13) && (time2.hours > 13)) lunchBreakOffset = 60

  return minutes2 - lunchBreakOffset - minutes1;
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

function isTimeInRange(timeString) {
  const time = parseTimeString(timeString)
  return time.hours >= 7 && time.hours <= 20;
}


function calculateRemainTime() {
  setTimeout(function () {
    const originalValueElement = document.querySelector(
      ".weekly-attendance-container__highcharts svg .highcharts-title"
    );
    if (originalValueElement) {
      const WEEKLY_MINUTES_REQUIRE = 2400;
      const DAILY_MINUTES_REQUIRE = 480;

      const header = document.querySelector(
        ".weekly-attendance-container__header > div"
      );

      let originalValue = convertToMinutes(
        originalValueElement.innerHTML.trim()
      );
      let accumulatedValue = originalValue;

      // Annual Leave
      let annualLeaveMinutes = 0
      const weekdayContainersTimelogs = document.querySelectorAll('.weekly-attendance-container__day-card .flex-fill .mt-1 .d-flex div')
      weekdayContainersTimelogs.forEach(element => {
        let elementTxt = element.innerText.trim()
        if(["AL", "WFH", "WFA"].includes(elementTxt)) annualLeaveMinutes += DAILY_MINUTES_REQUIRE
        else if(elementTxt.includes("AL/") || elementTxt.includes("WFH/") || elementTxt.includes("WFA/")) {
          annualLeaveMinutes += (DAILY_MINUTES_REQUIRE / 2)

          let [type, time] = elementTxt.split("/")
          if(Number(time) > 4) {
            accumulatedValue -= ((Number(time) * 60) - 240).toFixed(0)
          }
        }
      })
      if(annualLeaveMinutes > 0) {
        const annualLeaveHours = convertMinutesToHours(annualLeaveMinutes)
        const annualLeaveDays = (annualLeaveMinutes / (DAILY_MINUTES_REQUIRE)).toFixed(2)
        const alElement = document.createElement("div");
        alElement.style.color = "blue";
        alElement.innerText = `Trừ ngày phép: ${annualLeaveMinutes} phút = ${annualLeaveHours} = ${annualLeaveDays} ngày`;
        header.appendChild(alElement);
      }

      // Holiday
      let holidayMinutes = 0
      const holidayContainers = document.querySelectorAll('.umbrella-with-color-icon.weekly-attendance-container__umbrella-icon')
      holidayContainers.forEach(element => {
        holidayMinutes += DAILY_MINUTES_REQUIRE
      })
      if(holidayMinutes > 0) {
        const holidayHours = convertMinutesToHours(holidayMinutes)
        const holidayDays = (holidayMinutes / (DAILY_MINUTES_REQUIRE)).toFixed(2)
        const holidayElement = document.createElement("div")
        holidayElement.style.color = "turquoise";
        holidayElement.innerText = `Trừ ngày lễ: ${holidayMinutes} phút = ${holidayHours} = ${holidayDays} ngày`;
        header.appendChild(holidayElement);
      }

      // Remain time
      let remainMinute = WEEKLY_MINUTES_REQUIRE - accumulatedValue - annualLeaveMinutes - holidayMinutes;
      let remainHour = convertMinutesToHours(remainMinute)
      let remainDays = (remainMinute / (DAILY_MINUTES_REQUIRE)).toFixed(2)
      let newValueText = (remainMinute > 0) ? `Tuần này còn phải tích luỹ: ${remainMinute} phút = ${remainHour} = ${remainDays} ngày` : 'Tuần này đã tích lũy đủ giờ rồi mấy ní!';
      const newValueElement = document.createElement("div");
      newValueElement.style.color = (remainMinute > 0) ? "red" : "green";
      newValueElement.innerText = newValueText;
      header.appendChild(newValueElement);

      // Today minimum-maximum time
      const dailyContainerElement = document.querySelector('.time-sheet-container__daily-attendance-section');
      const dailyLeaveTextContainerElement = document.querySelector('.daily-attendance-container__daily-quote-text');
      const dailyLeaveText = dailyLeaveTextContainerElement ? dailyLeaveTextContainerElement.innerText.trim() : '';
      const dailyLeaveType = dailyLeaveText.includes("Have a productive day at work") ? "HalfLeave" : ["Happy holiday","Enjoy your leave day"].includes(dailyLeaveText) ? "FullLeave" : "";

      // Check timelogs (timeIn, timeOut, lastTime)
      const timeCards = document.querySelectorAll(".daily-attendance-container__daily-attendance-card");
      let timeIn = timeCards[0].children[1].innerText.trim();
      let timeOut = timeCards[1].children[1].innerText.trim();
      let lastTime = 0;
      if (timeOut.includes(":")) lastTime = timeOut;
      else if (timeIn.includes(":")) lastTime = timeIn;
      if(lastTime == 0) {
        const noCheckinElement = document.createElement("div");
        noCheckinElement.style.color = "red";
        noCheckinElement.innerText = 'Chưa có giờ checkin kìa! Hôm nay có quên checkin ko?'
        header.appendChild(noCheckinElement);
        return;
      } else if(dailyLeaveType.includes("HalfLeave")){
        if(calculateTimeDifference(lastTime, "13:00")) lastTime = "13:00"
        if(calculateTimeDifference(timeIn, "13:00")) timeIn = "13:00"
        if(calculateTimeDifference(timeOut, "13:00")) timeOut = "13:00"
      }

      const currentTime = getCurrentTimeString();
      const todayMinutes = calculateTimeDifference(timeIn, currentTime);
      const minimumHoursADay = dailyLeaveType.includes("FullLeave") ? 0 : dailyLeaveType.includes("HalfLeave") ? 4 : 6;
      const miniumMinutesADay = 60 * minimumHoursADay;
      let todayMiniumReached = todayMinutes > miniumMinutesADay;
      let todayMiniumText = todayMiniumReached ? `Bây giờ checkout sẽ đủ ${minimumHoursADay} giờ tối thiểu hôm nay` : `Lúc này chưa đủ ${minimumHoursADay} giờ tối thiểu hôm nay, còn ${convertMinutesToHours(miniumMinutesADay - todayMinutes)}`;
      const todayMiniumEl = document.createElement("div");
      todayMiniumEl.style.color = todayMiniumReached ? "green" : "red";
      todayMiniumEl.innerText = todayMiniumText;
      dailyContainerElement.appendChild(todayMiniumEl);

      const maximumHoursADay = 10;
      const maximumMinutesADay = 60 * maximumHoursADay;
      let todayMaximumReached = todayMinutes > maximumMinutesADay;
      let todayMaximumText = todayMaximumReached ? `Lúc này đã quá ${maximumHoursADay} giờ tối đa hôm nay! Về đi thôi!` : `Còn ${convertMinutesToHours(maximumMinutesADay - todayMinutes)} nữa là đến ${maximumHoursADay} giờ tối đa hôm nay`;
      const todayMaximumEl = document.createElement("div");
      todayMaximumEl.style.color = todayMaximumReached ? "red" : "green";
      todayMaximumEl.innerText = todayMaximumText;
      dailyContainerElement.appendChild(todayMaximumEl);

      const todayHours = convertMinutesToHours(todayMaximumReached ? maximumMinutesADay : todayMinutes);
      const todayMinutesEl = document.createElement("div");
      todayMinutesEl.style.color = todayMiniumReached && !todayMaximumReached ? "green" : "red";
      todayMinutesEl.innerText = `Bây giờ checkout sẽ tích luỹ ${todayHours} cho hôm nay`;
      dailyContainerElement.appendChild(todayMinutesEl);

      // Calculate Remain time when checkout now
      const differenceInMinutes = calculateTimeDifference(lastTime, currentTime);
      let remainMinuteFromNow = remainMinute - differenceInMinutes;
      let remainHourFromNow = convertMinutesToHours(remainMinuteFromNow)
      let remainDaysFromNow = (remainMinuteFromNow / (DAILY_MINUTES_REQUIRE)).toFixed(2)
      const hasRemainMinute = remainMinuteFromNow > 0;
      let remainMinuteFromNowText = hasRemainMinute ? `Bây giờ checkout sẽ còn: ${remainMinuteFromNow} phút = ${remainHourFromNow} = ${remainDaysFromNow} ngày` : 'Bây giờ checkout sẽ đủ giờ nha mấy ní';
      const fromNowElement = document.createElement("div");
      fromNowElement.style.color = hasRemainMinute ? "orange" : "green";
      fromNowElement.innerText = remainMinuteFromNowText;
      header.appendChild(fromNowElement);

      // Calculate minimum checkout time today to satisfied this week timelog
      let remainMinuteInOneDay = remainMinuteFromNow < (60 * 10)
      const checkoutTime = (hasRemainMinute && remainMinuteInOneDay) ? addMinutesToCurrentTime(remainMinuteFromNow) : 0
      if(checkoutTime) {
        const checkoutTimeElement = document.createElement("div");
        checkoutTimeElement.style.color = "purple";
        checkoutTimeElement.innerText = isTimeInRange(checkoutTime) ? `Sẽ đủ giờ khi checkout lúc ${checkoutTime} hôm nay` : '';
        header.appendChild(checkoutTimeElement);
      }

      // Weekly timelog info
      const weeklyInfo = document.createElement("em");
      weeklyInfo.style.color = "grey";
      weeklyInfo.style.fontStyle = "italic";
      weeklyInfo.style.fontSize = "14px";
      weeklyInfo.innerText = `Mỗi tuần phải tích luỹ đủ ${WEEKLY_MINUTES_REQUIRE} phút = ${WEEKLY_MINUTES_REQUIRE / 60} giờ`;
      header.appendChild(weeklyInfo);

    } else {
      calculateRemainTime();
    }
  }, 1000);
}

// Run the function when the content script is loaded
window.addEventListener("load", calculateRemainTime);
