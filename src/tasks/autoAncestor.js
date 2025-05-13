import { keyGen, reactUtil, sleep, state, translate } from '../utils'

const defaultAncestor = 'ancestor_gatherer'

const autoAncestor = async () => {
  if (!state.options.ancestor.enabled || !state.options.ancestor.selected) return

  const ancestorToSelect = state.options.ancestor.selected

  const ancestorPage = document.querySelector(
    '#root > div.mt-6.lg\\:mt-12.xl\\:mt-24.\\32 xl\\:mt-12.\\34 xl\\:mt-24 > div > div.text-center > p.mt-6.lg\\:mt-8.text-lg.lg\\:text-xl.text-gray-500.dark\\:text-gray-400'
  )

  if (ancestorPage) {
    state.stopAutoClicking = true;
    let ancestor = [...document.querySelectorAll('button.btn')].find((button) => reactUtil.getNearestKey(button, 3) === keyGen.ancestor.key(ancestorToSelect))

    if (!ancestor) {
      ancestor = [...document.querySelectorAll('button.btn')].find(
        (button) => reactUtil.getNearestKey(button.parentElement, 3) === keyGen.ancestor.key(ancestorToSelect)
      )
    }

    if (ancestor) {
      ancestor.click()
      state.stopAttacks = false
      state.haveManualResourceButtons = true
      await sleep(5000, true);
    }
    state.stopAutoClicking = false;
  }
}

export default autoAncestor
