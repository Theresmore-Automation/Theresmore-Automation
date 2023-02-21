const getActivePageContent = () => {
  return document.querySelector('#maintabs-container > div > div[role=tabpanel]')
}

const getAllButtons = (activeOnly = true, extraSelectors = '') => {
  const activeOnlySelector = activeOnly ? ':not(.btn-off)' : ''

  return [...getActivePageContent().querySelectorAll(`button.btn${activeOnlySelector}${extraSelectors}`)]
}

export default { getActivePageContent, getAllButtons }
