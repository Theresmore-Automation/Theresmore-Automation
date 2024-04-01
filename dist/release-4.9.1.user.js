// ==UserScript==
// @name        Theresmore Automation
// @description Automation suite for Theresmore game
// @namespace   github.com/Theresmore-Automation/Theresmore-Automation
// @match       https://www.theresmoregame.com/play/
// @license     MIT
// @run-at      document-idle
// @downloadURL https://theresmore-automation.github.io/Theresmore-Automation/dist/bundle.user.js
// @updateURL   https://theresmore-automation.github.io/Theresmore-Automation/dist/bundle.user.js
// @version     4.9.1
// @homepage    https://github.com/Theresmore-Automation/Theresmore-Automation
// @author      Theresmore Automation team
// @grant       none
// ==/UserScript==

/*
MIT License

Copyright (c) 2023 Theresmore Automation

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR
A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const taVersion = "4.9.1";


(function () {
  'use strict';

  const PAGES = {
    BUILD: 'Build',
    RESEARCH: 'Research',
    POPULATION: 'Population',
    ARMY: 'Army',
    MARKETPLACE: 'Marketplace',
    MAGIC: 'Magic',
    DIPLOMACY: 'Diplomacy'
  };
  const PAGES_INDEX = {
    [PAGES.BUILD]: 0,
    [PAGES.RESEARCH]: 1,
    [PAGES.POPULATION]: 2,
    [PAGES.ARMY]: 4,
    [PAGES.MARKETPLACE]: 6,
    [PAGES.MAGIC]: 3,
    [PAGES.DIPLOMACY]: 5
  };
  const SUBPAGES = {
    CITY: 'City',
    COLONY: 'Colony',
    RESEARCH: 'Research',
    SPELLS: 'Spells',
    PRAYERS: 'Prayers',
    ARMY: 'Army',
    EXPLORE: 'Explore',
    ATTACK: 'Attack',
    GARRISON: 'Garrison'
  };
  const SUBPAGES_INDEX = {
    [SUBPAGES.CITY]: 0,
    [SUBPAGES.COLONY]: 1,
    [SUBPAGES.RESEARCH]: 0,
    [SUBPAGES.SPELLS]: 0,
    [SUBPAGES.PRAYERS]: 1,
    [SUBPAGES.ARMY]: 0,
    [SUBPAGES.EXPLORE]: 1,
    [SUBPAGES.ATTACK]: 3,
    [SUBPAGES.GARRISON]: 4
  };
  const SUBPAGE_MAPPING = {
    CITY: 'BUILD',
    COLONY: 'BUILD',
    RESEARCH: 'RESEARCH',
    SPELLS: 'MAGIC',
    PRAYERS: 'MAGIC',
    ARMY: 'ARMY',
    EXPLORE: 'ARMY',
    ATTACK: 'ARMY',
    GARRISON: 'ARMY'
  };
  const DIPLOMACY = {
    DISABLED: 0,
    GO_TO_WAR: 1,
    JUST_TRADE: 2,
    TRADE_AND_ALLY: 3,
    ONLY_ALLY: 4
  };
  const DIPLOMACY_BUTTONS = {
    DELEGATION: 'Send a delegation',
    CANCEL_TRADE: 'Cancel trade agreement',
    ACCEPT_TRADE: 'Accept trade agreement',
    INSULT: 'Insult',
    WAR: 'War',
    IMPROVE_RELATIONSHIPS: 'Improve relationships',
    ALLY: 'Alliance'
  };
  const TOOLTIP_PREFIX = {
    BUILDING: 'bui_',
    TECH: 'tech_',
    PRAYER: 'pray_',
    UNIT: 'uni_',
    FACTION_IMPROVE: 'improve_',
    FACTION_DELEGATION: 'delegation_'
  };
  var CONSTANTS = {
    PAGES,
    SUBPAGES,
    SUBPAGE_MAPPING,
    PAGES_INDEX,
    SUBPAGES_INDEX,
    DIPLOMACY,
    DIPLOMACY_BUTTONS,
    TOOLTIP_PREFIX
  };

  // https://stackoverflow.com/a/55366435
  class NumberParser {
    constructor(locale) {
      const format = new Intl.NumberFormat(locale);
      const parts = format.formatToParts(12345.6);
      const numerals = Array.from({
        length: 10
      }).map((_, i) => format.format(i));
      const index = new Map(numerals.map((d, i) => [d, i]));
      this._group = new RegExp(`[${parts.find(d => d.type === 'group').value}]`, 'g');
      this._decimal = new RegExp(`[${parts.find(d => d.type === 'decimal').value}]`);
      this._numeral = new RegExp(`[${numerals.join('')}]`, 'g');
      this._index = d => index.get(d);
    }
    parse(string) {
      let multiplier = 1;
      if (string.includes('K')) {
        multiplier = 1000;
      } else if (string.includes('M')) {
        multiplier = 1000000;
      }
      string = string.replace('K', '').replace('M', '').trim();
      return (string = string.replace(this._group, '').replace(this._decimal, '.').replace(this._numeral, this._index)) ? +string * multiplier : NaN;
    }
  }
  const numberParser = new NumberParser();

  const sleep = miliseconds => new Promise(resolve => setTimeout(resolve, miliseconds));

  var buildings = [
  	{
  		id: "palisade",
  		cap: 1,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 25,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "wall",
  		cap: 1,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 50,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "rampart",
  		cap: 1,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 200,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "titanic_walls",
  		cap: 1,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2000,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "underground_tunnel_b",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 40,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "boot_camp",
  		cap: 8,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "archer",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "phalanx",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "light_cavarly",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "castrum_militia",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "recruit_training_center",
  		cap: 5,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "archer",
  				type_gen: "stat",
  				gen: "attack",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "spearman",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "mercenary_outpost",
  		cap: 15,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "white_company",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "canava_guard",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "watchman_outpost",
  		cap: 8,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 8,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "natronite_baloon",
  		cap: 4,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "attack",
  				value: 4,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 20,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "ballista",
  		cap: 4,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "attack",
  				value: 12,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "siege_workshop",
  		cap: 10,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "battering_ram",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "trebuchet",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "magical_tower",
  		cap: 8,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "attack",
  				value: 18,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 10,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "minefield",
  		cap: 8,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "attack",
  				value: 25,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "military_academy",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "crossbowman",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "arquebusier",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "knight",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "ministry_war",
  		cap: 15,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "arquebusier",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cuirassier",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "officer_training_ground",
  		cap: 5,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "line_infantry",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cannon",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "general",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "artillery_firing",
  		cap: 10,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "bombard",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cannon",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "natronite_shield",
  		cap: 4,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 50,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "soulstealer_citadel",
  		cap: 5,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 12,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 12,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "crossbowman",
  				type_gen: "stat",
  				gen: "attack",
  				value: 11,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "crossbowman",
  				type_gen: "stat",
  				gen: "defense",
  				value: 6,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "great_bombard",
  		cap: 1,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "attack",
  				value: 120,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 20,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "hall_heroic_deeds",
  		cap: 1,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "attack",
  				value: 25,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "defense",
  				value: 25,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "trench",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 50,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "marksman",
  				type_gen: "stat",
  				gen: "attack",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "marksman",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "military_camp",
  		cap: 15,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cuirassier",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "line_infantry",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "stronghold",
  		cap: 15,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 25,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "colony_recruiting_camp",
  		cap: 15,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "general",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "fortified_citadel",
  		cap: 1,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "attack",
  				value: 500,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 500,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cannon",
  				type_gen: "stat",
  				gen: "attack",
  				value: 20,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cannon",
  				type_gen: "stat",
  				gen: "defense",
  				value: 40,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "church_old_gods",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "sacred_golem",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "priest",
  				type_gen: "stat",
  				gen: "defense",
  				value: 4,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "holy_site",
  		cap: 1,
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior_monk",
  				type_gen: "stat",
  				gen: "defense",
  				value: 15,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cleric",
  				type_gen: "stat",
  				gen: "defense",
  				value: 15,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "battle_angel",
  				type_gen: "stat",
  				gen: "defense",
  				value: 15,
  				perc: false
  			}
  		]
  	}
  ];

  var factions = [
  	{
  		id: "army_of_goblin",
  		army: [
  			{
  				id: "goblin_overlord",
  				value: 1
  			},
  			{
  				id: "goblin_wolfrider",
  				value: 30
  			},
  			{
  				id: "goblin_warrior",
  				value: 70
  			}
  		],
  		level: 0,
  		tier: 2,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "army_of_dragon",
  		army: [
  			{
  				id: "red_dragon",
  				value: 1
  			},
  			{
  				id: "draconic_warrior",
  				value: 100
  			}
  		],
  		level: 0,
  		tier: 5,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "king_kobold_nation",
  		army: [
  			{
  				id: "kobold_king",
  				value: 1
  			},
  			{
  				id: "kobold_champion",
  				value: 50
  			},
  			{
  				id: "kobold",
  				value: 180
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 100,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 10
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "theresmore_wanders",
  		army: [
  			{
  				id: "archer",
  				value: 60
  			},
  			{
  				id: "spearman",
  				value: 40
  			},
  			{
  				id: "light_cavarly",
  				value: 80
  			},
  			{
  				id: "commander",
  				value: 1
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 8,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 8,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 0.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "zultan_emirate",
  		army: [
  			{
  				id: "archer",
  				value: 120
  			},
  			{
  				id: "spearman",
  				value: 40
  			},
  			{
  				id: "heavy_warrior",
  				value: 30
  			},
  			{
  				id: "commander",
  				value: 1
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 8,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 8,
  				perc: true
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "nightdale_protectorate",
  		army: [
  			{
  				id: "archer",
  				value: 80
  			},
  			{
  				id: "warrior",
  				value: 120
  			},
  			{
  				id: "commander",
  				value: 1
  			}
  		],
  		level: 5,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 8,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 8,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 8,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 8,
  				perc: true
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "army_of_the_dead",
  		army: [
  			{
  				id: "skeleton",
  				value: 1000
  			},
  			{
  				id: "zombie",
  				value: 400
  			}
  		],
  		level: 0,
  		tier: 7,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "barbarian_horde",
  		army: [
  			{
  				id: "barbarian_king",
  				value: 1
  			},
  			{
  				id: "barbarian_chosen",
  				value: 20
  			},
  			{
  				id: "barbarian_drummer",
  				value: 5
  			},
  			{
  				id: "barbarian_warrior",
  				value: 120
  			}
  		],
  		level: 6,
  		tier: 7,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 100,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 2
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "fallen_angel_army_1",
  		army: [
  			{
  				id: "fallen_angel",
  				value: 1
  			},
  			{
  				id: "demonic_musketeer",
  				value: 120
  			}
  		],
  		level: 0,
  		tier: 7,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "fallen_angel_army_2",
  		army: [
  			{
  				id: "fallen_angel",
  				value: 1
  			},
  			{
  				id: "lesser_demon",
  				value: 150
  			},
  			{
  				id: "greater_demon",
  				value: 100
  			}
  		],
  		level: 0,
  		tier: 7,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "lich_fortress",
  		army: [
  			{
  				id: "nikharul",
  				value: 1
  			},
  			{
  				id: "skeletal_knight",
  				value: 400
  			},
  			{
  				id: "skeleton",
  				value: 2000
  			}
  		],
  		level: 7,
  		tier: 7,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 150,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 2
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "scalerock_tribes",
  		army: [
  			{
  				id: "draconic_warrior",
  				value: 200
  			},
  			{
  				id: "draconic_diver",
  				value: 120
  			},
  			{
  				id: "draconic_mage",
  				value: 20
  			},
  			{
  				id: "draconic_leader",
  				value: 1
  			}
  		],
  		level: 6,
  		tier: 7,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 200,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 15,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 15,
  				perc: true
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "western_kingdom",
  		army: [
  			{
  				id: "crossbowman",
  				value: 60
  			},
  			{
  				id: "man_at_arms",
  				value: 50
  			},
  			{
  				id: "knight",
  				value: 50
  			},
  			{
  				id: "commander",
  				value: 1
  			}
  		],
  		level: 5,
  		tier: 7,
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 8,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 8,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 8,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 8,
  				perc: true
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "sssarkat_empire",
  		army: [
  			{
  				id: "lizard_warrior",
  				value: 200
  			},
  			{
  				id: "lizard_archer",
  				value: 120
  			},
  			{
  				id: "lizard_shaman",
  				value: 20
  			},
  			{
  				id: "lizard_commander",
  				value: 1
  			}
  		],
  		level: 6,
  		tier: 8,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 150,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 12,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 10,
  				perc: true
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "enso_multitude",
  		army: [
  			{
  				id: "musket_ashigaru",
  				value: 250
  			},
  			{
  				id: "katana_samurai",
  				value: 150
  			},
  			{
  				id: "cavarly_archer",
  				value: 60
  			},
  			{
  				id: "daimyo",
  				value: 1
  			}
  		],
  		level: 7,
  		tier: 9,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 250,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 20,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 20,
  				perc: true
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "orc_horde_boss",
  		army: [
  			{
  				id: "orc_champion",
  				value: 50
  			},
  			{
  				id: "orc_warrior",
  				value: 135
  			},
  			{
  				id: "orc_ironskin",
  				value: 135
  			},
  			{
  				id: "orc_berserker",
  				value: 90
  			},
  			{
  				id: "orc_stone_thrower",
  				value: 90
  			},
  			{
  				id: "orc_flame_caster",
  				value: 90
  			},
  			{
  				id: "orc_shaman",
  				value: 60
  			},
  			{
  				id: "orc_warg_rider",
  				value: 90
  			},
  			{
  				id: "orc_warlord",
  				value: 9
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "orc_war_party_1",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 150
  			},
  			{
  				id: "orc_stone_thrower",
  				value: 100
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "orc_war_party_2",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 180
  			},
  			{
  				id: "orc_berserker",
  				value: 50
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "orc_war_party_3",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 200
  			},
  			{
  				id: "orc_berserker",
  				value: 100
  			},
  			{
  				id: "orc_shaman",
  				value: 40
  			},
  			{
  				id: "orc_warg_rider",
  				value: 80
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "orc_war_party_4",
  		army: [
  			{
  				id: "orc_ironskin",
  				value: 200
  			},
  			{
  				id: "orc_berserker",
  				value: 100
  			},
  			{
  				id: "orc_shaman",
  				value: 40
  			},
  			{
  				id: "orc_warg_rider",
  				value: 80
  			},
  			{
  				id: "orc_warlord",
  				value: 1
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "orc_war_party_5",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 300
  			},
  			{
  				id: "orc_ironskin",
  				value: 200
  			},
  			{
  				id: "orc_berserker",
  				value: 100
  			},
  			{
  				id: "orc_shaman",
  				value: 40
  			},
  			{
  				id: "orc_warg_rider",
  				value: 80
  			},
  			{
  				id: "orc_warlord",
  				value: 1
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "orc_war_party_6",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 30
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "orc_war_party_7",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 30
  			},
  			{
  				id: "orc_berserker",
  				value: 20
  			},
  			{
  				id: "orc_stone_thrower",
  				value: 30
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "orc_war_party_8",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 300
  			},
  			{
  				id: "orc_berserker",
  				value: 200
  			},
  			{
  				id: "orc_stone_thrower",
  				value: 300
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "orc_war_party_9",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 450
  			},
  			{
  				id: "orc_ironskin",
  				value: 140
  			},
  			{
  				id: "orc_berserker",
  				value: 10
  			},
  			{
  				id: "orc_shaman",
  				value: 20
  			},
  			{
  				id: "orc_warg_rider",
  				value: 190
  			},
  			{
  				id: "orc_warlord",
  				value: 3
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "orc_war_party_10",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 450
  			},
  			{
  				id: "orc_ironskin",
  				value: 140
  			},
  			{
  				id: "orc_berserker",
  				value: 10
  			},
  			{
  				id: "orc_stone_thrower",
  				value: 120
  			},
  			{
  				id: "orc_shaman",
  				value: 20
  			},
  			{
  				id: "orc_warg_rider",
  				value: 190
  			},
  			{
  				id: "orc_warlord",
  				value: 3
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "orc_war_party_11",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 100
  			},
  			{
  				id: "orc_ironskin",
  				value: 190
  			},
  			{
  				id: "orc_berserker",
  				value: 120
  			},
  			{
  				id: "orc_stone_thrower",
  				value: 150
  			},
  			{
  				id: "orc_shaman",
  				value: 90
  			},
  			{
  				id: "orc_warg_rider",
  				value: 110
  			},
  			{
  				id: "orc_warlord",
  				value: 5
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "orc_war_party_12",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 500
  			},
  			{
  				id: "orc_ironskin",
  				value: 390
  			},
  			{
  				id: "orc_berserker",
  				value: 220
  			},
  			{
  				id: "orc_stone_thrower",
  				value: 450
  			},
  			{
  				id: "orc_shaman",
  				value: 190
  			},
  			{
  				id: "orc_warg_rider",
  				value: 310
  			},
  			{
  				id: "orc_warlord",
  				value: 5
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "orc_war_party_13",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 1200
  			},
  			{
  				id: "orc_ironskin",
  				value: 590
  			},
  			{
  				id: "orc_berserker",
  				value: 320
  			},
  			{
  				id: "orc_stone_thrower",
  				value: 350
  			},
  			{
  				id: "orc_shaman",
  				value: 90
  			},
  			{
  				id: "orc_warg_rider",
  				value: 50
  			},
  			{
  				id: "orc_warlord",
  				value: 1
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "orc_war_party_14",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 400
  			},
  			{
  				id: "orc_ironskin",
  				value: 190
  			},
  			{
  				id: "orc_berserker",
  				value: 220
  			},
  			{
  				id: "orc_stone_thrower",
  				value: 150
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "orc_war_party_15",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 200
  			},
  			{
  				id: "orc_ironskin",
  				value: 490
  			},
  			{
  				id: "orc_berserker",
  				value: 220
  			},
  			{
  				id: "orc_stone_thrower",
  				value: 550
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	},
  	{
  		id: "orc_war_party_16",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 50
  			},
  			{
  				id: "orc_ironskin",
  				value: 120
  			},
  			{
  				id: "orc_berserker",
  				value: 20
  			},
  			{
  				id: "orc_stone_thrower",
  				value: 30
  			}
  		],
  		level: 0,
  		tier: 10,
  		gen: [
  		],
  		onlyDefend: true
  	}
  ];

  var en = {
  	light_portal_of_the_dead: "Light Portal of the Dead",
  	bui_academy_of_freethinkers: "Academy of Freethinkers",
  	bui_academy_of_freethinkers_part: "A. of Freethinkers Part",
  	bui_alchemic_laboratory: "Alchemical laboratory",
  	bui_alchemist_complex: "Alchemist complex",
  	bui_archeological_dig: "Archeological Dig",
  	bui_allied_embassy: "Allied embassy",
  	bui_altar_of_sacrifices: "Altar of sacrifices",
  	bui_artillery_firing: "Artillery firing range",
  	bui_artisans_complex: "Artisan complex",
  	bui_artisan_workshop: "Artisan Workshop",
  	bui_amusement_quarter_b: "Amusement Quarter",
  	bui_ancient_vault: "Ancient vault",
  	bui_arch_triumph: "Arch of Triumph",
  	bui_arch_triumph_part: "Arch of Triumph part",
  	bui_automated_complex: "Automated Complex",
  	bui_automated_complex_part: "Automated Complex p.",
  	bui_ballista: "Ballista",
  	bui_barracks: "Barracks",
  	bui_bank: "Bank",
  	bui_builder_district: "Builder district",
  	bui_builders_complex: "Builders complex",
  	bui_books: "Books",
  	bui_boot_camp: "Boot Camp",
  	bui_canava_trading: "Canava trading post",
  	bui_carpenter_workshop: "Carpenter workshop",
  	bui_castrum_militia: "Castrum Militia",
  	bui_cathedral: "Cathedral",
  	bui_cathedral_unit: "Cathedral part",
  	bui_city_center: "City center",
  	bui_city_center_unit: "City center part",
  	bui_city_lights: "City of Lights",
  	bui_city_lights_part: "City of Lights part",
  	bui_city_hall: "City Hall",
  	bui_colony_hall: "Colony Hall",
  	bui_colony_recruiting_camp: "Colony recruiting camp",
  	bui_conclave: "Conclave",
  	bui_common_house: "Common House",
  	bui_credit_union: "Credit union",
  	bui_custom_house: "Custom house",
  	bui_church_old_gods: "Old Gods Church",
  	bui_dock: "Dock",
  	bui_elf_encampment: "Elf encampment",
  	bui_elf_village: "Elf village",
  	bui_estates: "Estates",
  	bui_eureka_halls_b: "Eureka Halls",
  	bui_factory: "Factory",
  	bui_farm: "Farm",
  	bui_fate_shrine_b: "Fate Shrine",
  	bui_fiefdom: "Fiefdom",
  	bui_fortune_grove: "Fortune grove",
  	bui_fountain_prosperity: "Fountain of Prosperity",
  	bui_foundry: "Foundry",
  	bui_fortified_citadel: "Fortified Citadel",
  	bui_fortified_citadel_part: "Fortified Citadel part",
  	bui_gan_eden: "Gan Eden",
  	bui_glory_gods: "Glory of the Gods",
  	bui_granary: "Granary",
  	bui_guarded_storehouse: "Guarded warehouse",
  	bui_great_bombard: "Great bombard",
  	bui_great_bombard_part: "Great bombard part",
  	bui_great_fair: "Great fair",
  	bui_great_fair_unit: "Great fair unit",
  	bui_grocery: "Grocery",
  	bui_guarded_facility: "Large warehouse",
  	bui_guild_of_craftsmen: "Guild of craftsmen",
  	bui_hall_of_the_dead: "Hall of the dead",
  	bui_hall_of_wisdom: "Hall of wisdom",
  	bui_hall_heroic_deeds: "Hall of heroic deeds",
  	bui_hall_heroic_deeds_part: "Hall of heroic deeds part",
  	bui_harbor_district: "Harbor district",
  	bui_harbor_district_part: "Harbor district part",
  	bui_harvest_shrine: "Harvest Shrine",
  	bui_holy_site: "Holy Site",
  	bui_holy_site_part: "Holy Site part",
  	bui_house_workers: "House of Workers",
  	bui_industrial_plant: "Industrial plant",
  	bui_island_outpost: "Island outpost",
  	bui_large_shed: "Large shed",
  	bui_large_warehouse: "Large storehouse",
  	bui_library_souls: "Library of SouLs",
  	bui_library_of_theresmore: "Library of Theresmore",
  	bui_logistic_center: "Logistic center",
  	bui_lucky_grove_b: "Lucky Grove",
  	bui_lucky_well_b: "Lucky Well",
  	bui_lumberjack_camp: "Lumberjack Camp",
  	bui_machines_of_gods: "Machines of gods",
  	bui_mana_extractors: "Mana extractors",
  	bui_mana_pit: "Mana pit",
  	bui_mana_pit_part: "Mana pit part",
  	bui_mana_reactor: "Mana reactor",
  	bui_mansion: "Mansion",
  	bui_magical_tower: "Magical tower",
  	bui_magic_circle: "Magic Circle",
  	bui_marketplace: "Marketplace",
  	bui_mausoleum_gods: "Mausoleum of gods",
  	bui_matter_transmuter: "Matter transmuter",
  	bui_mercenary_outpost: "Mercenary Outpost",
  	bui_military_academy: "Military academy",
  	bui_military_camp: "Military camp",
  	bui_mind_shrine: "Mind Shrine",
  	bui_ministry_development: "Ministry of Development",
  	bui_ministry_interior: "Ministry of Interior",
  	bui_ministry_war: "Ministry of War",
  	bui_ministry_worship: "Ministry of Worship",
  	bui_mine: "Mine",
  	bui_minefield: "Minefield",
  	bui_monastery: "Monastery",
  	bui_monument: "Monument",
  	bui_natronite_baloon: "Natronite balloon",
  	bui_natronite_depot: "Natronite depot",
  	bui_natronite_refinery: "Natronite refinery",
  	bui_natronite_shield: "Natronite shield",
  	bui_observatory: "Observatory",
  	bui_officer_training_ground: "Officer training ground",
  	bui_oracle_b: "The Oracle",
  	bui_palisade: "Palisade",
  	bui_palisade_unit: "Palisade part",
  	bui_pillars_of_mana: "Pillars of mana",
  	bui_pilgrim_camp: "Pilgrim camp",
  	bui_quarry: "Quarry",
  	bui_railway_station: "Railway station",
  	bui_rampart: "Rampart",
  	bui_rampart_unit: "Rampart part",
  	bui_reactivate_portal: "Portal of the dead",
  	bui_reactivate_portal_decryption: "Decryption of the portal",
  	bui_recruit_training_center: "Recruit training center",
  	bui_refinery: "Refinery",
  	bui_refugee_district: "Refugees district",
  	bui_refugee_district_part: "Refugees district part",
  	bui_research_plant: "Research plant",
  	bui_residential_block: "Residential block",
  	bui_sawmill: "Sawmill",
  	bui_school: "School",
  	bui_shed: "Shed",
  	bui_siege_workshop: "Siege workshop",
  	bui_souls: "Souls",
  	bui_soulstealer_citadel: "Soulstealer Citadel",
  	bui_spiritual_garden: "Spiritual garden",
  	bui_stable: "Stable",
  	bui_statue_atamar: "Statue of Atamar",
  	bui_statue_firio: "Statue of Firio",
  	bui_statue_lurezia: "Statue of Lurezia",
  	bui_statue_virtue: "Statue of Virtues",
  	bui_statue_virtue_part: "Statue of Virtues part",
  	bui_steelworks: "Steelworks",
  	bui_stock_exchange: "Stock exchange",
  	bui_stock_exchange_part: "Stock exchange part",
  	bui_storage_facility: "Storage facility",
  	bui_store: "Store",
  	bui_stonemason: "Stonemason",
  	bui_stronghold: "Stronghold",
  	bui_tax_revenue_checkpoints: "Tax revenue checkpoints",
  	bui_temple: "Temple",
  	bui_university: "University",
  	bui_valley_of_plenty: "Valley of plenty",
  	bui_wall: "Wall",
  	bui_wall_unit: "Wall part",
  	bui_war_shrine: "War Shrine",
  	bui_warehouse: "Warehouse",
  	bui_watchman_outpost: "Watchman Outpost",
  	bui_the_vaults: "The Vaults",
  	bui_titanic_walls: "Titanic Walls",
  	bui_titanic_walls_part: "Titanic Walls part",
  	bui_titan_work_area: "Titan Work Area",
  	bui_tower_mana: "Tower of mana",
  	bui_tower_mana_part: "Tower of mana part",
  	bui_trench: "Trench",
  	bui_undead_herd: "Undead Herds",
  	bui_underground_tunnel_b: "Underground tunnel",
  	dip_army_of_dragon: "The Red Dragon assault",
  	dip_army_of_goblin: "The Goblin assault",
  	dip_army_of_the_dead: "Army of the dead",
  	dip_barbarian_horde: "Barbarian Horde",
  	dip_send_delegation: "Send a delegation",
  	dip_relationships: "Relationships",
  	dip_fallen_angel_army_1: "The Fallen Angel musket army",
  	dip_fallen_angel_army_2: "The Fallen Angel demons army",
  	dip_improve_relationships: "Improve relationships",
  	dip_improve_relationships_abbr: "Improve",
  	dip_insult: "Insult",
  	dip_alliance: "Alliance",
  	dip_owned: "Conquered",
  	dip_trade_accept: "Accept trade agreement",
  	dip_trade_accept_abbr: "Accept",
  	dip_trade_cancel: "Cancel trade agreement",
  	dip_trade_cancel_abbr: "Cancel",
  	dip_trade_agreements: "Trade agreements",
  	dip_war: "War",
  	dip_war_confirm: "War confirm",
  	dip_war_declaration: "You are now at war with this faction, may the gods of Theresmore help us in battle to exterminate our enemies. Beware that the enemy army has been spotted near the border, they may launch an attack at any moment. Let's use our soldiers as a garrison or let's launch a terrible attack that will totally annihilate these filthy piles of dung",
  	dip_relationship_unknown: "Relationships unknown",
  	dip_relationship_negative: "Relationships negative",
  	dip_relationship_positive: "Relationships positive",
  	dip_relationship_neutral: "Relationships neutral",
  	dip_enso_multitude: "Enso Multitude",
  	dip_nightdale_protectorate: "Nightdale Protectorate",
  	dip_orc_horde_boss: "Orc horde assault",
  	dip_orc_war_party_1: "Orc war party",
  	dip_orc_war_party_2: "Orc war party",
  	dip_orc_war_party_3: "Orc war party",
  	dip_orc_war_party_4: "Orc war party",
  	dip_orc_war_party_5: "Orc war party",
  	dip_orc_war_party_6: "Orc war party",
  	dip_orc_war_party_7: "Orc war party",
  	dip_orc_war_party_8: "Orc war party",
  	dip_orc_war_party_9: "Orc war party",
  	dip_orc_war_party_10: "Orc war party",
  	dip_orc_war_party_11: "Orc war party",
  	dip_orc_war_party_12: "Orc war party",
  	dip_orc_war_party_13: "Orc war party",
  	dip_orc_war_party_14: "Orc war party",
  	dip_orc_war_party_15: "Orc war party",
  	dip_orc_war_party_16: "Orc war party",
  	dip_scalerock_tribes: "Scalerock Tribes",
  	dip_sssarkat_empire: "Sssarkat Empire",
  	dip_theresmore_wanders: "Theresmore Wanders",
  	dip_western_kingdom: "Western Kingdom",
  	dip_zultan_emirate: "Zultan Emirate",
  	dip_king_kobold_nation: "King Kobold Nation",
  	dip_lich_fortress: "Nikharul Soulstealer fortress",
  	ene_ancient_burial_place: "Ancient burial place",
  	ene_ancient_giant: "Ancient Giant",
  	ene_ancient_hideout: "Ancient hideout",
  	ene_harpy_nest: "Harpy Nest",
  	ene_ball_lightning_field: "Ball lightning field",
  	ene_bandit_camp: "Bandit Camp",
  	ene_barbarian_camp: "Barbarian camp",
  	ene_barbarian_village: "Barbarian Village",
  	ene_barren_hills: "Barren Hills",
  	ene_basilisk_cave: "Basilisk Cave",
  	ene_black_mage_tower: "Black Mage Tower",
  	ene_bugbear_tribe: "Bugbear tribe",
  	ene_bugbear_war_party: "Bugbear war party",
  	ene_burning_pit: "Burning Pit",
  	ene_cave_bats: "Cave of bats",
  	ene_citadel_dead: "Citadel of the dead",
  	ene_construction_site: "Construction site",
  	ene_deserters_den: "Deserter Den",
  	ene_demoness_castle: "Demoness castle",
  	ene_demonic_portal: "Demonic portal",
  	ene_desecrated_temple: "Desecrated Temple",
  	ene_djinn_palace: "Djinn Palace",
  	ene_east_sacred_place: "East sacred place",
  	ene_earth_elemental_circle: "Earth elemental circle",
  	ene_eternal_halls: "Eternal Halls",
  	ene_ettin_camp: "Ettin camp",
  	ene_ettin_enslaver: "Ettin enslavers",
  	ene_far_west_island: "Far west island",
  	ene_fire_elemental_circle: "Fire elemental circle",
  	ene_frost_elemental_circle: "Frost elemental circle",
  	ene_fire_salamander_nest: "Fire salamander nest",
  	ene_forgotten_shelter: "Galliard Forgotten Shelter",
  	ene_galliard_mercenary_camp: "Galliard mercenary camp",
  	ene_giant_temple: "Giant temple",
  	ene_gloomy_werewolf_forest: "Gloomy werewolf forest",
  	ene_goblin_lair: "Goblin lair",
  	ene_golem_cave: "Golem cave",
  	ene_gold_mine: "Gold Mine",
  	ene_gorgon_cave: "Gorgon cave",
  	ene_gnoll_camp: "Gnoll camp",
  	ene_gnoll_raiding_party: "Gnoll Raiding Party",
  	ene_gulud_ugdun: "Gulud Ugdun castle",
  	ene_haunted_library: "Haunted library",
  	ene_hell_hole: "Hell Hole",
  	ene_hobgoblin_chieftain: "Hobgoblin chieftain",
  	ene_hobgoblin_encampment: "Hobgoblin encampment",
  	ene_huge_cave: "Huge Cavern",
  	ene_hydra_pit: "Hydra pit",
  	ene_lead_golem_mine: "Lead golem mine",
  	ene_lich_temple: "Lich temple",
  	ene_king_reptiles: "The King of Reptiles",
  	ene_kobold_city: "Kobold City",
  	ene_kobold_looters: "Kobold looters",
  	ene_kobold_underground_tunnels: "Kobold tunnels",
  	ene_korrigan_dolmen: "Korrigan dolmen",
  	ene_markanat_forest: "Forest of Markanat",
  	ene_mercenary_camp: "Mercenary Camp",
  	ene_minotaur_maze: "Minotaur maze",
  	ene_myconid_cavern: "Myconid Cavern",
  	ene_mountain_cave: "Mountain Cave",
  	ene_mountain_valley: "Mountain Valley",
  	ene_naga_nest: "Naga Nest",
  	ene_nasty_pillagers: "Nasty pillagers",
  	ene_necromancer_crypt: "Necromancer Crypt",
  	ene_north_sacred_place: "North sacred place",
  	ene_old_herd: "Old herd",
  	ene_old_outpost: "Old outpost",
  	ene_old_storage_room: "Old storage room",
  	ene_orc_gormiak_citadel: "Orc Gormiak Citadel",
  	ene_orc_horith_citadel: "Orc Horith Citadel",
  	ene_orc_ogsog_citadel: "Orc Ogsog Citadel",
  	ene_orc_turgon_citadel: "Orc Turgon Citadel",
  	ene_orc_raiding_party: "Orc raiding party",
  	ene_orcish_prison_camp: "Orcish prison camp",
  	ene_prisoner_wagon: "Prisoner wagon",
  	ene_rat_cellar: "Rat cellar",
  	ene_rusted_warehouse: "Rusted warehouse",
  	ene_sleeping_titan: "A sleeping Titan",
  	ene_skullface_encampment: "Skullface encampment",
  	ene_snakes_nest: "Snakes nest",
  	ene_spider_forest: "Spider forest",
  	ene_son_atamar: "Son of Atamar",
  	ene_south_sacred_place: "South sacred place",
  	ene_strange_village: "A strange village",
  	ene_succubus_library: "Succubus Dark Library",
  	ene_swarm_wasp: "Giant Wasp swarm",
  	ene_temple_gargoyle: "Temple of gargoyles",
  	ene_troll_cave: "Troll Cave",
  	ene_vampire_crypt: "Vampire crypt",
  	ene_vampire_lair: "Vampire lair",
  	ene_wind_elemental_circle: "Wind elemental circle",
  	ene_west_sacred_place: "West sacred place",
  	ene_wolf_pack: "Wolf pack",
  	ene_worn_down_crypt: "Worn down crypt",
  	ene_wyvern_nest: "Wyvern Nest",
  	fai_accept_druid: "Accept the Druid",
  	fai_acolyte_hymn: "Acolyte hymn",
  	fai_ancient_spell_p: "Spell of the Ancients",
  	fai_amusement_quarter_f: "The Amusement Quarter",
  	fai_army_blessing: "Army blessing",
  	fai_army_faith: "Army of faith",
  	fai_banish_druid: "Banish the Druid",
  	fai_blessing_city: "City great blessing",
  	fai_blessing_church: "Church Blessing",
  	fai_blessing_prelate: "Blessing of the prelate",
  	fai_children_hope: "The Children Hope",
  	fai_city_blessing: "City blessing",
  	fai_control_fortress: "Rebuild the Fortress",
  	fai_create_sacred_golem: "Create a sacred golem",
  	fai_church_ritual: "Church ritual",
  	fai_dark_ritual: "Dark ritual",
  	fai_demonology: "Demonology",
  	fai_demoniac_tome: "Demoniac tome",
  	fai_desire_abundance: "Desire for Abundance",
  	fai_desire_magic: "Desire for Magic",
  	fai_desire_war: "Desire for War",
  	fai_dragon_armor: "Dragon armor",
  	fai_dragon_skull: "Dragon Skull",
  	fai_dragon_weapon: "Dragon weapon",
  	fai_druid_blessing: "Druid blessing",
  	fai_eureka_halls_f: "The Eureka Halls",
  	fai_praise_gods: "Praise gods",
  	fai_blessing: "Blessing",
  	fai_fate_shrine_f: "The Fate Shrine",
  	fai_holy_light: "Holy light",
  	fai_hope_children: "The children hope",
  	fai_lucky_grove_f: "A Lucky Grove",
  	fai_lucky_well_f: "A Lucky Well",
  	fai_pilgrim_chant: "Pilgrim chant",
  	fai_prayer_for_the_great_seeker: "The Great Seeker",
  	fai_great_seeker_2: "Great Seeker eyesight",
  	fai_prayer_for_mother_earth: "Mother Earth",
  	fai_mother_earth_2: "Mother Earth grace",
  	fai_prayer_for_the_old_small_one: "The Old Small One",
  	fai_old_small_one_2: "Old Small One grace",
  	fai_prayer_for_the_ancient_monk: "Ancient Monk",
  	fai_prayer_goddess_luck: "Goddess of Luck",
  	fai_prayer_for_the_great_warrior: "Great Warrior",
  	fai_prayer_lonely_druid: "Lonely Druid",
  	fai_great_warrior_2: "Great Warrior fury",
  	fai_prayer_for_the_great_builder: "Great Builder",
  	fai_prayer_for_the_mysterious_arcane: "Mysterious Arcane",
  	fai_prayer_wild_man: "Wild Man",
  	fai_wild_man_2: "Wild Man dexterity",
  	fai_unveil_theresmore: "Unveil Theresmore",
  	fai_sacred_place: "Sacred Place",
  	fai_strange_lamp: "A Strange Lamp",
  	fai_acolyte_circle: "Acolyte circle",
  	fai_goddess_luck_blessing: "Goddess Luck blessing",
  	fai_gold_consecration: "Consecration of Gold",
  	fai_great_builder_blessing: "Great Builder blessing",
  	fai_great_seeker_blessing: "Great Seeker blessing",
  	fai_great_seeker_eyesight: "Great Seeker eyesight",
  	fai_great_warrior_blessing: "Great Warrior blessing",
  	fai_great_warrior_fury: "Great Warrior fury",
  	fai_growth_nature: "Growth of Nature",
  	fai_growth_of_nature: "Growth of Nature",
  	fai_incremental_power: "Incremental power",
  	fai_lighten_rocks: "Lighten of rocks",
  	fai_lighten_of_rocks: "Lighten of rocks",
  	fai_magical_lights: "Magic lights",
  	fai_magic_lights: "Magic lights",
  	fai_magical_tools: "Magic tools",
  	fai_magic_tools: "Magic tools",
  	fai_mana_armor: "Mana armor",
  	fai_mana_defense: "Mana defense",
  	fai_mana_defense_II: "Mana defense II",
  	fai_mana_dome: "Mana dome",
  	fai_mana_energy_shield: "Mana energy shield",
  	fai_minor_blessing: "Minor blessing",
  	fai_mirune_blessing: "Mirune blessing",
  	fai_mother_earth_blessing: "Mother Earth blessing",
  	fai_mother_earth_grace: "Mother Earth grace",
  	fai_mysterious_arcane_blessing: "Mysterious Arcane blessing",
  	fai_new_world_chant: "New World Chant",
  	fai_northern_star_incremental: "Northern Star incremental",
  	fai_northern_star_power: "Northern Star power",
  	fai_northern_star_protection: "Northern Star protection",
  	fai_old_small_one_blessing: "Old Small One blessing",
  	fai_old_small_one_grace: "Old Small One grace",
  	fai_power_spell_east: "East Power Spell",
  	fai_power_spell_north: "North Power Spell",
  	fai_power_spell_south: "South Power Spell",
  	fai_power_spell_west: "West Power Spell",
  	fai_protection_power: "Protection power",
  	fai_sacred_armor: "Sacred armor",
  	fai_sacred_equipments: "Sacred equipments",
  	fai_sacred_equipments_II: "Sacred equipments II",
  	fai_sacred_weapon: "Sacred weapon",
  	fai_sacrifices_gods: "Sacrifices for the gods",
  	fai_shape_mana: "Shape mana",
  	fai_spear_wild_man: "Spear of the Wild",
  	fai_spell_accept: "Cast this spell",
  	fai_spell_cancel: "Cancel this spell",
  	fai_spell_ancient: "Spell of the Ancients",
  	fai_study_undead_creatures: "Study of undead creatures",
  	fai_summon_nikharul: "Summon Nikharul",
  	fai_temple_mirune: "Temple of Mirune",
  	fai_temple_ritual: "Temple ritual",
  	fai_the_aid: "Solve the crisis",
  	fai_theresmore_revealed: "Theresmore revealed",
  	fai_warrior_gods: "Warriors of the Gods",
  	fai_underground_tunnel_f: "The Underground Tunnel",
  	fai_wild_man_blessing: "Wild Man blessing",
  	fai_wild_man_spear: "Wild Man spear",
  	fai_wild_man_dexterity: "Wild Man dexterity",
  	fai_zenix_aid: "Realmwalker Zenix",
  	leg_acolyte_fate: "Acolyte of Fate",
  	leg_ancient_balor_l: "Ancient Balor",
  	leg_ancient_vault: "Ancient Vault",
  	leg_ancient_treasury: "Ancient Treasury",
  	leg_ancient_treasury_II: "Ancient Treasury II",
  	leg_ancient_treasury_III: "Ancient Treasury III",
  	leg_ancient_treasury_IV: "Ancient Treasury IV",
  	leg_angel: "Battle Angel",
  	leg_architecture_titan: "Architecture of the Titans",
  	leg_army_of_men: "Army of Men",
  	leg_army_of_men_II: "Army of Men II",
  	leg_army_of_men_III: "Army of Men III",
  	leg_army_of_men_IV: "Army of Men IV",
  	leg_army_of_men_V: "Army of Men V",
  	leg_cartomancer: "Cartomancer",
  	leg_cpt_galliard_story: "Captain Galliard Story",
  	leg_charism: "Charism",
  	leg_charism_II: "Charism II",
  	leg_clairvoyant: "Clairvoyant",
  	leg_clever_villagers: "Clever Villagers",
  	leg_clever_villagers_II: "Clever Villagers II",
  	leg_clever_villagers_III: "Clever Villagers III",
  	leg_coin_mercenary: "Coin Mercenary",
  	leg_cpt_galliard_l: "Cpt Galliard",
  	leg_craftmen: "Craftsmen",
  	leg_craftmen_II: "Craftsmen II",
  	leg_craftmen_III: "Craftsmen III",
  	leg_craftmen_IV: "Craftsmen IV",
  	leg_craftmen_V: "Craftsmen V",
  	leg_deep_pockets: "Deep Pockets",
  	leg_deep_pockets_II: "Deep Pockets II",
  	leg_deep_pockets_III: "Deep Pockets III",
  	leg_defensive_rampart: "Rampart",
  	leg_elysian_field: "Elysian Field",
  	leg_elysian_field_II: "Elysian Field II",
  	leg_elysian_field_III: "Elysian Field III",
  	leg_enhanced_axes: "Enhanced Axes",
  	leg_enhanced_axes_II: "Enhanced Axes II",
  	leg_enhanced_axes_III: "Enhanced Axes III",
  	leg_enhanced_axes_IV: "Enhanced Axes IV",
  	leg_enhanced_pickaxes: "Enhanced Pickaxes",
  	leg_enhanced_pickaxes_II: "Enhanced Pickaxes II",
  	leg_enhanced_pickaxes_III: "Enhanced Pickaxes III",
  	leg_enhanced_pickaxes_IV: "Enhanced Pickaxes IV",
  	leg_fortune_teller: "Fortune Teller",
  	leg_free_hands: "Free Hands",
  	leg_free_hands_II: "Free Hands II",
  	leg_free_hands_III: "Free Hands III",
  	leg_free_hands_IV: "Free Hands IV",
  	leg_grain_storage: "Grain storage",
  	leg_gift_creators: "Gift from the Creators",
  	leg_gift_nature: "Gift of Nature",
  	leg_guild_craftsmen: "Guild of craftsmen",
  	leg_juggernaut: "Juggernaut",
  	leg_hall_dead: "Hall of the Dead",
  	leg_hall_wisdom: "Hall of Wisdom",
  	leg_heirloom_contract: "Heirloom of the Contract",
  	leg_heirloom_death: "Heirloom of the Death",
  	leg_heirloom_horseshoes: "Heirloom of the Horseshoes",
  	leg_heirloom_momento: "Heirloom of the Momento",
  	leg_heirloom_wealth: "Heirloom of the Wealth",
  	leg_heirloom_wisdom: "Heirloom of the Wisdom",
  	leg_irrigation_techniques: "Irrigation Techniques",
  	leg_irrigation_techniques_II: "Irrigation Techniques II",
  	leg_irrigation_techniques_III: "Irrigation Techniques III",
  	leg_irrigation_techniques_IV: "Irrigation Techniques IV",
  	leg_library_theresmore: "Library of Theresmore",
  	leg_militia_recruitment: "Militia recruitment",
  	leg_ministry_interior_l: "Ministry of Interior",
  	leg_ministry_war_l: "Ministry of War",
  	leg_ministry_worship_l: "Ministry of Worship",
  	leg_machines_gods: "Machines of the Gods",
  	leg_mercenary_agreements: "Mercenary agreements",
  	leg_mercenary_agreements_II: "Mercenary agreements II",
  	leg_mercenary_agreements_III: "Mercenary agreements III",
  	leg_monastic_orders: "Monastic orders",
  	leg_monument_1: "Monument",
  	leg_powered_weapons: "Powered Weapons",
  	leg_powered_weapons_II: "Powered Weapons II",
  	leg_powered_weapons_III: "Powered Weapons III",
  	leg_powered_weapons_IV: "Powered Weapons IV",
  	leg_powered_weapons_V: "Powered Weapons V",
  	leg_powered_weapons_VI: "Powered Weapons VI",
  	leg_powered_weapons_VII: "Powered Weapons VII",
  	leg_priest: "Priest",
  	leg_regional_market: "Regional Markets",
  	leg_renowned_stonemasons: "Renowned Stonemasons",
  	leg_renowned_stonemasons_II: "Renowned Stonemasons II",
  	leg_renowned_stonemasons_III: "Renowned Stonemasons III",
  	leg_renowned_stonemasons_IV: "Renowned Stonemasons IV",
  	leg_resource_cap: "Resource Cap",
  	leg_resource_cap_II: "Resource Cap II",
  	leg_resource_cap_III: "Resource Cap III",
  	leg_resource_cap_IV: "Resource Cap IV",
  	leg_resource_cap_V: "Resource Cap V",
  	leg_resource_cap_VI: "Resource Cap VI",
  	leg_resource_cap_VII: "Resource Cap VII",
  	leg_resource_cap_VIII: "Resource Cap VIII",
  	leg_seraphim_l: "Seraphim",
  	leg_shieldbearer: "Shieldbearer",
  	leg_shopkeepers_and_breeders: "Shopkeepers and Breeders",
  	leg_shopkeepers_and_breeders_II: "Shopkeepers and Breeders II",
  	leg_shopkeepers_and_breeders_III: "Shopkeepers and Breeders III",
  	leg_soothsayer: "Soothsayer",
  	leg_spikes_and_pits: "Spikes and Pits",
  	leg_spikes_and_pits_II: "Spikes and Pits II",
  	leg_spikes_and_pits_III: "Spikes and Pits III",
  	leg_spikes_and_pits_IV: "Spikes and Pits IV",
  	leg_spikes_and_pits_V: "Spikes and Pits V",
  	leg_stock_resources: "Stock Resources",
  	leg_stock_resources_II: "Stock Resources II",
  	leg_stonemason_l: "Stonemason",
  	leg_strengthening_faith: "Strengthening Faith",
  	leg_strengthening_faith_II: "Strengthening Faith II",
  	leg_strong_workers: "Strong Workers",
  	leg_strong_workers_II: "Strong Workers II",
  	leg_train_colonial: "Train Colonial Army",
  	leg_train_colonial_II: "Train Colonial Army II",
  	leg_undead_herds: "Undead Herds",
  	leg_wall_titan: "Titanic Walls",
  	leg_weapons_titan: "Weapons of the Titan",
  	leg_white_m_company: "White Company",
  	leg_woodworking: "Woodworking",
  	leg_zenix_familiar_l: "Zenix Familiar",
  	not_academy_of_freethinkers: "Freethinkers united",
  	not_academy_of_freethinkers_title: "Academy of Freethinkers",
  	not_arch_triumph: "Per omnia asperrima",
  	not_arch_triumph_title: "Arch of Triumph",
  	not_army_of_goblin: "Crushing goblins",
  	not_army_of_goblin_title: "Survive the moonlight night",
  	not_army_of_goblin_dif_99: "Crushing goblins on Easy!",
  	not_army_of_goblin_dif_99_title: "Survive the easy moonlight night",
  	not_army_of_goblin_dif_1: "Crushing goblins on Hard!",
  	not_army_of_goblin_dif_1_title: "Survive the hard moonlight night",
  	not_army_of_goblin_dif_2: "Crushing goblins on Impossible!",
  	not_army_of_goblin_dif_2_title: "Survive the impossible moonlight night",
  	not_army_of_goblin_dif_3: "Crushing goblins on Deity!",
  	not_army_of_goblin_dif_3_title: "Survive the deity moonlight night",
  	not_army_of_dragon: "Chasing away the dragon",
  	not_army_of_dragon_title: "Survive the dragon assault",
  	not_army_of_dragon_dif_99: "Chasing away the dragon on Easy!",
  	not_army_of_dragon_dif_99_title: "Survive the easy dragon assault",
  	not_army_of_dragon_dif_1: "Chasing away the dragon on Hard!",
  	not_army_of_dragon_dif_1_title: "Survive the hard dragon assault",
  	not_army_of_dragon_dif_2: "Chasing away the dragon on Impossible!",
  	not_army_of_dragon_dif_2_title: "Survive the impossible dragon assault",
  	not_army_of_dragon_dif_3: "Chasing away the dragon on Deity!",
  	not_army_of_dragon_dif_3_title: "Survive the deity dragon assault",
  	not_automated_complex: "Bip Bip Bip",
  	not_automated_complex_title: "Automated Complex",
  	not_bugbear_war_party_dif_1: "Defeat the Bugbear War Party",
  	not_bugbear_war_party_dif_1_title: "Defeat the Bugbear War Party on Hard",
  	not_bugbear_war_party_dif_2: "Destroy the Bugbear War Party",
  	not_bugbear_war_party_dif_2_title: "Defeat the Bugbear War Party on Impossible",
  	not_bugbear_war_party_dif_3: "Eradicate the Bugbear War Party",
  	not_bugbear_war_party_dif_3_title: "Defeat the Bugbear War Party on DEITY!",
  	not_citadel_dead_dif_1: "Conquer the Citadel of the Dead",
  	not_citadel_dead_dif_1_title: "Conquer the Citadel of the Dead on Hard",
  	not_citadel_dead_dif_2: "Destroy the Citadel of the Dead",
  	not_citadel_dead_dif_2_title: "Conquer the Citadel of the Dead on Impossible",
  	not_citadel_dead_dif_3: "Purge the Citadel of the Dead",
  	not_citadel_dead_dif_3_title: "Conquer the Citadel of the Dead on DEITY!",
  	not_city_lights: "A City of Lights",
  	not_city_lights_title: "City of Lights",
  	not_demoness_castle_dif_1: "Conquer the Demoness Castle",
  	not_demoness_castle_dif_1_title: "Conquer the Demoness Castle on Hard",
  	not_demoness_castle_dif_2: "Demolish the Demoness Castle",
  	not_demoness_castle_dif_2_title: "Demolish the Demoness Castle on Impossible",
  	not_demoness_castle_dif_3: "Annihilate the Demoness Castle",
  	not_demoness_castle_dif_3_title: "Annihilate the Demoness Castle on DEITY!",
  	not_fallen_angel_army_1: "Trusting the Druid",
  	not_fallen_angel_army_1_title: "Survive the Druid's betrayal",
  	not_fallen_angel_army_1_dif_99: "Trusting the Druid on Easy!",
  	not_fallen_angel_army_1_dif_99_title: "Survive the easy Druid's betrayal",
  	not_fallen_angel_army_1_dif_1: "Trusting the Druid on Hard!",
  	not_fallen_angel_army_1_dif_1_title: "Survive the hard Druid's betrayal",
  	not_fallen_angel_army_1_dif_2: "Trusting the Druid on Impossible!",
  	not_fallen_angel_army_1_dif_2_title: "Survive the impossible Druid's betrayal",
  	not_fallen_angel_army_1_dif_3: "Trusting the Druid on Deity!",
  	not_fallen_angel_army_1_dif_3_title: "Survive the deity Druid's betrayal",
  	not_fallen_angel_army_2: "Friend of no one",
  	not_fallen_angel_army_2_title: "Survive the Fallen Angel attack",
  	not_fallen_angel_army_2_dif_99: "Friend of no one on Easy!",
  	not_fallen_angel_army_2_dif_99_title: "Survive the easy Fallen Angel attack",
  	not_fallen_angel_army_2_dif_1: "Friend of no one on Hard!",
  	not_fallen_angel_army_2_dif_1_title: "Survive the hard Fallen Angel attack",
  	not_fallen_angel_army_2_dif_2: "Friend of no one on Impossible!",
  	not_fallen_angel_army_2_dif_2_title: "Survive the impossible Fallen Angel attack",
  	not_fallen_angel_army_2_dif_3: "Friend of no one on Deity!",
  	not_fallen_angel_army_2_dif_3_title: "Survive the deity Fallen Angel attack",
  	not_gloomy_werewolf_forest_dif_1: "Slain Werewolf",
  	not_gloomy_werewolf_forest_dif_1_title: "Conquer the Werewolf Forest on Hard",
  	not_gloomy_werewolf_forest_dif_2: "Silverbullet",
  	not_gloomy_werewolf_forest_dif_2_title: "Conquer the Werewolf Forest on Impossible",
  	not_gloomy_werewolf_forest_dif_3: "Rain of silverbullets",
  	not_gloomy_werewolf_forest_dif_3_title: "Conquer the Werewolf Forest on DEITY!",
  	not_gold_mine_dif_1: "Secure the Gold Mine",
  	not_gold_mine_dif_1_title: "Conquer the Gold Mine on Hard",
  	not_gold_mine_dif_2: "Exploit the Gold Mine",
  	not_gold_mine_dif_2_title: "Conquer the Gold Mine on Impossible",
  	not_gold_mine_dif_3: "Master the Gold Mine",
  	not_gold_mine_dif_3_title: "Conquer the Gold Mine on DEITY!",
  	not_gnoll_camp_dif_1: "Clear the Gnoll Camp",
  	not_gnoll_camp_dif_1_title: "Conquer the Gnoll Camp on Hard",
  	not_gnoll_camp_dif_2: "Raid the Gnoll Camp",
  	not_gnoll_camp_dif_2_title: "Conquer the Gnoll Camp on Impossible",
  	not_gnoll_camp_dif_3: "Annihilate the Gnoll Camp",
  	not_gnoll_camp_dif_3_title: "Conquer the Gnoll Camp on DEITY!",
  	not_gulud_ugdun_dif_1: "Clear Gulud Ugdun",
  	not_gulud_ugdun_dif_1_title: "Conquer Gulud Ugdun on Hard",
  	not_gulud_ugdun_dif_2: "Conquer Gulud Ugdun",
  	not_gulud_ugdun_dif_2_title: "Conquer Gulud Ugdun on Impossible",
  	not_gulud_ugdun_dif_3: "Master Gulud Ugdun",
  	not_gulud_ugdun_dif_3_title: "Conquer Gulud Ugdun on DEITY!",
  	not_hell_hole_dif_1: "Exorcise demons",
  	not_hell_hole_dif_1_title: "Clean up the hell hole on Hard",
  	not_hell_hole_dif_2: "Destroying demons",
  	not_hell_hole_dif_2_title: "Clean up the hell hole on Impossible",
  	not_hell_hole_dif_3: "Exterminate demons",
  	not_hell_hole_dif_3_title: "Clean up the hell hole on DEITY!",
  	not_mountain_valley_dif_1: "Conquer the Mountain Valley",
  	not_mountain_valley_dif_1_title: "Conquer the Mountain Valley on Hard",
  	not_mountain_valley_dif_2: "Conquer the Mountain Valley",
  	not_mountain_valley_dif_2_title: "Conquer the Mountain Valley on Impossible",
  	not_mountain_valley_dif_3: "Master the Mountain Valley",
  	not_mountain_valley_dif_3_title: "Conquer the Mountain Valley on DEITY!",
  	not_sleeping_titan_dif_1: "Awaken the Sleeping Titan",
  	not_sleeping_titan_dif_1_title: "Awaken the Sleeping Titan on Hard",
  	not_sleeping_titan_dif_2: "Awaken the Sleeping Titan",
  	not_sleeping_titan_dif_2_title: "Awaken the Sleeping Titan on Impossible",
  	not_sleeping_titan_dif_3: "Awaken the Sleeping Titan",
  	not_sleeping_titan_dif_3_title: "Awaken the Sleeping Titan on DEITY!",
  	not_son_atamar_dif_1: "Discover the Son of Atamar",
  	not_son_atamar_dif_1_title: "Discover Son Atamar on Hard",
  	not_son_atamar_dif_2: "Unravel the Mysteries of Son Atamar",
  	not_son_atamar_dif_2_title: "Unravel the Mysteries of Son Atamar on Impossible",
  	not_son_atamar_dif_3: "Master the Son of Atamar",
  	not_son_atamar_dif_3_title: "Master the Son of Atamar on DEITY!",
  	not_succubus_library_dif_1: "Explore the Succubus Library",
  	not_succubus_library_dif_1_title: "Explore the Succubus Library on Hard",
  	not_succubus_library_dif_2: "Study the Succubus Library",
  	not_succubus_library_dif_2_title: "Conquer the Succubus Library on Impossible",
  	not_succubus_library_dif_3: "Conquer the Secrets of the Succubus Library",
  	not_succubus_library_dif_3_title: "Conquer the Succubus Library on DEITY!",
  	not_swarm_wasp_dif_1: "Defeat the Swarm of Wasp",
  	not_swarm_wasp_dif_1_title: "Defeat the Swarm of Wasp on Hard",
  	not_swarm_wasp_dif_2: "Exterminate the Swarm of Wasp Infestation",
  	not_swarm_wasp_dif_2_title: "Exterminate the Swarm of Wasp on Impossible",
  	not_swarm_wasp_dif_3: "Annihilate the Swarm of Wasp",
  	not_swarm_wasp_dif_3_title: "Annihilate the Swarm of Wasp on DEITY!",
  	not_huge_cave_dif_1: "Explore the Huge Cave",
  	not_huge_cave_dif_1_title: "Explore the Huge Cave on Hard",
  	not_huge_cave_dif_2: "Navigate the Treacherous Paths of the Huge Cave",
  	not_huge_cave_dif_2_title: "Conquer the Huge Cave on Impossible",
  	not_huge_cave_dif_3: "Conquer the Depths of the Huge Cave",
  	not_huge_cave_dif_3_title: "Conquer the Depths of the Huge Cave on DEITY!",
  	not_vampire_lair_dif_1: "Slay the Vampires",
  	not_vampire_lair_dif_1_title: "Slay the Vampires on Hard",
  	not_vampire_lair_dif_2: "Destroy the Vampire Lair",
  	not_vampire_lair_dif_2_title: "Destroy the Vampire Lair on Impossible",
  	not_vampire_lair_dif_3: "Eradicate the Vampiric Menace",
  	not_vampire_lair_dif_3_title: "Eradicate the Vampiric Menace on DEITY!",
  	not_forgotten_shelter_dif_1: "Uncover the Secrets of the Forgotten Shelter",
  	not_forgotten_shelter_dif_1_title: "Uncover the Forgotten Shelter on Hard",
  	not_forgotten_shelter_dif_2: "Survive the Dangers of the Forgotten Shelter",
  	not_forgotten_shelter_dif_2_title: "Survive the Forgotten Shelter on Impossible",
  	not_forgotten_shelter_dif_3: "Discover the Truth Behind the Forgotten Shelter",
  	not_forgotten_shelter_dif_3_title: "Discover the Forgotten Shelter on DEITY!",
  	not_ancient_giant_dif_1: "Defeat the Ancient Giant",
  	not_ancient_giant_dif_1_title: "Defeat the Ancient Giant on Hard",
  	not_ancient_giant_dif_2: "Subdue the Ancient Giant",
  	not_ancient_giant_dif_2_title: "Subdue the Ancient Giant on Impossible",
  	not_ancient_giant_dif_3: "Overcome the Ancient Giant",
  	not_ancient_giant_dif_3_title: "Overcome the Ancient Giant on DEITY!",
  	not_skullface_encampment_dif_1: "Infiltrate Skullface Encampment",
  	not_skullface_encampment_dif_1_title: "Infiltrate Skullface Encampment on Hard",
  	not_skullface_encampment_dif_2: "Raze Skullface Encampment",
  	not_skullface_encampment_dif_2_title: "Raze Skullface Encampment on Impossible",
  	not_skullface_encampment_dif_3: "Conquer Skullface Encampment",
  	not_skullface_encampment_dif_3_title: "Conquer Skullface Encampment on DEITY!",
  	not_minotaur_maze_dif_1: "Navigate the Minotaur Maze",
  	not_minotaur_maze_dif_1_title: "Navigate the Minotaur Maze on Hard",
  	not_minotaur_maze_dif_2: "Conquer the Minotaur Maze",
  	not_minotaur_maze_dif_2_title: "Conquer the Minotaur Maze on Impossible",
  	not_minotaur_maze_dif_3: "Master the Minotaur Maze",
  	not_minotaur_maze_dif_3_title: "Master the Minotaur Maze on DEITY!",
  	not_markanat_forest_dif_1: "Explore the Markanat Forest",
  	not_markanat_forest_dif_1_title: "Explore the Markanat Forest on Hard",
  	not_markanat_forest_dif_2: "Survive the Perils of the Markanat Forest",
  	not_markanat_forest_dif_2_title: "Survive the Markanat Forest on Impossible",
  	not_markanat_forest_dif_3: "Conquer the Dark Heart of the Markanat Forest",
  	not_markanat_forest_dif_3_title: "Conquer the Markanat Forest on DEITY!",
  	not_hydra_pit_dif_1: "Conquer the Hydra Pit",
  	not_hydra_pit_dif_1_title: "Conquer the Hydra Pit on Hard",
  	not_hydra_pit_dif_2: "Defeat the Ancient Hydra",
  	not_hydra_pit_dif_2_title: "Defeat the Ancient Hydra on Impossible",
  	not_hydra_pit_dif_3: "Slay the Legendary Hydra",
  	not_hydra_pit_dif_3_title: "Slay the Legendary Hydra on DEITY!",
  	not_hobgoblin_chieftain_dif_1: "Challenge the Hobgoblin Chieftain",
  	not_hobgoblin_chieftain_dif_1_title: "Challenge the Hobgoblin Chieftain on Hard",
  	not_hobgoblin_chieftain_dif_2: "Defeat the Hobgoblin Chieftain",
  	not_hobgoblin_chieftain_dif_2_title: "Defeat the Hobgoblin Chieftain on Impossible",
  	not_hobgoblin_chieftain_dif_3: "Overthrow the Hobgoblin Chieftain",
  	not_hobgoblin_chieftain_dif_3_title: "Overthrow the Hobgoblin Chieftain on DEITY!",
  	not_gorgon_cave_dif_1: "Explore the Gorgon Cave",
  	not_gorgon_cave_dif_1_title: "Explore the Gorgon Cave on Hard",
  	not_gorgon_cave_dif_2: "Survive the Gorgon Cave",
  	not_gorgon_cave_dif_2_title: "Survive the Gorgon Cave on Impossible",
  	not_gorgon_cave_dif_3: "Conquer the Gorgon Cave",
  	not_gorgon_cave_dif_3_title: "Conquer the Gorgon Cave on DEITY!",
  	not_orc_horde_boss: "Human Last Stand",
  	not_orc_horde_boss_title: "Survive the Orc Horde",
  	not_orc_horde_boss_dif_99: "Human Last Stand on Easy!",
  	not_orc_horde_boss_dif_99_title: "Survive the easy Orc Horde",
  	not_orc_horde_boss_dif_1: "Human Last Stand on Hard!",
  	not_orc_horde_boss_dif_1_title: "Survive the hard Orc Horde",
  	not_orc_horde_boss_dif_2: "Human Last Stand on Impossible!",
  	not_orc_horde_boss_dif_2_title: "Survive the impossible Orc Horde",
  	not_orc_horde_boss_dif_3: "Human Last Stand on Deity!",
  	not_orc_horde_boss_dif_3_title: "Survive the deity Orc Horde",
  	not_harbor_district: "Seafaring",
  	not_harbor_district_title: "Harbor District",
  	not_holy_site: "Bastion of Faith!",
  	not_holy_site_title: "Holy Site",
  	not_persuade_nobility: "Paying bribes",
  	not_persuade_nobility_title: "Persuade the Nobility",
  	not_fortified_citadel: "Invincible Fortress",
  	not_fortified_citadel_title: "Fortified Citadel",
  	not_library_souls: "Forbidden knowledge",
  	not_library_souls_title: "Library of SouLs",
  	not_loved_people: "Acclaimed by the people",
  	not_loved_people_title: "Persuade the people",
  	not_statue_virtue: "The Virtues of Humanity",
  	not_statue_virtue_title: "Statue of Virtues",
  	not_5_alchemic_laboratory: "Mad scientists",
  	not_5_alchemic_laboratory_title: "5 Alchemic Laboratory",
  	not_15_alchemic_laboratory: "Midas Hand",
  	not_15_alchemic_laboratory_title: "15 Alchemic Laboratory",
  	not_5_alchemist_complex: "Alchemy of the new world",
  	not_5_alchemist_complex_title: "5 Alchemist Complex",
  	not_15_alchemist_complex: "Producing Saltpetre",
  	not_15_alchemist_complex_title: "15 Alchemist Complex",
  	not_25_alchemist_complex: "Powderpuff",
  	not_25_alchemist_complex_title: "25 Alchemist Complex",
  	not_5_altar_of_sacrifices: "Holy slaughter",
  	not_5_altar_of_sacrifices_title: "5 Altar of Sacrifices",
  	not_15_altar_of_sacrifices: "Aztec purification",
  	not_15_altar_of_sacrifices_title: "15 Altar of Sacrifices",
  	not_tab_army: "We can start train archers and scouts",
  	not_tab_army_title: "Army",
  	not_10_artillery_firing: "Ready? Fire!",
  	not_10_artillery_firing_title: "10 Artillery Firing Range",
  	not_5_artisan_workshop: "Shaping the pot",
  	not_5_artisan_workshop_title: "5 Artisan Workshop",
  	not_15_artisan_workshop: "Handicraft area",
  	not_15_artisan_workshop_title: "15 Artisan Workshop",
  	not_30_artisan_workshop: "Handicraft city",
  	not_30_artisan_workshop_title: "30 Artisan Workshop",
  	not_5_artisans_complex: "Exploiting the colony",
  	not_5_artisans_complex_title: "5 Artisan Complex",
  	not_15_artisans_complex: "Exploiting the new world",
  	not_15_artisans_complex_title: "15 Artisan Complex",
  	not_25_artisans_complex: "A lot of raw materials",
  	not_25_artisans_complex_title: "25 Artisan Complex",
  	not_attack_incoming: "Our watchmen have discovered an impending attack! TO THE WALLS!",
  	not_attack_incoming_title: "An attack is coming",
  	not_4_ballista: "Great crossbows",
  	not_4_ballista_title: "4 Ballista",
  	not_5_bank: "Towards economic prestige",
  	not_5_bank_title: "5 Bank",
  	not_15_bank: "Monopoly",
  	not_15_bank_title: "15 Bank",
  	not_5_barracks: "Marching chant echoing",
  	not_5_barracks_title: "5 Barracks",
  	not_15_barracks: "Echoing drills",
  	not_15_barracks_title: "15 Barracks",
  	not_30_barracks: "Military city",
  	not_30_barracks_title: "30 Barracks",
  	not_5_builders_complex: "Colony builders",
  	not_5_builders_complex_title: "5 Builder Complex",
  	not_15_builders_complex: "Colony hard builders",
  	not_15_builders_complex_title: "15 Builder Complex",
  	not_25_builders_complex: "Colony epic builders",
  	not_25_builders_complex_title: "25 Builder Complex",
  	not_5_carpenter_workshop: "Building material",
  	not_5_carpenter_workshop_title: "5 Carpenter Workshop",
  	not_15_carpenter_workshop: "Building a city",
  	not_15_carpenter_workshop_title: "15 Carpenter Workshop",
  	not_cathedral: "A sacred place",
  	not_cathedral_title: "Build the Cathedral",
  	not_city_center: "We build better cities",
  	not_city_center_title: "Build the City Center",
  	not_5_colony_hall: "Building a colony",
  	not_5_colony_hall_title: "5 Colony Hall",
  	not_10_colony_hall: "Evolving a colony",
  	not_10_colony_hall_title: "10 Colony Hall",
  	not_15_colony_hall: "Mastering a colony",
  	not_15_colony_hall_title: "15 Colony Hall",
  	not_5_common_house: "A small Village",
  	not_5_common_house_title: "5 Common House",
  	not_15_common_house: "A growing Village",
  	not_15_common_house_title: "15 Common House",
  	not_30_common_house: "More than a Village",
  	not_30_common_house_title: "30 Common House",
  	not_5_city_hall: "Administrative center",
  	not_5_city_hall_title: "5 City Hall",
  	not_15_city_hall: "Bureaucratic center",
  	not_15_city_hall_title: "15 City Hall",
  	not_25_city_hall: "A well-administered City",
  	not_25_city_hall_title: "25 City Hall",
  	not_5_elf_encampment: "Elf friend",
  	not_5_elf_encampment_title: "5 Elf Encampment",
  	not_10_elf_encampment: "Elf connoisseur",
  	not_10_elf_encampment_title: "10 Elf Encampment",
  	not_5_elf_village: "Pointed ears",
  	not_5_elf_village_title: "5 Elf Village",
  	not_10_elf_village: "Natives of Theresmore",
  	not_10_elf_village_title: "10 Elf Village",
  	not_5_mansion: "A feudal tradition",
  	not_5_mansion_title: "5 Mansion",
  	not_15_mansion: "A suburb in the city",
  	not_15_mansion_title: "15 Mansion",
  	not_25_mansion: "Historical center",
  	not_25_mansion_title: "25 Mansion",
  	not_5_residential_block: "City under construction",
  	not_5_residential_block_title: "5 Residential Block",
  	not_15_residential_block: "A great City",
  	not_15_residential_block_title: "15 Residential Block",
  	not_25_residential_block: "Metropolis",
  	not_25_residential_block_title: "25 Residential Block",
  	not_5_gan_eden: "The garden of eden",
  	not_5_gan_eden_title: "5 Gan Eden",
  	not_15_gan_eden: "The garden of the gods",
  	not_15_gan_eden_title: "15 Gan Eden",
  	not_25_gan_eden: "Heaven on Theresmore",
  	not_25_gan_eden_title: "25 Gan Eden",
  	not_5_industrial_plant: "Industrial hub",
  	not_5_industrial_plant_title: "5 Industrial Plant",
  	not_15_industrial_plant: "Industrial zone",
  	not_15_industrial_plant_title: "15 Industrial Plant",
  	not_25_industrial_plant: "Industrial city",
  	not_25_industrial_plant_title: "25 Industrial Plant",
  	not_5_natronite_refinery: "Natronite production",
  	not_5_natronite_refinery_title: "5 Natronite Refinery",
  	not_15_natronite_refinery: "Natronite city",
  	not_15_natronite_refinery_title: "15 Natronite Refinery",
  	not_25_natronite_refinery: "Impossible level of Natronite",
  	not_25_natronite_refinery_title: "25 Natronite Refinery",
  	not_5_builder_district: "An aid to builders",
  	not_5_builder_district_title: "5 Builder District",
  	not_15_builder_district: "Builders of cities",
  	not_15_builder_district_title: "15 Builder District",
  	not_25_builder_district: "Builders of Theresmore",
  	not_25_builder_district_title: "25 Builder District",
  	not_5_research_plant: "Researching Theresmore",
  	not_5_research_plant_title: "5 Research Plant",
  	not_15_research_plant: "No more secrets",
  	not_15_research_plant_title: "15 Research Plant",
  	not_25_research_plant: "Theresmore REVEALED",
  	not_25_research_plant_title: "25 Research Plant",
  	not_5_factory: "Assembly line",
  	not_5_factory_title: "5 Factory",
  	not_15_factory: "Blue collar",
  	not_15_factory_title: "15 Factory",
  	not_5_farm: "The pleasure of growing grass",
  	not_5_farm_title: "5 Farm",
  	not_15_farm: "Farming center",
  	not_15_farm_title: "15 Farm",
  	not_30_farm: "Farming city",
  	not_30_farm_title: "30 Farm",
  	not_5_granary: "Hunting for mice",
  	not_5_granary_title: "5 Granary",
  	not_15_granary: "Great Silos",
  	not_15_granary_title: "15 Granary",
  	not_25_granary: "Huge Silos",
  	not_25_granary_title: "25 Granary",
  	not_5_fiefdom: "Feudalism",
  	not_5_fiefdom_title: "5 Fiefdom",
  	not_15_fiefdom: "Feudalism and Liberty",
  	not_15_fiefdom_title: "15 Fiefdom",
  	not_5_foundry: "Hot forging",
  	not_5_foundry_title: "5 Foundry",
  	not_15_foundry: "Melting city",
  	not_15_foundry_title: "15 Foundry",
  	not_5_fortune_grove: "A bit of luck",
  	not_5_fortune_grove_title: "5 Fortune Grove",
  	not_15_fortune_grove: "A lot of luck",
  	not_15_fortune_grove_title: "15 Fortune Grove",
  	not_great_bombard: "Great Bombard",
  	not_great_bombard_title: "Build the Great Bombard",
  	not_great_fair: "Come on gentlemen",
  	not_great_fair_title: "Build the Great Fair",
  	not_5_grocery: "A local mall",
  	not_5_grocery_title: "5 Grocery",
  	not_15_grocery: "A regional mall",
  	not_15_grocery_title: "15 Grocery",
  	not_5_guarded_storehouse: "A guarded place",
  	not_5_guarded_storehouse_title: "5 Guarded Storehouse",
  	not_15_guarded_storehouse: "More guarded places",
  	not_15_guarded_storehouse_title: "15 Guarded Storehouse",
  	not_ios_install: "To add this app to the home screen tap the share icon and then Add to Home Screen",
  	not_ios_install_title: "Add to Home Screen",
  	not_new_kingdom: "You've discovered a new kingdom",
  	not_new_kingdom_title: "New kingdom",
  	not_5_large_shed: "The battle for Caps",
  	not_5_large_shed_title: "5 Large Shed",
  	not_15_large_shed: "Battle raging on",
  	not_15_large_shed_title: "15 Large Shed",
  	not_25_large_shed: "Did we win?",
  	not_25_large_shed_title: "25 Large Shed",
  	not_5_large_warehouse: "Finally a little more space",
  	not_5_large_warehouse_title: "5 Large Storehouse",
  	not_15_large_warehouse: "Finally a lot more space",
  	not_15_large_warehouse_title: "15 Large Storehouse",
  	not_5_logistic_center: "Peddling goods",
  	not_5_logistic_center_title: "5 Logistic Center",
  	not_15_logistic_center: "Logistical center",
  	not_15_logistic_center_title: "15 Logistic Center",
  	not_5_lumberjack_camp: "Tree after tree",
  	not_5_lumberjack_camp_title: "5 Lumberjack Camp",
  	not_15_lumberjack_camp: "Lumber Passion",
  	not_15_lumberjack_camp_title: "15 Lumberjack Camp",
  	not_30_lumberjack_camp: "Lumber dedication",
  	not_30_lumberjack_camp_title: "30 Lumberjack Camp",
  	not_5_mana_reactor: "Unstable reactor",
  	not_5_mana_reactor_title: "5 Mana Reactor",
  	not_10_mana_reactor: "Mana Energy!",
  	not_10_mana_reactor_title: "10 Mana Reactor",
  	not_8_magical_tower: "Tower Defense",
  	not_8_magical_tower_title: "8 Magical Tower",
  	not_8_minefield: "A safe city",
  	not_8_minefield_title: "8 Minefield",
  	not_4_natronite_baloon: "Airborne lookout",
  	not_4_natronite_baloon_title: "4 Natronite Baloon",
  	not_5_officer_training_ground: "Instructing army officers",
  	not_5_officer_training_ground_title: "5 Officer Training Ground",
  	not_5_magic_circle: "A flow of mana",
  	not_5_magic_circle_title: "5 Magic Circle",
  	not_15_magic_circle: "A river of mana",
  	not_15_magic_circle_title: "15 Magic Circle",
  	not_mana_pit: "A hole full of mana",
  	not_mana_pit_title: "Mana Pit",
  	not_tab_magic: "We have access to prayers and spells",
  	not_tab_magic_title: "Magic",
  	not_tab_marketplace: "Finally the market! Now we can buy and sell goods",
  	not_tab_marketplace_title: "Marketplace",
  	not_5_marketplace: "For a few coins",
  	not_5_marketplace_title: "5 Marketplace",
  	not_15_marketplace: "For a bag of gold",
  	not_15_marketplace_title: "15 Marketplace",
  	not_30_marketplace: "For 30 bags of gold",
  	not_30_marketplace_title: "30 Marketplace",
  	not_5_matter_transmuter: "Playing with matter",
  	not_5_matter_transmuter_title: "5 Matter Transmuter",
  	not_15_matter_transmuter: "Master of matter",
  	not_15_matter_transmuter_title: "15 Matter Transmuter",
  	not_max_cap: "Max cap reached",
  	not_max_cap_title: "Max cap",
  	not_5_military_academy: "Military officers",
  	not_5_military_academy_title: "5 Military Academy",
  	not_15_military_academy: "Senior officers",
  	not_15_military_academy_title: "15 Military Academy",
  	not_5_mine: "Digging down",
  	not_5_mine_title: "5 Mine",
  	not_15_mine: "Keep attention",
  	not_15_mine_title: "15 Mine",
  	not_30_mine: "Mining city",
  	not_30_mine_title: "30 Mine",
  	not_5_ministry_development: "The first ministry",
  	not_5_ministry_development_title: "5 Ministry of Development",
  	not_15_ministry_development: "Development of the nation",
  	not_15_ministry_development_title: "15 Ministry of Development",
  	not_new_version: "A new version of Theresmore is available, close the notification to apply the update",
  	not_new_version_title: "New version",
  	not_1_ng_reset: "Reaching a milestone+",
  	not_1_ng_reset_title: "1 NG+",
  	not_5_ng_reset: "Reaching 5 milestones+",
  	not_5_ng_reset_title: "5 NG+",
  	not_10_ng_reset: "Reaching 10 milestones+",
  	not_10_ng_reset_title: "10 NG+",
  	not_20_ng_reset: "Reaching 20 milestones+",
  	not_20_ng_reset_title: "20 NG+",
  	not_40_ng_reset: "Reaching 40 milestones+",
  	not_40_ng_reset_title: "40 NG+",
  	not_80_ng_reset: "Reaching 80 milestones+",
  	not_80_ng_reset_title: "80 NG+",
  	not_5_observatory: "Skymancering",
  	not_5_observatory_title: "5 Observatory",
  	not_15_observatory: "New high of research",
  	not_15_observatory_title: "15 Observatory",
  	not_palisade: "A good defense",
  	not_palisade_title: "Build the Palisade",
  	not_1_prestige: "Reaching a milestone",
  	not_1_prestige_title: "1 Prestige",
  	not_5_prestige: "Reaching 5 milestones",
  	not_5_prestige_title: "5 Prestige",
  	not_15_prestige: "Reaching 15 milestones",
  	not_15_prestige_title: "15 Prestige",
  	not_30_prestige: "Reaching 30 milestones",
  	not_30_prestige_title: "30 Prestige",
  	not_60_prestige: "Reaching 60 milestones",
  	not_60_prestige_title: "60 Prestige",
  	not_120_prestige: "Reaching 120 milestones",
  	not_120_prestige_title: "120 Prestige",
  	not_5_quarry: "Increasing back pain",
  	not_5_quarry_title: "5 Quarry",
  	not_15_quarry: "Stone Squad",
  	not_15_quarry_title: "15 Quarry",
  	not_30_quarry: "Stone army",
  	not_30_quarry_title: "30 Quarry",
  	not_5_railway_station: "Railroads",
  	not_5_railway_station_title: "5 Railway Station",
  	not_15_railway_station: "Steam engine",
  	not_15_railway_station_title: "15 Railway Station",
  	not_5_recruit_training_center: "Train recruits",
  	not_5_recruit_training_center_title: "5 Recruit Training Center",
  	not_refugee_district: "Help for refugees",
  	not_refugee_district_title: "Refugee District",
  	not_remember_save: "Just a reminder that you may want to backup your save every once in a while, just in case",
  	not_remember_save_title: "Backup your save",
  	not_5_school: "The beginning of science",
  	not_5_school_title: "5 School",
  	not_15_school: "Learning Theresmore",
  	not_15_school_title: "15 School",
  	not_30_school: "Mastering Theresmore",
  	not_30_school_title: "30 School",
  	not_5_shed: "A shed that works",
  	not_5_shed_title: "5 Shed",
  	not_15_shed: "A lot of space in the colony",
  	not_15_shed_title: "15 Shed",
  	not_30_shed: "A colony of space",
  	not_30_shed_title: "30 Shed",
  	not_10_siege_workshop: "Building Siege Machine",
  	not_10_siege_workshop_title: "10 Siege Workshop",
  	not_5_stable: "Trot horse",
  	not_5_stable_title: "5 Stable",
  	not_15_stable: "More horses",
  	not_15_stable_title: "15 Stable",
  	not_30_stable: "A great horse race",
  	not_30_stable_title: "30 Stable",
  	not_5_steelworks: "Steel Working",
  	not_5_steelworks_title: "5 Steelworks",
  	not_15_steelworks: "Steel Working Hard",
  	not_15_steelworks_title: "15 Steelworks",
  	not_stock_exchange: "Buy high sell low",
  	not_stock_exchange_title: "Stock Exchange",
  	not_5_store: "A store that works",
  	not_5_store_title: "5 Store",
  	not_15_store: "A lot of space",
  	not_15_store_title: "15 Store",
  	not_30_store: "A city of space",
  	not_30_store_title: "30 Store",
  	not_5_temple: "Prayers heard",
  	not_5_temple_title: "5 Temple",
  	not_15_temple: "Pleasing the Gods",
  	not_15_temple_title: "15 Temple",
  	not_5_conclave: "Where clerics gather",
  	not_5_conclave_title: "5 Conclave",
  	not_15_conclave: "Religious city",
  	not_15_conclave_title: "15 Conclave",
  	not_5_spiritual_garden: "A quiet place",
  	not_5_spiritual_garden_title: "5 Spiritual Garden",
  	not_15_spiritual_garden: "Meditation",
  	not_15_spiritual_garden_title: "15 Spiritual Garden",
  	not_5_credit_union: "A new way of making gold",
  	not_5_credit_union_title: "5 Credit Union",
  	not_15_credit_union: "Making A LOT of money",
  	not_15_credit_union_title: "15 Credit Union",
  	not_5_natronite_depot: "Natronite stuff",
  	not_5_natronite_depot_title: "5 Natronite Depot",
  	not_15_natronite_depot: "Storing a lot of Natronite",
  	not_15_natronite_depot_title: "15 Natronite Depot",
  	not_5_storage_facility: "Deleting CAPS",
  	not_5_storage_facility_title: "5 Storage Facility",
  	not_15_storage_facility: "A huge amount of space",
  	not_15_storage_facility_title: "15 Storage Facility",
  	not_5_guarded_facility: "My treasure",
  	not_5_guarded_facility_title: "5 Large warehouse",
  	not_15_guarded_facility: "Surveying the stuff",
  	not_15_guarded_facility_title: "15 Large warehouse",
  	not_tower_mana: "Power Spells United",
  	not_tower_mana_title: "Tower of Mana",
  	not_5_trench: "The Great War",
  	not_5_trench_title: "5 Trench",
  	not_15_trench: "Western Front",
  	not_15_trench_title: "15 Trench",
  	not_25_trench: "Battle of the Somme",
  	not_25_trench_title: "25 Trench",
  	not_5_university: "The study of Theresmore",
  	not_5_university_title: "5 University",
  	not_15_university: "Graduate at Theresmore",
  	not_15_university_title: "15 University",
  	not_5_valley_of_plenty: "Toss a Coin",
  	not_5_valley_of_plenty_title: "5 Valley of Plenty",
  	not_wall: "A better defense",
  	not_wall_title: "Build the Wall",
  	not_8_watchman_outpost: "A network of sentinels",
  	not_8_watchman_outpost_title: "8 Watchman Outpost",
  	pop_artisan: "Artisan",
  	pop_breeder: "Breeder",
  	pop_harvester: "Harvester",
  	pop_farmer: "Farmer",
  	pop_fisher: "Fisher",
  	pop_lumberjack: "Lumberjack",
  	pop_merchant: "Merchant",
  	pop_trader: "Trader",
  	pop_miner: "Miner",
  	pop_quarryman: "Quarryman",
  	pop_priest: "Priest",
  	pop_carpenter: "Carpenter",
  	pop_steelworker: "Steelworker",
  	pop_professor: "Professor",
  	pop_quartermaster: "Quartermaster",
  	pop_skymancer: "Skymancer",
  	pop_supplier: "Supplier",
  	pop_alchemist: "Alchemist",
  	pop_unemployed: "Unemployed",
  	pop_natro_refiner: "Nat-Refiner",
  	pop_researcher: "Researcher",
  	res_army: "Army",
  	res_coin: "Coin",
  	res_copper: "Copper",
  	res_cow: "Cow",
  	res_crystal: "Crystal",
  	res_faith: "Faith",
  	res_fame: "Fame",
  	res_food: "Food",
  	res_gold: "Gold",
  	res_horse: "Horse",
  	res_iron: "Iron",
  	res_legacy: "Legacy",
  	res_luck: "Lucky Stone",
  	res_mana: "Mana",
  	res_natronite: "Natronite",
  	res_population: "Population",
  	res_stone: "Stone",
  	res_relic: "Relic",
  	res_research: "Research",
  	res_tools: "Tools",
  	res_wood: "Wood",
  	res_building_material: "Materials",
  	res_steel: "Steel",
  	res_supplies: "Supplies",
  	res_saltpetre: "Saltpetre",
  	res_tome_wisdom: "Tome of Wisdom",
  	res_gem: "Gem",
  	res_titan_gift: "Titan Gift",
  	stat_cap_gold: "Cap Gold",
  	stat_cap_gold_title: "Maximum Gold Cap",
  	stat_cap_wood: "Cap Wood",
  	stat_cap_wood_title: "Maximum Wood Cap",
  	stat_cap_stone: "Cap Stone",
  	stat_cap_stone_title: "Maximum Stone Cap",
  	stat_cap_food: "Cap Food",
  	stat_cap_food_title: "Maximum Food Cap",
  	stat_fame: "Fame",
  	stat_fame_title: "Fame earned",
  	stat_empty: "You have to play more to get statistics",
  	stat_research: "Research",
  	stat_research_title: "Research points spent",
  	stat_faith: "Faith",
  	stat_faith_title: "Faith spent",
  	stat_mana: "Mana",
  	stat_mana_title: "Mana earned",
  	stat_ng_bonus: "Bonus from NG+",
  	stat_ng_bonus_title: "Bonus earned from NG+ resets",
  	stat_ng_reset: "NG+ reset",
  	stat_ng_reset_title: "Number of NG+ reset",
  	stat_oracle: "Oracle",
  	stat_oracle_title: "Number of Oracle predictions",
  	stat_scout: "Scout",
  	stat_scout_title: "Scout missions started",
  	stat_spy: "Spy",
  	stat_spy_title: "Spy missions started",
  	stat_attack: "Attack",
  	stat_attack_title: "Attacks launched",
  	stat_kill: "Enemies slain",
  	stat_kill_title: "Enemies killed",
  	stat_dead: "Dead soldier",
  	stat_dead_title: "Fallen soldiers",
  	stat_reset: "Resets",
  	stat_reset_title: "Resets obtained",
  	tec_adamantium_projectiles: "Adamantium projectiles",
  	tec_adamantium_shield: "Adamantium shield",
  	tec_adamantium_sword: "Adamantium sword",
  	tec_adamantium_lance: "Adamantium lance",
  	tec_agricolture: "Agriculture",
  	tec_agreement_passage_wanders: "Agreement with Wanders",
  	tec_aid_request: "Request for help",
  	tec_alchemical_reactions: "Alchemical reactions",
  	tec_alchemist_complex_t: "Alchemist complex",
  	tec_ancient_balor_t: "Ancient Balor",
  	tec_ancient_spell: "Ancient Spell",
  	tec_archery: "Archery",
  	tec_architecture: "Architecture",
  	tec_veteran_artillerymen: "Veteran artillerymen",
  	tec_architecture_titan_t: "Architecture of the titans",
  	tec_artisan_complex: "Artisan complex",
  	tec_assembly_line: "Assembly line",
  	tec_astronomy: "Astronomy",
  	tec_ancient_stockpile: "Ancient stockpile",
  	tec_atomic_theory: "Atomic Theory",
  	tec_avatar_fate: "The Avatar of Fate",
  	tec_bandit_chief: "Bandit chief",
  	tec_banking: "Banking",
  	tec_barbarian_tribes: "Barbarian tribes",
  	tec_beacon_faith: "Beacon of Faith",
  	tec_besieging_engineers: "Besieging engineers",
  	tec_biology: "Biology",
  	tec_boot_camp_t: "Boot camp",
  	tec_breeding: "Breeding",
  	tec_bronze_working: "Bronze working",
  	tec_bronze_projectiles: "Bronze projectiles",
  	tec_bronze_shield: "Bronze shield",
  	tec_bronze_sword: "Bronze sword",
  	tec_bronze_lance: "Bronze lance",
  	tec_burned_farms: "Burned farms",
  	tec_canava_mercenary: "Canava Guard",
  	tec_centralized_power: "Centalized power",
  	tec_chemistry: "Chemistry",
  	tec_cloistered_life: "Cloistered life",
  	tec_cpt_galliard_t: "Captain Galliard",
  	tec_craftsmen_guild: "Guild of the Craftsmen",
  	tec_crop_rotation: "Crop Rotation",
  	tec_crossbow: "Crossbow",
  	tec_colonial_camp: "Colonial camp",
  	tec_colonial_consacration: "Colonial consacration",
  	tec_colonial_docks: "Colonial docks",
  	tec_colonial_exploitations: "Colonial exploitations",
  	tec_colonial_recruits: "Colonial recruits",
  	tec_colonial_stronghold: "Colonial stronghold",
  	tec_colonial_trade: "Colonial trade",
  	tec_construction_of_automata: "Construction of automata",
  	tec_commercial_monopolies: "Commercial monopolies",
  	tec_communion_nature: "Communion with nature",
  	tec_cuirassiers: "Cuirassiers",
  	tec_currency: "Currency",
  	tec_dark_crystal: "The Dark Crystal",
  	tec_daylong_celebration: "A daylong celebration",
  	tec_deserter_origin: "Origin of deserter",
  	tec_dimensional_device: "Dimensional device",
  	tec_dirty_money: "Dirty Money",
  	tec_dragon_assault: "Dragon assault",
  	tec_drilling_operation: "Drilling operation",
  	tec_ecology: "Ecology",
  	tec_economics: "Economics",
  	tec_enclosures: "Enclosures",
  	tec_education: "Education",
  	tec_end_ancient_era: "End Ancient Era",
  	tec_end_feudal_era: "End Feudal Era",
  	tec_end_era_4_1: "Dreaming big",
  	tec_end_era_4_2: "Dreaming big",
  	tec_embassy_nation: "Embassy for the nations",
  	tec_elf_last_village: "Elf last village",
  	tec_elf_survivors: "Elf survivors",
  	tec_elf_warriors: "Elf Warrior",
  	tec_espionage: "Espionage",
  	tec_establish_boundaries: "Establish boundaries",
  	tec_eureka: "Eureka!",
  	tec_exhibit_flame: "Exhibit the Flame",
  	tec_exterminate_competition: "Erase competitors",
  	tec_fairs_and_markets: "Fairs and markets",
  	tec_faith_world: "New world of faith",
  	tec_fallen_angel: "The Fallen Angel reveal",
  	tec_fate_blessing: "Fate Blessing",
  	tec_favor_gods: "Favor of the Gods",
  	tec_fertilizer: "Fertilizer",
  	tec_feudalism: "Feudalism",
  	tec_field_artillery: "Field artillery",
  	tec_financial_markets: "Financial markets",
  	tec_fine_lucky_wood: "Fine lucky wood",
  	tec_fine_woods: "Fine woods",
  	tec_fine_marbles: "Fine marbles",
  	tec_flame_atamar: "The Flame of Atamar",
  	tec_flight: "Flight",
  	tec_flintlock_musket: "Flintlock musket",
  	tec_food_conservation: "Food conservation",
  	tec_forging_equipments: "Forge of equipment",
  	tec_forging_equipments_II: "Forge of equipment II",
  	tec_fortification: "Fortification",
  	tec_fortified_colony: "Fortified colony",
  	tec_fortune_sanctuary: "Fortune sanctuary",
  	tec_fountain_gold: "Fountain of Gold",
  	tec_free_old_outpost: "Free an old outpost",
  	tec_galliard_mercenary: "Captain Galliard services",
  	tec_galliard_secret: "Galliard's secret",
  	tec_galliard_true_form: "Galliard True Form",
  	tec_gold_domination_project: "Gold domination project",
  	tec_glorious_parade: "Glorious parade",
  	tec_glorious_retirement: "Glorious retirement",
  	tec_grain_surplus: "Grain surplus",
  	tec_great_pastures: "Great pastures",
  	tec_guerrilla_warfare: "Guerrilla warfare",
  	tec_guild: "Guild",
  	tec_gunpowder: "Gunpowder",
  	tec_joyful_nation_1: "Joyful nation",
  	tec_joyful_nation_2: "Joyful nation",
  	tec_heirloom_contract_t: "Heirloom of the Contract",
  	tec_heirloom_death_t: "Heirloom of the Death",
  	tec_heirloom_horseshoes_t: "Heirloom of the Horseshoes",
  	tec_heirloom_housing: "Heirloom of the Housing",
  	tec_heirloom_momento_t: "Heirloom of the Momento",
  	tec_heirloom_wealth_t: "Heirloom of Wealth",
  	tec_heirloom_wisdom_t: "Heirloom of Wisdom",
  	tec_herald_canava: "Canava herald",
  	tec_honor_humanity: "The honor of Humanity",
  	tec_house_of_workers: "House of Workers",
  	tec_housing: "Housing",
  	tec_huge_cave_t: "Huge cavern",
  	tec_knighthood: "Knighthood",
  	tec_kobold_nation: "Kobold nation",
  	tec_harbor_project: "Harbor project",
  	tec_holy_fury: "Holy Fury",
  	tec_infuse_flame: "Infuse the Flame",
  	tec_iron_working: "Iron working",
  	tec_iron_projectiles: "Iron projectiles",
  	tec_iron_shield: "Iron shield",
  	tec_iron_sword: "Iron sword",
  	tec_iron_lance: "Iron lance",
  	tec_land_mine: "Land mine",
  	tec_landed_estates: "Landed estates",
  	tec_large_defensive_project: "Large defensive project",
  	tec_large_shed_t: "Large Shed",
  	tec_large_storage_space: "Large storage space",
  	tec_large_pastures: "Large pastures",
  	tec_library_of_souls: "Library of SouLs",
  	tec_liturgical_rites: "Mana rites",
  	tec_local_products: "Local products",
  	tec_lonely_druid: "A lonely druid",
  	tec_long_expedition: "Long term expedition",
  	tec_loved_people: "Loved by the people",
  	tec_lucky_idea: "Lucky Idea",
  	tec_illgotten_gains: "Illgotten Gains",
  	tec_lucky_investments: "Lucky Investments",
  	tec_lucky_little_city: "Lucky little city",
  	tec_overseas_refinery: "Overseas refinery",
  	tec_plate_armor: "Plate armor",
  	tec_preparation_war: "Preparation for the war",
  	tec_prepare_tunnel: "Preparing Tunnel",
  	tec_printing_press: "Printing press",
  	tec_professional_soldier: "Professional soldier",
  	tec_poisoned_arrows: "Poisoned arrows",
  	tec_port_statue: "Port statue",
  	tec_magic: "Magic",
  	tec_magic_arts_teaching: "Magic arts teaching",
  	tec_mana_conveyors: "Mana conveyors",
  	tec_mana_engine: "Mana engine",
  	tec_mana_investigation: "Mana investigation",
  	tec_mana_reactors: "Mana reactor",
  	tec_mana_utilization: "Mana utilization",
  	tec_mankind_darkest: "Mankind darkest hour",
  	tec_manufactures: "Manufacture",
  	tec_martial_arts: "Martial Arts",
  	tec_mass_transit: "Mass transit",
  	tec_master_craftsmen: "Master craftsmen",
  	tec_master_history: "Master of History",
  	tec_mathematic: "Mathematics",
  	tec_mechanization: "Mechanization",
  	tec_mercenary_outpost_t: "Mercenary Outpost",
  	tec_metal_alloys: "Metal alloys",
  	tec_metal_casting: "Metal casting",
  	tec_mercenary_bands: "Mercenary bands",
  	tec_military_colony: "Military Colony",
  	tec_military_tactics: "Military tactics",
  	tec_moonlight_night: "A moonlit night",
  	tec_military_science: "Military science",
  	tec_mining: "Mining",
  	tec_mining_efficency: "Mining efficiency",
  	tec_miracle_city: "Miracle in the city",
  	tec_ministry_interior_t: "Ministry for the Interior",
  	tec_ministry_war_t: "Ministry of War",
  	tec_ministry_worship_t: "Ministry of Worship",
  	tec_mithril_projectiles: "Mithril projectiles",
  	tec_mithril_shield: "Mithril shield",
  	tec_mithril_sword: "Mithril sword",
  	tec_mithril_lance: "Mithril lance",
  	tec_monster_epuration: "Monster epuration",
  	tec_monster_hunting: "Monster hunting",
  	tec_monument_past: "Monument",
  	tec_municipal_administration: "Municipal Administration",
  	tec_mysterious_robbery: "Mysterious robbery",
  	tec_mythology: "Mythology",
  	tec_natrocity: "Natrocity",
  	tec_natronite_storage: "Natronite storage",
  	tec_necromancy: "Necromancy",
  	tec_network_of_watchmen: "Sentinels on the walls",
  	tec_new_old_gods: "New world old gods",
  	tec_new_world_exploration: "New world exploration",
  	tec_new_world_militia: "New world militia",
  	tec_northern_star: "Northern Star",
  	tec_oracle_t: "The Oracle",
  	tec_orc_horde: "The Orc Horde",
  	tec_orcish_citadel: "Orcish citadel",
  	tec_orcish_threat: "Orcish threat",
  	tec_order_of_clerics: "Order of clerics",
  	tec_outpost_tiny_island: "Tiny island outpost",
  	tec_path_children: "The Children Path",
  	tec_pentagram_tome: "Demoniac pentagram",
  	tec_phalanx_combat: "Oplitic Phalanx",
  	tec_portal_of_the_dead: "Portal of the dead",
  	tec_pottery: "Pottery",
  	tec_productive_hub: "Productive Hub",
  	tec_railroad: "Railroad",
  	tec_rage_druid: "The rage of the Druid",
  	tec_regional_markets: "Regional Markets",
  	tec_religion: "Religion",
  	tec_religious_orders: "Religious order",
  	tec_remember_the_ancients: "Remember the Ancients",
  	tec_replicable_parts: "Replicable parts",
  	tec_research_district: "Research district",
  	tec_safe_roads: "Safe roads",
  	tec_scientific_theory: "Scientific Theory",
  	tec_scout_mission_east: "Scout Mission to the East",
  	tec_seafaring: "Seafaring",
  	tec_seraphim_t: "Seraphim",
  	tec_servitude: "Servitude",
  	tec_shores_theresmore: "Shores of Theresmore",
  	tec_siege_defense_weapons: "Siege defense weapons",
  	tec_siege_techniques: "Siege techniques",
  	tec_steel_flesh: "Steel and flesh",
  	tec_steeling: "Steeling",
  	tec_steel_projectiles: "Steel projectiles",
  	tec_steel_shield: "Steel shield",
  	tec_steel_sword: "Steel sword",
  	tec_steel_lance: "Steel lance",
  	tec_stocked_tunnel: "Stocked Tunnel",
  	tec_stone_extraction_tools: "Stone extraction tools",
  	tec_stone_masonry: "Stone masonry",
  	tec_stone_processing: "Stone processing",
  	tec_storage: "Storage",
  	tec_storage_district: "Storage district",
  	tec_storing_valuable_materials: "Storing valuable materials",
  	tec_strange_encounter: "A strange encounter",
  	tec_swear_give_up: "Never give up",
  	tec_persuade_nobility: "Persuade the nobility",
  	tec_persuade_people: "Persuade the people",
  	tec_plenty_valley: "Plenty valley",
  	tec_tamed_barbarian: "Tamed Barbarian",
  	tec_temple_luna: "Temple of Luna",
  	tec_the_journey: "The journey",
  	tec_the_scourge: "The scourge",
  	tec_the_vault: "The vault",
  	tec_theresmore_richest_nation: "Richest nation",
  	tec_titan_gift_t: "Titan Gift",
  	tec_titan_mosaic: "Titan mosaic",
  	tec_underground_kobold_mission: "Underground mission",
  	tec_the_triumph: "The Triumph",
  	tec_throwing_coin: "Throwing Coin",
  	tec_tome_ancient_lore: "Tome of ancient lore",
  	tec_trading_woods: "Selling wood",
  	tec_trail_blood: "Trail of blood",
  	tec_trail_power: "Trail of power",
  	tec_trained_longbowman: "Longbowman",
  	tec_training_militia: "Training militia",
  	tec_trenches: "Trenches",
  	tec_tunnel_hq: "Tunnel HQ",
  	tec_underground_library: "Library secret",
  	tec_warfare: "Warfare",
  	tec_white_t_company: "White Company",
  	tec_wall_titan_t: "Titanic Walls",
  	tec_war_effort: "War effort",
  	tec_wings_freedom: "Wings of Freedom",
  	tec_wood_cutting: "Wood cutting",
  	tec_woodcarvers: "Woodcarvers",
  	tec_wood_saw: "Wood saw",
  	tec_writing: "Writing",
  	tec_zenix_familiar_t: "Zenix Familiar",
  	uni_cat_1: "Ranged",
  	uni_cat_2: "Shock",
  	uni_cat_3: "Tank",
  	uni_cat_4: "Cavalry",
  	uni_ancient_balor: "Ancient Balor",
  	uni_ancient_balor_plural: "Ancient balors",
  	uni_ancient_giant: "Ancient Giant",
  	uni_ancient_giant_plural: "Ancient Giants",
  	uni_aqrabuamelu: "Aqrabuamelu",
  	uni_aqrabuamelu_plural: "Aqrabuamelus",
  	uni_arquebusier: "Arquebusier",
  	uni_arquebusier_plural: "Arquebusiers",
  	uni_archdemon: "Archdemon",
  	uni_archdemon_plural: "Archdemons",
  	uni_archlich: "Archlich",
  	uni_archlich_plural: "Archliches",
  	uni_archer: "Archer",
  	uni_archer_plural: "Archers",
  	uni_artillery: "Artillery",
  	uni_artillery_plural: "Artilleries",
  	uni_avatar_fate_u: "Avatar Of Fate",
  	uni_avatar_fate_u_plural: "Avatars of Fate",
  	uni_balor: "Balor",
  	uni_balor_plural: "Balors",
  	uni_battle_angel: "Battle Angel",
  	uni_battle_angel_plural: "Battle Angels",
  	uni_black_mage: "Black mage",
  	uni_black_mage_plural: "Black mages",
  	uni_bombard: "Bombard",
  	uni_bombard_plural: "Bombards",
  	uni_bugbear: "Bugbear",
  	uni_bugbear_plural: "Bugbears",
  	uni_bugbear_chieftain: "Bugbear Chieftain",
  	uni_bugbear_chieftain_plural: "Bugbear chieftains",
  	uni_bulette: "Bulette",
  	uni_bulette_plural: "Bulettes",
  	uni_cannon: "Cannon",
  	uni_cannon_plural: "Cannons",
  	uni_cataphract: "Cataphract",
  	uni_cataphract_plural: "Cataphract",
  	uni_charmed_dweller: "Charmed dweller",
  	uni_charmed_dweller_plural: "Charmed dwellers",
  	uni_cult_master: "Cult Master",
  	uni_cult_master_plural: "Cult Masters",
  	uni_cyclop: "Cyclop",
  	uni_cyclop_plural: "Cyclops",
  	uni_demoness: "Demoness",
  	uni_demoness_plural: "Demonesses",
  	uni_draconic_warrior: "Draconic warrior",
  	uni_draconic_warrior_plural: "Draconic warriors",
  	uni_draconic_diver: "Draconic diver",
  	uni_draconic_diver_plural: "Draconic divers",
  	uni_draconic_mage: "Draconic mage",
  	uni_draconic_mage_plural: "Draconic mages",
  	uni_draconic_leader: "Draconic leader",
  	uni_draconic_leader_plural: "Draconic leaders",
  	uni_elf_warrior: "Elf warrior",
  	uni_elf_warrior_plural: "Elf warriors",
  	uni_eternal_guardian: "Eternal guardian",
  	uni_eternal_guardian_plural: "Eternal guardians",
  	uni_harpy: "Harpy",
  	uni_harpy_plural: "Harpies",
  	uni_ball_lightning: "Ball lightning",
  	uni_ball_lightning_plural: "Ball lightnings",
  	uni_bandit: "Bandit",
  	uni_bandit_plural: "Bandits",
  	uni_basilisk: "Basilisk",
  	uni_basilisk_plural: "Basilisks",
  	uni_barbarian_chosen: "Chosen barbarian",
  	uni_barbarian_chosen_plural: "Chosen barbarians",
  	uni_barbarian_drummer: "Barbarian drummer",
  	uni_barbarian_drummer_plural: "Barbarian drummers",
  	uni_barbarian_leader: "Barbarian leader",
  	uni_barbarian_leader_plural: "Barbarian leaders",
  	uni_barbarian_king: "Barbarian King",
  	uni_barbarian_king_plural: "Barbarian Kings",
  	uni_barbarian_warrior: "Barbarian warrior",
  	uni_barbarian_warrior_plural: "Barbarian warriors",
  	uni_battering_ram: "Catapult",
  	uni_battering_ram_plural: "Catapults",
  	uni_behemoth: "Behemoth",
  	uni_behemoth_plural: "Behemoths",
  	uni_canava_guard: "Canava guard",
  	uni_canava_guard_plural: "Canava guards",
  	uni_catapult: "Catapult",
  	uni_catapult_plural: "Catapults",
  	uni_cavarly_archer: "Cavarly archer",
  	uni_cavarly_archer_plural: "Cavarly archers",
  	uni_cleric: "Cleric",
  	uni_cleric_plural: "Clerics",
  	uni_colonial_militia: "Colonial Militia",
  	uni_colonial_militia_plural: "Colonial Militias",
  	uni_cpt_galliard: "Cpt. Galliard",
  	uni_cpt_galliard_plural: "Galliard captains",
  	uni_commander: "Commander",
  	uni_commander_plural: "Commanders",
  	uni_crossbowman: "Crossbowman",
  	uni_crossbowman_plural: "Crossbowmen",
  	uni_cuirassier: "Cuirassier",
  	uni_cuirassier_plural: "Cuirassiers",
  	uni_daimyo: "Daimyo",
  	uni_daimyo_plural: "Daimyos",
  	uni_demonic_musketeer: "Demonic musketeer",
  	uni_demonic_musketeer_plural: "Demonic musketeers",
  	uni_deserter: "Deserter",
  	uni_deserter_plural: "Deserters",
  	uni_djinn: "Djinn",
  	uni_djinn_plural: "Djinns",
  	uni_dirty_rat: "Dirty rat",
  	uni_dirty_rat_plural: "Dirty rats",
  	uni_earth_elemental: "Earth elemental",
  	uni_earth_elemental_plural: "Earth elementals",
  	uni_ettin: "Ettin",
  	uni_ettin_plural: "Ettins",
  	uni_explorer: "Explorer",
  	uni_explorer_plural: "Explorers",
  	uni_fallen_angel: "Fallen Angel",
  	uni_fallen_angel_plural: "Fallen Angels",
  	uni_familiar: "Familiar",
  	uni_familiar_plural: "Familiars",
  	uni_fire_elemental: "Fire elemental",
  	uni_fire_elemental_plural: "Fire elementals",
  	uni_fire_salamander: "Fire salamander",
  	uni_fire_salamander_plural: "Fire salamanders",
  	uni_frost_elemental: "Frost elemental",
  	uni_frost_elemental_plural: "Frost elementals",
  	uni_frost_giant: "Frost giant",
  	uni_frost_giant_plural: "Frost giants",
  	uni_galliard: "Galliard",
  	uni_galliard_plural: "Galliards",
  	uni_gargoyle: "Gargoyle",
  	uni_gargoyle_plural: "Gargoyles",
  	uni_general: "General",
  	uni_general_plural: "Generals",
  	uni_giant_snake: "Giant snake",
  	uni_giant_snake_plural: "Giant snakes",
  	uni_giant_spider: "Giant spider",
  	uni_giant_spider_plural: "Giant spiders",
  	uni_giant_wasp: "Giant wasp",
  	uni_giant_wasp_plural: "Giant wasps",
  	uni_goblin_marauder: "Goblin Marauder",
  	uni_goblin_marauder_plural: "Goblin Marauders",
  	uni_goblin_warrior: "Goblin Warrior",
  	uni_goblin_warrior_plural: "Goblin Warriors",
  	uni_goblin_overlord: "Goblin Overlord",
  	uni_goblin_overlord_plural: "Goblin Overlords",
  	uni_goblin_wolfrider: "Goblin wolfrider",
  	uni_goblin_wolfrider_plural: "Goblin wolfriders",
  	uni_golem: "Golem",
  	uni_golem_plural: "Golems",
  	uni_gorgon: "Gorgon",
  	uni_gorgon_plural: "Gorgons",
  	uni_ghast: "Ghast",
  	uni_ghast_plural: "Ghasts",
  	uni_ghost: "Ghost",
  	uni_ghost_plural: "Ghosts",
  	uni_ghoul: "Ghoul",
  	uni_ghoul_plural: "Ghouls",
  	uni_gnoll_leader: "Gnoll leader",
  	uni_gnoll_leader_plural: "Gnoll leaders",
  	uni_gnoll_raider: "Gnoll raider",
  	uni_gnoll_raider_plural: "Gnoll raiders",
  	uni_greater_demon: "Greater demon",
  	uni_greater_demon_descriprion: "A big demon spit out of hell",
  	uni_greater_demon_plural: "Greater demons",
  	uni_griffin: "Griffin",
  	uni_griffin_plural: "Griffins",
  	uni_gulud: "Gulud",
  	uni_gulud_plural: "Guluds",
  	uni_korrigan_slinger: "Korrigan slinger",
  	uni_korrigan_slinger_plural: "Korrigan slingers",
  	uni_korrigan_swindler: "Korrigan swindler",
  	uni_korrigan_swindler_plural: "Korrigan swindlers",
  	uni_jager: "Jager",
  	uni_jager_plural: "Jagers",
  	uni_juggernaut: "Juggernaut",
  	uni_juggernaut_plural: "Juggernauts",
  	uni_hill_giant: "Hill giant",
  	uni_hill_giant_plural: "Hill giants",
  	uni_hobgoblin_archer: "Hobgoblin archer",
  	uni_hobgoblin_archer_plural: "Hobgoblin archers",
  	uni_hobgoblin_chieftain: "Hobgoblin chieftain",
  	uni_hobgoblin_chieftain_plural: "Hobgoblin chieftains",
  	uni_hobgoblin_grunt: "Hobgoblin grunt",
  	uni_hobgoblin_grunt_plural: "Hobgoblin grunts",
  	uni_hydra: "Hydra",
  	uni_hydra_plural: "Hydras",
  	uni_lead_golem: "Lead golem",
  	uni_lead_golem_plural: "Lead golems",
  	uni_lich: "Lich",
  	uni_lich_plural: "Liches",
  	uni_line_infantry: "Line infantry",
  	uni_line_infantry_plural: "Line infantry",
  	uni_lizard_archer: "Sssarkat archer",
  	uni_lizard_archer_plural: "Sssarkat archers",
  	uni_lizard_commander: "Sssarkat commander",
  	uni_lizard_commander_plural: "Sssarkat commanders",
  	uni_lizard_shaman: "Sssarkat shaman",
  	uni_lizard_shaman_plural: "Sssarkat shamans",
  	uni_lizard_warrior: "Sssarkat warrior",
  	uni_lizard_warrior_plural: "Sssarkat warriors",
  	uni_longbowman: "Longbowman",
  	uni_longbowman_plural: "Longbowmen",
  	uni_knight: "Knight",
  	uni_knight_plural: "Knights",
  	uni_kobold: "Kobold",
  	uni_kobold_plural: "Kobolds",
  	uni_kobold_champion: "Kobold Champion",
  	uni_kobold_champion_plural: "Kobold Champions",
  	uni_kobold_king: "Kobold King",
  	uni_kobold_king_plural: "Kobold Kings",
  	uni_heavy_warrior: "Heavy warrior",
  	uni_heavy_warrior_plural: "Heavy warriors",
  	uni_katana_samurai: "Katana samurai",
  	uni_katana_samurai_plural: "Katana samurai",
  	uni_imp: "Imp",
  	uni_imp_plural: "Imps",
  	uni_lesser_demon: "Lesser Demon",
  	uni_lesser_demon_plural: "Lesser Demons",
  	uni_light_cavarly: "Light Cavalry",
  	uni_light_cavarly_plural: "Light Cavalries",
  	uni_markanat: "Markanat",
  	uni_markanat_plural: "Markanats",
  	uni_marksman: "Marksman",
  	uni_marksman_plural: "Marksmen",
  	uni_man_at_arms: "Man at arms",
  	uni_man_at_arms_plural: "Men at arms",
  	uni_mercenary_veteran: "Mercenary",
  	uni_mercenary_veteran_plural: "Mercenaries",
  	uni_minotaur: "Minotaur",
  	uni_minotaur_plural: "Minotaurs",
  	uni_myconid: "Myconid",
  	uni_myconid_plural: "Myconids",
  	uni_mountain_giant: "Mountain giant",
  	uni_mountain_giant_plural: "Mountain giants",
  	uni_musket_ashigaru: "Ashigaru musket",
  	uni_musket_ashigaru_plural: "Ashigaru muskets",
  	uni_necromancer: "Necromancer",
  	uni_necromancer_plural: "Necromancers",
  	uni_naga: "Naga",
  	uni_naga_plural: "Nagas",
  	uni_nikharul: "Nikharul the Soulstealer",
  	uni_nikharul_plural: "Nikharuls",
  	uni_nikharul_soulstealer: "Nikharul Soulstealer",
  	uni_oni: "Oni",
  	uni_oni_plural: "Onis",
  	uni_orc_berserker: "Orc berserker",
  	uni_orc_berserker_plural: "Orc berserker",
  	uni_orc_champion: "Orc champion",
  	uni_orc_champion_plural: "Orc champions",
  	uni_orc_flame_caster: "Orc flame caster",
  	uni_orc_flame_caster_plural: "Orc flame casters",
  	uni_orc_ironskin: "Orc ironskin",
  	uni_orc_ironskin_plural: "Orc ironskins",
  	uni_orc_shaman: "Orc shaman",
  	uni_orc_shaman_plural: "Orc shamans",
  	uni_orc_stone_thrower: "Orc stone thrower",
  	uni_orc_stone_thrower_plural: "Orc stone throwers",
  	uni_orc_warg_rider: "Orc warg rider",
  	uni_orc_warg_rider_plural: "Orc warg riders",
  	uni_orc_warlord: "Orc warlord",
  	uni_orc_warlord_plural: "Orc warlords",
  	uni_orc_worker: "Orc worker",
  	uni_orc_worker_plural: "Orc workers",
  	uni_orc_warrior: "Orc warrior",
  	uni_orc_warrior_plural: "Orc warriors",
  	uni_paladin: "Paladin",
  	uni_paladin_plural: "Paladins",
  	uni_ranger: "Ranger",
  	uni_ranger_plural: "Rangers",
  	uni_red_dragon: "Red Dragon",
  	uni_red_dragon_plural: "Red Dragons",
  	uni_sacred_golem: "Sacred Golem",
  	uni_sacred_golem_plural: "Sacred Golems",
  	uni_scout: "Scout",
  	uni_scout_plural: "Scouts",
  	uni_seraphim: "Seraphim",
  	uni_seraphim_plural: "Seraphims",
  	uni_settlement_defenses: "Settlement",
  	uni_settlement_defenses_plural: "Settlements",
  	uni_shieldbearer: "Shieldbearer",
  	uni_shieldbearer_plural: "Shieldbearers",
  	uni_skeletal_knight: "Skeletal knight",
  	uni_skeletal_knight_plural: "Skeletal knights",
  	uni_skeleton: "Skeleton",
  	uni_skeleton_plural: "Skeletons",
  	uni_skullface: "Skullface",
  	uni_skullface_plural: "Skullfaces",
  	uni_sluagh: "Sluagh",
  	uni_sluagh_plural: "Sluaghs",
  	uni_snake: "Snake",
  	uni_snake_plural: "Snakes",
  	uni_spearman: "Spearman",
  	uni_spearman_plural: "Spearmen",
  	uni_spectra_memory: "Specter of memory",
  	uni_spectra_memory_plural: "Specters of memory",
  	uni_spider: "Spider",
  	uni_spider_plural: "Spiders",
  	uni_spy: "Spy",
  	uni_spy_plural: "Spies",
  	uni_son_atamar: "Son of Atamar",
  	uni_son_atamar_plural: "Sons of Atamar",
  	uni_smuggler: "Smuggler",
  	uni_smuggler_plural: "Smugglers",
  	uni_strategist: "Strategist",
  	uni_strategist_plural: "Strategists",
  	uni_succubus: "Succubus",
  	uni_succubus_plural: "Succubuses",
  	uni_succubus_queen: "Succubus Queen",
  	uni_succubus_queen_plural: "Succubus Queens",
  	uni_swamp_horror: "Swamp Horror",
  	uni_swamp_horror_plural: "Swamp Horrors",
  	uni_ravenous_crab: "Ravenous crab",
  	uni_ravenous_crab_plural: "Ravenous crabs",
  	uni_phalanx: "Phalanx",
  	uni_phalanx_plural: "Phalanxes",
  	uni_pillager: "Pillager",
  	uni_pillager_plural: "Pillagers",
  	uni_priest: "Priest",
  	uni_priest_plural: "Priests",
  	uni_vampire: "Vampire",
  	uni_vampire_plural: "Vampires",
  	uni_vampire_bat: "Vampire bat",
  	uni_vampire_bat_plural: "Vampire bats",
  	uni_vampire_servant: "Vampire servant",
  	uni_vampire_servant_plural: "Vampire servants",
  	uni_velociraptors: "Velociraptors",
  	uni_velociraptors_plural: "Velociraptorses",
  	uni_warrior: "Warrior",
  	uni_warrior_plural: "Warriors",
  	uni_warrior_monk: "Monk",
  	uni_warrior_monk_plural: "Monks",
  	uni_warg: "Warg",
  	uni_warg_plural: "Wargs",
  	uni_werewolf: "Werewolf",
  	uni_werewolf_plural: "Werewolfs",
  	uni_wendigo: "Wendigo",
  	uni_wendigo_plural: "Wendigos",
  	uni_white_company: "White Company",
  	uni_white_company_plural: "White Companies",
  	uni_wind_elemental: "Wind Elemental",
  	uni_wind_elemental_plural: "Wind Elementals",
  	uni_wolf: "Wolf",
  	uni_wolf_plural: "Wolves",
  	uni_wyvern: "Wyvern",
  	uni_wyvern_plural: "Wyverns",
  	uni_tamed_djinn: "Tamed Djinn",
  	uni_tamed_djinn_plural: "Tamed Djinns",
  	uni_titan: "Titan",
  	uni_titan_plural: "Titans",
  	uni_trebuchet: "Trebuchet",
  	uni_trebuchet_plural: "Trebuchets",
  	uni_troll_battle: "Battle Troll",
  	uni_troll_battle_plural: "Battle Trolls",
  	uni_troll_cave: "Cave Troll",
  	uni_troll_cave_plural: "Cave Trolls",
  	uni_tyrannosaurus: "Tyrannosaurus",
  	uni_tyrannosaurus_plural: "Tyrannosauruses",
  	uni_zombie: "Zombie",
  	uni_zombie_plural: "Zombies"
  };
  var i18n = {
  	en: en
  };

  var jobs = [
  	{
  		id: "unemployed"
  	},
  	{
  		id: "farmer",
  		req: [
  			{
  				type: "building",
  				id: "farm",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: 1.6
  			}
  		]
  	},
  	{
  		id: "fisher",
  		req: [
  			{
  				type: "building",
  				id: "dock",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: 3.4
  			}
  		]
  	},
  	{
  		id: "lumberjack",
  		req: [
  			{
  				type: "building",
  				id: "lumberjack_camp",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 0.7
  			}
  		]
  	},
  	{
  		id: "quarryman",
  		req: [
  			{
  				type: "building",
  				id: "quarry",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 0.6
  			}
  		]
  	},
  	{
  		id: "miner",
  		req: [
  			{
  				type: "building",
  				id: "mine",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "copper",
  				value: 0.5
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 0.3
  			}
  		]
  	},
  	{
  		id: "artisan",
  		req: [
  			{
  				type: "building",
  				id: "artisan_workshop",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 0.5
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 0.3
  			}
  		]
  	},
  	{
  		id: "merchant",
  		req: [
  			{
  				type: "building",
  				id: "marketplace",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "trader",
  		req: [
  			{
  				type: "building",
  				id: "credit_union",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 6
  			}
  		]
  	},
  	{
  		id: "breeder",
  		req: [
  			{
  				type: "building",
  				id: "stable",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "cow",
  				value: 0.2
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 0.1
  			}
  		]
  	},
  	{
  		id: "carpenter",
  		req: [
  			{
  				type: "building",
  				id: "carpenter_workshop",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "building_material",
  				value: 0.3
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: -3
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: -1.5
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: -0.5
  			}
  		]
  	},
  	{
  		id: "steelworker",
  		req: [
  			{
  				type: "building",
  				id: "steelworks",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "steel",
  				value: 0.4
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: -1
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: -0.5
  			}
  		]
  	},
  	{
  		id: "professor",
  		req: [
  			{
  				type: "building",
  				id: "university",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.06
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "researcher",
  		req: [
  			{
  				type: "building",
  				id: "research_plant",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "supplier",
  		req: [
  			{
  				type: "building",
  				id: "grocery",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.4
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: -2
  			},
  			{
  				type: "resource",
  				id: "cow",
  				value: -0.2
  			}
  		]
  	},
  	{
  		id: "skymancer",
  		req: [
  			{
  				type: "building",
  				id: "observatory",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 3
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "harvester",
  		req: [
  			{
  				type: "building",
  				id: "mana_extractors",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "copper",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "alchemist",
  		req: [
  			{
  				type: "building",
  				id: "alchemic_laboratory",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 0.7
  			}
  		]
  	},
  	{
  		id: "natro_refiner",
  		req: [
  			{
  				type: "building",
  				id: "natronite_refinery",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "natronite",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: -5
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: -0.5
  			}
  		]
  	},
  	{
  		id: "quartermaster",
  		req: [
  			{
  				type: "building",
  				id: "military_camp",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: 1.5
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.2
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: -3
  			}
  		]
  	}
  ];

  var legacies = [
  	{
  		id: "elysian_field",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "battle_angel",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "elysian_field_II",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "battle_angel",
  				type_gen: "stat",
  				gen: "defense",
  				value: 4,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "elysian_field_III",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "battle_angel",
  				type_gen: "stat",
  				gen: "defense",
  				value: 8,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "mercenary_agreements",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "canava_guard",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "white_company",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "mercenary_agreements_II",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "canava_guard",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "white_company",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "mercenary_agreements_III",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "canava_guard",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "canava_guard",
  				type_gen: "stat",
  				gen: "defense",
  				value: 7,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "white_company",
  				type_gen: "stat",
  				gen: "attack",
  				value: 7,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "powered_weapons",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "archer",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "spearman",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "powered_weapons_II",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "archer",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "spearman",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "powered_weapons_III",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "crossbowman",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "powered_weapons_IV",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "crossbowman",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "knight",
  				type_gen: "stat",
  				gen: "defense",
  				value: 8,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "defense",
  				value: 12,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "powered_weapons_V",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "arquebusier",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "line_infantry",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "line_infantry",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cuirassier",
  				type_gen: "stat",
  				gen: "defense",
  				value: 8,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "general",
  				type_gen: "stat",
  				gen: "defense",
  				value: 12,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "powered_weapons_VI",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "shieldbearer",
  				type_gen: "stat",
  				gen: "defense",
  				value: 8,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "artillery",
  				type_gen: "stat",
  				gen: "attack",
  				value: 20,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "powered_weapons_VII",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "line_infantry",
  				type_gen: "stat",
  				gen: "attack",
  				value: 8,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "line_infantry",
  				type_gen: "stat",
  				gen: "defense",
  				value: 8,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cuirassier",
  				type_gen: "stat",
  				gen: "defense",
  				value: 8,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "artillery",
  				type_gen: "stat",
  				gen: "attack",
  				value: 20,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "spikes_and_pits",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 40,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "spikes_and_pits_II",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 80,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "spikes_and_pits_III",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 150,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "juggernaut",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "juggernaut",
  				type_gen: "stat",
  				gen: "defense",
  				value: 6,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "spikes_and_pits_IV",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 200,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "juggernaut",
  				type_gen: "stat",
  				gen: "attack",
  				value: 6,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "juggernaut",
  				type_gen: "stat",
  				gen: "defense",
  				value: 12,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "spikes_and_pits_V",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 350,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "juggernaut",
  				type_gen: "stat",
  				gen: "attack",
  				value: 10,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "juggernaut",
  				type_gen: "stat",
  				gen: "defense",
  				value: 20,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "train_colonial",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "colonial_militia",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "elf_warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 7,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "paladin",
  				type_gen: "stat",
  				gen: "defense",
  				value: 7,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "jager",
  				type_gen: "stat",
  				gen: "attack",
  				value: 7,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "train_colonial_II",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "colonial_militia",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "elf_warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 14,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "behemoth",
  				type_gen: "stat",
  				gen: "defense",
  				value: 14,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "jager",
  				type_gen: "stat",
  				gen: "attack",
  				value: 14,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "weapons_titan",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "spearman",
  				type_gen: "stat",
  				gen: "defense",
  				value: 10,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "attack",
  				value: 10,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "arquebusier",
  				type_gen: "stat",
  				gen: "attack",
  				value: 10,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cuirassier",
  				type_gen: "stat",
  				gen: "defense",
  				value: 10,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "line_infantry",
  				type_gen: "stat",
  				gen: "defense",
  				value: 10,
  				perc: false
  			}
  		]
  	}
  ];

  var locations = [
  	{
  		id: "cave_bats",
  		army: [
  			{
  				id: "vampire_bat",
  				value: 2
  			}
  		],
  		level: 0,
  		tier: 0,
  		gen: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 0.3
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 0.3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "kobold_looters",
  		army: [
  			{
  				id: "kobold",
  				value: 2
  			}
  		],
  		level: 0,
  		tier: 0,
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 0.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "nasty_pillagers",
  		army: [
  			{
  				id: "pillager",
  				value: 2
  			}
  		],
  		level: 0,
  		tier: 0,
  		gen: [
  			{
  				type: "resource",
  				id: "iron",
  				value: 0.2
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "prisoner_wagon",
  		army: [
  			{
  				id: "bandit",
  				value: 2
  			}
  		],
  		level: 0,
  		tier: 0,
  		gen: [
  			{
  				type: "population",
  				id: "unemployed",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "rat_cellar",
  		army: [
  			{
  				id: "dirty_rat",
  				value: 3
  			}
  		],
  		level: 0,
  		tier: 0,
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: 0.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "ancient_burial_place",
  		army: [
  			{
  				id: "skeleton",
  				value: 11
  			},
  			{
  				id: "zombie",
  				value: 6
  			},
  			{
  				id: "ghost",
  				value: 2
  			}
  		],
  		level: 1,
  		tier: 1,
  		gen: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 0.5
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 0.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "ancient_hideout",
  		army: [
  			{
  				id: "bandit",
  				value: 17
  			}
  		],
  		level: 1,
  		tier: 1,
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1
  			},
  			{
  				type: "cap",
  				id: "gold",
  				value: 800
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "bandit_camp",
  		army: [
  			{
  				id: "bandit",
  				value: 9
  			}
  		],
  		level: 1,
  		tier: 1,
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "far_west_island",
  		army: [
  			{
  				id: "ravenous_crab",
  				value: 15
  			}
  		],
  		level: 1,
  		tier: 1,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 10,
  				fix: true
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "goblin_lair",
  		army: [
  			{
  				id: "goblin_marauder",
  				value: 12
  			},
  			{
  				id: "goblin_warrior",
  				value: 3
  			}
  		],
  		level: 1,
  		tier: 1,
  		gen: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "haunted_library",
  		army: [
  			{
  				id: "ghost",
  				value: 9
  			}
  		],
  		level: 1,
  		tier: 1,
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 0.5
  			},
  			{
  				type: "cap",
  				id: "research",
  				value: 1500
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "korrigan_dolmen",
  		army: [
  			{
  				id: "korrigan_slinger",
  				value: 6
  			},
  			{
  				id: "korrigan_swindler",
  				value: 10
  			}
  		],
  		level: 1,
  		tier: 1,
  		gen: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 0.7
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 0.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "old_herd",
  		army: [
  			{
  				id: "dirty_rat",
  				value: 18
  			}
  		],
  		level: 1,
  		tier: 1,
  		gen: [
  			{
  				type: "cap",
  				id: "cow",
  				value: 200
  			},
  			{
  				type: "cap",
  				id: "horse",
  				value: 100
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "old_storage_room",
  		army: [
  			{
  				id: "spider",
  				value: 5
  			}
  		],
  		level: 1,
  		tier: 1,
  		gen: [
  			{
  				type: "cap",
  				id: "wood",
  				value: 500
  			},
  			{
  				type: "cap",
  				id: "stone",
  				value: 500
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "wolf_pack",
  		army: [
  			{
  				id: "wolf",
  				value: 9
  			}
  		],
  		level: 1,
  		tier: 1,
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "barbarian_camp",
  		army: [
  			{
  				id: "barbarian_warrior",
  				value: 17
  			}
  		],
  		level: 2,
  		tier: 2,
  		gen: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 0.3
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "bugbear_tribe",
  		army: [
  			{
  				id: "bugbear",
  				value: 18
  			}
  		],
  		level: 2,
  		tier: 2,
  		gen: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "burning_pit",
  		army: [
  			{
  				id: "imp",
  				value: 20
  			},
  			{
  				id: "lesser_demon",
  				value: 6
  			}
  		],
  		level: 2,
  		tier: 2,
  		gen: [
  			{
  				type: "resource",
  				id: "copper",
  				value: 0.5
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 0.3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "gnoll_raiding_party",
  		army: [
  			{
  				id: "gnoll_raider",
  				value: 25
  			}
  		],
  		level: 2,
  		tier: 2,
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 0.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "harpy_nest",
  		army: [
  			{
  				id: "harpy",
  				value: 26
  			}
  		],
  		level: 2,
  		tier: 2,
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "cow",
  				value: 0.3
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 0.1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "hobgoblin_encampment",
  		army: [
  			{
  				id: "hobgoblin_grunt",
  				value: 21
  			}
  		],
  		level: 2,
  		tier: 2,
  		gen: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 0.3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "kobold_underground_tunnels",
  		army: [
  			{
  				id: "kobold",
  				value: 36
  			}
  		],
  		level: 2,
  		tier: 2,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 15,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 0.3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "naga_nest",
  		army: [
  			{
  				id: "naga",
  				value: 12
  			}
  		],
  		level: 2,
  		tier: 2,
  		gen: [
  			{
  				type: "resource",
  				id: "cow",
  				value: 0.2
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 0.1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "rusted_warehouse",
  		army: [
  			{
  				id: "bandit",
  				value: 22
  			}
  		],
  		level: 2,
  		tier: 2,
  		gen: [
  			{
  				type: "cap",
  				id: "wood",
  				value: 1000
  			},
  			{
  				type: "cap",
  				id: "stone",
  				value: 1000
  			},
  			{
  				type: "cap",
  				id: "copper",
  				value: 500
  			},
  			{
  				type: "cap",
  				id: "iron",
  				value: 500
  			},
  			{
  				type: "cap",
  				id: "tools",
  				value: 500
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "snakes_nest",
  		army: [
  			{
  				id: "snake",
  				value: 9
  			},
  			{
  				id: "giant_snake",
  				value: 4
  			}
  		],
  		level: 2,
  		tier: 2,
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "cow",
  				value: 0.3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "temple_gargoyle",
  		army: [
  			{
  				id: "gargoyle",
  				value: 14
  			}
  		],
  		level: 2,
  		tier: 2,
  		gen: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 0.6
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 0.6
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "troll_cave",
  		army: [
  			{
  				id: "troll_cave",
  				value: 9
  			}
  		],
  		level: 2,
  		tier: 2,
  		gen: [
  			{
  				type: "resource",
  				id: "copper",
  				value: 0.3
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 0.2
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "ball_lightning_field",
  		army: [
  			{
  				id: "ball_lightning",
  				value: 26
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "barren_hills",
  		army: [
  			{
  				id: "hill_giant",
  				value: 7
  			},
  			{
  				id: "kobold",
  				value: 52
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 30,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 0.1
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "basilisk_cave",
  		army: [
  			{
  				id: "basilisk",
  				value: 7
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "resource",
  				id: "cow",
  				value: 0.3
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 0.1
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "black_mage_tower",
  		army: [
  			{
  				id: "black_mage",
  				value: 1
  			},
  			{
  				id: "goblin_warrior",
  				value: 60
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 30,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "construction_site",
  		army: [
  			{
  				id: "mercenary_veteran",
  				value: 25
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "cap",
  				id: "building_material",
  				value: 750
  			},
  			{
  				type: "cap",
  				id: "steel",
  				value: 750
  			},
  			{
  				type: "cap",
  				id: "crystal",
  				value: 300
  			},
  			{
  				type: "cap",
  				id: "supplies",
  				value: 300
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "deserters_den",
  		army: [
  			{
  				id: "bandit",
  				value: 26
  			},
  			{
  				id: "deserter",
  				value: 14
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 0.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "ettin_camp",
  		army: [
  			{
  				id: "ettin",
  				value: 12
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "golem_cave",
  		army: [
  			{
  				id: "golem",
  				value: 15
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 0.7
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 0.5
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 0.1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "kobold_city",
  		army: [
  			{
  				id: "kobold",
  				value: 99
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 40,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "mercenary_camp",
  		army: [
  			{
  				id: "mercenary_veteran",
  				value: 30
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 0.3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "mountain_cave",
  		army: [
  			{
  				id: "mountain_giant",
  				value: 1
  			},
  			{
  				id: "goblin_marauder",
  				value: 52
  			},
  			{
  				id: "goblin_warrior",
  				value: 28
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 40,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 0.3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "myconid_cavern",
  		army: [
  			{
  				id: "myconid",
  				value: 42
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "necromancer_crypt",
  		army: [
  			{
  				id: "ghoul",
  				value: 26
  			},
  			{
  				id: "ghast",
  				value: 16
  			},
  			{
  				id: "necromancer",
  				value: 1
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 20,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "skullface_encampment",
  		army: [
  			{
  				id: "skullface",
  				value: 1
  			},
  			{
  				id: "bandit",
  				value: 75
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 15,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "spider_forest",
  		army: [
  			{
  				id: "spider",
  				value: 32
  			},
  			{
  				id: "giant_spider",
  				value: 8
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 1.5
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 0.1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "strange_village",
  		army: [
  			{
  				id: "charmed_dweller",
  				value: 47
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "population",
  				id: "unemployed",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "wyvern_nest",
  		army: [
  			{
  				id: "wyvern",
  				value: 12
  			}
  		],
  		level: 3,
  		tier: 3,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 30,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "demonic_portal",
  		army: [
  			{
  				id: "greater_demon",
  				value: 10
  			},
  			{
  				id: "lesser_demon",
  				value: 22
  			},
  			{
  				id: "imp",
  				value: 50
  			}
  		],
  		level: 4,
  		tier: 4,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 30,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "djinn_palace",
  		army: [
  			{
  				id: "djinn",
  				value: 1
  			},
  			{
  				id: "naga",
  				value: 56
  			}
  		],
  		level: 4,
  		tier: 4,
  		gen: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "galliard_mercenary_camp",
  		army: [
  			{
  				id: "galliard",
  				value: 1
  			},
  			{
  				id: "mercenary_veteran",
  				value: 70
  			}
  		],
  		level: 4,
  		tier: 4,
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 0.6
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "giant_temple",
  		army: [
  			{
  				id: "gargoyle",
  				value: 43
  			}
  		],
  		level: 4,
  		tier: 4,
  		gen: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "gulud_ugdun",
  		army: [
  			{
  				id: "gulud",
  				value: 1
  			},
  			{
  				id: "orc_worker",
  				value: 350
  			}
  		],
  		level: 4,
  		tier: 4,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 150,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "hydra_pit",
  		army: [
  			{
  				id: "hydra",
  				value: 1
  			},
  			{
  				id: "giant_snake",
  				value: 110
  			}
  		],
  		level: 4,
  		tier: 4,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 50,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "cow",
  				value: 0.5
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 0.3
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "lead_golem_mine",
  		army: [
  			{
  				id: "lead_golem",
  				value: 42
  			}
  		],
  		level: 4,
  		tier: 4,
  		gen: [
  			{
  				type: "resource",
  				id: "copper",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "lich_temple",
  		army: [
  			{
  				id: "zombie",
  				value: 70
  			},
  			{
  				id: "ghoul",
  				value: 40
  			},
  			{
  				id: "ghast",
  				value: 30
  			},
  			{
  				id: "lich",
  				value: 1
  			}
  		],
  		level: 4,
  		tier: 4,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 40,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "markanat_forest",
  		army: [
  			{
  				id: "markanat",
  				value: 1
  			},
  			{
  				id: "giant_spider",
  				value: 140
  			}
  		],
  		level: 4,
  		tier: 4,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 50,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 2
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "minotaur_maze",
  		army: [
  			{
  				id: "minotaur",
  				value: 1
  			},
  			{
  				id: "kobold",
  				value: 210
  			}
  		],
  		level: 4,
  		tier: 4,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 50,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 0.5
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 0.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "swarm_wasp",
  		army: [
  			{
  				id: "giant_wasp",
  				value: 540
  			}
  		],
  		level: 4,
  		tier: 4,
  		gen: [
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.2
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "barbarian_village",
  		army: [
  			{
  				id: "barbarian_warrior",
  				value: 40
  			},
  			{
  				id: "barbarian_leader",
  				value: 3
  			}
  		],
  		level: 4,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 0.3
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "demoness_castle",
  		army: [
  			{
  				id: "demoness",
  				value: 1
  			},
  			{
  				id: "greater_demon",
  				value: 20
  			},
  			{
  				id: "lesser_demon",
  				value: 60
  			},
  			{
  				id: "charmed_dweller",
  				value: 70
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 50,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 2
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "desecrated_temple",
  		army: [
  			{
  				id: "orc_shaman",
  				value: 15
  			},
  			{
  				id: "orc_worker",
  				value: 89
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.2
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "east_sacred_place",
  		army: [
  			{
  				id: "wind_elemental",
  				value: 28
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "ettin_enslaver",
  		army: [
  			{
  				id: "ettin",
  				value: 42
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 2
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "fire_salamander_nest",
  		army: [
  			{
  				id: "fire_salamander",
  				value: 62
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 0.5
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 0.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "forgotten_shelter",
  		army: [
  			{
  				id: "spectra_memory",
  				value: 250
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 50,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 2
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "gloomy_werewolf_forest",
  		army: [
  			{
  				id: "werewolf",
  				value: 1
  			},
  			{
  				id: "wolf",
  				value: 130
  			}
  		],
  		level: 4,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 50,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 1.5
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "gorgon_cave",
  		army: [
  			{
  				id: "gorgon",
  				value: 1
  			},
  			{
  				id: "naga",
  				value: 70
  			}
  		],
  		level: 4,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 50,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "hell_hole",
  		army: [
  			{
  				id: "archdemon",
  				value: 3
  			},
  			{
  				id: "greater_demon",
  				value: 52
  			},
  			{
  				id: "lesser_demon",
  				value: 98
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 70,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.2
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "hobgoblin_chieftain",
  		army: [
  			{
  				id: "hobgoblin_grunt",
  				value: 50
  			},
  			{
  				id: "hobgoblin_archer",
  				value: 60
  			},
  			{
  				id: "hobgoblin_chieftain",
  				value: 1
  			}
  		],
  		level: 4,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 1.5
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 0.5
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 0.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "huge_cave",
  		army: [
  			{
  				id: "skeletal_knight",
  				value: 50
  			},
  			{
  				id: "skeleton",
  				value: 750
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 1.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "king_reptiles",
  		army: [
  			{
  				id: "velociraptors",
  				value: 67
  			},
  			{
  				id: "tyrannosaurus",
  				value: 1
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 2
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "north_sacred_place",
  		army: [
  			{
  				id: "frost_elemental",
  				value: 28
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "old_outpost",
  		army: [
  			{
  				id: "bandit",
  				value: 120
  			},
  			{
  				id: "mercenary_veteran",
  				value: 90
  			},
  			{
  				id: "deserter",
  				value: 50
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 50,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "orc_raiding_party",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 200
  			},
  			{
  				id: "orc_warlord",
  				value: 1
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "orcish_prison_camp",
  		army: [
  			{
  				id: "orc_worker",
  				value: 120
  			},
  			{
  				id: "orc_warrior",
  				value: 90
  			},
  			{
  				id: "orc_warg_rider",
  				value: 60
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "population",
  				id: "unemployed",
  				value: 2
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "south_sacred_place",
  		army: [
  			{
  				id: "fire_elemental",
  				value: 28
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "succubus_library",
  		army: [
  			{
  				id: "succubus",
  				value: 90
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "cap",
  				id: "research",
  				value: 5000
  			},
  			{
  				type: "cap",
  				id: "crystal",
  				value: 1000
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "west_sacred_place",
  		army: [
  			{
  				id: "earth_elemental",
  				value: 28
  			}
  		],
  		level: 5,
  		tier: 5,
  		gen: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "ancient_giant",
  		army: [
  			{
  				id: "ancient_giant",
  				value: 1
  			},
  			{
  				id: "hill_giant",
  				value: 140
  			}
  		],
  		level: 6,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 100,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "bugbear_war_party",
  		army: [
  			{
  				id: "bugbear_chieftain",
  				value: 1
  			},
  			{
  				id: "bugbear",
  				value: 120
  			}
  		],
  		level: 5,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 2
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "citadel_dead",
  		army: [
  			{
  				id: "zombie",
  				value: 350
  			},
  			{
  				id: "ghoul",
  				value: 130
  			},
  			{
  				id: "wyvern",
  				value: 30
  			}
  		],
  		level: 5,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 70,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 0.5
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 0.2
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "earth_elemental_circle",
  		army: [
  			{
  				id: "earth_elemental",
  				value: 56
  			}
  		],
  		level: 6,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "fire_elemental_circle",
  		army: [
  			{
  				id: "fire_elemental",
  				value: 56
  			}
  		],
  		level: 6,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "frost_elemental_circle",
  		army: [
  			{
  				id: "frost_elemental",
  				value: 56
  			}
  		],
  		level: 6,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "gnoll_camp",
  		army: [
  			{
  				id: "gnoll_leader",
  				value: 1
  			},
  			{
  				id: "gnoll_raider",
  				value: 180
  			}
  		],
  		level: 5,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 3
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "mountain_valley",
  		army: [
  			{
  				id: "frost_giant",
  				value: 1
  			},
  			{
  				id: "hill_giant",
  				value: 120
  			}
  		],
  		level: 5,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 50,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 2
  			},
  			{
  				type: "cap",
  				id: "food",
  				value: 1000
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "orc_gormiak_citadel",
  		army: [
  			{
  				id: "orc_warrior",
  				value: 300
  			},
  			{
  				id: "orc_stone_thrower",
  				value: 150
  			},
  			{
  				id: "orc_warlord",
  				value: 3
  			}
  		],
  		level: 6,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "iron",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "orc_horith_citadel",
  		army: [
  			{
  				id: "orc_ironskin",
  				value: 300
  			},
  			{
  				id: "orc_flame_caster",
  				value: 150
  			}
  		],
  		level: 6,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.5
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "orc_ogsog_citadel",
  		army: [
  			{
  				id: "orc_champion",
  				value: 30
  			},
  			{
  				id: "orc_warrior",
  				value: 350
  			},
  			{
  				id: "orc_warlord",
  				value: 5
  			}
  		],
  		level: 6,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "orc_turgon_citadel",
  		army: [
  			{
  				id: "orc_shaman",
  				value: 50
  			},
  			{
  				id: "orc_warg_rider",
  				value: 300
  			},
  			{
  				id: "orc_warlord",
  				value: 1
  			}
  		],
  		level: 6,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 3
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 3
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "son_atamar",
  		army: [
  			{
  				id: "deserter",
  				value: 60
  			},
  			{
  				id: "son_atamar",
  				value: 30
  			}
  		],
  		level: 5,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 30,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.2
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "vampire_crypt",
  		army: [
  			{
  				id: "vampire_bat",
  				value: 120
  			},
  			{
  				id: "vampire_servant",
  				value: 60
  			}
  		],
  		level: 5,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 0.2
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "wind_elemental_circle",
  		army: [
  			{
  				id: "wind_elemental",
  				value: 56
  			}
  		],
  		level: 6,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "worn_down_crypt",
  		army: [
  			{
  				id: "skeletal_knight",
  				value: 67
  			}
  		],
  		level: 4,
  		tier: 6,
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 1
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "eternal_halls",
  		army: [
  			{
  				id: "eternal_guardian",
  				value: 35
  			},
  			{
  				id: "golem",
  				value: 90
  			}
  		],
  		level: 5,
  		tier: 7,
  		gen: [
  			{
  				type: "resource",
  				id: "building_material",
  				value: 0.8
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.5
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "vampire_lair",
  		army: [
  			{
  				id: "vampire",
  				value: 1
  			},
  			{
  				id: "vampire_servant",
  				value: 140
  			}
  		],
  		level: 5,
  		tier: 7,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 50,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.3
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "gold_mine",
  		army: [
  			{
  				id: "troll_battle",
  				value: 70
  			},
  			{
  				id: "troll_cave",
  				value: 120
  			}
  		],
  		level: 6,
  		tier: 8,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 150,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 15
  			}
  		],
  		onlyDefend: false
  	},
  	{
  		id: "sleeping_titan",
  		army: [
  			{
  				id: "titan",
  				value: 1
  			},
  			{
  				id: "golem",
  				value: 750
  			}
  		],
  		level: 8,
  		tier: 8,
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 150,
  				fix: true
  			}
  		],
  		onlyDefend: false
  	}
  ];

  var spells = [
  	{
  		id: "holy_light",
  		type: "prayer",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior_monk",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cleric",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "army_faith",
  		type: "prayer",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior_monk",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cleric",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "great_seeker_blessing",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "archer",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "crossbowman",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "great_warrior_blessing",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "spearman",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "mana_energy_shield",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 80,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "sacred_armor",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "attack",
  				value: 10,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "defense",
  				value: 20,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "wild_man_spear",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "light_cavarly",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "light_cavarly",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "dark_ritual",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior_monk",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "sacred_golem",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cleric",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "mana_dome",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 200,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "sacred_weapon",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cleric",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "church_ritual",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "general",
  				type_gen: "stat",
  				gen: "attack",
  				value: 25,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "general",
  				type_gen: "stat",
  				gen: "defense",
  				value: 25,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "great_seeker_eyesight",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "arquebusier",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "arquebusier",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "great_warrior_fury",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "new_world_chant",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "spearman",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "spearman",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "wild_man_dexterity",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "knight",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "knight",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cuirassier",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cuirassier",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "dragon_armor",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cleric",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "shieldbearer",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "juggernaut",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior_monk",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "dragon_weapon",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "light_cavarly",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "mana_armor",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "priest",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "shieldbearer",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "juggernaut",
  				type_gen: "stat",
  				gen: "defense",
  				value: 10,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "defense",
  				value: 10,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "blessing_city",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "attack",
  				value: 50,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 50,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "northern_star_protection",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 500,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "army_blessing",
  		type: "spell",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "line_infantry",
  				type_gen: "stat",
  				gen: "defense",
  				value: 15,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cuirassier",
  				type_gen: "stat",
  				gen: "defense",
  				value: 15,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "general",
  				type_gen: "stat",
  				gen: "defense",
  				value: 25,
  				perc: false
  			}
  		]
  	}
  ];

  var tech = [
  	{
  		id: "fine_lucky_wood",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "archer",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "crossbowman",
  				type_gen: "stat",
  				gen: "attack",
  				value: 4,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "elf_warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 6,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "dirty_money",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "white_company",
  				type_gen: "stat",
  				gen: "attack",
  				value: 8,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "white_company",
  				type_gen: "stat",
  				gen: "defense",
  				value: 8,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "attack",
  				value: 8,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "defense",
  				value: 8,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "canava_guard",
  				type_gen: "stat",
  				gen: "attack",
  				value: 8,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "canava_guard",
  				type_gen: "stat",
  				gen: "defense",
  				value: 8,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "prepare_tunnel",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 400,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "tunnel_hq",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "attack",
  				value: 40,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "defense",
  				value: 40,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "stocked_tunnel",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 700,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "martial_arts",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior_monk",
  				type_gen: "stat",
  				gen: "attack",
  				value: 7,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior_monk",
  				type_gen: "stat",
  				gen: "defense",
  				value: 7,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "fate_blessing",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cleric",
  				type_gen: "stat",
  				gen: "attack",
  				value: 7,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cleric",
  				type_gen: "stat",
  				gen: "defense",
  				value: 7,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "heirloom_wisdom_t",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "archer",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "archer",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "heirloom_death_t",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "spearman",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "spearman",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "heirloom_wealth_t",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "bronze_projectiles",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "archer",
  				type_gen: "stat",
  				gen: "attack",
  				value: 1,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "bronze_shield",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "spearman",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "phalanx",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "shieldbearer",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "bronze_sword",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "attack",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "bronze_lance",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "light_cavarly",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "forging_equipments",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "spearman",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "iron_projectiles",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "archer",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "crossbowman",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "white_company",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "iron_shield",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "spearman",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "phalanx",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "shieldbearer",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cleric",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "iron_sword",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "canava_guard",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "canava_guard",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "iron_lance",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "light_cavarly",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "knight",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "galliard_mercenary",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "galliard_true_form",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cpt_galliard",
  				type_gen: "stat",
  				gen: "attack",
  				value: 240,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cpt_galliard",
  				type_gen: "stat",
  				gen: "defense",
  				value: 180,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "forging_equipments_II",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "defense",
  				value: 4,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "knight",
  				type_gen: "stat",
  				gen: "defense",
  				value: 4,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "defense",
  				value: 4,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "steel_projectiles",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "archer",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "crossbowman",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "white_company",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "steel_shield",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "spearman",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "phalanx",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "shieldbearer",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cleric",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "steel_sword",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "canava_guard",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "canava_guard",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "defense",
  				value: 1,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "steel_lance",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "light_cavarly",
  				type_gen: "stat",
  				gen: "attack",
  				value: 4,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "knight",
  				type_gen: "stat",
  				gen: "attack",
  				value: 4,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cataphract",
  				type_gen: "stat",
  				gen: "attack",
  				value: 4,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "infuse_flame",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "strategist",
  				type_gen: "stat",
  				gen: "attack",
  				value: 10,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "strategist",
  				type_gen: "stat",
  				gen: "defense",
  				value: 10,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "attack",
  				value: 15,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "defense",
  				value: 15,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "poisoned_arrows",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "archer",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "crossbowman",
  				type_gen: "stat",
  				gen: "attack",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "adamantium_projectiles",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "archer",
  				type_gen: "stat",
  				gen: "attack",
  				value: 4,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "crossbowman",
  				type_gen: "stat",
  				gen: "attack",
  				value: 4,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "white_company",
  				type_gen: "stat",
  				gen: "attack",
  				value: 4,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "arquebusier",
  				type_gen: "stat",
  				gen: "attack",
  				value: 4,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "adamantium_shield",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "spearman",
  				type_gen: "stat",
  				gen: "defense",
  				value: 4,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "phalanx",
  				type_gen: "stat",
  				gen: "defense",
  				value: 4,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "shieldbearer",
  				type_gen: "stat",
  				gen: "defense",
  				value: 4,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cleric",
  				type_gen: "stat",
  				gen: "defense",
  				value: 4,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "adamantium_sword",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "canava_guard",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "canava_guard",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "adamantium_lance",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "light_cavarly",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "knight",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cataphract",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cuirassier",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "mithril_projectiles",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "archer",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "crossbowman",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "white_company",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "arquebusier",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "ranger",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "elf_warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "marksman",
  				type_gen: "stat",
  				gen: "attack",
  				value: 5,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "mithril_shield",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "spearman",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "phalanx",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "shieldbearer",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cleric",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "paladin",
  				type_gen: "stat",
  				gen: "defense",
  				value: 5,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "mithril_sword",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "heavy_warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "mercenary_veteran",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "canava_guard",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "canava_guard",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "man_at_arms",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "line_infantry",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "line_infantry",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "colonial_militia",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "colonial_militia",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "commander",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "general",
  				type_gen: "stat",
  				gen: "attack",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "general",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "mithril_lance",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "light_cavarly",
  				type_gen: "stat",
  				gen: "attack",
  				value: 6,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "knight",
  				type_gen: "stat",
  				gen: "attack",
  				value: 6,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cataphract",
  				type_gen: "stat",
  				gen: "attack",
  				value: 6,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "cuirassier",
  				type_gen: "stat",
  				gen: "attack",
  				value: 6,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "orcish_threat",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "general",
  				type_gen: "stat",
  				gen: "attack",
  				value: 20,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "general",
  				type_gen: "stat",
  				gen: "defense",
  				value: 20,
  				perc: false
  			}
  		]
  	},
  	{
  		id: "honor_humanity",
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "line_infantry",
  				type_gen: "stat",
  				gen: "attack",
  				value: 4,
  				perc: false
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "line_infantry",
  				type_gen: "stat",
  				gen: "defense",
  				value: 8,
  				perc: false
  			}
  		]
  	}
  ];

  var units = [
  	{
  		id: "settlement_defenses",
  		type: "settlement",
  		attack: 1,
  		defense: 50,
  		cap: 1,
  		order: 0,
  		cat: 0,
  		category: "RECON"
  	},
  	{
  		id: "scout",
  		type: "army",
  		attack: 2,
  		defense: 2,
  		purchase: [
  			{
  				type: "tech",
  				id: "archery",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 400
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 200
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 200
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 100
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.1
  			}
  		],
  		order: 3,
  		cat: 0,
  		category: "RECON"
  	},
  	{
  		id: "explorer",
  		type: "army",
  		attack: 5,
  		defense: 5,
  		purchase: [
  			{
  				type: "tech",
  				id: "guild",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 1000
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 100
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 400
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 20
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.2
  			}
  		],
  		order: 3,
  		cat: 0,
  		category: "RECON"
  	},
  	{
  		id: "familiar",
  		type: "army",
  		attack: 4,
  		defense: 4,
  		cap: 5,
  		purchase: [
  			{
  				type: "tech",
  				id: "zenix_familiar_t",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 100
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 100
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "food",
  				value: 100
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 100
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "research",
  				value: 0.4
  			}
  		],
  		order: 3,
  		cat: 0,
  		category: "RECON"
  	},
  	{
  		id: "spy",
  		type: "army",
  		attack: 7,
  		defense: 3,
  		purchase: [
  			{
  				type: "tech",
  				id: "espionage",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 1000
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 100
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.1
  			}
  		],
  		order: 3,
  		cat: 0,
  		category: "RECON"
  	},
  	{
  		id: "archer",
  		type: "army",
  		attack: 3,
  		defense: 2,
  		purchase: [
  			{
  				type: "tech",
  				id: "archery",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 200
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 100
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 20
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 20
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.2
  			}
  		],
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "battering_ram",
  		type: "army",
  		attack: 14,
  		defense: 2,
  		purchase: [
  			{
  				type: "tech",
  				id: "warfare",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 800
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 1000
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 80
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 50
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -4
  			}
  		],
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "crossbowman",
  		type: "army",
  		attack: 11,
  		defense: 6,
  		purchase: [
  			{
  				type: "tech",
  				id: "crossbow",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 1000
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 400
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 50
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 40
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 40
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.5
  			}
  		],
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "trebuchet",
  		type: "army",
  		attack: 28,
  		defense: 3,
  		purchase: [
  			{
  				type: "tech",
  				id: "siege_techniques",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 1200
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 2000
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 100
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 100
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -5
  			}
  		],
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "white_company",
  		type: "army",
  		attack: 18,
  		defense: 11,
  		purchase: [
  			{
  				type: "tech",
  				id: "white_t_company",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2500
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 75
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -5
  			}
  		],
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "strategist",
  		type: "army",
  		attack: 72,
  		defense: 12,
  		cap: 1,
  		purchase: [
  			{
  				type: "prayer",
  				id: "zenix_aid",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 7500
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 400
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1000
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 300
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 3
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: -1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: -6
  			}
  		],
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "arquebusier",
  		type: "army",
  		attack: 16,
  		defense: 7,
  		purchase: [
  			{
  				type: "tech",
  				id: "gunpowder",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 1500
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 100
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 80
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 40
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.9
  			}
  		],
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "bombard",
  		type: "army",
  		attack: 42,
  		defense: 4,
  		purchase: [
  			{
  				type: "tech",
  				id: "military_science",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 200
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 200
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 200
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -7
  			}
  		],
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "cannon",
  		type: "army",
  		attack: 88,
  		defense: 8,
  		purchase: [
  			{
  				type: "tech",
  				id: "field_artillery",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 5000
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 1000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 500
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 500
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -15
  			}
  		],
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "artillery",
  		type: "army",
  		attack: 160,
  		defense: 15,
  		purchase: [
  			{
  				type: "tech",
  				id: "metal_alloys",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 15000
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 5000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 5000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 2500
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 200
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -25
  			}
  		],
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "ranger",
  		type: "army",
  		attack: 22,
  		defense: 15,
  		cap: 50,
  		purchase: [
  			{
  				type: "tech",
  				id: "guerrilla_warfare",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 1000
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 500
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 100
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 50
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: 1.2
  			}
  		],
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "elf_warrior",
  		type: "army",
  		attack: 62,
  		defense: 55,
  		cap: 25,
  		purchase: [
  			{
  				type: "tech",
  				id: "elf_warriors",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 2000
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 2000
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "supplies",
  				value: 250
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 150
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -2.5
  			}
  		],
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "marksman",
  		type: "army",
  		attack: 35,
  		defense: 15,
  		purchase: [
  			{
  				type: "tech",
  				id: "trenches",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 3500
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 500
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 500
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 125
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 75
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 25
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -1.5
  			}
  		],
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "longbowman",
  		type: "army",
  		attack: 91,
  		defense: 2,
  		purchase: [
  			{
  				type: "tech",
  				id: "trained_longbowman",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 8000
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 8000
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 50
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 10
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.25
  			}
  		],
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "spearman",
  		type: "army",
  		attack: 2,
  		defense: 7,
  		purchase: [
  			{
  				type: "tech",
  				id: "bronze_working",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 200
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 150
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 50
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 30
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 25
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.2
  			}
  		],
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "phalanx",
  		type: "army",
  		attack: 6,
  		defense: 20,
  		purchase: [
  			{
  				type: "tech",
  				id: "phalanx_combat",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 200
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 150
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 150
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 30
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 30
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.3
  			}
  		],
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "warrior_monk",
  		type: "army",
  		attack: 3,
  		defense: 13,
  		purchase: [
  			{
  				type: "prayer",
  				id: "prayer_for_the_ancient_monk",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 800
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 400
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "food",
  				value: 10
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.4
  			}
  		],
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "shieldbearer",
  		type: "army",
  		attack: 5,
  		defense: 23,
  		purchase: [
  			{
  				type: "tech",
  				id: "bronze_working",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "shieldbearer",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 350
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 350
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 30
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 30
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.4
  			}
  		],
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "priest",
  		type: "army",
  		attack: 1,
  		defense: 36,
  		purchase: [
  			{
  				type: "tech",
  				id: "religion",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "priest",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 800
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 800
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "food",
  				value: 80
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: -1
  			}
  		],
  		order: 2,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "sacred_golem",
  		type: "army",
  		attack: 8,
  		defense: 22,
  		purchase: [
  			{
  				type: "prayer",
  				id: "create_sacred_golem",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 2000
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 1000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 800
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 100
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -1
  			}
  		],
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "cleric",
  		type: "army",
  		attack: 8,
  		defense: 24,
  		purchase: [
  			{
  				type: "tech",
  				id: "order_of_clerics",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 1800
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 200
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "food",
  				value: 60
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -1
  			}
  		],
  		order: 2,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "juggernaut",
  		type: "army",
  		attack: 15,
  		defense: 50,
  		purchase: [
  			{
  				type: "tech",
  				id: "bronze_working",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "juggernaut",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 600
  			},
  			{
  				type: "resource",
  				id: "cow",
  				value: 600
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 400
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "food",
  				value: 150
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 150
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -2
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: -1
  			}
  		],
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "paladin",
  		type: "army",
  		attack: 28,
  		defense: 56,
  		purchase: [
  			{
  				type: "prayer",
  				id: "warrior_gods",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 2500
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 500
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 200
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 100
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.1
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: -1.5
  			}
  		],
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "behemoth",
  		type: "army",
  		attack: 24,
  		defense: 98,
  		cap: 20,
  		purchase: [
  			{
  				type: "tech",
  				id: "steel_flesh",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 3000
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 1500
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 1000
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 100
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 100
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -3
  			}
  		],
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "ancient_balor",
  		type: "army",
  		attack: 150,
  		defense: 750,
  		cap: 1,
  		purchase: [
  			{
  				type: "tech",
  				id: "ancient_balor_t",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 10000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 10000
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "food",
  				value: 1000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1000
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "iron",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: -30
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: -30
  			}
  		],
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "smuggler",
  		type: "army",
  		attack: 2,
  		defense: 52,
  		purchase: [
  			{
  				type: "tech",
  				id: "illgotten_gains",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 250
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 250
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 25
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 15
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.2
  			}
  		],
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "warrior",
  		type: "army",
  		attack: 8,
  		defense: 8,
  		purchase: [
  			{
  				type: "tech",
  				id: "bronze_working",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 400
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 200
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 40
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 40
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.4
  			}
  		],
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "mercenary_veteran",
  		type: "army",
  		attack: 12,
  		defense: 8,
  		purchase: [
  			{
  				type: "tech",
  				id: "mercenary_bands",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2500
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 150
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -5
  			}
  		],
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "heavy_warrior",
  		type: "army",
  		attack: 12,
  		defense: 12,
  		purchase: [
  			{
  				type: "tech",
  				id: "iron_working",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 800
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 300
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 70
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 70
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.6
  			}
  		],
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "canava_guard",
  		type: "army",
  		attack: 15,
  		defense: 15,
  		purchase: [
  			{
  				type: "tech",
  				id: "canava_mercenary",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2000
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 50
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -5
  			}
  		],
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "man_at_arms",
  		type: "army",
  		attack: 18,
  		defense: 14,
  		purchase: [
  			{
  				type: "tech",
  				id: "plate_armor",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 1500
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 250
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 120
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 80
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.8
  			}
  		],
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "line_infantry",
  		type: "army",
  		attack: 34,
  		defense: 22,
  		purchase: [
  			{
  				type: "tech",
  				id: "flintlock_musket",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2500
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 500
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 250
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 250
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 120
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -1.4
  			}
  		],
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "jager",
  		type: "army",
  		attack: 82,
  		defense: 18,
  		cap: 100,
  		purchase: [
  			{
  				type: "tech",
  				id: "dimensional_device",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2000
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 1000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 500
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 200
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 100
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -1.2
  			}
  		],
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "colonial_militia",
  		type: "army",
  		attack: 7,
  		defense: 8,
  		purchase: [
  			{
  				type: "tech",
  				id: "new_world_militia",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 100
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 10
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 15
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 5
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.1
  			}
  		],
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "battle_angel",
  		type: "army",
  		attack: 38,
  		defense: 36,
  		purchase: [
  			{
  				type: "tech",
  				id: "holy_fury",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 2000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 600
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 100
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 100
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -1
  			}
  		],
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "commander",
  		type: "army",
  		attack: 30,
  		defense: 26,
  		cap: 1,
  		purchase: [
  			{
  				type: "tech",
  				id: "warfare",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2500
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 200
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 120
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -2
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: -10
  			}
  		],
  		order: 3,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "tamed_djinn",
  		type: "army",
  		attack: 40,
  		defense: 40,
  		cap: 1,
  		purchase: [
  			{
  				type: "prayer",
  				id: "desire_war",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1000
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 100
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -5
  			}
  		],
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "general",
  		type: "army",
  		attack: 60,
  		defense: 100,
  		cap: 1,
  		purchase: [
  			{
  				type: "building",
  				id: "officer_training_ground",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 15000
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1000
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 500
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -10
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: -30
  			}
  		],
  		order: 3,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "seraphim",
  		type: "army",
  		attack: 450,
  		defense: 400,
  		cap: 1,
  		purchase: [
  			{
  				type: "tech",
  				id: "seraphim_t",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 10000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 5000
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 2000
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1500
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1500
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "research",
  				value: 15
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 1.5
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: -20
  			}
  		],
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "nikharul_soulstealer",
  		type: "army",
  		attack: 1200,
  		defense: 150,
  		cap: 1,
  		purchase: [
  			{
  				type: "prayer",
  				id: "summon_nikharul",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 12500
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 6000
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -100
  			}
  		],
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "light_cavarly",
  		type: "army",
  		attack: 10,
  		defense: 4,
  		purchase: [
  			{
  				type: "tech",
  				id: "breeding",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 400
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 300
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 25
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 60
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 40
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.5
  			}
  		],
  		order: 2,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "knight",
  		type: "army",
  		attack: 26,
  		defense: 22,
  		purchase: [
  			{
  				type: "tech",
  				id: "knighthood",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 3000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 250
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 50
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 120
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 100
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -1.2
  			}
  		],
  		order: 2,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "cataphract",
  		type: "army",
  		attack: 18,
  		defense: 48,
  		purchase: [
  			{
  				type: "tech",
  				id: "persuade_nobility",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 500
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 75
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 150
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 50
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.8
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: -0.8
  			}
  		],
  		order: 2,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "cuirassier",
  		type: "army",
  		attack: 36,
  		defense: 28,
  		purchase: [
  			{
  				type: "tech",
  				id: "cuirassiers",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 5000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 500
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 200
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 200
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 200
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 200
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "food",
  				value: -2
  			}
  		],
  		order: 2,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "cpt_galliard",
  		type: "army",
  		attack: 80,
  		defense: 65,
  		cap: 1,
  		purchase: [
  			{
  				type: "tech",
  				id: "cpt_galliard_t",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 10000
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 3000
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1000
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 1000
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 30
  			}
  		],
  		order: 2,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "avatar_fate_u",
  		type: "army",
  		attack: 1250,
  		defense: 1000,
  		cap: 1,
  		purchase: [
  			{
  				type: "tech",
  				id: "avatar_fate",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 90000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 90000
  			}
  		],
  		deploy: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 9000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 9000
  			}
  		],
  		upkeep: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 25
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 25
  			}
  		],
  		order: 2,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "ancient_giant",
  		type: "enemy",
  		attack: 250,
  		defense: 16000,
  		cap: 1,
  		order: 3,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "archdemon",
  		type: "enemy",
  		attack: 90,
  		defense: 52,
  		order: 3,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "archlich",
  		type: "enemy",
  		attack: 120,
  		defense: 90,
  		cap: 1,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "aqrabuamelu",
  		type: "enemy",
  		attack: 46,
  		defense: 63,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "balor",
  		type: "enemy",
  		attack: 195,
  		defense: 150,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "bugbear",
  		type: "enemy",
  		attack: 7,
  		defense: 16,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "bugbear_chieftain",
  		type: "enemy",
  		attack: 44,
  		defense: 32,
  		cap: 1,
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "bulette",
  		type: "enemy",
  		attack: 140,
  		defense: 110,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "basilisk",
  		type: "enemy",
  		attack: 35,
  		defense: 16,
  		order: 1,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "black_mage",
  		type: "enemy",
  		attack: 52,
  		defense: 22,
  		cap: 1,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "cavarly_archer",
  		type: "enemy",
  		attack: 18,
  		defense: 10,
  		order: 3,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "charmed_dweller",
  		type: "enemy",
  		attack: 4,
  		defense: 4,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "cyclop",
  		type: "enemy",
  		attack: 25,
  		defense: 76,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "cult_master",
  		type: "enemy",
  		attack: 80,
  		defense: 55,
  		cap: 1,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "daimyo",
  		type: "enemy",
  		attack: 90,
  		defense: 90,
  		cap: 1,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "demoness",
  		type: "enemy",
  		attack: 50,
  		defense: 80,
  		cap: 1,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "demonic_musketeer",
  		type: "enemy",
  		attack: 20,
  		defense: 20,
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "dirty_rat",
  		type: "enemy",
  		attack: 1,
  		defense: 1,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "draconic_warrior",
  		type: "enemy",
  		attack: 8,
  		defense: 14,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "draconic_diver",
  		type: "enemy",
  		attack: 20,
  		defense: 10,
  		order: 2,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "draconic_mage",
  		type: "enemy",
  		attack: 32,
  		defense: 10,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "draconic_leader",
  		type: "enemy",
  		attack: 80,
  		defense: 65,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "eternal_guardian",
  		type: "enemy",
  		attack: 22,
  		defense: 84,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "ettin",
  		type: "enemy",
  		attack: 39,
  		defense: 67,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "fallen_angel",
  		type: "enemy",
  		attack: 150,
  		defense: 100,
  		cap: 1,
  		order: 3,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "frost_elemental",
  		type: "enemy",
  		attack: 20,
  		defense: 42,
  		order: 1,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "frost_giant",
  		type: "enemy",
  		attack: 112,
  		defense: 140,
  		cap: 1,
  		order: 2,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "fire_elemental",
  		type: "enemy",
  		attack: 28,
  		defense: 28,
  		order: 1,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "gargoyle",
  		type: "enemy",
  		attack: 8,
  		defense: 28,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "golem",
  		type: "enemy",
  		attack: 11,
  		defense: 42,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "gulud",
  		type: "enemy",
  		attack: 250,
  		defense: 180,
  		cap: 1,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "korrigan_slinger",
  		type: "enemy",
  		attack: 3,
  		defense: 2,
  		order: 2,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "korrigan_swindler",
  		type: "enemy",
  		attack: 3,
  		defense: 5,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "earth_elemental",
  		type: "enemy",
  		attack: 20,
  		defense: 48,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "harpy",
  		type: "enemy",
  		attack: 6,
  		defense: 6,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "hobgoblin_archer",
  		type: "enemy",
  		attack: 11,
  		defense: 4,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "hobgoblin_chieftain",
  		type: "enemy",
  		attack: 20,
  		defense: 34,
  		cap: 1,
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "hobgoblin_grunt",
  		type: "enemy",
  		attack: 6,
  		defense: 12,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "hydra",
  		type: "enemy",
  		attack: 950,
  		defense: 900,
  		cap: 1,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "gorgon",
  		type: "enemy",
  		attack: 950,
  		defense: 600,
  		cap: 1,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "lead_golem",
  		type: "enemy",
  		attack: 22,
  		defense: 72,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "bandit",
  		type: "enemy",
  		attack: 3,
  		defense: 4,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "barbarian_warrior",
  		type: "enemy",
  		attack: 13,
  		defense: 6,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "barbarian_chosen",
  		type: "enemy",
  		attack: 30,
  		defense: 12,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "barbarian_drummer",
  		type: "enemy",
  		attack: 6,
  		defense: 18,
  		order: 2,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "barbarian_leader",
  		type: "enemy",
  		attack: 48,
  		defense: 22,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "barbarian_king",
  		type: "enemy",
  		attack: 76,
  		defense: 56,
  		cap: 1,
  		order: 3,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "djinn",
  		type: "enemy",
  		attack: 46,
  		defense: 36,
  		cap: 1,
  		order: 2,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "fire_salamander",
  		type: "enemy",
  		attack: 32,
  		defense: 20,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "galliard",
  		type: "enemy",
  		attack: 70,
  		defense: 120,
  		cap: 1,
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "ghast",
  		type: "enemy",
  		attack: 6,
  		defense: 8,
  		order: 2,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "ghoul",
  		type: "enemy",
  		attack: 4,
  		defense: 5,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "giant_wasp",
  		type: "enemy",
  		attack: 8,
  		defense: 4,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "goblin_marauder",
  		type: "enemy",
  		attack: 3,
  		defense: 3,
  		order: 1,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "goblin_warrior",
  		type: "enemy",
  		attack: 3,
  		defense: 4,
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "goblin_wolfrider",
  		type: "enemy",
  		attack: 6,
  		defense: 7,
  		order: 2,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "goblin_overlord",
  		type: "enemy",
  		attack: 20,
  		defense: 15,
  		cap: 1,
  		order: 3,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "lich",
  		type: "enemy",
  		attack: 60,
  		defense: 50,
  		cap: 1,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "ball_lightning",
  		type: "enemy",
  		attack: 55,
  		defense: 20,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "lizard_warrior",
  		type: "enemy",
  		attack: 12,
  		defense: 12,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "lizard_archer",
  		type: "enemy",
  		attack: 13,
  		defense: 6,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "lizard_shaman",
  		type: "enemy",
  		attack: 22,
  		defense: 32,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "lizard_commander",
  		type: "enemy",
  		attack: 50,
  		defense: 75,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "katana_samurai",
  		type: "enemy",
  		attack: 26,
  		defense: 28,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "markanat",
  		type: "enemy",
  		attack: 900,
  		defense: 600,
  		cap: 1,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "myconid",
  		type: "enemy",
  		attack: 3,
  		defense: 10,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "musket_ashigaru",
  		type: "enemy",
  		attack: 22,
  		defense: 18,
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "hill_giant",
  		type: "enemy",
  		attack: 20,
  		defense: 36,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "minotaur",
  		type: "enemy",
  		attack: 1000,
  		defense: 1800,
  		cap: 1,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "mountain_giant",
  		type: "enemy",
  		attack: 34,
  		defense: 42,
  		order: 3,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "pillager",
  		type: "enemy",
  		attack: 3,
  		defense: 5,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "deserter",
  		type: "enemy",
  		attack: 7,
  		defense: 6,
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "snake",
  		type: "enemy",
  		attack: 4,
  		defense: 4,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "giant_snake",
  		type: "enemy",
  		attack: 16,
  		defense: 8,
  		order: 2,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "ravenous_crab",
  		type: "enemy",
  		attack: 2,
  		defense: 1,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "spider",
  		type: "enemy",
  		attack: 3,
  		defense: 2,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "sluagh",
  		type: "enemy",
  		attack: 26,
  		defense: 6,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "giant_spider",
  		type: "enemy",
  		attack: 10,
  		defense: 8,
  		order: 2,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "skeleton",
  		type: "enemy",
  		attack: 2,
  		defense: 2,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "skeletal_knight",
  		type: "enemy",
  		attack: 18,
  		defense: 22,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "skullface",
  		type: "enemy",
  		attack: 76,
  		defense: 60,
  		cap: 1,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "son_atamar",
  		type: "enemy",
  		attack: 22,
  		defense: 20,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "swamp_horror",
  		type: "enemy",
  		attack: 900,
  		defense: 1400,
  		cap: 1,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "spectra_memory",
  		type: "enemy",
  		attack: 5,
  		defense: 8,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "succubus",
  		type: "enemy",
  		attack: 37,
  		defense: 23,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "succubus_queen",
  		type: "enemy",
  		attack: 1500,
  		defense: 1750,
  		cap: 1,
  		order: 2,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "zombie",
  		type: "enemy",
  		attack: 3,
  		defense: 3,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "ghost",
  		type: "enemy",
  		attack: 5,
  		defense: 5,
  		order: 2,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "gnoll_leader",
  		type: "enemy",
  		attack: 23,
  		defense: 18,
  		cap: 1,
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "gnoll_raider",
  		type: "enemy",
  		attack: 6,
  		defense: 5,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "oni",
  		type: "enemy",
  		attack: 45,
  		defense: 99,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "orc_champion",
  		type: "enemy",
  		attack: 35,
  		defense: 130,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "orc_berserker",
  		type: "enemy",
  		attack: 55,
  		defense: 11,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "orc_flame_caster",
  		type: "enemy",
  		attack: 45,
  		defense: 12,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "orc_ironskin",
  		type: "enemy",
  		attack: 18,
  		defense: 169,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "orc_shaman",
  		type: "enemy",
  		attack: 33,
  		defense: 28,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "orc_stone_thrower",
  		type: "enemy",
  		attack: 31,
  		defense: 10,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "orc_warg_rider",
  		type: "enemy",
  		attack: 33,
  		defense: 70,
  		order: 2,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "orc_warlord",
  		type: "enemy",
  		attack: 70,
  		defense: 150,
  		order: 2,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "orc_warrior",
  		type: "enemy",
  		attack: 25,
  		defense: 63,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "orc_worker",
  		type: "enemy",
  		attack: 17,
  		defense: 48,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "necromancer",
  		type: "enemy",
  		attack: 28,
  		defense: 15,
  		cap: 1,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "imp",
  		type: "enemy",
  		attack: 3,
  		defense: 1,
  		order: 2,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "lesser_demon",
  		type: "enemy",
  		attack: 8,
  		defense: 8,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "greater_demon",
  		type: "enemy",
  		attack: 16,
  		defense: 16,
  		order: 3,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "griffin",
  		type: "enemy",
  		attack: 42,
  		defense: 58,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "kobold",
  		type: "enemy",
  		attack: 3,
  		defense: 2,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "kobold_champion",
  		type: "enemy",
  		attack: 5,
  		defense: 12,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "kobold_king",
  		type: "enemy",
  		attack: 42,
  		defense: 48,
  		cap: 1,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "naga",
  		type: "enemy",
  		attack: 12,
  		defense: 12,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "nikharul",
  		type: "enemy",
  		attack: 780,
  		defense: 1020,
  		cap: 1,
  		order: 3,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "red_dragon",
  		type: "enemy",
  		attack: 280,
  		defense: 180,
  		cap: 1,
  		order: 3,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "titan",
  		type: "enemy",
  		attack: 1,
  		defense: 52000,
  		cap: 1,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "troll_cave",
  		type: "enemy",
  		attack: 16,
  		defense: 28,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "troll_battle",
  		type: "enemy",
  		attack: 42,
  		defense: 56,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "tyrannosaurus",
  		type: "enemy",
  		attack: 1750,
  		defense: 1200,
  		cap: 1,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "vampire",
  		type: "enemy",
  		attack: 80,
  		defense: 90,
  		cap: 1,
  		order: 3,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "vampire_bat",
  		type: "enemy",
  		attack: 2,
  		defense: 1,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "vampire_servant",
  		type: "enemy",
  		attack: 15,
  		defense: 32,
  		order: 1,
  		cat: 3,
  		category: "TANK"
  	},
  	{
  		id: "velociraptors",
  		type: "enemy",
  		attack: 37,
  		defense: 22,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "werewolf",
  		type: "enemy",
  		attack: 1150,
  		defense: 600,
  		cap: 1,
  		order: 1,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "wendigo",
  		type: "enemy",
  		attack: 47,
  		defense: 39,
  		order: 1,
  		cat: 2,
  		category: "SHOCK"
  	},
  	{
  		id: "wind_elemental",
  		type: "enemy",
  		attack: 22,
  		defense: 42,
  		order: 1,
  		cat: 1,
  		category: "RANGED"
  	},
  	{
  		id: "warg",
  		type: "enemy",
  		attack: 22,
  		defense: 18,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "wolf",
  		type: "enemy",
  		attack: 4,
  		defense: 4,
  		order: 1,
  		cat: 4,
  		category: "RIDER"
  	},
  	{
  		id: "wyvern",
  		type: "enemy",
  		attack: 32,
  		defense: 28,
  		order: 2,
  		cat: 4,
  		category: "RIDER"
  	}
  ];

  const translate = (id, prefix = '') => {
    const knownPrefixes = ['ancestor_', 'bui_', 'cat_', 'dip_', 'ene_', 'fai_', 'leg_', 'not_', 'pop_', 'res_', 'tec_', 'uni_'];
    let translated = i18n.en[prefix + id] ? i18n.en[prefix + id] : '';
    if (!translated) {
      prefix = knownPrefixes.find(knownPrefix => i18n.en[knownPrefix + id]);
      if (prefix) {
        translated = i18n.en[prefix + id];
      }
    }
    return translated;
  };

  const formatTime = timeToFormat => {
    const timeValues = {
      seconds: 0,
      minutes: 0,
      hours: 0,
      days: 0
    };
    let timeShort = '';
    let timeLong = '';
    timeValues.seconds = timeToFormat % 60;
    timeToFormat = (timeToFormat - timeToFormat % 60) / 60;
    timeValues.minutes = timeToFormat % 60;
    timeToFormat = (timeToFormat - timeToFormat % 60) / 60;
    timeValues.hours = timeToFormat % 24;
    timeToFormat = (timeToFormat - timeToFormat % 24) / 24;
    timeValues.days = timeToFormat;
    if (timeValues.days) {
      timeShort += `${timeValues.days}d `;
      timeLong += `${timeValues.days} days `;
    }
    if (timeValues.hours) {
      timeShort += `${timeValues.hours}h `;
      timeLong += `${timeValues.hours} hrs `;
    }
    if (timeValues.minutes) {
      timeShort += `${timeValues.minutes}m `;
      timeLong += `${timeValues.minutes} min `;
    }
    if (timeValues.seconds) {
      timeShort += `${timeValues.seconds}s `;
      timeLong += `${timeValues.seconds} sec `;
    }
    timeShort = timeShort.trim();
    timeLong = timeLong.trim();
    return {
      timeShort,
      timeLong,
      timeValues
    };
  };

  const logger = ({
    msgLevel,
    msg
  }) => {
    const logText = `[TA][${new Date().toLocaleTimeString()}] ${msg}`;
    const levelsToLog = ['log', 'warn', 'error'];
    if (levelsToLog.includes(msgLevel)) {
      const logHolder = document.querySelector('#root > div > div > div > div.w-full.order-2.flex-grow.overflow-x-hidden.overflow-y-auto.pr-4');
      if (logHolder) {
        const taLogs = [...logHolder.querySelectorAll('.ta-log')];
        if (taLogs.length > 10) {
          for (let i = 10; i < taLogs.length; i++) {
            taLogs[i].remove();
          }
        }
        const p = document.createElement('p');
        p.classList.add('text-xs', 'mb-2', 'text-green-600', 'ta-log');
        p.innerText = logText;
        logHolder.insertAdjacentElement('afterbegin', p);
      }
    }
    console[msgLevel](logText);
  };

  const prefix = 'TA_';
  const get$1 = key => {
    const data = window.localStorage.getItem(`${prefix}${key}`);
    if (data) {
      return JSON.parse(data);
    }
  };
  const set = (key, value) => {
    window.localStorage.setItem(`${prefix}${key}`, JSON.stringify(value));
  };
  const remove = key => {
    window.localStorage.removeItem(`${prefix}${key}`);
  };
  var localStorage = {
    get: get$1,
    set,
    remove
  };

  let reactVarCache;
  function getReactData(el, level = 0) {
    let data;
    if (reactVarCache && el[reactVarCache]) {
      data = el[reactVarCache];
    } else {
      const key = Object.keys(el).find(k => k.startsWith('__reactFiber$'));
      if (key) {
        reactVarCache = key;
        data = el[reactVarCache];
      }
    }
    for (let i = 0; i < level && data; i++) {
      data = data.return;
    }
    return data;
  }
  function getNearestKey(el, limit = -1) {
    let key = undefined;
    let data = getReactData(el);
    let level = 0;
    while (!key && data && (limit < 0 || level <= limit)) {
      key = data.key;
      data = data.return;
      level++;
    }
    return key;
  }
  function getBtnIndex(el, level = 0) {
    let data = getReactData(el, level);
    if (data) {
      return data.index;
    } else {
      return undefined;
    }
  }
  let gameDataCache;
  function getGameData() {
    if (gameDataCache) {
      return gameDataCache;
    }
    const root = document.querySelector('#root');
    const key = Object.keys(root).find(k => k.startsWith('__reactContainer$'));
    if (key) {
      const container = root[key];
      gameDataCache = container.stateNode.current.child.memoizedProps.MainStore;
      return gameDataCache;
    } else {
      return undefined;
    }
  }
  var reactUtil = {
    getReactData,
    getNearestKey,
    getBtnIndex,
    getGameData
  };

  const getPagesSelector = () => {
    return [...document.querySelectorAll('#main-tabs > div > button')];
  };
  const getCurrentPageSelector = () => {
    return document.querySelector('#main-tabs > div > button[aria-selected="true"]');
  };
  const getSubPagesSelector = () => {
    const tabLists = [...document.querySelectorAll('div[role="tablist"]')];
    if (tabLists && tabLists.length >= 2) {
      return [...tabLists[1].querySelectorAll('button')];
    }
    return [];
  };
  const getCurrentSubPageSelector = () => {
    let currentSubPage;
    const subPages = getSubPagesSelector();
    if (subPages.length) {
      currentSubPage = subPages.find(subPage => subPage.getAttribute('aria-selected') === 'true');
    }
    return currentSubPage;
  };
  const hasPage = page => {
    const navButtons = getPagesSelector();
    const pageIndex = CONSTANTS.PAGES_INDEX[page];
    return !!navButtons.find(button => reactUtil.getBtnIndex(button, 1) === pageIndex);
  };
  const checkPage = (page, subPage) => {
    const currentPage = getCurrentPageSelector();
    const currentSubPage = getCurrentSubPageSelector();
    const pageIndex = CONSTANTS.PAGES_INDEX[page];
    const subPageIndex = CONSTANTS.SUBPAGES_INDEX[subPage];
    const isCorrectPage = !page || page && currentPage && reactUtil.getBtnIndex(currentPage, 1) === pageIndex;
    const isCorrectSubPage = !subPage || subPage && currentSubPage && reactUtil.getBtnIndex(currentSubPage, 1) === subPageIndex;
    return isCorrectPage && isCorrectSubPage;
  };
  const hasSubPage = subPage => {
    const subTabs = getSubPagesSelector();
    const subPageIndex = CONSTANTS.SUBPAGES_INDEX[subPage];
    return !!subTabs.find(button => reactUtil.getBtnIndex(button, 1) === subPageIndex);
  };
  const switchPage = async page => {
    let foundPage = hasPage(page);
    if (!foundPage) {
      await switchPage(CONSTANTS.PAGES.BUILD);
      return;
    }
    let switchedPage = false;
    const navButtons = getPagesSelector();
    const pageIndex = CONSTANTS.PAGES_INDEX[page];
    const pageButton = navButtons.find(button => reactUtil.getBtnIndex(button, 1) === pageIndex && button.getAttribute('aria-selected') !== 'true');
    if (pageButton) {
      pageButton.click();
      switchedPage = true;
    }
    if (switchedPage) {
      logger({
        msgLevel: 'debug',
        msg: `Switched page to ${page}`
      });
      await sleep(1000);
    }
  };
  const switchSubPage = async (subPage, page) => {
    if (page) {
      await switchPage(page);
    }
    let foundSubPage = hasSubPage(subPage);
    if (foundSubPage) {
      let switchedSubPage = false;
      const navButtons = getSubPagesSelector();
      const subPageIndex = CONSTANTS.SUBPAGES_INDEX[subPage];
      const subPageButton = navButtons.find(button => reactUtil.getBtnIndex(button, 1) === subPageIndex && button.getAttribute('aria-selected') !== 'true');
      if (subPageButton) {
        subPageButton.click();
        switchedSubPage = true;
      }
      if (switchedSubPage) {
        logger({
          msgLevel: 'debug',
          msg: `Switched subPage to ${subPage}`
        });
        await sleep(500);
      }
    }
  };
  var navigation = {
    getPagesSelector,
    hasPage,
    switchPage,
    checkPage,
    switchSubPage
  };

  const getActivePageContent = () => {
    return document.querySelector('#maintabs-container > div > div[role=tabpanel]');
  };
  const getAllButtons$5 = (activeOnly = true, extraSelectors = '') => {
    const activeOnlySelector = activeOnly ? ':not(.btn-off):not(.btn-off-cap)' : '';
    return [...getActivePageContent().querySelectorAll(`button.btn${activeOnlySelector}${extraSelectors}`)];
  };
  var selectors = {
    getActivePageContent,
    getAllButtons: getAllButtons$5
  };

  let keyGen = {
    manual: _gen('manual_'),
    armyArmy: _gen('army_create_'),
    armyAttack: _gen('army_combat_'),
    market: _gen('stock_'),
    resource: _gen('resource_'),
    research: _gen('tec_'),
    building: _gen('bui_'),
    population: _gen('population_'),
    magic: _gen('fai_'),
    enemy: _gen('enemy-'),
    diplomacy: _gen('dip_card_'),
    tooltipReq: _gen('tooltip_req_'),
    legacy: _gen('leg_'),
    ancestor: _gen('ancestor_')
  };
  function _gen(prefix) {
    return {
      key(id) {
        return prefix + id;
      },
      id(key) {
        return key.replace(new RegExp('^' + prefix), '');
      },
      check(key) {
        return key && !!key.match(new RegExp('^' + prefix + '.+'));
      }
    };
  }

  const get = (resourceName = 'gold') => {
    let resourceFound = false;
    let resourceToFind = {
      name: resourceName,
      current: 0,
      max: 0,
      speed: 0,
      ttf: null,
      ttz: null
    };
    const resources = [...document.querySelectorAll('#root div > div > div > table > tbody > tr > td:nth-child(1) > span')];
    resources.map(resource => {
      const key = reactUtil.getNearestKey(resource, 6);
      if (key === keyGen.resource.key(resourceName)) {
        resourceFound = true;
        const values = resource.parentNode.parentNode.childNodes[1].textContent.split('/').map(x => numberParser.parse(x.replace(/[^0-9KM\-,\.]/g, '').trim()));
        resourceToFind.current = values[0];
        resourceToFind.max = values[1];
        resourceToFind.speed = numberParser.parse(resource.parentNode.parentNode.childNodes[2].textContent.replace(/[^0-9KM\-,\.]/g, '').trim()) || 0;
        resourceToFind.ttf = resourceToFind.speed > 0 && resourceToFind.max !== resourceToFind.current ? formatTime(Math.ceil((resourceToFind.max - resourceToFind.current) / resourceToFind.speed)) : null;
        resourceToFind.ttz = resourceToFind.speed < 0 && resourceToFind.current ? formatTime(Math.ceil(resourceToFind.current / (resourceToFind.speed * -1))) : null;
      }
    });
    return resourceFound ? resourceToFind : null;
  };
  var resources = {
    get
  };

  const getDefaultOptions = () => {
    const options = {
      pages: {},
      ancestor: {
        enabled: false,
        selected: ''
      },
      prestige: {
        enabled: false,
        selected: '',
        options: {}
      },
      ngplus: {
        enabled: false,
        value: 0
      },
      cosmetics: {
        hideFullPageOverlay: {
          enabled: false
        },
        toasts: {
          enabled: false
        }
      },
      lastMigration: 2
    };
    Object.keys(CONSTANTS.PAGES).every(key => {
      options.pages[CONSTANTS.PAGES[key]] = {
        enabled: false,
        page: CONSTANTS.PAGES[key],
        subpages: {},
        options: {}
      };
      return options.pages[CONSTANTS.PAGES[key]];
    });
    Object.keys(CONSTANTS.SUBPAGES).every(key => {
      const parent = CONSTANTS.PAGES[CONSTANTS.SUBPAGE_MAPPING[key]];
      options.pages[parent].subpages[CONSTANTS.SUBPAGES[key]] = {
        enabled: false,
        subpage: CONSTANTS.SUBPAGES[key],
        options: {}
      };
      return options.pages[parent].subpages[CONSTANTS.SUBPAGES[key]];
    });
    return options;
  };
  const state = {
    scriptPaused: true,
    haveManualResourceButtons: true,
    stopAutoClicking: false,
    lastVisited: {},
    buildings: [],
    options: getDefaultOptions()
  };
  if (typeof localStorage.get('scriptPaused') !== 'undefined') {
    state.scriptPaused = localStorage.get('scriptPaused');
  }
  if (typeof localStorage.get('options') !== 'undefined') {
    state.options = {
      ...state.options,
      ...localStorage.get('options')
    };
  }
  if (typeof localStorage.get('lastVisited') !== 'undefined') {
    state.lastVisited = {
      ...state.lastVisited,
      ...localStorage.get('lastVisited')
    };
  }

  const migrations = [() => {
    if (typeof state.options.pages[CONSTANTS.PAGES.BUILD] !== 'object') {
      const newOptions = getDefaultOptions();
      Object.keys(CONSTANTS.PAGES).every(key => {
        newOptions.pages[CONSTANTS.PAGES[key]] = {
          enabled: false,
          page: CONSTANTS.PAGES[key],
          subpages: {},
          options: {}
        };
        return newOptions.pages[CONSTANTS.PAGES[key]];
      });
      Object.keys(CONSTANTS.SUBPAGES).every(key => {
        const parent = CONSTANTS.PAGES[CONSTANTS.SUBPAGE_MAPPING[key]];
        newOptions.pages[parent].subpages[CONSTANTS.SUBPAGES[key]] = {
          enabled: false,
          subpage: CONSTANTS.SUBPAGES[key],
          options: {}
        };
        return newOptions.pages[parent].subpages[CONSTANTS.SUBPAGES[key]];
      });
      Object.keys(state.options.pages).forEach(key => {
        newOptions.pages[key].enabled = state.options.pages[key] || false;
        if (key === CONSTANTS.PAGES.RESEARCH) {
          Object.keys(state.options[key]).forEach(key => {
            if (key.includes('tech_')) {
              delete state.options[key];
            }
          });
          newOptions.pages[key].subpages[CONSTANTS.SUBPAGES.RESEARCH].enabled = newOptions.pages[key].enabled;
          newOptions.pages[key].subpages[CONSTANTS.SUBPAGES.RESEARCH].options = state.options[key];
        } else if (key === CONSTANTS.PAGES.BUILD) {
          newOptions.pages[key].subpages[CONSTANTS.SUBPAGES.CITY].enabled = newOptions.pages[key].enabled;
          newOptions.pages[key].subpages[CONSTANTS.SUBPAGES.COLONY].enabled = newOptions.pages[key].enabled;
          Object.keys(state.options[key]).forEach(id => {
            const building = buildings.find(building => building.id === id);
            if (building) {
              const subPage = building.tab === 1 ? CONSTANTS.SUBPAGES.CITY : CONSTANTS.SUBPAGES.COLONY;
              newOptions.pages[key].subpages[subPage].options[id] = state.options[key][id];
              newOptions.pages[key].subpages[subPage].options[`prio_${id}`] = state.options[key][`prio_${id}`];
            }
          });
          newOptions.pages[key].options.prioWonders = state.options.automation.prioWonders;
        } else {
          newOptions.pages[key].options = state.options[key];
          if (key === CONSTANTS.PAGES.POPULATION) {
            newOptions.pages[key].options.minimumFood = state.options.automation.minimumFood;
            newOptions.pages[key].options.populationRebalanceTime = state.options.automation.populationRebalanceTime;
          }
        }
      });
      const selectedAncestor = Object.keys(state.options.automation).find(key => key.includes('selected_ancestor_') && state.options.automation[key]);
      newOptions.ancestor.enabled = state.options.automation.ancestor;
      newOptions.ancestor.selected = selectedAncestor ? selectedAncestor.replace('selected_', '') : '';
      newOptions.prestige.enabled = state.options.automation.prestige;
      state.options = newOptions;
      localStorage.set('options', state.options);
    }
  }, () => {
    state.lastVisited = {};
    localStorage.set('lastVisited', state.lastVisited);
  }];
  const runMigrations = () => {
    const lastMigration = state.options.lastMigration || 0;
    let migrationsRan = false;
    for (let i = lastMigration; i < migrations.length; i++) {
      migrations[i]();
      migrationsRan = true;
    }
    state.options.lastMigration = migrations.length;
    localStorage.set('options', state.options);
    if (migrationsRan) {
      window.location.reload();
    }
  };

  const fights$2 = factions.concat(locations).map(fight => {
    return {
      key: fight.id,
      id: translate(fight.id),
      army: fight.army
    };
  });
  const applyUnitMods = unit => {
    const unitCopy = {
      ...unit
    };
    let run = reactUtil.getGameData().run;
    if (unitCopy && run && run.modifiers) {
      let bonusAttack = 0;
      let bonusDefense = 0;
      const unitMods = run.modifiers.find(mod => mod.id === unitCopy.id);
      if (unitMods && unitMods.mods) {
        for (let i = 0; i < unitMods.mods.length; i++) {
          const mod = unitMods.mods[i];
          if (mod.type === 'stat') {
            if (!mod.perc) {
              if (mod.id === 'attack') {
                bonusAttack += mod.value;
              }
              if (mod.id === 'defense') {
                bonusDefense += mod.value;
              }
            }
          }
        }
      }
      unitCopy.attack += bonusAttack;
      unitCopy.defense += bonusDefense;
    }
    return unitCopy;
  };
  const getRandomNumber = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  };
  const getEnemyArmy = enemyId => {
    const difficultyMode = parseInt(reactUtil.getGameData().SettingsStore.difficultyMode, 10) || 0;
    const difficultyModeMultiplier = difficultyMode === 1 ? 1.5 : difficultyMode === 2 ? 2 : difficultyMode === 3 ? 4.5 : 1;
    const randomBonus = difficultyMode === 1 ? 1.1 : difficultyMode === 2 ? 1.2 : difficultyMode === 3 ? 1.3 : 1;
    const army = fights$2.find(fight => fight.key === enemyId || fight.id === enemyId).army.map(unit => {
      const unitDetails = units.find(enemy => enemy.id === unit.id);
      return {
        ...unit,
        ...unitDetails,
        value: Math.round(unit.value * difficultyModeMultiplier * randomBonus)
      };
    });
    return army;
  };
  const getUserArmy = (isDefending = false, onlyAvailable = false) => {
    const userArmy = [];
    let run = reactUtil.getGameData().run;
    if (run && run.army) {
      for (let i = 0; i < run.army.length; i++) {
        const unit = run.army[i];
        const unitsValue = onlyAvailable ? unit.value - unit.away : unit.value;
        if (unitsValue) {
          const unitDetails = units.find(unitDetails => unitDetails.id === unit.id);
          if (unitDetails) {
            if (unitDetails.category === 0) {
              if (!isDefending || unit.id !== 'settlement_defenses') {
                continue;
              }
            }
            userArmy.push({
              ...applyUnitMods(unitDetails),
              key: unitDetails.id,
              value: unitsValue
            });
          }
        }
      }
    }
    return userArmy;
  };
  const generateArmy = (army = [], attacker = false, isDefending = false) => {
    army = army.filter(unit => isDefending ? true : unit.category);
    const units = [];
    army.forEach(squad => {
      for (let i = 0; i < squad.value; i++) {
        units.push({
          ...squad,
          sortOrder: Number(attacker ? squad.category.toString() + (1000 + getRandomNumber(0, 900)).toString() : squad.order.toString() + (1e3 + getRandomNumber(0, 900)).toString())
        });
      }
    });
    return units.sort((a, b) => a.sortOrder - b.sortOrder);
  };
  const canWinBattle = (enemyId, isDefending = false, onlyAvailable = false) => {
    const forces = {
      player: {
        attack: generateArmy(getUserArmy(isDefending, onlyAvailable), true, isDefending),
        defense: generateArmy(getUserArmy(isDefending, onlyAvailable), false, isDefending)
      },
      enemy: {
        attack: generateArmy(getEnemyArmy(enemyId), true),
        defense: generateArmy(getEnemyArmy(enemyId), false)
      }
    };
    let result = 0;
    while (!result) {
      const deadUnits = {
        player: [],
        enemy: []
      };
      let enemyUnitIdx = 0;
      let playerUnitIdx = 0;
      forces.player.attack.forEach(attUnit => {
        if (typeof forces.enemy.defense[enemyUnitIdx] !== 'undefined') {
          let unitAttack = attUnit.attack;
          let effectiveType = attUnit.cat === 0 ? 0 : attUnit.cat === 4 ? 1 : attUnit.cat + 1;
          if (effectiveType === forces.enemy.defense[enemyUnitIdx].cat) {
            unitAttack *= 2;
          }
          if (unitAttack >= forces.enemy.defense[enemyUnitIdx].defense) {
            deadUnits.enemy.push(forces.enemy.defense[enemyUnitIdx].id);
            enemyUnitIdx += 1;
          } else {
            forces.enemy.defense[enemyUnitIdx].defense -= unitAttack;
          }
        }
      });
      forces.enemy.attack.forEach(attUnit => {
        if (typeof forces.player.defense[playerUnitIdx] !== 'undefined') {
          let unitAttack = attUnit.attack;
          let effectiveType = attUnit.cat === 0 ? 0 : attUnit.cat === 4 ? 1 : attUnit.cat + 1;
          if (effectiveType === forces.player.defense[playerUnitIdx].cat) {
            unitAttack *= 2;
          }
          if (unitAttack >= forces.player.defense[playerUnitIdx].defense) {
            deadUnits.player.push(forces.player.defense[playerUnitIdx].id);
            playerUnitIdx += 1;
          } else {
            forces.player.defense[playerUnitIdx].defense -= unitAttack;
          }
        }
      });
      if (deadUnits.enemy.length) {
        deadUnits.enemy.forEach(deadUnitId => {
          const attackIndex = forces.enemy.attack.findIndex(unit => unit.id === deadUnitId);
          const defenseIndex = forces.enemy.defense.findIndex(unit => unit.id === deadUnitId);
          if (attackIndex > -1) {
            forces.enemy.attack.splice(attackIndex, 1);
          }
          if (defenseIndex > -1) {
            forces.enemy.defense.splice(defenseIndex, 1);
          }
        });
      }
      if (deadUnits.player.length) {
        deadUnits.player.forEach(deadUnitId => {
          const attackIndex = forces.player.attack.findIndex(unit => unit.id === deadUnitId);
          const defenseIndex = forces.player.defense.findIndex(unit => unit.id === deadUnitId);
          if (attackIndex > -1) {
            forces.player.attack.splice(attackIndex, 1);
          }
          if (defenseIndex > -1) {
            forces.player.defense.splice(defenseIndex, 1);
          }
        });
      }
      if (!forces.enemy.attack.length || !forces.player.attack.length) {
        result = forces.player.attack.length ? 1 : 2;
      }
    }
    return result === 1 ? true : false;
  };
  var armyCalculator = {
    canWinBattle
  };

  const ids = {
    resources: ['research', 'food', 'wood', 'stone', 'gold', 'tools', 'copper', 'iron', 'cow', 'horse', 'luck', 'mana', 'building_material', 'faith', 'supplies', 'crystal', 'steel', 'saltpetre', 'natronite'],
    prestige: ['legacy'],
    special: ['relic', 'coin', 'tome_wisdom', 'gem', 'titan_gift']
  };
  const setMaxResources = (type, amount = 1000000000) => {
    const resources = reactUtil.getGameData().run.resources;
    for (let i = 0; i < resources.length; i++) {
      if (ids[type].includes(resources[i].id)) {
        resources[i].value = amount + (resources[i].value ?? 0);
      }
    }
  };
  const cheats = {
    maxResources: () => {
      setMaxResources('resources');
    },
    maxLegacyPoints: (amount = 1) => {
      setMaxResources('prestige', amount);
    },
    maxPrestigeCurrencies: (amount = 1) => {
      setMaxResources('special', amount);
    }
  };

  const getUnitsList = () => {
    const unitsObject = state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.ARMY].options;
    if (Object.keys(unitsObject).length) {
      let unitsList = Object.keys(unitsObject).filter(key => !key.includes('prio_')).filter(key => !!unitsObject[key]).filter(key => !!unitsObject[`prio_${key}`]).map(key => {
        const unit = {
          key: key,
          id: translate(key, 'uni_'),
          max: unitsObject[key] === -1 ? 99999 : unitsObject[key],
          prio: unitsObject[`prio_${key}`]
        };
        return unit;
      }).sort((a, b) => {
        return b.prio - a.prio;
      });
      return unitsList;
    }
    return [];
  };
  const userEnabled$a = () => {
    return (state.options.pages[CONSTANTS.PAGES.ARMY].enabled || false) && (state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.ARMY].enabled || false);
  };
  const getArmyNumbers = () => {
    return [reactUtil.getGameData().ArmyStore.ownedCount, reactUtil.getGameData().ArmyStore.cap];
  };
  const getControls = () => {
    const armyNumbers = getArmyNumbers();
    const allButtons = selectors.getAllButtons(true);
    const unitsOptionsList = getUnitsList();
    const controls = {
      units: [],
      counts: {}
    };
    allButtons.forEach(button => {
      const btnKey = reactUtil.getNearestKey(button, 7);
      if (!btnKey) {
        const buttonText = button.innerText.trim();
        if (buttonText === '+1') {
          controls.counts['1'] = button;
        } else if (buttonText === '+10') {
          controls.counts['10'] = button;
        } else if (buttonText === '+50') {
          controls.counts['50'] = button;
        }
      } else if (btnKey) {
        const btnData = reactUtil.getReactData(button, 3);
        const unit = units.find(unit => keyGen.armyArmy.key(unit.id) === btnKey);
        if (unit && btnData.memoizedProps.content instanceof Object) {
          const armyData = reactUtil.getGameData().run.army[reactUtil.getGameData().idxs.army[unit.id]];
          let count = 0;
          if (armyData) {
            count = armyData.value;
          }
          unit.count = count;
          unit.button = button;
          unit.key = unit.id;
          const unitOptions = unitsOptionsList.find(unitOption => unitOption.key === unit.key);
          if (unitOptions) {
            const unitToAdd = {
              ...unit,
              ...unitOptions
            };
            if (unitToAdd.cap) {
              unitToAdd.max = Math.min(unitToAdd.cap, unitToAdd.max);
            }
            unitToAdd.max = Math.min(armyNumbers[1] - armyNumbers[0] + unitToAdd.count, unitToAdd.max);
            if (unitToAdd.max > unitToAdd.count) {
              controls.units.push(unitToAdd);
            }
          }
        }
      }
    });
    controls.units.sort((a, b) => b.prio - a.prio);
    return controls;
  };
  const isFull = () => {
    const armyNumbers = getArmyNumbers();
    return armyNumbers[0] >= armyNumbers[1];
  };
  const executeAction$a = async () => {
    if (!navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.ARMY)) return;
    if (state.scriptPaused) return;
    if (isFull()) return;
    let controls = getControls();
    if (controls.units.length) {
      while (!state.scriptPaused && controls.units.length) {
        let refreshUnits = false;
        const highestPrio = controls.units[0].prio;
        const highestPrioUnits = controls.units.filter(unit => unit.prio === highestPrio);
        controls.units = controls.units.filter(unit => unit.prio < highestPrio);
        const totalCost = {};
        let maxBulkHire = 50;
        while (!state.scriptPaused && highestPrioUnits.length && !isFull()) {
          for (let i = 0; i < highestPrioUnits.length && !state.scriptPaused && !isFull(); i++) {
            const unit = highestPrioUnits[i];
            if (unit.gen) {
              for (let i = 0; i < unit.gen.length; i++) {
                const gen = unit.gen[i];
                if (gen.type === 'resource') {
                  totalCost[gen.id] = totalCost[gen.id] ? totalCost[gen.id] : 0;
                  totalCost[gen.id] += gen.value;
                }
              }
            }
            if (unit.max - unit.count < 10) {
              maxBulkHire = 1;
            } else if (unit.max - unit.count < 50) {
              maxBulkHire = Math.min(maxBulkHire, 10);
            }
          }
          if (maxBulkHire > 1) {
            const usedResources = Object.keys(totalCost);
            for (let i = 0; i < usedResources.length && maxBulkHire > 1; i++) {
              const resId = usedResources[i];
              const resource = resources.get(resId);
              if (resource && totalCost[resId] < 0) {
                if (resource.speed + 10 * totalCost[resId] < 0) {
                  maxBulkHire = Math.min(1, maxBulkHire);
                } else if (resource.speed + 50 * totalCost[resId] < 0) {
                  maxBulkHire = Math.min(10, maxBulkHire);
                }
              }
            }
          }
          controls.counts[maxBulkHire].click();
          await sleep(25);
          let shouldHire = true;
          const unit = highestPrioUnits.shift();
          shouldHire = !unit.gen.filter(gen => gen.type === 'resource').find(gen => !resources.get(gen.id) || resources.get(gen.id).speed + maxBulkHire * gen.value <= 0);
          if (shouldHire) {
            unit.button.click();
            logger({
              msgLevel: 'log',
              msg: `Hiring ${maxBulkHire} ${unit.id}(s) (current: ${unit.count}, target: ${unit.max})`
            });
            refreshUnits = true;
            await sleep(25);
            if (!navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.ARMY)) return;
          }
        }
        await sleep(1400);
        if (refreshUnits) {
          controls = getControls();
        }
      }
    }
  };
  var ArmyArmy = {
    page: CONSTANTS.PAGES.ARMY,
    subpage: CONSTANTS.SUBPAGES.ARMY,
    enabled: () => userEnabled$a() && navigation.hasPage(CONSTANTS.PAGES.ARMY),
    action: async () => {
      await navigation.switchSubPage(CONSTANTS.SUBPAGES.ARMY, CONSTANTS.PAGES.ARMY);
      if (navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.ARMY)) await executeAction$a();
    }
  };

  const userEnabled$9 = () => {
    return (state.options.pages[CONSTANTS.PAGES.ARMY].enabled || false) && (state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].enabled || false);
  };
  const getSendToExplore = (container, activeOnly = true) => {
    const activeOnlySelector = activeOnly ? ':not(.btn-off):not(.btn-off-cap)' : '';
    return container.querySelector(`button.btn-blue${activeOnlySelector}`);
  };
  const executeAction$9 = async () => {
    if (!navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.EXPLORE)) return;
    if (state.scriptPaused) return;
    const limits = {
      scout: {
        min: state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.scoutsMin ?? 0,
        max: state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.scoutsMax ?? 0
      },
      explorer: {
        min: state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.explorersMin ?? 0,
        max: state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.explorersMax ?? 0
      },
      familiar: {
        min: state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.familiarsMin ?? 0,
        max: state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.familiarsMax ?? 0
      }
    };
    const container = document.querySelector('div.tab-container.sub-container');
    if (container) {
      let canExplore = false;
      const boxes = [...container.querySelectorAll('div.grid > div.flex')];
      boxes.shift();
      let unitsSent = [];
      for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        const unitKey = reactUtil.getNearestKey(box, 2);
        const removeUnitButton = box.querySelector('div.inline-flex button.btn-red.rounded-none');
        const addUnitButton = box.querySelector('div.inline-flex button.btn-green.rounded-none');
        const unit = units.find(unit => keyGen.armyAttack.key(unit.id) === unitKey);
        let count = box.querySelector('input[type="text"]').value.split(' / ').map(x => +x);
        if (!limits[unit.id]) {
          continue;
        }
        const limitMin = limits[unit.id].min;
        const limitMax = limits[unit.id].max;
        if (count[1] < limitMin) {
          continue;
        }
        for (let i = 0; i < count[0] - limitMax && removeUnitButton && !removeUnitButton.disabled; i++) {
          removeUnitButton.click();
          await sleep(25);
        }
        count = box.querySelector('input[type="text"]').value.split(' / ').map(x => +x);
        for (let i = 0; i < limitMax - count[0] && addUnitButton && !addUnitButton.disabled && !!getSendToExplore(container, false); i++) {
          addUnitButton.click();
          await sleep(25);
        }
        if (!getSendToExplore(container)) {
          const removeUnitButton = box.querySelector('div.inline-flex button.btn-red.rounded-none');
          if (removeUnitButton && !removeUnitButton.disabled) {
            removeUnitButton.click();
            await sleep(25);
          }
        }
        count = box.querySelector('input[type="text"]').value.split(' / ').map(x => +x);
        if (count[0] >= limitMin) {
          canExplore = true;
          unitsSent.push(`${count[0]} ${translate(unit.id, 'uni_')}(s)`);
        } else {
          const removeUnitButton = box.querySelector('div.inline-flex button.btn-red.rounded-none');
          while (removeUnitButton && !removeUnitButton.disabled) {
            removeUnitButton.click();
            await sleep(25);
          }
        }
      }
      const sendToExplore = getSendToExplore(container);
      if (!state.scriptPaused && sendToExplore && canExplore) {
        logger({
          msgLevel: 'log',
          msg: `Starting exploration: ${unitsSent.join(', ')}`
        });
        sendToExplore.click();
        await sleep(25);
      }
    }
  };
  const getMinWaitTime$1 = () => {
    let waitTime = 60000;
    if (reactUtil.getGameData().StatsStore && reactUtil.getGameData().StatsStore.ngResetNumber) {
      const ngResets = reactUtil.getGameData().StatsStore.ngResetNumber;
      for (let i = 0; i < ngResets; i++) {
        waitTime = waitTime / 2;
      }
    }
    waitTime = Math.ceil(Math.max(waitTime, 3000) / 2) + 1000;
    return waitTime;
  };
  var ArmyExplore = {
    page: CONSTANTS.PAGES.ARMY,
    subpage: CONSTANTS.SUBPAGES.EXPLORE,
    enabled: () => userEnabled$9() && navigation.hasPage(CONSTANTS.PAGES.ARMY) && new Date().getTime() - (state.lastVisited[`${CONSTANTS.PAGES.ARMY}${CONSTANTS.SUBPAGES.EXPLORE}`] || 0) > getMinWaitTime$1(),
    action: async () => {
      await navigation.switchSubPage(CONSTANTS.SUBPAGES.EXPLORE, CONSTANTS.PAGES.ARMY);
      if (navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.EXPLORE)) await executeAction$9();
    }
  };

  const fights$1 = factions.concat(locations).filter(fight => !fight.id.includes('orc_war_party_')).map(fight => {
    return {
      key: fight.id,
      id: translate(fight.id),
      army: fight.army,
      level: fight.level
    };
  }).filter(fight => typeof fight.level !== 'undefined');
  const factionFights = factions.map(faction => faction.id);
  const unassignAll = controlBox => {
    const allButtons = [...controlBox.querySelectorAll('button:not(.btn)')];
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const parentClasses = button.parentElement.classList.toString();
      const classesToFind = ['absolute', 'top-0', 'right-7'];
      if (classesToFind.every(className => parentClasses.includes(className))) {
        button.click();
        break;
      }
    }
  };
  const assignAll = controlBox => {
    const allButtons = [...controlBox.querySelectorAll('button:not(.btn)')];
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const parentClasses = button.parentElement.classList.toString();
      const classesToFind = ['absolute', 'top-0', 'right-0'];
      if (classesToFind.every(className => parentClasses.includes(className))) {
        button.click();
        break;
      }
    }
  };
  const userEnabled$8 = () => {
    return (state.options.pages[CONSTANTS.PAGES.ARMY].enabled || false) && (state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.ATTACK].enabled || false);
  };
  const executeAction$8 = async () => {
    if (!navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.ATTACK)) return;
    if (state.scriptPaused) return;
    const container = document.querySelector('div.tab-container.sub-container');
    if (container) {
      const boxes = [...container.querySelectorAll('div.grid > div.flex')];
      const controlBox = boxes.shift();
      let enemyList = [];
      let targetSelected = false;
      let target;
      const enemySelectorButton = controlBox.querySelector('button.btn');
      const sendToAttackButton = [...controlBox.querySelectorAll('button.btn')].find(button => reactUtil.getBtnIndex(button, 0) === 1);
      if (sendToAttackButton) {
        if (enemySelectorButton && !enemySelectorButton.disabled && !state.stopAttacks && !state.scriptPaused) {
          enemySelectorButton.click();
          await sleep(250);
          const modals = [...document.querySelectorAll('h3.modal-title')];
          if (modals.length) {
            enemyList = [...modals.map(modal => [...modal.parentElement.querySelectorAll('h5')]).flat()].map(h5 => {
              const key = reactUtil.getNearestKey(h5, 2);
              if (!keyGen.enemy.check(key)) {
                return undefined;
              }
              const enemyDetails = fights$1.find(fight => keyGen.enemy.key(fight.key) === key);
              return {
                button: h5,
                ...enemyDetails
              };
            }).filter(fight => fight).filter(fight => state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.ATTACK].options[fight.key]).filter(fight => armyCalculator.canWinBattle(fight.key, false, false));
            enemyList.sort((a, b) => {
              let aLevel = a.level || 0;
              let bLevel = b.level || 0;
              if (factionFights.includes(a.key)) {
                aLevel -= 100;
              }
              if (factionFights.includes(b.key)) {
                bLevel -= 100;
              }
              return aLevel - bLevel;
            });
            if (enemyList.length && !state.scriptPaused) {
              target = enemyList.shift();
              targetSelected = true;
              target.button.click();
              await sleep(1000);
            } else {
              targetSelected = false;
              const closeButton = modals[0].parentElement.parentElement.parentElement.querySelector('div.absolute > button');
              if (closeButton) {
                closeButton.click();
                await sleep(20);
              }
            }
          }
          if (targetSelected && target && !state.stopAttacks) {
            assignAll(controlBox);
            if (!sendToAttackButton.disabled && !state.scriptPaused) {
              logger({
                msgLevel: 'log',
                msg: `Launching attack against ${target.id}`
              });
              sendToAttackButton.click();
            } else {
              unassignAll(controlBox);
            }
          }
          await sleep(20);
        } else {
          unassignAll(controlBox);
        }
      }
    }
  };
  const getMinWaitTime = () => {
    let waitTime = 60000;
    if (reactUtil.getGameData().StatsStore && reactUtil.getGameData().StatsStore.ngResetNumber) {
      const ngResets = reactUtil.getGameData().StatsStore.ngResetNumber;
      for (let i = 0; i < ngResets; i++) {
        waitTime = waitTime / 2;
      }
    }
    waitTime = Math.ceil(Math.max(waitTime, 3000) / 2) + 1000;
    return waitTime;
  };
  var ArmyAttack = {
    page: CONSTANTS.PAGES.ARMY,
    subpage: CONSTANTS.SUBPAGES.ATTACK,
    enabled: () => userEnabled$8() && navigation.hasPage(CONSTANTS.PAGES.ARMY) && new Date().getTime() - (state.lastVisited[`${CONSTANTS.PAGES.ARMY}${CONSTANTS.SUBPAGES.ATTACK}`] || 0) > getMinWaitTime(),
    action: async () => {
      await navigation.switchSubPage(CONSTANTS.SUBPAGES.ATTACK, CONSTANTS.PAGES.ARMY);
      if (navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.ATTACK)) await executeAction$8();
    }
  };

  const getBuildingsList$1 = () => {
    const buildingsObject = state.options.pages[CONSTANTS.PAGES.BUILD].subpages[CONSTANTS.SUBPAGES.CITY].options;
    if (Object.keys(buildingsObject).length) {
      let buildingsList = Object.keys(buildingsObject).filter(key => !key.includes('prio_')).filter(key => !!buildingsObject[key]).filter(key => !!buildingsObject[`prio_${key}`]).map(key => {
        const building = {
          key: key,
          id: translate(key, 'bui_'),
          max: buildingsObject[key] === -1 ? 999 : buildingsObject[key],
          prio: buildingsObject[`prio_${key}`],
          isSafe: true
        };
        const buildingData = buildings.find(building => building.id === key);
        if (buildingData) {
          if (buildingData.gen) {
            const negativeGen = buildingData.gen.filter(gen => gen.value < 0 && gen.type === 'resource');
            building.isSafe = !negativeGen.length;
            if (negativeGen.length) {
              const requires = negativeGen.map(gen => {
                return {
                  resource: gen.id,
                  parameter: 'speed',
                  minValue: Math.abs(gen.value)
                };
              });
              building.requires = requires;
            }
          }
        }
        return {
          ...buildingData,
          ...building
        };
      }).sort((a, b) => {
        return b.prio - a.prio;
      });
      return buildingsList;
    }
    return [];
  };
  const userEnabled$7 = () => {
    return (state.options.pages[CONSTANTS.PAGES.BUILD].enabled || false) && (state.options.pages[CONSTANTS.PAGES.BUILD].subpages[CONSTANTS.SUBPAGES.CITY].enabled || false);
  };
  const getAllButtons$4 = () => {
    const buildingsList = getBuildingsList$1();
    const buttons = selectors.getAllButtons(true).map(button => {
      const id = reactUtil.getNearestKey(button, 6);
      const count = button.querySelector('span.right-0') ? numberParser.parse(button.querySelector('span.right-0').innerText) : 0;
      return {
        id: id,
        element: button,
        count: count,
        building: buildingsList.find(building => keyGen.building.key(building.key) === id)
      };
    }).filter(button => button.building && button.count < button.building.max).sort((a, b) => {
      if (a.building.prio !== b.building.prio) {
        return b.building.prio - a.building.prio;
      }
      return a.count - b.count;
    });
    return buttons;
  };
  const executeAction$7 = async () => {
    let buttons = getAllButtons$4();
    if (buttons.length) {
      while (!state.scriptPaused && buttons.length) {
        let refreshButtons = false;
        const highestPrio = buttons[0].building.prio;
        const highestPrioBuildings = buttons.filter(button => button.building.prio === highestPrio);
        buttons = buttons.filter(button => button.building.prio < highestPrio);
        while (!state.scriptPaused && highestPrioBuildings.length) {
          let shouldBuild = true;
          const button = highestPrioBuildings.shift();
          if (!button.building.isSafe && button.building.requires.length) {
            shouldBuild = !button.building.requires.find(req => !resources.get(req.resource) || resources.get(req.resource)[req.parameter] <= req.minValue);
            if (button.building.key === 'common_house' && !button.count) {
              shouldBuild = true;
            }
          }
          if (shouldBuild) {
            button.element.click();
            logger({
              msgLevel: 'log',
              msg: `Building ${button.building.id}`
            });
            refreshButtons = true;
            await sleep(25);
            if (!navigation.checkPage(CONSTANTS.PAGES.BUILD)) return;
          }
        }
        await sleep(1400);
        if (refreshButtons) {
          buttons = getAllButtons$4();
        }
      }
    }
    const buildingsList = getBuildingsList$1();
    state.buildings = selectors.getAllButtons(false).map(button => {
      const id = reactUtil.getNearestKey(button, 6);
      let count = reactUtil.getGameData().idxs.buildings[id] ? reactUtil.getGameData().idxs.buildings[id] : 0;
      const building = buildingsList.find(building => keyGen.building.key(building.key) === id);
      if (!building) {
        return {};
      }
      if (button.className.includes('btn-cap') && building.cap) {
        count = building.cap;
      }
      return {
        id: id,
        count: count,
        canBuild: !button.classList.toString().includes('btn-off'),
        ...building
      };
    }).filter(building => building.id);
  };
  var BuildCity = {
    page: CONSTANTS.PAGES.BUILD,
    subpage: CONSTANTS.SUBPAGES.CITY,
    enabled: () => userEnabled$7() && navigation.hasPage(CONSTANTS.PAGES.BUILD) && getBuildingsList$1().length,
    action: async () => {
      await navigation.switchSubPage(CONSTANTS.SUBPAGES.CITY, CONSTANTS.PAGES.BUILD);
      if (navigation.checkPage(CONSTANTS.PAGES.BUILD)) await executeAction$7();
    }
  };

  const getBuildingsList = () => {
    const buildingsObject = state.options.pages[CONSTANTS.PAGES.BUILD].subpages[CONSTANTS.SUBPAGES.COLONY].options;
    if (Object.keys(buildingsObject).length) {
      let buildingsList = Object.keys(buildingsObject).filter(key => !key.includes('prio_')).filter(key => !!buildingsObject[key]).filter(key => !!buildingsObject[`prio_${key}`]).map(key => {
        const building = {
          key: key,
          id: translate(key, 'bui_'),
          max: buildingsObject[key] === -1 ? 999 : buildingsObject[key],
          prio: buildingsObject[`prio_${key}`],
          isSafe: true
        };
        const buildingData = buildings.find(building => building.id === key);
        if (buildingData) {
          if (buildingData.gen) {
            const negativeGen = buildingData.gen.filter(gen => gen.value < 0 && gen.type === 'resource');
            building.isSafe = !negativeGen.length;
            if (negativeGen.length) {
              const requires = negativeGen.map(gen => {
                return {
                  resource: gen.id,
                  parameter: 'speed',
                  minValue: Math.abs(gen.value)
                };
              });
              building.requires = requires;
            }
          }
        }
        return {
          ...buildingData,
          ...building
        };
      }).sort((a, b) => {
        return b.prio - a.prio;
      });
      return buildingsList;
    }
    return [];
  };
  const userEnabled$6 = () => {
    return (state.options.pages[CONSTANTS.PAGES.BUILD].enabled || false) && (state.options.pages[CONSTANTS.PAGES.BUILD].subpages[CONSTANTS.SUBPAGES.COLONY].enabled || false);
  };
  const getAllButtons$3 = () => {
    const buildingsList = getBuildingsList();
    const buttons = selectors.getAllButtons(true).map(button => {
      const id = reactUtil.getNearestKey(button, 6);
      const count = button.querySelector('span') ? numberParser.parse(button.querySelector('span').innerText) : 0;
      return {
        id: id,
        element: button,
        count: count,
        building: buildingsList.find(building => keyGen.building.key(building.key) === id)
      };
    }).filter(button => button.building && button.count < button.building.max).sort((a, b) => {
      if (a.building.prio !== b.building.prio) {
        return b.building.prio - a.building.prio;
      }
      return a.count - b.count;
    });
    return buttons;
  };
  const executeAction$6 = async () => {
    let buttons = getAllButtons$3();
    if (buttons.length) {
      while (!state.scriptPaused && buttons.length) {
        let refreshButtons = false;
        const highestPrio = buttons[0].building.prio;
        const highestPrioBuildings = buttons.filter(button => button.building.prio === highestPrio);
        buttons = buttons.filter(button => button.building.prio < highestPrio);
        while (!state.scriptPaused && highestPrioBuildings.length) {
          let shouldBuild = true;
          const button = highestPrioBuildings.shift();
          if (!button.building.isSafe && button.building.requires.length) {
            shouldBuild = !button.building.requires.find(req => !resources.get(req.resource) || resources.get(req.resource)[req.parameter] <= req.minValue);
          }
          if (shouldBuild) {
            button.element.click();
            logger({
              msgLevel: 'log',
              msg: `Building ${button.building.id}`
            });
            refreshButtons = true;
            await sleep(25);
            if (!navigation.checkPage(CONSTANTS.PAGES.BUILD, CONSTANTS.SUBPAGES.COLONY)) return;
          }
        }
        await sleep(1400);
        if (refreshButtons) {
          buttons = getAllButtons$3();
        }
      }
    }
    const buildingsList = getBuildingsList();
    state.buildings = selectors.getAllButtons(false).map(button => {
      const id = reactUtil.getNearestKey(button, 6);
      let count = button.querySelector('span') ? numberParser.parse(button.querySelector('span').innerText) : 0;
      const building = buildingsList.find(building => keyGen.building.key(building.key) === id);
      if (!building) {
        return {};
      }
      if (button.className.includes('btn-cap') && building.cap) {
        count = building.cap;
      }
      return {
        id: id,
        count: count,
        canBuild: !button.classList.toString().includes('btn-off'),
        ...building
      };
    }).filter(building => building.id);
  };
  var BuildColony = {
    page: CONSTANTS.PAGES.BUILD,
    subpage: CONSTANTS.SUBPAGES.COLONY,
    enabled: () => userEnabled$6() && navigation.hasPage(CONSTANTS.PAGES.BUILD) && getBuildingsList().length,
    action: async () => {
      await navigation.switchSubPage(CONSTANTS.SUBPAGES.COLONY, CONSTANTS.PAGES.BUILD);
      if (navigation.checkPage(CONSTANTS.PAGES.BUILD, CONSTANTS.SUBPAGES.COLONY)) await executeAction$6();
    }
  };

  const resourcesToTrade = ['cow', 'horse', 'food', 'copper', 'wood', 'stone', 'iron', 'tools'];
  const timeToFillResource = 90;
  const timeToWaitUntilFullGold = 60;
  const secondsBetweenSells = 90;
  const getTimeToFillResource = () => {
    return state.options.pages[CONSTANTS.PAGES.MARKETPLACE].options.timeToFillResource || timeToFillResource;
  };
  const getTimeToWaitUntilFullGold = () => {
    return state.options.pages[CONSTANTS.PAGES.MARKETPLACE].options.timeToWaitUntilFullGold || timeToWaitUntilFullGold;
  };
  const getSecondsBetweenSells = () => {
    return state.options.pages[CONSTANTS.PAGES.MARKETPLACE].options.secondsBetweenSells || secondsBetweenSells;
  };
  const getResourcesToTrade = () => {
    const userResourcesToTrade = Object.keys(state.options.pages[CONSTANTS.PAGES.MARKETPLACE].options).filter(key => key.includes('resource_') && state.options.pages[CONSTANTS.PAGES.MARKETPLACE].options[key]).map(key => key.replace('resource_', ''));
    return userResourcesToTrade.length ? userResourcesToTrade : resourcesToTrade;
  };
  const lastSell = localStorage.get('lastSell') || {};
  const shouldSell = () => {
    return !!getResourcesToTrade().find(resName => {
      if (!lastSell[resName]) lastSell[resName] = 0;
      const res = resources.get(resName);
      if (res && (res.current === res.max || res.current + res.speed * getTimeToFillResource() >= res.max) && lastSell[resName] + getSecondsBetweenSells() * 1000 < new Date().getTime()) return true;
    });
  };
  const hasNotEnoughGold = () => {
    const gold = resources.get('gold');
    return gold.current + gold.speed * getTimeToWaitUntilFullGold() < gold.max;
  };
  const userEnabled$5 = () => {
    return state.options.pages[CONSTANTS.PAGES.MARKETPLACE].enabled || false;
  };
  const executeAction$5 = async () => {
    let gold = resources.get('gold');
    if (gold && gold.current < gold.max && shouldSell()) {
      const resourceHolders = [];
      [...document.querySelectorAll('div > div.tab-container > div > div > div')].forEach(resourceHolder => {
        const resKey = reactUtil.getNearestKey(resourceHolder, 2);
        if (resKey) {
          const resName = keyGen.market.id(resKey);
          const res = resources.get(resName);
          if (getResourcesToTrade().includes(resName) && res && (res.current === res.max || res.current + res.speed * getTimeToFillResource() >= res.max)) {
            resourceHolders.push(resourceHolder);
          }
        }
      });
      let goldEarned = 0;
      let soldTotals = {};
      for (let i = 0; i < resourceHolders.length && !state.scriptPaused; i++) {
        gold = resources.get('gold');
        const resourceHolder = resourceHolders[i];
        const resKey = reactUtil.getNearestKey(resourceHolder, 2);
        const resName = keyGen.market.id(resKey);
        let res = resources.get(resName);
        const initialPrice = numberParser.parse(resourceHolder.querySelector('div:nth-child(2) > div > table > tbody > tr > td:nth-child(2)').innerText);
        let price = initialPrice;
        let sellButtons = resourceHolder.querySelectorAll('div > div.grid.gap-3 button.btn-red:not(.btn-dark)');
        while (!state.scriptPaused && sellButtons && sellButtons.length && gold.current < gold.max && res.current + res.speed * getTimeToFillResource() * 2 >= res.max) {
          let maxSellButton = 2;
          const missingResToSell = Math.ceil((gold.max - gold.current) / price);
          if (missingResToSell < 80) {
            maxSellButton = 0;
          } else if (missingResToSell < 800) {
            maxSellButton = 1;
          }
          maxSellButton = Math.min(maxSellButton, sellButtons.length - 1);
          sellButtons[maxSellButton].click();
          lastSell[resName] = new Date().getTime();
          soldTotals[resName] = soldTotals[resName] ? soldTotals[resName] : {
            amount: 0,
            gold: 0
          };
          soldTotals[resName].amount += +sellButtons[maxSellButton].innerText;
          soldTotals[resName].gold += +sellButtons[maxSellButton].innerText * price;
          logger({
            msgLevel: 'debug',
            msg: `Selling ${sellButtons[maxSellButton].innerText} of ${res.name} for ${price}`
          });
          goldEarned += numberParser.parse(sellButtons[maxSellButton].innerText) * price;
          await sleep(10);
          if (!navigation.checkPage(CONSTANTS.PAGES.MARKETPLACE)) return;
          sellButtons = resourceHolder.querySelectorAll('div:nth-child(2) > div.grid.gap-3 button:not(.btn-dark)');
          gold = resources.get('gold');
          res = resources.get(resName);
          price = numberParser.parse(resourceHolder.querySelector('div:nth-child(2) > div > table > tbody > tr > td:nth-child(2)').innerText);
          await sleep(25);
          if (price / initialPrice < 0.1) {
            break;
          }
        }
      }
      if (goldEarned) {
        const totals = Object.keys(soldTotals).filter(resName => soldTotals[resName] && soldTotals[resName].gold && soldTotals[resName].amount).map(resName => `${resName}: ${new Intl.NumberFormat().format(soldTotals[resName].amount)} units for ${new Intl.NumberFormat().format(Math.round(soldTotals[resName].gold))} gold (avg price: ${(soldTotals[resName].gold / soldTotals[resName].amount).toFixed(2)})`);
        logger({
          msgLevel: 'log',
          msg: `Earned ${new Intl.NumberFormat().format(goldEarned)} gold on Marketplace [${totals.join(', ')}]`
        });
        localStorage.set('lastSell', lastSell);
      }
    }
  };
  var Marketplace = {
    page: CONSTANTS.PAGES.MARKETPLACE,
    enabled: () => userEnabled$5() && navigation.hasPage(CONSTANTS.PAGES.MARKETPLACE) && hasNotEnoughGold() && shouldSell(),
    action: async () => {
      await navigation.switchPage(CONSTANTS.PAGES.MARKETPLACE);
      if (navigation.checkPage(CONSTANTS.PAGES.MARKETPLACE)) await executeAction$5();
    }
  };

  const hasUnassignedPopulation = () => {
    let unassignedPopulation = false;
    const navButtons = navigation.getPagesSelector();
    const pageIndex = CONSTANTS.PAGES_INDEX[CONSTANTS.PAGES.POPULATION];
    navButtons.forEach(button => {
      if (reactUtil.getBtnIndex(button, 1) === pageIndex) {
        unassignedPopulation = !!button.querySelector('span');
      }
    });
    return unassignedPopulation;
  };
  const shouldRebalance = () => {
    return state.options.pages[CONSTANTS.PAGES.POPULATION].options.populationRebalanceTime > 0 && (!state.lastVisited.populationRebalance || state.lastVisited.populationRebalance + state.options.pages[CONSTANTS.PAGES.POPULATION].options.populationRebalanceTime * 60 * 1000 < new Date().getTime());
  };
  const allJobs = jobs.filter(job => job.gen && job.gen.length).map(job => {
    return {
      ...job,
      id: translate(job.id, 'pop_'),
      key: job.id,
      gen: job.gen.filter(gen => gen.type === 'resource').map(gen => {
        return {
          id: gen.id,
          value: gen.value
        };
      })
    };
  }).map(job => {
    return {
      ...job,
      isSafe: !job.gen.find(gen => gen.value < 0),
      resourcesGenerated: job.gen.filter(gen => gen.value > 0).map(gen => {
        return {
          id: gen.id,
          value: gen.value
        };
      }),
      resourcesUsed: job.gen.filter(gen => gen.value < 0).map(gen => {
        return {
          id: gen.id,
          value: gen.value
        };
      })
    };
  });
  const userEnabled$4 = () => {
    return state.options.pages[CONSTANTS.PAGES.POPULATION].enabled || false;
  };
  let allowedJobs;
  const getAllJobs = () => {
    const jobsOptions = state.options.pages[CONSTANTS.PAGES.POPULATION].options;
    if (Object.keys(jobsOptions).length) {
      let allowedJobs = Object.keys(jobsOptions).filter(key => !key.includes('prio_')).filter(key => !!jobsOptions[key]).filter(key => !!jobsOptions[`prio_${key}`]).map(key => {
        const jobData = allJobs.find(job => job.key === key) || {};
        const job = {
          ...jobData,
          max: jobsOptions[key] === -1 ? 999 : jobsOptions[key],
          prio: jobsOptions[`prio_${key}`]
        };
        return job;
      });
      return allowedJobs;
    }
    return [];
  };
  const getAllAvailableJobs = () => {
    const container = selectors.getActivePageContent();
    const availableJobs = [...container.querySelectorAll('h5')].map(job => {
      const jobTitle = reactUtil.getNearestKey(job, 7);
      return {
        ...allowedJobs.find(allowedJob => keyGen.population.key(allowedJob.key) === jobTitle),
        container: job.parentElement.parentElement,
        current: +job.parentElement.parentElement.querySelector('input').value.split('/').shift().trim(),
        maxAvailable: +job.parentElement.parentElement.querySelector('input').value.split('/').pop().trim()
      };
    }).filter(job => job.id && !!job.container.querySelector('button.btn-green') && job.current < Math.min(job.max, job.maxAvailable)).sort((a, b) => {
      if (a.prio === b.prio) {
        return a.current - b.current;
      }
      return b.prio - a.prio;
    });
    return availableJobs;
  };
  const executeAction$4 = async () => {
    allowedJobs = getAllJobs();
    if (allowedJobs.length && shouldRebalance()) {
      const unassignAllButton = document.querySelector('div.flex.justify-center.mx-auto.pt-3.font-bold.text-lg > button');
      if (unassignAllButton) {
        unassignAllButton.click();
        logger({
          msgLevel: 'log',
          msg: 'Unassigning all workers'
        });
        await sleep(10);
      }
      state.lastVisited.populationRebalance = new Date().getTime();
      localStorage.set('lastVisited', state.lastVisited);
    }
    let canAssignJobs = true;
    const container = selectors.getActivePageContent();
    let availablePop = container.querySelector('div > span.ml-2').textContent.split('/').map(pop => numberParser.parse(pop.trim()));
    let availableJobs = getAllAvailableJobs();
    if (availablePop[0] > 0 && availableJobs.length) {
      const minimumFood = state.options.pages[CONSTANTS.PAGES.POPULATION].options.minimumFood || 0;
      const unsafeJobRatio = state.options.pages[CONSTANTS.PAGES.POPULATION].options.unsafeJobRatio ?? 2;
      while (!state.scriptPaused && canAssignJobs) {
        canAssignJobs = false;
        if (availableJobs.length) {
          const foodJob = availableJobs.find(job => job.resourcesGenerated.find(res => res.id === 'food'));
          if (foodJob && resources.get('food').speed <= minimumFood && foodJob.current < foodJob.maxAvailable) {
            const addJobButton = foodJob.container.querySelector('button.btn-green');
            if (addJobButton) {
              logger({
                msgLevel: 'log',
                msg: `Assigning worker as ${foodJob.id}`
              });
              addJobButton.click();
              canAssignJobs = true;
              foodJob.current += 1;
              await sleep(20);
              if (!navigation.checkPage(CONSTANTS.PAGES.POPULATION)) return;
            }
          } else {
            let unassigned = container.querySelector('div > span.ml-2').textContent.split('/').map(pop => numberParser.parse(pop.trim())).shift();
            if (unassigned > 0) {
              const resourcesToProduce = ['natronite', 'saltpetre', 'tools', 'wood', 'stone', 'iron', 'copper', 'mana', 'faith', 'research', 'materials', 'steel', 'supplies', 'gold', 'crystal', 'horse', 'cow', 'food'].filter(res => resources.get(res)).filter(res => availableJobs.find(job => job.resourcesGenerated.find(resGen => resGen.id === res)));
              const resourcesWithNegativeGen = resourcesToProduce.filter(res => resources.get(res) && resources.get(res).speed < 0);
              const resourcesWithNoGen = resourcesToProduce.filter(res => !resourcesWithNegativeGen.includes(res) && resources.get(res) && !resources.get(res).speed);
              const resourcesSorted = resourcesWithNegativeGen.concat(resourcesWithNoGen);
              if (resourcesSorted.length) {
                for (let i = 0; i < resourcesSorted.length && !state.scriptPaused; i++) {
                  if (unassigned === 0) break;
                  const resourceName = resourcesSorted[i];
                  const jobsForResource = availableJobs.filter(job => job.current < job.max && job.resourcesGenerated.find(resGen => resGen.id === resourceName)).sort((a, b) => b.resourcesGenerated.find(resGen => resGen.id === resourceName).value - a.resourcesGenerated.find(resGen => resGen.id === resourceName).value);
                  if (jobsForResource.length) {
                    for (let i = 0; i < jobsForResource.length && !state.scriptPaused; i++) {
                      if (unassigned === 0) break;
                      const job = jobsForResource[i];
                      let isSafeToAdd = job.current < Math.min(job.max, job.maxAvailable);
                      const isFoodJob = !!job.resourcesGenerated.find(res => res.id === 'food');
                      if (isFoodJob) {
                        isSafeToAdd = isSafeToAdd || resources.get('food').speed <= minimumFood && foodJob.current < foodJob.maxAvailable;
                      }
                      if (!job.isSafe) {
                        job.resourcesUsed.every(resUsed => {
                          const res = resources.get(resUsed.id);
                          if (!res || res.speed <= Math.abs(resUsed.value * unsafeJobRatio)) {
                            isSafeToAdd = false;
                          }
                          if (res && resUsed.id === 'food' && res.speed - resUsed.value < minimumFood) {
                            const foodJob = getAllAvailableJobs().find(job => job.resourcesGenerated.find(res => res.id === 'food'));
                            if (foodJob) {
                              i -= 1;
                              job = foodJob;
                              isSafeToAdd = true;
                              return false;
                            } else {
                              isSafeToAdd = false;
                            }
                          }
                          return isSafeToAdd;
                        });
                      }
                      if (isSafeToAdd) {
                        const addJobButton = job.container.querySelector('button.btn-green');
                        if (addJobButton) {
                          logger({
                            msgLevel: 'log',
                            msg: `Assigning worker as ${job.id}`
                          });
                          addJobButton.click();
                          job.current += 1;
                          unassigned -= 1;
                          canAssignJobs = !!unassigned;
                          await sleep(20);
                          if (!navigation.checkPage(CONSTANTS.PAGES.POPULATION)) return;
                        }
                      }
                    }
                  }
                }
              }
              availableJobs = getAllAvailableJobs();
              for (let i = 0; i < availableJobs.length; i++) {
                if (!navigation.checkPage(CONSTANTS.PAGES.POPULATION)) break;
                if (state.scriptPaused) break;
                const job = availableJobs[i];
                let isSafeToAdd = job.current < Math.min(job.max, job.maxAvailable);
                const isFoodJob = !!job.resourcesGenerated.find(res => res.id === 'food');
                if (isFoodJob) {
                  isSafeToAdd = isSafeToAdd || resources.get('food').speed <= minimumFood && foodJob.current < foodJob.maxAvailable;
                }
                if (!job.isSafe) {
                  job.resourcesUsed.every(resUsed => {
                    const res = resources.get(resUsed.id);
                    if (!res || res.speed <= Math.abs(resUsed.value * unsafeJobRatio)) {
                      isSafeToAdd = false;
                    }
                    if (res && resUsed.id === 'food' && res.speed - resUsed.value < minimumFood) {
                      const foodJob = availableJobs.find(job => job.resourcesGenerated.find(res => res.id === 'food'));
                      if (foodJob) {
                        job = foodJob;
                        isSafeToAdd = true;
                        return false;
                      } else {
                        isSafeToAdd = false;
                      }
                    }
                    return isSafeToAdd;
                  });
                }
                if (isSafeToAdd && !state.scriptPaused) {
                  const addJobButton = job.container.querySelector('button.btn-green');
                  if (addJobButton) {
                    logger({
                      msgLevel: 'log',
                      msg: `Assigning worker as ${job.id}`
                    });
                    addJobButton.click();
                    job.current += 1;
                    unassigned -= 1;
                    canAssignJobs = !!unassigned;
                    await sleep(20);
                    if (!navigation.checkPage(CONSTANTS.PAGES.POPULATION)) return;
                    break;
                  }
                }
              }
            }
          }
          availableJobs = getAllAvailableJobs();
        }
        const unassigned = container.querySelector('div > span.ml-2').textContent.split('/').map(pop => numberParser.parse(pop.trim())).shift();
        if (unassigned === 0) {
          canAssignJobs = false;
        }
        await sleep(10);
        if (!navigation.checkPage(CONSTANTS.PAGES.POPULATION)) return;
      }
    }
  };
  var Population = {
    page: CONSTANTS.PAGES.POPULATION,
    enabled: () => userEnabled$4() && navigation.hasPage(CONSTANTS.PAGES.POPULATION) && (hasUnassignedPopulation() || shouldRebalance()) && getAllJobs().length,
    action: async () => {
      await navigation.switchPage(CONSTANTS.PAGES.POPULATION);
      if (navigation.checkPage(CONSTANTS.PAGES.POPULATION)) await executeAction$4();
    }
  };

  const dangerousFightsMapping = {
    moonlight_night: 'army_of_goblin',
    dragon_assault: 'army_of_dragon',
    mysterious_robbery: 'fallen_angel_army_1',
    fallen_angel: 'fallen_angel_army_2',
    orc_horde: 'orc_horde_boss',
    kobold_nation: 'king_kobold_nation',
    barbarian_tribes: 'barbarian_horde'
  };
  const userEnabled$3 = () => {
    return state.options.pages[CONSTANTS.PAGES.RESEARCH].subpages[CONSTANTS.SUBPAGES.RESEARCH].enabled || false;
  };
  const getAllowedResearch = () => {
    const researchOptions = state.options.pages[CONSTANTS.PAGES.RESEARCH].subpages[CONSTANTS.SUBPAGES.RESEARCH].options;
    if (Object.keys(researchOptions).length) {
      let allowedResearch = Object.keys(researchOptions).filter(key => !!researchOptions[key]).map(key => {
        const research = {
          key: key,
          id: translate(key, 'tec_'),
          prio: researchOptions[key]
        };
        const researchData = tech.find(technology => technology.id === key);
        return {
          ...researchData,
          ...research
        };
      });
      return allowedResearch;
    }
    return [];
  };
  const getAllButtons$2 = () => {
    const buttonsList = selectors.getAllButtons(true);
    const allowedResearch = getAllowedResearch().map(tech => {
      let button = buttonsList.find(button => reactUtil.getNearestKey(button, 6) === keyGen.research.key(tech.key));
      return {
        ...tech,
        button
      };
    }).filter(tech => tech.button).sort((a, b) => b.prio - a.prio);
    return allowedResearch;
  };
  const executeAction$3 = async () => {
    let ignoredTech = [];
    let buttonsList = getAllButtons$2();
    if (buttonsList.length) {
      while (!state.scriptPaused && buttonsList.length) {
        const highestPrio = buttonsList[0].prio;
        buttonsList = buttonsList.filter(tech => tech.prio === highestPrio);
        for (let i = 0; i < buttonsList.length; i++) {
          const research = buttonsList[i];
          if (state.options.pages[CONSTANTS.PAGES.RESEARCH].subpages[CONSTANTS.SUBPAGES.RESEARCH].options.dangerousFights && dangerousFightsMapping[research.key]) {
            const canWinBattle = armyCalculator.canWinBattle(dangerousFightsMapping[research.key], true, false);
            if (canWinBattle) {
              const canWinNow = armyCalculator.canWinBattle(dangerousFightsMapping[research.key], true, true);
              if (canWinNow) {
                state.stopAttacks = false;
                logger({
                  msgLevel: 'debug',
                  msg: `Will try starting a dangerous research. Research: ${research.id} (${research.key}). Fight: ${dangerousFightsMapping[research.key]}`
                });
              } else {
                ignoredTech.push(research.id);
                logger({
                  msgLevel: 'debug',
                  msg: `Can win ${research.id}, but we need to unassign all units first.`
                });
                state.stopAttacks = true;
                continue;
              }
            } else {
              ignoredTech.push(research.id);
              logger({
                msgLevel: 'debug',
                msg: `Can't win ${research.id}, ignoring it for this round.`
              });
              continue;
            }
          }
          research.button.click();
          logger({
            msgLevel: 'log',
            msg: `Researching ${research.id}`
          });
          await sleep(25);
          if (research.confirm) {
            if (!navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) return;
            await sleep(1000);
            const redConfirmButton = [...document.querySelectorAll('#headlessui-portal-root .btn.btn-red')].find(button => reactUtil.getBtnIndex(button, 0) === 1);
            if (redConfirmButton) {
              redConfirmButton.click();
              await sleep(4000);
              if (!navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) return;
            }
          }
          if (!navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) return;
        }
        await sleep(3100);
        buttonsList = getAllButtons$2().filter(tech => !ignoredTech.includes(tech.id));
      }
    }
  };
  const hasResearches = () => {
    const pageIndex = CONSTANTS.PAGES_INDEX[CONSTANTS.PAGES.RESEARCH];
    const resNavButton = navigation.getPagesSelector().find(page => reactUtil.getBtnIndex(page, 1) === pageIndex);
    if (resNavButton) {
      const researchesAvailable = resNavButton.querySelector('span.inline-block');
      if (researchesAvailable) {
        return true;
      }
    }
    return false;
  };
  var ResearchResearch = {
    page: CONSTANTS.PAGES.RESEARCH,
    subpage: CONSTANTS.SUBPAGES.RESEARCH,
    enabled: () => userEnabled$3() && navigation.hasPage(CONSTANTS.PAGES.RESEARCH) && getAllowedResearch().length && hasResearches(),
    action: async () => {
      await navigation.switchSubPage(CONSTANTS.SUBPAGES.RESEARCH, CONSTANTS.PAGES.RESEARCH);
      if (navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) await executeAction$3();
    }
  };

  const userEnabled$2 = () => {
    return (state.options.pages[CONSTANTS.PAGES.MAGIC].enabled || false) && (state.options.pages[CONSTANTS.PAGES.MAGIC].subpages[CONSTANTS.SUBPAGES.PRAYERS].enabled || false);
  };
  const getAllowedPrayers = () => {
    const prayersOptions = state.options.pages[CONSTANTS.PAGES.MAGIC].subpages[CONSTANTS.SUBPAGES.PRAYERS].options;
    if (Object.keys(prayersOptions).length) {
      let allowedPrayers = Object.keys(prayersOptions).filter(key => !!prayersOptions[key]).map(key => {
        const prayer = {
          key: key,
          id: translate(key, 'fai_'),
          prio: prayersOptions[key]
        };
        const prayerData = spells.find(spell => spell.id === key);
        return {
          ...prayerData,
          ...prayer
        };
      });
      return allowedPrayers;
    }
    return [];
  };
  const getAllButtons$1 = () => {
    const buttonsList = selectors.getAllButtons(true, ':not(.btn-progress)');
    const allowedPrayers = getAllowedPrayers().map(prayer => {
      const button = buttonsList.find(button => reactUtil.getNearestKey(button, 6) === keyGen.magic.key(prayer.key));
      return {
        ...prayer,
        button
      };
    }).filter(prayer => prayer.button).sort((a, b) => b.prio - a.prio);
    return allowedPrayers;
  };
  const executeAction$2 = async () => {
    let buttonsList = getAllButtons$1();
    if (buttonsList.length) {
      while (!state.scriptPaused && buttonsList.length) {
        const highestPrio = buttonsList[0].prio;
        buttonsList = buttonsList.filter(prayer => prayer.prio === highestPrio);
        for (let i = 0; i < buttonsList.length; i++) {
          const prayer = buttonsList[i];
          prayer.button.click();
          logger({
            msgLevel: 'log',
            msg: `Researching prayer ${prayer.id}`
          });
          await sleep(25);
          if (!navigation.checkPage(CONSTANTS.PAGES.MAGIC, CONSTANTS.SUBPAGES.PRAYERS)) return;
        }
        await sleep(3100);
        buttonsList = getAllButtons$1();
      }
    }
  };
  var MagicPrayers = {
    page: CONSTANTS.PAGES.MAGIC,
    subpage: CONSTANTS.SUBPAGES.PRAYERS,
    enabled: () => userEnabled$2() && navigation.hasPage(CONSTANTS.PAGES.MAGIC) && getAllowedPrayers().length && resources.get('faith') && resources.get('faith').max,
    action: async () => {
      await navigation.switchSubPage(CONSTANTS.SUBPAGES.PRAYERS, CONSTANTS.PAGES.MAGIC);
      if (navigation.checkPage(CONSTANTS.PAGES.MAGIC, CONSTANTS.SUBPAGES.PRAYERS)) await executeAction$2();
    }
  };

  const userEnabled$1 = () => {
    return (state.options.pages[CONSTANTS.PAGES.MAGIC].enabled || false) && (state.options.pages[CONSTANTS.PAGES.MAGIC].subpages[CONSTANTS.SUBPAGES.SPELLS].enabled || false);
  };
  const getAllowedSpells = () => {
    const spellOptions = state.options.pages[CONSTANTS.PAGES.MAGIC].subpages[CONSTANTS.SUBPAGES.SPELLS].options;
    if (Object.keys(spellOptions).length) {
      let allowedSpells = Object.keys(spellOptions).map(key => {
        const spell = {
          key: key,
          id: translate(key, 'fai_'),
          enabled: spellOptions[key]
        };
        const spellData = spells.find(spell => spell.id === key);
        return {
          ...spellData,
          ...spell
        };
      }).filter(spell => spell.type && spell.gen);
      return allowedSpells;
    }
    return [];
  };
  const getAllButtons = () => {
    const allowedSpells = getAllowedSpells();
    const buttonsList = selectors.getAllButtons(true).map(button => {
      const spell = allowedSpells.find(spell => reactUtil.getNearestKey(button, 4) === keyGen.magic.key(spell.key));
      return {
        ...spell,
        button
      };
    }).filter(spell => spell.button).sort((a, b) => a.gen.find(gen => gen.id === 'mana').value - b.gen.find(gen => gen.id === 'mana').value);
    return buttonsList;
  };
  const executeAction$1 = async () => {
    const buttonsList = getAllButtons();
    const enabledSpells = buttonsList.filter(button => button.enabled);
    const disabledSpells = buttonsList.filter(button => !button.enabled);
    for (let i = 0; i < disabledSpells.length && !state.scriptPaused; i++) {
      const spell = disabledSpells[i];
      if (spell.button.classList.contains('btn-dark')) {
        logger({
          msgLevel: 'log',
          msg: `Cancelling spell ${spell.id}`
        });
        spell.button.click();
        await sleep(25);
      }
      if (!navigation.checkPage(CONSTANTS.PAGES.MAGIC, CONSTANTS.SUBPAGES.SPELLS)) return;
    }
    for (let i = 0; i < enabledSpells.length && !state.scriptPaused; i++) {
      const spell = enabledSpells[i];
      const hasEnoughMana = resources.get('mana').speed + spell.gen.find(gen => gen.id === 'mana').value > (state.options.pages[CONSTANTS.PAGES.MAGIC].subpages[CONSTANTS.SUBPAGES.SPELLS].options.minimumMana || 0);
      if (!spell.button.classList.contains('btn-dark') && hasEnoughMana) {
        logger({
          msgLevel: 'log',
          msg: `Casting spell ${spell.id}`
        });
        spell.button.click();
        await sleep(25);
      }
      if (!navigation.checkPage(CONSTANTS.PAGES.MAGIC, CONSTANTS.SUBPAGES.SPELLS)) return;
    }
  };
  var MagicSpells = {
    page: CONSTANTS.PAGES.MAGIC,
    subpage: CONSTANTS.SUBPAGES.SPELLS,
    enabled: () => userEnabled$1() && navigation.hasPage(CONSTANTS.PAGES.MAGIC) && getAllowedSpells().length && resources.get('mana') && resources.get('mana').max,
    action: async () => {
      await navigation.switchSubPage(CONSTANTS.SUBPAGES.SPELLS, CONSTANTS.PAGES.MAGIC);
      if (navigation.checkPage(CONSTANTS.PAGES.MAGIC, CONSTANTS.SUBPAGES.SPELLS)) await executeAction$1();
    }
  };

  const isAtWar = () => {
    return !![...document.querySelectorAll('p.text-red-700')].find(p => p.innerText.includes('You are now at war with this faction'));
  };
  const userEnabled = () => {
    return state.options.pages[CONSTANTS.PAGES.DIPLOMACY].enabled || false;
  };
  const mapToFaction = button => {
    let factionName = reactUtil.getNearestKey(button, 12);
    let level = 0;
    let parent = button.parentElement;
    let factionNameEl;
    while (!factionNameEl && level < 5) {
      factionNameEl = parent.querySelector('div.font-bold > button.font-bold');
      if (factionNameEl) ; else {
        factionNameEl = null;
        parent = parent.parentElement;
        level += 1;
      }
    }
    if (factionName && factionNameEl) {
      const factionData = factions.find(faction => keyGen.diplomacy.key(faction.id) === factionName);
      return {
        ...factionData,
        button,
        level: level,
        buttonCount: parent.querySelectorAll(`button.btn`).length,
        key: factionData.id,
        id: translate(factionData.id, 'dip_'),
        option: state.options.pages[CONSTANTS.PAGES.DIPLOMACY].options[factionData.id]
      };
    }
  };
  const getFactionsWithButtons = () => {
    const allButtons = selectors.getAllButtons(true).map(button => mapToFaction(button)).filter(button => button);
    const listOfFactions = {};
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      listOfFactions[button.key] = listOfFactions[button.key] ? listOfFactions[button.key] : button;
      listOfFactions[button.key].buttons = listOfFactions[button.key].buttons ? listOfFactions[button.key].buttons : {};
      let buttonType = undefined;
      if (button.level === 2) {
        buttonType = CONSTANTS.DIPLOMACY_BUTTONS.DELEGATION;
      } else if (button.level === 3) {
        if (button.button.classList.contains('btn-dark')) {
          buttonType = CONSTANTS.DIPLOMACY_BUTTONS.CANCEL_TRADE;
        } else {
          buttonType = CONSTANTS.DIPLOMACY_BUTTONS.ACCEPT_TRADE;
        }
      } else if (button.level === 4) {
        if (button.button.classList.contains('btn-blue')) {
          buttonType = CONSTANTS.DIPLOMACY_BUTTONS.ALLY;
        } else if (button.button.classList.contains('btn-green')) {
          buttonType = CONSTANTS.DIPLOMACY_BUTTONS.IMPROVE_RELATIONSHIPS;
        } else {
          if (button.button.parentElement.parentElement.parentElement.className.includes('border-red')) {
            buttonType = CONSTANTS.DIPLOMACY_BUTTONS.WAR;
          } else {
            buttonType = CONSTANTS.DIPLOMACY_BUTTONS.INSULT;
          }
        }
      }
      if (buttonType) {
        listOfFactions[button.key].buttons[buttonType] = button.button;
      }
      delete listOfFactions[button.key].button;
    }
    return listOfFactions;
  };
  const executeAction = async () => {
    let factionsWithButtons = getFactionsWithButtons();
    let factionKeys = Object.keys(factionsWithButtons);
    let tookAction = true;
    let longAction = false;
    while (!state.scriptPaused && tookAction) {
      if (!navigation.checkPage(CONSTANTS.PAGES.DIPLOMACY)) return;
      tookAction = false;
      longAction = false;
      for (let i = 0; i < factionKeys.length; i++) {
        if (state.scriptPaused) return;
        if (!navigation.checkPage(CONSTANTS.PAGES.DIPLOMACY)) return;
        const faction = factionsWithButtons[factionKeys[i]];
        if (faction.option && faction.option !== CONSTANTS.DIPLOMACY.DISABLED) {
          if (faction.option !== CONSTANTS.DIPLOMACY.JUST_TRADE && faction.option !== CONSTANTS.DIPLOMACY.TRADE_AND_ALLY) {
            if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.CANCEL_TRADE]) {
              logger({
                msgLevel: 'log',
                msg: `Canceling trade with ${faction.id}`
              });
              tookAction = true;
              faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.CANCEL_TRADE].click();
            }
          } else if (faction.option === CONSTANTS.DIPLOMACY.JUST_TRADE || faction.option === CONSTANTS.DIPLOMACY.TRADE_AND_ALLY) {
            if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.ACCEPT_TRADE]) {
              let canTrade;
              if (!faction.commercial) {
                canTrade = false;
              } else {
                canTrade = faction.commercial.filter(res => res.type === 'resource').every(res => {
                  if (res.value < 0) {
                    const currentRes = resources.get(res.id);
                    return currentRes.speed > Math.abs(res.value);
                  } else {
                    return true;
                  }
                });
              }
              if (canTrade) {
                logger({
                  msgLevel: 'log',
                  msg: `Starting trading with ${faction.id}`
                });
                tookAction = true;
                faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.ACCEPT_TRADE].click();
              }
            }
          }
          if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.DELEGATION]) {
            logger({
              msgLevel: 'log',
              msg: `Sending delegation to ${faction.id}`
            });
            longAction = true;
            tookAction = true;
            faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.DELEGATION].click();
          } else if (faction.option === CONSTANTS.DIPLOMACY.GO_TO_WAR && state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.ATTACK].options[faction.key] && !isAtWar()) {
            if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.INSULT]) {
              logger({
                msgLevel: 'log',
                msg: `Insulting ${faction.id}`
              });
              longAction = true;
              tookAction = true;
              faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.INSULT].click();
            }
            if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.WAR]) {
              const canWinBattle = armyCalculator.canWinBattle(faction.key, false, false);
              if (canWinBattle) {
                logger({
                  msgLevel: 'log',
                  msg: `Going to war with ${faction.id}`
                });
                tookAction = true;
                faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.WAR].click();
                await sleep(200);
                const redConfirmButton = [...document.querySelectorAll('#headlessui-portal-root .btn.btn-red')].find(button => reactUtil.getBtnIndex(button, 0) === 1);
                if (redConfirmButton) {
                  redConfirmButton.click();
                  await sleep(200);
                }
                await sleep(3100);
              } else {
                logger({
                  msgLevel: 'debug',
                  msg: `Can't win the fight against ${faction.id}, so no war is being started`
                });
              }
            }
          } else if (faction.option === CONSTANTS.DIPLOMACY.TRADE_AND_ALLY || faction.option === CONSTANTS.DIPLOMACY.ONLY_ALLY) {
            if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.IMPROVE_RELATIONSHIPS]) {
              logger({
                msgLevel: 'log',
                msg: `Improving relationships with ${faction.id}`
              });
              longAction = true;
              tookAction = true;
              faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.IMPROVE_RELATIONSHIPS].click();
            }
            if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.ALLY]) {
              logger({
                msgLevel: 'log',
                msg: `Allying with ${faction.id}`
              });
              longAction = true;
              tookAction = true;
              faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.ALLY].click();
            }
          } else if (faction.option === CONSTANTS.DIPLOMACY.JUST_TRADE && !faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.CANCEL_TRADE] && !faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.ACCEPT_TRADE]) {
            if (faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.IMPROVE_RELATIONSHIPS]) {
              logger({
                msgLevel: 'log',
                msg: `Improving relationships with ${faction.id}`
              });
              longAction = true;
              tookAction = true;
              faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.IMPROVE_RELATIONSHIPS].click();
            }
          }
        }
      }
      if (tookAction) {
        if (longAction) {
          await sleep(3100);
        } else {
          await sleep(25);
        }
        factionsWithButtons = getFactionsWithButtons();
        factionKeys = Object.keys(factionsWithButtons);
      }
    }
  };
  var Diplomacy = {
    page: CONSTANTS.PAGES.DIPLOMACY,
    enabled: () => userEnabled() && navigation.hasPage(CONSTANTS.PAGES.DIPLOMACY),
    action: async () => {
      await navigation.switchPage(CONSTANTS.PAGES.DIPLOMACY);
      if (navigation.checkPage(CONSTANTS.PAGES.DIPLOMACY)) await executeAction();
    }
  };

  var pages = {
    ArmyArmy,
    ArmyExplore,
    ArmyAttack,
    BuildCity,
    BuildColony,
    Marketplace,
    Population,
    ResearchResearch,
    MagicPrayers,
    MagicSpells,
    Diplomacy
  };

  const calculateTippyTTF = () => {
    let potentialResourcesToFillTable = document.querySelectorAll('div.tippy-box > div.tippy-content > div > div > table');
    if (potentialResourcesToFillTable.length) {
      potentialResourcesToFillTable = potentialResourcesToFillTable[0];
      const rows = potentialResourcesToFillTable.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let reqKey = reactUtil.getNearestKey(cells[0], 1);
        if (!keyGen.tooltipReq.check(reqKey)) {
          return;
        }
        reqKey = keyGen.tooltipReq.id(reqKey);
        let dataList;
        let dataId;
        let reqField = 'req';
        if (reqKey.startsWith(CONSTANTS.TOOLTIP_PREFIX.BUILDING)) {
          dataList = buildings;
          dataId = reqKey.replace(CONSTANTS.TOOLTIP_PREFIX.BUILDING, '');
        } else if (reqKey.startsWith(CONSTANTS.TOOLTIP_PREFIX.TECH)) {
          dataList = tech;
          dataId = reqKey.replace(CONSTANTS.TOOLTIP_PREFIX.TECH, '');
        } else if (reqKey.startsWith(CONSTANTS.TOOLTIP_PREFIX.PRAYER)) {
          dataList = spells;
          dataId = reqKey.replace(CONSTANTS.TOOLTIP_PREFIX.PRAYER, '');
        } else if (reqKey.startsWith(CONSTANTS.TOOLTIP_PREFIX.UNIT)) {
          dataList = units;
          dataId = reqKey.replace(CONSTANTS.TOOLTIP_PREFIX.UNIT, '');
        } else if (reqKey.startsWith(CONSTANTS.TOOLTIP_PREFIX.FACTION_IMPROVE)) {
          dataList = factions;
          dataId = reqKey.replace(CONSTANTS.TOOLTIP_PREFIX.FACTION_IMPROVE, '');
          reqField = 'reqImproveRelationship';
        } else if (reqKey.startsWith(CONSTANTS.TOOLTIP_PREFIX.FACTION_DELEGATION)) {
          dataList = factions;
          dataId = reqKey.replace(CONSTANTS.TOOLTIP_PREFIX.FACTION_DELEGATION, '');
          reqField = 'reqDelegation';
        }
        if (!dataId || !dataList) {
          return;
        }
        let match = dataId.match(/^([a-zA-Z_]+)(\d+)$/);
        if (!match) {
          return;
        }
        dataId = match[1];
        let reqIdx = match[2];
        let data = dataList.find(d => dataId === d.id);
        if (!data) {
          return;
        }
        let req = data[reqField];
        if (req) {
          req = req[reqIdx];
        }
        if (!req) {
          return;
        }
        const resource = resources.get(req.id);
        if (resource) {
          let ttf = '✅';
          const target = numberParser.parse(cells[1].textContent.split(' ').shift().replace(/[^0-9KM\-,\.]/g, '').trim());
          if (target > resource.max || resource.speed <= 0) {
            ttf = 'never';
          } else if (target > resource.current) {
            ttf = formatTime(Math.ceil((target - resource.current) / resource.speed)).timeShort;
          }
          if (!cells[2]) {
            const ttfElement = document.createElement('td');
            ttfElement.className = 'px-4 3xl:py-1 text-right';
            ttfElement.textContent = ttf;
            row.appendChild(ttfElement);
          } else {
            cells[2].textContent = ttf;
          }
        }
      });
    }
  };

  const calculateTTF = () => {
    const resourceTrNodes = document.querySelectorAll('#root > div > div:not(#maintabs-container) > div > div > div > table:not(.hidden) > tbody > tr');
    resourceTrNodes.forEach(row => {
      const cells = row.querySelectorAll('td');
      const resourceName = keyGen.resource.id(reactUtil.getNearestKey(cells[0], 5));
      const resource = resources.get(resourceName);
      let ttf = '';
      if (resource && resource.current < resource.max && resource.speed) {
        ttf = resource.ttf ? resource.ttf.timeShort : resource.ttz ? resource.ttz.timeShort : '';
      }
      if (!cells[3]) {
        const ttfElement = document.createElement('td');
        ttfElement.className = 'px-3 3xl:px-5 py-3 lg:py-2 3xl:py-3 whitespace-nowrap w-1/3 text-right';
        ttfElement.textContent = ttf;
        row.appendChild(ttfElement);
      } else {
        cells[3].textContent = ttf;
      }
    });
  };

  const removeAllUnits = async button => {
    let removeButton = button.parentElement.parentElement.querySelector('div.inline-flex button.btn-red.lg\\:hidden');
    while (removeButton) {
      removeButton.click();
      await sleep(10);
      removeButton = button.parentElement.parentElement.querySelector('div.inline-flex button.btn-red.lg\\:hidden');
    }
  };
  const addAllUnits = async button => {
    let addButton = button.parentElement.parentElement.querySelector('div.inline-flex button.btn-green.lg\\:hidden');
    while (addButton) {
      addButton.click();
      await sleep(10);
      addButton = button.parentElement.parentElement.querySelector('div.inline-flex button.btn-green.lg\\:hidden');
    }
  };
  const getRemoveAllButton = () => {
    const removeAllButton = document.createElement('div');
    removeAllButton.classList.add('absolute', 'top-0', 'right-14');
    removeAllButton.innerHTML = `<button type="button" class="text-gray-400 dark:text-mydark-100 hover:text-blue-600 dark:hover:text-blue-500 focus:text-blue-600 dark:focus:text-blue-500">
  <svg viewBox="0 0 24 24" role="presentation" class="icon"><path d="M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 4C10.1 4 8.4 4.6 7.1 5.7L18.3 16.9C19.3 15.5 20 13.8 20 12C20 7.6 16.4 4 12 4M16.9 18.3L5.7 7.1C4.6 8.4 4 10.1 4 12C4 16.4 7.6 20 12 20C13.9 20 15.6 19.4 16.9 18.3Z" style="fill: currentcolor;"></path></svg>
  </button>`;
    removeAllButton.addEventListener('click', function (e) {
      removeAllUnits(e.currentTarget);
    });
    return removeAllButton;
  };
  const getAddAllButton = () => {
    const addAllButton = document.createElement('div');
    addAllButton.classList.add('absolute', 'top-0', 'right-7');
    addAllButton.innerHTML = `<button type="button" class="text-gray-400 dark:text-mydark-100 hover:text-blue-600 dark:hover:text-blue-500 focus:text-blue-600 dark:focus:text-blue-500">
  <svg viewBox="0 0 24 24" role="presentation" class="icon"><path d="M19.5,3.09L20.91,4.5L16.41,9H20V11H13V4H15V7.59L19.5,3.09M20.91,19.5L19.5,20.91L15,16.41V20H13V13H20V15H16.41L20.91,19.5M4.5,3.09L9,7.59V4H11V11H4V9H7.59L3.09,4.5L4.5,3.09M3.09,19.5L7.59,15H4V13H11V20H9V16.41L4.5,20.91L3.09,19.5Z" style="fill: currentcolor;"></path></svg>
  </button>`;
    addAllButton.addEventListener('click', function (e) {
      addAllUnits(e.currentTarget);
    });
    return addAllButton;
  };
  const allowedSubpages = [CONSTANTS.SUBPAGES.ATTACK, CONSTANTS.SUBPAGES.GARRISON, CONSTANTS.SUBPAGES.EXPLORE];
  const addArmyButtons = () => {
    const isCorrectPage = allowedSubpages.find(subpage => navigation.checkPage(CONSTANTS.PAGES.ARMY, subpage));
    if (isCorrectPage) {
      const container = document.querySelector('div.tab-container.sub-container:not(.addArmyButtonsDone)');
      if (container) {
        const boxes = [...container.querySelectorAll('div.grid > div.flex')];
        boxes.shift();
        boxes.forEach(box => {
          box.querySelector('div.flex-1.text-center.relative.mb-2').insertAdjacentElement('beforeend', getAddAllButton());
          box.querySelector('div.flex-1.text-center.relative.mb-2').insertAdjacentElement('beforeend', getRemoveAllButton());
        });
        container.classList.add('addArmyButtonsDone');
      }
    }
  };

  const autoClicker = async () => {
    if (!state.haveManualResourceButtons) return;
    if (state.scriptPaused) return;
    const manualResources = [keyGen.manual.key('food'), keyGen.manual.key('wood'), keyGen.manual.key('stone')];
    while (!state.scriptPaused && state.haveManualResourceButtons) {
      if (state.stopAutoClicking) {
        await sleep(1000);
        continue;
      }
      const buttons = [...document.querySelectorAll('#root > div.flex.flex-wrap.w-full.mx-auto.p-2 > div.w-full.lg\\:pl-2 > div > div.order-2.flex.flex-wrap.gap-3 > button')];
      if (!buttons.length) {
        state.haveManualResourceButtons = false;
        return;
      }
      const buttonsToClick = buttons.filter(button => manualResources.includes(reactUtil.getNearestKey(button, 2)));
      if (buttonsToClick.length && !reactUtil.getGameData().SettingsStore.showSettings) {
        while (buttonsToClick.length && !reactUtil.getGameData().SettingsStore.showSettings) {
          const buttonToClick = buttonsToClick.shift();
          buttonToClick.click();
          await sleep(100);
        }
      } else {
        await sleep(1000);
      }
    }
  };

  const autoAncestor = async () => {
    if (!state.options.ancestor.enabled || !state.options.ancestor.selected) return;
    const ancestorToSelect = state.options.ancestor.selected;
    const ancestorPage = document.querySelector('#root > div.mt-6.lg\\:mt-12.xl\\:mt-24.\\32 xl\\:mt-12.\\34 xl\\:mt-24 > div > div.text-center > p.mt-6.lg\\:mt-8.text-lg.lg\\:text-xl.text-gray-500.dark\\:text-gray-400');
    if (ancestorPage) {
      let ancestor = [...document.querySelectorAll('button.btn')].find(button => reactUtil.getNearestKey(button, 3) === keyGen.ancestor.key(ancestorToSelect));
      if (!ancestor) {
        ancestor = [...document.querySelectorAll('button.btn')].find(button => reactUtil.getNearestKey(button.parentElement, 3) === keyGen.ancestor.key(ancestorToSelect));
      }
      if (ancestor) {
        ancestor.click();
        state.stopAttacks = false;
        state.haveManualResourceButtons = true;
        await sleep(5000);
      }
    }
  };

  const getEnabledLegacies = () => {
    const enabledLegaciesOptions = state.options.prestige.options ?? {};
    if (Object.keys(enabledLegaciesOptions).length) {
      let enabledLegacies = Object.keys(enabledLegaciesOptions).filter(key => !!enabledLegaciesOptions[key]).map(key => {
        const legacy = {
          key: key,
          id: translate(key, 'leg_'),
          prio: enabledLegaciesOptions[key]
        };
        legacy.cost = legacies.find(leg => leg.id === key).req.find(req => req.id === 'legacy').value;
        return legacy;
      });
      return enabledLegacies;
    }
    return [];
  };
  const autoPrestige = async () => {
    if (!state.options.prestige.enabled) return;
    let buttons = [...document.querySelectorAll('h3.modal-title')].map(h3 => [...h3.parentElement.querySelectorAll('button.btn')]).flat();
    if (!buttons.find(button => keyGen.legacy.check(reactUtil.getNearestKey(button, 6)))) {
      return;
    }
    const enabledLegacies = getEnabledLegacies();
    const activeLegacies = buttons.filter(button => !button.classList.contains('btn-red') && !button.classList.toString().includes('btn-off')).map(button => {
      const id = reactUtil.getNearestKey(button, 6);
      const legacyData = enabledLegacies.find(leg => `leg_${leg.key}` === id);
      if (legacyData) {
        return {
          button,
          prio: legacyData.prio,
          cost: legacyData.cost
        };
      }
    }).filter(legacy => legacy).sort((a, b) => {
      if (a.prio === b.prio) return a.cost - b.cost;
      return b.prio - a.prio;
    });
    for (let i = 0; i < activeLegacies.length; i++) {
      activeLegacies[i].button.click();
      await sleep(1);
    }
    let prestigeButton = buttons.find(button => button.classList.contains('btn-red'));
    if (prestigeButton) {
      localStorage.set('lastVisited', {});
      state.stopAutoClicking = true;
      state.stopAttacks = false;
      state.haveManualResourceButtons = true;
      await sleep(300);
      prestigeButton.click();
      await sleep(5000);
      let redConfirmButton = [...document.querySelectorAll('#headlessui-portal-root .btn.btn-red')].find(button => reactUtil.getBtnIndex(button, 0) === 1);
      while (redConfirmButton) {
        redConfirmButton.click();
        await sleep(2000);
        redConfirmButton = [...document.querySelectorAll('#headlessui-portal-root .btn.btn-red')].find(button => reactUtil.getBtnIndex(button, 0) === 1);
      }
      state.stopAutoClicking = false;
    }
  };

  const autoNGPlus = async () => {
    if (!state.options.ngplus.enabled) return;
    if (!reactUtil.getGameData() || !reactUtil.getGameData().LegacyStore || !reactUtil.getGameData().LegacyStore.ownedLegacies) return;
    if (!reactUtil.getGameData().LegacyStore.ownedLegacies.length) return;
    if (state.options.ngplus.value > reactUtil.getGameData().LegacyStore.ownedLegacies.length) return;
    const div = [...document.querySelectorAll('#root > div.flex > div')].find(div => reactUtil.getBtnIndex(div, 0) === 2);
    if (!div) return;
    const ngButton = [...div.querySelectorAll('button')].find(button => reactUtil.getBtnIndex(button, 0) === 5);
    if (!ngButton) return;
    localStorage.set('lastVisited', {});
    state.stopAutoClicking = true;
    state.stopAttacks = false;
    state.haveManualResourceButtons = true;
    await sleep(300);
    ngButton.click();
    await sleep(5000);
    let redConfirmButton = [...document.querySelectorAll('#headlessui-portal-root .btn.btn-red')].find(button => reactUtil.getBtnIndex(button, 0) === 0);
    while (redConfirmButton) {
      redConfirmButton.click();
      await sleep(2000);
      redConfirmButton = [...document.querySelectorAll('#headlessui-portal-root .btn.btn-red')].find(button => reactUtil.getBtnIndex(button, 0) === 1);
    }
    state.stopAutoClicking = false;
  };

  // https://github.com/pieroxy/lz-string
  var LZString = function () {
    function o(o, r) {
      if (!t[o]) {
        t[o] = {};
        for (var n = 0; n < o.length; n++) t[o][o.charAt(n)] = n;
      }
      return t[o][r];
    }
    var r = String.fromCharCode,
      n = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
      e = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$',
      t = {},
      i = {
        compressToBase64: function (o) {
          if (null == o) return '';
          var r = i._compress(o, 6, function (o) {
            return n.charAt(o);
          });
          switch (r.length % 4) {
            default:
            case 0:
              return r;
            case 1:
              return r + '===';
            case 2:
              return r + '==';
            case 3:
              return r + '=';
          }
        },
        decompressFromBase64: function (r) {
          return null == r ? '' : '' == r ? null : i._decompress(r.length, 32, function (e) {
            return o(n, r.charAt(e));
          });
        },
        compressToUTF16: function (o) {
          return null == o ? '' : i._compress(o, 15, function (o) {
            return r(o + 32);
          }) + ' ';
        },
        decompressFromUTF16: function (o) {
          return null == o ? '' : '' == o ? null : i._decompress(o.length, 16384, function (r) {
            return o.charCodeAt(r) - 32;
          });
        },
        compressToUint8Array: function (o) {
          for (var r = i.compress(o), n = new Uint8Array(2 * r.length), e = 0, t = r.length; t > e; e++) {
            var s = r.charCodeAt(e);
            n[2 * e] = s >>> 8, n[2 * e + 1] = s % 256;
          }
          return n;
        },
        decompressFromUint8Array: function (o) {
          if (null === o || void 0 === o) return i.decompress(o);
          for (var n = new Array(o.length / 2), e = 0, t = n.length; t > e; e++) n[e] = 256 * o[2 * e] + o[2 * e + 1];
          var s = [];
          return n.forEach(function (o) {
            s.push(r(o));
          }), i.decompress(s.join(''));
        },
        compressToEncodedURIComponent: function (o) {
          return null == o ? '' : i._compress(o, 6, function (o) {
            return e.charAt(o);
          });
        },
        decompressFromEncodedURIComponent: function (r) {
          return null == r ? '' : '' == r ? null : (r = r.replace(/ /g, '+'), i._decompress(r.length, 32, function (n) {
            return o(e, r.charAt(n));
          }));
        },
        compress: function (o) {
          return i._compress(o, 16, function (o) {
            return r(o);
          });
        },
        _compress: function (o, r, n) {
          if (null == o) return '';
          var e,
            t,
            i,
            s = {},
            p = {},
            u = '',
            c = '',
            a = '',
            l = 2,
            f = 3,
            h = 2,
            d = [],
            m = 0,
            v = 0;
          for (i = 0; i < o.length; i += 1) if (u = o.charAt(i), Object.prototype.hasOwnProperty.call(s, u) || (s[u] = f++, p[u] = !0), c = a + u, Object.prototype.hasOwnProperty.call(s, c)) a = c;else {
            if (Object.prototype.hasOwnProperty.call(p, a)) {
              if (a.charCodeAt(0) < 256) {
                for (e = 0; h > e; e++) m <<= 1, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++;
                for (t = a.charCodeAt(0), e = 0; 8 > e; e++) m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1;
              } else {
                for (t = 1, e = 0; h > e; e++) m = m << 1 | t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t = 0;
                for (t = a.charCodeAt(0), e = 0; 16 > e; e++) m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1;
              }
              l--, 0 == l && (l = Math.pow(2, h), h++), delete p[a];
            } else for (t = s[a], e = 0; h > e; e++) m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1;
            l--, 0 == l && (l = Math.pow(2, h), h++), s[c] = f++, a = String(u);
          }
          if ('' !== a) {
            if (Object.prototype.hasOwnProperty.call(p, a)) {
              if (a.charCodeAt(0) < 256) {
                for (e = 0; h > e; e++) m <<= 1, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++;
                for (t = a.charCodeAt(0), e = 0; 8 > e; e++) m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1;
              } else {
                for (t = 1, e = 0; h > e; e++) m = m << 1 | t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t = 0;
                for (t = a.charCodeAt(0), e = 0; 16 > e; e++) m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1;
              }
              l--, 0 == l && (l = Math.pow(2, h), h++), delete p[a];
            } else for (t = s[a], e = 0; h > e; e++) m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1;
            l--, 0 == l && (l = Math.pow(2, h), h++);
          }
          for (t = 2, e = 0; h > e; e++) m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1;
          for (;;) {
            if (m <<= 1, v == r - 1) {
              d.push(n(m));
              break;
            }
            v++;
          }
          return d.join('');
        },
        decompress: function (o) {
          return null == o ? '' : '' == o ? null : i._decompress(o.length, 32768, function (r) {
            return o.charCodeAt(r);
          });
        },
        _decompress: function (o, n, e) {
          var i,
            s,
            p,
            u,
            c,
            a,
            l,
            f = [],
            h = 4,
            d = 4,
            m = 3,
            v = '',
            w = [],
            A = {
              val: e(0),
              position: n,
              index: 1
            };
          for (i = 0; 3 > i; i += 1) f[i] = i;
          for (p = 0, c = Math.pow(2, 2), a = 1; a != c;) u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
          switch (p) {
            case 0:
              for (p = 0, c = Math.pow(2, 8), a = 1; a != c;) u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
              l = r(p);
              break;
            case 1:
              for (p = 0, c = Math.pow(2, 16), a = 1; a != c;) u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
              l = r(p);
              break;
            case 2:
              return '';
          }
          for (f[3] = l, s = l, w.push(l);;) {
            if (A.index > o) return '';
            for (p = 0, c = Math.pow(2, m), a = 1; a != c;) u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
            switch (l = p) {
              case 0:
                for (p = 0, c = Math.pow(2, 8), a = 1; a != c;) u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
                f[d++] = r(p), l = d - 1, h--;
                break;
              case 1:
                for (p = 0, c = Math.pow(2, 16), a = 1; a != c;) u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
                f[d++] = r(p), l = d - 1, h--;
                break;
              case 2:
                return w.join('');
            }
            if (0 == h && (h = Math.pow(2, m), m++), f[l]) v = f[l];else {
              if (l !== d) return null;
              v = s + s.charAt(0);
            }
            w.push(v), f[d++] = s + v.charAt(0), h--, s = v, 0 == h && (h = Math.pow(2, m), m++);
          }
        }
      };
    return i;
  }();
  'function' == typeof define && define.amd ? define(function () {
    return LZString;
  }) : 'undefined' != typeof module && null != module && (module.exports = LZString);

  // https://stackoverflow.com/a/1421988
  const isNumber = n => /^-?[\d.]+(?:e-?\d+)?$/.test(n);
  const id$1 = 'theresmore-automation-options-panel';
  let start$1;
  const buildingCats = ['living_quarters', 'resource', 'science', 'commercial_area', 'defense', 'faith', 'warehouse', 'wonders'];
  const unsafeResearch = ['kobold_nation', 'barbarian_tribes', 'orcish_threat', 'huge_cave_t'];
  const userUnits = units.filter(unit => unit.type !== 'enemy' && unit.type !== 'settlement' && unit.type !== 'spy');
  const userUnitsCategory = ['Recon', 'Ranged', 'Shock', 'Tank', 'Rider'];
  const fights = factions.concat(locations).filter(fight => !fight.id.includes('orc_war_party_')).map(fight => {
    return {
      key: fight.id,
      id: translate(fight.id),
      army: fight.army,
      level: fight.level
    };
  }).filter(fight => typeof fight.level !== 'undefined');
  let fightLevels = [];
  for (let i = 0; i < 15; i++) {
    const hasFight = !!fights.find(fight => fight.level === i);
    if (hasFight) {
      fightLevels.push(i);
    }
  }
  const generatePrioritySelect = (data, defaultOptions) => {
    defaultOptions = defaultOptions || [{
      key: 'Disabled',
      value: 0
    }, {
      key: 'Lowest',
      value: 1
    }, {
      key: 'Low',
      value: 2
    }, {
      key: 'Medium Low',
      value: 3
    }, {
      key: 'Medium',
      value: 4
    }, {
      key: 'Medium High',
      value: 5
    }, {
      key: 'High',
      value: 6
    }, {
      key: 'Highest',
      value: 7
    }];
    const options = [];
    defaultOptions.forEach(option => {
      options.push(`<option value="${option.value}">${option.key}</option>`);
    });
    return `<select class="option dark:bg-mydark-200"
  ${data.setting ? `data-setting="${data.setting}"` : ''}
  ${data.page ? `data-page="${data.page}"` : ''}
  ${data.subpage ? `data-subpage="${data.subpage}"` : ''}
  ${data.key ? `data-key="${data.key}"` : ''}
  ${data.subkey ? `data-subkey="${data.subkey}"` : ''}
  >${options.join('')}</select>`;
  };
  const createPanel$1 = startFunction => {
    start$1 = startFunction;
    const saveTextarea = document.createElement('textarea');
    saveTextarea.id = `${id$1}-save`;
    saveTextarea.classList.add('taSaveArea');
    document.querySelector('div#root').insertAdjacentElement('afterend', saveTextarea);
    const panelElement = document.createElement('div');
    panelElement.id = id$1;
    panelElement.classList.add('taPanelElement');
    const innerPanelElement = document.createElement('div');
    innerPanelElement.classList.add('dark');
    innerPanelElement.classList.add('dark:bg-mydark-300');
    innerPanelElement.classList.add('taInnerPanelElement');
    innerPanelElement.innerHTML = `
    <h2 class="text-xl">Theresmore Automation Options:</h2>

    <div class="mb-2 taOptionsBar">
      <button id="saveOptions" type="button" class="btn btn-green w-min px-4 mr-2">Save options</button>
      <button id="exportOptions" type="button" class="btn btn-blue w-min px-4 mr-2">Export options</button>
      <button id="importOptions" type="button" class="btn btn-blue w-min px-4 mr-2">Import options</button>
    </div>

    <div class="taTabs">
      <div class="taTab">
        <input type="radio" name="topLevelOptions" id="topLevelOptions-${CONSTANTS.PAGES.BUILD}" checked class="taTab-switch">
        <label for="topLevelOptions-${CONSTANTS.PAGES.BUILD}" class="taTab-label">${CONSTANTS.PAGES.BUILD}</label>
        <div class="taTab-content">
          <p class="mb-2">Max values: -1 -> build unlimited; 0 -> do not build;</p>
          <div class="mb-2"><label>Enabled:
            <input type="checkbox" data-page="${CONSTANTS.PAGES.BUILD}" data-key="enabled" class="option" />
          </label></div>

          <div class="taTabs">
            <div class="taTab">
              <input type="radio" name="${CONSTANTS.PAGES.BUILD}PageOptions" id="${CONSTANTS.PAGES.BUILD}PageOptions-${CONSTANTS.SUBPAGES.CITY}" checked class="taTab-switch">
              <label for="${CONSTANTS.PAGES.BUILD}PageOptions-${CONSTANTS.SUBPAGES.CITY}" class="taTab-label">${CONSTANTS.SUBPAGES.CITY}</label>
              <div class="taTab-content">
                <div class="mb-2"><label>Enabled:
                  <input type="checkbox" data-page="${CONSTANTS.PAGES.BUILD}" data-subpage="${CONSTANTS.SUBPAGES.CITY}" data-key="enabled" class="option" />
                </label></div>

                <div class="mb-2">
                  <button type="button" class="btn btn-blue w-min px-4 mr-2 minus1Medium">Set all to -1/Medium</button>
                  <button type="button" class="btn btn-blue w-min px-4 mr-2 zeroDisabled">Set all to 0/Disabled</button>
                </div>

                ${buildingCats.map(cat => `
                  <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
                    <div class="w-full pb-3 font-bold text-center xl:text-left">${translate(cat)}</div>
                    <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
                      ${buildings.filter(building => building.cat === cat).filter(building => building.tab === 1).map(building => {
    return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(building.id)}</span><br/>
                          Max:
                            <input type="number" data-page="${CONSTANTS.PAGES.BUILD}" data-subpage="${CONSTANTS.SUBPAGES.CITY}" data-key="options" data-subkey="${building.id}"
                            class="option text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
                            value="0" min="-1" max="${building.cap ? building.cap : 999}" step="1" /><br />
                          Prio: ${generatePrioritySelect({
      page: CONSTANTS.PAGES.BUILD,
      subpage: CONSTANTS.SUBPAGES.CITY,
      key: 'options',
      subkey: `prio_${building.id}`
    })}</label></div>`;
  }).join('')}
                    </div>
                  </div>
                `).join('')}

              </div>
            </div>
            <div class="taTab">
              <input type="radio" name="${CONSTANTS.PAGES.BUILD}PageOptions" id="${CONSTANTS.PAGES.BUILD}PageOptions-${CONSTANTS.SUBPAGES.COLONY}" class="taTab-switch">
              <label for="${CONSTANTS.PAGES.BUILD}PageOptions-${CONSTANTS.SUBPAGES.COLONY}" class="taTab-label">${CONSTANTS.SUBPAGES.COLONY}</label>
              <div class="taTab-content">
                <div class="mb-2"><label>Enabled:
                  <input type="checkbox" data-page="${CONSTANTS.PAGES.BUILD}" data-subpage="${CONSTANTS.SUBPAGES.COLONY}" data-key="enabled" class="option" />
                </label></div>

                <div class="mb-2">
                  <button type="button" class="btn btn-blue w-min px-4 mr-2 minus1Medium">Set all to -1/Medium</button>
                  <button type="button" class="btn btn-blue w-min px-4 mr-2 zeroDisabled">Set all to 0/Disabled</button>
                </div>

                ${buildingCats.map(cat => `
                  <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
                    <div class="w-full pb-3 font-bold text-center xl:text-left">${translate(cat)}</div>
                    <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
                      ${buildings.filter(building => building.cat === cat).filter(building => building.tab === 2).map(building => {
    return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(building.id)}</span><br/>
                          Max:
                            <input type="number" data-page="${CONSTANTS.PAGES.BUILD}" data-subpage="${CONSTANTS.SUBPAGES.COLONY}" data-key="options" data-subkey="${building.id}"
                            class="option text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
                            value="0" min="-1" max="${building.cap ? building.cap : 999}" step="1" /><br />
                          Prio: ${generatePrioritySelect({
      page: CONSTANTS.PAGES.BUILD,
      subpage: CONSTANTS.SUBPAGES.COLONY,
      key: 'options',
      subkey: `prio_${building.id}`
    })}</label></div>`;
  }).join('')}
                    </div>
                  </div>
                `).join('')}

              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="taTab">
        <input type="radio" name="topLevelOptions" id="topLevelOptions-${CONSTANTS.PAGES.RESEARCH}" class="taTab-switch">
        <label for="topLevelOptions-${CONSTANTS.PAGES.RESEARCH}" class="taTab-label">${CONSTANTS.PAGES.RESEARCH}</label>
        <div class="taTab-content">
          <div class="mb-2"><label>Enabled:
            <input type="checkbox" data-page="${CONSTANTS.PAGES.RESEARCH}" data-subpage="${CONSTANTS.SUBPAGES.RESEARCH}" data-key="enabled" class="option" />
          </label></div>

          <div class="mb-2"><label>Dangerous fights should require enough army to win before researching:
            <input type="checkbox" data-page="${CONSTANTS.PAGES.RESEARCH}" data-subpage="${CONSTANTS.SUBPAGES.RESEARCH}"
              data-key="options" data-subkey="dangerousFights" class="option" />
          </label></div>

          <div class="mb-2">
            <button type="button" class="btn btn-blue w-min px-4 mr-2 minus1Medium">Set all regular to Medium</button>
            <button type="button" class="btn btn-blue w-min px-4 mr-2 zeroDisabled">Set all regular to Disabled</button>
          </div>

          <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
            <div class="w-full pb-3 font-bold text-center xl:text-left">Regular researches:</div>
            <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
              ${tech.filter(technology => !technology.confirm && !unsafeResearch.includes(technology.id)).map(technology => {
    return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(technology.id, 'tec_')}</span><br />
                  Prio: ${generatePrioritySelect({
      page: CONSTANTS.PAGES.RESEARCH,
      subpage: CONSTANTS.SUBPAGES.RESEARCH,
      key: 'options',
      subkey: technology.id
    })}</label></div>`;
  }).join('')}
            </div>
          </div>

          <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600 unsafe">
            <div class="w-full pb-3 font-bold text-center xl:text-left">Dangerous researches (requiring confirmation):</div>
            <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
              ${tech.filter(technology => technology.confirm || unsafeResearch.includes(technology.id)).map(technology => {
    return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(technology.id, 'tec_')}</span><br />
                  Prio: ${generatePrioritySelect({
      page: CONSTANTS.PAGES.RESEARCH,
      subpage: CONSTANTS.SUBPAGES.RESEARCH,
      key: 'options',
      subkey: technology.id
    })}</label></div>`;
  }).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="taTab">
        <input type="radio" name="topLevelOptions" id="topLevelOptions-${CONSTANTS.PAGES.MARKETPLACE}" class="taTab-switch">
        <label for="topLevelOptions-${CONSTANTS.PAGES.MARKETPLACE}" class="taTab-label">${CONSTANTS.PAGES.MARKETPLACE}</label>
        <div class="taTab-content">

        <div class="mb-2"><label>Enabled:
        <input type="checkbox" data-page="${CONSTANTS.PAGES.MARKETPLACE}" data-key="enabled" class="option" />
        </label></div>
        <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
          ${['cow', 'horse', 'food', 'copper', 'wood', 'stone', 'iron', 'tools'].map(res => {
    return `<div class="flex flex-col mb-2"><label>
                <input type="checkbox" data-page="${CONSTANTS.PAGES.MARKETPLACE}" data-key="options" data-subkey="resource_${res}" class="option" />
              Sell ${translate(res, 'res_')}</label></div>`;
  }).join('')}
        </div>
        <div>Don't sell if max gold can be reached in
          <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200" value="60"
          data-page="${CONSTANTS.PAGES.MARKETPLACE}" data-key="options" data-subkey="timeToWaitUntilFullGold" /> seconds</div>
        <div>Sell the same resource at most every
          <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200" value="90"
          data-page="${CONSTANTS.PAGES.MARKETPLACE}" data-key="options" data-subkey="secondsBetweenSells" /> seconds</div>
        <div>Sell the resource if it can be refilled in at most
          <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200" value="90"
          data-page="${CONSTANTS.PAGES.MARKETPLACE}" data-key="options" data-subkey="timeToFillResource" /> seconds</div>

        </div>
      </div>

      <div class="taTab">
        <input type="radio" name="topLevelOptions" id="topLevelOptions-${CONSTANTS.PAGES.POPULATION}" class="taTab-switch">
        <label for="topLevelOptions-${CONSTANTS.PAGES.POPULATION}" class="taTab-label">${CONSTANTS.PAGES.POPULATION}</label>
        <div class="taTab-content">

          <p class="mb-2">Max values: -1 -> hire unlimited; 0 -> do not hire;</p>
          <div class="mb-2"><label>Enabled:
            <input type="checkbox" data-page="${CONSTANTS.PAGES.POPULATION}" data-key="enabled" class="option" />
          </label></div>

          <div class="mb-2">
            <button type="button" class="btn btn-blue w-min px-4 mr-2 minus1Medium">Set all to -1/Medium</button>
            <button type="button" class="btn btn-blue w-min px-4 mr-2 zeroDisabled">Set all to 0/Disabled</button>
          </div>

          <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600 mb-2">
            <div class="w-full pb-3 font-bold text-center xl:text-left">Hire:</div>
            <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
              ${jobs.filter(job => job.gen).map(job => {
    return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(job.id, 'pop_')}</span><br />
                  Max:
                    <input type="number" data-page="${CONSTANTS.PAGES.POPULATION}" data-key="options" data-subkey="${job.id}"
                    class="option text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
                    value="0" min="-1" max="999" step="1" /><br />
                  Prio: ${generatePrioritySelect({
      page: CONSTANTS.PAGES.POPULATION,
      key: 'options',
      subkey: `prio_${job.id}`
    })}</label></div>`;
  }).join('')}
            </div>
          </div>

          <div class="mb-2"><label>Minimum Food production to aim for:
            <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
            data-page="${CONSTANTS.PAGES.POPULATION}" data-key="options" data-subkey="minimumFood" value="1" min="0" max="999999" step="1" /></label></div>

          <div class="mb-2"><label>Ratio for unsafe jobs (speed of resource production to usage):
            <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
            data-page="${CONSTANTS.PAGES.POPULATION}" data-key="options" data-subkey="unsafeJobRatio"
            value="2" min="0" max="999999" step="0.01" /></label></div>


          <div class="mb-2"><label>Rebalance population every:
            <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
              data-page="${CONSTANTS.PAGES.POPULATION}" data-key="options" data-subkey="populationRebalanceTime" value="0" min="0" max="999999" step="1" />
            minutes (0 to disable)</label></div>

        </div>
      </div>

      <div class="taTab">
        <input type="radio" name="topLevelOptions" id="topLevelOptions-${CONSTANTS.PAGES.ARMY}" class="taTab-switch">
        <label for="topLevelOptions-${CONSTANTS.PAGES.ARMY}" class="taTab-label">${CONSTANTS.PAGES.ARMY}</label>
        <div class="taTab-content">

        <div class="mb-2"><label>Enabled:
        <input type="checkbox" data-page="${CONSTANTS.PAGES.ARMY}" data-key="enabled" class="option" />
        </div>

        <div class="taTabs">
          <div class="taTab">
            <input type="radio" name="${CONSTANTS.PAGES.ARMY}PageOptions"
              id="${CONSTANTS.PAGES.ARMY}PageOptions-${CONSTANTS.SUBPAGES.ARMY}"
              checked class="taTab-switch">
            <label for="${CONSTANTS.PAGES.ARMY}PageOptions-${CONSTANTS.SUBPAGES.ARMY}" class="taTab-label">${CONSTANTS.SUBPAGES.ARMY}</label>
            <div class="taTab-content">
              <p class="mb-2">Max values: -1 -> hire unlimited; 0 -> do not hire;</p>

              <div class="mb-2"><label>Enabled:
                <input type="checkbox" data-page="${CONSTANTS.PAGES.ARMY}" data-subpage="${CONSTANTS.SUBPAGES.ARMY}" data-key="enabled" class="option" />
              </label></div>

              ${userUnitsCategory.map((cat, index) => `
                <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
                  <div class="w-full pb-3 font-bold text-center xl:text-left">${cat}</div>
                  <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
                    ${userUnits.filter(unit => unit.category === index).map(unit => {
    return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(unit.id, 'uni_')}</span><br/>
                        Max:
                          <input type="number" data-page="${CONSTANTS.PAGES.ARMY}" data-subpage="${CONSTANTS.SUBPAGES.ARMY}" data-key="options" data-subkey="${unit.id}"
                          class="option text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
                          value="0" min="-1" max="${unit.cap ? unit.cap : 999}" step="1" /><br />
                        Prio: ${generatePrioritySelect({
      page: CONSTANTS.PAGES.ARMY,
      subpage: CONSTANTS.SUBPAGES.ARMY,
      key: 'options',
      subkey: `prio_${unit.id}`
    })}</label></div>`;
  }).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="taTab">
            <input type="radio" name="${CONSTANTS.PAGES.ARMY}PageOptions"
              id="${CONSTANTS.PAGES.ARMY}PageOptions-${CONSTANTS.SUBPAGES.EXPLORE}"
              class="taTab-switch">
            <label for="${CONSTANTS.PAGES.ARMY}PageOptions-${CONSTANTS.SUBPAGES.EXPLORE}" class="taTab-label">${CONSTANTS.SUBPAGES.EXPLORE}</label>
            <div class="taTab-content">
              <div class="mb-2"><label>Enabled:
                <input type="checkbox" data-page="${CONSTANTS.PAGES.ARMY}" data-subpage="${CONSTANTS.SUBPAGES.EXPLORE}" data-key="enabled" class="option" />
              </label></div>

              <div class="mb-2"><label>Scouts to send:<br />
              Min: <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
              data-page="${CONSTANTS.PAGES.ARMY}" data-subpage="${CONSTANTS.SUBPAGES.EXPLORE}"
              data-key="options" data-subkey="scoutsMin" value="0" min="0" max="999999" step="1" /><br />
              Max: <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
              data-page="${CONSTANTS.PAGES.ARMY}" data-subpage="${CONSTANTS.SUBPAGES.EXPLORE}"
              data-key="options" data-subkey="scoutsMax" value="0" min="0" max="999999" step="1" /></label></div>

              <div class="mb-2"><label>Explorers to send:<br />
              Min: <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
              data-page="${CONSTANTS.PAGES.ARMY}" data-subpage="${CONSTANTS.SUBPAGES.EXPLORE}"
              data-key="options" data-subkey="explorersMin" value="0" min="0" max="999999" step="1" /><br />
              Max: <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
              data-page="${CONSTANTS.PAGES.ARMY}" data-subpage="${CONSTANTS.SUBPAGES.EXPLORE}"
              data-key="options" data-subkey="explorersMax" value="0" min="0" max="999999" step="1" /></label></div>


              <div class="mb-2"><label>Familiars to send:<br />
              Min: <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
              data-page="${CONSTANTS.PAGES.ARMY}" data-subpage="${CONSTANTS.SUBPAGES.EXPLORE}"
              data-key="options" data-subkey="familiarsMin" value="0" min="0" max="999999" step="1" /><br />
              Max: <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
              data-page="${CONSTANTS.PAGES.ARMY}" data-subpage="${CONSTANTS.SUBPAGES.EXPLORE}"
              data-key="options" data-subkey="familiarsMax" value="0" min="0" max="999999" step="1" /></label></div>
            </div>
          </div>

          <div class="taTab">
            <input type="radio" name="${CONSTANTS.PAGES.ARMY}PageOptions"
              id="${CONSTANTS.PAGES.ARMY}PageOptions-${CONSTANTS.SUBPAGES.ATTACK}"
              class="taTab-switch">
            <label for="${CONSTANTS.PAGES.ARMY}PageOptions-${CONSTANTS.SUBPAGES.ATTACK}" class="taTab-label">${CONSTANTS.SUBPAGES.ATTACK}</label>
            <div class="taTab-content">
              <div class="mb-2"><label>Enabled:
                <input type="checkbox" data-page="${CONSTANTS.PAGES.ARMY}" data-subpage="${CONSTANTS.SUBPAGES.ATTACK}" data-key="enabled" class="option" />
              </label></div>

              <p class="mb-2">Check all fights to take</p>

              <div class="mb-2">
                ${fightLevels.map(level => `
                <button type="button" class="btn btn-blue w-min px-4 mr-2 toggleLevelFights" data-checked="1" data-level="${level}">Toggle all Level ${level}</button>
                `).join('')}
              </div>

              ${fightLevels.map(level => `
                <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600 taFights level${level}">
                  <div class="w-full pb-3 font-bold text-center xl:text-left">Level ${level}</div>
                  <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
                    ${fights.filter(fight => fight.level === level).map(fight => {
    return `<div class="flex flex-col mb-2"><label>
                        <input type="checkbox"  data-page="${CONSTANTS.PAGES.ARMY}" data-subpage="${CONSTANTS.SUBPAGES.ATTACK}"
                          data-key="options" data-subkey="${fight.key}" class="option" />
                        <span class="font-bold">${fight.id}</span></label></div>`;
  }).join('')}
                  </div>
                </div>
              `).join('')}

            </div>
          </div>
        </div>

        </div>
      </div>

      <div class="taTab">
        <input type="radio" name="topLevelOptions" id="topLevelOptions-${CONSTANTS.PAGES.MAGIC}" class="taTab-switch">
        <label for="topLevelOptions-${CONSTANTS.PAGES.MAGIC}" class="taTab-label">${CONSTANTS.PAGES.MAGIC}</label>
        <div class="taTab-content">

          <div class="mb-2"><label>Enabled:
            <input type="checkbox" data-page="${CONSTANTS.PAGES.MAGIC}" data-key="enabled" class="option" />
          </div>

          <div class="taTabs">
            <div class="taTab">
              <input type="radio" name="${CONSTANTS.PAGES.MAGIC}PageOptions" id="${CONSTANTS.PAGES.MAGIC}PageOptions-${CONSTANTS.SUBPAGES.PRAYERS}" checked class="taTab-switch">
              <label for="${CONSTANTS.PAGES.MAGIC}PageOptions-${CONSTANTS.SUBPAGES.PRAYERS}" class="taTab-label">${CONSTANTS.SUBPAGES.PRAYERS}</label>
              <div class="taTab-content">
                <div class="mb-2"><label>Enabled:
                  <input type="checkbox" data-page="${CONSTANTS.PAGES.MAGIC}" data-subpage="${CONSTANTS.SUBPAGES.PRAYERS}" data-key="enabled" class="option" />
                </label></div>

                <div class="mb-2">
                  <button type="button" class="btn btn-blue w-min px-4 mr-2 minus1Medium">Set all to Medium</button>
                  <button type="button" class="btn btn-blue w-min px-4 mr-2 zeroDisabled">Set all to Disabled</button>
                </div>

                <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
                  <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
                    ${spells.filter(prayer => prayer.type === 'prayer').map(prayer => {
    return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(prayer.id)}</span><br/>
                        Prio: ${generatePrioritySelect({
      page: CONSTANTS.PAGES.MAGIC,
      subpage: CONSTANTS.SUBPAGES.PRAYERS,
      key: 'options',
      subkey: prayer.id
    })}</label></div>`;
  }).join('')}
                  </div>
                </div>
              </div>
            </div>

            <div class="taTab">
              <input type="radio" name="${CONSTANTS.PAGES.MAGIC}PageOptions"
              id="${CONSTANTS.PAGES.MAGIC}PageOptions-${CONSTANTS.SUBPAGES.SPELLS}"  class="taTab-switch">
              <label for="${CONSTANTS.PAGES.MAGIC}PageOptions-${CONSTANTS.SUBPAGES.SPELLS}" class="taTab-label">${CONSTANTS.SUBPAGES.SPELLS}</label>
              <div class="taTab-content">
                <div class="mb-2"><label>Enabled:
                  <input type="checkbox" data-page="${CONSTANTS.PAGES.MAGIC}" data-subpage="${CONSTANTS.SUBPAGES.SPELLS}" data-key="enabled" class="option" />
                </label></div>

                <div class="mb-2"><label>Minimum Mana production to leave:
                <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
                data-page="${CONSTANTS.PAGES.MAGIC}" data-subpage="${CONSTANTS.SUBPAGES.SPELLS}"
                data-key="options" data-subkey="minimumMana" value="0" min="0" max="999999" step="1" /></label></div>

                <div class="mb-2">
                  <button type="button" class="btn btn-blue w-min px-4 mr-2 spellsResourceEnable">Enable all Resource spells</button>
                  <button type="button" class="btn btn-blue w-min px-4 mr-2 spellsResourceDisable">Disable all Resource spells</button>
                  <button type="button" class="btn btn-blue w-min px-4 mr-2 spellsArmyEnable">Enable all Army spells</button>
                  <button type="button" class="btn btn-blue w-min px-4 mr-2 spellsArmyDisable">Disable all Army spells</button>
                </div>

                <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600 spellsResource">
                  <div class="w-full pb-3 font-bold text-center xl:text-left">Resource spells:</div>
                  <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
                    ${spells.filter(spell => spell.type === 'spell').filter(spell => spell.gen && !spell.gen.find(gen => gen.type === 'modifier' && gen.type_id === 'army')).map(spell => {
    return `<div class="flex flex-col mb-2"><label>
                        <input type="checkbox" data-page="${CONSTANTS.PAGES.MAGIC}" data-subpage="${CONSTANTS.SUBPAGES.SPELLS}"
                          data-key="options" data-subkey="${spell.id}" class="option" />
                        <span class="font-bold">${translate(spell.id)}</span></label></div>`;
  }).join('')}
                  </div>
                </div>

                <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600 spellsArmy">
                  <div class="w-full pb-3 font-bold text-center xl:text-left">Army spells:</div>
                  <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
                    ${spells.filter(spell => spell.type === 'spell').filter(spell => spell.gen && spell.gen.find(gen => gen.type === 'modifier' && gen.type_id === 'army')).map(spell => {
    return `<div class="flex flex-col mb-2"><label>
                        <input type="checkbox" data-page="${CONSTANTS.PAGES.MAGIC}" data-subpage="${CONSTANTS.SUBPAGES.SPELLS}"
                          data-key="options" data-subkey="${spell.id}" class="option" />
                        <span class="font-bold">${translate(spell.id)}</span></label></div>`;
  }).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="taTab">
        <input type="radio" name="topLevelOptions" id="topLevelOptions-${CONSTANTS.PAGES.DIPLOMACY}" class="taTab-switch">
        <label for="topLevelOptions-${CONSTANTS.PAGES.DIPLOMACY}" class="taTab-label">${CONSTANTS.PAGES.DIPLOMACY}</label>
        <div class="taTab-content">
          <div class="mb-2"><label>Enabled:
            <input type="checkbox" data-page="${CONSTANTS.PAGES.DIPLOMACY}" data-key="enabled" class="option" />
          </div>

          <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600 spellsArmy">
            <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
              ${factions.filter(faction => faction.gen).filter(faction => faction.relationship).map(faction => {
    const options = [{
      key: 'Disabled',
      value: CONSTANTS.DIPLOMACY.DISABLED
    }, {
      key: 'Go to war',
      value: CONSTANTS.DIPLOMACY.GO_TO_WAR
    }, {
      key: 'Just trade',
      value: CONSTANTS.DIPLOMACY.JUST_TRADE
    }, {
      key: 'Trade, then ally',
      value: CONSTANTS.DIPLOMACY.TRADE_AND_ALLY
    }, {
      key: 'Ally without trading',
      value: CONSTANTS.DIPLOMACY.ONLY_ALLY
    }];
    return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(faction.id)}</span><br />
                  ${generatePrioritySelect({
      page: CONSTANTS.PAGES.DIPLOMACY,
      key: 'options',
      subkey: `${faction.id}`
    }, options)}
                  </label></div>`;
  }).join('')}
            </div>
          </div>

        </div>
      </div>

      <div class="taTab">
        <input type="radio" name="topLevelOptions" id="topLevelOptions-Automation" class="taTab-switch">
        <label for="topLevelOptions-Automation" class="taTab-label">Automation</label>
        <div class="taTab-content">

          <div class="mb-6">
            <h3 class="text-lg">Auto-ancestor:</h3>
            <div class="mb-2"><label>Enabled:
              <input type="checkbox" data-setting="ancestor" data-key="enabled" class="option" />
            </label></div>

            <div class="mb-2">
              Ancestor to pick:

              <select class="option dark:bg-mydark-200"
              data-setting="ancestor" data-key="selected"
              >
                ${['ancestor_farmer', 'ancestor_believer', 'ancestor_forager', 'ancestor_gatherer', 'ancestor_miner', 'ancestor_researcher', 'ancestor_spellcrafter', 'ancestor_trader', 'ancestor_warrior'].map(ancestor => `<option value="${ancestor}">${translate(ancestor)}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="text-lg">Auto-NG+:</h3>
            <div class="mb-2"><label>Enabled:
              <input type="checkbox" data-setting="ngplus" data-key="enabled" class="option" />
            </label></div>

            <div class="mb-2"><label>Minimum Legacies to NG+:
              <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
              data-setting="ngplus" data-key="value" value="0" min="0" max="999" step="1" /></label>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="text-lg">Auto-prestige:</h3>
            <div class="mb-2"><label>Enabled:
              <input type="checkbox" data-setting="prestige" data-key="enabled" class="option" />
            </label></div>
          </div>

          <div class="mb-2">
            <button type="button" class="btn btn-blue w-min px-4 mr-2 minus1Medium">Set all to Medium</button>
            <button type="button" class="btn btn-blue w-min px-4 mr-2 zeroDisabled">Set all to Disabled</button>
          </div>

          <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
            <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
              ${legacies.map(legacy => {
    return `<div class="flex flex-col mb-2"><label>
                  <span class="font-bold">${translate(legacy.id, 'leg_')} (${legacy.req.find(req => req.id === 'legacy').value})</span><br />
                  Prio: ${generatePrioritySelect({
      setting: 'prestige',
      key: 'options',
      subkey: legacy.id
    })}</label></div>`;
  }).join('')}
            </div>
          </div>

        </div>
      </div>

      <div class="taTab">
        <input type="radio" name="topLevelOptions" id="topLevelOptions-Cosmetics" class="taTab-switch">
        <label for="topLevelOptions-Cosmetics" class="taTab-label">Cosmetics</label>
        <div class="taTab-content">

          <div class="mb-2"><label>Hide full-page overlays:
          <input type="checkbox" data-setting="cosmetics" data-key="hideFullPageOverlay" data-subkey="enabled" class="option" />
          </div>

          <div class="mb-2"><label>Hide toasts:
          <input type="checkbox" data-setting="cosmetics" data-key="toasts" data-subkey="enabled" class="option" />
          </div>
        </div>
      </div>

      <div class="taTab">
        <input type="radio" name="topLevelOptions" id="topLevelOptions-Cheats" class="taTab-switch">
        <label for="topLevelOptions-Cheats" class="taTab-label">Cheats</label>
        <div class="taTab-content">
          <div class="mb-2">
            The cheats will be applied immediately upon pressing the button. Please save your game state before if you're unsure about your decisions.
          </div>

          <div class="mb-2">
            <button type="button" class="btn btn-blue w-min px-4 mr-2 maxResources">Max resources</button>
          </div>

          <div class="mb-2">
            Legacy Points:
              <button type="button" class="btn btn-blue w-min px-4 mr-2 maxLegacyPoints10">+10</button>
              <button type="button" class="btn btn-blue w-min px-4 mr-2 maxLegacyPoints100">+100</button>
              <button type="button" class="btn btn-blue w-min px-4 mr-2 maxLegacyPoints1000">+1000</button>
          </div>

          <div class="mb-2">
            Presitge Currencies:
              <button type="button" class="btn btn-blue w-min px-4 mr-2 maxPrestigeCurrencies1">+1</button>
              <button type="button" class="btn btn-blue w-min px-4 mr-2 maxPrestigeCurrencies10">+10</button>
              <button type="button" class="btn btn-blue w-min px-4 mr-2 maxPrestigeCurrencies100">+100</button>
          </div>

        </div>
      </div>
    </div>

    <div class="absolute top-0 right-0 z-20 pt-4 pr-4">
      <a href="#" title="Close" id="closeOptions">X</a>
    </div>
  `;
    panelElement.appendChild(innerPanelElement);
    document.querySelector('div#root').insertAdjacentElement('afterend', panelElement);
    document.querySelector('#closeOptions').addEventListener('click', togglePanel);
    document.querySelector('#saveOptions').addEventListener('click', saveOptions);
    document.querySelector('#exportOptions').addEventListener('click', exportOptions);
    document.querySelector('#importOptions').addEventListener('click', importOptions);

    // Cheats
    document.querySelector('button.maxResources').addEventListener('click', cheats.maxResources);
    document.querySelector('button.maxLegacyPoints10').addEventListener('click', () => {
      cheats.maxLegacyPoints(10);
    });
    document.querySelector('button.maxLegacyPoints100').addEventListener('click', () => {
      cheats.maxLegacyPoints(100);
    });
    document.querySelector('button.maxLegacyPoints1000').addEventListener('click', () => {
      cheats.maxLegacyPoints(1000);
    });
    document.querySelector('button.maxPrestigeCurrencies1').addEventListener('click', () => {
      cheats.maxPrestigeCurrencies(1);
    });
    document.querySelector('button.maxPrestigeCurrencies10').addEventListener('click', () => {
      cheats.maxPrestigeCurrencies(10);
    });
    document.querySelector('button.maxPrestigeCurrencies100').addEventListener('click', () => {
      cheats.maxPrestigeCurrencies(100);
    });
    const setAllValues = (allContainers, options) => {
      allContainers.forEach(container => {
        container.querySelectorAll('input.option[type=number]').forEach(input => input.value = options.number);
        container.querySelectorAll('input.option[type=checkbox]').forEach(input => input.checked = options.checked ? 'checked' : '');
        container.querySelectorAll('select').forEach(select => select.value = options.select);
      });
    };
    const minus1Mediums = [...document.querySelectorAll('.minus1Medium')];
    minus1Mediums.forEach(button => {
      button.addEventListener('click', function (e) {
        const allGrids = [...e.currentTarget.parentElement.parentElement.querySelectorAll('div.flex.flex-wrap:not(.unsafe)')];
        setAllValues(allGrids, {
          select: 4,
          number: -1
        });
      });
    });
    const zeroDisabled = [...document.querySelectorAll('.zeroDisabled')];
    zeroDisabled.forEach(button => {
      button.addEventListener('click', function (e) {
        const allGrids = [...e.currentTarget.parentElement.parentElement.querySelectorAll('div.flex.flex-wrap:not(.unsafe)')];
        setAllValues(allGrids, {
          select: 0,
          number: 0
        });
      });
    });
    const spellsResourceEnable = [...document.querySelectorAll('.spellsResourceEnable')];
    spellsResourceEnable.forEach(button => {
      button.addEventListener('click', function (e) {
        const allGrids = [...e.currentTarget.parentElement.parentElement.querySelectorAll('div.flex.flex-wrap.spellsResource')];
        setAllValues(allGrids, {
          checked: true
        });
      });
    });
    const spellsResourceDisable = [...document.querySelectorAll('.spellsResourceDisable')];
    spellsResourceDisable.forEach(button => {
      button.addEventListener('click', function (e) {
        const allGrids = [...e.currentTarget.parentElement.parentElement.querySelectorAll('div.flex.flex-wrap.spellsResource')];
        setAllValues(allGrids, {
          checked: false
        });
      });
    });
    const spellsArmyEnable = [...document.querySelectorAll('.spellsArmyEnable')];
    spellsArmyEnable.forEach(button => {
      button.addEventListener('click', function (e) {
        const allGrids = [...e.currentTarget.parentElement.parentElement.querySelectorAll('div.flex.flex-wrap.spellsArmy')];
        setAllValues(allGrids, {
          checked: true
        });
      });
    });
    const spellsArmyDisable = [...document.querySelectorAll('.spellsArmyDisable')];
    spellsArmyDisable.forEach(button => {
      button.addEventListener('click', function (e) {
        const allGrids = [...e.currentTarget.parentElement.parentElement.querySelectorAll('div.flex.flex-wrap.spellsArmy')];
        setAllValues(allGrids, {
          checked: false
        });
      });
    });
    const toggleLevelFights = [...document.querySelectorAll('.toggleLevelFights')];
    toggleLevelFights.forEach(button => {
      button.addEventListener('click', function (e) {
        const toggleState = e.currentTarget.dataset.checked === '1';
        const allGrids = [...document.querySelectorAll(`div.taFights.level${e.currentTarget.dataset.level}`)];
        setAllValues(allGrids, {
          checked: toggleState
        });
        e.currentTarget.dataset.checked = toggleState ? '0' : '1';
      });
    });
    const options = [...document.querySelector(`div#${id$1}`).querySelectorAll('.option')];
    options.forEach(option => {
      const setting = option.dataset.setting;
      const page = option.dataset.page;
      const subPage = option.dataset.subpage;
      const key = option.dataset.key;
      const subKey = option.dataset.subkey;
      let root;
      if (setting) {
        root = state.options[setting];
      } else {
        if (subPage) {
          root = state.options.pages[page].subpages[subPage];
        } else {
          root = state.options.pages[page];
        }
      }
      if (root) {
        const value = subKey ? root[key][subKey] : root[key];
        if (typeof value !== 'undefined') {
          if (option.type === 'checkbox') {
            if (value) {
              option.checked = 'checked';
            }
          } else if (option.type === 'number') {
            option.value = value;
          } else if (option.type === 'select-one') {
            option.value = value;
          }
        }
      }
    });
  };
  const updatePanel$1 = () => {};
  let previousScriptState = state.scriptPaused;
  const togglePanel = () => {
    const panelElement = document.querySelector(`div#${id$1}`);
    panelElement.classList.toggle('taPanelElementVisible');
    if (panelElement.classList.contains('taPanelElementVisible')) {
      previousScriptState = state.scriptPaused;
      state.scriptPaused = true;
    } else {
      state.scriptPaused = previousScriptState;
      if (!state.scriptPaused) {
        start$1();
      }
    }
  };
  const saveOptions = () => {
    const options = [...document.querySelector(`div#${id$1}`).querySelectorAll('.option')];
    state.options = getDefaultOptions();
    options.forEach(option => {
      const setting = option.dataset.setting;
      const page = option.dataset.page;
      const subPage = option.dataset.subpage;
      const key = option.dataset.key;
      const subKey = option.dataset.subkey;
      let value;
      if (option.type === 'checkbox') {
        value = !!option.checked;
      } else if (option.type === 'number') {
        value = Number(option.value);
      } else if (option.type === 'select-one') {
        value = option.value;
      }
      if (isNumber(value)) {
        value = +value;
      }
      let root;
      if (setting) {
        root = state.options[setting];
      } else {
        if (subPage) {
          root = state.options.pages[page].subpages[subPage];
        } else {
          root = state.options.pages[page];
        }
      }
      if (root) {
        if (subKey) {
          root[key][subKey] = value;
        } else {
          root[key] = value;
        }
      }
    });
    localStorage.set('options', state.options);
  };
  const exportOptions = () => {
    document.querySelector(`#${id$1}-save`).value = LZString.compressToBase64(JSON.stringify(state.options));
    document.querySelector(`#${id$1}-save`).select();
    document.execCommand('copy');
    window.alert('Options copied to clipboard');
  };
  const importOptions = () => {
    const saveString = window.prompt('Paste exported Theresmore Automation settings here');
    if (saveString) {
      const saveData = JSON.parse(LZString.decompressFromBase64(saveString));
      if (!Array.isArray(saveData)) {
        localStorage.set('options', saveData);
        state.options = saveData;
        runMigrations();
        location.reload();
      }
    }
  };
  var manageOptions = {
    createPanel: createPanel$1,
    updatePanel: updatePanel$1,
    togglePanel
  };

  const id = 'theresmore-automation';
  let controlPanel;
  const createPanel = switchScriptState => {
    let scriptState = state.scriptPaused ? `Start` : `Stop`;
    const controlPanelElement = document.createElement('div');
    controlPanelElement.id = id;
    controlPanelElement.classList.add('dark');
    controlPanelElement.classList.add('dark:bg-mydark-300');
    controlPanelElement.classList.add('taControlPanelElement');
    controlPanelElement.innerHTML = `
    <p class="mb-2">Theresmore Automation ${taVersion ? `v${taVersion}` : ''}</p>
    <div>
      <button type="button" class="btn btn-blue mb-2 taScriptState">${scriptState}</button>
      <button type="button" class="btn btn-blue mb-2 taManageOptions">Manage Options</button>
    </div>
    <div class="mb-2">
      Legacies: <span class="legacyCount">0</span>; LP: <span class="lpCount">0</span>
    </div>
  </p>
  `;
    document.querySelector('div#root').insertAdjacentElement('afterend', controlPanelElement);
    controlPanel = document.querySelector(`div#${id}`);
    controlPanel.querySelector('.taScriptState').addEventListener('click', switchScriptState);
    controlPanel.querySelector('.taManageOptions').addEventListener('click', manageOptions.togglePanel);
  };
  const updatePanel = () => {
    let scriptState = state.scriptPaused ? `Start` : `Stop`;
    controlPanel.querySelector('.taScriptState').innerHTML = scriptState;
  };
  var managePanel = {
    createPanel,
    updatePanel
  };

  const appendStyles = () => {
    const styleContainer = document.createElement('style');
    styleContainer.innerHTML = `
  .taSaveArea {
    position: absolute;
    top: -1000px;
    left: -1000px;
    width: 1px;
    height: 1px;
  }

  .taControlPanelElement {
    position: fixed;
    bottom: 10px;
    left: 10px;
    z-index: 99999999;
    border: 1px black solid;
    padding: 10px;
  }

  .taPanelElement {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999999999;
    padding: 20px;
    height: 100vh;
    width: 100vw;
    display: none;
    backdrop-filter: blur(10px);
  }

  .taPanelElementVisible {
    display: block;
  }

  .taInnerPanelElement {
    position: relative;
    height: 100%;
    width: 100%;
    padding: 10px;
    border: 1px black solid;
    overflow-y: auto;
    overflow-x: none;
  }

  .toastifyDisabled {
    display: none!important;
  }

  .taTabs {
    position: relative;
    margin: 3rem 0;
    background: #1abc9c;
  }
  .taTabs::before,
  .taTabs::after {
    content: "";
    display: table;
  }
  .taTabs::after {
    clear: both;
  }
  .taTab {
    float: left;
  }
  .taTab-switch {
    display: none;
  }
  .taTab-label {
    position: relative;
    display: block;
    line-height: 2.75em;
    height: 3em;
    padding: 0 1.618em;
    background: #1abc9c;
    border-right: 0.125rem solid #16a085;
    color: #fff;
    cursor: pointer;
    top: 0;
    transition: all 0.25s;
  }
  .taTab-label:hover {
    top: -0.25rem;
    transition: top 0.25s;
  }
  .taTab-content {
    position: absolute;
    z-index: 1;
    top: 2.75em;
    left: 0;
    padding: 1.618rem;
    opacity: 0;
    transition: all 0.35s;
    width: 100%;
  }
  .taTab-switch:checked + .taTab-label {
    background: #fff;
    color: #2c3e50;
    border-bottom: 0;
    border-right: 0.125rem solid #fff;
    transition: all 0.35s;
    z-index: 1;
    top: -0.0625rem;
  }
  .taTab-switch:checked + label + .taTab-content {
    z-index: 2;
    opacity: 1;
    transition: all 0.35s;
  }

  .taOptionsBar {
    position: fixed;
    z-index: 100;
  }

  .right-14 {
    right: 3.5rem;
  }
  `;
    document.querySelector('head').insertAdjacentElement('beforeend', styleContainer);
  };
  var manageStyles = {
    appendStyles
  };

  const modalsToKill = Object.keys(i18n.en).filter(key => key.includes('img_') && !key.includes('_description')).map(key => i18n.en[key]);
  const hideFullPageOverlay = () => {
    if (!state.scriptPaused && state.options.cosmetics.hideFullPageOverlay.enabled) {
      const modalTitle = document.querySelector('#headlessui-portal-root div.modal-container h3.modal-title');
      if (modalTitle) {
        if (!modalsToKill.includes(modalTitle.innerText.trim())) {
          return;
        }
        const fullPageOverlay = document.querySelector('#headlessui-portal-root div.absolute.top-0.right-0.z-20.pt-4.pr-4 > button');
        if (fullPageOverlay && fullPageOverlay.innerText.includes('Close')) {
          fullPageOverlay.click();
        }
      }
    }
  };
  const removeToasts = () => {
    const toastify = document.querySelector('div.Toastify');
    const toastifyDisabled = document.querySelector('div.ToastifyDisabled');
    if (toastify && state.options.cosmetics.toasts.enabled) {
      toastify.classList.remove('Toastify');
      toastify.classList.add('toastifyDisabled');
    } else if (toastifyDisabled && !state.options.cosmetics.toasts.enabled) {
      toastify.classList.remove('toastifyDisabled');
      toastify.classList.add('Toastify');
    }
  };
  var cosmetics = {
    hideFullPageOverlay,
    removeToasts
  };

  const updateStats = () => {
    const controlPanel = document.querySelector('div#theresmore-automation');
    if (controlPanel && reactUtil.getGameData()) {
      controlPanel.querySelector('.legacyCount').innerText = reactUtil.getGameData().LegacyStore.ownedLegacies.length ?? 0;
      controlPanel.querySelector('.lpCount').innerText = reactUtil.getGameData().run.resources.find(res => res.id === 'legacy').value ?? 0;
    }
  };

  var tasks = {
    calculateTippyTTF,
    calculateTTF,
    addArmyButtons,
    autoClicker,
    autoAncestor,
    autoPrestige,
    autoNGPlus,
    managePanel,
    manageOptions,
    manageStyles,
    cosmetics,
    updateStats
  };

  let mainLoopRunning = false;
  let hideFullPageOverlayInterval;
  const switchScriptState = () => {
    state.scriptPaused = !state.scriptPaused;
    localStorage.set('scriptPaused', state.scriptPaused);
    tasks.managePanel.updatePanel();
    if (!state.scriptPaused) {
      start();
    } else {
      logger({
        msgLevel: 'log',
        msg: 'Pausing automation'
      });
    }
  };
  const mainLoop = async () => {
    if (mainLoopRunning) {
      setTimeout(mainLoop, 1000);
      return;
    }
    mainLoopRunning = true;
    while (!state.scriptPaused) {
      tasks.cosmetics.removeToasts();
      await tasks.autoPrestige();
      await tasks.autoNGPlus();
      await tasks.autoAncestor();
      const pagesToCheck = [];
      Object.keys(state.options.pages).forEach(page => {
        if (state.options.pages[page].enabled || page === CONSTANTS.PAGES.RESEARCH) {
          if (pages[page]) {
            pagesToCheck.push(page);
          }
          if (state.options.pages[page].subpages) {
            Object.keys(state.options.pages[page].subpages).forEach(subpage => {
              if (state.options.pages[page].subpages[subpage].enabled) {
                if (pages[page + subpage]) {
                  pagesToCheck.push(page + subpage);
                }
              }
            });
          }
        }
      });
      pagesToCheck.sort((a, b) => {
        return state.lastVisited[a] - state.lastVisited[b];
      });
      while (!state.scriptPaused && pagesToCheck.length) {
        const pageToCheck = pagesToCheck.shift();
        if (pages[pageToCheck] && pages[pageToCheck].enabled()) {
          const page = pages[pageToCheck];
          if (page) {
            logger({
              msgLevel: 'debug',
              msg: `Executing page ${page.page} ${page.subpage ? page.subpage : ''} action`
            });
            state.lastVisited[pageToCheck] = new Date().getTime();
            localStorage.set('lastVisited', state.lastVisited);
            await page.action();
            await sleep(1000);
          }
        }
      }
      await sleep(1000);
    }
    mainLoopRunning = false;
  };
  const init = async () => {
    tasks.manageStyles.appendStyles();
    tasks.managePanel.createPanel(switchScriptState);
    tasks.manageOptions.createPanel(start);
    tasks.managePanel.updatePanel();
    setInterval(tasks.calculateTTF, 100);
    setInterval(tasks.calculateTippyTTF, 100);
    setInterval(tasks.addArmyButtons, 100);
    setInterval(tasks.updateStats, 100);
    start();
  };
  const start = async () => {
    runMigrations();
    document.querySelector('html').classList.add('dark');
    tasks.managePanel.updatePanel();
    if (!state.scriptPaused) {
      logger({
        msgLevel: 'log',
        msg: 'Starting automation'
      });
      if (!hideFullPageOverlayInterval) {
        clearInterval(hideFullPageOverlayInterval);
        hideFullPageOverlayInterval = setInterval(tasks.cosmetics.hideFullPageOverlay, 500);
      }
      await sleep(2000);
      mainLoop();
      await sleep(1000);
      tasks.autoClicker();
    } else {
      if (!hideFullPageOverlayInterval) {
        clearInterval(hideFullPageOverlayInterval);
      }
    }
  };
  init();

})();
