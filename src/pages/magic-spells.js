import { spells } from '../data'
import { CONSTANTS, navigation, selectors, logger, sleep, state, translate, resources, reactUtil, keyGen } from '../utils'

const userEnabled = () => {
  return (
    (state.options.pages[CONSTANTS.PAGES.MAGIC].enabled || false) &&
    (state.options.pages[CONSTANTS.PAGES.MAGIC].subpages[CONSTANTS.SUBPAGES.SPELLS].enabled || false)
  )
}

const getAllowedSpells = () => {
  const spellOptions = state.options.pages[CONSTANTS.PAGES.MAGIC].subpages[CONSTANTS.SUBPAGES.SPELLS].options

  if (Object.keys(spellOptions).length) {
    let allowedSpells = Object.keys(spellOptions)
      .map((key) => {
        const spell = {
          key: key,
          id: translate(key, 'fai_'),
          enabled: spellOptions[key],
        }

        const spellData = spells.find((spell) => spell.id === key)

        return { ...spellData, ...spell }
      })
      .filter((spell) => spell.type && spell.gen)

    return allowedSpells
  }

  return []
}

const getAllButtons = () => {
  const allowedSpells = getAllowedSpells()
  const buttonsList = selectors
    .getAllButtons(true)
    .map((button) => {
      const spell = allowedSpells.find((spell) => reactUtil.getNearestKey(button, 4) === keyGen.magic.key(spell.key))

      return { ...spell, button }
    })
    .filter((spell) => spell.button)
    .sort((a, b) => a.gen.find((gen) => gen.id === 'mana').value - b.gen.find((gen) => gen.id === 'mana').value)

  return buttonsList
}

const executeAction = async () => {
  const buttonsList = getAllButtons()
  const enabledSpells = buttonsList.filter((button) => button.enabled)
  const disabledSpells = buttonsList.filter((button) => !button.enabled)

  for (let i = 0; i < disabledSpells.length && !state.scriptPaused; i++) {
    const spell = disabledSpells[i]

    if (spell.button.classList.contains('btn-dark')) {
      logger({ msgLevel: 'log', msg: `Cancelling spell ${spell.id}` })
      spell.button.click()
      await sleep(25)
    }

    if (!navigation.checkPage(CONSTANTS.PAGES.MAGIC, CONSTANTS.SUBPAGES.SPELLS)) return
  }

  for (let i = 0; i < enabledSpells.length && !state.scriptPaused; i++) {
    const spell = enabledSpells[i]
    const hasEnoughMana =
      resources.get('mana').speed + spell.gen.find((gen) => gen.id === 'mana').value >
      (state.options.pages[CONSTANTS.PAGES.MAGIC].subpages[CONSTANTS.SUBPAGES.SPELLS].options.minimumMana || 0)

    if (!spell.button.classList.contains('btn-dark') && hasEnoughMana) {
      logger({ msgLevel: 'log', msg: `Casting spell ${spell.id}` })
      spell.button.click()
      await sleep(25)
    }

    if (!navigation.checkPage(CONSTANTS.PAGES.MAGIC, CONSTANTS.SUBPAGES.SPELLS)) return
  }
}

export default {
  page: CONSTANTS.PAGES.MAGIC,
  subpage: CONSTANTS.SUBPAGES.SPELLS,
  enabled: () => userEnabled() && navigation.hasPage(CONSTANTS.PAGES.MAGIC) && getAllowedSpells().length && resources.get('mana') && resources.get('mana').max,
  action: async () => {
    await navigation.switchSubPage(CONSTANTS.SUBPAGES.SPELLS, CONSTANTS.PAGES.MAGIC)

    if (navigation.checkPage(CONSTANTS.PAGES.MAGIC, CONSTANTS.SUBPAGES.SPELLS)) await executeAction()
  },
}
