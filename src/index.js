import { sleep, logger, localStorage, state } from './utils'
import pages from './pages'
import tasks from './tasks'

let mainLoopRunning = false
let hideFullPageOverlayInterval

const switchScriptState = () => {
  state.scriptPaused = !state.scriptPaused
  localStorage.set('scriptPaused', state.scriptPaused)
  tasks.managePanel.updatePanel()

  if (!state.scriptPaused) {
    start()
  } else {
    logger({ msgLevel: 'log', msg: 'Pausing automation' })
  }
}

const mainLoop = async () => {
  if (mainLoopRunning) {
    setTimeout(mainLoop, 1000)
    return
  }

  mainLoopRunning = true

  while (!state.scriptPaused) {
    await tasks.autoPrestige()
    await tasks.autoAncestor()

    const pagesToCheck = Object.keys(pages)
    pagesToCheck.sort((a, b) => {
      return state.lastVisited[pages[a].id] - state.lastVisited[pages[b].id]
    })

    while (!state.scriptPaused && pagesToCheck.length) {
      const pageToCheck = pagesToCheck.shift()

      if (pages[pageToCheck] && pages[pageToCheck].enabled()) {
        const page = pages[pageToCheck]

        if (page) {
          logger({ msgLevel: 'debug', msg: `Executing ${page.id} action` })
          state.lastVisited[page.id] = new Date().getTime()
          localStorage.set('lastVisited', state.lastVisited)
          await page.action()
          await sleep(1000)
        }
      }
    }

    await sleep(1000)
  }

  mainLoopRunning = false
}

const init = async () => {
  tasks.managePanel.createPanel(switchScriptState)
  tasks.manageOptions.createPanel(start)
  tasks.managePanel.updatePanel()

  setInterval(tasks.calculateTTF, 100)
  setInterval(tasks.calculateTippyTTF, 100)

  start()
}

const start = async () => {
  document.querySelector('html').classList.add('dark')
  tasks.managePanel.updatePanel()

  if (!state.scriptPaused) {
    logger({ msgLevel: 'log', msg: 'Starting automation' })

    if (!hideFullPageOverlayInterval) {
      hideFullPageOverlayInterval = setInterval(tasks.hideFullPageOverlay, 100)
    }

    await sleep(2000)

    tasks.autoClicker()
    mainLoop()
  } else {
    clearInterval(hideFullPageOverlayInterval)

    hideFullPageOverlayInterval = null
  }
}

init()
