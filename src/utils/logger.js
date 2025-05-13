const logger = ({ msgLevel, msg }) => {
  const logText = `[TA][${new Date().toLocaleTimeString()}] ${msg}`
  const levelsToLog = ['log', 'warn', 'error']

  if (levelsToLog.includes(msgLevel)) {
    const logHolder = document.querySelector('#root > div > div > div > div.w-full.order-2.flex-grow.overflow-x-hidden.overflow-y-auto.pr-4')

    if (logHolder) {
      const taLogs = [...logHolder.querySelectorAll('.ta-log')]
      if (taLogs.length > 10) {
        for (let i = 10; i < taLogs.length; i++) {
          taLogs[i].remove()
        }
      }

      const p = document.createElement('p')
      p.classList.add('text-xs', 'mb-2', 'text-green-600', 'ta-log')
      p.innerText = logText
      logHolder.insertAdjacentElement('afterbegin', p)
    }
  }

  console[msgLevel](logText)
}

export default logger
