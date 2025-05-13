import CONSTANTS from './constants'
import logger from './logger'
import sleep from './sleep'
import reactUtil from './reactUtil'

const getPagesSelector = () => {
  return [...document.querySelectorAll('#main-tabs > div > button')]
}

const getCurrentPageSelector = () => {
  return document.querySelector('#main-tabs > div > button[aria-selected="true"]')
}

const getSubPagesSelector = () => {
  const tabLists = [...document.querySelectorAll('div[role="tablist"]')]

  if (tabLists && tabLists.length >= 2) {
    return [...tabLists[1].querySelectorAll('button')]
  }

  return []
}

const getCurrentSubPageSelector = () => {
  let currentSubPage

  const subPages = getSubPagesSelector()
  if (subPages.length) {
    currentSubPage = subPages.find((subPage) => subPage.getAttribute('aria-selected') === 'true')
  }

  return currentSubPage
}

const hasPage = (page) => {
  const navButtons = getPagesSelector()
  const pageIndex = CONSTANTS.PAGES_INDEX[page]

  return !!navButtons.find((button) => reactUtil.getBtnIndex(button, 1) === pageIndex)
}

const checkPage = (page, subPage) => {
  const currentPage = getCurrentPageSelector()
  const currentSubPage = getCurrentSubPageSelector()
  const pageIndex = CONSTANTS.PAGES_INDEX[page]
  const subPageIndex = CONSTANTS.SUBPAGES_INDEX[subPage]

  const isCorrectPage = !page || (page && currentPage && reactUtil.getBtnIndex(currentPage, 1) === pageIndex)
  const isCorrectSubPage = !subPage || (subPage && currentSubPage && reactUtil.getBtnIndex(currentSubPage, 1) === subPageIndex)

  return isCorrectPage && isCorrectSubPage
}

const hasSubPage = (subPage) => {
  const subTabs = getSubPagesSelector()
  const subPageIndex = CONSTANTS.SUBPAGES_INDEX[subPage]

  return !!subTabs.find((button) => reactUtil.getBtnIndex(button, 1) === subPageIndex)
}

const switchPage = async (page) => {
  let foundPage = hasPage(page)
  if (!foundPage) {
    await switchPage(CONSTANTS.PAGES.BUILD)
    return
  }

  let switchedPage = false

  const navButtons = getPagesSelector()
  const pageIndex = CONSTANTS.PAGES_INDEX[page]
  const pageButton = navButtons.find((button) => reactUtil.getBtnIndex(button, 1) === pageIndex && button.getAttribute('aria-selected') !== 'true')

  if (pageButton) {
    pageButton.click()
    switchedPage = true
  }

  if (switchedPage) {
    logger({ msgLevel: 'debug', msg: `Switched page to ${page}` })
    await sleep(1000)
  }
}

const switchSubPage = async (subPage, page) => {
  if (page) {
    await switchPage(page)
  }

  let foundSubPage = hasSubPage(subPage)
  if (foundSubPage) {
    let switchedSubPage = false

    const navButtons = getSubPagesSelector()
    const subPageIndex = CONSTANTS.SUBPAGES_INDEX[subPage]
    const subPageButton = navButtons.find((button) => reactUtil.getBtnIndex(button, 1) === subPageIndex && button.getAttribute('aria-selected') !== 'true')

    if (subPageButton) {
      subPageButton.click()
      switchedSubPage = true
    }

    if (switchedSubPage) {
      logger({ msgLevel: 'debug', msg: `Switched subPage to ${subPage}` })
      await sleep(500)
    }
  }
}

export default { getPagesSelector, hasPage, switchPage, checkPage, switchSubPage }
