const formatTime = (timeToFormat) => {
  const timeValues = {
    seconds: 0,
    minutes: 0,
    hours: 0,
    days: 0,
  }

  let timeShort = ''
  let timeLong = ''

  timeValues.seconds = timeToFormat % 60
  timeToFormat = (timeToFormat - (timeToFormat % 60)) / 60
  timeValues.minutes = timeToFormat % 60
  timeToFormat = (timeToFormat - (timeToFormat % 60)) / 60
  timeValues.hours = timeToFormat % 24
  timeToFormat = (timeToFormat - (timeToFormat % 24)) / 24
  timeValues.days = timeToFormat

  if (timeValues.days) {
    timeShort += `${timeValues.days}d `
    timeLong += `${timeValues.days} days `
  }
  if (timeValues.hours) {
    timeShort += `${timeValues.hours}h `
    timeLong += `${timeValues.hours} hrs `
  }
  if (timeValues.minutes) {
    timeShort += `${timeValues.minutes}m `
    timeLong += `${timeValues.minutes} min `
  }
  if (timeValues.seconds) {
    timeShort += `${timeValues.seconds}s `
    timeLong += `${timeValues.seconds} sec `
  }

  timeShort = timeShort.trim()
  timeLong = timeLong.trim()

  return {
    timeShort,
    timeLong,
    timeValues,
  }
}

export default formatTime
