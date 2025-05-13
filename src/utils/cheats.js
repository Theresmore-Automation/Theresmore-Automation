import reactUtil from './reactUtil'

const ids = {
  resources: [
    'research',
    'food',
    'wood',
    'stone',
    'gold',
    'tools',
    'copper',
    'iron',
    'cow',
    'horse',
    'luck',
    'mana',
    'building_material',
    'faith',
    'supplies',
    'crystal',
    'steel',
    'saltpetre',
    'natronite',
  ],
  prestige: ['legacy'],
  special: ['relic', 'coin', 'tome_wisdom', 'gem', 'titan_gift', 'light'],
}

const setMaxResources = (type, amount = 1000000000) => {
  const resources = reactUtil.getGameData().run.resources
  for (let i = 0; i < resources.length; i++) {
    if (ids[type].includes(resources[i].id)) {
      resources[i].value = amount + (resources[i].value ?? 0)
    }
  }
}

const cheats = {
  maxResources: () => {
    setMaxResources('resources')
  },
  maxLegacyPoints: (amount = 1) => {
    setMaxResources('prestige', amount)
  },
  maxPrestigeCurrencies: (amount = 1) => {
    setMaxResources('special', amount)
  },
}

export default cheats
