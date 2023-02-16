import { factions } from '../data'
import { CONSTANTS, navigation, logger, sleep, state, resources, numberParser, translate, localStorage, selectors } from '../utils'

const userEnabled = () => {
  return state.options.pages[CONSTANTS.PAGES.DIPLOMACY].enabled || false
}

const mapToFaction = (button) => {
  let level = 0
  let parent = button.parentElement
  let factionName

  while (!factionName && level < 5) {
    factionName = parent.querySelector('div.font-bold > button.font-bold')

    if (factionName) {
      factionName = factionName.innerText.split('\n').shift().trim()
    } else {
      factionName = null
      parent = parent.parentElement
      level += 1
    }
  }

  if (factionName) {
    const factionData = factions.find((faction) => translate(faction.id, 'dip_') === factionName)

    return {
      ...factionData,
      button,
      key: factionData.id,
      id: translate(factionData.id, 'dip_'),
      option: state.options.pages[CONSTANTS.PAGES.DIPLOMACY].options[factionData.id],
    }
  }
}

const getFactionsWithButtons = () => {
  const allButtons = selectors
    .getAllButtons(true)
    .map((button) => mapToFaction(button))
    .filter((button) => button)

  const listOfFactions = {}
  for (let i = 0; i < allButtons.length; i++) {
    const button = allButtons[i]
    listOfFactions[button.key] = listOfFactions[button.key] ? listOfFactions[button.key] : button
    listOfFactions[button.key].buttons = listOfFactions[button.key].buttons ? listOfFactions[button.key].buttons : {}

    const buttonText = button.button.innerText.trim()
    const buttonType = Object.keys(CONSTANTS.DIPLOMACY_BUTTONS).find((key) => buttonText.includes(CONSTANTS.DIPLOMACY_BUTTONS[key]))

    if (buttonType) {
      listOfFactions[button.key].buttons[CONSTANTS.DIPLOMACY_BUTTONS[buttonType]] = button.button
    }

    delete listOfFactions[button.key].button
  }

  return listOfFactions
}

const executeAction = async () => {
  let factionsWithButtons = getFactionsWithButtons()
  let factionKeys = Object.keys(factionsWithButtons)

  let tookAction = true
  let longAction = false

  while (!state.scriptPaused && tookAction) {
    if (!navigation.checkPage(CONSTANTS.PAGES.DIPLOMACY)) return

    tookAction = false
    longAction = false

    for (let i = 0; i < factionKeys.length; i++) {
      if (state.scriptPaused) return
      if (!navigation.checkPage(CONSTANTS.PAGES.DIPLOMACY)) return

      const faction = factionsWithButtons[factionKeys[i]]

      if (faction.option && faction.option !== CONSTANTS.DIPLOMACY.DISABLED) {
        if (faction.option !== CONSTANTS.DIPLOMACY.JUST_TRADE && faction.option !== CONSTANTS.DIPLOMACY.TRADE_AND_ALLY) {
          if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.CANCEL_TRADE]) {
            logger({ msgLevel: 'log', msg: `Canceling trade with ${faction.id}` })
            tookAction = true
            faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.CANCEL_TRADE].click()
          }
        } else if (faction.option === CONSTANTS.DIPLOMACY.JUST_TRADE || faction.option === CONSTANTS.DIPLOMACY.TRADE_AND_ALLY) {
          if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.ACCEPT_TRADE]) {
            let canTrade

            if (!faction.commercial) {
              canTrade = false
            } else {
              canTrade = faction.commercial
                .filter((res) => res.type === 'resource')
                .every((res) => {
                  if (res.value < 0) {
                    const currentRes = resources.get(translate(res.id, 'res_'))
                    return currentRes.speed > Math.abs(res.value)
                  } else {
                    return true
                  }
                })
            }

            if (canTrade) {
              logger({ msgLevel: 'log', msg: `Starting trading with ${faction.id}` })
              tookAction = true
              faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.ACCEPT_TRADE].click()
            }
          }
        }

        if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.DELEGATION]) {
          logger({ msgLevel: 'log', msg: `Sending delegation to ${faction.id}` })
          longAction = true
          tookAction = true
          faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.DELEGATION].click()
        } else if (faction.option === CONSTANTS.DIPLOMACY.GO_TO_WAR) {
          if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.INSULT]) {
            logger({ msgLevel: 'log', msg: `Insulting ${faction.id}` })
            longAction = true
            tookAction = true
            faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.INSULT].click()
          }

          if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.WAR]) {
            logger({ msgLevel: 'log', msg: `Going to war with ${faction.id}` })
            longAction = true
            tookAction = true
            faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.WAR].click()
            await sleep(200)

            const redConfirmButton = [...document.querySelectorAll('.btn.btn-red')].find((button) => button.innerText.includes('Confirm'))
            if (redConfirmButton) {
              redConfirmButton.click()
              await sleep(200)
            }
          }
        } else if (faction.option === CONSTANTS.DIPLOMACY.TRADE_AND_ALLY || faction.option === CONSTANTS.DIPLOMACY.ONLY_ALLY) {
          if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.IMPROVE_RELATIONSHIPS]) {
            logger({ msgLevel: 'log', msg: `Improving relationships with ${faction.id}` })
            longAction = true
            tookAction = true
            faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.IMPROVE_RELATIONSHIPS].click()
          }

          if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.ALLY]) {
            logger({ msgLevel: 'log', msg: `Allying with ${faction.id}` })
            longAction = true
            tookAction = true
            faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.ALLY].click()
          }
        } else if (
          faction.option === CONSTANTS.DIPLOMACY.JUST_TRADE &&
          !faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.CANCEL_TRADE] &&
          !faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.ACCEPT_TRADE]
        ) {
          if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.IMPROVE_RELATIONSHIPS]) {
            logger({ msgLevel: 'log', msg: `Improving relationships with ${faction.id}` })
            longAction = true
            tookAction = true
            faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.IMPROVE_RELATIONSHIPS].click()
          }
        }
      }
    }

    if (tookAction) {
      if (longAction) {
        await sleep(3100)
      } else {
        await sleep(25)
      }

      factionsWithButtons = getFactionsWithButtons()
      factionKeys = Object.keys(factionsWithButtons)
    }
  }
}

export default {
  page: CONSTANTS.PAGES.DIPLOMACY,
  enabled: () => userEnabled() && navigation.hasPage(CONSTANTS.PAGES.DIPLOMACY),
  action: async () => {
    await navigation.switchPage(CONSTANTS.PAGES.DIPLOMACY)

    if (navigation.checkPage(CONSTANTS.PAGES.DIPLOMACY)) await executeAction()
  },
}
