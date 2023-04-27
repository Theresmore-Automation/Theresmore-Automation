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
  special: ['relic', 'coin', 'tome_wisdom', 'gem', 'titan_gift'],
}

const setMaxResources = (type) => {
  const resources = reactUtil.getGameData().run.resources
  for (let i = 0; i < resources.length; i++) {
    if (ids[type].includes(resources[i].id)) {
      resources[i].value = 1000000000
    }
  }
}

const cheats = {
  maxResources: () => {
    setMaxResources('resources')
  },
  maxLegacyPoints: () => {
    setMaxResources('prestige')
  },
  maxPrestigeCurrencies: () => {
    setMaxResources('special')
  },
}

export default cheats
