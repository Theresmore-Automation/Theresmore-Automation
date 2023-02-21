import { CONSTANTS, navigation, logger, sleep, state, resources, numberParser, translate, localStorage } from '../utils'

const resourcesToTrade = ['Cow', 'Horse', 'Food', 'Copper', 'Wood', 'Stone', 'Iron', 'Tools']
const timeToFillResource = 90
const timeToWaitUntilFullGold = 60
const secondsBetweenSells = 90

const getTimeToFillResource = () => {
  return state.options.pages[CONSTANTS.PAGES.MARKETPLACE].options.timeToFillResource || timeToFillResource
}

const getTimeToWaitUntilFullGold = () => {
  return state.options.pages[CONSTANTS.PAGES.MARKETPLACE].options.timeToWaitUntilFullGold || timeToWaitUntilFullGold
}

const getSecondsBetweenSells = () => {
  return state.options.pages[CONSTANTS.PAGES.MARKETPLACE].options.secondsBetweenSells || secondsBetweenSells
}

const getResourcesToTrade = () => {
  const userResourcesToTrade = Object.keys(state.options.pages[CONSTANTS.PAGES.MARKETPLACE].options)
    .filter((key) => key.includes('resource_') && state.options.pages[CONSTANTS.PAGES.MARKETPLACE].options[key])
    .map((key) => translate(key.replace('resource_', '')))
  return userResourcesToTrade.length ? userResourcesToTrade : resourcesToTrade
}

const lastSell = localStorage.get('lastSell') || {}

const shouldSell = () => {
  return !!getResourcesToTrade().find((resName) => {
    if (!lastSell[resName]) lastSell[resName] = 0

    const res = resources.get(resName)

    if (
      res &&
      (res.current === res.max || res.current + res.speed * getTimeToFillResource() >= res.max) &&
      lastSell[resName] + getSecondsBetweenSells() * 1000 < new Date().getTime()
    )
      return true
  })
}

const hasNotEnoughGold = () => {
  const gold = resources.get('Gold')

  return gold.current + gold.speed * getTimeToWaitUntilFullGold() < gold.max
}

const userEnabled = () => {
  return state.options.pages[CONSTANTS.PAGES.MARKETPLACE].enabled || false
}

const executeAction = async () => {
  let gold = resources.get('Gold')

  if (gold && gold.current < gold.max && shouldSell()) {
    const resourceHolders = []

    ;[...document.querySelectorAll('div > div.tab-container > div > div > div')].forEach((resourceHolder) => {
      const resNameElem = resourceHolder.querySelector('h5')
      if (resNameElem) {
        const resName = resNameElem.innerText
        const res = resources.get(resName)

        if (getResourcesToTrade().includes(resName) && res && (res.current === res.max || res.current + res.speed * getTimeToFillResource() >= res.max)) {
          resourceHolders.push(resourceHolder)
        }
      }
    })

    let goldEarned = 0
    let soldTotals = {}

    for (let i = 0; i < resourceHolders.length && !state.scriptPaused; i++) {
      gold = resources.get('Gold')
      const resourceHolder = resourceHolders[i]
      const resName = resourceHolder.querySelector('h5').innerText
      let res = resources.get(resName)

      const initialPrice = numberParser.parse(resourceHolder.querySelector('div:nth-child(2) > div > table > tbody > tr > td:nth-child(2)').innerText)
      let price = initialPrice
      let sellButtons = resourceHolder.querySelectorAll('div > div.grid.gap-3 button.btn-red:not(.btn-dark)')

      while (
        !state.scriptPaused &&
        sellButtons &&
        sellButtons.length &&
        gold.current < gold.max &&
        res.current + res.speed * getTimeToFillResource() * 2 >= res.max
      ) {
        let maxSellButton = 2
        const missingResToSell = Math.ceil((gold.max - gold.current) / price)

        if (missingResToSell < 80) {
          maxSellButton = 0
        } else if (missingResToSell < 800) {
          maxSellButton = 1
        }
        maxSellButton = Math.min(maxSellButton, sellButtons.length - 1)
        sellButtons[maxSellButton].click()
        lastSell[resName] = new Date().getTime()
        soldTotals[resName] = soldTotals[resName] ? soldTotals[resName] : { amount: 0, gold: 0 }
        soldTotals[resName].amount += +sellButtons[maxSellButton].innerText
        soldTotals[resName].gold += +sellButtons[maxSellButton].innerText * price
        logger({ msgLevel: 'debug', msg: `Selling ${sellButtons[maxSellButton].innerText} of ${res.name} for ${price}` })
        goldEarned += numberParser.parse(sellButtons[maxSellButton].innerText) * price
        await sleep(10)
        if (!navigation.checkPage(CONSTANTS.PAGES.MARKETPLACE)) return
        sellButtons = resourceHolder.querySelectorAll('div:nth-child(2) > div.grid.gap-3 button:not(.btn-dark)')
        gold = resources.get('Gold')
        res = resources.get(resName)
        price = numberParser.parse(resourceHolder.querySelector('div:nth-child(2) > div > table > tbody > tr > td:nth-child(2)').innerText)
        await sleep(25)

        if (price / initialPrice < 0.1) {
          break
        }
      }
    }

    if (goldEarned) {
      const totals = Object.keys(soldTotals)
        .filter((resName) => soldTotals[resName] && soldTotals[resName].gold && soldTotals[resName].amount)
        .map(
          (resName) =>
            `${resName}: ${new Intl.NumberFormat().format(soldTotals[resName].amount)} units for ${new Intl.NumberFormat().format(
              Math.round(soldTotals[resName].gold)
            )} gold (avg price: ${(soldTotals[resName].gold / soldTotals[resName].amount).toFixed(2)})`
        )

      logger({ msgLevel: 'log', msg: `Earned ${new Intl.NumberFormat().format(goldEarned)} gold on Marketplace [${totals.join(', ')}]` })
      localStorage.set('lastSell', lastSell)
    }
  }
}

export default {
  page: CONSTANTS.PAGES.MARKETPLACE,
  enabled: () => userEnabled() && navigation.hasPage(CONSTANTS.PAGES.MARKETPLACE) && hasNotEnoughGold() && shouldSell(),
  action: async () => {
    await navigation.switchPage(CONSTANTS.PAGES.MARKETPLACE)

    if (navigation.checkPage(CONSTANTS.PAGES.MARKETPLACE)) await executeAction()
  },
}
