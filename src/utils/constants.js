const PAGES = {
  BUILD: 'Build',
  RESEARCH: 'Research',
  POPULATION: 'Population',
  ARMY: 'Army',
  MARKETPLACE: 'Marketplace',
  MAGIC: 'Magic',
  DIPLOMACY: 'Diplomacy',
}

const SUBPAGES = {
  CITY: 'City',
  COLONY: 'Colony',
  RESEARCH: 'Research',
  SPELLS: 'Spells',
  PRAYERS: 'Prayers',
  ARMY: 'Army',
  EXPLORE: 'Explore',
  ATTACK: 'Attack',
  GARRISON: 'Garrison',
}

const SUBPAGE_MAPPING = {
  CITY: 'BUILD',
  COLONY: 'BUILD',
  RESEARCH: 'RESEARCH',
  SPELLS: 'MAGIC',
  PRAYERS: 'MAGIC',
  ARMY: 'ARMY',
  EXPLORE: 'ARMY',
  ATTACK: 'ARMY',
  GARRISON: 'ARMY',
}

const DIPLOMACY = {
  DISABLED: 0,
  GO_TO_WAR: 1,
  JUST_TRADE: 2,
  TRADE_AND_ALLY: 3,
  ONLY_ALLY: 4,
}

export default {
  PAGES,
  SUBPAGES,
  SUBPAGE_MAPPING,
  DIPLOMACY,
}
