const PAGES = {
  BUILD: 'Build',
  RESEARCH: 'Research',
  POPULATION: 'Population',
  ARMY: 'Army',
  MARKETPLACE: 'Marketplace',
  MAGIC: 'Magic',
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

export default {
  PAGES,
  SUBPAGES,
  SUBPAGE_MAPPING,
}
