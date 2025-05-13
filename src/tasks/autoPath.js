import { sleep, state, translate } from '../utils'

const autoPath = async () => {
  if (!state.options.path.enabled) return;
  const pathModalTitle = [...document.querySelectorAll('h3.modal-title')].find(h3 => h3.innerText.trim() === translate('path_choise'));
  if (pathModalTitle) {
    state.stopAutoClicking = true;
    const pathOptions = [...pathModalTitle.parentElement.querySelectorAll('div.p-4')];
    if (!state.options.path.selected) {
      pathOptions[0].click();
    } else {
      const pathOptionToSelect = pathOptions.find(pathOption => pathOption.innerText.trim() === translate(state.options.path.selected));
      if (pathOptionToSelect) {
        pathOptionToSelect.click();
      } else {
        pathOptions[0].click();
      }
    }
      await sleep(1000, true);
      state.stopAutoClicking = false;
  }
};

export default autoPath
