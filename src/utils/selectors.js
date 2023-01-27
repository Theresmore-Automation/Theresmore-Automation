const getActivePageContent = () => {
  return document.querySelector('#maintabs-container > div > div[role=tabpanel]')
}

const getAllButtons = (activeOnly = true) => {
  const activeOnlySelector = activeOnly ? ':not(.btn-off)' : ''

  return [...getActivePageContent().querySelectorAll(`button.btn${activeOnlySelector}`)]
}

export default { getActivePageContent, getAllButtons }
