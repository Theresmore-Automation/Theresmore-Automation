import { sleep, logger, localStorage, state, runMigrations, CONSTANTS } from './utils'
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
    tasks.cosmetics.removeToasts()
    await tasks.autoPrestige()
    await tasks.autoAncestor()

    const pagesToCheck = []
    Object.keys(state.options.pages).forEach((page) => {
      if (state.options.pages[page].enabled) {
        if (pages[page]) {
          pagesToCheck.push(page)
        }

        if (state.options.pages[page].subpages) {
          Object.keys(state.options.pages[page].subpages).forEach((subpage) => {
            if (state.options.pages[page].subpages[subpage].enabled) {
              if (pages[page + subpage]) {
                pagesToCheck.push(page + subpage)
              }
            }
          })
        }
      }
    })
    pagesToCheck.sort((a, b) => {
      return state.lastVisited[a] - state.lastVisited[b]
    })

    while (!state.scriptPaused && pagesToCheck.length) {
      const pageToCheck = pagesToCheck.shift()

      if (pages[pageToCheck] && pages[pageToCheck].enabled()) {
        const page = pages[pageToCheck]

        if (page) {
          logger({ msgLevel: 'debug', msg: `Executing page ${page.page} ${page.subpage ? page.subpage : ''} action` })
          state.lastVisited[pageToCheck] = new Date().getTime()
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
  tasks.manageStyles.appendStyles()
  tasks.managePanel.createPanel(switchScriptState)
  tasks.manageOptions.createPanel(start)
  tasks.managePanel.updatePanel()

  setInterval(tasks.calculateTTF, 100)
  setInterval(tasks.calculateTippyTTF, 100)

  start()
}

const start = async () => {
  runMigrations()
  document.querySelector('html').classList.add('dark')
  tasks.managePanel.updatePanel()

  if (!state.scriptPaused) {
    logger({ msgLevel: 'log', msg: 'Starting automation' })

    if (!hideFullPageOverlayInterval) {
      clearInterval(hideFullPageOverlayInterval)
      hideFullPageOverlayInterval = setInterval(tasks.cosmetics.hideFullPageOverlay, 1000)
    }

    await sleep(2000)

    mainLoop()

    await sleep(5000)
    tasks.autoClicker()
  } else {
    if (!hideFullPageOverlayInterval) {
      clearInterval(hideFullPageOverlayInterval)
    }
  }
}

init()
