import { buildings, tech, jobs } from '../data'
import { state, localStorage, translate, CONSTANTS } from '../utils'

const id = 'theresmore-automation-options-panel'
let start

const building_cats = ['living_quarters', 'resource', 'science', 'commercial_area', 'defense', 'faith', 'warehouse', 'wonders']

const createPanel = (startFunction) => {
  start = startFunction

  const panelElement = document.createElement('div')
  panelElement.id = id
  panelElement.style.position = 'fixed'
  panelElement.style.top = '0'
  panelElement.style.left = '0'
  panelElement.style.zIndex = '9999999999'
  panelElement.style.padding = '20px'
  panelElement.style.height = '100vh'
  panelElement.style.width = '100vw'
  panelElement.style.display = 'none'
  panelElement.style.backdropFilter = 'blur(10px)'

  const innerPanelElement = document.createElement('div')
  innerPanelElement.classList.add('dark')
  innerPanelElement.classList.add('dark:bg-mydark-300')
  innerPanelElement.style.position = 'relative'
  innerPanelElement.style.height = '100%'
  innerPanelElement.style.width = '100%'
  innerPanelElement.style.padding = '10px'
  innerPanelElement.style.border = '1px black solid'
  innerPanelElement.style.overflowY = 'auto'
  innerPanelElement.style.overflowX = 'none'

  innerPanelElement.innerHTML = `
    <p class="mb-2">
      <h2 class="text-xl">Theresmore Automation Options:</h2>

      <div class="mb-6">
        <h3 class="text-lg">Build:</h3>
        <p class="mb-2">Max values: -1 -> build unlimited; 0 -> do not build;</p>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="pages-${CONSTANTS.PAGES.BUILD}" class="option" ${
    state.options.pages[CONSTANTS.PAGES.BUILD] ? 'checked="checked"' : ''
  } /></label></div>

  ${building_cats
    .map(
      (cat) => `
    <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
      <div class="w-full pb-3 font-bold text-center xl:text-left">${translate(cat)}</div>
      <div class="grid gap-3 grid-cols-fill-180 min-w-full px-12 xl:px-0 mb-2">
        ${buildings
          .filter((building) => building.cat === cat)
          .map((building) => {
            return `<div class="flex flex-col"><label>${translate(building.id)} max:<br /><input type="number" data-id="${CONSTANTS.PAGES.BUILD}-${
              building.id
            }" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-400 border-y border-gray-400 dark:border-mydark-200" value="${
              state.options[CONSTANTS.PAGES.BUILD][building.id] ? state.options[CONSTANTS.PAGES.BUILD][building.id] : '0'
            }" min="-1" max="${building.cap ? building.cap : 99999}" step="1" /></label></div>`
          })
          .join('')}
      </div>
    </div>
  `
    )
    .join('')}

        <div class="mb-2"><label>Prioritize Wonders: <input type="checkbox" data-id="automation-prioWonders" class="option" ${
          state.options.automation.prioWonders ? 'checked="checked"' : ''
        } /></label></div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Research:</h3>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="pages-${CONSTANTS.PAGES.RESEARCH}" class="option" ${
    state.options.pages[CONSTANTS.PAGES.RESEARCH] ? 'checked="checked"' : ''
  } /></label></div>

        <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
          <div class="w-full pb-3 font-bold text-center xl:text-left">Regular researches:</div>
          <div class="grid gap-3 grid-cols-fill-180 min-w-full px-12 xl:px-0 mb-2">
            ${tech
              .filter((technology) => !technology.confirm)
              .map((technology) => {
                return `<div class="flex flex-col"><label><input type="checkbox" data-id="${CONSTANTS.PAGES.RESEARCH}-${technology.id}" class="option" ${
                  state.options[CONSTANTS.PAGES.RESEARCH][technology.id] ? 'checked="checked"' : ''
                } /> ${translate(technology.id, 'tec_')}</label></div>`
              })
              .join('')}
          </div>
        </div>

        <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
          <div class="w-full pb-3 font-bold text-center xl:text-left">Dangerous researches (requiring confirmation):</div>
          <div class="grid gap-3 grid-cols-fill-180 min-w-full px-12 xl:px-0 mb-2">
            ${tech
              .filter((technology) => technology.confirm)
              .map((technology) => {
                return `<div class="flex flex-col"><label><input type="checkbox" data-id="${CONSTANTS.PAGES.RESEARCH}-${technology.id}" class="option" ${
                  state.options[CONSTANTS.PAGES.RESEARCH][technology.id] ? 'checked="checked"' : ''
                } /> ${translate(technology.id, 'tec_')}</label></div>`
              })
              .join('')}
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Marketplace:</h3>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="pages-${CONSTANTS.PAGES.MARKETPLACE}" class="option" ${
    state.options.pages[CONSTANTS.PAGES.MARKETPLACE] ? 'checked="checked"' : ''
  } /></label></div>
        <div class="grid gap-3 grid-cols-fill-180 min-w-full px-12 xl:px-0 mb-2">
          ${['cow', 'horse', 'food', 'copper', 'wood', 'stone', 'iron', 'tools']
            .map((res) => {
              return `<div class="flex flex-col"><label><input type="checkbox" data-id="${CONSTANTS.PAGES.MARKETPLACE}-resource_${res}" class="option" ${
                state.options[CONSTANTS.PAGES.MARKETPLACE][`resource_${res}`] ? 'checked="checked"' : ''
              } /> Sell ${translate(res, 'res_')}</label></div>`
            })
            .join('')}
        </div>
        <div>Don't sell if max gold can be reached in <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-400 border-y border-gray-400 dark:border-mydark-200" data-id="${
          CONSTANTS.PAGES.MARKETPLACE
        }-timeToWaitUntilFullGold" value="${
    state.options[CONSTANTS.PAGES.MARKETPLACE].timeToWaitUntilFullGold ? state.options[CONSTANTS.PAGES.MARKETPLACE].timeToWaitUntilFullGold : '60'
  }" /> seconds</div>
  <div>Sell the same resource at most every <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-400 border-y border-gray-400 dark:border-mydark-200" data-id="${
    CONSTANTS.PAGES.MARKETPLACE
  }-secondsBetweenSells" value="${
    state.options[CONSTANTS.PAGES.MARKETPLACE].secondsBetweenSells ? state.options[CONSTANTS.PAGES.MARKETPLACE].secondsBetweenSells : '90'
  }" /> seconds</div>
  <div>Sell the resource if it can be refilled in at most <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-400 border-y border-gray-400 dark:border-mydark-200" data-id="${
    CONSTANTS.PAGES.MARKETPLACE
  }-timeToFillResource" value="${
    state.options[CONSTANTS.PAGES.MARKETPLACE].timeToFillResource ? state.options[CONSTANTS.PAGES.MARKETPLACE].timeToFillResource : '90'
  }" /> seconds</div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Population:</h3>
        <p class="mb-2">Max values: -1 -> hire unlimited; 0 -> do not hire;</p>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="pages-${CONSTANTS.PAGES.POPULATION}" class="option" ${
    state.options.pages[CONSTANTS.PAGES.POPULATION] ? 'checked="checked"' : ''
  } /></label></div>

        <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600 mb-2">
          <div class="w-full pb-3 font-bold text-center xl:text-left">Hire:</div>
          <div class="grid gap-3 grid-cols-fill-180 min-w-full px-12 xl:px-0 mb-2">
            ${jobs
              .filter((job) => job.gen)
              .map((job) => {
                return `<div class="flex flex-col"><label>${translate(
                  job.id,
                  'pop_'
                )}:<br /><input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-400 border-y border-gray-400 dark:border-mydark-200" data-id="${
                  CONSTANTS.PAGES.POPULATION
                }-${job.id}" value="${
                  state.options[CONSTANTS.PAGES.POPULATION][job.id] ? state.options[CONSTANTS.PAGES.POPULATION][job.id] : '0'
                }" min="-1" max="999999" step="1" /></label></div>`
              })
              .join('')}
          </div>
        </div>

        <div class="mb-2"><label>Minimum Food production to aim for: <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-400 border-y border-gray-400 dark:border-mydark-200" data-id="automation-minimumFood" value="${
          state.options.automation.minimumFood ? state.options.automation.minimumFood : '1'
        }" min="0" max="999999" step="1" /></label></div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Army:</h3>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="pages-${CONSTANTS.PAGES.ARMY}" class="option" ${
    state.options.pages[CONSTANTS.PAGES.ARMY] ? 'checked="checked"' : ''
  } /></label></div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Auto-ancestor:</h3>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="automation-ancestor" class="option" ${
          state.options.automation.ancestor ? 'checked="checked"' : ''
        } /></label></div>

        <div class="mb-2">
          Ancestor to pick:
        </div>
        <div class="grid gap-3 grid-cols-fill-180 min-w-full px-12 xl:px-0 mb-2">
          ${[
            'ancestor_farmer',
            'ancestor_believer',
            'ancestor_forager',
            'ancestor_gatherer',
            'ancestor_miner',
            'ancestor_researcher',
            'ancestor_spellcrafter',
            'ancestor_trader',
            'ancestor_warrior',
          ]
            .map((ancestor) => {
              return `<div class="flex flex-col"><label><input type="radio" name="automation-selected_ancestor" data-id="automation-selected_${ancestor}" class="option" ${
                state.options.automation[`selected_${ancestor}`] ? 'checked="checked"' : ''
              } /> ${translate(ancestor)}</label></div>`
            })
            .join('')}
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Auto-prestige:</h3>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="automation-prestige" class="option" ${
          state.options.automation.prestige ? 'checked="checked"' : ''
        } /></label></div>
      </div>

      <div class="mb-2" style="width: 200px;">
        <button id="saveOptions" type="button" class="btn btn-green w-full px-4 dark:bg-green-700 dark:hover:bg-green-800 dark:focus:bg-green-900">Save options</button>
      </div>
    </p>
    <div class="absolute top-0 right-0 z-20 pt-4 pr-4">
      <a href="#" title="Close" id="closeOptions">X</a>
    </div>
  `

  panelElement.appendChild(innerPanelElement)

  document.querySelector('div#root').insertAdjacentElement('afterend', panelElement)
  document.querySelector('#closeOptions').addEventListener('click', togglePanel)
  document.querySelector('#saveOptions').addEventListener('click', saveOptions)
}

const updatePanel = () => {}

let previousScriptState = state.scriptPaused

const togglePanel = () => {
  const panelElement = document.querySelector(`div#${id}`)
  if (panelElement.style.display === 'none') {
    previousScriptState = state.scriptPaused
    state.scriptPaused = true
    panelElement.style.display = 'block'
  } else {
    state.scriptPaused = previousScriptState
    panelElement.style.display = 'none'
  }

  start()
}

const saveOptions = () => {
  const options = [...document.querySelector(`div#${id}`).querySelectorAll('.option')]
  options.forEach((option) => {
    if (option.type === 'checkbox' || option.type === 'radio') {
      const ids = option.dataset.id.split('-')
      state.options[ids[0]][ids[1]] = option.checked
    } else if (option.type === 'number') {
      const ids = option.dataset.id.split('-')
      state.options[ids[0]][ids[1]] = Math.round(Number(option.value))
    } else {
      console.log(option)
      console.log(option.dataset.id.split('-'))
      console.log(option.type)
      console.log(typeof option.value, option.value)
    }
  })

  localStorage.set('options', state.options)
}

export default { createPanel, updatePanel, togglePanel }
