import { keyGen, reactUtil, sleep, state, translate } from '../utils'

const defaultAncestor = 'ancestor_gatherer'

const autoAncestor = async () => {
  if (!state.options.ancestor.enabled || !state.options.ancestor.selected) return

  const ancestorToSelect = state.options.ancestor.selected

  const ancestorPage = [...document.querySelectorAll('div.text-center.mb-6 > h2.text-xl')].find((h2) => h2.textContent.includes('Choose Your Path'))

  if (ancestorPage) {
    state.stopAutoClicking = true
    let ancestor = [...document.querySelectorAll('button.group')].find((button) => reactUtil.getNearestKey(button, 4) === keyGen.ancestor.key(ancestorToSelect))

    if (!ancestor) {
      ancestor = [...document.querySelectorAll('button.group')].find((button) => reactUtil.getNearestKey(button, 4) === keyGen.ancestor.key(defaultAncestor))
    }

    if (ancestor) {
      ancestor.click()
      state.stopAttacks = false
      state.haveManualResourceButtons = true
      await sleep(5000, true)
    }
    state.stopAutoClicking = false
  }
}

export default autoAncestor
