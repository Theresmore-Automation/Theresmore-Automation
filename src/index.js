import { sleep, logger, localStorage, state, resources } from './utils'
import pages from './pages'
import tasks from './tasks'

let mainLoopRunning = false
let routineTasksInterval
let fastTasksInterval

const switchScriptState = () => {
  state.scriptPaused = !state.scriptPaused
  localStorage.set('scriptPaused', state.scriptPaused)

  if (!state.scriptPaused) {
    start()
  }
}

const mainLoop = async () => {
  if (mainLoopRunning) {
    setTimeout(mainLoop, 1000)
    return
  }

  mainLoopRunning = true

  while (!state.scriptPaused) {
    const pagesToCheck = Object.keys(pages)

    while (!state.scriptPaused && pagesToCheck.length) {
      const pageToCheck = pagesToCheck.shift()

      if (pages[pageToCheck] && pages[pageToCheck].enabled()) {
        const page = pages[pageToCheck]

        if (page) {
          logger({ msgLevel: 'debug', msg: `Executing ${page.id} action` })
          state.lastVisited[page.id] = new Date().getTime()
          await page.action()
          await sleep(1000)
        }
      }
    }

    await sleep(1000)
  }

  mainLoopRunning = false
}

const managePanel = () => {
  const id = 'theresmore-automation'
  const controlPanel = document.querySelector(`div#${id}`)

  let scriptState = state.scriptPaused ? `▶️` : `⏸️`

  if (!controlPanel) {
    const controlPanelElement = document.createElement('div')
    controlPanelElement.id = id
    controlPanelElement.classList.add('dark')
    controlPanelElement.classList.add('dark:bg-mydark-300')
    controlPanelElement.style.position = 'fixed'
    controlPanelElement.style.bottom = '10px'
    controlPanelElement.style.left = '10px'
    controlPanelElement.style.zIndex = '99999999'
    controlPanelElement.style.border = '1px black solid'
    controlPanelElement.style.padding = '10px'

    controlPanelElement.innerHTML = `
    <p class="mb-2">Theresmore Automation:
      <button title="Start/stop script" class="taScriptState">${scriptState}</button>
    </p>
  `
    document.querySelector('div#root').insertAdjacentElement('afterend', controlPanelElement)
    document.querySelector('button.taScriptState').addEventListener('click', switchScriptState)
  } else {
    controlPanel.querySelector('.taScriptState').textContent = scriptState
  }

  if (!state.scriptPaused) {
    const fullPageOverlay = document.querySelector('div > div.absolute.top-0.right-0.z-20.pt-4.pr-4 > button')
    if (fullPageOverlay) {
      fullPageOverlay.click()
    }
  }
}

const performRoutineTasks = async () => {
  tasks.calculateTTF()

  managePanel()
}

const performFastTasks = async () => {
  tasks.calculateTippyTTF()
}

const start = async () => {
  managePanel()

  if (!state.scriptPaused) {
    if (!routineTasksInterval) {
      routineTasksInterval = window.setInterval(performRoutineTasks, 1000)
    }
    if (!fastTasksInterval) {
      fastTasksInterval = window.setInterval(performFastTasks, 100)
    }

    await sleep(5000)

    tasks.autoClicker()
    mainLoop()
  } else {
    window.clearInterval(routineTasksInterval)
    window.clearInterval(fastTasksInterval)

    routineTasksInterval = fastTasksInterval = null
  }
}

start()
