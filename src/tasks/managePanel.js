import { state } from '../utils'
import manageOptions from './manageOptions'

const id = 'theresmore-automation'
let controlPanel

const createPanel = (switchScriptState) => {
  let scriptState = state.scriptPaused ? `Start` : `Stop`

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
    <p class="mb-2">Theresmore Automation</p>
    <div>
      <button type="button" class="btn btn-blue mb-2 taScriptState">${scriptState}</button>
      <button type="button" class="btn btn-blue mb-2 taManageOptions">Manage Options</button>
    </div>
  </p>
  `
  document.querySelector('div#root').insertAdjacentElement('afterend', controlPanelElement)
  controlPanel = document.querySelector(`div#${id}`)
  controlPanel.querySelector('.taScriptState').addEventListener('click', switchScriptState)
  controlPanel.querySelector('.taManageOptions').addEventListener('click', manageOptions.togglePanel)
}

const updatePanel = () => {
  let scriptState = state.scriptPaused ? `Start` : `Stop`
  controlPanel.querySelector('.taScriptState').innerHTML = scriptState
}

export default { createPanel, updatePanel }
