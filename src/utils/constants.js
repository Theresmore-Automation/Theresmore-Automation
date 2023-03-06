const PAGES = {
  BUILD: 'Build',
  RESEARCH: 'Research',
  POPULATION: 'Population',
  ARMY: 'Army',
  MARKETPLACE: 'Marketplace',
  MAGIC: 'Magic',
  DIPLOMACY: 'Diplomacy',
}

const PAGES_INDEX = {
  [PAGES.BUILD]: 0,
  [PAGES.RESEARCH]: 1,
  [PAGES.POPULATION]: 2,
  [PAGES.ARMY]: 4,
  [PAGES.MARKETPLACE]: 6,
  [PAGES.MAGIC]: 3,
  [PAGES.DIPLOMACY]: 5,
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

const SUBPAGES_INDEX = {
  [SUBPAGES.CITY]: 0,
  [SUBPAGES.COLONY]: 1,
  [SUBPAGES.RESEARCH]: 0,
  [SUBPAGES.SPELLS]: 0,
  [SUBPAGES.PRAYERS]: 1,
  [SUBPAGES.ARMY]: 0,
  [SUBPAGES.EXPLORE]: 1,
  [SUBPAGES.ATTACK]: 3,
  [SUBPAGES.GARRISON]: 4,
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

const DIPLOMACY_BUTTONS = {
  DELEGATION: 'Send a delegation',
  CANCEL_TRADE: 'Cancel trade agreement',
  ACCEPT_TRADE: 'Accept trade agreement',
  INSULT: 'Insult',
  WAR: 'War',
  IMPROVE_RELATIONSHIPS: 'Improve relationships',
  ALLY: 'Alliance',
}

const TOOLTIP_PREFIX = {
	BUILDING: "bui_",
	TECH: "tech_",
	PRAYER: "pray_",
	UNIT: "uni_",
	FACTION_IMPROVE: "improve_",
	FACTION_DELEGATION: "delegation_",
}

export default {
  PAGES,
  SUBPAGES,
  SUBPAGE_MAPPING,
  PAGES_INDEX,
  SUBPAGES_INDEX,
  DIPLOMACY,
  DIPLOMACY_BUTTONS,
  TOOLTIP_PREFIX,
}
