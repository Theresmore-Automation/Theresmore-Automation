import { factions } from '../data'
import {
  CONSTANTS,
  navigation,
  logger,
  sleep,
  state,
  resources,
  numberParser,
  translate,
  localStorage,
  selectors,
  armyCalculator,
  reactUtil,
  keyGen,
} from '../utils'

const isAtWar = () => {
  return !![...document.querySelectorAll('p.text-red-700')].find((p) => p.innerText.includes('You are now at war with this faction'))
}

const userEnabled = () => {
  return state.options.pages[CONSTANTS.PAGES.DIPLOMACY].enabled || false
}

const mapToFaction = (button) => {
  let factionName = reactUtil.getNearestKey(button, 12)

  let level = 0
  let parent = button.parentElement
  let factionNameEl
  while (!factionNameEl && level < 5) {
    factionNameEl = parent.querySelector('div.font-bold > button.font-bold')

    if (factionNameEl) {
    } else {
      factionNameEl = null
      parent = parent.parentElement
      level += 1
    }
  }

  if (factionName && factionNameEl) {
    const factionData = factions.find((faction) => keyGen.diplomacy.key(faction.id) === factionName)

    return {
      ...factionData,
      button,
      level: level,
      buttonCount: parent.querySelectorAll(`button.btn`).length,
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

    let buttonType = undefined
    if (button.level === 2) {
      buttonType = CONSTANTS.DIPLOMACY_BUTTONS.DELEGATION
    } else if (button.level === 3) {
      if (button.button.classList.contains('btn-dark')) {
        buttonType = CONSTANTS.DIPLOMACY_BUTTONS.CANCEL_TRADE
      } else {
        buttonType = CONSTANTS.DIPLOMACY_BUTTONS.ACCEPT_TRADE
      }
    } else if (button.level === 4) {
      if (button.button.classList.contains('btn-blue')) {
        buttonType = CONSTANTS.DIPLOMACY_BUTTONS.ALLY
      } else if (button.button.classList.contains('btn-green')) {
        buttonType = CONSTANTS.DIPLOMACY_BUTTONS.IMPROVE_RELATIONSHIPS
      } else {
        if (button.button.parentElement.parentElement.parentElement.className.includes('border-red')) {
          buttonType = CONSTANTS.DIPLOMACY_BUTTONS.WAR
        } else {
          buttonType = CONSTANTS.DIPLOMACY_BUTTONS.INSULT
        }
      }
    }

    if (buttonType) {
      listOfFactions[button.key].buttons[buttonType] = button.button
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
                    const currentRes = resources.get(res.id)
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
        } else if (
          faction.option === CONSTANTS.DIPLOMACY.GO_TO_WAR &&
          state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.ATTACK].options[faction.key] &&
          !isAtWar()
        ) {
          if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.INSULT]) {
            logger({ msgLevel: 'log', msg: `Insulting ${faction.id}` })
            longAction = true
            tookAction = true
            faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.INSULT].click()
          }

          if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.WAR]) {
            const canWinBattle = armyCalculator.canWinBattle(faction.key, false, false)

            if (canWinBattle) {
              logger({ msgLevel: 'log', msg: `Going to war with ${faction.id}` })
              tookAction = true
              faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.WAR].click()
              await sleep(200)

              const redConfirmButton = [...document.querySelectorAll('#headlessui-portal-root .btn.btn-red')].find(
                (button) => reactUtil.getBtnIndex(button, 0) === 1
              )
              if (redConfirmButton) {
                redConfirmButton.click()
                await sleep(200)
              }

              await sleep(3100)
            } else {
              logger({ msgLevel: 'debug', msg: `Can't win the fight against ${faction.id}, so no war is being started` })
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
