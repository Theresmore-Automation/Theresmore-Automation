// ==UserScript==
// @name        Theresmore Automation
// @description Automation suite for Theresmore game
// @namespace   github.com/Theresmore-Automation/Theresmore-Automation
// @match       https://www.theresmoregame.com/play/
// @license     MIT
// @run-at      document-idle
// @downloadURL https://theresmore-automation.github.io/Theresmore-Automation/dist/bundle.user.js
// @updateURL   https://theresmore-automation.github.io/Theresmore-Automation/dist/bundle.user.js
// @version     3.7.0
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

const taVersion = "3.7.0";


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
  var CONSTANTS = {
    PAGES,
    SUBPAGES,
    SUBPAGE_MAPPING,
    DIPLOMACY,
    DIPLOMACY_BUTTONS
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
  		id: "common_house",
  		cat: "living_quarters",
  		tab: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 15,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 10,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "housing",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 0.2
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 0.3
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "monument",
  		cat: "living_quarters",
  		cap: 1,
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 10
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 10
  			},
  			{
  				type: "tech",
  				id: "monument_past",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "hall_of_the_dead",
  		cat: "living_quarters",
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 1000,
  				multi: 2
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 500,
  				multi: 2
  			},
  			{
  				type: "resource",
  				id: "cow",
  				value: 170,
  				multi: 1.5
  			},
  			{
  				type: "tech",
  				id: "servitude",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "hall_dead",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "unemployed",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 0.6
  			}
  		]
  	},
  	{
  		id: "city_hall",
  		cat: "living_quarters",
  		tab: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1200,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 1000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 750,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 400,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 400,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 150,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "municipal_administration",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -1.5
  			},
  			{
  				type: "cap",
  				id: "research",
  				value: 250
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "mansion",
  		cat: "living_quarters",
  		tab: 1,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 4000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 2000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 1000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 200,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 100,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "architecture",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -3
  			},
  			{
  				type: "cap",
  				id: "research",
  				value: 500
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 4
  			}
  		]
  	},
  	{
  		id: "residential_block",
  		cat: "living_quarters",
  		tab: 1,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 12000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 2000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 1000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 600,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "economics",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -5
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 5
  			}
  		]
  	},
  	{
  		id: "ministry_interior",
  		cat: "living_quarters",
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "food",
  				value: 8000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 8000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 4000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 4000,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "ministry_interior_t",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "merchant",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "professor",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "supplier",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 6
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 3
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.5
  			},
  			{
  				type: "cap",
  				id: "research",
  				value: 8000
  			},
  			{
  				type: "cap",
  				id: "gold",
  				value: 5000
  			},
  			{
  				type: "cap",
  				id: "supplies",
  				value: 3000
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 4
  			}
  		]
  	},
  	{
  		id: "gan_eden",
  		cat: "living_quarters",
  		tab: 1,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "food",
  				value: 2000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 2000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 2000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 800,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "cow",
  				value: 600,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 500,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "ecology",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "farmer",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "farmer",
  				type_gen: "resource",
  				gen: "food",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "food",
  				value: 500
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "ministry_development",
  		cat: "living_quarters",
  		tab: 1,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 25000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 10000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 10000,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "centralized_power",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -2
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "research",
  				value: 1000
  			},
  			{
  				type: "cap",
  				id: "gold",
  				value: 1000
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "farm",
  		cat: "resource",
  		tab: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 10,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 24,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "agricolture",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "farmer",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "farmer",
  				type_gen: "resource",
  				gen: "food",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "food",
  				value: 240
  			}
  		]
  	},
  	{
  		id: "granary",
  		cat: "resource",
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 150,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 150,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 100,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "grain_surplus",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: 0.2
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "food",
  				value: 200
  			}
  		]
  	},
  	{
  		id: "lumberjack_camp",
  		cat: "resource",
  		tab: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 25,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 18,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 5,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "wood_cutting",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "lumberjack",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "lumberjack",
  				type_gen: "resource",
  				gen: "wood",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "wood",
  				value: 100
  			}
  		]
  	},
  	{
  		id: "sawmill",
  		cat: "resource",
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 180,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 180,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 140,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "wood_saw",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 0.7
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "wood",
  				value: 750
  			}
  		]
  	},
  	{
  		id: "quarry",
  		cat: "resource",
  		tab: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 32,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 24,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 8,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "stone_masonry",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "quarryman",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "quarryman",
  				type_gen: "resource",
  				gen: "stone",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "stone",
  				value: 100
  			}
  		]
  	},
  	{
  		id: "stonemason",
  		cat: "resource",
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 180,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 180,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 140,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "stone_processing",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 0.5
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "stone",
  				value: 750
  			}
  		]
  	},
  	{
  		id: "mine",
  		cat: "resource",
  		tab: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 160,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 140,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 80,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "mining",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "miner",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "miner",
  				type_gen: "resource",
  				gen: "copper",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "miner",
  				type_gen: "resource",
  				gen: "iron",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "copper",
  				value: 100
  			},
  			{
  				type: "cap",
  				id: "iron",
  				value: 100
  			}
  		]
  	},
  	{
  		id: "titan_work_area",
  		cat: "resource",
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1500,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 1000,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 800,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 200,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 150,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 100,
  				multi: 1.5
  			},
  			{
  				type: "tech",
  				id: "architecture_titan_t",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 1
  			},
  			{
  				type: "cap",
  				id: "wood",
  				value: 25000
  			},
  			{
  				type: "cap",
  				id: "stone",
  				value: 25000
  			},
  			{
  				type: "cap",
  				id: "copper",
  				value: 15000
  			},
  			{
  				type: "cap",
  				id: "iron",
  				value: 15000
  			},
  			{
  				type: "cap",
  				id: "tools",
  				value: 15000
  			}
  		]
  	},
  	{
  		id: "stable",
  		cat: "resource",
  		tab: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 500,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 500,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 250,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "breeding",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "breeder",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "farmer",
  				type_gen: "resource",
  				gen: "food",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "cow",
  				value: 80
  			},
  			{
  				type: "cap",
  				id: "horse",
  				value: 40
  			}
  		]
  	},
  	{
  		id: "undead_herd",
  		cat: "resource",
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 300,
  				multi: 1.7
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 750,
  				multi: 1.7
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 350,
  				multi: 1.5
  			},
  			{
  				type: "tech",
  				id: "breeding",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "undead_herds",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "cow",
  				value: 0.3
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 0.2
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "farmer",
  				type_gen: "resource",
  				gen: "food",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "cow",
  				value: 120
  			},
  			{
  				type: "cap",
  				id: "horse",
  				value: 80
  			}
  		]
  	},
  	{
  		id: "fiefdom",
  		cat: "resource",
  		tab: 1,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 1500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 1000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "feudalism",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "farmer",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "farmer",
  				type_gen: "resource",
  				gen: "food",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "breeder",
  				type_gen: "resource",
  				gen: "cow",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "breeder",
  				type_gen: "resource",
  				gen: "horse",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "food",
  				value: 250
  			},
  			{
  				type: "cap",
  				id: "cow",
  				value: 100
  			},
  			{
  				type: "cap",
  				id: "horse",
  				value: 50
  			}
  		]
  	},
  	{
  		id: "foundry",
  		cat: "resource",
  		tab: 1,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 1200,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 1000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "metal_casting",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "miner",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "miner",
  				type_gen: "resource",
  				gen: "copper",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "miner",
  				type_gen: "resource",
  				gen: "iron",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "artisan",
  				type_gen: "resource",
  				gen: "tools",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "copper",
  				value: 250
  			},
  			{
  				type: "cap",
  				id: "iron",
  				value: 250
  			},
  			{
  				type: "cap",
  				id: "tools",
  				value: 250
  			}
  		]
  	},
  	{
  		id: "machines_of_gods",
  		cat: "resource",
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1400,
  				multi: 1.8
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 800,
  				multi: 1.8
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 600,
  				multi: 1.8
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 100,
  				multi: 1.8
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 50,
  				multi: 1.8
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 150,
  				multi: 1.8
  			},
  			{
  				type: "tech",
  				id: "metal_casting",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "machines_gods",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "tools",
  				value: 1.2
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 1.2
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 0.5
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
  		]
  	},
  	{
  		id: "carpenter_workshop",
  		cat: "resource",
  		tab: 1,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 800,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 600,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "architecture",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "carpenter",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "carpenter",
  				type_gen: "resource",
  				gen: "building_material",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "building_material",
  				value: 150
  			}
  		]
  	},
  	{
  		id: "grocery",
  		cat: "resource",
  		tab: 1,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1200,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 200,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "food_conservation",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "supplier",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "supplier",
  				type_gen: "resource",
  				gen: "supplies",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "supplies",
  				value: 100
  			}
  		]
  	},
  	{
  		id: "steelworks",
  		cat: "resource",
  		tab: 1,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2400,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 200,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "steeling",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "steelworker",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "steelworker",
  				type_gen: "resource",
  				gen: "steel",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "steel",
  				value: 250
  			}
  		]
  	},
  	{
  		id: "guild_of_craftsmen",
  		cat: "resource",
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2500,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 1200,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 1200,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 500,
  				multi: 1.5
  			},
  			{
  				type: "tech",
  				id: "craftsmen_guild",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "building_material",
  				value: 0.2
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 0.2
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.1
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.1
  			}
  		]
  	},
  	{
  		id: "alchemic_laboratory",
  		cat: "resource",
  		tab: 1,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 8000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 3500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 3000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 2000,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "chemistry",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "alchemist",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "alchemist",
  				type_gen: "resource",
  				gen: "saltpetre",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "saltpetre",
  				value: 200
  			}
  		]
  	},
  	{
  		id: "builder_district",
  		cat: "resource",
  		tab: 1,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 2500,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 2500,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 500,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 500,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "manufactures",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "lumberjack",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "quarryman",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "lumberjack",
  				type_gen: "resource",
  				gen: "wood",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "quarryman",
  				type_gen: "resource",
  				gen: "stone",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "wood",
  				value: 800
  			},
  			{
  				type: "cap",
  				id: "stone",
  				value: 800
  			}
  		]
  	},
  	{
  		id: "natronite_refinery",
  		cat: "resource",
  		tab: 1,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 12000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1500,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 1200,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 600,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "mana_engine",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "natro_refiner",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "natro_refiner",
  				type_gen: "resource",
  				gen: "natronite",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "natronite",
  				value: 200
  			}
  		]
  	},
  	{
  		id: "industrial_plant",
  		cat: "resource",
  		tab: 1,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 12000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 1500,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 1200,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 500,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "mechanization",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "artisan",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "artisan",
  				type_gen: "resource",
  				gen: "tools",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "carpenter",
  				type_gen: "resource",
  				gen: "building_material",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "steelworker",
  				type_gen: "resource",
  				gen: "steel",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "supplier",
  				type_gen: "resource",
  				gen: "supplies",
  				value: 3,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "factory",
  		cat: "resource",
  		tab: 1,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 25000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 15000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 7000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 7000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 5000,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "assembly_line",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "building_material",
  				value: 0.1
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 0.1
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.1
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.1
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 0.1
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 0.1
  			}
  		]
  	},
  	{
  		id: "school",
  		cat: "science",
  		tab: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 350,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 300,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 250,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 100,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "writing",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 0.4
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "research",
  				value: 1000
  			}
  		]
  	},
  	{
  		id: "hall_of_wisdom",
  		cat: "science",
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 800,
  				multi: 2
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 500,
  				multi: 2
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 500,
  				multi: 2
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 250,
  				multi: 2
  			},
  			{
  				type: "tech",
  				id: "writing",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "hall_wisdom",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "research",
  				value: 2000
  			}
  		]
  	},
  	{
  		id: "library_of_theresmore",
  		cat: "science",
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 300,
  				multi: 1.6
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 400,
  				multi: 1.6
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 300,
  				multi: 1.6
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 100,
  				multi: 1.6
  			},
  			{
  				type: "tech",
  				id: "remember_the_ancients",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 2,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "university",
  		cat: "science",
  		tab: 1,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 3000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 1000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 750,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 500,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 200,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "education",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "professor",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "research",
  				value: 1500
  			},
  			{
  				type: "cap",
  				id: "crystal",
  				value: 50
  			}
  		]
  	},
  	{
  		id: "statue_atamar",
  		cat: "science",
  		tab: 1,
  		cap: 1,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 4500
  			},
  			{
  				type: "tech",
  				id: "education",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 2
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 15
  			},
  			{
  				type: "building",
  				id: "statue_firio",
  				value: -1
  			},
  			{
  				type: "building",
  				id: "statue_lurezia",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "statue_firio",
  		cat: "science",
  		tab: 1,
  		cap: 1,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 4500
  			},
  			{
  				type: "tech",
  				id: "education",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 10
  			},
  			{
  				type: "building",
  				id: "statue_atamar",
  				value: -1
  			},
  			{
  				type: "building",
  				id: "statue_lurezia",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "statue_lurezia",
  		cat: "science",
  		tab: 1,
  		cap: 1,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 4500
  			},
  			{
  				type: "tech",
  				id: "education",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 10
  			},
  			{
  				type: "building",
  				id: "statue_atamar",
  				value: -1
  			},
  			{
  				type: "building",
  				id: "statue_firio",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "library_souls",
  		cat: "science",
  		tab: 1,
  		cap: 1,
  		age: 100,
  		req: [
  			{
  				type: "building",
  				id: "books",
  				value: 8,
  				consume: true
  			},
  			{
  				type: "building",
  				id: "souls",
  				value: 8,
  				consume: true
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 150,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 10
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 5,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "books",
  		cat: "science",
  		tab: 1,
  		cap: 8,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 15000
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 4000
  			},
  			{
  				type: "tech",
  				id: "library_of_souls",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "souls",
  		cat: "science",
  		tab: 1,
  		cap: 8,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 2800
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 500
  			},
  			{
  				type: "tech",
  				id: "library_of_souls",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "observatory",
  		cat: "science",
  		tab: 1,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 8000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 3000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 1500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 1000,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "astronomy",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "skymancer",
  				value: 1
  			},
  			{
  				type: "cap",
  				id: "research",
  				value: 2500
  			},
  			{
  				type: "cap",
  				id: "crystal",
  				value: 100
  			}
  		]
  	},
  	{
  		id: "research_plant",
  		cat: "science",
  		tab: 1,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 12000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 4000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 1000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 400,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "research_district",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "researcher",
  				value: 1
  			},
  			{
  				type: "cap",
  				id: "research",
  				value: 4000
  			}
  		]
  	},
  	{
  		id: "island_outpost",
  		cat: "science",
  		tab: 1,
  		cap: 5,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 25000,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 15000,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 8000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 1500,
  				multi: 1.5
  			},
  			{
  				type: "tech",
  				id: "outpost_tiny_island",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 2
  			},
  			{
  				type: "cap",
  				id: "research",
  				value: 6000
  			}
  		]
  	},
  	{
  		id: "palisade",
  		cat: "defense",
  		tab: 1,
  		cap: 1,
  		age: 1,
  		req: [
  			{
  				type: "building",
  				id: "palisade_unit",
  				value: 10,
  				consume: true
  			}
  		],
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 25,
  				perc: false
  			},
  			{
  				type: "resource",
  				id: "fame",
  				value: 25,
  				fix: true
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 5
  			}
  		]
  	},
  	{
  		id: "palisade_unit",
  		cat: "defense",
  		tab: 1,
  		cap: 10,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 600
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 120
  			},
  			{
  				type: "tech",
  				id: "fortification",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "wall",
  		cat: "defense",
  		tab: 1,
  		cap: 1,
  		age: 1,
  		req: [
  			{
  				type: "building",
  				id: "wall_unit",
  				value: 15,
  				consume: true
  			},
  			{
  				type: "building",
  				id: "palisade",
  				value: 1
  			}
  		],
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
  				type: "resource",
  				id: "fame",
  				value: 50,
  				fix: true
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 10
  			}
  		]
  	},
  	{
  		id: "wall_unit",
  		cat: "defense",
  		tab: 1,
  		cap: 15,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 800
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 200
  			},
  			{
  				type: "tech",
  				id: "fortification",
  				value: 1
  			},
  			{
  				type: "building",
  				id: "palisade",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "rampart",
  		cat: "defense",
  		tab: 1,
  		cap: 1,
  		age: 100,
  		req: [
  			{
  				type: "building",
  				id: "rampart_unit",
  				value: 12,
  				consume: true
  			},
  			{
  				type: "building",
  				id: "wall",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "defensive_rampart",
  				value: 1
  			}
  		],
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
  				type: "resource",
  				id: "fame",
  				value: 70,
  				fix: true
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 20
  			}
  		]
  	},
  	{
  		id: "rampart_unit",
  		cat: "defense",
  		tab: 1,
  		cap: 12,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 2000
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 1000
  			},
  			{
  				type: "tech",
  				id: "fortification",
  				value: 1
  			},
  			{
  				type: "building",
  				id: "wall",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "defensive_rampart",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "titanic_walls",
  		cat: "defense",
  		tab: 1,
  		cap: 1,
  		age: 100,
  		req: [
  			{
  				type: "building",
  				id: "titanic_walls_part",
  				value: 12,
  				consume: true
  			},
  			{
  				type: "building",
  				id: "wall",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "wall_titan_t",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 150,
  				fix: true
  			},
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 2000,
  				perc: false
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 5
  			}
  		]
  	},
  	{
  		id: "titanic_walls_part",
  		cat: "defense",
  		tab: 1,
  		cap: 12,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 12000
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 5000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 5000
  			},
  			{
  				type: "building",
  				id: "wall",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "wall_titan_t",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "barracks",
  		cat: "defense",
  		tab: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 800,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 800,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 250,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "bronze_working",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "army",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "castrum_militia",
  		cat: "defense",
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 500,
  				multi: 1.6
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 300,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 300,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 300,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 200,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "training_militia",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "army",
  				value: 5
  			},
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
  		cat: "defense",
  		tab: 1,
  		cap: 5,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 200,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "professional_soldier",
  				value: 1
  			}
  		],
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
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 5
  			}
  		]
  	},
  	{
  		id: "mercenary_outpost",
  		cat: "defense",
  		tab: 1,
  		cap: 15,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 4500,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 2500,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 2500,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 2500,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 1250,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "mercenary_outpost_t",
  				value: 1
  			}
  		],
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
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 4
  			}
  		]
  	},
  	{
  		id: "watchman_outpost",
  		cat: "defense",
  		tab: 1,
  		cap: 8,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 2000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 1000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 100,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 70,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "herald_canava",
  				value: 1
  			}
  		],
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
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "natronite_baloon",
  		cat: "defense",
  		tab: 1,
  		cap: 4,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 10000,
  				multi: 2
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 750,
  				multi: 2
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 750,
  				multi: 2
  			},
  			{
  				type: "tech",
  				id: "flight",
  				value: 1
  			}
  		],
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
  		cat: "defense",
  		tab: 1,
  		cap: 4,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 3000,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 600,
  				multi: 1.5
  			},
  			{
  				type: "tech",
  				id: "siege_defense_weapons",
  				value: 1
  			}
  		],
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
  		cat: "defense",
  		tab: 1,
  		cap: 10,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 1500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 1500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 600,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "besieging_engineers",
  				value: 1
  			}
  		],
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
  		cat: "defense",
  		tab: 1,
  		cap: 8,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 8000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 600,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "magic_arts_teaching",
  				value: 1
  			}
  		],
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
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "minefield",
  		cat: "defense",
  		tab: 1,
  		cap: 8,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 1000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 500,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "land_mine",
  				value: 1
  			}
  		],
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
  		cat: "defense",
  		tab: 1,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 12000,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 2000,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 2000,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 1000,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 500,
  				multi: 1.5
  			},
  			{
  				type: "tech",
  				id: "military_science",
  				value: 1
  			}
  		],
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
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 10
  			}
  		]
  	},
  	{
  		id: "ministry_war",
  		cat: "defense",
  		tab: 1,
  		cap: 15,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 8000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 6000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 4000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 4000,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "ministry_war_t",
  				value: 1
  			}
  		],
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
  			},
  			{
  				type: "cap",
  				id: "food",
  				value: 2500
  			},
  			{
  				type: "cap",
  				id: "supplies",
  				value: 1000
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 15
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "officer_training_ground",
  		cat: "defense",
  		tab: 1,
  		cap: 5,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 12000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 2500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 1000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 1000,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "military_tactics",
  				value: 1
  			}
  		],
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
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 5
  			}
  		]
  	},
  	{
  		id: "artillery_firing",
  		cat: "defense",
  		tab: 1,
  		cap: 10,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 15000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 5000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 3000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 2000,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "veteran_artillerymen",
  				value: 1
  			}
  		],
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
  		cat: "defense",
  		tab: 1,
  		cap: 4,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 10000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 6000
  			},
  			{
  				type: "tech",
  				id: "preparation_war",
  				value: 1
  			}
  		],
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
  		id: "city_center",
  		cat: "wonders",
  		tab: 1,
  		cap: 1,
  		age: 1,
  		req: [
  			{
  				type: "building",
  				id: "city_center_unit",
  				value: 12,
  				consume: true
  			}
  		],
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
  				value: 5,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 5
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 10
  			}
  		]
  	},
  	{
  		id: "city_center_unit",
  		cat: "wonders",
  		tab: 1,
  		cap: 12,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1500
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 750
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 750
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 500
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 250
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 250
  			},
  			{
  				type: "tech",
  				id: "end_ancient_era",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "great_fair",
  		cat: "wonders",
  		tab: 1,
  		cap: 1,
  		age: 2,
  		req: [
  			{
  				type: "building",
  				id: "great_fair_unit",
  				value: 8,
  				consume: true
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 100,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 0.25
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.25
  			},
  			{
  				type: "resource",
  				id: "cow",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 5,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "great_fair_unit",
  		cat: "wonders",
  		tab: 1,
  		cap: 8,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 4000
  			},
  			{
  				type: "resource",
  				id: "cow",
  				value: 150
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 100
  			},
  			{
  				type: "tech",
  				id: "fairs_and_markets",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "cathedral",
  		cat: "wonders",
  		tab: 1,
  		cap: 1,
  		age: 2,
  		req: [
  			{
  				type: "building",
  				id: "cathedral_unit",
  				value: 8,
  				consume: true
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 100,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 3
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 3
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.2
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "faith",
  				value: 1000
  			},
  			{
  				type: "cap",
  				id: "mana",
  				value: 500
  			}
  		]
  	},
  	{
  		id: "cathedral_unit",
  		cat: "wonders",
  		tab: 1,
  		cap: 8,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 4000
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 1500
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 1000
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 400
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 400
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 100
  			},
  			{
  				type: "tech",
  				id: "religious_orders",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "academy_of_freethinkers",
  		cat: "wonders",
  		tab: 1,
  		cap: 1,
  		age: 2,
  		req: [
  			{
  				type: "building",
  				id: "academy_of_freethinkers_part",
  				value: 12,
  				consume: true
  			}
  		],
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
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.2
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 2,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "academy_of_freethinkers_part",
  		cat: "wonders",
  		tab: 1,
  		cap: 12,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 14000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 1200
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 1000
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 600
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 300
  			},
  			{
  				type: "tech",
  				id: "end_feudal_era",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "great_bombard",
  		cat: "wonders",
  		tab: 1,
  		cap: 1,
  		age: 3,
  		req: [
  			{
  				type: "building",
  				id: "great_bombard_part",
  				value: 6,
  				consume: true
  			},
  			{
  				type: "tech",
  				id: "large_defensive_project",
  				value: 1
  			}
  		],
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
  			},
  			{
  				type: "resource",
  				id: "fame",
  				value: 100,
  				fix: true
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 25
  			}
  		]
  	},
  	{
  		id: "great_bombard_part",
  		cat: "wonders",
  		tab: 1,
  		cap: 6,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 15000
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 1500
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 1500
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 500
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 250
  			},
  			{
  				type: "tech",
  				id: "large_defensive_project",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "refugee_district",
  		cat: "wonders",
  		tab: 1,
  		cap: 1,
  		age: 3,
  		req: [
  			{
  				type: "building",
  				id: "refugee_district_part",
  				value: 8,
  				consume: true
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 100,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 0.2
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.2
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 0.2
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 5
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 20
  			}
  		]
  	},
  	{
  		id: "refugee_district_part",
  		cat: "wonders",
  		tab: 1,
  		cap: 8,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 12000
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 12000
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 8000
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 6000
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 6000
  			},
  			{
  				type: "prayer",
  				id: "the_aid",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "stock_exchange",
  		cat: "wonders",
  		tab: 1,
  		cap: 1,
  		age: 3,
  		req: [
  			{
  				type: "building",
  				id: "stock_exchange_part",
  				value: 5,
  				consume: true
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 200,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 10
  			},
  			{
  				type: "cap",
  				id: "gold",
  				value: 50000
  			},
  			{
  				type: "tech",
  				id: "commercial_monopolies",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "stock_exchange_part",
  		cat: "wonders",
  		tab: 1,
  		cap: 5,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 70000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 6000
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 4500
  			},
  			{
  				type: "tech",
  				id: "commercial_monopolies",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "tower_mana",
  		cat: "wonders",
  		tab: 1,
  		cap: 1,
  		age: 3,
  		req: [
  			{
  				type: "building",
  				id: "tower_mana_part",
  				value: 4,
  				consume: true
  			}
  		],
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
  				value: 10
  			}
  		]
  	},
  	{
  		id: "tower_mana_part",
  		cat: "wonders",
  		tab: 1,
  		cap: 4,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 6000
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 2000
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 1000
  			},
  			{
  				type: "enemy",
  				id: "east_sacred_place",
  				value: 1
  			},
  			{
  				type: "enemy",
  				id: "west_sacred_place",
  				value: 1
  			},
  			{
  				type: "enemy",
  				id: "north_sacred_place",
  				value: 1
  			},
  			{
  				type: "enemy",
  				id: "south_sacred_place",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "mana_pit",
  		cat: "wonders",
  		tab: 1,
  		cap: 1,
  		age: 3,
  		req: [
  			{
  				type: "building",
  				id: "mana_pit_part",
  				value: 10,
  				consume: true
  			}
  		],
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
  				value: 50
  			},
  			{
  				type: "cap",
  				id: "mana",
  				value: 2000
  			}
  		]
  	},
  	{
  		id: "mana_pit_part",
  		cat: "wonders",
  		tab: 1,
  		cap: 10,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 24000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 6000
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 2000
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 2000
  			},
  			{
  				type: "tech",
  				id: "mana_utilization",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "hall_heroic_deeds",
  		cat: "wonders",
  		tab: 1,
  		cap: 1,
  		age: 3,
  		req: [
  			{
  				type: "building",
  				id: "hall_heroic_deeds_part",
  				value: 4,
  				consume: true
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 200,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 5
  			},
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
  		id: "hall_heroic_deeds_part",
  		cat: "wonders",
  		tab: 1,
  		cap: 4,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 7000
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 7000
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 7000
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 3000
  			},
  			{
  				type: "tech",
  				id: "monster_epuration",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "harbor_district",
  		cat: "wonders",
  		tab: 1,
  		cap: 1,
  		age: 4,
  		req: [
  			{
  				type: "building",
  				id: "harbor_district_part",
  				value: 8,
  				consume: true
  			}
  		],
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
  				id: "food",
  				value: 5
  			},
  			{
  				type: "cap",
  				id: "wood",
  				value: 10000
  			},
  			{
  				type: "cap",
  				id: "stone",
  				value: 10000
  			},
  			{
  				type: "cap",
  				id: "building_material",
  				value: 2000
  			},
  			{
  				type: "cap",
  				id: "steel",
  				value: 2000
  			},
  			{
  				type: "cap",
  				id: "natronite",
  				value: 2000
  			}
  		]
  	},
  	{
  		id: "harbor_district_part",
  		cat: "wonders",
  		tab: 1,
  		cap: 8,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 80000
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 30000
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 20000
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 7000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 7000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 1000
  			},
  			{
  				type: "tech",
  				id: "harbor_project",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "city_lights",
  		cat: "wonders",
  		tab: 1,
  		cap: 1,
  		age: 4,
  		req: [
  			{
  				type: "building",
  				id: "city_lights_part",
  				value: 10,
  				consume: true
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 250,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 10,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 10,
  				perc: true
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 10
  			}
  		]
  	},
  	{
  		id: "city_lights_part",
  		cat: "wonders",
  		tab: 1,
  		cap: 10,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 125000
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 50000
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 30000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 10000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 8000
  			},
  			{
  				type: "tech",
  				id: "natrocity",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "automated_complex",
  		cat: "wonders",
  		tab: 1,
  		cap: 1,
  		age: 5,
  		req: [
  			{
  				type: "building",
  				id: "automated_complex_part",
  				value: 12,
  				consume: true
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 300,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 25,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 25,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 25,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 25,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 25,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 25,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "automated_complex_part",
  		cat: "wonders",
  		tab: 1,
  		cap: 12,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 250000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 50000
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 35000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 35000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 20000
  			},
  			{
  				type: "tech",
  				id: "replicable_parts",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "arch_triumph",
  		cat: "wonders",
  		tab: 1,
  		cap: 1,
  		age: 5,
  		req: [
  			{
  				type: "building",
  				id: "arch_triumph_part",
  				value: 25,
  				consume: true
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 1000,
  				fix: true
  			}
  		]
  	},
  	{
  		id: "arch_triumph_part",
  		cat: "wonders",
  		tab: 1,
  		cap: 25,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 350000
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 150000
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 150000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 60000
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 60000
  			},
  			{
  				type: "tech",
  				id: "the_triumph",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "artisan_workshop",
  		cat: "commercial_area",
  		tab: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 150,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 120,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 80,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "pottery",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "artisan",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "lumberjack",
  				type_gen: "resource",
  				gen: "wood",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "quarryman",
  				type_gen: "resource",
  				gen: "stone",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "farmer",
  				type_gen: "resource",
  				gen: "food",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "artisan",
  				type_gen: "resource",
  				gen: "tools",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "artisan",
  				type_gen: "resource",
  				gen: "gold",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "gold",
  				value: 250
  			},
  			{
  				type: "cap",
  				id: "tools",
  				value: 100
  			}
  		]
  	},
  	{
  		id: "marketplace",
  		cat: "commercial_area",
  		tab: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1200,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 600,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 400,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 400,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 400,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "currency",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "merchant",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "merchant",
  				type_gen: "resource",
  				gen: "gold",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "artisan",
  				type_gen: "resource",
  				gen: "tools",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "artisan",
  				type_gen: "resource",
  				gen: "gold",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "gold",
  				value: 750
  			},
  			{
  				type: "cap",
  				id: "tools",
  				value: 200
  			}
  		]
  	},
  	{
  		id: "canava_trading",
  		cat: "commercial_area",
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 600,
  				multi: 1.6
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 400,
  				multi: 1.6
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 400,
  				multi: 1.6
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 250,
  				multi: 1.6
  			},
  			{
  				type: "tech",
  				id: "regional_markets",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "gold",
  				value: 1000
  			}
  		]
  	},
  	{
  		id: "valley_of_plenty",
  		cat: "commercial_area",
  		tab: 1,
  		age: 2,
  		cap: 5,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1500,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 500,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 200,
  				multi: 1.5
  			},
  			{
  				type: "tech",
  				id: "plenty_valley",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "bank",
  		cat: "commercial_area",
  		tab: 1,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 1000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 1000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 400,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 200,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 200,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "banking",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "gold",
  				value: 2000
  			}
  		]
  	},
  	{
  		id: "tax_revenue_checkpoints",
  		cat: "commercial_area",
  		tab: 1,
  		age: 2,
  		cap: 4,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 4000,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 3000,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 1000,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 500,
  				multi: 1.5
  			},
  			{
  				type: "tech",
  				id: "safe_roads",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "the_vaults",
  		cat: "commercial_area",
  		tab: 1,
  		cap: 3,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 20000,
  				multi: 2.5
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 5000,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 2500,
  				multi: 1.5
  			},
  			{
  				type: "tech",
  				id: "the_vault",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "gold",
  				value: 17500
  			}
  		]
  	},
  	{
  		id: "credit_union",
  		cat: "commercial_area",
  		tab: 1,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 15000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 3000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 1500,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 1500,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 300,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "financial_markets",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "trader",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "trader",
  				type_gen: "resource",
  				gen: "gold",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "gold",
  				value: 4000
  			}
  		]
  	},
  	{
  		id: "railway_station",
  		cat: "commercial_area",
  		tab: 1,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 12000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 10000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 5000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 4000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 4000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 2500,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 2500,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "railroad",
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
  				id: "gold",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "gold",
  				value: 4000
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "harvest_shrine",
  		cat: "faith",
  		tab: 1,
  		cap: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 800
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 600
  			},
  			{
  				type: "tech",
  				id: "mythology",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: 2
  			},
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
  				type: "building",
  				id: "war_shrine",
  				value: -1
  			},
  			{
  				type: "building",
  				id: "mind_shrine",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "war_shrine",
  		cat: "faith",
  		tab: 1,
  		cap: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1500
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 200
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 200
  			},
  			{
  				type: "tech",
  				id: "mythology",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "army",
  				value: 15
  			},
  			{
  				type: "building",
  				id: "harvest_shrine",
  				value: -1
  			},
  			{
  				type: "building",
  				id: "mind_shrine",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "mind_shrine",
  		cat: "faith",
  		tab: 1,
  		cap: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 1000
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 500
  			},
  			{
  				type: "tech",
  				id: "mythology",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 5
  			},
  			{
  				type: "building",
  				id: "war_shrine",
  				value: -1
  			},
  			{
  				type: "building",
  				id: "harvest_shrine",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "temple",
  		cat: "faith",
  		tab: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 1000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 1000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "religion",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 0.8
  			},
  			{
  				type: "cap",
  				id: "faith",
  				value: 350
  			}
  		]
  	},
  	{
  		id: "altar_of_sacrifices",
  		cat: "faith",
  		tab: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "cow",
  				value: 150,
  				multi: 1.8
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 80,
  				multi: 1.8
  			},
  			{
  				type: "prayer",
  				id: "sacrifices_gods",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1.2
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1.2
  			},
  			{
  				type: "cap",
  				id: "faith",
  				value: 500
  			},
  			{
  				type: "cap",
  				id: "mana",
  				value: 250
  			}
  		]
  	},
  	{
  		id: "magic_circle",
  		cat: "faith",
  		tab: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 2000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 1000,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 700,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "magic",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 1.5
  			},
  			{
  				type: "cap",
  				id: "mana",
  				value: 200
  			}
  		]
  	},
  	{
  		id: "monastery",
  		cat: "faith",
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 200,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "cloistered_life",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 0.5
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 0.5
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 0.5
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 0.5
  			},
  			{
  				type: "cap",
  				id: "research",
  				value: 500
  			},
  			{
  				type: "cap",
  				id: "mana",
  				value: 200
  			}
  		]
  	},
  	{
  		id: "fortune_grove",
  		cat: "faith",
  		tab: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 400,
  				multi: 1.6
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 400,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "fortune_sanctuary",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "luck",
  				value: 1,
  				fix: true
  			}
  		]
  	},
  	{
  		id: "pillars_of_mana",
  		cat: "faith",
  		tab: 1,
  		age: 2,
  		cap: 5,
  		req: [
  			{
  				type: "resource",
  				id: "building_material",
  				value: 750,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 500,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 200,
  				multi: 1.5
  			},
  			{
  				type: "tech",
  				id: "mana_conveyors",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -10
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 5
  			},
  			{
  				type: "cap",
  				id: "mana",
  				value: 200
  			}
  		]
  	},
  	{
  		id: "matter_transmuter",
  		cat: "faith",
  		tab: 1,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 800,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 200,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "alchemical_reactions",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "carpenter",
  				type_gen: "resource",
  				gen: "building_material",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "steelworker",
  				type_gen: "resource",
  				gen: "steel",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "supplier",
  				type_gen: "resource",
  				gen: "supplies",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "professor",
  				type_gen: "resource",
  				gen: "crystal",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "alchemist",
  				type_gen: "resource",
  				gen: "saltpetre",
  				value: 2,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "ministry_worship",
  		cat: "faith",
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 8000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 4000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 3000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 2000,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "ministry_worship_t",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "skymancer",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 3
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 3
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "faith",
  				value: 3000
  			},
  			{
  				type: "cap",
  				id: "mana",
  				value: 3000
  			},
  			{
  				type: "cap",
  				id: "crystal",
  				value: 2000
  			},
  			{
  				type: "resource",
  				id: "luck",
  				value: 1,
  				fix: true
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "conclave",
  		cat: "faith",
  		tab: 1,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 8000,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 3000,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 2000,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 300,
  				multi: 1.5
  			},
  			{
  				type: "tech",
  				id: "order_of_clerics",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1.5
  			},
  			{
  				type: "cap",
  				id: "faith",
  				value: 500
  			},
  			{
  				type: "cap",
  				id: "mana",
  				value: 250
  			}
  		]
  	},
  	{
  		id: "reactivate_portal",
  		cat: "faith",
  		tab: 1,
  		cap: 1,
  		age: 3,
  		req: [
  			{
  				type: "building",
  				id: "reactivate_portal_decryption",
  				value: 5,
  				consume: true
  			},
  			{
  				type: "tech",
  				id: "portal_of_the_dead",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 100,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 5
  			}
  		]
  	},
  	{
  		id: "reactivate_portal_decryption",
  		cat: "faith",
  		tab: 1,
  		cap: 5,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 15000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 2500
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 700
  			},
  			{
  				type: "tech",
  				id: "portal_of_the_dead",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "mausoleum_gods",
  		cat: "faith",
  		tab: 1,
  		cap: 1,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 20000
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 8000
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 4800
  			},
  			{
  				type: "building",
  				id: "tower_mana",
  				value: 1
  			},
  			{
  				type: "prayer",
  				id: "power_spell_east",
  				value: 1
  			},
  			{
  				type: "prayer",
  				id: "power_spell_west",
  				value: 1
  			},
  			{
  				type: "prayer",
  				id: "power_spell_north",
  				value: 1
  			},
  			{
  				type: "prayer",
  				id: "power_spell_south",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "spiritual_garden",
  		cat: "faith",
  		tab: 1,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2500,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 1000,
  				multi: 1.5
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 800,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "communion_nature",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2.5
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 2.5
  			},
  			{
  				type: "cap",
  				id: "faith",
  				value: 750
  			},
  			{
  				type: "cap",
  				id: "mana",
  				value: 500
  			}
  		]
  	},
  	{
  		id: "fountain_prosperity",
  		cat: "faith",
  		tab: 1,
  		age: 4,
  		cap: 4,
  		req: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 10000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 8000
  			},
  			{
  				type: "tech",
  				id: "miracle_city",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 4
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 4
  			}
  		]
  	},
  	{
  		id: "mana_reactor",
  		cat: "faith",
  		tab: 1,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 15000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 15000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 7500,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "mana_reactors",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 0.5
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "mana",
  				value: 1250
  			}
  		]
  	},
  	{
  		id: "store",
  		cat: "warehouse",
  		tab: 1,
  		age: 1,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 500,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 300,
  				multi: 1.4
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 150,
  				multi: 1.4
  			},
  			{
  				type: "tech",
  				id: "storage",
  				value: 1
  			}
  		],
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
  			},
  			{
  				type: "cap",
  				id: "copper",
  				value: 250
  			},
  			{
  				type: "cap",
  				id: "iron",
  				value: 250
  			}
  		]
  	},
  	{
  		id: "ancient_vault",
  		cat: "warehouse",
  		tab: 1,
  		age: 100,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 400,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 400,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 200,
  				multi: 1.3
  			},
  			{
  				type: "tech",
  				id: "ancient_stockpile",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "research",
  				value: 500
  			},
  			{
  				type: "cap",
  				id: "gold",
  				value: 250
  			},
  			{
  				type: "cap",
  				id: "wood",
  				value: 250
  			},
  			{
  				type: "cap",
  				id: "stone",
  				value: 250
  			},
  			{
  				type: "cap",
  				id: "faith",
  				value: 250
  			},
  			{
  				type: "cap",
  				id: "mana",
  				value: 250
  			}
  		]
  	},
  	{
  		id: "large_warehouse",
  		cat: "warehouse",
  		tab: 1,
  		age: 2,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 2000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 1000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 500,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 400,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 400,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "large_storage_space",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "wood",
  				value: 1200
  			},
  			{
  				type: "cap",
  				id: "stone",
  				value: 1200
  			},
  			{
  				type: "cap",
  				id: "copper",
  				value: 600
  			},
  			{
  				type: "cap",
  				id: "iron",
  				value: 600
  			},
  			{
  				type: "cap",
  				id: "tools",
  				value: 600
  			}
  		]
  	},
  	{
  		id: "storage_facility",
  		cat: "warehouse",
  		tab: 1,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 3000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 2000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 1000,
  				multi: 1.3
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 700,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 700,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "storage_district",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "wood",
  				value: 2500
  			},
  			{
  				type: "cap",
  				id: "stone",
  				value: 2500
  			},
  			{
  				type: "cap",
  				id: "copper",
  				value: 1500
  			},
  			{
  				type: "cap",
  				id: "iron",
  				value: 1500
  			},
  			{
  				type: "cap",
  				id: "tools",
  				value: 1500
  			}
  		]
  	},
  	{
  		id: "guarded_storehouse",
  		cat: "warehouse",
  		tab: 1,
  		age: 3,
  		req: [
  			{
  				type: "resource",
  				id: "iron",
  				value: 3000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 1000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 1500,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "storing_valuable_materials",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "building_material",
  				value: 400
  			},
  			{
  				type: "cap",
  				id: "steel",
  				value: 400
  			},
  			{
  				type: "cap",
  				id: "supplies",
  				value: 200
  			},
  			{
  				type: "cap",
  				id: "saltpetre",
  				value: 200
  			},
  			{
  				type: "cap",
  				id: "crystal",
  				value: 100
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "guarded_facility",
  		cat: "warehouse",
  		tab: 1,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "iron",
  				value: 4000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 1500,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 2000,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "storage_district",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "building_material",
  				value: 1000
  			},
  			{
  				type: "cap",
  				id: "steel",
  				value: 1000
  			},
  			{
  				type: "cap",
  				id: "supplies",
  				value: 800
  			},
  			{
  				type: "cap",
  				id: "saltpetre",
  				value: 800
  			},
  			{
  				type: "cap",
  				id: "crystal",
  				value: 500
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 4
  			}
  		]
  	},
  	{
  		id: "natronite_depot",
  		cat: "warehouse",
  		tab: 1,
  		age: 4,
  		req: [
  			{
  				type: "resource",
  				id: "steel",
  				value: 2500,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1500,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "natronite_storage",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "natronite",
  				value: 600
  			}
  		]
  	},
  	{
  		id: "logistic_center",
  		cat: "warehouse",
  		tab: 1,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 20000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 8500,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 8000,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "mass_transit",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: 0.6
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 0.3
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.1
  			},
  			{
  				type: "cap",
  				id: "iron",
  				value: 2000
  			},
  			{
  				type: "cap",
  				id: "copper",
  				value: 2000
  			},
  			{
  				type: "cap",
  				id: "natronite",
  				value: 1000
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "colony_hall",
  		cat: "living_quarters",
  		tab: 2,
  		cap: 15,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 30000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 25000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 10000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 8000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 2500,
  				multi: 1.1
  			},
  			{
  				type: "tech",
  				id: "the_journey",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "farmer",
  				value: 2
  			},
  			{
  				type: "population",
  				id: "lumberjack",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "quarryman",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: -10
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: -5
  			},
  			{
  				type: "cap",
  				id: "food",
  				value: 500
  			},
  			{
  				type: "cap",
  				id: "wood",
  				value: 5000
  			},
  			{
  				type: "cap",
  				id: "stone",
  				value: 5000
  			},
  			{
  				type: "cap",
  				id: "copper",
  				value: 3000
  			},
  			{
  				type: "cap",
  				id: "iron",
  				value: 3000
  			},
  			{
  				type: "cap",
  				id: "tools",
  				value: 3000
  			}
  		]
  	},
  	{
  		id: "builders_complex",
  		cat: "resource",
  		tab: 2,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 22000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 16000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 8000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 3000,
  				multi: 1.1
  			},
  			{
  				type: "tech",
  				id: "colonial_exploitations",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "lumberjack",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "quarryman",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "lumberjack",
  				type_gen: "resource",
  				gen: "wood",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "quarryman",
  				type_gen: "resource",
  				gen: "stone",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "wood",
  				value: 7500
  			},
  			{
  				type: "cap",
  				id: "stone",
  				value: 7500
  			}
  		]
  	},
  	{
  		id: "artisans_complex",
  		cat: "resource",
  		tab: 2,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 22000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 10000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 10000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 3000,
  				multi: 1.1
  			},
  			{
  				type: "tech",
  				id: "artisan_complex",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "miner",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "artisan",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "miner",
  				type_gen: "resource",
  				gen: "copper",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "miner",
  				type_gen: "resource",
  				gen: "iron",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "artisan",
  				type_gen: "resource",
  				gen: "tools",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "copper",
  				value: 5000
  			},
  			{
  				type: "cap",
  				id: "iron",
  				value: 5000
  			},
  			{
  				type: "cap",
  				id: "tools",
  				value: 5000
  			}
  		]
  	},
  	{
  		id: "elf_village",
  		cat: "living_quarters",
  		tab: 2,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 80000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 10000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 10000,
  				multi: 1.1
  			},
  			{
  				type: "tech",
  				id: "elf_last_village",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "food",
  				value: 500
  			},
  			{
  				type: "cap",
  				id: "crystal",
  				value: 500
  			},
  			{
  				type: "cap",
  				id: "mana",
  				value: 250
  			},
  			{
  				type: "cap",
  				id: "horse",
  				value: 200
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 5
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "elf_encampment",
  		cat: "science",
  		tab: 2,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 50000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 7000,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "elf_survivors",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 1.5
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1.5
  			},
  			{
  				type: "cap",
  				id: "research",
  				value: 2000
  			},
  			{
  				type: "cap",
  				id: "mana",
  				value: 2000
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "dock",
  		cat: "resource",
  		tab: 2,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 15000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 12000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 7000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 1200,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "productive_hub",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "colonial_docks",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "fisher",
  				value: 2
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "fisher",
  				type_gen: "resource",
  				gen: "food",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "merchant",
  				type_gen: "resource",
  				gen: "gold",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "food",
  				value: 500
  			}
  		]
  	},
  	{
  		id: "refinery",
  		cat: "resource",
  		tab: 2,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 25000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 15000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 7500,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 4500,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 1400,
  				multi: 1.1
  			},
  			{
  				type: "tech",
  				id: "productive_hub",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "overseas_refinery",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "carpenter",
  				type_gen: "resource",
  				gen: "building_material",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "steelworker",
  				type_gen: "resource",
  				gen: "steel",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "alchemist",
  				type_gen: "resource",
  				gen: "saltpetre",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "natro_refiner",
  				type_gen: "resource",
  				gen: "natronite",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "natronite",
  				value: 250
  			}
  		]
  	},
  	{
  		id: "custom_house",
  		cat: "commercial_area",
  		tab: 2,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 30000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 25000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 10000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 1500,
  				multi: 1.1
  			},
  			{
  				type: "tech",
  				id: "productive_hub",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "colonial_trade",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "merchant",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "trader",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "merchant",
  				type_gen: "resource",
  				gen: "gold",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "trader",
  				type_gen: "resource",
  				gen: "gold",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "gold",
  				value: 5000
  			}
  		]
  	},
  	{
  		id: "estates",
  		cat: "resource",
  		tab: 2,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "food",
  				value: 8000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 6000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 1500,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "cow",
  				value: 1000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 500,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "productive_hub",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "landed_estates",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "farmer",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "breeder",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "supplier",
  				value: 1
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "farmer",
  				type_gen: "resource",
  				gen: "food",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "breeder",
  				type_gen: "resource",
  				gen: "cow",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "breeder",
  				type_gen: "resource",
  				gen: "horse",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "food",
  				value: 500
  			},
  			{
  				type: "cap",
  				id: "cow",
  				value: 400
  			},
  			{
  				type: "cap",
  				id: "horse",
  				value: 200
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 10
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "trench",
  		cat: "defense",
  		tab: 2,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 30000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 10000,
  				multi: 1.2
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 8000,
  				multi: 1.2
  			},
  			{
  				type: "tech",
  				id: "trenches",
  				value: 1
  			}
  		],
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
  		id: "shed",
  		cat: "warehouse",
  		tab: 2,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 20000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 16000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 9000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 2500,
  				multi: 1.1
  			},
  			{
  				type: "tech",
  				id: "the_journey",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "building_material",
  				value: 1000
  			},
  			{
  				type: "cap",
  				id: "steel",
  				value: 1000
  			},
  			{
  				type: "cap",
  				id: "supplies",
  				value: 750
  			},
  			{
  				type: "cap",
  				id: "saltpetre",
  				value: 750
  			},
  			{
  				type: "cap",
  				id: "crystal",
  				value: 500
  			}
  		]
  	},
  	{
  		id: "large_shed",
  		cat: "warehouse",
  		tab: 2,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 32000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 22000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 14000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 3000,
  				multi: 1.1
  			},
  			{
  				type: "tech",
  				id: "large_shed_t",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "wood",
  				value: 10000
  			},
  			{
  				type: "cap",
  				id: "stone",
  				value: 10000
  			},
  			{
  				type: "cap",
  				id: "copper",
  				value: 7500
  			},
  			{
  				type: "cap",
  				id: "iron",
  				value: 7500
  			},
  			{
  				type: "cap",
  				id: "tools",
  				value: 7500
  			}
  		]
  	},
  	{
  		id: "statue_virtue",
  		cat: "wonders",
  		tab: 2,
  		cap: 1,
  		age: 5,
  		req: [
  			{
  				type: "building",
  				id: "statue_virtue_part",
  				value: 20,
  				consume: true
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 350,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 15,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 15,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 15,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 15,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 15,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 15,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 15,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 30
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 15
  			},
  			{
  				type: "resource",
  				id: "gem",
  				value: 1,
  				fix: true
  			}
  		]
  	},
  	{
  		id: "statue_virtue_part",
  		cat: "wonders",
  		tab: 2,
  		cap: 20,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 140000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 200000
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 100000
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 50000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 25000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 15000
  			},
  			{
  				type: "tech",
  				id: "port_statue",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "military_camp",
  		cat: "defense",
  		tab: 2,
  		cap: 15,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 30000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 15000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 5000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 1200,
  				multi: 1.1
  			},
  			{
  				type: "tech",
  				id: "colonial_camp",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "quartermaster",
  				value: 1
  			},
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
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 5
  			}
  		]
  	},
  	{
  		id: "stronghold",
  		cat: "defense",
  		tab: 2,
  		cap: 15,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 30000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 10000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 8000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 2500,
  				multi: 1.1
  			},
  			{
  				type: "tech",
  				id: "colonial_stronghold",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "modifier",
  				type_id: "army",
  				id: "settlement_defenses",
  				type_gen: "stat",
  				gen: "defense",
  				value: 25,
  				perc: false
  			},
  			{
  				type: "cap",
  				id: "food",
  				value: 1500
  			},
  			{
  				type: "cap",
  				id: "supplies",
  				value: 1500
  			},
  			{
  				type: "cap",
  				id: "natronite",
  				value: 500
  			}
  		]
  	},
  	{
  		id: "colony_recruiting_camp",
  		cat: "defense",
  		tab: 2,
  		cap: 15,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 35000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 18000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 5000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 2000,
  				multi: 1.1
  			},
  			{
  				type: "tech",
  				id: "colonial_recruits",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "quartermaster",
  				value: 1
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
  				type: "cap",
  				id: "army",
  				value: 10
  			}
  		]
  	},
  	{
  		id: "fortified_citadel",
  		cat: "wonders",
  		tab: 2,
  		cap: 1,
  		age: 5,
  		req: [
  			{
  				type: "building",
  				id: "fortified_citadel_part",
  				value: 20,
  				consume: true
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 350,
  				fix: true
  			},
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
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 50
  			},
  			{
  				type: "resource",
  				id: "gem",
  				value: 1,
  				fix: true
  			}
  		]
  	},
  	{
  		id: "fortified_citadel_part",
  		cat: "wonders",
  		tab: 2,
  		cap: 20,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 200000
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 100000
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 50000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 25000
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 25000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 15000
  			},
  			{
  				type: "tech",
  				id: "fortified_colony",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "pilgrim_camp",
  		cat: "faith",
  		tab: 2,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 12000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 5000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 1500,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 1500,
  				multi: 1.1
  			},
  			{
  				type: "tech",
  				id: "faith_world",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 1
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
  			},
  			{
  				type: "cap",
  				id: "food",
  				value: 500
  			},
  			{
  				type: "cap",
  				id: "faith",
  				value: 500
  			},
  			{
  				type: "cap",
  				id: "mana",
  				value: 250
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "church_old_gods",
  		cat: "faith",
  		tab: 2,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 15000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 8000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 6000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 2500,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 2500,
  				multi: 1.1
  			},
  			{
  				type: "tech",
  				id: "new_old_gods",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 3
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 3
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 3
  			},
  			{
  				type: "cap",
  				id: "faith",
  				value: 1500
  			},
  			{
  				type: "cap",
  				id: "mana",
  				value: 1000
  			},
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
  		id: "mana_extractors",
  		cat: "faith",
  		tab: 2,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "steel",
  				value: 12000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 12000,
  				multi: 1.1
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 2500,
  				multi: 1.1
  			},
  			{
  				type: "tech",
  				id: "mana_investigation",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "harvester",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 3
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "cap",
  				id: "mana",
  				value: 2000
  			}
  		]
  	},
  	{
  		id: "holy_site",
  		cat: "wonders",
  		tab: 2,
  		cap: 1,
  		age: 5,
  		req: [
  			{
  				type: "building",
  				id: "holy_site_part",
  				value: 20,
  				consume: true
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 350,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 25,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 25,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 25,
  				perc: true
  			},
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
  			},
  			{
  				type: "resource",
  				id: "gem",
  				value: 1,
  				fix: true
  			}
  		]
  	},
  	{
  		id: "holy_site_part",
  		cat: "wonders",
  		tab: 2,
  		cap: 20,
  		age: 5,
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 200000
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 25000
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 20000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 17500
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 15000
  			},
  			{
  				type: "tech",
  				id: "colonial_consacration",
  				value: 1
  			}
  		]
  	}
  ];

  var factions = [
  	{
  		id: "nightdale_protectorate",
  		found: [
  			1,
  			2,
  			3,
  			4,
  			5
  		],
  		relationship: 30,
  		esp: 30,
  		level: 5,
  		reqDelegation: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 500
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 500
  			}
  		],
  		reqImproveRelationship: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 5000
  			}
  		],
  		commercial: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -15
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 4
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 4
  			}
  		],
  		alliance: [
  			{
  				type: "resource",
  				id: "wood",
  				value: 4
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 4
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 5
  			}
  		],
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
  		]
  	},
  	{
  		id: "theresmore_wanders",
  		found: [
  			6,
  			7,
  			8,
  			9,
  			10
  		],
  		relationship: 30,
  		esp: 20,
  		level: 5,
  		reqDelegation: [
  			{
  				type: "resource",
  				id: "food",
  				value: 2000
  			}
  		],
  		reqImproveRelationship: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 5000
  			}
  		],
  		commercial: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -15
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 0.5
  			}
  		],
  		alliance: [
  			{
  				type: "resource",
  				id: "food",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 0.5
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 5
  			}
  		],
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
  		]
  	},
  	{
  		id: "western_kingdom",
  		found: [
  			11,
  			12,
  			13,
  			14,
  			15
  		],
  		relationship: 50,
  		esp: 50,
  		level: 5,
  		reqDelegation: [
  			{
  				type: "resource",
  				id: "iron",
  				value: 500
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 500
  			}
  		],
  		reqImproveRelationship: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 5000
  			}
  		],
  		commercial: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -20
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 3
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 2
  			}
  		],
  		alliance: [
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
  				id: "tools",
  				value: 1
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 5
  			}
  		],
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
  		]
  	},
  	{
  		id: "zultan_emirate",
  		found: [
  			16,
  			17,
  			18,
  			19,
  			20
  		],
  		relationship: 50,
  		esp: 40,
  		level: 5,
  		reqDelegation: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2000
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 500
  			}
  		],
  		reqImproveRelationship: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 5000
  			}
  		],
  		commercial: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -15
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 5
  			}
  		],
  		alliance: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 5
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 5
  			}
  		],
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
  		]
  	},
  	{
  		id: "sssarkat_empire",
  		found: [
  			1,
  			2,
  			3,
  			4,
  			5
  		],
  		relationship: 30,
  		esp: 40,
  		level: 6,
  		reqFound: [
  			{
  				type: "tech",
  				id: "long_expedition",
  				value: 1
  			}
  		],
  		reqDelegation: [
  			{
  				type: "resource",
  				id: "food",
  				value: 5000
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 2500
  			}
  		],
  		reqImproveRelationship: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 25000
  			},
  			{
  				type: "resource",
  				id: "cow",
  				value: 1000
  			}
  		],
  		commercial: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -30
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 12
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 3
  			}
  		],
  		alliance: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 10
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 2
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 15
  			}
  		],
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
  		]
  	},
  	{
  		id: "scalerock_tribes",
  		found: [
  			6,
  			7,
  			8,
  			9,
  			10
  		],
  		relationship: 40,
  		esp: 50,
  		level: 6,
  		reqFound: [
  			{
  				type: "tech",
  				id: "long_expedition",
  				value: 1
  			}
  		],
  		reqDelegation: [
  			{
  				type: "resource",
  				id: "steel",
  				value: 3000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 1500
  			}
  		],
  		reqImproveRelationship: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 25000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 2000
  			}
  		],
  		commercial: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -30
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 1.5
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 1
  			}
  		],
  		alliance: [
  			{
  				type: "resource",
  				id: "building_material",
  				value: 1.5
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 1
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 15
  			}
  		],
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
  		]
  	},
  	{
  		id: "enso_multitude",
  		found: [
  			11,
  			12,
  			13,
  			14,
  			15
  		],
  		relationship: 50,
  		esp: 60,
  		level: 7,
  		reqFound: [
  			{
  				type: "tech",
  				id: "long_expedition",
  				value: 1
  			}
  		],
  		reqDelegation: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 8000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 8000
  			}
  		],
  		reqImproveRelationship: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 8000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 8000
  			}
  		],
  		commercial: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -50
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 3
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 1.5
  			}
  		],
  		alliance: [
  			{
  				type: "resource",
  				id: "natronite",
  				value: 2
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 2
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 15
  			}
  		],
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
  		]
  	},
  	{
  		id: "king_kobold_nation",
  		found: [
  			21,
  			22,
  			23,
  			24,
  			25
  		],
  		esp: 40,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "kobold_nation",
  				value: 1
  			}
  		],
  		relationship: 0,
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
  		]
  	},
  	{
  		id: "barbarian_horde",
  		found: [
  			26,
  			27,
  			28,
  			29,
  			30
  		],
  		esp: 40,
  		level: 6,
  		reqFound: [
  			{
  				type: "tech",
  				id: "barbarian_tribes",
  				value: 1
  			}
  		],
  		relationship: 0,
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
  		]
  	},
  	{
  		id: "army_of_the_dead",
  		found: [
  			0
  		],
  		relationship: 0,
  		army: [
  			{
  				id: "skeleton",
  				value: 1500
  			},
  			{
  				id: "zombie",
  				value: 700
  			}
  		]
  	},
  	{
  		id: "army_of_goblin",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		]
  	},
  	{
  		id: "army_of_dragon",
  		found: [
  			0
  		],
  		relationship: 0,
  		army: [
  			{
  				id: "red_dragon",
  				value: 1
  			},
  			{
  				id: "draconic_warrior",
  				value: 100
  			}
  		]
  	},
  	{
  		id: "fallen_angel_army_1",
  		found: [
  			0
  		],
  		relationship: 0,
  		army: [
  			{
  				id: "fallen_angel",
  				value: 1
  			},
  			{
  				id: "demonic_musketeer",
  				value: 120
  			}
  		]
  	},
  	{
  		id: "fallen_angel_army_2",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		]
  	},
  	{
  		id: "orc_war_party_1",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		hidden: true
  	},
  	{
  		id: "orc_war_party_2",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		hidden: true
  	},
  	{
  		id: "orc_war_party_3",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		hidden: true
  	},
  	{
  		id: "orc_war_party_4",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		hidden: true
  	},
  	{
  		id: "orc_war_party_5",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		hidden: true
  	},
  	{
  		id: "orc_war_party_6",
  		found: [
  			0
  		],
  		relationship: 0,
  		army: [
  			{
  				id: "orc_warrior",
  				value: 30
  			}
  		],
  		hidden: true
  	},
  	{
  		id: "orc_war_party_7",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		hidden: true
  	},
  	{
  		id: "orc_war_party_8",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		hidden: true
  	},
  	{
  		id: "orc_war_party_9",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		hidden: true
  	},
  	{
  		id: "orc_war_party_10",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		hidden: true
  	},
  	{
  		id: "orc_war_party_11",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		hidden: true
  	},
  	{
  		id: "orc_war_party_12",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		hidden: true
  	},
  	{
  		id: "orc_war_party_13",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		hidden: true
  	},
  	{
  		id: "orc_war_party_14",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		hidden: true
  	},
  	{
  		id: "orc_war_party_15",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		hidden: true
  	},
  	{
  		id: "orc_war_party_16",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		hidden: true
  	},
  	{
  		id: "orc_horde_boss",
  		found: [
  			0
  		],
  		relationship: 0,
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
  		]
  	}
  ];

  var en = {
  	achievements: "Achievements",
  	achievements_empty: "You have to work on it a bit",
  	all_resources: "All resources",
  	ancestor: "Ancestor",
  	armies: "Armies",
  	army: "Army",
  	army_attack: "Attack",
  	army_defense: "Defense",
  	army_empty: "You have no soldier to train",
  	army_hitpoint: "Hitpoints",
  	ascension: "Ascension",
  	attack_empty: "You have no soldier to send",
  	attack: "Attack",
  	attack_abbr: "Att",
  	battery_life: "Battery life",
  	battery_mode: "Battery Mode",
  	beta_message: "Please note that this is a beta version of Theresmore, things may change drastically during the development and your save could break. Play at your own risk!",
  	beta_version: "Beta Version",
  	boss_fight: "This research will lead to a confrontation with the boss of this era, are you ready for battle? Do you have enough men in garrison?",
  	build: "Build",
  	build_empty: "You have nothing to build",
  	builder: "Building",
  	builder_description: "Master builders, your ancestors erected more than one monolith in honor of the ancient gods",
  	buy: "Buy",
  	cancel: "Cancel",
  	cap: "Cap",
  	changelog: "Changelog",
  	colony: "Colony",
  	completed: "Completed",
  	confirm: "Confirm",
  	confirm_reward_ad_title: "Support our devs!",
  	confirm_reward_ad_description: "Theresmore is completely free! To help our devs make the game even better you can watch an ad and get this random reward:",
  	dark_mode: "Dark mode",
  	dark_light_mode: "Dark / Light mode",
  	defeat: "You have been defeated!",
  	defense: "Defense",
  	defense_abbr: "Def",
  	defense_empty: "You have no soldier",
  	died: "Died",
  	difficulty: "Difficulty",
  	difficulty_0: "Normal",
  	difficulty_1: "Hard",
  	difficulty_2: "Impossible",
  	diplomacy: "Diplomacy",
  	dismiss: "Dismiss",
  	donate: "Donate",
  	donate_all: "Donate all",
  	enable_notifications: "Enable notifications",
  	enemies: "Enemies",
  	enemies_empty: "You haven't conquered any enemies yet",
  	explore: "Explore",
  	farmer_bonus: "Farmer bonus",
  	garrison: "Garrison",
  	hard_reset: "Hard reset",
  	hard_reset_confirm_1: "This operation will delete all game data and they will no longer be recoverable, do you confirm you want to continue?",
  	hard_reset_confirm_2: "All your progress will be lost and you'll have to start the game over from the beginning, are you sure you want to continue?",
  	hard_reset_confirm_3: "If you confirm, a deletion of all game data will be performed, do you want to continue?",
  	humans: "Humans",
  	humans_description: "Skilled diplomats and expert merchants, their curiosity drives them where others hesitate to venture",
  	killed: "You killed",
  	legacy_points: "Legacy points",
  	light_portal_of_the_dead: "Light Portal of the Dead",
  	load_from_backup_confirm_1: "This operation will reset the current game and return you to the ancestor choice after you have made the last prestige. Do you confirm you want to continue?",
  	load_from_backup_confirm_2: "All your progress will be lost and you'll have to start the game from your last prestige, are you sure you want to continue?",
  	load_from_backup_confirm_3: "If you confirm, a deletion of this game data will be performed, do you want to continue?",
  	load_from_clipboard: "Import from clipboard",
  	load_from_textarea: "Import pasted text",
  	load_from_textarea_description: "Paste the save in the box below and press the import button",
  	loading: "Loading",
  	magic: "Magic",
  	main_build: "City",
  	mausoleum_description: "To please the gods and be able to meet them, we must offer a consideration of 1,000,000 resources. Each of them has a different value to the gods as can be seen below",
  	mausoleum_donation_total: "Total donations value",
  	mausoleum_donation_value: "Value",
  	no_attackable_enemy: "You have no enemy to attack",
  	no_spy_enemy: "You have no enemy to spy",
  	no_requirements: "No requirements",
  	open_achievements: "Open achievements",
  	paste_message: "Click here to paste a save",
  	paste_message_click: "Press Ctrl+V to paste a save",
  	paste_success: "The game has been loaded from the save, please wait...",
  	paste_error: "Unable to load game from the save",
  	performance: "Performance",
  	population: "Population",
  	population_empty: "Your people still don't have jobs",
  	prayers: "Prayers",
  	prayer_empty: "There are no prayers at the moment",
  	prestige: "Prestige",
  	research: "Research",
  	reward_canceled: "Reward canceled, try again later",
  	runstart_subtitle: "The world of Theresmore awaits",
  	runstart_subtitle_2: "Your ancestors are well known for:",
  	save_to_clipboard: "Save to clipboard",
  	save_to_clipboard_success: "The game has been saved to the clipboard",
  	save_to_file: "Save to file",
  	save_to_file_success: "The game has been saved to file",
  	scout_empty: "You have no scout to send",
  	select_enemy: "Select an enemy to attack",
  	select_spy: "Select an enemy to spy",
  	sell: "Sell",
  	send_to_attack: "Send to attack",
  	send_to_explore: "Send to explore",
  	send_to_spy: "Send to spy",
  	settings: "Settings",
  	show_cap_buildings: "Show buildings at cap",
  	soft_reset: "Soft reset",
  	soft_reset_confirm_1: "This is a form of prestige. Each time you perform a prestige you will get a permanent bonus to any production and gain Legacy points (from your Fame) that you can spend on permanent bonuses. The prestige resets all progress made so far (except achievements, stats and legacy bonuses) and restarts a new game",
  	soft_reset_confirm_2: "This will reset all your progress in this game",
  	soft_reset_confirm_3: "Do you understand what will happen?",
  	soft_reset_2_confirm: "Are you ready to stop the army of the dead? Theresmore and its kingdoms are counting on you for their survival",
  	soft_reset_description_1_true: "Glorious retirement is Theresmore's first form of prestige. Each time you perform a prestige you will get a permanent bonus to any production and gain Legacy points (from your Fame) that you can spend on the permanent bonuses you see below. The prestige resets all progress made so far (except achievements, stats and legacy bonuses) and restarts a new game",
  	soft_reset_description_2_true: "You have defeated the army of the dead and Theresmore is saved from the undead scourge. Beating them you got 1 RELIC. You can continue playing or choose to prestige thanks to your glorious victory! Each time you perform a prestige you will get a permanent bonus to any production and gain Legacy points that you can spend on the permanent bonuses you see below. The prestige resets all progress made so far (except achievements, stats and legacy bonuses) and restarts a new game",
  	soft_reset_description_2_false: "The army of the dead has emerged from the portal and overwhelmed your defenses and your city. One by one, all the kingdoms of Theresmore have fallen and now the land is prey to the dead. Each time you perform a prestige you will get a permanent bonus to any production and gain Legacy points that you can spend on the permanent bonuses you see below. The prestige resets all progress made so far (except achievements, stats and legacy bonuses) and restarts a new game",
  	soft_reset_description_3_true: "You have economically conquered all of Theresmore and no kingdom will ever escape your manipulation again. Through this prestige in addition to Legacy you will gain 1 COIN. Each time you perform a prestige you will get a permanent bonus to any production and gain Legacy points (from your Fame) that you can spend on the permanent bonuses you see below. The prestige resets all progress made so far (except achievements, stats and legacy bonuses) and restarts a new game",
  	soft_reset_description_4_true: "The gods welcome you into their midst, and the problems of earthly life seem only a vague memory. As for now, you can devote yourself to eternal pleasure, but soon they will need you on Theresmore. Through this prestige in addition to Legacy you will gain 1 TOME OF WISDOM. Each time you perform a prestige you will get a permanent bonus to any production and gain Legacy points that you can spend on the permanent bonuses you see below. The prestige resets all progress made so far (except achievements, stats and legacy bonuses) and restarts a new game",
  	soft_reset_description_5_false: "Suddenly sounds of horns, howls and battle cries shatter the stillness of the night. Soldiers rush to the defenses but goblin wolfriders are already all around them. Arrows as black as night strike the garrison and their poison acts quickly. The goblins swarm into the settlement looting and destroying everything you had so hard built. If only we had had more defenses and a stronger garrison we could have destroyed these damned green-skinned. You were defeated, but that's not the end of Theresmore! Thanks to the fame you have accumulated so far, you can spend legacy point to buy special permanent perks that will help you for all the upcoming games",
  	soft_reset_description_6_false: "Once again our valiant soldiers will close ranks, ready to give battle. The red dragon looms over the city and its draconic servants engage in a ruthless battle on the city walls. Your soldiers fight bravely until the dragon decides to end the battle. His fiery breath destroys the ramparts annihilating anyone in his path. Entire districts of the city burn and civilians fight for their very lives. Everything is now screaming, destruction and ashes. The battle is lost. You were defeated, but that's not the end of Theresmore! Thanks to the fame you have accumulated so far, you can spend legacy point to buy special permanent perks that will help you for all the upcoming games",
  	soft_reset_description_7_false: "Soldiers in the city are making light of what happened when screams are heard coming from the city walls. Before long batteries of muskets are firing, and our garrison, taken by surprise, is mowed down by enemy lead. A being in armor with big black wings flies over an army of demons armed with muskets. Before destroying the city he says these words : thank you for trusting me and secretly arming my legion, now I will give you the justice that only a fallen angel possesses! You were defeated, but that's not the end of Theresmore! Thanks to the fame you have accumulated so far, you can spend legacy point to buy special permanent perks that will help you for all the upcoming games",
  	soft_reset_description_8_false: "Our city was ready to repel the onslaught but for all the gods those monstrosities were too much for any Theresmore army. First they swarmed toward the city the lesser demons that gasped fire and incinerated our defenses, finally at a command from the Fallen Angel they charged the greater demons. Ten-foot-tall monsters hurled helpless soldiers into the air and others were mauled by those abominations. The Fallen Angel laughed and the laughter of his vengeance could be heard throughout the city. You were defeated, but that's not the end of Theresmore! Thanks to the fame you have accumulated so far, you can spend legacy point to buy special permanent perks that will help you for all the upcoming games",
  	soft_reset_description_9_false: "The once proud fortresses of the Orcish nation lay in ruins, and the horde set out on a final, desperate charge. With fire in their eyes and weapons in their hands, they launched themselves against our walls, seeking to break through. The armies of the free peoples, honed by centuries of battle against the most fearsome foes, stood their ground and battled the orcs for days. The fate of the free and the bloodthirsty hung in the balance, and the outcome was uncertain. But then, a breach was made, and the end seemed near. The humans fought with all their might, knowing that defeat would mean enslavement or worse. The orcish horde stormed forward, a relentless tide of destruction. The last bastion of freedom held fast, but eventually, with a mournful crash, it fell. Theresmore was no more, and the humans were doomed. The only thing that remained was a bitter memory of the battle, a reminder of the sacrifice made by those who fought for freedom and of the hope that had once burned bright, but now lay forever extinguished. You were defeated, but that's not the end of Theresmore! Thanks to the fame you have accumulated so far, you can spend legacy point to buy special permanent perks that will help you for all the upcoming games",
  	soft_reset_in_progress: "Prestige in progress",
  	spells: "Spells",
  	spells_empty: "There are no spells at the moment",
  	spy: "Spy",
  	spy_empty: "You have no spy to send",
  	start_game: "Enter",
  	statistics: "Statistics",
  	stone: "Stone",
  	structures_cost: "Structures cost",
  	support_us: "Support",
  	tech_empty: "Your researchers have nothing to research",
  	theresmore_richest_nation: "Theresmore Richest Nation",
  	unlocked: "Unlocked",
  	victory: "Victory!",
  	warning: "Warning",
  	wood: "Wood",
  	one: "One",
  	a_few: "A few",
  	some: "Some",
  	a_lot: "A lot of",
  	a_plethora: "A plethora of",
  	a_legion: "A legion of",
  	ads_reward_prod1_description: "150% more production of food, wood and stone for 5 minutes",
  	ads_reward_prod2_description: "300% more production of gold for 5 minutes",
  	ads_reward_prod3_description: "300% more production of research for 5 minutes",
  	ads_reward_prod4_description: "150% more production of copper, iron and tools for 5 minutes",
  	ads_reward_prod5_description: "150% more production of materials and steel for 5 minutes",
  	ads_reward_prod6_description: "150% more production of crystal and supplies for 5 minutes",
  	ads_reward_prod7_description: "150% more production of saltpetre and natronite for 5 minutes",
  	ads_reward_flat1_description: "Refill the cap of wood and stone to a maximum of 50k",
  	ads_reward_flat2_description: "Refill the cap of copper and iron to a maximum of 25k",
  	ads_reward_flat3_description: "Refill the cap of tools to a maximum of 25k",
  	ads_reward_flat4_description: "Refill the cap of materials and steel to a maximum of 10k",
  	ads_reward_flat5_description: "Refill the cap of crystal and supplies to a maximum of 10k",
  	ads_reward_flat6_description: "You gain 50 of Fame!",
  	ads_reward_flat7_description: "Refill the cap of research to a maximum of 100k",
  	ads_reward_flat8_description: "Refill the cap of gold to a maximum of 100k",
  	ancestor_farmer: "Farming",
  	ancestor_farmer_description: "Your ancestors have mastered the best farming techniques and food will never be a problem for your people",
  	ancestor_believer: "Believing",
  	ancestor_believer_description: "Your ancestors knew how to speak to the gods, they had many blessings",
  	ancestor_forager: "Foraging",
  	ancestor_forager_description: "Your ancestors knew how to rule animals and supplies will not be lacking",
  	ancestor_gatherer: "Gathering",
  	ancestor_gatherer_description: "Your ancestors knew the best places to cut good wood and dig the finest stone",
  	ancestor_miner: "Mining",
  	ancestor_miner_description: "Your ancestors knew how to refine metals and they used tools of rare workmanship",
  	ancestor_researcher: "Researching",
  	ancestor_researcher_description: "Your ancestors were cultured and erudite, Theresmore had few secrets for them",
  	ancestor_spellcrafter: "Spellcrafting",
  	ancestor_spellcrafter_description: "Your ancestors knew how to manage mana and spells flowed out of their mouths",
  	ancestor_trader: "Trading",
  	ancestor_trader_description: "Your ancestors knew how to make money, their caravans crossed Theresmore",
  	ancestor_warrior: "War Skilling",
  	ancestor_warrior_description: "Your ancestors knew how to make war, great leaders of warrior tribes",
  	bui_academy_of_freethinkers: "Academy of Freethinkers",
  	bui_academy_of_freethinkers_description: "Freethinkers will bring us into the modern age",
  	bui_academy_of_freethinkers_part: "A. of Freethinkers Part",
  	bui_academy_of_freethinkers_part_description: "A part of the Academy of Freethinkers",
  	bui_alchemic_laboratory: "Alchemical laboratory",
  	bui_alchemic_laboratory_description: "Produce alchemist for saltpetre",
  	bui_altar_of_sacrifices: "Altar of sacrifices",
  	bui_altar_of_sacrifices_description: "Death will please the gods",
  	bui_artillery_firing: "Artillery firing range",
  	bui_artillery_firing_description: "A place to do ballistic training",
  	bui_artisans_complex: "Artisan complex",
  	bui_artisans_complex_description: "Raw metal refining center and handicrafts",
  	bui_artisan_workshop: "Artisan Workshop",
  	bui_artisan_workshop_description: "The tools these artisans produce will be the manufacturing focus of the settlement",
  	bui_ancient_vault: "Ancient vault",
  	bui_ancient_vault_description: "Where ancient knowledge is stored",
  	bui_arch_triumph: "Arch of Triumph",
  	bui_arch_triumph_description: "Si vis pacem, para bellum",
  	bui_arch_triumph_part: "Arch of Triumph part",
  	bui_arch_triumph_part_description: "A part of the Arch of Triumph",
  	bui_automated_complex: "Automated Complex",
  	bui_automated_complex_description: "A fully automated building. A marvel of human genius",
  	bui_automated_complex_part: "Automated Complex p.",
  	bui_automated_complex_part_description: "A part of the Automated Complex",
  	bui_ballista: "Ballista",
  	bui_ballista_description: "Ballista will stop even the biggest enemies",
  	bui_barracks: "Barracks",
  	bui_barracks_description: "Citizens will feel protected with a couple of guards around",
  	bui_bank: "Bank",
  	bui_bank_description: "A money generator for our city",
  	bui_builder_district: "Builder district",
  	bui_builder_district_description: "An area where our builders can join together",
  	bui_builders_complex: "Builders complex",
  	bui_builders_complex_description: "Like a builder district but with much more space",
  	bui_books: "Books",
  	bui_books_description: "A part of the Library of SouLs",
  	bui_canava_trading: "Canava trading post",
  	bui_canava_trading_description: "From neighboring villages a network of markets to generate profit",
  	bui_carpenter_workshop: "Carpenter workshop",
  	bui_carpenter_workshop_description: "With the production of building materials we will be able to construct durable buildings",
  	bui_castrum_militia: "Castrum Militia",
  	bui_castrum_militia_description: "Militiamen will defend the settlement",
  	bui_cathedral: "Cathedral",
  	bui_cathedral_description: "A great place of worship and magic",
  	bui_cathedral_unit: "Cathedral part",
  	bui_cathedral_unit_description: "A part of the Cathedral",
  	bui_city_center: "City center",
  	bui_city_center_description: "Anyone who visits our city will be amazed by the splendor of our arts",
  	bui_city_center_unit: "City center part",
  	bui_city_center_unit_description: "A part of the City center",
  	bui_city_lights: "City of Lights",
  	bui_city_lights_description: "The city will be filled with lights and everyone can admire our technology",
  	bui_city_lights_part: "City of Lights part",
  	bui_city_lights_part_description: "A part of the City of Lights",
  	bui_city_hall: "City Hall",
  	bui_city_hall_description: "The administrative heart of the settlement",
  	bui_colony_hall: "Colony Hall",
  	bui_colony_hall_description: "The pulsing heart of the colony",
  	bui_colony_recruiting_camp: "Colony recruiting camp",
  	bui_colony_recruiting_camp_description: "New world forges new ways of fighting",
  	bui_conclave: "Conclave",
  	bui_conclave_description: "The order of clerics meets in these conclaves",
  	bui_common_house: "Common House",
  	bui_common_house_description: "A small place to live",
  	bui_credit_union: "Credit union",
  	bui_credit_union_description: "Traders can generate gold here",
  	bui_custom_house: "Custom house",
  	bui_custom_house_description: "Where the colony's goods are sold",
  	bui_church_old_gods: "Old Gods Church",
  	bui_church_old_gods_description: "The ancient gods also reign in this world",
  	bui_dock: "Dock",
  	bui_dock_description: "The dock provides a source of food and gold",
  	bui_elf_encampment: "Elf encampment",
  	bui_elf_encampment_description: "Proximity with Elves will make knowledge and magical arts flourish",
  	bui_elf_village: "Elf village",
  	bui_elf_village_description: "The home of the last elves of Theresmore",
  	bui_estates: "Estates",
  	bui_estates_description: "Our colony's estates where they cultivate and raise cattle. A rural guard protects them",
  	bui_factory: "Factory",
  	bui_factory_description: "The mass construction of everything we need",
  	bui_farm: "Farm",
  	bui_farm_description: "The peasants will feed our great nation",
  	bui_fiefdom: "Fiefdom",
  	bui_fiefdom_description: "The lord's lands produce food and raise pack animals",
  	bui_fortune_grove: "Fortune grove",
  	bui_fortune_grove_description: "Audentes fortuna iuvat",
  	bui_fountain_prosperity: "Fountain of Prosperity",
  	bui_fountain_prosperity_description: "A real boon for the city",
  	bui_foundry: "Foundry",
  	bui_foundry_description: "Copper, iron and tools in large numbers",
  	bui_fortified_citadel: "Fortified Citadel",
  	bui_fortified_citadel_description: "A fortress made of cannons, the bastion of humanity!",
  	bui_fortified_citadel_part: "Fortified Citadel part",
  	bui_fortified_citadel_part_description: "A part of the Fortified Citadel",
  	bui_gan_eden: "Gan Eden",
  	bui_gan_eden_description: "A Theresmore paradise where we can cultivate and thrive",
  	bui_granary: "Granary",
  	bui_granary_description: "More grains more food more army",
  	bui_guarded_storehouse: "Guarded warehouse",
  	bui_guarded_storehouse_description: "Our most precious goods are watched by soldiers",
  	bui_great_bombard: "Great bombard",
  	bui_great_bombard_description: "A majestic bombard will destroy enemies approaching the city",
  	bui_great_bombard_part: "Great bombard part",
  	bui_great_bombard_part_description: "A part of the Great bombard",
  	bui_great_fair: "Great fair",
  	bui_great_fair_description: "From every corner of Theresmore will come to buy and sell goods",
  	bui_great_fair_unit: "Great fair unit",
  	bui_great_fair_unit_description: "A part of the Great fair",
  	bui_grocery: "Grocery",
  	bui_grocery_description: "Converts food into supplies",
  	bui_guarded_facility: "Large warehouse",
  	bui_guarded_facility_description: "A guarded place in arms to protect the most valuable assets",
  	bui_guild_of_craftsmen: "Guild of craftsmen",
  	bui_guild_of_craftsmen_description: "as Pedro would say...SGRAVATO!",
  	bui_hall_of_the_dead: "Hall of the dead",
  	bui_hall_of_the_dead_description: "Almost free labor force",
  	bui_hall_of_wisdom: "Hall of wisdom",
  	bui_hall_of_wisdom_description: "The knowledge of the gods",
  	bui_hall_heroic_deeds: "Hall of heroic deeds",
  	bui_hall_heroic_deeds_description: "A hall to exhibit the legendary monsters",
  	bui_hall_heroic_deeds_part: "Hall of heroic deeds part",
  	bui_hall_heroic_deeds_part_description: "A part of the Hall of heroic deeds",
  	bui_harbor_district: "Harbor district",
  	bui_harbor_district_description: "A large port away from our native settlement",
  	bui_harbor_district_part: "Harbor district part",
  	bui_harbor_district_part_description: "A part of the Harbor district",
  	bui_harvest_shrine: "Harvest Shrine",
  	bui_harvest_shrine_description: "The shrine dedicated to the Mother Earth will help us feed and grow the settlement",
  	bui_holy_site: "Holy Site",
  	bui_holy_site_description: "The focal point of all the faithful in Theresmore",
  	bui_holy_site_part: "Holy Site part",
  	bui_holy_site_part_description: "A part of the Holy Site",
  	bui_industrial_plant: "Industrial plant",
  	bui_industrial_plant_description: "A definite boost to production",
  	bui_island_outpost: "Island outpost",
  	bui_island_outpost_description: "So many wonderful animal species!",
  	bui_large_shed: "Large shed",
  	bui_large_shed_description: "The fight against caps knows no boundaries",
  	bui_large_warehouse: "Large storehouse",
  	bui_large_warehouse_description: "A building to store large quantities of goods",
  	bui_library_souls: "Library of SouLs",
  	bui_library_souls_description: "By reading library books, the hapless scholars lose a piece of their soul, become partially undead",
  	bui_library_of_theresmore: "Library of Theresmore",
  	bui_library_of_theresmore_description: "The place where ancient knowledge is preserved",
  	bui_logistic_center: "Logistic center",
  	bui_logistic_center_description: "A logistics hub to handle military goods and supplies",
  	bui_lumberjack_camp: "Lumberjack Camp",
  	bui_lumberjack_camp_description: "Wood is the resource on which we will base our city",
  	bui_machines_of_gods: "Machines of gods",
  	bui_machines_of_gods_description: "Machinery of a forgotten knowledge",
  	bui_mana_extractors: "Mana extractors",
  	bui_mana_extractors_description: "From underground we extract mana and other resources",
  	bui_mana_pit: "Mana pit",
  	bui_mana_pit_description: "A very deep pit to accumulate all the mana we will need",
  	bui_mana_pit_part: "Mana pit part",
  	bui_mana_pit_part_description: "A part of the Mana pit",
  	bui_mana_reactor: "Mana reactor",
  	bui_mana_reactor_description: "Like a nuclear reactor but without waste",
  	bui_mansion: "Mansion",
  	bui_mansion_description: "A home for the middle class",
  	bui_magical_tower: "Magical tower",
  	bui_magical_tower_description: "Tower defense are my favorite games",
  	bui_magic_circle: "Magic Circle",
  	bui_magic_circle_description: "Listen to the whisper of Theresmore",
  	bui_marketplace: "Marketplace",
  	bui_marketplace_description: "From a small provincial market to the monopoly of entire nations",
  	bui_mausoleum_gods: "Mausoleum of gods",
  	bui_mausoleum_gods_description: "To meet the gods we will have to make offerings",
  	bui_matter_transmuter: "Matter transmuter",
  	bui_matter_transmuter_description: "With mana and saltpetre we will have everything",
  	bui_mercenary_outpost: "Mercenary Outpost",
  	bui_mercenary_outpost_description: "With the help of the Captain we will train these mercenaries",
  	bui_military_academy: "Military academy",
  	bui_military_academy_description: "Military academy will train a professional army",
  	bui_military_camp: "Military camp",
  	bui_military_camp_description: "The military encampments of the new world",
  	bui_mind_shrine: "Mind Shrine",
  	bui_mind_shrine_description: "The sanctuary dedicated to Wisdom will help us discover the secrets of Theresmore",
  	bui_ministry_development: "Ministry of Development",
  	bui_ministry_development_description: "Our society is complex, we need ministries",
  	bui_ministry_interior: "Ministry of Interior",
  	bui_ministry_interior_description: "For the internal management of our society",
  	bui_ministry_war: "Ministry of War",
  	bui_ministry_war_description: "The management of the war",
  	bui_ministry_worship: "Ministry of Worship",
  	bui_ministry_worship_description: "The place where worship becomes an institution",
  	bui_mine: "Mine",
  	bui_mine_description: "Do you know what they have awakened in the darkness of Khazzard-drum? Shadow and flames",
  	bui_minefield: "Minefield",
  	bui_minefield_description: "We mine the fields around the city",
  	bui_monastery: "Monastery",
  	bui_monastery_description: "Ora et labora",
  	bui_monument: "Monument",
  	bui_monument_description: "Leftover wonder from an ancient ancestor, contains various heirlooms from the past",
  	bui_natronite_baloon: "Natronite balloon",
  	bui_natronite_baloon_description: "From above we will be able to comfortably spot enemies",
  	bui_natronite_depot: "Natronite depot",
  	bui_natronite_depot_description: "A warehouse to contain the dangerous natronite",
  	bui_natronite_refinery: "Natronite refinery",
  	bui_natronite_refinery_description: "The refinery of the precious natronite",
  	bui_natronite_shield: "Natronite shield",
  	bui_natronite_shield_description: "A natronite boost to our defense",
  	bui_observatory: "Observatory",
  	bui_observatory_description: "A place to observe the stars and predict events",
  	bui_officer_training_ground: "Officer training ground",
  	bui_officer_training_ground_description: "The officers of our army will get out of here",
  	bui_palisade: "Palisade",
  	bui_palisade_description: "Let's make sure that we turn our settlement into an Oppidum",
  	bui_palisade_unit: "Palisade part",
  	bui_palisade_unit_description: "A part of the Palisade",
  	bui_pillars_of_mana: "Pillars of mana",
  	bui_pillars_of_mana_description: "A large column that recalls the mana of all Theresmore. It has a very expensive constant maintenance",
  	bui_pilgrim_camp: "Pilgrim camp",
  	bui_pilgrim_camp_description: "The faithful who come to the new world seek a new home",
  	bui_quarry: "Quarry",
  	bui_quarry_description: "The quarry will supply the city with stone",
  	bui_railway_station: "Railway station",
  	bui_railway_station_description: "It will bring gold and immigration",
  	bui_rampart: "Rampart",
  	bui_rampart_description: "The rampart will protect the settlement from any incursion",
  	bui_rampart_unit: "Rampart part",
  	bui_rampart_unit_description: "A part of the Rampart",
  	bui_reactivate_portal: "Portal of the dead",
  	bui_reactivate_portal_description: "The portal of the dead must be reactivated in order to use it",
  	bui_reactivate_portal_decryption: "Decryption of the portal",
  	bui_reactivate_portal_decryption_description: "Symbols on portals require careful study to decipher",
  	bui_recruit_training_center: "Recruit training center",
  	bui_recruit_training_center_description: "Where recruits become soldiers",
  	bui_refinery: "Refinery",
  	bui_refinery_description: "A refinery for natronite and other materials",
  	bui_refugee_district: "Refugees district",
  	bui_refugee_district_description: "A district that will become a part of the city",
  	bui_refugee_district_part: "Refugees district part",
  	bui_refugee_district_part_description: "A part of the Refugees district",
  	bui_research_plant: "Research plant",
  	bui_research_plant_description: "From here, researchers will discover Theresmore",
  	bui_residential_block: "Residential block",
  	bui_residential_block_description: "A block of apartments to accommodate as many people as possible",
  	bui_sawmill: "Sawmill",
  	bui_sawmill_description: "More wood, more buildings, more production",
  	bui_school: "School",
  	bui_school_description: "Fatti non foste a viver come bruti ma per seguir virtute e canoscenza",
  	bui_shed: "Shed",
  	bui_shed_description: "There is plenty of space in the colony to store goods",
  	bui_siege_workshop: "Siege workshop",
  	bui_siege_workshop_description: "Better siege weapons for the army",
  	bui_souls: "Souls",
  	bui_souls_description: "The souls of scholars are absorbed by the Library of SouLs",
  	bui_spiritual_garden: "Spiritual garden",
  	bui_spiritual_garden_description: "A place of peace in contact with nature",
  	bui_stable: "Stable",
  	bui_stable_description: "In the stables you work hard and get up at dawn without ever complaining",
  	bui_statue_atamar: "Statue of Atamar",
  	bui_statue_atamar_description: "Atamar, the most famous strategist of the past",
  	bui_statue_firio: "Statue of Firio",
  	bui_statue_firio_description: "Firio, one of the greatest priests of the past",
  	bui_statue_lurezia: "Statue of Lurezia",
  	bui_statue_lurezia_description: "Lurezia, one of the greatest sorceresses of the past",
  	bui_statue_virtue: "Statue of Virtues",
  	bui_statue_virtue_description: "A huge statue to celebrate the humans of Theresmore",
  	bui_statue_virtue_part: "Statue of Virtues part",
  	bui_statue_virtue_part_description: "A part of the Statue of Virtues",
  	bui_steelworks: "Steelworks",
  	bui_steelworks_description: "The steelworks will produce steel from other metals",
  	bui_stock_exchange: "Stock exchange",
  	bui_stock_exchange_description: "Where we control the goods of Theresmore",
  	bui_stock_exchange_part: "Stock exchange part",
  	bui_stock_exchange_part_description: "A part of the Stock Exchange",
  	bui_storage_facility: "Storage facility",
  	bui_storage_facility_description: "A facility to store our productions",
  	bui_store: "Store",
  	bui_store_description: "A resourceful warehouse",
  	bui_stonemason: "Stonemason",
  	bui_stonemason_description: "A stone artist",
  	bui_stronghold: "Stronghold",
  	bui_stronghold_description: "The colony defense and supplies are all here",
  	bui_tax_revenue_checkpoints: "Tax revenue checkpoints",
  	bui_tax_revenue_checkpoints_description: "A legal and systematic taxation of goods in circulation",
  	bui_temple: "Temple",
  	bui_temple_description: "The ancient gods will show us the way",
  	bui_university: "University",
  	bui_university_description: "Home of the most eccentric scholars",
  	bui_valley_of_plenty: "Valley of plenty",
  	bui_valley_of_plenty_description: "Toss a coin to your player Oh, Valley of Plenty!",
  	bui_wall: "Wall",
  	bui_wall_description: "Why stop at a simple palisade?",
  	bui_wall_unit: "Wall part",
  	bui_wall_unit_description: "A part of the Wall",
  	bui_war_shrine: "War Shrine",
  	bui_war_shrine_description: "The shrine dedicated to the God of War will help us crush our enemies",
  	bui_warehouse: "Warehouse",
  	bui_watchman_outpost: "Watchman Outpost",
  	bui_watchman_outpost_description: "Always on the alert to spot the enemy. Placed at key points will allow you to see incoming attacks",
  	bui_the_vaults: "The Vaults",
  	bui_the_vaults_description: "A vault of stone and steel to store our gold",
  	bui_titanic_walls: "Titanic Walls",
  	bui_titanic_walls_description: "So large that they also house laboratories within them",
  	bui_titanic_walls_part: "Titanic Walls part",
  	bui_titanic_walls_part_description: "A part of the Titanic Walls",
  	bui_titan_work_area: "Titan Work Area",
  	bui_titan_work_area_description: "A titanic workplace!",
  	bui_tower_mana: "Tower of mana",
  	bui_tower_mana_description: "A tower to channel the power of sacred places",
  	bui_tower_mana_part: "Tower of mana part",
  	bui_tower_mana_part_description: "A part of the Tower",
  	bui_trench: "Trench",
  	bui_trench_description: "Barbed wire and a lot of mud",
  	bui_undead_herd: "Undead Herds",
  	bui_undead_herd_description: "Breeding of nearly living animals",
  	cat_commercial_area: "Commercial Area",
  	cat_defense: "Army and Defense",
  	cat_faith: "Faith and Magic",
  	cat_living_quarters: "Living Quarters",
  	cat_resource: "Producing and Crafting",
  	cat_science: "Knowledge Area",
  	cat_warehouse: "Storage",
  	cat_wonders: "Wonders",
  	dip_army_of_dragon: "The Red Dragon assault",
  	dip_army_of_goblin: "The Goblin assault",
  	dip_army_of_the_dead: "Army of the dead",
  	dip_army_of_the_dead_description: "The army of the dead is upon us, we must repel it and save Theresmore",
  	dip_barbarian_horde: "Barbarian Horde",
  	dip_barbarian_horde_description: "We subdued the barbarians and brought them civilization",
  	dip_send_delegation: "Send a delegation",
  	dip_relationships: "Relationships",
  	dip_relationships_description: "Your current relationships with this faction",
  	dip_send_delegation_description: "We send a delegation to this people to start diplomatic relations",
  	dip_fallen_angel_army_1: "The Fallen Angel musket army",
  	dip_fallen_angel_army_2: "The Fallen Angel demons army",
  	dip_improve_relationships: "Improve relationships",
  	dip_improve_relationships_abbr: "Improve",
  	dip_improve_relationships_description: "We will do our best to improve relations with the target nation. The more resources you spend on improving relations the more the benefits will be",
  	dip_insult: "Insult",
  	dip_insult_description: "Son of a Theresmorian goat, your smell precedes you! This should make our relationships worse",
  	dip_alliance: "Alliance",
  	dip_alliance_description: "Our great nations will stand the test of time. We will now provide each other military and resource aid",
  	dip_owned: "Conquered",
  	dip_owned_description: "We have conquered this faction and now all its riches are ours",
  	dip_trade_accept: "Accept trade agreement",
  	dip_trade_accept_abbr: "Accept",
  	dip_trade_accept_description: "Accept this trade agreement",
  	dip_trade_cancel: "Cancel trade agreement",
  	dip_trade_cancel_abbr: "Cancel",
  	dip_trade_cancel_description: "Cancel this trade agreement",
  	dip_trade_agreements: "Trade agreements",
  	dip_trade_agreements_description: "Possible trade pacts with this faction",
  	dip_war: "War",
  	dip_war_confirm: "War confirm",
  	dip_war_confirm_description: "Are you sure you want to go to war with this faction? It will be a ruthless conflict and you will face armies with hundreds of units. You will not be able to make peace with them again. Proceed only if you have a very good army to be able to defend and attack",
  	dip_war_description: "Let's total war begins",
  	dip_war_declaration: "You are now at war with this faction, may the gods of Theresmore help us in battle to exterminate our enemies. Beware that the enemy army has been spotted near the border, they may launch an attack at any moment. Let's use our soldiers as a garrison or let's launch a terrible attack that will totally annihilate these filthy piles of dung",
  	dip_relationship_unknown: "Relationships unknown",
  	dip_relationship_unknown_description: "We have not yet met this faction",
  	dip_relationship_negative: "Relationships negative",
  	dip_relationship_negative_description: "We are on bad terms with this faction",
  	dip_relationship_positive: "Relationships positive",
  	dip_relationship_positive_description: "We are on good terms with this faction",
  	dip_relationship_neutral: "Relationships neutral",
  	dip_relationship_neutral_description: "This faction does not love or hate us",
  	dip_enso_multitude: "Enso Multitude",
  	dip_enso_multitude_description: "In the Far East there is a civilization that can rival us for primacy on Theresmore. They call themselves Enso, the enlightened ones, the very force of the universe. Their symbol is a circle, they have almond-shaped eyes and their complexion is yellowish. They invented gunpowder and their warriors are fierce in battle and swarm like a multitude over the unfortunate enemy armies. They keep vast stores of Natronite of which they are very jealous; maybe it would be better to make friends with them.",
  	dip_nightdale_protectorate: "Nightdale Protectorate",
  	dip_nightdale_protectorate_description: "The northern tribes are united under the protectorate of Nightdale, proud warriors, they show no fear against their enemies.",
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
  	dip_scalerock_tribes_description: "In the high peaks of the Scalerock Mountains, there are tribes of draconians. They live in caves carved into the rock and fly over the high peaks to swoop down on their unsuspecting enemies. Descendants of dragons have retained their intelligence and craftsmanship in creating objects. They know natronite, perhaps from an ancestral legacy, and are greedy for it beyond measure.",
  	dip_sssarkat_empire: "Sssarkat Empire",
  	dip_sssarkat_empire_description: "In the warm waters beyond the realm of Zultan are salamander-like creatures that live mostly underwater. They are repositories of a vanished ancient civilization and populate its ruins by making use of remaining technology. They often visit the mainland and some of their villages can be found on the sunny shores.",
  	dip_theresmore_wanders: "Theresmore Wanders",
  	dip_theresmore_wanders_description: "In the boundless plains to the east there are nomadic tribes called the wanders, we don't know how many they are and what their real strength is. The territories to the east are mostly unknown.",
  	dip_western_kingdom: "Western Kingdom",
  	dip_western_kingdom_description: "The kingdom of the west is a feudal monarchy, protected by its large castles and it’s formidable on the battlefield thanks to its cavalry.",
  	dip_zultan_emirate: "Zultan Emirate",
  	dip_zultan_emirate_description: "Along the deserts of the south flourishing commercial cities have sprung up, the largest of these being Zultan whose oligarchy controls a vast area.",
  	dip_king_kobold_nation: "King Kobold Nation",
  	dip_king_kobold_nation_description: "These little bipedal lizards have never been at our level. We chased them back to the dust from whence they came.",
  	ene_ancient_burial_place: "Ancient burial place",
  	ene_ancient_burial_place_description: "A place long forgotten, few undeads roaming around. A few dozen of soldiers will exterminate them",
  	ene_ancient_giant: "Ancient Giant",
  	ene_ancient_giant_description: "A huge cave where an ancient giant resides with his progeny",
  	ene_ancient_hideout: "Ancient hideout",
  	ene_ancient_hideout_description: "Bandits have occupied this old hideout, a few dozen of soldiers should eliminate them",
  	ene_harpy_nest: "Harpy Nest",
  	ene_harpy_nest_description: "The harpies' nest from where they attract unsuspecting travelers",
  	ene_ball_lightning_field: "Ball lightning field",
  	ene_ball_lightning_field_description: "A group of globular lightning bolts took over a field not far from the colony",
  	ene_bandit_camp: "Bandit Camp",
  	ene_bandit_camp_description: "Along the road and in the woods to cut up merchants and passersby, a few dozen of soldiers will take care of them",
  	ene_barbarian_camp: "Barbarian camp",
  	ene_barbarian_camp_description: "A peaceful tribe of barbarian. Beware: don't poke the bear",
  	ene_barbarian_village: "Barbarian Village",
  	ene_barbarian_village_description: "A large barbarian village where multiple tribes joined together to prosper",
  	ene_barren_hills: "Barren Hills",
  	ene_barren_hills_description: "The barren hills are an inhospitable place inhabited by giants and kobolds",
  	ene_basilisk_cave: "Basilisk Cave",
  	ene_basilisk_cave_description: "The cave where basilisks roam around, they are very dangerous",
  	ene_black_mage_tower: "Black Mage Tower",
  	ene_black_mage_tower_description: "The tower of a dark wizard. With his goblins he is planning evil plans against Theresmore",
  	ene_bugbear_tribe: "Bugbear tribe",
  	ene_bugbear_tribe_description: "A tribe of bugbears raiding the region from their small camp in search of loot",
  	ene_bugbear_war_party: "Bugbear war party",
  	ene_bugbear_war_party_description: "When a chieftain goes to war his bugbear warriors become a fearsome force to be reckoned with",
  	ene_burning_pit: "Burning Pit",
  	ene_burning_pit_description: "The subsoil of Theresmore is infested with demons, fortunately these are small in size",
  	ene_cave_bats: "Cave of bats",
  	ene_cave_bats_description: "A cave infested with vampire bats, some spearmen will eliminate them",
  	ene_citadel_dead: "Citadel of the dead",
  	ene_citadel_dead_description: "An abandoned citadel haunted by the dead (and wyverns)",
  	ene_construction_site: "Construction site",
  	ene_construction_site_description: "Mercenaries have taken up residence in this vast space. Let's drive them out",
  	ene_deserters_den: "Deserter Den",
  	ene_deserters_den_description: "The den of deserters, they respect only the god of money by now",
  	ene_demoness_castle: "Demoness castle",
  	ene_demoness_castle_description: "A gloomy castle from which comes a strong demonic aura, there must be many demons within it",
  	ene_demonic_portal: "Demonic portal",
  	ene_demonic_portal_description: "Near this portal there are several greater and lesser demons while in the sky flutter dozens of imp",
  	ene_desecrated_temple: "Desecrated Temple",
  	ene_desecrated_temple_description: "The Luna Temple has been converted into a pile of putrescence, many greenskinned humanoids are at work at this site",
  	ene_djinn_palace: "Djinn Palace",
  	ene_djinn_palace_description: "The abode of a Djinn, several nagas guard the entrance. It will be a tough battle",
  	ene_east_sacred_place: "East sacred place",
  	ene_east_sacred_place_description: "There is a place in the east where the power of Theresmore is alive in the air, elementals guard it",
  	ene_earth_elemental_circle: "Earth elemental circle",
  	ene_earth_elemental_circle_description: "They look like the sacred places of the old continent but are much stronger",
  	ene_eternal_halls: "Eternal Halls",
  	ene_eternal_halls_description: "The Eternal Halls are a holy place for the people of the Western Kingdom. They are protected by stone guardians",
  	ene_ettin_camp: "Ettin camp",
  	ene_ettin_camp_description: "Ettins are giant two-headed creatures. In their camp some natives are kept in cages",
  	ene_ettin_enslaver: "Ettin enslavers",
  	ene_ettin_enslaver_description: "A ettin tribe whose main role is to trade slaves",
  	ene_far_west_island: "Far west island",
  	ene_far_west_island_description: "A small island a few days' sail to the west",
  	ene_fire_elemental_circle: "Fire elemental circle",
  	ene_fire_elemental_circle_description: "They look like the sacred places of the old continent but are much stronger",
  	ene_frost_elemental_circle: "Frost elemental circle",
  	ene_frost_elemental_circle_description: "They look like the sacred places of the old continent but are much stronger",
  	ene_fire_salamander_nest: "Fire salamander nest",
  	ene_fire_salamander_nest_description: "A nest of fire salamanders, these reptiles are very dangerous when confronted near their burrows",
  	ene_forgotten_shelter: "Galliard Forgotten Shelter",
  	ene_forgotten_shelter_description: "A forgotten and sealed refuge where dark ghosts of memory lodge",
  	ene_galliard_mercenary_camp: "Galliard mercenary camp",
  	ene_galliard_mercenary_camp_description: "Captain Galliard and his company of mercenaries are stationed at this camp.",
  	ene_giant_temple: "Giant temple",
  	ene_giant_temple_description: "An ancient temple hidden in the intricate forest",
  	ene_gloomy_werewolf_forest: "Gloomy werewolf forest",
  	ene_gloomy_werewolf_forest_description: "The forest of the werewolf is so full of obstacles that even the best equipped of armies would have difficulty",
  	ene_goblin_lair: "Goblin lair",
  	ene_goblin_lair_description: "Goblins are dodgy creatures, they have little weaponry but poison the tips of their arrows. A few dozen of soldiers will be safe enough",
  	ene_golem_cave: "Golem cave",
  	ene_golem_cave_description: "A cave full of statues. Beware they may come alive to defend it",
  	ene_gold_mine: "Gold Mine",
  	ene_gold_mine_description: "A large gold mine but is inhabited by trolls. A SEA of trolls. Warning!",
  	ene_gorgon_cave: "Gorgon cave",
  	ene_gorgon_cave_description: "The gorgon petrifies with its gaze and lurks in an intricate cave system fraught with danger",
  	ene_gnoll_camp: "Gnoll camp",
  	ene_gnoll_camp_description: "The camp reeks of carrion from several miles away. Watch out for the leader of the Gnolls",
  	ene_gnoll_raiding_party: "Gnoll Raiding Party",
  	ene_gnoll_raiding_party_description: "These human-hyena hybrids take the worst from both species",
  	ene_gulud_ugdun: "Gulud Ugdun castle",
  	ene_gulud_ugdun_description: "The castle where children are held captive. We have to kill Gulud",
  	ene_haunted_library: "Haunted library",
  	ene_haunted_library_description: "An old library, now ghosts guard it. A few dozen of soldiers will haunt them down",
  	ene_hell_hole: "Hell Hole",
  	ene_hell_hole_description: "A hole in the ground that leads to a large cave. The entrance to hell",
  	ene_hobgoblin_chieftain: "Hobgoblin chieftain",
  	ene_hobgoblin_chieftain_description: "A small army of Hobgoblins led by their chieftain",
  	ene_hobgoblin_encampment: "Hobgoblin encampment",
  	ene_hobgoblin_encampment_description: "A camp full of hobgoblin grunts, their resources could come in handy",
  	ene_hydra_pit: "Hydra pit",
  	ene_hydra_pit_description: "The pit of a hydra: it fights like a legion thanks to its five heads",
  	ene_lead_golem_mine: "Lead golem mine",
  	ene_lead_golem_mine_description: "In an old mine we discovered golems of a strange, very hard substance",
  	ene_lich_temple: "Lich temple",
  	ene_lich_temple_description: "The Lich is a source of dark power and commands dozens of undead",
  	ene_king_reptiles: "The King of Reptiles",
  	ene_king_reptiles_description: "In a valley forgotten by time there are animals never seen before. Giant reptiles from the distant past",
  	ene_kobold_city: "Kobold City",
  	ene_kobold_city_description: "A kobold city right under our feet, who knew?",
  	ene_kobold_looters: "Kobold looters",
  	ene_kobold_looters_description: "From their small encampment they raid the nearby countryside, let's drive them off with a few soldiers",
  	ene_kobold_underground_tunnels: "Kobold tunnels",
  	ene_kobold_underground_tunnels_description: "Kobolds dig their burrows deep, they are weak but very numerous",
  	ene_korrigan_dolmen: "Korrigan dolmen",
  	ene_korrigan_dolmen_description: "These despicable little creatures like to prey on wayfarers near their dolmens",
  	ene_markanat_forest: "Forest of Markanat",
  	ene_markanat_forest_description: "Markanat's flooded forest, a giant spider that does not allow anyone to approach",
  	ene_mercenary_camp: "Mercenary Camp",
  	ene_mercenary_camp_description: "Mercenaries without a patron, they are dedicated to looting and very dangerous",
  	ene_minotaur_maze: "Minotaur maze",
  	ene_minotaur_maze_description: "The minotaur's labyrinth. A formidable challenge for anyone",
  	ene_myconid_cavern: "Myconid Cavern",
  	ene_myconid_cavern_description: "A tribe of myconids took this cave of strong magical impulse as a home",
  	ene_mountain_cave: "Mountain Cave",
  	ene_mountain_cave_description: "A huge cave from which a giant controls the mountain along with his goblin minions",
  	ene_mountain_valley: "Mountain Valley",
  	ene_mountain_valley_description: "A large valley in the middle of the mountains. It is inhabited by giants but if we can drive them out there will be plenty of food and wood",
  	ene_naga_nest: "Naga Nest",
  	ene_naga_nest_description: "They won't let us take their precious food sources without bloodshed",
  	ene_nasty_pillagers: "Nasty pillagers",
  	ene_nasty_pillagers_description: "These dirty raiders had set aside some small wealth, let's send a few soldiers to dispatch them",
  	ene_necromancer_crypt: "Necromancer Crypt",
  	ene_necromancer_crypt_description: "The dreary home of a mad necromancer. Beware of the undead!",
  	ene_north_sacred_place: "North sacred place",
  	ene_north_sacred_place_description: "There is a place in the north where the power of Theresmore is alive in the air, elementals guard it",
  	ene_old_herd: "Old herd",
  	ene_old_herd_description: "An old rat-infested pasture, a dozen soldiers should be enough",
  	ene_old_outpost: "Old outpost",
  	ene_old_outpost_description: "An old abandoned outpost now the refuge of deserters, bandits and mercenaries",
  	ene_old_storage_room: "Old storage room",
  	ene_old_storage_room_description: "An old storage room in which spiders have nested, a dozen of spearmen will conquer this place",
  	ene_orc_gormiak_citadel: "Orc Gormiak Citadel",
  	ene_orc_gormiak_citadel_description: "An Orcish fortified citadel. The stench of this putrid settlement fouls the air",
  	ene_orc_horith_citadel: "Orc Horith Citadel",
  	ene_orc_horith_citadel_description: "The city that protects the territory of Horith, famous for the fire caster clan",
  	ene_orc_ogsog_citadel: "Orc Ogsog Citadel",
  	ene_orc_ogsog_citadel_description: "The fortified citadel of Ogsog from where the Orcish champions arrive",
  	ene_orc_turgon_citadel: "Orc Turgon Citadel",
  	ene_orc_turgon_citadel_description: "The citadel of Turgon where the clan of Orcish shamans originates from",
  	ene_orc_raiding_party: "Orc raiding party",
  	ene_orc_raiding_party_description: "An Orcish army that is putting the colony's surroundings to the sword",
  	ene_orcish_prison_camp: "Orcish prison camp",
  	ene_orcish_prison_camp_description: "A camp where orcs are holding prisoners from their raids",
  	ene_prisoner_wagon: "Prisoner wagon",
  	ene_prisoner_wagon_description: "A wagon in which bandits trapped civilians, a few spearman with archers will eliminate them",
  	ene_rat_cellar: "Rat cellar",
  	ene_rat_cellar_description: "A cellar infested with ravenous rats, let's bring some spearmen",
  	ene_rusted_warehouse: "Rusted warehouse",
  	ene_rusted_warehouse_description: "An abandoned farmhouse that will become a good warehouse",
  	ene_sleeping_titan: "A sleeping Titan",
  	ene_sleeping_titan_description: "It seems that those who can awaken the titan will have immense gifts",
  	ene_skullface_encampment: "Skullface encampment",
  	ene_skullface_encampment_description: "The skullface camp is defended by several bandits; it will not be easy to eliminate him",
  	ene_snakes_nest: "Snakes nest",
  	ene_snakes_nest_description: "Into which many unsuspecting victims have fallen",
  	ene_spider_forest: "Spider forest",
  	ene_spider_forest_description: "A dense forest full of giant spider webs",
  	ene_son_atamar: "Son of Atamar",
  	ene_son_atamar_description: "Atamar cult comes from the southern deserts, its believers are excellent swordsmen",
  	ene_south_sacred_place: "South sacred place",
  	ene_south_sacred_place_description: "There is a place in the south where the power of Theresmore is alive in the air, elementals guard it",
  	ene_strange_village: "A strange village",
  	ene_strange_village_description: "A village where the inhabitants have a blank stare and are very aggressive",
  	ene_succubus_library: "Succubus Dark Library",
  	ene_succubus_library_description: "These demonesses have taken as their abode an obscure library. Beware of approaching",
  	ene_swarm_wasp: "Giant Wasp swarm",
  	ene_swarm_wasp_description: "An immense swarm of giant wasps roams the land",
  	ene_temple_gargoyle: "Temple of gargoyles",
  	ene_temple_gargoyle_description: "This ancient temple in the forest is guarded by several gargoyles",
  	ene_troll_cave: "Troll Cave",
  	ene_troll_cave_description: "A smelly cave that trolls call home, driving out the occupants will be a serious problem",
  	ene_vampire_crypt: "Vampire crypt",
  	ene_vampire_crypt_description: "A crypt forgotten by time, apparently now home to vampires or servants of them",
  	ene_vampire_lair: "Vampire lair",
  	ene_vampire_lair_description: "The home of a vampire, a terrible enemy capable of instilling fear in even the most valiant soldiers",
  	ene_wind_elemental_circle: "Wind elemental circle",
  	ene_wind_elemental_circle_description: "They look like the sacred places of the old continent but are much stronger",
  	ene_west_sacred_place: "West sacred place",
  	ene_west_sacred_place_description: "There is a place in the west where the power of Theresmore is alive in the air, elementals guard it",
  	ene_wolf_pack: "Wolf pack",
  	ene_wolf_pack_description: "A pack of vicious wolves attack passing flocks, a few dozen of soldiers should contain the pack",
  	ene_worn_down_crypt: "Worn down crypt",
  	ene_worn_down_crypt_description: "In a remote, secluded section of a spooky forest, there are a force of skeletal knights guarding the entrance to a worn down crypt",
  	ene_wyvern_nest: "Wyvern Nest",
  	ene_wyvern_nest_description: "These terrible creatures resemble dragons and are often mistaken for them",
  	fai_accept_druid: "Accept the Druid",
  	fai_accept_druid_description: "Accepting the druid and his beliefs as an integral part of our society, he will become high priest",
  	fai_acolyte_hymn: "Acolyte hymn",
  	fai_acolyte_hymn_description: "The chant of the devout rises to the gods",
  	fai_army_blessing: "Army blessing",
  	fai_army_faith: "Army of faith",
  	fai_army_faith_description: "Armies of faith will burn our enemies",
  	fai_banish_druid: "Banish the Druid",
  	fai_banish_druid_description: "Banish the Druid from the city, we don't need gurus",
  	fai_blessing_city: "City great blessing",
  	fai_blessing_church: "Church Blessing",
  	fai_blessing_church_description: "A new ritual can be cast on the Church",
  	fai_blessing_prelate: "Blessing of the prelate",
  	fai_blessing_prelate_description: "A blessing for the entire army",
  	fai_children_hope: "The Children Hope",
  	fai_city_blessing: "City blessing",
  	fai_city_blessing_description: "We must gather the city's wise men and create a protection spell",
  	fai_create_sacred_golem: "Create a sacred golem",
  	fai_create_sacred_golem_description: "We will be able to create a blessed mana powered golem",
  	fai_church_ritual: "Church ritual",
  	fai_dark_ritual: "Dark ritual",
  	fai_dark_ritual_description: "The demonic power infused in our sacred warriors could lead to consequences",
  	fai_demonology: "Demonology",
  	fai_demonology_description: "We have defeated enough demons to study their characteristics",
  	fai_demoniac_tome: "Demoniac tome",
  	fai_demoniac_tome_description: "We have to translate the tome to find out its origin",
  	fai_desire_abundance: "Desire for Abundance",
  	fai_desire_abundance_description: "Desire for abundance. Only one desire can be expressed. Choose wisely",
  	fai_desire_magic: "Desire for Magic",
  	fai_desire_magic_description: "Desire for magic. Only one desire can be expressed. Choose wisely",
  	fai_desire_war: "Desire for War",
  	fai_desire_war_description: "Subdue the Djinn so he can fight for us. Only one desire can be expressed. Choose wisely",
  	fai_dragon_armor: "Dragon armor",
  	fai_dragon_skull: "Dragon Skull",
  	fai_dragon_skull_description: "The ancient artifact is a skull of a dragon! We can use its powers and create new equipment by copying its hardness",
  	fai_dragon_weapon: "Dragon weapon",
  	fai_druid_blessing: "Druid blessing",
  	fai_praise_gods: "Praise gods",
  	fai_praise_gods_description: "We must please the gods so they will listen to us",
  	fai_blessing: "Blessing",
  	fai_blessing_description: "The first form of power of the gods in Theresmore: blessings",
  	fai_holy_light: "Holy light",
  	fai_holy_light_description: "Now we can bless our warriors with light",
  	fai_hope_children: "The children hope",
  	fai_hope_children_description: "We rescued the children from Gulud, they have magical abilities outside the norm",
  	fai_pilgrim_chant: "Pilgrim chant",
  	fai_pilgrim_chant_description: "The faithful's song of faith creates abundance in the new world",
  	fai_prayer_for_the_great_seeker: "The Great Seeker",
  	fai_prayer_for_the_great_seeker_description: "A prayer for the Great Seeker, that our hunters never lose the trail",
  	fai_great_seeker_2: "Great Seeker eyesight",
  	fai_great_seeker_2_description: "We pray the Great Seeker to grant us his keen sight",
  	fai_prayer_for_mother_earth: "Mother Earth",
  	fai_prayer_for_mother_earth_description: "A prayer for our Mother Earth, that its fruits descend on us",
  	fai_mother_earth_2: "Mother Earth grace",
  	fai_mother_earth_2_description: "We pray to Mother Earth that she will grant us abundance",
  	fai_prayer_for_the_old_small_one: "The Old Small One",
  	fai_prayer_for_the_old_small_one_description: "A prayer for the Old Small One, that the dwarf of antiquity gives us abundance",
  	fai_old_small_one_2: "Old Small One grace",
  	fai_old_small_one_2_description: "We pray to the Dwarf that he will give us his grace",
  	fai_prayer_for_the_ancient_monk: "Ancient Monk",
  	fai_prayer_for_the_ancient_monk_description: "A prayer for the Ancient Monk, that his disciples may return to battle with us",
  	fai_prayer_goddess_luck: "Goddess of Luck",
  	fai_prayer_goddess_luck_description: "A prayer for the Goddess of Luck, to inspire the fate!",
  	fai_prayer_for_the_great_warrior: "Great Warrior",
  	fai_prayer_for_the_great_warrior_description: "A prayer for the Great Warrior, that his fury guides our soldiers",
  	fai_prayer_lonely_druid: "Lonely Druid",
  	fai_prayer_lonely_druid_description: "A prayer for the Lonely Druid, that gives us his blessing",
  	fai_great_warrior_2: "Great Warrior fury",
  	fai_great_warrior_2_description: "We pray to the Great Warrior to give us fury on the battlefields",
  	fai_prayer_for_the_great_builder: "Great Builder",
  	fai_prayer_for_the_great_builder_description: "A prayer for the Great Builder, to guide our masons",
  	fai_prayer_for_the_mysterious_arcane: "Mysterious Arcane",
  	fai_prayer_for_the_mysterious_arcane_description: "A prayer for the Mysterious Arcane, to guide our wise men",
  	fai_prayer_wild_man: "Wild Man",
  	fai_prayer_wild_man_description: "A prayer for the Wild Man, to breed our tamed beasts",
  	fai_wild_man_2: "Wild Man dexterity",
  	fai_wild_man_2_description: "We praise the Wild Man to obtain his agility",
  	fai_unveil_theresmore: "Unveil Theresmore",
  	fai_unveil_theresmore_description: "We peer into the mysteries of Theresmore",
  	fai_sacred_place: "Sacred Place",
  	fai_sacred_place_description: "There are places in Theresmore where the energies of the planet converge",
  	fai_strange_lamp: "A Strange Lamp",
  	fai_strange_lamp_description: "In the naga's nest we found a strange lamp like those used in southern Theresmore",
  	fai_acolyte_circle: "Acolyte circle",
  	fai_acolyte_circle_description: "The prayers of these devotees will help us",
  	fai_goddess_luck_blessing: "Goddess Luck blessing",
  	fai_gold_consecration: "Consecration of Gold",
  	fai_gold_consecration_description: "All our faith must be directed in our project of economic domination",
  	fai_great_builder_blessing: "Great Builder blessing",
  	fai_great_seeker_blessing: "Great Seeker blessing",
  	fai_great_seeker_blessing_description: "Guide our arrows to the target",
  	fai_great_seeker_eyesight: "Great Seeker eyesight",
  	fai_great_warrior_blessing: "Great Warrior blessing",
  	fai_great_warrior_blessing_description: "Lead our brave men into battle",
  	fai_great_warrior_fury: "Great Warrior fury",
  	fai_growth_nature: "Growth of Nature",
  	fai_growth_nature_description: "We will be able to create a spell to thicken our forests",
  	fai_growth_of_nature: "Growth of Nature",
  	fai_incremental_power: "Incremental power",
  	fai_incremental_power_description: "We will use the power of the Northern Star to increase our production",
  	fai_lighten_rocks: "Lighten of rocks",
  	fai_lighten_rocks_description: "In the quarries we will be able to use our mana to lift the heavier stones",
  	fai_lighten_of_rocks: "Lighten of rocks",
  	fai_magical_lights: "Magic lights",
  	fai_magical_lights_description: "In our mines we will be able to create artificial mana lights to help our miners",
  	fai_magic_lights: "Magic lights",
  	fai_magical_tools: "Magic tools",
  	fai_magical_tools_description: "Who wouldn't want magic tools to increase production?",
  	fai_magic_tools: "Magic tools",
  	fai_mana_armor: "Mana armor",
  	fai_mana_defense: "Mana defense",
  	fai_mana_defense_description: "We can use mana to defend our settlement",
  	fai_mana_defense_II: "Mana defense II",
  	fai_mana_defense_II_description: "We can use even more mana to defend our settlement",
  	fai_mana_dome: "Mana dome",
  	fai_mana_dome_description: "A dome of mana protecting our city",
  	fai_mana_energy_shield: "Mana energy shield",
  	fai_mana_energy_shield_description: "Strengthen our walls with a mana shield",
  	fai_minor_blessing: "Minor blessing",
  	fai_minor_blessing_description: "The gods grant us some minor blessings",
  	fai_mirune_blessing: "Mirune blessing",
  	fai_mother_earth_blessing: "Mother Earth blessing",
  	fai_mother_earth_blessing_description: "Fill us with your abundant gifts",
  	fai_mother_earth_grace: "Mother Earth grace",
  	fai_mysterious_arcane_blessing: "Mysterious Arcane blessing",
  	fai_new_world_chant: "New World Chant",
  	fai_northern_star_incremental: "Northern Star incremental",
  	fai_northern_star_power: "Northern Star power",
  	fai_northern_star_power_description: "Now that the Northern Star is in our possession we have to figure out how to channel its power",
  	fai_northern_star_protection: "Northern Star protection",
  	fai_old_small_one_blessing: "Old Small One blessing",
  	fai_old_small_one_blessing_description: "Guide the hand of our craftsmen",
  	fai_old_small_one_grace: "Old Small One grace",
  	fai_power_spell_east: "East Power Spell",
  	fai_power_spell_east_description: "The East Power Spell, the primacy of Horses",
  	fai_power_spell_north: "North Power Spell",
  	fai_power_spell_north_description: "The North Power Spell, the sacrifice of Iron",
  	fai_power_spell_south: "South Power Spell",
  	fai_power_spell_south_description: "The South Power Spell, the fusion of Gold",
  	fai_power_spell_west: "West Power Spell",
  	fai_power_spell_west_description: "The West Power Spell, the mighty Steel",
  	fai_protection_power: "Protection power",
  	fai_protection_power_description: "We will use the power of the Northern Star to protect our city",
  	fai_sacred_armor: "Sacred armor",
  	fai_sacred_armor_description: "A magic armor for our commander",
  	fai_sacred_equipments: "Sacred equipments",
  	fai_sacred_equipments_description: "We can use mana to create magical equipment",
  	fai_sacred_equipments_II: "Sacred equipments II",
  	fai_sacred_equipments_II_description: "We can use mana to create better magical equipment",
  	fai_sacred_weapon: "Sacred weapon",
  	fai_sacred_weapon_description: "We give our warriors consecrated weapons",
  	fai_sacrifices_gods: "Sacrifices for the gods",
  	fai_sacrifices_gods_description: "We will immolate animals to please the gods",
  	fai_shape_mana: "Shape mana",
  	fai_shape_mana_description: "We can shape mana to make armor out of it",
  	fai_spear_wild_man: "Spear of the Wild",
  	fai_spear_wild_man_description: "The wild man was a great horseman",
  	fai_spell_accept: "Cast this spell",
  	fai_spell_cancel: "Cancel this spell",
  	fai_study_undead_creatures: "Study of undead creatures",
  	fai_study_undead_creatures_description: "Now that we have defeated those undead we must study their characteristics",
  	fai_temple_mirune: "Temple of Mirune",
  	fai_temple_mirune_description: "The temple in the forest is dedicated to Mirune the woods goddess. Let's clean it up and pay homage to her",
  	fai_temple_ritual: "Temple ritual",
  	fai_temple_ritual_description: "A simple ritual at the temple",
  	fai_the_aid: "Solve the crisis",
  	fai_the_aid_description: "More and more refugees are asking to enter the city, now it has become a big crowd",
  	fai_theresmore_revealed: "Theresmore revealed",
  	fai_theresmore_revealed_description: "The veil begins to lift",
  	fai_warrior_gods: "Warriors of the Gods",
  	fai_warrior_gods_description: "Paladins chosen by the Gods join us",
  	fai_wild_man_blessing: "Wild Man blessing",
  	fai_wild_man_spear: "Wild Man spear",
  	fai_wild_man_dexterity: "Wild Man dexterity",
  	fai_zenix_aid: "Realmwalker Zenix",
  	fai_zenix_aid_description: "Zenix in return for our hospitality could teach his arts to our young strategists making some a formidable aid in battle",
  	img_army: "The Army",
  	img_army_description: "Theresmore is full of dangers, and as we leave our valley we will discover that we are not alone. Enemies of all kinds are lurking and that is why we must arm ourselves and be ready to face them. In addition we can now create our own scouts who will explore Theresmore looking for anything we can exploit or conquer",
  	img_army_of_dragon: "The Dragon assault",
  	img_army_of_dragon_description: "Our valiant soldiers tightened their ranks once again to give battle. The old man's prophecy was correct, the Dragon was here to claim his artifact. His draconic servants hurled themselves on the walls with impetuousness but our defenses withstood the impact and gave battle without quarter. The Dragon, annoyed by these insolent humans who had the audacity to stand up to his army, pounced on the walls, mowing down and incinerating anyone who came within range. This was a grave mistake, because so close he was prey to the counterattack of our soldiers who managed to wound him and pierce the delicate membranes of his wings. Seeing himself hunted he took a leap and flew away before it was too late. His army was defeated and the city was saved. For now",
  	img_army_of_goblin: "The Goblin army",
  	img_army_of_goblin_description: "Your soldiers knew that what had destroyed the village of Canava was waiting to spring at our throats, and that night they were not taken by surprise. From their defensive positions they lured the goblin wolfriders into an ambush quickly decimating them, the green skins hesitant from the loss of their cavalry abandoned their hiding places and were easy prey for our valiant soldiers. The goblin overlord leading the raid was pierced by a spear and now his head parades as a gruesome trophy through the streets of our settlement. We have won and our civilization is safe for now",
  	img_ascension: "Ascension",
  	img_ascension_description: "As a mortal you transcend your flesh and a stream of knowledge invades you. The gods are ready to speak to you and you can live among them. They will send angels to Theresmore to help your people and the new leaders who will come to rule",
  	img_astronomy: "The birth of the third era",
  	img_astronomy_description: "We leave the feudal age and our gaze shifts to the firmament. It is the abode of the gods, and studying its movements will make us develop the scientific process. Theresmore still has much to offer, and this age will bring new machines and new ways to give battle. In addition, the progress of faith will know its highest points",
  	img_barbarian_horde: "Barbarian horde",
  	img_barbarian_horde_description: "\"You have enslaved my people who by right should live free, you have shed the blood of my brothers and now I will shed yours. Prepare yourselves for war!\"",
  	img_citadel_dead: "Citadel of the dead",
  	img_citadel_dead_description: "Our scouts entered a mountain gorge and came across an old citadel. As far as the eye could see, its inhabitants haunted the area transformed into zombies and ghouls. In the area, wyverns have nested, which feeding on the unfortunates have created a thriving colony. In the heart of the citadel, familiar wrens have been glimpsed, it looks like Natronite, we must investigate!",
  	img_colony: "The birth of a colony",
  	img_colony_description: "Brave settlers, embark on a journey to uncharted lands beyond the horizon. A new frontier awaits, a place of untold mysteries and untold riches, where the gods themselves will test your mettle. Stand tall and face whatever challenges may come, for this is a journey unlike any other. A tale of daring and bravery, a saga that will be told for generations to come. So gather your strength, sharpen your swords, and set sail into the unknown. The future of your civilization rests upon your shoulders, and with the grace of the gods, you shall conquer and thrive in this new world!",
  	img_deep_mine: "The depths of Theresmore",
  	img_deep_mine_description: "Our miners are digging in the depths of Theresmore, and the deeper we descend, the more eerie noises can be heard coming from the abyss. Continuing to dig could be very dangerous",
  	img_demoness_castle: "The dark horned demoness",
  	img_demoness_castle_description: "\"How dare you have defiled my village and freed my slaves from their eternal pleasure? And now you approach my castle! Don't you dare take another step or you will become my docile puppet\"",
  	img_enso_multitude: "Enso Multitude",
  	img_enso_multitude_description: "In the Far East there is a civilization that can rival us for primacy on Theresmore. They call themselves Enso, the enlightened ones, the very force of the universe. Their symbol is a circle, they have almond-shaped eyes and their complexion is yellowish. They invented gunpowder and their warriors are fierce in battle and swarm like a multitude over the unfortunate enemy armies. They keep vast stores of Natronite of which they are very jealous; perhaps it would be better to make friends with them",
  	img_fallen_angel_army_1: "Fallen Angel musket demon army",
  	img_fallen_angel_army_1_description: "Past eras have taught us how to be cautious. The Druid was a Fallen Angel eager to take possession of natronite and the new weapons it brings. He set up an army of demons to whom he entrusted state-of-the-art weapons. The assault against the city was lightning fast but, by all the gods, our soldiers know how to deal with these abominations and their feathered leader. The walls of our city are unbreakable and now the creepy, once holy demon lies torn apart on the battlefield",
  	img_fallen_angel_army_2: "Fallen Angel demon army",
  	img_fallen_angel_army_2_description: "The garrison of our city awaited the onslaught of demons. Infernal monsters crashed on our walls in wave after wave and were repulsed. The Fallen Angel ordered a final assault with his entire rear guard: demons of all sorts breathed fire and tried to tear apart helpless soldiers and civilians. Our ranks, however, did not yield to evil; with the same light that had unmasked the impostor Druid they reacted to the gloomy assault by driving the abominations of the underworld back into the mud. The Fallen Angel deprived of his wings lay dead on the battlefield. Theresmore WON!",
  	img_feudalism: "The birth of the second era",
  	img_feudalism_description: "From the ancient era we are ready to build tall spires and turn our village into a small town. Feudalism knocks at our doors with its knights in heavy armor. Let the second era of men begin",
  	img_glorious_retirement: "Glorious retirement",
  	img_glorious_retirement_description: "You have done so much for this kingdom and for your people, maybe it's time to retire to private life and let someone else begin the adventure again to do even more! THERESMORE!",
  	img_holy_fury: "The battle Angel",
  	img_holy_fury_description: "The gods have given us battle angels, as beautiful to see as they are terrible on the battlefield. With them we will dominate Theresmore",
  	img_king_kobold_nation: "The King of Kobold declares war!",
  	img_king_kobold_nation_description: "Who would have imagined that these little beings could be so socially evolved? All the Kobolds of Theresmore united under their king are coming out from underground to attack us!",
  	img_magic: "Faith and Magic",
  	img_magic_description: "Since ancient times, our predecessors have relied on the gods for grace and help. Their prayers generated the faith so pleasing to the higher beings who command us. They released the Mana on Theresmore so that every person could feel it and honor it. Magic is an essential part of our nation, and mastering it will enable us to gain immense benefits",
  	img_markanat_forest: "Markanat's forest",
  	img_markanat_forest_description: "The abode of Markanat, a mighty and enormous spider who guards his flooded forest. Its strength is immense, capable of crushing scores of men. Fame and glory await us if we can defeat him",
  	img_marketplace: "The Marketplace",
  	img_marketplace_description: "The market is the beating heart of our village. From now on merchants from all over Theresmore will be able to sell and buy livestock and goods of all kinds, as we continue to develop this area we will be able to turn it into a fair and thus be able to let this continent know the value of our goods",
  	img_mana_engine: "Mana engine",
  	img_mana_engine_description: "Our savants have discovered how to create machines that run on mana. It combines with saltpetre and creates an unstable resource: natronite. With it our civilization enters a new era of mechanics and prodigies, will we manage not to turn Theresmore into a huge cauldron of production? Will we maintain our attachment to the earth and Mother Nature? Welcome to the Fourth Age!",
  	img_nightdale_protectorate: "Nightdale Protectorate",
  	img_nightdale_protectorate_description: "In the far, cold north a group of barbarian tribes have banded together to become a kingdom that endures the inhospitable climate. They are famous and valiant warriors and excel in iron forging. In perpetual struggle with the barbarians of the barren lands they protect the Northern Star, a powerful artifact located in the perennial ice",
  	img_orc_horde_boss: "Orc horde assault",
  	img_orc_horde_boss_description: "As the final assault of the orc horde approached, the humans braced themselves for the imminent battle. Their fortified walls rose tall and proud, a symbol of the strength and determination of their people. But the orcs, fueled by their barbaric rage, were relentless. They stormed the ramparts, their howls of fury echoing across the battlefield. The humans fought with all their might, wielding the power of their technology to crush the orcish invaders. The clash of steel against steel and the roar of magic filled the air as the two armies clashed in a struggle for survival. But in the end, the humans emerged victorious, their bravery and cunning proving to be the decisive factor. The last remnants of the orcish warriors were scattered and Theresmore was safe once again, its people rejoicing in the triumph of their heroes. The winds of victory carried their cheers to the skies, a testament to the unbreakable spirit of humanity",
  	img_reactivate_portal: "Army of the dead",
  	img_reactivate_portal_description: "By reactivating the portal you have created a conduit to the realm of the dead, the skeleton king's unstoppable army is waiting to devastate Theresmore, it must be stopped before it is too late ",
  	img_sssarkat_empire: "Sssarkat Empire",
  	img_sssarkat_empire_description: "In the warm waters beyond the realm of Zultan are salamander-like creatures that live mostly underwater. They are repositories of a vanished ancient civilization and populate its ruins by making use of remaining technology. They often visit the mainland and some of their villages can be found on the sunny shores",
  	img_scalerock_tribes: "Scalerock Tribes",
  	img_scalerock_tribes_description: "In the high peaks of the Scalerock Mountains, there are tribes of draconians. They live in caves carved into the rock and fly over the high peaks to swoop down on their unsuspecting enemies. Descendants of dragons have retained their intelligence and craftsmanship in creating objects. They know natronite, perhaps from an ancestral legacy, and are greedy for it beyond measure",
  	img_skullface_encampment: "Skullface the Bandit Leader",
  	img_skullface_encampment_description: "Skullface is the leader of the bandits in the region. Despite being a danger to the economic stability of our settlement he is a charismatic and cunning leader",
  	img_start: "The beginning of human era",
  	img_start_description: "From nomadic hunters and gatherers, our people have grown up and are ready to settle in a fertile valley. From here will arise, perhaps, the greatest nation Theresmore has known. The age of man has just begun",
  	img_strange_encounter: "A strange encounter",
  	img_strange_encounter_description: "But with caution we must proceed, for these woodland beings are a mystery, shrouded in whispers and tales passed down through generations. Their fleet-footed grace and deadly accuracy with the bow are but a mere glimpse of their mastery over the forests. The settlers' encounter is a historic moment, a chance for our civilization to reach out and make contact with a new race. So, let us approach with respect, openness, and diplomacy. For who knows what gifts of knowledge, resources, and friendship these elusive creatures may bring to our growing colony",
  	img_theresmore_richest_nation: "The richest nation in Theresmore!",
  	img_theresmore_richest_nation_description: "Our merchants range in every corner of Theresmore, our warehouses are dripping with gold, and there is no one who cannot be bought or subjugated by our economy",
  	img_theresmore_wanders: "Theresmore Wanders",
  	img_theresmore_wanders_description: "In the steppes of the east, the inhabitants continue to be nomads. Their camps stretch for miles, they exploit the region's resources and then move on, looking for a new place to settle. Formidable on horseback they use their mobility to carry out raids on neighboring kingdoms. Often unreliable, they rule the largest pastures all over Theresmore",
  	img_vampire_lair: "The Vampire",
  	img_vampire_lair_description: "Sitting on a pile of bones in her hiding place here is the vampire appearing. Eyes red as fire, raven wings pitch black. She would be a beautiful woman if only her power were not used to feed on humans. The General assures that we can defeat her but at what cost?",
  	img_western_kingdom: "Western Kingdom",
  	img_western_kingdom_description: "The glory of the west, Theresmore's most advanced kingdom. Its castles can be seen from miles away and their cities are rich and bustling. On the battlefield they use their heavy cavalry that shakes the earth and makes enemies tremble. They possess the accesses to the western sea, the only true maritime outlet for all who inhabit this continent",
  	img_zultan_emirate: "Zultan Emirate",
  	img_zultan_emirate_description: "Several autonomous city-states flourish in the sunny sands of the south. They answer to the great Emir of Zultan, the most powerful of these metropolises. A people developed in the most inhospitable lands of Theresmore and flourished through trade reaching every part of the continent. They protect the flame of Atamar who is said to have founded the city of Zultan",
  	leg_ancient_balor_l: "Ancient Balor",
  	leg_ancient_balor_l_description: "Summon the ancient demon",
  	leg_ancient_vault: "Ancient Vault",
  	leg_ancient_vault_description: "Unlock the Ancient Vault",
  	leg_ancient_treasury: "Ancient Treasury",
  	leg_ancient_treasury_description: "An aid to minds and pockets",
  	leg_ancient_treasury_II: "Ancient Treasury II",
  	leg_ancient_treasury_II_description: "Revealing and buying Theresmore",
  	leg_ancient_treasury_III: "Ancient Treasury III",
  	leg_ancient_treasury_III_description: "Bye bye caps",
  	leg_ancient_treasury_IV: "Ancient Treasury IV",
  	leg_ancient_treasury_IV_description: "Solving research problems",
  	leg_angel: "Battle Angel",
  	leg_angel_description: "A holy warrior who fights for men",
  	leg_architecture_titan: "Architecture of the Titans",
  	leg_architecture_titan_description: "Unlock the Titan Work Area",
  	leg_army_of_men: "Army of Men",
  	leg_army_of_men_description: "Let's enlarge our army",
  	leg_army_of_men_II: "Army of Men II",
  	leg_army_of_men_II_description: "The west will not fall",
  	leg_army_of_men_III: "Army of Men III",
  	leg_army_of_men_III_description: "We are legion!",
  	leg_army_of_men_IV: "Army of Men IV",
  	leg_army_of_men_IV_description: "We are swarm!",
  	leg_army_of_men_V: "Army of Men V",
  	leg_army_of_men_V_description: "We are multitude!",
  	leg_cpt_galliard_story: "Captain Galliard Story",
  	leg_cpt_galliard_story_description: "Unlock the Story of Captain Galliard",
  	leg_charism: "Charism",
  	leg_charism_description: "Your name will be spoken more often",
  	leg_charism_II: "Charism II",
  	leg_charism_II_description: "One man shall reign",
  	leg_clever_villagers: "Clever Villagers",
  	leg_clever_villagers_description: "Our population is getting smarter",
  	leg_clever_villagers_II: "Clever Villagers II",
  	leg_clever_villagers_II_description: "Less research problems",
  	leg_clever_villagers_III: "Clever Villagers III",
  	leg_clever_villagers_III_description: "Research innovation",
  	leg_coin_mercenary: "Coin Mercenary",
  	leg_coin_mercenary_description: "Unlock the Canava Guard mercenary unit",
  	leg_cpt_galliard_l: "Cpt Galliard",
  	leg_cpt_galliard_l_description: "Hire the Captain Galliard",
  	leg_craftmen: "Craftsmen",
  	leg_craftmen_description: "Producing researched materials",
  	leg_craftmen_II: "Craftsmen II",
  	leg_craftmen_II_description: "Are you having trouble with supplies?",
  	leg_craftmen_III: "Craftsmen III",
  	leg_craftmen_III_description: "No more trouble with supplies",
  	leg_craftmen_IV: "Craftsmen IV",
  	leg_craftmen_IV_description: "Problem with Natronite?",
  	leg_craftmen_V: "Craftsmen V",
  	leg_craftmen_V_description: "No more trouble with Natronite",
  	leg_deep_pockets: "Deep Pockets",
  	leg_deep_pockets_description: "Pockets to store a lot of gold",
  	leg_deep_pockets_II: "Deep Pockets II",
  	leg_deep_pockets_II_description: "More gold, more stuffs",
  	leg_deep_pockets_III: "Deep Pockets III",
  	leg_deep_pockets_III_description: "Swimming in gold",
  	leg_defensive_rampart: "Rampart",
  	leg_defensive_rampart_description: "Unlock the Rampart",
  	leg_elysian_field: "Elysian Field",
  	leg_elysian_field_description: "The gods give us a Theresmore paradise",
  	leg_elysian_field_II: "Elysian Field II",
  	leg_elysian_field_II_description: "Let's enlarge and guard the paradise",
  	leg_elysian_field_III: "Elysian Field III",
  	leg_elysian_field_III_description: "Nectar of the gods",
  	leg_enhanced_axes: "Enhanced Axes",
  	leg_enhanced_axes_description: "Improved axes for our lumberjacks",
  	leg_enhanced_axes_II: "Enhanced Axes II",
  	leg_enhanced_axes_II_description: "Even better axes for our lumberjacks",
  	leg_enhanced_axes_III: "Enhanced Axes III",
  	leg_enhanced_axes_III_description: "Titanium axes for our lumberjacks",
  	leg_enhanced_axes_IV: "Enhanced Axes IV",
  	leg_enhanced_axes_IV_description: "Epic axes for our lumberjacks",
  	leg_enhanced_pickaxes: "Enhanced Pickaxes",
  	leg_enhanced_pickaxes_description: "Improved pickaxes for our miners",
  	leg_enhanced_pickaxes_II: "Enhanced Pickaxes II",
  	leg_enhanced_pickaxes_II_description: "Even better pickaxes for our miners",
  	leg_enhanced_pickaxes_III: "Enhanced Pickaxes III",
  	leg_enhanced_pickaxes_III_description: "Titanium pickaxes for our miners",
  	leg_enhanced_pickaxes_IV: "Enhanced Pickaxes IV",
  	leg_enhanced_pickaxes_IV_description: "Epic pickaxes for our miners",
  	leg_free_hands: "Free Hands",
  	leg_free_hands_description: "We need more population!",
  	leg_free_hands_II: "Free Hands II",
  	leg_free_hands_II_description: "Even more population! This is the way!",
  	leg_free_hands_III: "Free Hands III",
  	leg_free_hands_III_description: "Population? POPULATION!",
  	leg_free_hands_IV: "Free Hands IV",
  	leg_free_hands_IV_description: "Baby BOOM!",
  	leg_grain_storage: "Grain storage",
  	leg_grain_storage_description: "Unlock the Granary",
  	leg_gift_creators: "Gift from the Creators",
  	leg_gift_creators_description: "Creators help us build",
  	leg_gift_nature: "Gift of Nature",
  	leg_gift_nature_description: "Nature provides us with abundant resources",
  	leg_guild_craftsmen: "Guild of craftsmen",
  	leg_guild_craftsmen_description: "Unlock the Guild of craftsmen",
  	leg_juggernaut: "Juggernaut",
  	leg_juggernaut_description: "An undead giant tank",
  	leg_hall_dead: "Hall of the Dead",
  	leg_hall_dead_description: "Hall where the dead work",
  	leg_hall_wisdom: "Hall of Wisdom",
  	leg_hall_wisdom_description: "Hall of research from the past",
  	leg_heirloom_contract: "Heirloom of the Contract",
  	leg_heirloom_contract_description: "Hidden in the Monument enhances its strength",
  	leg_heirloom_death: "Heirloom of the Death",
  	leg_heirloom_death_description: "Hidden in the Monument enhances its strength",
  	leg_heirloom_horseshoes: "Heirloom of the Horseshoes",
  	leg_heirloom_horseshoes_description: "Hidden in the Monument enhances its strength",
  	leg_heirloom_momento: "Heirloom of the Momento",
  	leg_heirloom_momento_description: "Hidden in the Monument enhances its strength",
  	leg_heirloom_wealth: "Heirloom of the Wealth",
  	leg_heirloom_wealth_description: "Hidden in the Monument enhances its strength",
  	leg_heirloom_wisdom: "Heirloom of the Wisdom",
  	leg_heirloom_wisdom_description: "Hidden in the Monument enhances its strength",
  	leg_irrigation_techniques: "Irrigation Techniques",
  	leg_irrigation_techniques_description: "Better technique for more food",
  	leg_irrigation_techniques_II: "Irrigation Techniques II",
  	leg_irrigation_techniques_II_description: "Even better technique for more food",
  	leg_irrigation_techniques_III: "Irrigation Techniques III",
  	leg_irrigation_techniques_III_description: "Like a Venice of canals",
  	leg_irrigation_techniques_IV: "Irrigation Techniques IV",
  	leg_irrigation_techniques_IV_description: "Agriculture with no secrets",
  	leg_library_theresmore: "Library of Theresmore",
  	leg_library_theresmore_description: "Unlock the Library of Theresmore",
  	leg_militia_recruitment: "Militia recruitment",
  	leg_militia_recruitment_description: "Unlock the Castrum Militia",
  	leg_ministry_interior_l: "Ministry of Interior",
  	leg_ministry_interior_l_description: "Unlock the Ministry, for research and logistic",
  	leg_ministry_war_l: "Ministry of War",
  	leg_ministry_war_l_description: "Unlock the Ministry, for army and power",
  	leg_ministry_worship_l: "Ministry of Worship",
  	leg_ministry_worship_l_description: "Unlock the Ministry, for magic and faith",
  	leg_machines_gods: "Machines of the Gods",
  	leg_machines_gods_description: "The production machines of the gods",
  	leg_mercenary_agreements: "Mercenary agreements",
  	leg_mercenary_agreements_description: "The power of coins to create a lethal mercenary army",
  	leg_mercenary_agreements_II: "Mercenary agreements II",
  	leg_mercenary_agreements_II_description: "Pecunia non olet",
  	leg_mercenary_agreements_III: "Mercenary agreements III",
  	leg_mercenary_agreements_III_description: "The end justifies the means",
  	leg_monastic_orders: "Monastic orders",
  	leg_monastic_orders_description: "Unlock the Monastery",
  	leg_monument_1: "Monument",
  	leg_monument_1_description: "Unlock the Monument",
  	leg_powered_weapons: "Powered Weapons",
  	leg_powered_weapons_description: "New weapons for the army",
  	leg_powered_weapons_II: "Powered Weapons II",
  	leg_powered_weapons_II_description: "More deadly weapons",
  	leg_powered_weapons_III: "Powered Weapons III",
  	leg_powered_weapons_III_description: "Even better deadly weapons",
  	leg_powered_weapons_IV: "Powered Weapons IV",
  	leg_powered_weapons_IV_description: "A very deadly army",
  	leg_powered_weapons_V: "Powered Weapons V",
  	leg_powered_weapons_V_description: "Late era buffs",
  	leg_powered_weapons_VI: "Powered Weapons VI",
  	leg_powered_weapons_VI_description: "Immortal army",
  	leg_powered_weapons_VII: "Powered Weapons VII",
  	leg_powered_weapons_VII_description: "Invincible army",
  	leg_priest: "Priest",
  	leg_priest_description: "Unlock the Priest unit",
  	leg_regional_market: "Regional Markets",
  	leg_regional_market_description: "Unlock the Regional Markets",
  	leg_renowned_stonemasons: "Renowned Stonemasons",
  	leg_renowned_stonemasons_description: "Skilled workers for the quarry",
  	leg_renowned_stonemasons_II: "Renowned Stonemasons II",
  	leg_renowned_stonemasons_II_description: "More skilled workers for the quarry",
  	leg_renowned_stonemasons_III: "Renowned Stonemasons III",
  	leg_renowned_stonemasons_III_description: "Veterans of quarry!",
  	leg_renowned_stonemasons_IV: "Renowned Stonemasons IV",
  	leg_renowned_stonemasons_IV_description: "Masters of quarry!",
  	leg_resource_cap: "Resource Cap",
  	leg_resource_cap_description: "A help to our warehouses",
  	leg_resource_cap_II: "Resource Cap II",
  	leg_resource_cap_II_description: "More space to our warehouses",
  	leg_resource_cap_III: "Resource Cap III",
  	leg_resource_cap_III_description: "More space for our valuables",
  	leg_resource_cap_IV: "Resource Cap IV",
  	leg_resource_cap_IV_description: "Even more space for our valuables",
  	leg_resource_cap_V: "Resource Cap V",
  	leg_resource_cap_V_description: "A LOT of space for our valuables",
  	leg_resource_cap_VI: "Resource Cap VI",
  	leg_resource_cap_VI_description: "Great space for our valuables",
  	leg_resource_cap_VII: "Resource Cap VII",
  	leg_resource_cap_VII_description: "Huge space for our valuables",
  	leg_resource_cap_VIII: "Resource Cap VIII",
  	leg_resource_cap_VIII_description: "Gargantuan space for our valuables",
  	leg_seraphim_l: "Seraphim",
  	leg_seraphim_l_description: "The highest in rank in the angelic tiers",
  	leg_shieldbearer: "Shieldbearer",
  	leg_shieldbearer_description: "Unlock the Shieldbearer unit",
  	leg_shopkeepers_and_breeders: "Shopkeepers and Breeders",
  	leg_shopkeepers_and_breeders_description: "A bonus to our artisans and breeders",
  	leg_shopkeepers_and_breeders_II: "Shopkeepers and Breeders II",
  	leg_shopkeepers_and_breeders_II_description: "We can attend some horse fairs",
  	leg_shopkeepers_and_breeders_III: "Shopkeepers and Breeders III",
  	leg_shopkeepers_and_breeders_III_description: "Master of tools and horses",
  	leg_spikes_and_pits: "Spikes and Pits",
  	leg_spikes_and_pits_description: "Traps around the settlement",
  	leg_spikes_and_pits_II: "Spikes and Pits II",
  	leg_spikes_and_pits_II_description: "More traps around the settlement",
  	leg_spikes_and_pits_III: "Spikes and Pits III",
  	leg_spikes_and_pits_III_description: "Relic power to boost defense",
  	leg_spikes_and_pits_IV: "Spikes and Pits IV",
  	leg_spikes_and_pits_IV_description: "More Relic power!",
  	leg_spikes_and_pits_V: "Spikes and Pits V",
  	leg_spikes_and_pits_V_description: "This Juggernaut is a beast!",
  	leg_stock_resources: "Stock Resources",
  	leg_stock_resources_description: "A bunch of resource for an easy start",
  	leg_stock_resources_II: "Stock Resources II",
  	leg_stock_resources_II_description: "A lot of resource for an easy start",
  	leg_stonemason_l: "Stonemason",
  	leg_stonemason_l_description: "Unlock the Stonemason",
  	leg_strengthening_faith: "Strengthening Faith",
  	leg_strengthening_faith_description: "More convinced prayers",
  	leg_strengthening_faith_II: "Strengthening Faith II",
  	leg_strengthening_faith_II_description: "Mana and faith for everyone",
  	leg_strong_workers: "Strong Workers",
  	leg_strong_workers_description: "Your citizens will collect more resources manually",
  	leg_strong_workers_II: "Strong Workers II",
  	leg_strong_workers_II_description: "Your citizens will collect even more resources manually",
  	leg_train_colonial: "Train Colonial Army",
  	leg_train_colonial_description: "We create a more effective colonial force",
  	leg_train_colonial_II: "Train Colonial Army II",
  	leg_train_colonial_II_description: "Better equipment for colonial army",
  	leg_undead_herds: "Undead Herds",
  	leg_undead_herds_description: "Learn how to breed undead herds",
  	leg_wall_titan: "Titanic Walls",
  	leg_wall_titan_description: "Unlock the Titanic Walls",
  	leg_weapons_titan: "Weapons of the Titan",
  	leg_weapons_titan_description: "The Titan gives us his weapons",
  	leg_white_m_company: "White Company",
  	leg_white_m_company_description: "Unlock the White Company mercenary unit",
  	leg_woodworking: "Woodworking",
  	leg_woodworking_description: "Unlock the Sawmill",
  	log_bui_1_alchemic_laboratory: "Alchemists will produce saltpetre for the production of arquebuses and bombards",
  	log_bui_1_artisan_workshop: "With the artisan's workshops we will be able to build all the tools that will help in other jobs",
  	log_bui_5_artisan_workshop: "Your settlement is known for its local products",
  	log_bui_7_artisan_workshop: "Our artisan learn how to create better equipments for our army",
  	log_bui_13_artisan_workshop: "We can create much better equipments now",
  	log_bui_15_artisan_workshop: "Along with grocery and carpentry workshops, this district is the productive heart of the city",
  	log_bui_1_barracks: "With the first barracks comes our mighty army",
  	log_bui_8_bank: "Now that we have enough banks we can create a vault to store our gold",
  	log_bui_1_carpenter_workshop: "With wood, stone and tools we can now create building materials",
  	log_bui_1_city_hall: "Human settlements need centers where they can exercise justice and power",
  	log_bui_1_city_center: "The feudal era has begun",
  	log_bui_1_colony_hall: "Now we can choose the specialization of our colony. In the research tab there are 3 possibilities: military, productive or faith. Choose carefully, only one specialization is possible",
  	log_bui_2_colony_hall: "The development of the colony has created a fervent desire for new technology at home",
  	log_bui_3_colony_hall: "We need to start exploiting the nature surrounding the colony",
  	log_bui_4_colony_hall: "Some mysterious figures are spying on our colony from the surrounding woods",
  	log_bui_5_colony_hall: "Our colony is growing, we can seek new specializations",
  	log_bui_6_colony_hall: "It is time for our scouts to start exploring the new world",
  	log_bui_8_colony_hall: "The Elves require our presence, it looks like we will get to know the QualarRoktam and it will not be friendly at all",
  	log_bui_10_colony_hall: "Our colony is now a little city, we can seek new specializations",
  	log_bui_12_colony_hall: "Some isolated farms in the colony have been looted and burned. The slain settlers had horrendous wounds inflicted with great force; no children were found",
  	log_bui_15_colony_hall: "Our colony is the pride of all Theresmore. Let's build a wonder to celebrate it!",
  	log_bui_5_common_house: "Your settlement is starting to grow",
  	log_bui_8_common_house: "The memory of the past times is alive and is handed down from father to son, we can now research the mythology",
  	log_bui_15_common_house: "Congratulations, your little settlement is now a village!",
  	log_bui_1_credit_union: "We can now assume traders in the population tab",
  	log_bui_5_farm: "Our farmers are learning to farm better and better",
  	log_bui_15_farm: "The development of agriculture is creating new landowners",
  	log_bui_1_grocery: "With food and livestock we can now create supplies",
  	log_bui_1_island_outpost: "Thanks to this outpost we will now be able to explore the vast ocean",
  	log_bui_1_industrial_plant: "In the industrial plant, our artisans turn into workers",
  	log_bui_1_library_souls: "Scholars are partially transformed into the undead, which explains the resulting abundance of food. They no longer have to feed themselves and can work without the need for sleep",
  	log_bui_5_lumberjack_camp: "A community of woodcarvers is emerging",
  	log_bui_15_lumberjack_camp: "Our woodworking is reaching a quality envied by many other kingdoms",
  	log_bui_1_mansion: "To conclude the feudal era we will have to create more universities, grocery, steelworks, carpentry workshop and mansion. This will make our village a city!",
  	log_bui_1_marketplace: "Finally the market! Now we can buy and sell goods",
  	log_bui_5_marketplace: "The market is getting bigger, we will be able to organize fairs",
  	log_bui_1_magic_circle: "How many amazing things we can do with mana. But beware of its dark side",
  	log_bui_1_military_academy: "Some plans to make a defensive super weapon were presented at the military academy",
  	log_bui_1_military_camp: "The Quartermaster will help us with food supply for the army",
  	log_bui_1_ministry_development: "As we continue to build more ministries we will have access to new technologies",
  	log_bui_5_mine: "Your miners descend into the depths",
  	log_bui_10_mine: "The depths of Theresmore are places to stay away from, continuing to dig could be very dangerous",
  	log_bui_15_mine: "In the mines we found a strange portal full of ancient symbols that resonate with mana. We have to build the pillars of mana to proceed",
  	log_bui_1_monument: "The Monument is the legacy of past lives. Enclosed within it are heirlooms that, when acquired and researched, will greatly aid our settlement",
  	log_bui_1_officer_training_ground: "Now we can recruit the General",
  	log_bui_2_quarry: "As we continue digging in the quarry we may find more minerals",
  	log_bui_3_quarry: "Quarrymen have found metal deposits",
  	log_bui_5_quarry: "New tools increase stone quarrying",
  	log_bui_15_quarry: "An industry is flourishing on the rocks we process, production increases further",
  	log_bui_1_refugee_district: "A scruffy old man comes forward among the refugees; he is convinced that the skull kept in one of the burned villages was the reason the beast attacked. The ancient artifact has been preserved by the old man and he now hands it to you",
  	log_bui_1_pillars_of_mana: "As soon as we activated our first pillar of mana a big tremor was heard in the depths of the mines",
  	log_bui_1_research_plant: "We can now hire researchers",
  	log_bui_1_wall: "Now that we have finished the walls we can enrich our defenses with magical defense systems, siege machines and a perimeter of sentinels",
  	log_bui_1_watchman_outpost: "With at least four outposts we will be able to tell if any enemy armies are approaching the settlement",
  	log_bui_1_stable: "Horses for the army and cows for the market. The village is thriving",
  	log_bui_1_steelworks: "Now we can produce steel for our army",
  	log_bui_1_temple: "Through our faith the ancient gods will hear us",
  	log_bui_7_temple: "With all these temples we can ask for a blessing for our warriors",
  	log_bui_13_temple: "An army of faith is ready to take action",
  	log_bui_1_tower_mana: "Now with the four Power Spell we can build the Mausoleum and offer to the gods what they will ask for in sacrifice. This will lead us to Ascension",
  	log_bui_1_university: "Our professors through magical elements can now synthesize crystals",
  	log_bui_7_university: "A mage from lands afar introduces himself as Zenix. Intrigued by your settlement's history and magical studies, he wishes to learn from your greatest professors",
  	log_cap_5000_food: "We must exploit the abundance of our lands",
  	log_dip_attack_is_coming: "Our watchmen have discovered an impending attack! TO THE WALLS!",
  	log_dip_enso_multitude: "Our scouts headed far east and discover a civilized nation called the Enso Multitude",
  	log_dip_nightdale_protectorate: "Our scouts headed north discovering a nation formed by many warrior tribes, the Protectorate of Nightdale",
  	log_dip_scalerock_tribes: "Our scouts venture in the Scalerock mountains and discover the draconic people of the Scalerock Tribes",
  	log_dip_sssarkat_empire: "Our scouts following the legends of a fabulous lost civilization came to the presence of the Sssarkat Empire",
  	log_dip_western_kingdom: "Our scouts went west where they found a technologically advanced kingdom. Great castles and gleaming armors are their pride and joy",
  	log_dip_theresmore_wanders: "Our scouts ventured into the wild east, returned with strange tales of nomadic tribes roaming the boundless plains",
  	log_dip_zultan_emirate: "Our scouts went into the deserts of the south discovering a rich kingdom whose flourishing trade crosses all Theresmore",
  	log_dip_king_kobold_nation: "After conquering the underground Kobolds a message came to you: I MAUGRITH KING OF THE KOBOLD WILL DESTROY YOUR CITY",
  	log_dip_barbarian_horde: "Our scouts have discovered that a horde of barbarians is approaching our valley. Their king claims the blood of his people that we have spilled. WE ARE AT WAR",
  	log_dip_relationship_neutral: "Our relationships are now neutral with this faction. If we improve relations we can ally, if we worsen them we can declare war",
  	log_dip_relationship_positive: "Our relationships are now positive with this faction",
  	log_dip_relationship_negative: "Our relationships are now negative with this faction",
  	log_ene_ancient_burial_place: "Our scout found a haunted burial site, where did I put my sacred symbol?",
  	log_ene_ancient_giant: "Our scout discovered the cave of the Ancient Giant!",
  	log_ene_ancient_hideout: "Our scout found an ancient hideout, will there still be loot left?",
  	log_ene_ball_lightning_field: "Our scout found a field full of Ball lightning, beware of electric shock",
  	log_ene_galliard_mercenary_camp: "Our scout discovered the camp of a famous mercenary captain!",
  	log_ene_lead_golem_mine: "Our scout found an old mine inhabited by lead golems",
  	log_ene_king_reptiles: "Our scout discovered an forgotten valley full of giant reptiles",
  	log_ene_harpy_nest: "Our scout found a harpy nest! He was almost charmed by the songs",
  	log_ene_barbarian_camp: "Our scout return to the village pale and agitated, his source of fear is one: barbarians!",
  	log_ene_barbarian_village: "Our scout found a barbarian village; who knows if we can export our civilization to them as well?",
  	log_ene_barren_hills: "Our scout explored a barren region filled with kobolds and giants",
  	log_ene_bugbear_tribe: "Our scout found a bugbear tribe, these large goblin-like humanoids raid the region",
  	log_ene_bugbear_war_party: "Our scout found a war party of bugbears! They are looting led by their chieftain",
  	log_ene_burning_pit: "Our scout discovered a place from where demons emerge to haunt Theresmore",
  	log_ene_citadel_dead: "Our scout discovered a haunted citadel. Watch out for zombies and wyverns (and a few many ghouls)",
  	log_ene_construction_site: "Our scout discovered a large building space, let's conquer it",
  	log_ene_death_1: "Your scout found nothing and vanished out of shame rather than return",
  	log_ene_death_2: "Your scout has been captured and now adorns a tree",
  	log_ene_death_3: "Your scout met a demoness and gave up his freedom",
  	log_ene_death_4: "Your scout went through a portal and hasn't been seen since",
  	log_ene_death_5: "Your scout was killed while running away from a hen",
  	log_ene_death_6: "Your scout was killed by a 6-eyed horror",
  	log_ene_death_7: "Your scout has fallen into an abyss",
  	log_ene_death_8: "Your scout died from drinking too much schnapps",
  	log_ene_death_9: "Your scout was impaled by a fence",
  	log_ene_death_10: "Your scout was beheaded by an angry farmer",
  	log_ene_death_11: "Your scout bled to death after a confrontation with a goblin",
  	log_ene_death_12: "Your scout died poisoned by a goblin arrow",
  	log_ene_death_13: "Your scout was devoured by a greater demon",
  	log_ene_death_14: "Your scout was killed while spying on a bandit encampment",
  	log_ene_death_15: "Your scout died crushed under the weight of the loot",
  	log_ene_death_16: "Your scout died falling out of a tree",
  	log_ene_death_17: "Your scout died petrified by a basilisk",
  	log_ene_death_18: "Your scout died fighting a three-headed ostrich",
  	log_ene_death_19: "Your scout was killed by an assassin",
  	log_ene_death_20: "Your scout died while eating gnoll meat",
  	log_ene_death_21: "Your scout has been turned into a zombie by a necromancer",
  	log_ene_death_22: "Your scout was beaten to death by deserters",
  	log_ene_death_23: "Your scout died crashed by a troll",
  	log_ene_death_24: "Your scout has deserted",
  	log_ene_death_25: "Your scout died of dysentery",
  	log_ene_death_26: "Your scout died when he was hit by a horse",
  	log_ene_death_27: "Your scout died bitten by a poisonous snake",
  	log_ene_death_28: "Your scout died of septicemia",
  	log_ene_death_29: "Your scout died fighting a poor seagull",
  	log_ene_death_30: "Your scout died fighting an undead dragon",
  	log_ene_death_31: "Your scout met a dark fate and did not return",
  	log_ene_death_32: "Your scout die swarmed by 595 skeletons",
  	log_ene_death_33: "Your scout died of a heart attack caused by a sudden laughter outburst while facing a comedic situation",
  	log_ene_death_34: "Your scout died falling off a cliff while trying to take a selfie with a breathtaking view",
  	log_ene_death_35: "Your scout was swallowed whole by a giant toad while investigating strange croaking noises",
  	log_ene_death_36: "Your scout was eaten by a dragon while trying to steal a shiny object from its hoard",
  	log_ene_death_37: "Your scout died of hypothermia after taking a wrong turn in a blizzard and getting lost",
  	log_ene_death_38: "Your scout was devoured by a pack of wild boars while searching for truffles",
  	log_ene_death_39: "Your scout was killed by friendly fire from his own companions while trying to ward off an attack from a herd of stampeding elephants",
  	log_ene_death_40: "Your scout died drowning in a river after tripping on a rock and losing balance while crossing",
  	log_ene_death_41: "Your scout was stung to death by a swarm of killer bees while investigating a strange humming noise",
  	log_ene_death_42: "Your scout was trapped in quicksand while trying to find a shortcut",
  	log_ene_death_43: "Your scout was killed by a rogue cheese wheel rolling down a hill while investigating strange noises in a nearby dairy farm",
  	log_ene_death_44: "Your scout was trampled by a herd of unicorns while trying to capture one for a rare glimpse",
  	log_ene_death_45: "Your scout died of exhaustion after a never-ending game of hide and seek with a mischievous fairy",
  	log_ene_death_46: "Your scout was incinerated by a dragon's fiery breath while trying to retrieve a lost arrow",
  	log_ene_death_47: "Your scout was swallowed by a giant snake while searching for exotic herbs in a dense jungle",
  	log_ene_death_48: "Your scout died from falling coconuts while investigating strange noises in a palm tree forest",
  	log_ene_death_49: "Your scout was killed by a friendly giant who mistook him for a pesky insect while napping",
  	log_ene_death_50: "Your scout was swallowed by a giant fish while trying to catch a glimpse of the legendary 'big one'",
  	log_ene_death_51: "Your scout was hit by a meteorite while stargazing on a clear night",
  	log_ene_death_52: "Your scout was killed by a mischievous demon while playing a game of cat and mouse in the underworld",
  	log_ene_death_53: "Your scout died of a snake bite while trying to capture a rare species for research",
  	log_ene_death_54: "Your scout was killed by a wild turkey while investigating strange gobbling noises in the forest",
  	log_ene_death_55: "Your scout died of a heart attack caused by a terrifying ghost while investigating strange noises in an abandoned mansion",
  	log_ene_death_56: "Your scout was killed by a tornado while trying to capture a snapshot of the natural wonder",
  	log_ene_death_57: "Your scout was crushed by a giant tree that fell during a storm while taking shelter under it",
  	log_ene_demonic_portal: "Our scout discovered a portal surrounded by demons",
  	log_ene_demoness_castle: "Our scout discovered the castle of the demoness",
  	log_ene_desecrated_temple: "Our scout discovered what remains of the Luna Temple, the stench of decomposition reaches hundreds of meters",
  	log_ene_deserters_den: "Our scout discovered a cove of deserter and bandits",
  	log_ene_djinn_palace: "Our scout discovered where the Djinn had gone, created a magnificent glass palace and guarded it with several naga",
  	log_ene_east_sacred_place: "Our scout discovered the east sacred place!",
  	log_ene_earth_elemental_circle: "Our scout discovered the Earth elemental circle!",
  	log_ene_eternal_halls: "Our scout discovered the Eternal Halls, we must conquer them to prove our worth to the people of the west",
  	log_ene_ettin_camp: "Our scout discovered an Ettin Camp, natives are locked up in cages perhaps as a bargaining chip",
  	log_ene_ettin_enslaver: "Our scout discovered an Ettin tribe trading in slaves",
  	log_ene_hell_hole: "Our scout discovered an entrance to the underworld, demons patrol the cave and the horrors we will find there will be unimaginable. Warning!",
  	log_ene_loot: "Your scout returned to the settlement and brought back everything he could find",
  	log_ene_no_loot: "Your scout explored the territories for days but came back empty handed",
  	log_ene_bandit_camp: "Our scout discovered an encampment of bandits. By knocking it out we can eliminate the threat to our farmers and merchants",
  	log_ene_basilisk_cave: "Our scout discovered a cave of basilisks, beware of their petrifying gaze",
  	log_ene_black_mage_tower: "Our scout discovered a black tower inhabited by a large group of goblins together with their master",
  	log_ene_cave_bats: "Our scout discovered a cave full of vampire bats",
  	log_ene_far_west_island: "Our scout discovered a tiny island a few days' sail to the west",
  	log_ene_fire_elemental_circle: "Our scout discovered the Fire elemental circle!",
  	log_ene_forgotten_shelter: "Our scout discovered the Forgotten Shelter of Captain Galliard!",
  	log_ene_frost_elemental_circle: "Our scout discovered the Frost elemental circle!",
  	log_ene_fire_salamander_nest: "Our scout discovered a nest full of fire salamander, beware the flames!",
  	log_ene_gloomy_werewolf_forest: "Our scout discovered the forest of the legendary monster Werewolf",
  	log_ene_giant_temple: "Our scout discovered a giant temple in the forest",
  	log_ene_goblin_lair: "Our scout discovered a lair of goblins, we will have to chase away these fetid creatures and occupy their territories",
  	log_ene_golem_cave: "Our scout discovered a cave full of statues, it is unhealthy to approach",
  	log_ene_gold_mine: "Our scout discovered a huge gold mine, too bad it is being used by a swarm of trolls",
  	log_ene_gorgon_cave: "Our scout discovered the cave of the legendary monsters the Gorgon",
  	log_ene_gnoll_camp: "Our scout discovered a large camp of gnoll commanded by a leader",
  	log_ene_gnoll_raiding_party: "Our scout discovered a party full of Gnoll raider roaming the lands",
  	log_ene_gulud_ugdun: "Our scout discovered where orcs keep children in captivity! Ugdun's castle must fall!",
  	log_ene_haunted_library: "Our scout discovered an haunted library, will we be able to get knowledge from it?",
  	log_ene_hobgoblin_chieftain: "Our scout discovered an Hobgoblin chieftain together with his small army",
  	log_ene_hobgoblin_encampment: "Our scout discovered an encampment full of Hobgoblin grunts",
  	log_ene_hydra_pit: "Our scout discovered the grave of one of the legendary monsters the five-headed Hydra",
  	log_ene_lich_temple: "Our scout found where the necromancer came from, the temple of a Lich",
  	log_ene_kobold_city: "Our scout discovered a city full of Kobolds. Will it be part of a larger nation?",
  	log_ene_kobold_looters: "Our scout discovered a small band of Kobold looters",
  	log_ene_kobold_underground_tunnels: "Our scout discovered an underground tunnel maze full of Kobolds, let's try to drive them off",
  	log_ene_korrigan_dolmen: "Our scout discovered a circle of dolmen, the korrigans guard it",
  	log_ene_naga_nest: "Our scout discovered a naga nest. In the distance you can hear the cries of animals that are kept as a food supply",
  	log_ene_nasty_pillagers: "Our scout discover a small group of pillagers around our village, let's drive them off",
  	log_ene_necromancer_crypt: "Our scout discovered the house of a Necromancer, the place is haunted by ghouls and ghasts",
  	log_ene_north_sacred_place: "Our scout discovered the north sacred place!",
  	log_ene_markanat_forest: "Our scout follows the myth of Markanat and discovers his forest. Beware the huge spider!",
  	log_ene_mercenary_camp: "Our scout discovered a mercenary encampment, from a distance you can see that they do not fly the flag of some kingdom and probably are dedicated to looting",
  	log_ene_minotaur_maze: "Our scout discovered the maze of the legendary monsters the Minotaur",
  	log_ene_mountain_cave: "Our scout discovered a huge cave in a mountain, maybe it's the lair of a giant",
  	log_ene_mountain_valley: "Our scout discovered a beautiful valley in the middle of the mountains. The giants have made it their home",
  	log_ene_myconid_cavern: "Our scout discovered a cavern filled up with a tribe of myconids",
  	log_ene_old_herd: "Our scout discovered an old herd",
  	log_ene_old_outpost: "Our scout discovered the outpost Galliard talk about. Let's free it!",
  	log_ene_old_storage_room: "Our scout discovered an old storage room with a nest of spiders",
  	log_ene_orc_gormiak_citadel: "Our scout discovered the orcish citadel, now they will know human vengeance",
  	log_ene_orc_horith_citadel: "Our scout discovered the orcish citadel of Horith",
  	log_ene_orc_ogsog_citadel: "Our scout discovered the orcish citadel of Ogsog",
  	log_ene_orc_turgon_citadel: "Our scout discovered the orcish citadel of Turgon",
  	log_ene_orc_raiding_party: "Our scout discovered an orcish army that is plundering our lands!",
  	log_ene_orcish_prison_camp: "Our scout discovered a camp where orcs hold humans captive",
  	log_ene_prisoner_wagon: "Our scout discovered a wagon full of prisoners. Some bandits guard it",
  	log_ene_rat_cellar: "Our scout discovered a cellar infested by ravenous rats",
  	log_ene_rusted_warehouse: "Our scout discovered an isolated and rusted warehouse",
  	log_ene_skullface_encampment: "Our scout discovered where Skullface is hiding, we just have to eliminate him",
  	log_ene_sleeping_titan: "Our scout discovered the legendary sleeping Titan!",
  	log_ene_snakes_nest: "Our scout discovered a nest full of snakes",
  	log_ene_spider_forest: "Our scout discovered a dense forest full of giant cobwebs",
  	log_ene_son_atamar: "Our scout found, in an old destroyed farm, where the son of Atamar gather",
  	log_ene_south_sacred_place: "Our scout discovered the south sacred place!",
  	log_ene_strange_village: "Our scout discovered a strange village, he was attacked by the inhabitants who showed a strange aggressiveness, they seemed bewitched",
  	log_ene_succubus_library: "Our scout discovered a dark library inhabited by succubus",
  	log_ene_swarm_wasp: "Our scout discovered a huge swarm of giant wasp roaming the land!",
  	log_ene_temple_gargoyle: "Our scout discovered a temple in a very dense forest, it is guarded by gargoyles",
  	log_ene_troll_cave: "Our scout discovered a cave of trolls, better to stay away until our army is powerful enough",
  	log_ene_vampire_crypt: "Our scout discovered a crypt of vampire, we must investigate",
  	log_ene_vampire_lair: "Our scout find the vampire, her power is a threat to any free citizen of Theresmore",
  	log_ene_west_sacred_place: "Our scout discovered the west sacred place!",
  	log_ene_wind_elemental_circle: "Our scout discovered the Wind elemental circle!",
  	log_ene_wolf_pack: "Our scout discovered a large pack of wolves",
  	log_ene_worn_down_crypt: "Our scout discovered a worn down crypt in a secluded section of a spooky forest. Skeletal knights guard it",
  	log_ene_wyvern_nest: "Our scout discovered the nest of some wyverns. These dragon-like animals are very strong and territorial",
  	log_fam_30: "Your leadership is recognized within our small settlement",
  	log_fam_70: "Our village is expanding and beginning to be a point of reference for the nearby valleys",
  	log_fam_150: "Our village and your exploits begin to be appreciated regionally",
  	log_fam_300: "Thanks to technological innovation and newly built infrastructures, our village is now known within tens of miles",
  	log_fam_700: "The way you guided a small village to greatness granted you a place in the annals of Theresmore",
  	log_fam_1100: "We can begin to speak of a human nation with our great city at its center",
  	log_starving: "Your settlement is starving, produce food!",
  	log_village_empty: "Your village is empty, look for some new technology",
  	log_fai_accept_druid: "The Druid and his beliefs are increasing day by day, we have made him high priest and now he will grant us his blessing",
  	log_fai_banish_druid: "The city's guards enter the spiritual gardens where the Druid was circling more and more people, without a chance to retaliate, the druid is kicked out of the city with a ban on entering it again. The plants in the garden seemed to wither away at the time when the druid was seized with rage and more than one witness swears that he saw a fire coming from his eyes",
  	log_fai_city_blessing: "We need to increase the production of modern weapons and create extra defenses. This spell will help us",
  	log_fai_demonology: "By studying the newly defeated demons we figured out how to harness their power and how to find the place they come from. We have to send our scouts to reconnoiter",
  	log_fai_demoniac_tome: "Tome contains many dark spells and a pact between a mistress and her servants. Perhaps the people in the village were the servants of some higher demon. There are clues in the tome to look for this entity. Let's send our scouts out to explore!",
  	log_fai_dragon_skull: "With that skull we have the ability to arm our soldiers with weapons and armor of the highest level. Let us hope that the old man's words did not match the truth",
  	log_fai_gold_consecration: "Now that divine power is also with us we must increase our gold reserves even more",
  	log_fai_hope_children: "The children subjected to Gulud's magic are overloaded with magical power; their singing and hope will guide humanity! Now we can cast The Children Hope spell",
  	log_fai_northern_star_power: "We can use the power of the Northern Star in two ways: to protect our city or channel its energy to produce more. Only one of the two powers is obtainable; choose carefully",
  	log_fai_prayer_for_the_ancient_monk: "We can now train warrior monks",
  	log_fai_prayer_goddess_luck: "Luck is an asset that everyone should keep in mind on Theresmore, the more luck, the better",
  	log_fai_prayer_lonely_druid: "The request for a blessing to the Druid has been granted, and a powerful spell can now be cast. The Druid's creed banishes natronite and despises vile money, why is it granted in his blessing instead?",
  	log_fai_sacred_place: "We can now send our scouts to discover the sacred places around Theresmore. Conquering them, we can channel all the mana into a Tower and cast the 4 Spells of Power. This will be our goal for the prestige of Ascension",
  	log_fai_strange_lamp: "Handling the lamp, it activated and a Djinn came out, thanking us for freeing him: he flew away with a loud laugh. We should send our scouts to look for his home",
  	log_fai_the_aid: "To solve the refugees problem we will have to create a new district, it will cost us a lot in terms of resources, but we can then make something out of the work of all these people",
  	log_fai_temple_mirune: "Mirune the woods goddess has granted us a powerful spell. Now we can cast it",
  	log_fai_warrior_gods: "We can now train Paladin",
  	log_fai_zenix_aid: "Following the way of Atamar and with the teachings of Zenix we will now be able to train the Strategist. The archmage returns to his lands promising help when times become darker",
  	log_spy_full: "The spy mission has succeeded, the enemy has:",
  	log_spy_up50: "The spy mission was a partial success, here is what was discovered about the enemy:",
  	log_spy_down50: "The spy mission was a failure, no information was recovered. You must send more spies for higher probability of success",
  	log_spy_death: "Spies killed in action:",
  	log_tec_agricolture: "Being able to feed the population has always been the biggest problem for early human settlements. We can now build Farm",
  	log_tec_aid_request: "It seems that the natives have been attacked by giant two-headed creatures and some of them are prisoners. They require a helping hand to free their comrades. We send our scouts to see what this is all about",
  	log_tec_alchemical_reactions: "With saltpetre and mana, we can transmute matter and increase our productions",
  	log_tec_ancient_balor_t: "Now we can summon the Ancient Balor",
  	log_tec_assembly_line: "Now we can build the Factory",
  	log_tec_astronomy: "By building observatories we will be able to train Skymancers",
  	log_tec_archery: "We can start train archers and scouts, it will consume food but will provide us with protection and we can send scouts to understand Theresmore and its mysteries. The army is divided into categories, each of which has advantages against another. Tank is strong against Cavalry, Cavalry is strong against Ranged, Ranged is strong against Shock, Shock is strong against Tank",
  	log_tec_ancient_stockpile: "We can explore the ancient vault and guard its secrets",
  	log_tec_architecture: "We can now build the Carpenter workshop and the Mansion",
  	log_tec_artisan_complex: "We can now build the Artisan Complex",
  	log_tec_bandit_chief: "Skullface is somewhere in the neighboring provinces, we have to send our scouts and find him",
  	log_tec_banking: "Now we can build the Bank",
  	log_tec_barbarian_tribes: "Our scouts can now push further into the wastelands in search of even larger barbarian villages",
  	log_tec_besieging_engineers: "Now we can build the Siege Workshop",
  	log_tec_biology: "Better than servitude?",
  	log_tec_breeding: "We can now train light cavalry, a good and fast assault unit. Now we can build Stable",
  	log_tec_bronze_working: "We can train spearmen and warriors, our army can both defend and attack effectively. Units enter battle in a set order , in front will be the tanks and general melee units to absorb the blows while the firing units will be behind the lines and the last to die. Now we can build Barracks",
  	log_tec_burned_farms: "Farms were burned and all around the fields horribly mangled bodies were scattered. From the tracks it looks like the work of humanoid beings of great size. We must send our scouts",
  	log_tec_canava_mercenary: "Now we can recruit the Canava Guard, an elite mercenary troop from the nearby village",
  	log_tec_centralized_power: "Now we can build the Ministry of Development",
  	log_tec_chemistry: "Chemistry in Theresmore is more a matter for alchemists. Now we can build Alchemical laboratory",
  	log_tec_cloistered_life: "We can now build the Monastery",
  	log_tec_colonial_camp: "We can now build the Military Camp",
  	log_tec_colonial_consacration: "We can now build the Holy Site",
  	log_tec_colonial_docks: "We can now build the Dock",
  	log_tec_colonial_exploitations: "We can build the Builders Complex",
  	log_tec_colonial_recruits: "We can now build the Colony Recruiting Camp",
  	log_tec_colonial_stronghold: "We can now build the Stronghold",
  	log_tec_colonial_trade: "We can now build the Custom House",
  	log_tec_cpt_galliard_t: "Now we can train the Captain Galliard",
  	log_tec_craftsmen_guild: "We can now build the Guild of Craftsmen",
  	log_tec_crop_rotation: "FAME is a resource you get from the great works or great deeds you will do in Theresmore. At prestige time it will be used to calculate your LEGACY points that will allow you to get permanent bonuses in each of your game runs!",
  	log_tec_crossbow: "We can train crossbowmen, a very effective unit at medium distance",
  	log_tec_communion_nature: "Now we can build the spiritual garden, a source of mana and hope",
  	log_tec_cuirassiers: "We can train cuirassier",
  	log_tec_currency: "Now we can build the Marketplace",
  	log_tec_ecology: "Now we can create real eden gardens and preserve Theresmore",
  	log_tec_economics: "Now we can build Residential block",
  	log_tec_education: "In the courtyard of our university we can dedicate a statue to a great person from the past. Only a statue can be built",
  	log_tec_end_ancient_era: "Let's finish the ancient era by building the City Center so we can advance",
  	log_tec_end_feudal_era: "Let's finish the feudal era by building the Academy of Freethinkers so we can advance",
  	log_tec_elf_last_village: "Thanks to the QualarNuud, the Elves may still have hope in Theresmore. Their species is on the brink of extinction, but proudly they will resist their fate. Now we can build Elf Village",
  	log_tec_elf_survivors: "The elven race is native to the continent where we have established our colony. They have been at war since ancestral times with the QualarRoktam which means those who carry weapons. They are reduced to a few thousand individuals and are close to extinction. Now we can build the Elf encampment near our colony so we can house them and better understand their traditions",
  	log_tec_elf_warriors: "Now we can train the Elf warrior",
  	log_tec_espionage: "Now we can train spies, to get intel about our enemies",
  	log_tec_establish_boundaries: "As our city has expanded, we have realized that our borders are far from secure. Rumors of an approaching danger to the east are swirling among our scouts. We must be very careful",
  	log_tec_daylong_celebration: "You enter the square and are celebrated as a hero by all the residents, you have saved the settlement from certain death, and everyone will be eternally grateful. Your fame has increased, soon even the most distant peoples will know our deeds!",
  	log_tec_deserter_origin: "These deserters called themselves Sons of Atamar, we need to find out more with our scouts",
  	log_tec_dimensional_device: "Now we can train Jager. Shinzou wo sasageyo!",
  	log_tec_exterminate_competition: "We are one step away from being the richest ever, let's raise our treasure again and no one will be able to hinder us anymore",
  	log_tec_fairs_and_markets: "Now we can build a Great Fair",
  	log_tec_faith_world: "Now we can build the Pilgrim Camp",
  	log_tec_feudalism: "Feudalism opened the door to a new concept of society, where the estates and fiefdoms of small and large lords prospered undisturbed. Now we can build the Fiefdom",
  	log_tec_financial_markets: "Now we can build the credit union and accumulate even more gold",
  	log_tec_field_artillery: "Now we can train cannons, who knows if they can shoot down giants as well?",
  	log_tec_flame_atamar: "Now we can choose what to do with the Flame: ATTENTION one choice will exclude the other!",
  	log_tec_flight: "Natronite-fueled hot air balloons will serve as lookouts",
  	log_tec_flintlock_musket: "We can now train line infantry",
  	log_tec_food_conservation: "We can now build the Grocery",
  	log_tec_fortification: "Now we can build Palisade and Wall",
  	log_tec_fortified_colony: "Now we can build the Fortified Citadel",
  	log_tec_free_old_outpost: "Galliard taught our scouts how to find an old outpost still held by mercenaries. Let's send out our scouts!",
  	log_tec_landed_estates: "Now we can build Estates",
  	log_tec_large_storage_space: "Now we can build the Large Storehouse",
  	log_tec_large_defensive_project: "Now we can build the Great Bombard",
  	log_tec_large_shed_t: "Now we can build Large shed",
  	log_tec_library_of_souls: "The library has many missing but after some time of study it is easy to deduce that is a collection of unholy magic practices, those who learn such knowledge can offer up pieces of their soul to the well in exchange for freedom from their mortal shackles",
  	log_tec_lonely_druid: "This druid appeared out of nowhere in the city and professes harmony and love for the communion of humans with Theresmore. He is averse to modernity and indiscriminate exploitation of resources. His beliefs are rapidly proselytizing, and more and more people in town are going to listen to his words",
  	log_tec_long_expedition: "Now finally scouts will have new ways to die, what will they discover?",
  	log_tec_galliard_secret: "The captain possesses a valuable trinket that holds a special significance to him. He recalls an ancient hiding spot from his childhood, a place where he would seek refuge from the world. We need to find the shelter, send our scouts!",
  	log_tec_galliard_true_form: "Galliard's power is one of unparalleled might, a gift that sets him apart as a champion of humanity. With a single transformation, he becomes a towering behemoth. In his giant form, he is a relentless warrior, striking fear into the hearts of his enemies and inspiring hope in those he protects",
  	log_tec_glorious_parade: "You are carried in triumph along the streets of the city in a great celebration that not even late at night intends to die down. From every corner of the neighboring provinces flock to the city to see the dragon exterminator! (Even if he was only put to flight at the moment)",
  	log_tec_glorious_retirement: "AH, a glorious retirement! the first prestige in Theresmore! Prestige is a key mechanic in Theresmore; it gives you bonuses that you could never get in other ways. It's always worth it",
  	log_tec_grain_surplus: "We can now build the Granary",
  	log_tec_guild: "A guild of explorers is now ready to lend its services",
  	log_tec_gunpowder: "We can train arquebusiers, together with our shock troops will dominate the battlefields",
  	log_tec_guerrilla_warfare: "We can train Ranger",
  	log_tec_joyful_nation_1: "Each battle makes the triumph greater. Let us look to the sky and be aware that whatever difficulties Theresmore still has in store for us we can face and master them!",
  	log_tec_joyful_nation_2: "Each battle makes the triumph greater. Let us look to the sky and be aware that whatever difficulties Theresmore still has in store for us we can face and master them!",
  	log_tec_harbor_project: "Now we can build the Harbor district",
  	log_tec_herald_canava: "A laborer from the small border village, Canava, managed to get to the city. He brings with him alarming news of a goblin invasion from the east, the village of Canava has been destroyed. We must build some watchman outpost to survey the surroundings of the settlement",
  	log_tec_honor_humanity: "After the battle for Ogsog our infantry knows that orcs are a colossal enemy but they can never stop us! For victory!",
  	log_tec_holy_fury: "We can now train Battle Angels, to release the holy fury on the battlefield",
  	log_tec_housing: "We can now build Common house",
  	log_tec_knighthood: "Knightly orders are the core of human nobility of Theresmore",
  	log_tec_kobold_nation: "Now we have to send our scouts to find the nation of Kobolds, but beware: I do not think they will be very friendly",
  	log_tec_iron_working: "We can now train heavy warriors",
  	log_tec_land_mine: "Let's undermine the territories around the city, let those damn goblins come back, pieces of wolfrider will fly everywhere",
  	log_tec_order_of_clerics: "With the construction of a few conclaves we will have access to higher spells",
  	log_tec_orcish_threat: "Our most valiant generals will study a battle plan, our scouts will have to find out more about Orcish territory. Expect increasingly powerful attacks; we are up against a formidable enemy",
  	log_tec_orcish_citadel: "We send our scouts to find out where this fortified citadel is located. We must bring war to their lands, and perhaps we will have a way of frightening them",
  	log_tec_pentagram_tome: "The tome is written in a demonic language and the pentagram on the ground was used to subdue all those people in the village. We need to translate the tome; let's have our clergymen study it",
  	log_tec_mankind_darkest: "In the citadel we found maps of an operation about to be unleashed. Thousands of orcs are preparing to invade our lands, and 3 more orcish fortified bastions stand against us. Beasts thirsty for human blood are being spewed out of these strongholds all the time. Humanity's fate is being fulfilled, we must resist at all costs!",
  	log_tec_mass_transit: "Now we can build Logistic Center",
  	log_tec_necromancy: "The necromancer had drawn his power from some dark force, we must follow its trail with the scouts",
  	log_tec_northern_star: "The Northern Star is imprisoned among the eternal ice. A monolith as black as night capable of radiating immense power. Our scholars must understand its workings, and soon we will be able to harness its power",
  	log_tec_new_old_gods: "Now we can build the Old Gods Church",
  	log_tec_new_world_exploration: "Now we can send our scout to explore new places",
  	log_tec_new_world_militia: "Now we can recruit the Colonial Militia",
  	log_tec_magic: "Now we can build the Magic circle",
  	log_tec_magic_arts_teaching: "Now we can build the Magical tower",
  	log_tec_mana_conveyors: "By creating some pillars of mana we will be able to channel the energy of Theresmore and use it for both scientific and religious purposes",
  	log_tec_mana_engine: "By combining saltpetre with mana our scholars can create natronite, it will have unexpected uses",
  	log_tec_mana_investigation: "Now we can build the Mana Extractors",
  	log_tec_mana_reactors: "Now we can build the Mana Reactor",
  	log_tec_mana_utilization: "We finish the third era by building a pit that can hold all the mana our sapients will need to discover fantastic new inventions",
  	log_tec_manufactures: "We can now create the builders' district to increase our wood and stone production",
  	log_tec_mathematic: "With the discovery of mathematics we begin to get serious about productions",
  	log_tec_mechanization: "With mechanization we can speed up all areas of our production. Now we can build the Industrial plant",
  	log_tec_mercenary_bands: "We can now recruit mercenary veterans",
  	log_tec_mercenary_outpost_t: "Now we can build the Mercenary Outpost",
  	log_tec_metal_alloys: "We can now train the Artillery",
  	log_tec_metal_casting: "Now we can build the Foundry",
  	log_tec_military_science: "We can now train bombard to dominate the battlefield. We can now build the Military academy",
  	log_tec_military_tactics: "Now we can build the Officers training ground and enlist the General",
  	log_tec_mining: "Now we can build the Mine",
  	log_tec_ministry_interior_t: "Now we can build the Ministry of Interior",
  	log_tec_ministry_war_t: "Now we can build Ministry of War",
  	log_tec_ministry_worship_t: "Now we can build the Ministry of Worship",
  	log_tec_miracle_city: "Now we can build the Fountain of Prosperity, the druid has been miraculous for our city",
  	log_tec_monster_epuration: "Now we can build the Hall of heroic deeds!",
  	log_tec_monster_hunting: "There seem to be four legendary beasts: a gorgon, a five-headed hydra, a werewolf and a minotaur. By tracking them down and defeating them we can have fame and glory in abundance! Let our scouts set out on a quest!",
  	log_tec_monument_past: "Now we can build the Monument",
  	log_tec_mythology: "Now we can dedicate a shrine to our beliefs. Attention: only one shrine can be built",
  	log_tec_municipal_administration: "Now we can build the City Hall",
  	log_tec_natrocity: "Now we can build the City of Lights",
  	log_tec_natronite_storage: "Handle natronite with care. Now we can build Natronite depot",
  	log_tec_overseas_refinery: "Now we can build the Refinery",
  	log_tec_outpost_tiny_island: "Now we can build the Island Outpost",
  	log_tec_path_children: "It seems that orcs kidnap children to turn them into their flame casters as adults. We must find Gulud Castle and put an end to this abomination",
  	log_tec_persuade_nobility: "We can now train cataphract",
  	log_tec_persuade_people: "We must find the Eternal Halls and defeat their guardians. Let us unleash our explorers.",
  	log_tec_plate_armor: "We can now recruit man at arms",
  	log_tec_plenty_valley: "Now we can build the Valley of plenty",
  	log_tec_pottery: "By working on the first pieces of craftsmanship, we can create tools. We can build the Artisan workshop",
  	log_tec_port_statue: "Now we can build the Statue of Virtues",
  	log_tec_preparation_war: "Now we will be able to create natronite shields capable of strengthening our defenses",
  	log_tec_printing_press: "In some newly printed newspapers there is a discussion about some legendary beasts that would inhabit Theresmore. We need to look into this topic further",
  	log_tec_professional_soldier: "Now we can build the Recruit training center",
  	log_tec_rage_druid: "The Druid has cast off his mask of gentle holy man, his voice is somber and his eyes are as red as fire. He threatens the city and its citizens, speaks of an immense power that will soon come upon us and devour us. We must prepare for the worst",
  	log_tec_railroad: "Now we can build Railway Station",
  	log_tec_regional_markets: "From Canava and other nearby villages we can make several profits",
  	log_tec_religion: "By building a temple we will have access to prayers and spells",
  	log_tec_religious_orders: "Now we can build a Cathedral",
  	log_tec_research_district: "Now we can build the Research plant",
  	log_tec_replicable_parts: "Now we can build the Automated Complex",
  	log_tec_remember_the_ancients: "We can now build a Library to hold the knowledge of past generations",
  	log_tec_safe_roads: "We can now build the tax revenue checkpoints",
  	log_tec_seafaring: "A few days' sail to the west is a small island; we will have to conquer it so we can use it as an advanced supply base for our explorations. Let's send our scouts to visit it",
  	log_tec_seraphim_t: "Now we can train the Seraphim",
  	log_tec_shores_theresmore: "We have identified a place far from the borders of other kingdoms where we can build a harbor, now we can research the Harbor Project",
  	log_tec_siege_techniques: "We can now train trebuchet",
  	log_tec_steel_flesh: "We can now train the Behemoth",
  	log_tec_steeling: "A new resource made of other metals can now be produced and we can build the Steelworks",
  	log_tec_storage: "Now we can build the Store",
  	log_tec_storage_district: "Enough of these caps! Now we can build the Storage facility and the Large warehouse",
  	log_tec_storing_valuable_materials: "We can now build the Guarded warehouse",
  	log_tec_stone_masonry: "We can now build the Quarry",
  	log_tec_stone_processing: "We can now build the Stonemason",
  	log_tec_swear_give_up: "After the battle for Turgon, humanity vowed never to surrender",
  	log_tec_tamed_barbarian: "We must find out with our scouts more about these barbarians so that we can export our civilization to them!",
  	log_tec_temple_luna: "The Elves ask us for help in returning to them the Luna Temple long under the hands of the QualarRoktam. Let us send our scouts!",
  	log_tec_the_scourge: "Refugees tell of entire villages burned by a flying monster, and all along the western border a mass of displaced people are coming toward the city",
  	log_tec_the_triumph: "Theresmore is safe, the continents are saved from the Orcish horde. You are the hero of two worlds! Now we can build the Arch of Triumph!",
  	log_tec_titan_mosaic: "A Native legend tells of this mosaic. Somewhere on the continent there is a sleeping titan , whoever can wake him up will get his blessing. We must find him and wake him up!",
  	log_tec_tome_ancient_lore: "The tome chronicles the cyclical history of humanity. Through its pages, we uncovered new techniques for production, research, and other untold secrets. The ancient text held within it a wealth of knowledge, illuminating paths forward and unlocking mysteries of the past",
  	log_tec_trail_blood: "We have a trail of blood. We still have to send our scouts to find the vampire",
  	log_tec_trail_power: "We have to win the approval of the kingdom, we can either persuade the nobility or win the hearts of the people. We choose carefully because one option EXCLUDES the other",
  	log_tec_training_militia: "We can now build the Castrum Militia",
  	log_tec_trenches: "Now we can build Trench and train Marksman",
  	log_tec_veteran_artillerymen: "We can now build the Artillery Firing Range",
  	log_tec_warfare: "The art of war will give rise to a great commander in our nation",
  	log_tec_white_t_company: "We can now train the White Company",
  	log_tec_wings_freedom: "We must free Galliard from his obsession. We must find the ancient giant! Let's send the Scout Regiment on a mission!",
  	log_tec_wood_cutting: "We can now build Lumberjack camp",
  	log_tec_wood_saw: "We can now build the Sawmill",
  	log_tec_writing: "We can now build the School",
  	log_tec_underground_kobold_mission: "Now our scouts can find out what lies behind the kobold tunnels",
  	not_academy_of_freethinkers: "Freethinkers united",
  	not_academy_of_freethinkers_title: "Academy of Freethinkers",
  	not_arch_triumph: "Per omnia asperrima",
  	not_arch_triumph_title: "Arch of Triumph",
  	not_army_of_goblin: "Crushing goblins",
  	not_army_of_goblin_title: "Survive the moonlight night",
  	not_army_of_goblin_dif_1: "Crushing goblins on Hard!",
  	not_army_of_goblin_dif_1_title: "Survive the hard moonlight night",
  	not_army_of_goblin_dif_2: "Crushing goblins on Impossible!",
  	not_army_of_goblin_dif_2_title: "Survive the impossible moonlight night",
  	not_army_of_dragon: "Chasing away the dragon",
  	not_army_of_dragon_title: "Survive the dragon assault",
  	not_army_of_dragon_dif_1: "Chasing away the dragon on Hard!",
  	not_army_of_dragon_dif_1_title: "Survive the hard dragon assault",
  	not_army_of_dragon_dif_2: "Chasing away the dragon on Impossible!",
  	not_army_of_dragon_dif_2_title: "Survive the impossible dragon assault",
  	not_automated_complex: "Bip Bip Bip",
  	not_automated_complex_title: "Automated Complex",
  	not_city_lights: "A City of Lights",
  	not_city_lights_title: "City of Lights",
  	not_fallen_angel_army_1: "Trusting the Druid",
  	not_fallen_angel_army_1_title: "Survive the Druid's betrayal",
  	not_fallen_angel_army_1_dif_1: "Trusting the Druid on Hard!",
  	not_fallen_angel_army_1_dif_1_title: "Survive the hard Druid's betrayal",
  	not_fallen_angel_army_1_dif_2: "Trusting the Druid on Impossible!",
  	not_fallen_angel_army_1_dif_2_title: "Survive the impossible Druid's betrayal",
  	not_fallen_angel_army_2: "Friend of no one",
  	not_fallen_angel_army_2_title: "Survive the Fallen Angel attack",
  	not_fallen_angel_army_2_dif_1: "Friend of no one on Hard!",
  	not_fallen_angel_army_2_dif_1_title: "Survive the hard Fallen Angel attack",
  	not_fallen_angel_army_2_dif_2: "Friend of no one on Impossible!",
  	not_fallen_angel_army_2_dif_2_title: "Survive the impossible Fallen Angel attack",
  	not_orc_horde_boss: "Human Last Stand",
  	not_orc_horde_boss_title: "Survive the Orc Horde",
  	not_orc_horde_boss_dif_1: "Human Last Stand on Hard!",
  	not_orc_horde_boss_dif_1_title: "Survive the hard Orc Horde",
  	not_orc_horde_boss_dif_2: "Human Last Stand on Impossible!",
  	not_orc_horde_boss_dif_2_title: "Survive the impossible Orc Horde",
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
  	not_5_school: "The beginning of scientific thought",
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
  	not_15_university: "Graduate at the university of Theresmore",
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
  	res_luck: "Luck",
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
  	tec_agricolture: "Agriculture",
  	tec_agricolture_description: "The hard work of cultivating the land always gives its fruits",
  	tec_agreement_passage_wanders: "Agreement with Wanders",
  	tec_agreement_passage_wanders_description: "With this agreement we can freely explore the lands of Wanders now that we are allies",
  	tec_aid_request: "Request for help",
  	tec_aid_request_description: "The strange creatures were observing our colony in order to open a communication with us. They seem to have some kind of request. Our scholars must also interpret their language with the help of magic",
  	tec_alchemical_reactions: "Alchemical reactions",
  	tec_alchemical_reactions_description: "Through alchemy we will be able to further increase our productions",
  	tec_ancient_balor_t: "Ancient Balor",
  	tec_ancient_balor_t_description: "Summon the Ancient Balor demon",
  	tec_archery: "Archery",
  	tec_archery_description: "The bow will allow us to strike from a safe distance",
  	tec_architecture: "Architecture",
  	tec_architecture_description: "The Middle Ages gave impulse to our builders to realize great works",
  	tec_veteran_artillerymen: "Veteran artillerymen",
  	tec_veteran_artillerymen_description: "Let's train our sappers in marksmanship",
  	tec_architecture_titan_t: "Architecture of the titans",
  	tec_architecture_titan_t_description: "The construction knowledge of the titans",
  	tec_artisan_complex: "Artisan complex",
  	tec_artisan_complex_description: "Let's exploit the colony's mineral resources",
  	tec_assembly_line: "Assembly line",
  	tec_assembly_line_description: "Assembly lines will bring us into the industrial age",
  	tec_astronomy: "Astronomy",
  	tec_astronomy_description: "We must turn our gaze to the sky if we want to leave behind the feudal era",
  	tec_ancient_stockpile: "Ancient stockpile",
  	tec_ancient_stockpile_description: "Past generations have left us ancient warehouses",
  	tec_atomic_theory: "Atomic Theory",
  	tec_atomic_theory_description: "Elves have a deep knowledge of the stuff that things are made of",
  	tec_bandit_chief: "Bandit chief",
  	tec_bandit_chief_description: "One bandit questioned for information told us about a leader calling himself Skullface from whom they all took orders",
  	tec_banking: "Banking",
  	tec_banking_description: "What's mine is mine, what's yours is mine",
  	tec_barbarian_tribes: "Barbarian tribes",
  	tec_barbarian_tribes_description: "From the torture, err no, investigations carried out in the barbarian village we found out that their nation is divided into tribes",
  	tec_beacon_faith: "Beacon of Faith",
  	tec_beacon_faith_description: "Dedicate the colony to magic and faith. Only ONE specialty can be chosen",
  	tec_besieging_engineers: "Besieging engineers",
  	tec_besieging_engineers_description: "With the advent of siege techniques, we can increase the strength of our artillery",
  	tec_biology: "Biology",
  	tec_biology_description: "Theresmore's nature study applied to the lives of citizens",
  	tec_breeding: "Breeding",
  	tec_breeding_description: "We will have to breed the best horses in Theresmore",
  	tec_bronze_working: "Bronze working",
  	tec_bronze_working_description: "The Bronze Age, one of my favorite eras!",
  	tec_burned_farms: "Burned farms",
  	tec_burned_farms_description: "We need to investigate what happened to the isolated farms, the disappearance of all the children is very disturbing",
  	tec_canava_mercenary: "Canava Guard",
  	tec_canava_mercenary_description: "Elite mercenary troops on our payroll",
  	tec_centralized_power: "Centalized power",
  	tec_centralized_power_description: "Now more than ever we need to maintain a strong centralized power",
  	tec_chemistry: "Chemistry",
  	tec_chemistry_description: "Chemistry is the art of studying Theresmore in its components",
  	tec_cloistered_life: "Cloistered life",
  	tec_cloistered_life_description: "The rise of monastic orders",
  	tec_cpt_galliard_t: "Captain Galliard",
  	tec_cpt_galliard_t_description: "Hire the famous Captain Galliard",
  	tec_craftsmen_guild: "Guild of the Craftsmen",
  	tec_craftsmen_guild_description: "With the craftsmen's guild we will be able to increase the production of Tier 2 resources!",
  	tec_crop_rotation: "Crop Rotation",
  	tec_crop_rotation_description: "Crop rotation is a fundamental process for keeping fields productive",
  	tec_crossbow: "Crossbow",
  	tec_crossbow_description: "More powerful than the bow is also much easier to use",
  	tec_colonial_camp: "Colonial camp",
  	tec_colonial_camp_description: "We create an outpost in the new world",
  	tec_colonial_consacration: "Colonial consacration",
  	tec_colonial_consacration_description: "Our colony has grown enough to consecrate it with a holy site",
  	tec_colonial_docks: "Colonial docks",
  	tec_colonial_docks_description: "Let's build a dock to exploit maritime resources",
  	tec_colonial_exploitations: "Colonial exploitations",
  	tec_colonial_exploitations_description: "In the new world there are so many basic resources",
  	tec_colonial_recruits: "Colonial recruits",
  	tec_colonial_recruits_description: "New soldiers from the new world",
  	tec_colonial_stronghold: "Colonial stronghold",
  	tec_colonial_stronghold_description: "We create a stronghold that enemies are annihilated by it",
  	tec_colonial_trade: "Colonial trade",
  	tec_colonial_trade_description: "Now that the colony has grown we need to derive revenue from it",
  	tec_construction_of_automata: "Construction of automata",
  	tec_construction_of_automata_description: "We have studied the undead enough to develop our own mana-powered servant",
  	tec_commercial_monopolies: "Commercial monopolies",
  	tec_commercial_monopolies_description: "In order to grow even more economically we must create commercial monopolies and a stock exchange",
  	tec_communion_nature: "Communion with nature",
  	tec_communion_nature_description: "Our beliefs must be reconciled with Mother Nature",
  	tec_cuirassiers: "Cuirassiers",
  	tec_cuirassiers_description: "With firearms we can create very heavy mounted regiments",
  	tec_currency: "Currency",
  	tec_currency_description: "Everything has its price",
  	tec_daylong_celebration: "A daylong celebration",
  	tec_daylong_celebration_description: "After the victory over the goblins, the people gathered in the square to celebrate",
  	tec_deserter_origin: "Origin of deserter",
  	tec_deserter_origin_description: "We need to find out more about where these defectors came from",
  	tec_dimensional_device: "Dimensional device",
  	tec_dimensional_device_description: "A new way of fighting by exploiting natronite to give soldiers three dimensional movement capabilities for short periods",
  	tec_dragon_assault: "Dragon assault",
  	tec_dragon_assault_description: "One late summer afternoon, the sentries on the western walls discerned a dark spot on the horizon. Over the next few hours the spot became a cloud and then a storm that loomed over the city. A tempest as red as fire, the beast of fire was here to claim its artifact",
  	tec_drilling_operation: "Drilling operation",
  	tec_drilling_operation_description: "The drilling process will help produce more and more metals",
  	tec_ecology: "Ecology",
  	tec_ecology_description: "Now that our civilization is evolving, we must not forget the natural roots of Theresmore",
  	tec_economics: "Economics",
  	tec_economics_description: "With an advanced economy, will increase the general welfare",
  	tec_enclosures: "Enclosures",
  	tec_enclosures_description: "The birth of private property",
  	tec_education: "Education",
  	tec_education_description: "Theresmore begins to unravel its secrets and we must discover as much as possible",
  	tec_end_ancient_era: "End Ancient Era",
  	tec_end_ancient_era_description: "Our settlement is ready for a leap forward",
  	tec_end_feudal_era: "End Feudal Era",
  	tec_end_feudal_era_description: "Welcome the late era",
  	tec_end_era_4_1: "Dreaming big",
  	tec_end_era_4_1_description: "Now that our city is safe we must build the Harbor District and start a new adventure",
  	tec_end_era_4_2: "Dreaming big",
  	tec_end_era_4_2_description: "Now that our city is safe we must build the Harbor District and start a new adventure",
  	tec_elf_last_village: "Elf last village",
  	tec_elf_last_village_description: "The elves, grateful for returning the precious temple to them, take us to their last village",
  	tec_elf_survivors: "Elf survivors",
  	tec_elf_survivors_description: "The natives we rescued call themselves Elves and call us humans by the term QualarNuud, those who came from the vast sea",
  	tec_elf_warriors: "Elf Warrior",
  	tec_elf_warriors_description: "The Elves trust us enough to grant us some of their warriors in battle",
  	tec_espionage: "Espionage",
  	tec_espionage_description: "Some of our scouts might specialize in the art of espionage",
  	tec_establish_boundaries: "Establish boundaries",
  	tec_establish_boundaries_description: "We need to create defined boundaries for our realm",
  	tec_exhibit_flame: "Exhibit the Flame",
  	tec_exhibit_flame_description: "We can exhibit the Flame of Atamar in the city center to enrich it enormously",
  	tec_exterminate_competition: "Erase competitors",
  	tec_exterminate_competition_description: "We will produce so much gold to exterminate the competition",
  	tec_fairs_and_markets: "Fairs and markets",
  	tec_fairs_and_markets_description: "We can organize a big fair",
  	tec_faith_world: "New world of faith",
  	tec_faith_world_description: "We bring the faith of ancient gods to the new world",
  	tec_fallen_angel: "The Fallen Angel reveal",
  	tec_fallen_angel_description: "An army of demons is marching against the city, they are led by a knight with black wings! Let us prepare for battle!",
  	tec_fertilizer: "Fertilizer",
  	tec_fertilizer_description: "New chemical components will increase our food production",
  	tec_feudalism: "Feudalism",
  	tec_feudalism_description: "The birth of a new era: knights and castles and ladies to save",
  	tec_field_artillery: "Field artillery",
  	tec_field_artillery_description: "The evolution of the bombard are field cannons",
  	tec_financial_markets: "Financial markets",
  	tec_financial_markets_description: "New ideas on how to accumulate money",
  	tec_fine_woods: "Fine woods",
  	tec_fine_woods_description: "Our carvers are specializing more and more",
  	tec_fine_marbles: "Fine marbles",
  	tec_fine_marbles_description: "The processing of precious marbles is attracting manpower ",
  	tec_flame_atamar: "The Flame of Atamar",
  	tec_flame_atamar_description: "Now that we have conquered Zultan we must study the Flame of Atamar",
  	tec_flight: "Flight",
  	tec_flight_description: "The first timid hint of flight",
  	tec_flintlock_musket: "Flintlock musket",
  	tec_flintlock_musket_description: "The evolution of arquebuses into a much more versatile weapon",
  	tec_food_conservation: "Food conservation",
  	tec_food_conservation_description: "With food conservation we will be able to create supplies",
  	tec_forging_equipments: "Forge of equipment",
  	tec_forging_equipments_description: "Forge better equipment for the army",
  	tec_forging_equipments_II: "Forge of equipment II",
  	tec_forging_equipments_II_description: "Forge much better equipment for the army",
  	tec_fortification: "Fortification",
  	tec_fortification_description: "High walls to defend our settlement",
  	tec_fortified_colony: "Fortified colony",
  	tec_fortified_colony_description: "We turn the colony into a fortress",
  	tec_fortune_sanctuary: "Fortune sanctuary",
  	tec_fortune_sanctuary_description: "We must build a place where the goddess of luck can infuse her power",
  	tec_free_old_outpost: "Free an old outpost",
  	tec_free_old_outpost_description: "Cpt Galliard knows the location of an old outpost to be cleared",
  	tec_galliard_mercenary: "Captain Galliard services",
  	tec_galliard_mercenary_description: "Captain Galliard after being defeated offers his services",
  	tec_galliard_secret: "Galliard's secret",
  	tec_galliard_secret_description: "The captain has a murky past about which he can hardly recall any details. We need to thoroughly investigate his background",
  	tec_galliard_true_form: "Galliard True Form",
  	tec_galliard_true_form_description: "The encounter with the Ancient Giant awakened a power within Captain Galliard",
  	tec_gold_domination_project: "Gold domination project",
  	tec_gold_domination_project_description: "Now that we have the stock exchange we must commit our entire society to the project of global economic domination",
  	tec_glorious_parade: "Glorious parade",
  	tec_glorious_parade_description: "The dragon army has been repelled and it is time to celebrate",
  	tec_glorious_retirement: "Glorious retirement",
  	tec_glorious_retirement_description: "I've done a lot for Theresmore, it's time to take my leave",
  	tec_grain_surplus: "Grain surplus",
  	tec_grain_surplus_description: "We need to better manage grain production and storage",
  	tec_great_pastures: "Great pastures",
  	tec_great_pastures_description: "Having conquered the vast east we can now exploit its steppes",
  	tec_guerrilla_warfare: "Guerrilla warfare",
  	tec_guerrilla_warfare_description: "Wilderness around the colony generates new combat tactics",
  	tec_guild: "Guild",
  	tec_guild_description: "Corporations are born in the city",
  	tec_gunpowder: "Gunpowder",
  	tec_gunpowder_description: "With gunpowder we will have an advantage on the battlefield",
  	tec_joyful_nation_1: "Joyful nation",
  	tec_joyful_nation_1_description: "We have annihilated the Fallen Angel we must celebrate!",
  	tec_joyful_nation_2: "Joyful nation",
  	tec_joyful_nation_2_description: "We have annihilated the Fallen Angel we must celebrate!",
  	tec_heirloom_contract_t: "Heirloom of the Contract",
  	tec_heirloom_contract_t_description: "Give us money and soldiers",
  	tec_heirloom_death_t: "Heirloom of the Death",
  	tec_heirloom_death_t_description: "Sharpen our spears",
  	tec_heirloom_horseshoes_t: "Heirloom of the Horseshoes",
  	tec_heirloom_horseshoes_t_description: "Give us gold and workers",
  	tec_heirloom_housing: "Heirloom of the Housing",
  	tec_heirloom_housing_description: "Give us workers for our village",
  	tec_heirloom_momento_t: "Heirloom of the Momento",
  	tec_heirloom_momento_t_description: "Give us research and mana",
  	tec_heirloom_wealth_t: "Heirloom of Wealth",
  	tec_heirloom_wealth_t_description: "Give us better swords",
  	tec_heirloom_wisdom_t: "Heirloom of Wisdom",
  	tec_heirloom_wisdom_t_description: "Sharpen our arrows",
  	tec_herald_canava: "Canava herald",
  	tec_herald_canava_description: "The messenger from the Kingdom of Canava comes galloping into the city. This research will allow us to build watchman outposts, crucial to the advance into the new era",
  	tec_honor_humanity: "The honor of Humanity",
  	tec_honor_humanity_description: "Honor will guide us to victory! For humanity!",
  	tec_housing: "Housing",
  	tec_housing_description: "It's time to construct some dwellings",
  	tec_knighthood: "Knighthood",
  	tec_knighthood_description: "The code of chivalry is the creed of the nobles of Theresmore",
  	tec_kobold_nation: "Kobold nation",
  	tec_kobold_nation_description: "In the city of kobolds we found clues about a real underground megalopolis led by a King",
  	tec_harbor_project: "Harbor project",
  	tec_harbor_project_description: "We prepare a blueprint for a large port to explore and exploit the great sea",
  	tec_holy_fury: "Holy Fury",
  	tec_holy_fury_description: "The gods have given us battle angels",
  	tec_infuse_flame: "Infuse the Flame",
  	tec_infuse_flame_description: "Infuse the flame to aid our army",
  	tec_iron_working: "Iron working",
  	tec_iron_working_description: "Iron is a much stronger material than bronze, its uses will be multiple",
  	tec_land_mine: "Land mine",
  	tec_land_mine_description: "We will be able to use explosives to protect the surroundings of the city",
  	tec_landed_estates: "Landed estates",
  	tec_landed_estates_description: "Many landowners are moving to the new world",
  	tec_large_defensive_project: "Large defensive project",
  	tec_large_defensive_project_description: "At the military academy new projects are created for a super weapon capable of protecting our city",
  	tec_large_shed_t: "Large Shed",
  	tec_large_shed_t_description: "In the colony we have abundant space. Let's use it",
  	tec_large_storage_space: "Large storage space",
  	tec_large_storage_space_description: "All the space we need",
  	tec_large_pastures: "Large pastures",
  	tec_large_pastures_description: "The agreement with the Wanders allows us to know better their breeding techniques",
  	tec_library_of_souls: "Library of SouLs",
  	tec_library_of_souls_description: "The crypt turns out to be an ancient library, at its center is a well of ephemeral waters, the ghosts of many faces emanate from its reflection. Only the most resistant mortals dare to challenge the forbidden knowledge of the library",
  	tec_liturgical_rites: "Mana rites",
  	tec_liturgical_rites_description: "With the establishment of mana rites we will be able to explore new ways for our spells",
  	tec_local_products: "Local products",
  	tec_local_products_description: "Artisan's workshops are beginning to produce efficiently",
  	tec_lonely_druid: "A lonely druid",
  	tec_lonely_druid_description: "A small crowd is gathering around a lone druid",
  	tec_long_expedition: "Long term expedition",
  	tec_long_expedition_description: "With the new machines we can push our explorations much further",
  	tec_loved_people: "Loved by the people",
  	tec_loved_people_description: "At last the people of the west consider us their rightful ruler. Let us enjoy our reward",
  	tec_overseas_refinery: "Overseas refinery",
  	tec_overseas_refinery_description: "There is room for productive hubs in the new world",
  	tec_plate_armor: "Plate armor",
  	tec_plate_armor_description: "Full armors burst on the battlefield",
  	tec_preparation_war: "Preparation for the war",
  	tec_preparation_war_description: "Now that we know that an enemy is marching against us we must prepare defenses!",
  	tec_printing_press: "Printing press",
  	tec_printing_press_description: "Free circulation of ideas",
  	tec_professional_soldier: "Professional soldier",
  	tec_professional_soldier_description: "We must create an army of trained soldiers",
  	tec_poisoned_arrows: "Poisoned arrows",
  	tec_poisoned_arrows_description: "Now that we have defeated those goblins we can create arrows with their own type of poison",
  	tec_port_statue: "Port statue",
  	tec_port_statue_description: "The design of a large statue to raise awareness of our nation",
  	tec_magic: "Magic",
  	tec_magic_description: "The Mana is the essence of Theresmore",
  	tec_magic_arts_teaching: "Magic arts teaching",
  	tec_magic_arts_teaching_description: "We study the magical arts in depth",
  	tec_mana_conveyors: "Mana conveyors",
  	tec_mana_conveyors_description: "With the right research we should be able to convey a lot of mana",
  	tec_mana_engine: "Mana engine",
  	tec_mana_engine_description: "Our scholars have in mind how to develop machinery capable of using mana",
  	tec_mana_investigation: "Mana investigation",
  	tec_mana_investigation_description: "It seems that in the colony you can extract mana from the ground",
  	tec_mana_reactors: "Mana reactor",
  	tec_mana_reactors_description: "Thanks to atomic theory we can create reactors that generate mana",
  	tec_mana_utilization: "Mana utilization",
  	tec_mana_utilization_description: "Our researchers are discovering that with large amounts of mana we will be able to create new ways to change the lives of our citizens",
  	tec_mankind_darkest: "Mankind darkest hour",
  	tec_mankind_darkest_description: "We triumphed over the Orcish citadel, but what was a victory soon turned into a distressing and terrible situation",
  	tec_manufactures: "Manufacture",
  	tec_manufactures_description: "Carvers and stonemasons create corporations in the city",
  	tec_mass_transit: "Mass transit",
  	tec_mass_transit_description: "We need to develop our transportation system",
  	tec_master_craftsmen: "Master craftsmen",
  	tec_master_craftsmen_description: "True master craftsmen are emerging in the city",
  	tec_mathematic: "Mathematics",
  	tec_mathematic_description: "Two plus two is always four",
  	tec_mechanization: "Mechanization",
  	tec_mechanization_description: "We develop our civilization with new machinery",
  	tec_mercenary_outpost_t: "Mercenary Outpost",
  	tec_mercenary_outpost_t_description: "We conquered the outpost, let's make it a mercenary training center",
  	tec_metal_alloys: "Metal alloys",
  	tec_metal_alloys_description: "New lighter alloys will have battlefield applications",
  	tec_metal_casting: "Metal casting",
  	tec_metal_casting_description: "Metalworking is a fundamental process in developing our civilization",
  	tec_mercenary_bands: "Mercenary bands",
  	tec_mercenary_bands_description: "A convenient resource for kingdoms that abound in gold",
  	tec_military_colony: "Military Colony",
  	tec_military_colony_description: "Dedicate the colony to military operations and power. Only ONE specialty can be chosen",
  	tec_military_tactics: "Military tactics",
  	tec_military_tactics_description: "New weapons appear on the battlefield, and we will use them to pulverize our enemies",
  	tec_moonlight_night: "A moonlit night",
  	tec_moonlight_night_description: "One night shortly after learning of the destruction of Canava the surroundings of our city became agitated, we may have to reinforce the defenses",
  	tec_military_science: "Military science",
  	tec_military_science_description: "Scientific innovation at the service of the army",
  	tec_mining: "Mining",
  	tec_mining_description: "Copper and iron will come in handy",
  	tec_mining_efficency: "Mining efficiency",
  	tec_mining_efficency_description: "Drums in the dark depths",
  	tec_miracle_city: "Miracle in the city",
  	tec_miracle_city_description: "Miraculous wonders are taking place in the city",
  	tec_ministry_interior_t: "Ministry for the Interior",
  	tec_ministry_interior_t_description: "Now our city is evolved enough to need a ministry for the interior",
  	tec_ministry_war_t: "Ministry of War",
  	tec_ministry_war_t_description: "Our civilization needs a ministry of war",
  	tec_ministry_worship_t: "Ministry of Worship",
  	tec_ministry_worship_t_description: "Souls need a shepherd",
  	tec_monster_epuration: "Monster epuration",
  	tec_monster_epuration_description: "Now that we have wiped out the monstrosities that threatened Theresmore we need to study how to benefit from them",
  	tec_monster_hunting: "Monster hunting",
  	tec_monster_hunting_description: "We need to better investigate the rumors of these mysterious monsters",
  	tec_monument_past: "Monument",
  	tec_monument_past_description: "A legacy of the past",
  	tec_municipal_administration: "Municipal Administration",
  	tec_municipal_administration_description: "The village comes to life",
  	tec_mysterious_robbery: "Mysterious robbery",
  	tec_mysterious_robbery_description: "Large quantities of weapons are gone and also a lot of natronite, the Druid is missing: hopefully nothing has happened to him. We have to raise our guard",
  	tec_mythology: "Mythology",
  	tec_mythology_description: "The myths of Theresmore tell of great gods with majestic powers",
  	tec_natrocity: "Natrocity",
  	tec_natrocity_description: "Let's use natronite to light up our city",
  	tec_natronite_storage: "Natronite storage",
  	tec_natronite_storage_description: "Natronite is as useful as it is dangerous, we need to build appropriate depots",
  	tec_necromancy: "Necromancy",
  	tec_necromancy_description: "The necromancer was aware of arcane arts long forgotten",
  	tec_network_of_watchmen: "Sentinels on the walls",
  	tec_network_of_watchmen_description: "We need sentinels on the walls",
  	tec_new_old_gods: "New world old gods",
  	tec_new_old_gods_description: "We need to erect a church in this untouched land",
  	tec_new_world_exploration: "New world exploration",
  	tec_new_world_exploration_description: "We need to start exploring the new world",
  	tec_new_world_militia: "New world militia",
  	tec_new_world_militia_description: "We must create a militia capable of defending the colony",
  	tec_northern_star: "Northern Star",
  	tec_northern_star_description: "The Nightdale Protectorate held the Northern Star, a very powerful artifact from the earliest days of Theresmore",
  	tec_orc_horde: "The Orc Horde",
  	tec_orc_horde_description: "Even the last stronghold has fallen, the whole orc nation rushes upon us in a desperate bid for survival",
  	tec_orcish_citadel: "Orcish citadel",
  	tec_orcish_citadel_description: "Orcish armies come from a fortified citadel, we must besiege it",
  	tec_orcish_threat: "Orcish threat",
  	tec_orcish_threat_description: "The orcs are becoming more dangerous every day, and we cannot allow them to kidnap our people for their vile purposes.  Their purpose is to kill and destroy; they will know the value of the humans of Theresmore",
  	tec_order_of_clerics: "Order of clerics",
  	tec_order_of_clerics_description: "Half priests and half soldiers, they will serve the human cause in Theresmore",
  	tec_outpost_tiny_island: "Tiny island outpost",
  	tec_outpost_tiny_island_description: "This small island is a paradise of unknown species. An outpost here could generate a lot of research",
  	tec_path_children: "The Children Path",
  	tec_path_children_description: "In the citadel of Horith we found disturbing evidence",
  	tec_pentagram_tome: "Demoniac pentagram",
  	tec_pentagram_tome_description: "In the strange village we found a pentagram and a tome written in an obscure language. We must investigate",
  	tec_portal_of_the_dead: "Portal of the dead",
  	tec_portal_of_the_dead_description: "From a place long forgotten and sealed away. Beware the dead guard the passage. Beware",
  	tec_pottery: "Pottery",
  	tec_pottery_description: "Ceramics will allow us to preserve things and will favor the birth of commerce",
  	tec_productive_hub: "Productive Hub",
  	tec_productive_hub_description: "Dedicate the colony to resource production. Only one specialty can be chosen",
  	tec_railroad: "Railroad",
  	tec_railroad_description: "An iron horse? What kind of devilry is this?",
  	tec_rage_druid: "The rage of the Druid",
  	tec_rage_druid_description: "The following days the Druid showed up at the city gates",
  	tec_regional_markets: "Regional Markets",
  	tec_regional_markets_description: "With ancestral knowledge we can now create district markets at nearby villages",
  	tec_religion: "Religion",
  	tec_religion_description: "We honor the ancient gods",
  	tec_religious_orders: "Religious order",
  	tec_religious_orders_description: "Religious orders developed the concept of faith",
  	tec_remember_the_ancients: "Remember the Ancients",
  	tec_remember_the_ancients_description: "Was there a lost civilization before us?",
  	tec_replicable_parts: "Replicable parts",
  	tec_replicable_parts_description: "We develop automation through smaller and smaller components",
  	tec_research_district: "Research district",
  	tec_research_district_description: "Unveiling Theresmore is our goal",
  	tec_safe_roads: "Safe roads",
  	tec_safe_roads_description: "Now that we have secured the roads we can develop a gab system",
  	tec_scientific_theory: "Scientific Theory",
  	tec_scientific_theory_description: "The birth of the scientific method is the key to knowledge",
  	tec_scout_mission_east: "Scout Mission to the East",
  	tec_scout_mission_east_description: "Now that we have subdued the Wanders we can explore their lands freely",
  	tec_seafaring: "Seafaring",
  	tec_seafaring_description: "A great nation must rule the oceans, our inventors will succeed in creating natronite engines for our vessels",
  	tec_seraphim_t: "Seraphim",
  	tec_seraphim_t_description: "With the seraphim at our service, we will no longer have to fear the darkness",
  	tec_servitude: "Servitude",
  	tec_servitude_description: "I will serve you my master",
  	tec_shores_theresmore: "Shores of Theresmore",
  	tec_shores_theresmore_description: "Far from our current borders there is access to a great sea, we must explore those places",
  	tec_siege_defense_weapons: "Siege defense weapons",
  	tec_siege_defense_weapons_description: "Arm our walls with ballistae to repel enemy attacks",
  	tec_siege_techniques: "Siege techniques",
  	tec_siege_techniques_description: "We will be able to create more powerful siege machines than catapults",
  	tec_steel_flesh: "Steel and flesh",
  	tec_steel_flesh_description: "A new unit of flesh and steel will destroy our enemies",
  	tec_steeling: "Steeling",
  	tec_steeling_description: "With steel we can raise our military level to new heights",
  	tec_stone_extraction_tools: "Stone extraction tools",
  	tec_stone_extraction_tools_description: "New stone extraction and processing techniques",
  	tec_stone_masonry: "Stone masonry",
  	tec_stone_masonry_description: "The quarry is not a place for weak arms",
  	tec_stone_processing: "Stone processing",
  	tec_stone_processing_description: "The stonemason will help us with the production of stone",
  	tec_storage: "Storage",
  	tec_storage_description: "We need more and more material!",
  	tec_storage_district: "Storage district",
  	tec_storage_district_description: "We always need more space",
  	tec_storing_valuable_materials: "Storing valuable materials",
  	tec_storing_valuable_materials_description: "We need to create a guarded place to store our valuable materials",
  	tec_strange_encounter: "A strange encounter",
  	tec_strange_encounter_description: "In the woods not far from the colony we make a strange discovery",
  	tec_swear_give_up: "Never give up",
  	tec_swear_give_up_description: "We swear to never give up!",
  	tec_persuade_nobility: "Persuade the nobility",
  	tec_persuade_nobility_description: "Persuading the nobility will require a large amount of gold but will allow us to train the powerful knights of the west",
  	tec_persuade_people: "Persuade the people",
  	tec_persuade_people_description: "In order to break through to people's hearts, we must make a heroic gesture. Only by defeating a fearsome enemy will they consider us worthy",
  	tec_plenty_valley: "Plenty valley",
  	tec_plenty_valley_description: "Our lands generate an abundance that should not be wasted",
  	tec_tamed_barbarian: "Tamed Barbarian",
  	tec_tamed_barbarian_description: "In the barbarian camp we just defeated, we tamed some of them to obey us. We have to find out more about these people",
  	tec_temple_luna: "Temple of Luna",
  	tec_temple_luna_description: "The temple of Luna dear to the Elves has been desecrated by some wicked beings",
  	tec_the_journey: "The journey",
  	tec_the_journey_description: "We will go west where no human has gone before",
  	tec_the_scourge: "The scourge",
  	tec_the_scourge_description: "Some groups of refugees are asking to enter the city, something seems to have happened along the western borders",
  	tec_the_vault: "The vault",
  	tec_the_vault_description: "In order to start our world economic domination we need to hoard huge amounts of gold",
  	tec_theresmore_richest_nation: "Richest nation",
  	tec_theresmore_richest_nation_description: "We finally made it, we are the richest nation in all of Theresmore",
  	tec_titan_gift_t: "Titan Gift",
  	tec_titan_gift_t_description: "We awakened the titan and after rich offerings he will grant us a gift!",
  	tec_titan_mosaic: "Titan mosaic",
  	tec_titan_mosaic_description: "In the temple there is an immense mosaic depicting a sleeping Titan",
  	tec_underground_kobold_mission: "Underground mission",
  	tec_underground_kobold_mission_description: "The tunnels of the kobolds branch off in several directions, we must explore them",
  	tec_the_triumph: "The Triumph",
  	tec_the_triumph_description: "We have defeated the orcs and our triumph is total",
  	tec_tome_ancient_lore: "Tome of ancient lore",
  	tec_tome_ancient_lore_description: "In the shelter of Galliard we found an ancient tome. We must study it",
  	tec_trail_blood: "Trail of blood",
  	tec_trail_blood_description: "The vampire crypt contained no coffin, we must look elsewhere",
  	tec_trail_power: "Trail of power",
  	tec_trail_power_description: "The Western Kingdom is conquered but its people are hostile to us. We have to come up with something",
  	tec_training_militia: "Training militia",
  	tec_training_militia_description: "We have seen how ruthless Theresmore can be, we must create a militia force",
  	tec_trenches: "Trenches",
  	tec_trenches_description: "Building trenches will not only help us with defense but will allow us to train Marksmen",
  	tec_warfare: "Warfare",
  	tec_warfare_description: "Appear weak when you are strong, and strong when you are weak",
  	tec_white_t_company: "White Company",
  	tec_white_t_company_description: "The famous White Company is ready to lend its services",
  	tec_wall_titan_t: "Titanic Walls",
  	tec_wall_titan_t_description: "These walls will protect humanity for hundreds of years",
  	tec_war_effort: "War effort",
  	tec_war_effort_description: "The Orcish crisis is worrying the entire human population, a war effort is needed to deal with these bloodthirsty beasts",
  	tec_wings_freedom: "Wings of Freedom",
  	tec_wings_freedom_description: "Entering the shelter triggered a mystical reaction in Galliard. He is absent and pale and keeps repeating about an ancient giant",
  	tec_wood_cutting: "Wood cutting",
  	tec_wood_cutting_description: "Theresmore's lush forests will help our people prosper",
  	tec_woodcarvers: "Woodcarvers",
  	tec_woodcarvers_description: "Woodcarvers will produce quality wood",
  	tec_wood_saw: "Wood saw",
  	tec_wood_saw_description: "The production of wood needs new tools",
  	tec_writing: "Writing",
  	tec_writing_description: "Verba volant scripta manent",
  	uni_cat_1: "Ranged",
  	uni_cat_2: "Shock",
  	uni_cat_3: "Tank",
  	uni_cat_4: "Cavalry",
  	uni_ancient_balor: "Ancient Balor",
  	uni_ancient_balor_description: "An armored demon serving humanity",
  	uni_ancient_balor_plural: "Ancient balors",
  	uni_ancient_giant: "Ancient Giant",
  	uni_ancient_giant_plural: "Ancient Giants",
  	uni_aqrabuamelu: "Aqrabuamelu",
  	uni_aqrabuamelu_plural: "Aqrabuamelus",
  	uni_arquebusier: "Arquebusier",
  	uni_arquebusier_description: "Men armed with arquebuses, provide excellent offensive power",
  	uni_arquebusier_plural: "Arquebusiers",
  	uni_archdemon: "Archdemon",
  	uni_archdemon_plural: "Archdemons",
  	uni_archlich: "Archlich",
  	uni_archlich_plural: "Archliches",
  	uni_archer: "Archer",
  	uni_archer_description: "Archers can strike enemy troops from a safe distance and sap their morale",
  	uni_archer_plural: "Archers",
  	uni_artillery: "Artillery",
  	uni_artillery_description: "A rain of fire upon our enemies",
  	uni_artillery_plural: "Artilleries",
  	uni_balor: "Balor",
  	uni_balor_plural: "Balors",
  	uni_battle_angel: "Battle Angel",
  	uni_battle_angel_description: "A holy fury on the battlefield",
  	uni_battle_angel_plural: "Battle Angels",
  	uni_black_mage: "Black mage",
  	uni_black_mage_plural: "Black mages",
  	uni_bombard: "Bombard",
  	uni_bombard_description: "Intense fire from many bombards can decimate enemy troops before the clash",
  	uni_bombard_plural: "Bombards",
  	uni_bugbear: "Bugbear",
  	uni_bugbear_plural: "Bugbears",
  	uni_bugbear_chieftain: "Bugbear Chieftain",
  	uni_bugbear_chieftain_plural: "Bugbear chieftains",
  	uni_bulette: "Bulette",
  	uni_bulette_plural: "Bulettes",
  	uni_cannon: "Cannon",
  	uni_cannon_description: "Field cannons will echo in the ears and nightmares of our enemies",
  	uni_cannon_plural: "Cannons",
  	uni_cataphract: "Cataphract",
  	uni_cataphract_description: "The nobility of the Western Kingdom are heavily armed knights",
  	uni_cataphract_plural: "Cataphract",
  	uni_charmed_dweller: "Charmed dweller",
  	uni_charmed_dweller_description: "a villager with a blank stare",
  	uni_charmed_dweller_plural: "Charmed dwellers",
  	uni_cult_master: "Cult Master",
  	uni_cult_master_plural: "Cult Masters",
  	uni_cyclop: "Cyclop",
  	uni_cyclop_plural: "Cyclops",
  	uni_demoness: "Demoness",
  	uni_demoness_description: "Lady of black magic, she can bend any man to her will",
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
  	uni_elf_warrior_description: "The few remaining elves are formidable warriors",
  	uni_elf_warrior_plural: "Elf warriors",
  	uni_eternal_guardian: "Eternal guardian",
  	uni_eternal_guardian_plural: "Eternal guardians",
  	uni_harpy: "Harpy",
  	uni_harpy_description: "Harpies bewitch humans with their song and devour wretches who get too close",
  	uni_harpy_plural: "Harpies",
  	uni_ball_lightning: "Ball lightning",
  	uni_ball_lightning_plural: "Ball lightnings",
  	uni_bandit: "Bandit",
  	uni_bandit_description: "Poorly organized outlaws, are not a real danger",
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
  	uni_battering_ram_description: "First form of artillery",
  	uni_battering_ram_plural: "Catapults",
  	uni_behemoth: "Behemoth",
  	uni_behemoth_description: "A behemoth of flesh and steel. The best that humans can deploy in the fight against evil",
  	uni_behemoth_plural: "Behemoths",
  	uni_canava_guard: "Canava guard",
  	uni_canava_guard_description: "Heavy armored mercenary troop, his two-handed sword will cause havoc in the enemy ranks",
  	uni_canava_guard_plural: "Canava guards",
  	uni_catapult: "Catapult",
  	uni_catapult_description: "First form of artillery",
  	uni_catapult_plural: "Catapults",
  	uni_cavarly_archer: "Cavarly archer",
  	uni_cavarly_archer_plural: "Cavarly archers",
  	uni_cleric: "Cleric",
  	uni_cleric_description: "Theresmore's elite religious troops, their large shields and armor effectively protecting them",
  	uni_cleric_plural: "Clerics",
  	uni_colonial_militia: "Colonial Militia",
  	uni_colonial_militia_description: "New World Militia. Easily enlisted, they do their duty",
  	uni_colonial_militia_plural: "Colonial Militias",
  	uni_cpt_galliard: "Cpt. Galliard",
  	uni_cpt_galliard_description: "A symbol of hope, a beacon of light in a world darkened by evil",
  	uni_cpt_galliard_plural: "Galliard captains",
  	uni_commander: "Commander",
  	uni_commander_description: "A true leader at the head of the army",
  	uni_commander_plural: "Commanders",
  	uni_crossbowman: "Crossbowman",
  	uni_crossbowman_description: "An improved version of the archer troops, can strike the enemy with precision and pierce armor",
  	uni_crossbowman_plural: "Crossbowmen",
  	uni_cuirassier: "Cuirassier",
  	uni_cuirassier_description: "Armed with heavy armor, sword and gun these powerful cavalry units will dominate the battlefield",
  	uni_cuirassier_plural: "Cuirassiers",
  	uni_daimyo: "Daimyo",
  	uni_daimyo_plural: "Daimyos",
  	uni_demonic_musketeer: "Demonic musketeer",
  	uni_demonic_musketeer_plural: "Demonic musketeers",
  	uni_deserter: "Deserter",
  	uni_deserter_description: "Once soldiers of a kingdom, now live by expediency. They have kept their excellent equipment",
  	uni_deserter_plural: "Deserters",
  	uni_djinn: "Djinn",
  	uni_djinn_plural: "Djinns",
  	uni_dirty_rat: "Dirty rat",
  	uni_dirty_rat_plural: "Dirty rats",
  	uni_earth_elemental: "Earth elemental",
  	uni_earth_elemental_description: "An animated solid rock",
  	uni_earth_elemental_plural: "Earth elementals",
  	uni_ettin: "Ettin",
  	uni_ettin_plural: "Ettins",
  	uni_explorer: "Explorer",
  	uni_explorer_description: "A seasoned scout",
  	uni_explorer_plural: "Explorers",
  	uni_fallen_angel: "Fallen Angel",
  	uni_fallen_angel_plural: "Fallen Angels",
  	uni_fire_elemental: "Fire elemental",
  	uni_fire_elemental_description: "Its breath is fiery and leaves behind lava pools",
  	uni_fire_elemental_plural: "Fire elementals",
  	uni_fire_salamander: "Fire salamander",
  	uni_fire_salamander_plural: "Fire salamanders",
  	uni_frost_elemental: "Frost elemental",
  	uni_frost_elemental_description: "The frost elemental generates an aura of ice around itself",
  	uni_frost_elemental_plural: "Frost elementals",
  	uni_frost_giant: "Frost giant",
  	uni_frost_giant_plural: "Frost giants",
  	uni_galliard: "Galliard",
  	uni_galliard_plural: "Galliards",
  	uni_gargoyle: "Gargoyle",
  	uni_gargoyle_plural: "Gargoyles",
  	uni_general: "General",
  	uni_general_description: "One man army",
  	uni_general_plural: "Generals",
  	uni_giant_snake: "Giant snake",
  	uni_giant_snake_description: "With its coils can crush a Theresmonian tricephalic ox",
  	uni_giant_snake_plural: "Giant snakes",
  	uni_giant_spider: "Giant spider",
  	uni_giant_spider_description: "With its immense web can capture even a griffon vulture",
  	uni_giant_spider_plural: "Giant spiders",
  	uni_giant_wasp: "Giant wasp",
  	uni_giant_wasp_plural: "Giant wasps",
  	uni_goblin_marauder: "Goblin Marauder",
  	uni_goblin_marauder_description: "Goblin raiders have low morale and flee easily",
  	uni_goblin_marauder_plural: "Goblin Marauders",
  	uni_goblin_warrior: "Goblin Warrior",
  	uni_goblin_warrior_description: "Better armed than the marauders, they guard the goblin camps",
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
  	uni_ghast_description: "A smarter version of ghouls",
  	uni_ghast_plural: "Ghasts",
  	uni_ghost: "Ghost",
  	uni_ghost_description: "A damned spirit condemned to wander for eternity",
  	uni_ghost_plural: "Ghosts",
  	uni_ghoul: "Ghoul",
  	uni_ghoul_description: "Always hungry for living flesh",
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
  	uni_jager_description: "Outside these walls you will be our prey!",
  	uni_jager_plural: "Jagers",
  	uni_juggernaut: "Juggernaut",
  	uni_juggernaut_description: "An undead giant monster",
  	uni_juggernaut_plural: "Juggernauts",
  	uni_hill_giant: "Hill giant",
  	uni_hill_giant_description: "Err in the barren hills with big trees as clubs",
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
  	uni_line_infantry_description: "Infantry armed with musket fighting in line",
  	uni_line_infantry_plural: "Line infantry",
  	uni_lizard_archer: "Sssarkat archer",
  	uni_lizard_archer_plural: "Sssarkat archers",
  	uni_lizard_commander: "Sssarkat commander",
  	uni_lizard_commander_plural: "Sssarkat commanders",
  	uni_lizard_shaman: "Sssarkat shaman",
  	uni_lizard_shaman_plural: "Sssarkat shamans",
  	uni_lizard_warrior: "Sssarkat warrior",
  	uni_lizard_warrior_plural: "Sssarkat warriors",
  	uni_knight: "Knight",
  	uni_knight_description: "The elite feudal soldiers in Theresmore, strong in both offense and defense",
  	uni_knight_plural: "Knights",
  	uni_kobold: "Kobold",
  	uni_kobold_description: "Kobolds are humanoid reptiles attracted to all that glitters. They often serve evil ancient dragons",
  	uni_kobold_plural: "Kobolds",
  	uni_kobold_champion: "Kobold Champion",
  	uni_kobold_champion_description: "Kobolds trained to fight for the King",
  	uni_kobold_champion_plural: "Kobold Champions",
  	uni_kobold_king: "Kobold King",
  	uni_kobold_king_description: "Maugrith, the King of Kobold",
  	uni_kobold_king_plural: "Kobold Kings",
  	uni_heavy_warrior: "Heavy warrior",
  	uni_heavy_warrior_description: "The best unit of the ancient era. Effective in both offense and defense",
  	uni_heavy_warrior_plural: "Heavy warriors",
  	uni_katana_samurai: "Katana samurai",
  	uni_katana_samurai_plural: "Katana samurai",
  	uni_imp: "Imp",
  	uni_imp_description: "A mischievous and little flying demon capable of launching fireballs",
  	uni_imp_plural: "Imps",
  	uni_lesser_demon: "Lesser Demon",
  	uni_lesser_demon_description: "One of the minor demons of the infernal hierarchy",
  	uni_lesser_demon_plural: "Lesser Demons",
  	uni_light_cavarly: "Light Cavalry",
  	uni_light_cavarly_description: "Light cavalry, very effective against ranged units",
  	uni_light_cavarly_plural: "Light Cavalries",
  	uni_markanat: "Markanat",
  	uni_markanat_plural: "Markanats",
  	uni_marksman: "Marksman",
  	uni_marksman_description: "Elite ranged troops. Aim small, miss small",
  	uni_marksman_plural: "Marksmen",
  	uni_man_at_arms: "Man at arms",
  	uni_man_at_arms_description: "The direct evolution of heavy warriors but with armor and steel weapons",
  	uni_man_at_arms_plural: "Men at arms",
  	uni_mercenary_veteran: "Mercenary",
  	uni_mercenary_veteran_description: "Veterans in the pay of the highest bidder",
  	uni_mercenary_veteran_plural: "Mercenaries",
  	uni_minotaur: "Minotaur",
  	uni_minotaur_plural: "Minotaurs",
  	uni_myconid: "Myconid",
  	uni_myconid_plural: "Myconids",
  	uni_mountain_giant: "Mountain giant",
  	uni_mountain_giant_description: "His home is a large cave and has dozens of goblins who serve as his servants",
  	uni_mountain_giant_plural: "Mountain giants",
  	uni_musket_ashigaru: "Ashigaru musket",
  	uni_musket_ashigaru_plural: "Ashigaru muskets",
  	uni_necromancer: "Necromancer",
  	uni_necromancer_description: "A magician who worships the black arts, the undead are his servants",
  	uni_necromancer_plural: "Necromancers",
  	uni_naga: "Naga",
  	uni_naga_description: "Naga snakes evolved with 4 arms, usually use them to wield 4 swords",
  	uni_naga_plural: "Nagas",
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
  	uni_paladin_description: "Evil's nemesis armed with faith",
  	uni_paladin_plural: "Paladins",
  	uni_ranger: "Ranger",
  	uni_ranger_description: "With bow and sword, the forest has everything they need for their survival",
  	uni_ranger_plural: "Rangers",
  	uni_red_dragon: "Red Dragon",
  	uni_red_dragon_plural: "Red Dragons",
  	uni_sacred_golem: "Sacred Golem",
  	uni_sacred_golem_description: "A powerful stone warrior animated with magic",
  	uni_sacred_golem_plural: "Sacred Golems",
  	uni_scout: "Scout",
  	uni_scout_description: "The Recon Squad is our family",
  	uni_scout_plural: "Scouts",
  	uni_seraphim: "Seraphim",
  	uni_seraphim_description: "The best of heavenly power",
  	uni_seraphim_plural: "Seraphims",
  	uni_settlement_defenses: "Settlement",
  	uni_settlement_defenses_description: "The defenses of our settlement",
  	uni_settlement_defenses_plural: "Settlements",
  	uni_shieldbearer: "Shieldbearer",
  	uni_shieldbearer_description: "Great shield, great defense",
  	uni_shieldbearer_plural: "Shieldbearers",
  	uni_skeletal_knight: "Skeletal knight",
  	uni_skeletal_knight_plural: "Skeletal knights",
  	uni_skeleton: "Skeleton",
  	uni_skeleton_description: "A heap of bones that moves and wields a weapon",
  	uni_skeleton_plural: "Skeletons",
  	uni_skullface: "Skullface",
  	uni_skullface_plural: "Skullfaces",
  	uni_sluagh: "Sluagh",
  	uni_sluagh_plural: "Sluaghs",
  	uni_snake: "Snake",
  	uni_snake_description: "A poisonous snake",
  	uni_snake_plural: "Snakes",
  	uni_spearman: "Spearman",
  	uni_spearman_description: "The cheap front line of any deployment. It has a good defense",
  	uni_spearman_plural: "Spearmen",
  	uni_spectra_memory: "Specter of memory",
  	uni_spectra_memory_plural: "Specters of memory",
  	uni_spider: "Spider",
  	uni_spider_description: "A multitude of small poisonous spiders",
  	uni_spider_plural: "Spiders",
  	uni_spy: "Spy",
  	uni_spy_description: "Master of deceit",
  	uni_spy_plural: "Spies",
  	uni_son_atamar: "Son of Atamar",
  	uni_son_atamar_plural: "Sons of Atamar",
  	uni_strategist: "Strategist",
  	uni_strategist_description: "Are a master of both battle tactics and spells from behind lines",
  	uni_strategist_plural: "Strategists",
  	uni_succubus: "Succubus",
  	uni_succubus_plural: "Succubuses",
  	uni_succubus_queen: "Succubus Queen",
  	uni_succubus_queen_plural: "Succubus Queens",
  	uni_swamp_horror: "Swamp Horror",
  	uni_swamp_horror_plural: "Swamp Horrors",
  	uni_ravenous_crab: "Ravenous crab",
  	uni_ravenous_crab_plural: "Ravenous crabs",
  	uni_pillager: "Pillager",
  	uni_pillager_plural: "Pillagers",
  	uni_priest: "Priest",
  	uni_priest_description: "In the rear to encourage and bless the soldiers",
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
  	uni_warrior_description: "Simple unit of the ancient era",
  	uni_warrior_plural: "Warriors",
  	uni_warrior_monk: "Monk",
  	uni_warrior_monk_description: "Disciplined and fearsome in battle",
  	uni_warrior_monk_plural: "Monks",
  	uni_warg: "Warg",
  	uni_warg_plural: "Wargs",
  	uni_werewolf: "Werewolf",
  	uni_werewolf_plural: "Werewolfs",
  	uni_wendigo: "Wendigo",
  	uni_wendigo_plural: "Wendigos",
  	uni_white_company: "White Company",
  	uni_white_company_description: "Elite mercenary archers armed with longbow",
  	uni_white_company_plural: "White Companies",
  	uni_wind_elemental: "Wind Elemental",
  	uni_wind_elemental_description: "A tornado of air with sharp blades",
  	uni_wind_elemental_plural: "Wind Elementals",
  	uni_wolf: "Wolf",
  	uni_wolf_plural: "Wolves",
  	uni_wyvern: "Wyvern",
  	uni_wyvern_plural: "Wyverns",
  	uni_tamed_djinn: "Tamed Djinn",
  	uni_tamed_djinn_description: "The Djinn has been tamed and is ready to fight for us",
  	uni_tamed_djinn_plural: "Tamed Djinns",
  	uni_titan: "Titan",
  	uni_titan_plural: "Titans",
  	uni_trebuchet: "Trebuchet",
  	uni_trebuchet_description: "With the evolution of ballistics, we can deploy trebuchets. They have a very good offense",
  	uni_trebuchet_plural: "Trebuchets",
  	uni_troll_battle: "Battle Troll",
  	uni_troll_battle_plural: "Battle Trolls",
  	uni_troll_cave: "Cave Troll",
  	uni_troll_cave_description: "Big and dumb, live in caves that they occupy as their dens. Their huge clubs can crush a man with a single blow",
  	uni_troll_cave_plural: "Cave Trolls",
  	uni_tyrannosaurus: "Tyrannosaurus",
  	uni_tyrannosaurus_plural: "Tyrannosauruses",
  	uni_zombie: "Zombie",
  	uni_zombie_description: "Slow and putrefying, can contaminate vast areas with their disease",
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

  var locations = [
  	{
  		id: "ancient_burial_place",
  		found: [
  			1
  		],
  		esp: 4,
  		level: 1,
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
  		]
  	},
  	{
  		id: "ancient_hideout",
  		found: [
  			12,
  			13
  		],
  		esp: 5,
  		level: 1,
  		army: [
  			{
  				id: "bandit",
  				value: 17
  			}
  		],
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
  		]
  	},
  	{
  		id: "ball_lightning_field",
  		found: [
  			29
  		],
  		esp: 32,
  		level: 3,
  		reqFound: [
  			{
  				type: "tech",
  				id: "new_world_exploration",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "ball_lightning",
  				value: 26
  			}
  		],
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
  		]
  	},
  	{
  		id: "bandit_camp",
  		found: [
  			3,
  			4
  		],
  		esp: 2,
  		level: 1,
  		army: [
  			{
  				id: "bandit",
  				value: 9
  			}
  		],
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
  		]
  	},
  	{
  		id: "barbarian_camp",
  		found: [
  			2
  		],
  		esp: 7,
  		level: 2,
  		army: [
  			{
  				id: "barbarian_warrior",
  				value: 17
  			}
  		],
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
  		]
  	},
  	{
  		id: "barbarian_village",
  		found: [
  			7
  		],
  		esp: 16,
  		level: 4,
  		reqFound: [
  			{
  				type: "tech",
  				id: "tamed_barbarian",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "barren_hills",
  		found: [
  			5
  		],
  		esp: 13,
  		level: 3,
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
  		]
  	},
  	{
  		id: "basilisk_cave",
  		found: [
  			6
  		],
  		esp: 12,
  		level: 3,
  		army: [
  			{
  				id: "basilisk",
  				value: 7
  			}
  		],
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
  		]
  	},
  	{
  		id: "burning_pit",
  		found: [
  			8
  		],
  		esp: 8,
  		level: 2,
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
  		id: "black_mage_tower",
  		found: [
  			39
  		],
  		esp: 20,
  		level: 3,
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
  		]
  	},
  	{
  		id: "bugbear_tribe",
  		found: [
  			9
  		],
  		esp: 8,
  		level: 2,
  		army: [
  			{
  				id: "bugbear",
  				value: 18
  			}
  		],
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
  		]
  	},
  	{
  		id: "bugbear_war_party",
  		found: [
  			9,
  			10
  		],
  		esp: 32,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "long_expedition",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "citadel_dead",
  		found: [
  			20,
  			21
  		],
  		esp: 33,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "long_expedition",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "construction_site",
  		found: [
  			18,
  			19
  		],
  		esp: 12,
  		level: 3,
  		army: [
  			{
  				id: "mercenary_veteran",
  				value: 25
  			}
  		],
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
  		]
  	},
  	{
  		id: "desecrated_temple",
  		found: [
  			28,
  			29,
  			30,
  			31
  		],
  		esp: 45,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "temple_luna",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "deserters_den",
  		found: [
  			10
  		],
  		esp: 16,
  		level: 3,
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
  		]
  	},
  	{
  		id: "demoness_castle",
  		found: [
  			40
  		],
  		esp: 40,
  		level: 5,
  		reqFound: [
  			{
  				type: "prayer",
  				id: "demoniac_tome",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "demonic_portal",
  		found: [
  			11
  		],
  		esp: 28,
  		level: 4,
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
  		]
  	},
  	{
  		id: "hell_hole",
  		found: [
  			12
  		],
  		esp: 42,
  		level: 5,
  		reqFound: [
  			{
  				type: "prayer",
  				id: "demonology",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "archdemon",
  				value: 3
  			},
  			{
  				id: "greater_demon",
  				value: 22
  			},
  			{
  				id: "lesser_demon",
  				value: 48
  			}
  		],
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
  		]
  	},
  	{
  		id: "gold_mine",
  		found: [
  			28
  		],
  		esp: 55,
  		level: 6,
  		reqFound: [
  			{
  				type: "tech",
  				id: "long_expedition",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "king_reptiles",
  		found: [
  			30
  		],
  		esp: 22,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "new_world_exploration",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "east_sacred_place",
  		found: [
  			13,
  			14
  		],
  		esp: 32,
  		level: 5,
  		reqFound: [
  			{
  				type: "prayer",
  				id: "sacred_place",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "wind_elemental",
  				value: 28
  			}
  		],
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
  		]
  	},
  	{
  		id: "eternal_halls",
  		found: [
  			11
  		],
  		esp: 30,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "persuade_people",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "ettin_camp",
  		found: [
  			1,
  			2,
  			3,
  			4,
  			5,
  			6,
  			7,
  			8,
  			9,
  			10,
  			11,
  			12,
  			13,
  			14,
  			15,
  			16,
  			17,
  			18,
  			19,
  			20
  		],
  		esp: 19,
  		level: 3,
  		reqFound: [
  			{
  				type: "tech",
  				id: "aid_request",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "ettin",
  				value: 12
  			}
  		],
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
  		]
  	},
  	{
  		id: "ettin_enslaver",
  		found: [
  			22
  		],
  		esp: 32,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "new_world_exploration",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "ettin",
  				value: 42
  			}
  		],
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
  		]
  	},
  	{
  		id: "earth_elemental_circle",
  		found: [
  			25
  		],
  		esp: 32,
  		level: 6,
  		reqFound: [
  			{
  				type: "tech",
  				id: "new_world_exploration",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "earth_elemental",
  				value: 56
  			}
  		],
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
  		]
  	},
  	{
  		id: "fire_elemental_circle",
  		found: [
  			23
  		],
  		esp: 32,
  		level: 6,
  		reqFound: [
  			{
  				type: "tech",
  				id: "new_world_exploration",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "fire_elemental",
  				value: 56
  			}
  		],
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
  		]
  	},
  	{
  		id: "frost_elemental_circle",
  		found: [
  			24
  		],
  		esp: 32,
  		level: 6,
  		reqFound: [
  			{
  				type: "tech",
  				id: "new_world_exploration",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "frost_elemental",
  				value: 56
  			}
  		],
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
  		]
  	},
  	{
  		id: "wind_elemental_circle",
  		found: [
  			23
  		],
  		esp: 32,
  		level: 6,
  		reqFound: [
  			{
  				type: "tech",
  				id: "new_world_exploration",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "wind_elemental",
  				value: 56
  			}
  		],
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
  		]
  	},
  	{
  		id: "fire_salamander_nest",
  		found: [
  			23
  		],
  		esp: 11,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "new_world_exploration",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "fire_salamander",
  				value: 62
  			}
  		],
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
  		]
  	},
  	{
  		id: "galliard_mercenary_camp",
  		found: [
  			35
  		],
  		esp: 27,
  		level: 4,
  		reqFound: [
  			{
  				type: "tech",
  				id: "mercenary_bands",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "giant_temple",
  		found: [
  			23
  		],
  		esp: 27,
  		level: 4,
  		reqFound: [
  			{
  				type: "tech",
  				id: "new_world_exploration",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "gargoyle",
  				value: 43
  			}
  		],
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
  		]
  	},
  	{
  		id: "gloomy_werewolf_forest",
  		found: [
  			19
  		],
  		esp: 5,
  		level: 4,
  		reqFound: [
  			{
  				type: "tech",
  				id: "monster_hunting",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "werewolf",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "goblin_lair",
  		found: [
  			15,
  			16
  		],
  		esp: 2,
  		level: 1,
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
  		]
  	},
  	{
  		id: "gorgon_cave",
  		found: [
  			17
  		],
  		esp: 5,
  		level: 4,
  		reqFound: [
  			{
  				type: "tech",
  				id: "monster_hunting",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "gorgon",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "gnoll_raiding_party",
  		found: [
  			17
  		],
  		esp: 8,
  		level: 2,
  		army: [
  			{
  				id: "gnoll_raider",
  				value: 25
  			}
  		],
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
  		]
  	},
  	{
  		id: "gnoll_camp",
  		found: [
  			17,
  			18
  		],
  		esp: 37,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "long_expedition",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "golem_cave",
  		found: [
  			21
  		],
  		esp: 15,
  		level: 3,
  		army: [
  			{
  				id: "golem",
  				value: 15
  			}
  		],
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
  		]
  	},
  	{
  		id: "gulud_ugdun",
  		found: [
  			37
  		],
  		esp: 25,
  		level: 4,
  		reqFound: [
  			{
  				type: "tech",
  				id: "path_children",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "harpy_nest",
  		found: [
  			18
  		],
  		esp: 8,
  		level: 2,
  		army: [
  			{
  				id: "harpy",
  				value: 26
  			}
  		],
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
  		]
  	},
  	{
  		id: "haunted_library",
  		found: [
  			5
  		],
  		esp: 4,
  		level: 1,
  		army: [
  			{
  				id: "ghost",
  				value: 9
  			}
  		],
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
  		]
  	},
  	{
  		id: "hobgoblin_encampment",
  		found: [
  			19
  		],
  		esp: 7,
  		level: 2,
  		army: [
  			{
  				id: "hobgoblin_grunt",
  				value: 21
  			}
  		],
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
  		]
  	},
  	{
  		id: "hobgoblin_chieftain",
  		found: [
  			32
  		],
  		esp: 21,
  		level: 4,
  		reqFound: [
  			{
  				type: "tech",
  				id: "guild",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "hydra_pit",
  		found: [
  			18
  		],
  		esp: 5,
  		level: 4,
  		reqFound: [
  			{
  				type: "tech",
  				id: "monster_hunting",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "hydra",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "lead_golem_mine",
  		found: [
  			31
  		],
  		esp: 28,
  		level: 4,
  		reqFound: [
  			{
  				type: "tech",
  				id: "new_world_exploration",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "lead_golem",
  				value: 42
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
  			}
  		]
  	},
  	{
  		id: "lich_temple",
  		found: [
  			19
  		],
  		esp: 31,
  		level: 4,
  		reqFound: [
  			{
  				type: "tech",
  				id: "necromancy",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "kobold_city",
  		found: [
  			14
  		],
  		esp: 18,
  		level: 3,
  		reqFound: [
  			{
  				type: "tech",
  				id: "underground_kobold_mission",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "kobold",
  				value: 99
  			}
  		],
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
  		]
  	},
  	{
  		id: "kobold_underground_tunnels",
  		found: [
  			20
  		],
  		esp: 9,
  		level: 2,
  		army: [
  			{
  				id: "kobold",
  				value: 36
  			}
  		],
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
  		]
  	},
  	{
  		id: "korrigan_dolmen",
  		found: [
  			7
  		],
  		esp: 3,
  		level: 1,
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
  		]
  	},
  	{
  		id: "markanat_forest",
  		found: [
  			22
  		],
  		esp: 12,
  		level: 4,
  		reqFound: [
  			{
  				type: "tech",
  				id: "long_expedition",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "markanat",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "minotaur_maze",
  		found: [
  			20
  		],
  		esp: 5,
  		level: 4,
  		reqFound: [
  			{
  				type: "tech",
  				id: "monster_hunting",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "minotaur",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "mountain_cave",
  		found: [
  			22
  		],
  		esp: 17,
  		level: 3,
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
  		]
  	},
  	{
  		id: "mountain_valley",
  		found: [
  			29
  		],
  		esp: 50,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "long_expedition",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "naga_nest",
  		found: [
  			23
  		],
  		esp: 8,
  		level: 2,
  		army: [
  			{
  				id: "naga",
  				value: 12
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
  		id: "djinn_palace",
  		found: [
  			25
  		],
  		esp: 32,
  		level: 4,
  		reqFound: [
  			{
  				type: "prayer",
  				id: "strange_lamp",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "necromancer_crypt",
  		found: [
  			26
  		],
  		esp: 14,
  		level: 3,
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
  		]
  	},
  	{
  		id: "north_sacred_place",
  		found: [
  			27
  		],
  		esp: 32,
  		level: 5,
  		reqFound: [
  			{
  				type: "prayer",
  				id: "sacred_place",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "frost_elemental",
  				value: 28
  			}
  		],
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
  		]
  	},
  	{
  		id: "mercenary_camp",
  		found: [
  			28
  		],
  		esp: 32,
  		level: 3,
  		army: [
  			{
  				id: "mercenary_veteran",
  				value: 30
  			}
  		],
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
  		]
  	},
  	{
  		id: "myconid_cavern",
  		found: [
  			29
  		],
  		esp: 14,
  		level: 3,
  		army: [
  			{
  				id: "myconid",
  				value: 42
  			}
  		],
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
  		]
  	},
  	{
  		id: "old_herd",
  		found: [
  			28,
  			29
  		],
  		esp: 4,
  		level: 1,
  		army: [
  			{
  				id: "dirty_rat",
  				value: 18
  			}
  		],
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
  		]
  	},
  	{
  		id: "old_storage_room",
  		found: [
  			29,
  			30,
  			31
  		],
  		esp: 4,
  		level: 1,
  		army: [
  			{
  				id: "spider",
  				value: 5
  			}
  		],
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
  		]
  	},
  	{
  		id: "orc_gormiak_citadel",
  		found: [
  			7,
  			8,
  			9
  		],
  		esp: 45,
  		level: 6,
  		reqFound: [
  			{
  				type: "tech",
  				id: "orcish_citadel",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "orc_horith_citadel",
  		found: [
  			10,
  			11
  		],
  		esp: 50,
  		level: 6,
  		reqFound: [
  			{
  				type: "tech",
  				id: "mankind_darkest",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "orc_ogsog_citadel",
  		found: [
  			12,
  			13
  		],
  		esp: 50,
  		level: 6,
  		reqFound: [
  			{
  				type: "tech",
  				id: "mankind_darkest",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "orc_turgon_citadel",
  		found: [
  			14,
  			15
  		],
  		esp: 50,
  		level: 6,
  		reqFound: [
  			{
  				type: "tech",
  				id: "mankind_darkest",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "orc_raiding_party",
  		found: [
  			4,
  			5,
  			6
  		],
  		esp: 34,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "orcish_threat",
  				value: 1
  			}
  		],
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
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "orcish_prison_camp",
  		found: [
  			1,
  			2,
  			3
  		],
  		esp: 34,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "burned_farms",
  				value: 1
  			}
  		],
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
  		gen: [
  			{
  				type: "population",
  				id: "unemployed",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "rusted_warehouse",
  		found: [
  			31,
  			32
  		],
  		esp: 8,
  		level: 2,
  		army: [
  			{
  				id: "bandit",
  				value: 22
  			}
  		],
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
  		]
  	},
  	{
  		id: "sleeping_titan",
  		found: [
  			38
  		],
  		esp: 1,
  		level: 8,
  		reqFound: [
  			{
  				type: "tech",
  				id: "titan_mosaic",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "titan",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 150,
  				fix: true
  			}
  		]
  	},
  	{
  		id: "skullface_encampment",
  		found: [
  			1,
  			2
  		],
  		esp: 13,
  		level: 3,
  		reqFound: [
  			{
  				type: "tech",
  				id: "bandit_chief",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "skullface",
  				value: 1
  			},
  			{
  				id: "bandit",
  				value: 55
  			}
  		],
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
  		]
  	},
  	{
  		id: "snakes_nest",
  		found: [
  			30
  		],
  		esp: 8,
  		level: 2,
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
  		]
  	},
  	{
  		id: "spider_forest",
  		found: [
  			31
  		],
  		esp: 13,
  		level: 3,
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
  		]
  	},
  	{
  		id: "son_atamar",
  		found: [
  			21
  		],
  		esp: 32,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "deserter_origin",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "strange_village",
  		found: [
  			32
  		],
  		esp: 17,
  		level: 3,
  		army: [
  			{
  				id: "charmed_dweller",
  				value: 47
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "unemployed",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "south_sacred_place",
  		found: [
  			33,
  			34
  		],
  		esp: 32,
  		level: 5,
  		reqFound: [
  			{
  				type: "prayer",
  				id: "sacred_place",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "fire_elemental",
  				value: 28
  			}
  		],
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
  		]
  	},
  	{
  		id: "succubus_library",
  		found: [
  			33
  		],
  		esp: 29,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "new_world_exploration",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "succubus",
  				value: 90
  			}
  		],
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
  		]
  	},
  	{
  		id: "swarm_wasp",
  		found: [
  			29
  		],
  		esp: 10,
  		level: 4,
  		reqFound: [
  			{
  				type: "tech",
  				id: "new_world_exploration",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "giant_wasp",
  				value: 540
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.2
  			}
  		]
  	},
  	{
  		id: "temple_gargoyle",
  		found: [
  			32
  		],
  		esp: 7,
  		level: 2,
  		army: [
  			{
  				id: "gargoyle",
  				value: 14
  			}
  		],
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
  		]
  	},
  	{
  		id: "troll_cave",
  		found: [
  			35
  		],
  		esp: 8,
  		level: 2,
  		army: [
  			{
  				id: "troll_cave",
  				value: 9
  			}
  		],
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
  		]
  	},
  	{
  		id: "west_sacred_place",
  		found: [
  			37,
  			38
  		],
  		esp: 32,
  		level: 5,
  		reqFound: [
  			{
  				type: "prayer",
  				id: "sacred_place",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "earth_elemental",
  				value: 28
  			}
  		],
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
  		]
  	},
  	{
  		id: "wolf_pack",
  		found: [
  			24
  		],
  		esp: 2,
  		level: 1,
  		army: [
  			{
  				id: "wolf",
  				value: 9
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "worn_down_crypt",
  		found: [
  			37
  		],
  		esp: 14,
  		level: 4,
  		reqFound: [
  			{
  				type: "tech",
  				id: "guild",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "skeletal_knight",
  				value: 67
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "wyvern_nest",
  		found: [
  			36
  		],
  		esp: 12,
  		level: 3,
  		army: [
  			{
  				id: "wyvern",
  				value: 12
  			}
  		],
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
  		]
  	},
  	{
  		id: "cave_bats",
  		found: [
  			1,
  			2,
  			3,
  			4,
  			5,
  			6,
  			7,
  			8,
  			9,
  			10,
  			11,
  			12,
  			13,
  			14,
  			15,
  			16,
  			17,
  			18,
  			19,
  			20,
  			33,
  			34,
  			35,
  			36,
  			37,
  			38,
  			39,
  			40
  		],
  		esp: 1,
  		level: 0,
  		army: [
  			{
  				id: "vampire_bat",
  				value: 2
  			}
  		],
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
  		]
  	},
  	{
  		id: "kobold_looters",
  		found: [
  			1,
  			2,
  			3,
  			4,
  			5,
  			6,
  			7,
  			8,
  			9,
  			10,
  			11,
  			12,
  			13,
  			14,
  			15,
  			16,
  			17,
  			18,
  			19,
  			20,
  			21,
  			22,
  			23,
  			24,
  			25,
  			26,
  			27,
  			28,
  			29,
  			30,
  			31,
  			32
  		],
  		esp: 1,
  		level: 0,
  		army: [
  			{
  				id: "kobold",
  				value: 2
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 0.5
  			}
  		]
  	},
  	{
  		id: "nasty_pillagers",
  		found: [
  			1,
  			2,
  			3,
  			4,
  			5,
  			6,
  			7,
  			8,
  			9,
  			10,
  			11,
  			12,
  			13,
  			14,
  			15,
  			16,
  			17,
  			18,
  			19,
  			20,
  			25,
  			26,
  			27,
  			28,
  			29,
  			30,
  			31,
  			32
  		],
  		esp: 1,
  		level: 0,
  		army: [
  			{
  				id: "pillager",
  				value: 2
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "iron",
  				value: 0.2
  			}
  		]
  	},
  	{
  		id: "prisoner_wagon",
  		found: [
  			1,
  			2,
  			3,
  			4,
  			5,
  			6,
  			7,
  			8,
  			9,
  			10,
  			11,
  			12,
  			13,
  			14,
  			15,
  			16,
  			17,
  			18,
  			19,
  			20,
  			25,
  			26,
  			27,
  			28,
  			29,
  			30,
  			31,
  			32
  		],
  		esp: 1,
  		level: 0,
  		army: [
  			{
  				id: "bandit",
  				value: 2
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "unemployed",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "rat_cellar",
  		found: [
  			1,
  			2,
  			3,
  			4,
  			5,
  			6,
  			7,
  			8,
  			9,
  			10,
  			11,
  			12,
  			13,
  			14,
  			15,
  			16,
  			17,
  			18,
  			19,
  			20,
  			25,
  			26,
  			27,
  			28,
  			29,
  			30,
  			31,
  			32
  		],
  		esp: 1,
  		level: 0,
  		army: [
  			{
  				id: "dirty_rat",
  				value: 3
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: 0.5
  			}
  		]
  	},
  	{
  		id: "vampire_crypt",
  		found: [
  			35,
  			36
  		],
  		esp: 35,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "long_expedition",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "vampire_lair",
  		found: [
  			37
  		],
  		esp: 32,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "trail_blood",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "far_west_island",
  		found: [
  			17,
  			18,
  			19,
  			20,
  			21,
  			22,
  			23,
  			24,
  			25,
  			35,
  			36
  		],
  		esp: 10,
  		level: 1,
  		reqFound: [
  			{
  				type: "tech",
  				id: "seafaring",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "ravenous_crab",
  				value: 15
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 10,
  				fix: true
  			}
  		]
  	},
  	{
  		id: "old_outpost",
  		found: [
  			34
  		],
  		esp: 12,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "free_old_outpost",
  				value: 1
  			}
  		],
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
  		]
  	},
  	{
  		id: "forgotten_shelter",
  		found: [
  			36
  		],
  		esp: 22,
  		level: 5,
  		reqFound: [
  			{
  				type: "tech",
  				id: "galliard_secret",
  				value: 1
  			}
  		],
  		army: [
  			{
  				id: "spectra_memory",
  				value: 250
  			}
  		],
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
  		]
  	},
  	{
  		id: "ancient_giant",
  		found: [
  			38
  		],
  		esp: 31,
  		level: 6,
  		reqFound: [
  			{
  				type: "tech",
  				id: "wings_freedom",
  				value: 1
  			}
  		],
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
  		]
  	}
  ];

  var spells = [
  	{
  		id: "praise_gods",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 250
  			},
  			{
  				type: "building",
  				id: "temple",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "blessing",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 500
  			},
  			{
  				type: "prayer",
  				id: "praise_gods",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "sacrifices_gods",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 600
  			},
  			{
  				type: "prayer",
  				id: "praise_gods",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "acolyte_circle",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 800
  			},
  			{
  				type: "prayer",
  				id: "blessing",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "prayer_for_the_great_seeker",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 800
  			},
  			{
  				type: "prayer",
  				id: "blessing",
  				value: 1
  			},
  			{
  				type: "army",
  				id: "archer",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "prayer_for_mother_earth",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 800
  			},
  			{
  				type: "prayer",
  				id: "blessing",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "prayer_wild_man",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 800
  			},
  			{
  				type: "prayer",
  				id: "blessing",
  				value: 1
  			},
  			{
  				type: "building",
  				id: "stable",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "mana_defense",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1200
  			},
  			{
  				type: "building",
  				id: "wall",
  				value: 1
  			},
  			{
  				type: "prayer",
  				id: "blessing",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "prayer_for_the_old_small_one",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1200
  			},
  			{
  				type: "prayer",
  				id: "blessing",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "prayer_for_the_ancient_monk",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1200
  			},
  			{
  				type: "prayer",
  				id: "prayer_for_the_old_small_one",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "prayer_for_the_great_warrior",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1200
  			},
  			{
  				type: "prayer",
  				id: "prayer_for_the_great_seeker",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "prayer_goddess_luck",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1200
  			},
  			{
  				type: "prayer",
  				id: "blessing",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "sacred_equipments",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1200
  			},
  			{
  				type: "tech",
  				id: "warfare",
  				value: 1
  			},
  			{
  				type: "prayer",
  				id: "blessing",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "spear_wild_man",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1200
  			},
  			{
  				type: "prayer",
  				id: "blessing",
  				value: 1
  			},
  			{
  				type: "army",
  				id: "light_cavarly",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "strange_lamp",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1200
  			},
  			{
  				type: "enemy",
  				id: "naga_nest",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "study_undead_creatures",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1200
  			},
  			{
  				type: "enemy",
  				id: "ancient_burial_place",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "unveil_theresmore",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1200
  			},
  			{
  				type: "prayer",
  				id: "blessing",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "sacred_place",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 1600
  			},
  			{
  				type: "prayer",
  				id: "unveil_theresmore",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "growth_nature",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2000
  			},
  			{
  				type: "tech",
  				id: "liturgical_rites",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "lighten_rocks",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2000
  			},
  			{
  				type: "tech",
  				id: "liturgical_rites",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "magical_tools",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2000
  			},
  			{
  				type: "tech",
  				id: "liturgical_rites",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "magical_lights",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2000
  			},
  			{
  				type: "tech",
  				id: "liturgical_rites",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "desire_abundance",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2000
  			},
  			{
  				type: "enemy",
  				id: "djinn_palace",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 0.3
  			},
  			{
  				type: "prayer",
  				id: "desire_magic",
  				value: -1
  			},
  			{
  				type: "prayer",
  				id: "desire_war",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "desire_magic",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2000
  			},
  			{
  				type: "enemy",
  				id: "djinn_palace",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 10
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 10
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.3
  			},
  			{
  				type: "prayer",
  				id: "desire_abundance",
  				value: -1
  			},
  			{
  				type: "prayer",
  				id: "desire_war",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "desire_war",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2000
  			},
  			{
  				type: "enemy",
  				id: "djinn_palace",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "prayer",
  				id: "desire_magic",
  				value: -1
  			},
  			{
  				type: "prayer",
  				id: "desire_abundance",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "demonology",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2500
  			},
  			{
  				type: "enemy",
  				id: "demonic_portal",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "demoniac_tome",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2500
  			},
  			{
  				type: "tech",
  				id: "pentagram_tome",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "temple_mirune",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 5000
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 3500
  			},
  			{
  				type: "enemy",
  				id: "temple_gargoyle",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "create_sacred_golem",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2500
  			},
  			{
  				type: "tech",
  				id: "construction_of_automata",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "mana_defense_II",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2500
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 200
  			},
  			{
  				type: "prayer",
  				id: "mana_defense",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "prayer_for_the_great_builder",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2500
  			},
  			{
  				type: "tech",
  				id: "magic_arts_teaching",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "prayer_for_the_mysterious_arcane",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2500
  			},
  			{
  				type: "tech",
  				id: "magic_arts_teaching",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "sacred_equipments_II",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2500
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 200
  			},
  			{
  				type: "prayer",
  				id: "sacred_equipments",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "the_aid",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 4000
  			},
  			{
  				type: "tech",
  				id: "the_scourge",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "zenix_aid",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 4000
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 400
  			},
  			{
  				type: "building",
  				id: "university",
  				value: 7
  			}
  		]
  	},
  	{
  		id: "dragon_skull",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 5000
  			},
  			{
  				type: "building",
  				id: "refugee_district",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "holy_light",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 5000
  			},
  			{
  				type: "building",
  				id: "temple",
  				value: 7
  			}
  		],
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
  		id: "power_spell_east",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 5000
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 800
  			},
  			{
  				type: "enemy",
  				id: "east_sacred_place",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "power_spell_west",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 5000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 3000
  			},
  			{
  				type: "enemy",
  				id: "west_sacred_place",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "power_spell_north",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 5000
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 8000
  			},
  			{
  				type: "enemy",
  				id: "north_sacred_place",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "power_spell_south",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 20000
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 5000
  			},
  			{
  				type: "enemy",
  				id: "south_sacred_place",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "gold_consecration",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 6000
  			},
  			{
  				type: "tech",
  				id: "gold_domination_project",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "gold",
  				value: 20000
  			}
  		]
  	},
  	{
  		id: "mother_earth_2",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 6000
  			},
  			{
  				type: "building",
  				id: "conclave",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "great_seeker_2",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 6000
  			},
  			{
  				type: "building",
  				id: "conclave",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "great_warrior_2",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 6000
  			},
  			{
  				type: "building",
  				id: "conclave",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "old_small_one_2",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 6000
  			},
  			{
  				type: "building",
  				id: "conclave",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "wild_man_2",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 6000
  			},
  			{
  				type: "building",
  				id: "conclave",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "northern_star_power",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 7000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 5000
  			},
  			{
  				type: "tech",
  				id: "northern_star",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "army_faith",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 10000
  			},
  			{
  				type: "building",
  				id: "temple",
  				value: 13
  			}
  		],
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
  		id: "accept_druid",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 13000
  			},
  			{
  				type: "tech",
  				id: "lonely_druid",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "prayer",
  				id: "banish_druid",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "banish_druid",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 13000
  			},
  			{
  				type: "tech",
  				id: "lonely_druid",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "prayer",
  				id: "accept_druid",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "prayer_lonely_druid",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 13500
  			},
  			{
  				type: "prayer",
  				id: "accept_druid",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "city_blessing",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 13500
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 10000
  			},
  			{
  				type: "tech",
  				id: "rage_druid",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "protection_power",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "stone",
  				value: 22000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 5500
  			},
  			{
  				type: "prayer",
  				id: "northern_star_power",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "prayer",
  				id: "incremental_power",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "incremental_power",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "steel",
  				value: 6000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 5500
  			},
  			{
  				type: "prayer",
  				id: "northern_star_power",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "prayer",
  				id: "protection_power",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "pilgrim_chant",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 16000
  			},
  			{
  				type: "tech",
  				id: "faith_world",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "warrior_gods",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 18000
  			},
  			{
  				type: "tech",
  				id: "new_old_gods",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "blessing_church",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 20000
  			},
  			{
  				type: "tech",
  				id: "new_old_gods",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "shape_mana",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 20000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 12000
  			},
  			{
  				type: "tech",
  				id: "mana_investigation",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "blessing_prelate",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 25000
  			},
  			{
  				type: "tech",
  				id: "colonial_consacration",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "hope_children",
  		type: "prayer",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 15000
  			},
  			{
  				type: "enemy",
  				id: "gulud_ugdun",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "temple_ritual",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "praise_gods",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -2
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "minor_blessing",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "blessing",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -2
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 1,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 1,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "acolyte_hymn",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "acolyte_circle",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -5
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 2,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "great_seeker_blessing",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "prayer_for_the_great_seeker",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -5
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 2
  			},
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
  		req: [
  			{
  				type: "prayer",
  				id: "prayer_for_the_great_warrior",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -5
  			},
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
  		id: "goddess_luck_blessing",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "prayer_goddess_luck",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -5
  			},
  			{
  				type: "resource",
  				id: "luck",
  				value: 5,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "mana_energy_shield",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "mana_defense",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -5
  			},
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
  		id: "mother_earth_blessing",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "prayer_for_mother_earth",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -5
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 5,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "old_small_one_blessing",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "prayer_for_the_old_small_one",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -5
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 5,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "sacred_armor",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "sacred_equipments",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -5
  			},
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
  		id: "theresmore_revealed",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "unveil_theresmore",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -5
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 3,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "wild_man_blessing",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "prayer_wild_man",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -5
  			},
  			{
  				type: "resource",
  				id: "cow",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "horse",
  				value: 5,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "wild_man_spear",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "spear_wild_man",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -5
  			},
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
  		id: "growth_of_nature",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "growth_nature",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -7
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 3.5
  			}
  		]
  	},
  	{
  		id: "lighten_of_rocks",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "lighten_rocks",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -7
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 3.5
  			}
  		]
  	},
  	{
  		id: "magic_tools",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "magical_tools",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -7
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "magic_lights",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "magical_lights",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -7
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 1.5
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 1.5
  			}
  		]
  	},
  	{
  		id: "mirune_blessing",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "temple_mirune",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -10
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 2.5
  			}
  		]
  	},
  	{
  		id: "dark_ritual",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "demonology",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -10
  			},
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
  		id: "great_builder_blessing",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "prayer_for_the_great_builder",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -10
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 3,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "mana_dome",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "mana_defense_II",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -10
  			},
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
  		id: "mysterious_arcane_blessing",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "prayer_for_the_mysterious_arcane",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -10
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 0.6
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 10,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "sacred_weapon",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "sacred_equipments_II",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -10
  			},
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
  		req: [
  			{
  				type: "prayer",
  				id: "blessing_church",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -20
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 10
  			},
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
  		req: [
  			{
  				type: "prayer",
  				id: "great_seeker_2",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -20
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 5
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
  		req: [
  			{
  				type: "prayer",
  				id: "great_warrior_2",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -20
  			},
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
  		id: "mother_earth_grace",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "mother_earth_2",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -20
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 12,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 12,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "new_world_chant",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "pilgrim_chant",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -20
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 5
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 5
  			},
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
  		id: "old_small_one_grace",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "old_small_one_2",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -20
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 12,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 12,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 12,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "wild_man_dexterity",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "wild_man_2",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -20
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
  		req: [
  			{
  				type: "prayer",
  				id: "dragon_skull",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -20
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
  		req: [
  			{
  				type: "prayer",
  				id: "dragon_skull",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -20
  			},
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
  		req: [
  			{
  				type: "prayer",
  				id: "shape_mana",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -30
  			},
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
  		id: "druid_blessing",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "prayer_lonely_druid",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -40
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 10
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 10
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 15,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "blessing_city",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "city_blessing",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -40
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 1
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 10,
  				perc: true
  			},
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
  		req: [
  			{
  				type: "prayer",
  				id: "protection_power",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -50
  			},
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
  		id: "northern_star_incremental",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "incremental_power",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -50
  			},
  			{
  				type: "resource",
  				id: "building_material",
  				value: 15,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 15,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 15,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 15,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 15,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 15,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "army_blessing",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "blessing_prelate",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -60
  			},
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
  	},
  	{
  		id: "children_hope",
  		type: "spell",
  		req: [
  			{
  				type: "prayer",
  				id: "hope_children",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -200
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 25,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 25,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 25,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 25,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 25,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 25,
  				perc: true
  			}
  		]
  	}
  ];

  var tech = [
  	{
  		id: "housing"
  	},
  	{
  		id: "monument_past",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 5
  			},
  			{
  				type: "tech",
  				id: "housing",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "monument_1",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "heirloom_housing",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10
  			},
  			{
  				type: "building",
  				id: "monument",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "population",
  				id: "farmer",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "lumberjack",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "quarryman",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "heirloom_horseshoes_t",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10
  			},
  			{
  				type: "building",
  				id: "monument",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "heirloom_horseshoes",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "artisan",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "breeder",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "heirloom_momento_t",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10
  			},
  			{
  				type: "building",
  				id: "monument",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "heirloom_momento",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 2
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
  				type: "population",
  				id: "miner",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "heirloom_contract_t",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10
  			},
  			{
  				type: "building",
  				id: "monument",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "heirloom_contract",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 15
  			},
  			{
  				type: "population",
  				id: "merchant",
  				value: 1
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "heirloom_wisdom_t",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10
  			},
  			{
  				type: "building",
  				id: "monument",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "heirloom_wisdom",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 2
  			},
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
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "heirloom_death_t",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10
  			},
  			{
  				type: "building",
  				id: "monument",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "heirloom_death",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 2
  			},
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
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "heirloom_wealth_t",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10
  			},
  			{
  				type: "building",
  				id: "monument",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "heirloom_wealth",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2
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
  				id: "warrior",
  				type_gen: "stat",
  				gen: "defense",
  				value: 3,
  				perc: false
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "agricolture",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10
  			},
  			{
  				type: "tech",
  				id: "housing",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "stone_masonry",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 20
  			},
  			{
  				type: "tech",
  				id: "housing",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "wood_cutting",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 20
  			},
  			{
  				type: "tech",
  				id: "housing",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "crop_rotation",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 100
  			},
  			{
  				type: "building",
  				id: "farm",
  				value: 5
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 5,
  				fix: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "farmer",
  				type_gen: "resource",
  				gen: "food",
  				value: 2,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "grain_surplus",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 150
  			},
  			{
  				type: "tech",
  				id: "crop_rotation",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "grain_storage",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "pottery",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 150
  			},
  			{
  				type: "tech",
  				id: "stone_masonry",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "woodcarvers",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 150
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 20
  			},
  			{
  				type: "building",
  				id: "lumberjack_camp",
  				value: 5
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 10,
  				fix: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "lumberjack",
  				type_gen: "resource",
  				gen: "wood",
  				value: 2,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "wood_saw",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 170
  			},
  			{
  				type: "tech",
  				id: "woodcarvers",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "woodworking",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "stone_extraction_tools",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 175
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 25
  			},
  			{
  				type: "building",
  				id: "quarry",
  				value: 5
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 10,
  				fix: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "quarryman",
  				type_gen: "resource",
  				gen: "stone",
  				value: 2,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "stone_processing",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 175
  			},
  			{
  				type: "tech",
  				id: "stone_extraction_tools",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "stonemason_l",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "archery",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 200
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 150
  			},
  			{
  				type: "tech",
  				id: "wood_cutting",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "army",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "mining",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 250
  			},
  			{
  				type: "building",
  				id: "quarry",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "architecture_titan_t",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 250
  			},
  			{
  				type: "tech",
  				id: "mining",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "architecture_titan",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "mining_efficency",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 250
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 50
  			},
  			{
  				type: "building",
  				id: "mine",
  				value: 5
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 15,
  				fix: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "miner",
  				type_gen: "resource",
  				gen: "copper",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "miner",
  				type_gen: "resource",
  				gen: "iron",
  				value: 2,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "storage",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 300
  			},
  			{
  				type: "tech",
  				id: "agricolture",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "local_products",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 350
  			},
  			{
  				type: "building",
  				id: "artisan_workshop",
  				value: 5
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 20,
  				fix: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "artisan",
  				type_gen: "resource",
  				gen: "tools",
  				value: 2,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "writing",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 500
  			},
  			{
  				type: "tech",
  				id: "pottery",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "bronze_working",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 600
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 300
  			},
  			{
  				type: "tech",
  				id: "mining",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "army",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "ancient_balor_t",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 650
  			},
  			{
  				type: "tech",
  				id: "bronze_working",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "ancient_balor_l",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "training_militia",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 700
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 400
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 250
  			},
  			{
  				type: "tech",
  				id: "bronze_working",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "militia_recruitment",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "magic",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 750
  			},
  			{
  				type: "tech",
  				id: "religion",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "mythology",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 750
  			},
  			{
  				type: "tech",
  				id: "writing",
  				value: 1
  			},
  			{
  				type: "building",
  				id: "common_house",
  				value: 8
  			}
  		]
  	},
  	{
  		id: "breeding",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 800
  			},
  			{
  				type: "building",
  				id: "farm",
  				value: 5
  			},
  			{
  				type: "tech",
  				id: "storage",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "ancient_stockpile",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 1000
  			},
  			{
  				type: "tech",
  				id: "remember_the_ancients",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "ancient_vault",
  				value: 1
  			},
  			{
  				type: "stat",
  				id: "reset",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "fortification",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 1000
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 1000
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 1000
  			},
  			{
  				type: "tech",
  				id: "bronze_working",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "army",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "wall_titan_t",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 1000
  			},
  			{
  				type: "tech",
  				id: "fortification",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "wall_titan",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "remember_the_ancients",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 1000
  			},
  			{
  				type: "tech",
  				id: "mythology",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "library_theresmore",
  				value: 1
  			},
  			{
  				type: "stat",
  				id: "reset",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "servitude",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 1250
  			},
  			{
  				type: "tech",
  				id: "bronze_working",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "lumberjack",
  				type_gen: "resource",
  				gen: "wood",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "quarryman",
  				type_gen: "resource",
  				gen: "stone",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "miner",
  				type_gen: "resource",
  				gen: "copper",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "miner",
  				type_gen: "resource",
  				gen: "iron",
  				value: 2,
  				perc: true
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "mathematic",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 2500
  			},
  			{
  				type: "tech",
  				id: "writing",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "lumberjack",
  				type_gen: "resource",
  				gen: "wood",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "quarryman",
  				type_gen: "resource",
  				gen: "stone",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "miner",
  				type_gen: "resource",
  				gen: "copper",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "miner",
  				type_gen: "resource",
  				gen: "iron",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 5,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "municipal_administration",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 2500
  			},
  			{
  				type: "building",
  				id: "common_house",
  				value: 15
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 30,
  				fix: true
  			}
  		]
  	},
  	{
  		id: "warfare",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2500
  			},
  			{
  				type: "tech",
  				id: "iron_working",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 25,
  				fix: true
  			}
  		]
  	},
  	{
  		id: "canava_mercenary",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 4000
  			},
  			{
  				type: "tech",
  				id: "warfare",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "coin_mercenary",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "currency",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 3000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 1500
  			},
  			{
  				type: "tech",
  				id: "mathematic",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "tamed_barbarian",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 3000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 1000
  			},
  			{
  				type: "enemy",
  				id: "barbarian_camp",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "religion",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 3500
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 1500
  			},
  			{
  				type: "tech",
  				id: "writing",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "forging_equipments",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 3500
  			},
  			{
  				type: "building",
  				id: "artisan_workshop",
  				value: 7
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 500
  			}
  		],
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
  		id: "cloistered_life",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 3500
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 800
  			},
  			{
  				type: "tech",
  				id: "magic",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "monastic_orders",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "regional_markets",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 4000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2500
  			},
  			{
  				type: "tech",
  				id: "currency",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "regional_market",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "fortune_sanctuary",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 4500
  			},
  			{
  				type: "prayer",
  				id: "prayer_goddess_luck",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "enclosures",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 5000
  			},
  			{
  				type: "building",
  				id: "farm",
  				value: 15
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 25,
  				fix: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "farmer",
  				type_gen: "resource",
  				gen: "food",
  				value: 5,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "fine_marbles",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 5000
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 1000
  			},
  			{
  				type: "building",
  				id: "quarry",
  				value: 15
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 25,
  				fix: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "quarryman",
  				type_gen: "resource",
  				gen: "stone",
  				value: 5,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "fine_woods",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 5000
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 1000
  			},
  			{
  				type: "building",
  				id: "lumberjack_camp",
  				value: 15
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 25,
  				fix: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "lumberjack",
  				type_gen: "resource",
  				gen: "wood",
  				value: 5,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "iron_working",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 5000
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 600
  			},
  			{
  				type: "tech",
  				id: "bronze_working",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "army",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "holy_fury",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 5000
  			},
  			{
  				type: "tech",
  				id: "iron_working",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "angel",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "seraphim_t",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 5000
  			},
  			{
  				type: "tech",
  				id: "holy_fury",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "seraphim_l",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "mercenary_bands",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 5000
  			},
  			{
  				type: "tech",
  				id: "feudalism",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "army",
  				value: 5
  			}
  		]
  	},
  	{
  		id: "white_t_company",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 7000
  			},
  			{
  				type: "tech",
  				id: "mercenary_bands",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "white_m_company",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "galliard_mercenary",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 10000
  			},
  			{
  				type: "enemy",
  				id: "galliard_mercenary_camp",
  				value: 1
  			}
  		],
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
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 5
  			}
  		]
  	},
  	{
  		id: "cpt_galliard_t",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 10000
  			},
  			{
  				type: "tech",
  				id: "galliard_mercenary",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "cpt_galliard_l",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "free_old_outpost",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 9000
  			},
  			{
  				type: "tech",
  				id: "cpt_galliard_t",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "cpt_galliard_story",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "mercenary_outpost_t",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 11000
  			},
  			{
  				type: "enemy",
  				id: "old_outpost",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "galliard_secret",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 9000
  			},
  			{
  				type: "tech",
  				id: "mercenary_outpost_t",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "tome_ancient_lore",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10000
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 3000
  			},
  			{
  				type: "enemy",
  				id: "forgotten_shelter",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10
  			},
  			{
  				type: "resource",
  				id: "saltpetre",
  				value: 2
  			}
  		]
  	},
  	{
  		id: "wings_freedom",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 11000
  			},
  			{
  				type: "tech",
  				id: "tome_ancient_lore",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "galliard_true_form",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 12000
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 5000
  			},
  			{
  				type: "enemy",
  				id: "ancient_giant",
  				value: 1
  			}
  		],
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
  		id: "end_ancient_era",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 5500
  			},
  			{
  				type: "building",
  				id: "common_house",
  				value: 15
  			},
  			{
  				type: "building",
  				id: "artisan_workshop",
  				value: 5
  			},
  			{
  				type: "tech",
  				id: "iron_working",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "religion",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "plenty_valley",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 6000
  			},
  			{
  				type: "cap",
  				id: "food",
  				value: 5000
  			}
  		]
  	},
  	{
  		id: "barbarian_tribes",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 6000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2000
  			},
  			{
  				type: "enemy",
  				id: "barbarian_village",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "bandit_chief",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 6000
  			},
  			{
  				type: "enemy",
  				id: "bandit_camp",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "deserter_origin",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 7000
  			},
  			{
  				type: "enemy",
  				id: "deserters_den",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "feudalism",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 7500
  			},
  			{
  				type: "building",
  				id: "city_center",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "army",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "espionage",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 7500
  			},
  			{
  				type: "tech",
  				id: "mercenary_bands",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "forging_equipments_II",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 7500
  			},
  			{
  				type: "building",
  				id: "artisan_workshop",
  				value: 13
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 1000
  			}
  		],
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
  		id: "architecture",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 8000
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 1500
  			},
  			{
  				type: "resource",
  				id: "stone",
  				value: 1000
  			},
  			{
  				type: "tech",
  				id: "feudalism",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "crossbow",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 2000
  			},
  			{
  				type: "resource",
  				id: "wood",
  				value: 1000
  			},
  			{
  				type: "tech",
  				id: "feudalism",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "army",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "siege_techniques",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10000
  			},
  			{
  				type: "tech",
  				id: "crossbow",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "besieging_engineers",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10000
  			},
  			{
  				type: "tech",
  				id: "siege_techniques",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "education",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10000
  			},
  			{
  				type: "tech",
  				id: "feudalism",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "liturgical_rites",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10000
  			},
  			{
  				type: "tech",
  				id: "education",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "necromancy",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 8000
  			},
  			{
  				type: "enemy",
  				id: "necromancer_crypt",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "food_conservation",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10000
  			},
  			{
  				type: "tech",
  				id: "education",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "plate_armor",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 4000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 500
  			},
  			{
  				type: "tech",
  				id: "steeling",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "army",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "siege_defense_weapons",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10000
  			},
  			{
  				type: "building",
  				id: "wall",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "architecture",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "metal_casting",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 11500
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 1000
  			},
  			{
  				type: "tech",
  				id: "feudalism",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "establish_boundaries",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 12000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 10000
  			},
  			{
  				type: "tech",
  				id: "architecture",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 3,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "herald_canava",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 6000
  			},
  			{
  				type: "tech",
  				id: "establish_boundaries",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "moonlight_night",
  		confirm: true,
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 12000
  			},
  			{
  				type: "building",
  				id: "watchman_outpost",
  				value: 4
  			}
  		]
  	},
  	{
  		id: "daylong_celebration",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 2000
  			},
  			{
  				type: "tech",
  				id: "moonlight_night",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 100,
  				fix: true
  			}
  		]
  	},
  	{
  		id: "banking",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 12000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 8000
  			},
  			{
  				type: "tech",
  				id: "education",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "steeling",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 12000
  			},
  			{
  				type: "resource",
  				id: "copper",
  				value: 1500
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 1000
  			},
  			{
  				type: "tech",
  				id: "metal_casting",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "guild",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 15000
  			},
  			{
  				type: "tech",
  				id: "education",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 40,
  				fix: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "artisan",
  				type_gen: "resource",
  				gen: "tools",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "merchant",
  				type_gen: "resource",
  				gen: "gold",
  				value: 5,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "craftsmen_guild",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 17500
  			},
  			{
  				type: "tech",
  				id: "guild",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "guild_craftsmen",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "religious_orders",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 17500
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 2000
  			},
  			{
  				type: "tech",
  				id: "guild",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "mana_conveyors",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 2000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 1000
  			},
  			{
  				type: "tech",
  				id: "religious_orders",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "master_craftsmen",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 12000
  			},
  			{
  				type: "building",
  				id: "artisan_workshop",
  				value: 15
  			},
  			{
  				type: "building",
  				id: "grocery",
  				value: 3
  			},
  			{
  				type: "building",
  				id: "carpenter_workshop",
  				value: 3
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 40,
  				fix: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "artisan",
  				type_gen: "resource",
  				gen: "tools",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "supplier",
  				type_gen: "resource",
  				gen: "supplies",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "carpenter",
  				type_gen: "resource",
  				gen: "building_material",
  				value: 5,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "drilling_operation",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 11500
  			},
  			{
  				type: "resource",
  				id: "tools",
  				value: 1500
  			},
  			{
  				type: "building",
  				id: "mine",
  				value: 15
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 30,
  				fix: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "miner",
  				type_gen: "resource",
  				gen: "copper",
  				value: 5,
  				perc: true
  			},
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "miner",
  				type_gen: "resource",
  				gen: "iron",
  				value: 5,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "professional_soldier",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 13000
  			},
  			{
  				type: "tech",
  				id: "plate_armor",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "knighthood",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 13000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 5000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 600
  			},
  			{
  				type: "tech",
  				id: "steeling",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "army",
  				value: 4
  			}
  		]
  	},
  	{
  		id: "fairs_and_markets",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 15000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 5000
  			},
  			{
  				type: "tech",
  				id: "guild",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "banking",
  				value: 1
  			},
  			{
  				type: "building",
  				id: "marketplace",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "network_of_watchmen",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 15000
  			},
  			{
  				type: "building",
  				id: "wall",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "cap",
  				id: "army",
  				value: 5
  			}
  		]
  	},
  	{
  		id: "large_storage_space",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 15000
  			},
  			{
  				type: "tech",
  				id: "food_conservation",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "glorious_retirement",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 10000
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 100
  			},
  			{
  				type: "tech",
  				id: "banking",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "knighthood",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "moonlight_night",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "library_of_souls",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 18000
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 6000
  			},
  			{
  				type: "enemy",
  				id: "worn_down_crypt",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "end_feudal_era",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 17000
  			},
  			{
  				type: "building",
  				id: "mansion",
  				value: 3
  			},
  			{
  				type: "building",
  				id: "carpenter_workshop",
  				value: 3
  			},
  			{
  				type: "building",
  				id: "steelworks",
  				value: 3
  			},
  			{
  				type: "building",
  				id: "university",
  				value: 3
  			},
  			{
  				type: "building",
  				id: "grocery",
  				value: 3
  			},
  			{
  				type: "tech",
  				id: "fairs_and_markets",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "knighthood",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "moonlight_night",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "astronomy",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 27000
  			},
  			{
  				type: "building",
  				id: "academy_of_freethinkers",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "scientific_theory",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 28000
  			},
  			{
  				type: "building",
  				id: "academy_of_freethinkers",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 40,
  				fix: true
  			}
  		]
  	},
  	{
  		id: "chemistry",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 28000
  			},
  			{
  				type: "tech",
  				id: "scientific_theory",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "manufactures",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 29000
  			},
  			{
  				type: "tech",
  				id: "chemistry",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "printing_press",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 30000
  			},
  			{
  				type: "tech",
  				id: "scientific_theory",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "research",
  				value: 3,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 3,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "monster_hunting",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 30000
  			},
  			{
  				type: "tech",
  				id: "printing_press",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "monster_epuration",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 30000
  			},
  			{
  				type: "enemy",
  				id: "hydra_pit",
  				value: 1
  			},
  			{
  				type: "enemy",
  				id: "gorgon_cave",
  				value: 1
  			},
  			{
  				type: "enemy",
  				id: "gloomy_werewolf_forest",
  				value: 1
  			},
  			{
  				type: "enemy",
  				id: "minotaur_maze",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "fertilizer",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 30000
  			},
  			{
  				type: "tech",
  				id: "chemistry",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "farmer",
  				type_gen: "resource",
  				gen: "food",
  				value: 5,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "alchemical_reactions",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 31000
  			},
  			{
  				type: "tech",
  				id: "fertilizer",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "gunpowder",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 32000
  			},
  			{
  				type: "tech",
  				id: "chemistry",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 40,
  				fix: true
  			}
  		]
  	},
  	{
  		id: "the_scourge",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 30000
  			},
  			{
  				type: "tech",
  				id: "gunpowder",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "storing_valuable_materials",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 32000
  			},
  			{
  				type: "tech",
  				id: "fertilizer",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "large_storage_space",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "military_science",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 33000
  			},
  			{
  				type: "tech",
  				id: "gunpowder",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "dragon_assault",
  		confirm: true,
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 34000
  			},
  			{
  				type: "prayer",
  				id: "dragon_skull",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "glorious_parade",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 4000
  			},
  			{
  				type: "tech",
  				id: "dragon_assault",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 200,
  				fix: true
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 4
  			}
  		]
  	},
  	{
  		id: "the_vault",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 33000
  			},
  			{
  				type: "building",
  				id: "bank",
  				value: 8
  			}
  		]
  	},
  	{
  		id: "cuirassiers",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 35000
  			},
  			{
  				type: "tech",
  				id: "military_science",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "northern_star",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 35000
  			},
  			{
  				type: "diplomacy_owned",
  				id: "nightdale_protectorate",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "flame_atamar",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 35000
  			},
  			{
  				type: "diplomacy_owned",
  				id: "zultan_emirate",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "trail_power",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 45000
  			},
  			{
  				type: "diplomacy_owned",
  				id: "western_kingdom",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "exhibit_flame",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 45000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 7000
  			},
  			{
  				type: "tech",
  				id: "flame_atamar",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 10
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 5
  			},
  			{
  				type: "tech",
  				id: "infuse_flame",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "infuse_flame",
  		req: [
  			{
  				type: "resource",
  				id: "copper",
  				value: 15000
  			},
  			{
  				type: "resource",
  				id: "iron",
  				value: 15000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 7000
  			},
  			{
  				type: "tech",
  				id: "flame_atamar",
  				value: 1
  			}
  		],
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
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 15
  			},
  			{
  				type: "tech",
  				id: "exhibit_flame",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "persuade_nobility",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 150000
  			},
  			{
  				type: "tech",
  				id: "trail_power",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 100,
  				fix: true
  			},
  			{
  				type: "tech",
  				id: "persuade_people",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "persuade_people",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 50000
  			},
  			{
  				type: "tech",
  				id: "trail_power",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "tech",
  				id: "persuade_nobility",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "loved_people",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 10000
  			},
  			{
  				type: "enemy",
  				id: "eternal_halls",
  				value: 1
  			}
  		],
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
  				value: 12
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 6
  			}
  		]
  	},
  	{
  		id: "economics",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 35000
  			},
  			{
  				type: "tech",
  				id: "printing_press",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 40,
  				fix: true
  			}
  		]
  	},
  	{
  		id: "ministry_interior_t",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 35000
  			},
  			{
  				type: "tech",
  				id: "economics",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "ministry_interior_l",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "ministry_war_t",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 35000
  			},
  			{
  				type: "tech",
  				id: "economics",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "ministry_war_l",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "ministry_worship_t",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 35000
  			},
  			{
  				type: "tech",
  				id: "economics",
  				value: 1
  			},
  			{
  				type: "legacy",
  				id: "ministry_worship_l",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "order_of_clerics",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 37000
  			},
  			{
  				type: "resource",
  				id: "faith",
  				value: 2500
  			},
  			{
  				type: "tech",
  				id: "printing_press",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "magic_arts_teaching",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 39000
  			},
  			{
  				type: "tech",
  				id: "order_of_clerics",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "mana_utilization",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 50000
  			},
  			{
  				type: "tech",
  				id: "magic_arts_teaching",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "dragon_assault",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "large_defensive_project",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 35000
  			},
  			{
  				type: "building",
  				id: "military_academy",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "commercial_monopolies",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 70000
  			},
  			{
  				type: "cap",
  				id: "gold",
  				value: 70000
  			}
  		]
  	},
  	{
  		id: "gold_domination_project",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 100000
  			},
  			{
  				type: "building",
  				id: "stock_exchange",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "exterminate_competition",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 150000
  			},
  			{
  				type: "cap",
  				id: "gold",
  				value: 150000
  			},
  			{
  				type: "prayer",
  				id: "gold_consecration",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 10
  			}
  		]
  	},
  	{
  		id: "theresmore_richest_nation",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 200000
  			},
  			{
  				type: "cap",
  				id: "gold",
  				value: 200000
  			},
  			{
  				type: "tech",
  				id: "exterminate_competition",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "coin",
  				value: 1,
  				fix: true
  			}
  		]
  	},
  	{
  		id: "poisoned_arrows",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 1000
  			},
  			{
  				type: "enemy",
  				id: "goblin_lair",
  				value: 1
  			}
  		],
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
  		id: "construction_of_automata",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 8000
  			},
  			{
  				type: "prayer",
  				id: "study_undead_creatures",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "safe_roads",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 9000
  			},
  			{
  				type: "enemy",
  				id: "bandit_camp",
  				value: 1
  			},
  			{
  				type: "enemy",
  				id: "deserters_den",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "agreement_passage_wanders",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 15000
  			},
  			{
  				type: "diplomacy_alliance",
  				id: "theresmore_wanders",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "scout_mission_east",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 15000
  			},
  			{
  				type: "diplomacy_owned",
  				id: "theresmore_wanders",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "large_pastures",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 9000
  			},
  			{
  				type: "tech",
  				id: "agreement_passage_wanders",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "breeder",
  				type_gen: "resource",
  				gen: "horse",
  				value: 5,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "great_pastures",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 9000
  			},
  			{
  				type: "tech",
  				id: "scout_mission_east",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "modifier",
  				type_id: "population",
  				id: "breeder",
  				type_gen: "resource",
  				gen: "horse",
  				value: 10,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "pentagram_tome",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 5000
  			},
  			{
  				type: "enemy",
  				id: "strange_village",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "underground_kobold_mission",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 7000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 10000
  			},
  			{
  				type: "enemy",
  				id: "kobold_underground_tunnels",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "kobold_nation",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 15000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 15000
  			},
  			{
  				type: "enemy",
  				id: "kobold_city",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "portal_of_the_dead",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 40000
  			},
  			{
  				type: "building",
  				id: "mine",
  				value: 15
  			},
  			{
  				type: "building",
  				id: "pillars_of_mana",
  				value: 5
  			}
  		]
  	},
  	{
  		id: "trail_blood",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 50000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 10000
  			},
  			{
  				type: "enemy",
  				id: "vampire_crypt",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "mana_engine",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 56000
  			},
  			{
  				type: "building",
  				id: "mana_pit",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "long_expedition",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 56000
  			},
  			{
  				type: "tech",
  				id: "mana_engine",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "shores_theresmore",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 57000
  			},
  			{
  				type: "tech",
  				id: "long_expedition",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "mechanization",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 57000
  			},
  			{
  				type: "tech",
  				id: "mana_engine",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "storage_district",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 57000
  			},
  			{
  				type: "tech",
  				id: "mechanization",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "natronite_storage",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 59000
  			},
  			{
  				type: "tech",
  				id: "mechanization",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "research_district",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 59000
  			},
  			{
  				type: "tech",
  				id: "mechanization",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "harbor_project",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 60000
  			},
  			{
  				type: "tech",
  				id: "shores_theresmore",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "financial_markets",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 62000
  			},
  			{
  				type: "tech",
  				id: "research_district",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "natrocity",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 66000
  			},
  			{
  				type: "tech",
  				id: "financial_markets",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "biology",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 69000
  			},
  			{
  				type: "tech",
  				id: "research_district",
  				value: 1
  			}
  		],
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
  				value: 4
  			},
  			{
  				type: "population",
  				id: "unemployed",
  				value: 4
  			}
  		]
  	},
  	{
  		id: "ecology",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 73000
  			},
  			{
  				type: "tech",
  				id: "research_district",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "flight",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 76000
  			},
  			{
  				type: "tech",
  				id: "natrocity",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "flintlock_musket",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 79000
  			},
  			{
  				type: "tech",
  				id: "mechanization",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "military_tactics",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 82000
  			},
  			{
  				type: "tech",
  				id: "flintlock_musket",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "land_mine",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 85000
  			},
  			{
  				type: "tech",
  				id: "military_tactics",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "field_artillery",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 85000
  			},
  			{
  				type: "tech",
  				id: "military_tactics",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "veteran_artillerymen",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 85000
  			},
  			{
  				type: "tech",
  				id: "field_artillery",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "communion_nature",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 90000
  			},
  			{
  				type: "tech",
  				id: "ecology",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "lonely_druid",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 13000
  			},
  			{
  				type: "tech",
  				id: "communion_nature",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "rage_druid",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 95000
  			},
  			{
  				type: "prayer",
  				id: "banish_druid",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "miracle_city",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 98000
  			},
  			{
  				type: "prayer",
  				id: "prayer_lonely_druid",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "preparation_war",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 98000
  			},
  			{
  				type: "prayer",
  				id: "city_blessing",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "mysterious_robbery",
  		confirm: true,
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 108000
  			},
  			{
  				type: "tech",
  				id: "miracle_city",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "fallen_angel",
  		confirm: true,
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 108000
  			},
  			{
  				type: "tech",
  				id: "preparation_war",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "joyful_nation_1",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 8000
  			},
  			{
  				type: "tech",
  				id: "mysterious_robbery",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 300,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "joyful_nation_2",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 8000
  			},
  			{
  				type: "tech",
  				id: "fallen_angel",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 300,
  				fix: true
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "end_era_4_1",
  		req: [
  			{
  				type: "tech",
  				id: "joyful_nation_1",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "tech",
  				id: "end_4",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "end_era_4_2",
  		req: [
  			{
  				type: "tech",
  				id: "joyful_nation_2",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "tech",
  				id: "end_4",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "seafaring",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 115000
  			},
  			{
  				type: "building",
  				id: "harbor_district",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "end_4",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "outpost_tiny_island",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 115000
  			},
  			{
  				type: "enemy",
  				id: "far_west_island",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "the_journey",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 121000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 190000
  			},
  			{
  				type: "resource",
  				id: "food",
  				value: 14000
  			},
  			{
  				type: "resource",
  				id: "supplies",
  				value: 14000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 12000
  			},
  			{
  				type: "building",
  				id: "island_outpost",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "beacon_faith",
  		req: [
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "tech",
  				id: "military_colony",
  				value: -1
  			},
  			{
  				type: "tech",
  				id: "productive_hub",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "military_colony",
  		req: [
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "tech",
  				id: "beacon_faith",
  				value: -1
  			},
  			{
  				type: "tech",
  				id: "productive_hub",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "productive_hub",
  		req: [
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "tech",
  				id: "beacon_faith",
  				value: -1
  			},
  			{
  				type: "tech",
  				id: "military_colony",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "colonial_docks",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 120000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "productive_hub",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "overseas_refinery",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 121000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "productive_hub",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "centralized_power",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 125000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 50000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 2
  			},
  			{
  				type: "tech",
  				id: "seafaring",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "colonial_trade",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 126000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 5
  			},
  			{
  				type: "tech",
  				id: "productive_hub",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "new_world_militia",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 130000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 10
  			},
  			{
  				type: "tech",
  				id: "productive_hub",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "landed_estates",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 132000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 10
  			},
  			{
  				type: "tech",
  				id: "productive_hub",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "mass_transit",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 135000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 10000
  			},
  			{
  				type: "tech",
  				id: "centralized_power",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "port_statue",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 140000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 15
  			},
  			{
  				type: "tech",
  				id: "productive_hub",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "colonial_camp",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 120000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "military_colony",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "guerrilla_warfare",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 121000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "military_colony",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "colonial_stronghold",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 126000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 5
  			},
  			{
  				type: "tech",
  				id: "military_colony",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "colonial_recruits",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 132000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 10
  			},
  			{
  				type: "tech",
  				id: "military_colony",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "dimensional_device",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 134000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 10
  			},
  			{
  				type: "tech",
  				id: "military_colony",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "fortified_colony",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 140000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 15
  			},
  			{
  				type: "tech",
  				id: "military_colony",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "steel_flesh",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 142000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 15
  			},
  			{
  				type: "tech",
  				id: "military_colony",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "faith_world",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 120000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 1
  			},
  			{
  				type: "tech",
  				id: "beacon_faith",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "new_old_gods",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 126000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 5
  			},
  			{
  				type: "tech",
  				id: "beacon_faith",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "mana_investigation",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 132000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 10
  			},
  			{
  				type: "tech",
  				id: "beacon_faith",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "colonial_consacration",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 140000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 15
  			},
  			{
  				type: "tech",
  				id: "beacon_faith",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "railroad",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 145000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 18000
  			},
  			{
  				type: "tech",
  				id: "mass_transit",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "strange_encounter",
  		req: [
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 4
  			},
  			{
  				type: "tech",
  				id: "seafaring",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "colonial_exploitations",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 125000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 3
  			}
  		]
  	},
  	{
  		id: "artisan_complex",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 126000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 3
  			},
  			{
  				type: "tech",
  				id: "colonial_exploitations",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "large_shed_t",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 128000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 5
  			},
  			{
  				type: "tech",
  				id: "artisan_complex",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "trenches",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 128000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 5
  			},
  			{
  				type: "tech",
  				id: "artisan_complex",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "new_world_exploration",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 80000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 6
  			},
  			{
  				type: "tech",
  				id: "seafaring",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "aid_request",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 132000
  			},
  			{
  				type: "resource",
  				id: "crystal",
  				value: 10000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 10000
  			},
  			{
  				type: "tech",
  				id: "strange_encounter",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "elf_survivors",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 135000
  			},
  			{
  				type: "enemy",
  				id: "ettin_camp",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "elf_warriors",
  		req: [
  			{
  				type: "resource",
  				id: "crystal",
  				value: 14500
  			},
  			{
  				type: "building",
  				id: "elf_encampment",
  				value: 5
  			}
  		]
  	},
  	{
  		id: "temple_luna",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 150000
  			},
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 8
  			}
  		]
  	},
  	{
  		id: "elf_last_village",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 155000
  			},
  			{
  				type: "enemy",
  				id: "desecrated_temple",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "atomic_theory",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 155000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 18000
  			},
  			{
  				type: "tech",
  				id: "elf_survivors",
  				value: 1
  			},
  			{
  				type: "building",
  				id: "ministry_development",
  				value: 3
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 100,
  				fix: true
  			}
  		]
  	},
  	{
  		id: "mana_reactors",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 160000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 15000
  			},
  			{
  				type: "resource",
  				id: "natronite",
  				value: 15000
  			},
  			{
  				type: "tech",
  				id: "atomic_theory",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "assembly_line",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 165000
  			},
  			{
  				type: "resource",
  				id: "steel",
  				value: 20000
  			},
  			{
  				type: "building",
  				id: "ministry_development",
  				value: 6
  			}
  		]
  	},
  	{
  		id: "replicable_parts",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 170000
  			},
  			{
  				type: "tech",
  				id: "assembly_line",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "metal_alloys",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 180000
  			},
  			{
  				type: "tech",
  				id: "replicable_parts",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "burned_farms",
  		req: [
  			{
  				type: "building",
  				id: "colony_hall",
  				value: 12
  			}
  		]
  	},
  	{
  		id: "orcish_threat",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 190000
  			},
  			{
  				type: "resource",
  				id: "gold",
  				value: 120000
  			},
  			{
  				type: "enemy",
  				id: "orcish_prison_camp",
  				value: 1
  			}
  		],
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
  		id: "orcish_citadel",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 190000
  			},
  			{
  				type: "enemy",
  				id: "orc_raiding_party",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "mankind_darkest",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 200000
  			},
  			{
  				type: "enemy",
  				id: "orc_gormiak_citadel",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "war_effort",
  		req: [
  			{
  				type: "resource",
  				id: "faith",
  				value: 18000
  			},
  			{
  				type: "tech",
  				id: "mankind_darkest",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 6,
  				perc: true
  			},
  			{
  				type: "resource",
  				id: "research",
  				value: 6,
  				perc: true
  			}
  		]
  	},
  	{
  		id: "honor_humanity",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 200000
  			},
  			{
  				type: "enemy",
  				id: "orc_ogsog_citadel",
  				value: 1
  			}
  		],
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
  	},
  	{
  		id: "swear_give_up",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 200000
  			},
  			{
  				type: "enemy",
  				id: "orc_turgon_citadel",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 150,
  				fix: true
  			},
  			{
  				type: "cap",
  				id: "army",
  				value: 50
  			}
  		]
  	},
  	{
  		id: "path_children",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 200000
  			},
  			{
  				type: "enemy",
  				id: "orc_horith_citadel",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "orc_horde",
  		confirm: true,
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 210000
  			},
  			{
  				type: "enemy",
  				id: "orc_horith_citadel",
  				value: 1
  			},
  			{
  				type: "enemy",
  				id: "orc_ogsog_citadel",
  				value: 1
  			},
  			{
  				type: "enemy",
  				id: "orc_turgon_citadel",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "the_triumph",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 25000
  			},
  			{
  				type: "tech",
  				id: "orc_horde",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "fame",
  				value: 450,
  				fix: true
  			}
  		]
  	},
  	{
  		id: "titan_mosaic",
  		req: [
  			{
  				type: "resource",
  				id: "research",
  				value: 215000
  			},
  			{
  				type: "resource",
  				id: "mana",
  				value: 12000
  			},
  			{
  				type: "enemy",
  				id: "giant_temple",
  				value: 1
  			}
  		]
  	},
  	{
  		id: "titan_gift_t",
  		req: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 240000
  			},
  			{
  				type: "enemy",
  				id: "sleeping_titan",
  				value: 1
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "titan_gift",
  				value: 1,
  				fix: true
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
  		order: 0,
  		category: 0
  	},
  	{
  		id: "scout",
  		type: "recon",
  		attack: 2,
  		defense: 2,
  		order: 3,
  		category: 0,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.1
  			}
  		]
  	},
  	{
  		id: "explorer",
  		type: "recon",
  		attack: 5,
  		defense: 5,
  		order: 3,
  		category: 0,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.2
  			}
  		]
  	},
  	{
  		id: "spy",
  		type: "spy",
  		attack: 7,
  		defense: 3,
  		order: 3,
  		category: 0,
  		req: [
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
  		reqAttack: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 100
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.1
  			}
  		]
  	},
  	{
  		id: "archer",
  		type: "army",
  		attack: 3,
  		defense: 2,
  		order: 3,
  		category: 1,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.2
  			}
  		]
  	},
  	{
  		id: "battering_ram",
  		type: "army",
  		attack: 14,
  		defense: 2,
  		order: 3,
  		category: 1,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -4
  			}
  		]
  	},
  	{
  		id: "crossbowman",
  		type: "army",
  		attack: 11,
  		defense: 6,
  		order: 3,
  		category: 1,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.5
  			}
  		]
  	},
  	{
  		id: "trebuchet",
  		type: "army",
  		attack: 28,
  		defense: 3,
  		order: 3,
  		category: 1,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -5
  			}
  		]
  	},
  	{
  		id: "white_company",
  		type: "army",
  		attack: 18,
  		defense: 11,
  		order: 3,
  		category: 1,
  		req: [
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
  		reqAttack: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 75
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -5
  			}
  		]
  	},
  	{
  		id: "strategist",
  		type: "army",
  		attack: 72,
  		defense: 12,
  		order: 3,
  		cap: 1,
  		category: 1,
  		req: [
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
  		reqAttack: [
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
  		gen: [
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
  		]
  	},
  	{
  		id: "arquebusier",
  		type: "army",
  		attack: 16,
  		defense: 7,
  		order: 3,
  		category: 1,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.9
  			}
  		]
  	},
  	{
  		id: "bombard",
  		type: "army",
  		attack: 42,
  		defense: 4,
  		order: 3,
  		category: 1,
  		req: [
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
  		reqAttack: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 200
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -7
  			}
  		]
  	},
  	{
  		id: "cannon",
  		type: "army",
  		attack: 88,
  		defense: 8,
  		order: 3,
  		category: 1,
  		req: [
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
  		reqAttack: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 500
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -15
  			}
  		]
  	},
  	{
  		id: "artillery",
  		type: "army",
  		attack: 160,
  		defense: 15,
  		order: 3,
  		category: 1,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -25
  			}
  		]
  	},
  	{
  		id: "ranger",
  		type: "army",
  		attack: 22,
  		defense: 15,
  		order: 3,
  		cap: 50,
  		category: 1,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: 1.2
  			}
  		]
  	},
  	{
  		id: "elf_warrior",
  		type: "army",
  		attack: 62,
  		defense: 55,
  		order: 3,
  		cap: 25,
  		category: 1,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -2.5
  			}
  		]
  	},
  	{
  		id: "marksman",
  		type: "army",
  		attack: 35,
  		defense: 15,
  		order: 3,
  		category: 1,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -1.5
  			}
  		]
  	},
  	{
  		id: "spearman",
  		type: "army",
  		attack: 2,
  		defense: 7,
  		order: 1,
  		category: 3,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.2
  			}
  		]
  	},
  	{
  		id: "warrior_monk",
  		type: "army",
  		attack: 3,
  		defense: 13,
  		order: 1,
  		category: 3,
  		req: [
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
  		reqAttack: [
  			{
  				type: "resource",
  				id: "food",
  				value: 10
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.4
  			}
  		]
  	},
  	{
  		id: "shieldbearer",
  		type: "army",
  		attack: 5,
  		defense: 23,
  		order: 1,
  		category: 3,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.4
  			}
  		]
  	},
  	{
  		id: "priest",
  		type: "army",
  		attack: 1,
  		defense: 36,
  		order: 2,
  		category: 3,
  		req: [
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
  		reqAttack: [
  			{
  				type: "resource",
  				id: "food",
  				value: 80
  			}
  		],
  		gen: [
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
  		]
  	},
  	{
  		id: "sacred_golem",
  		type: "army",
  		attack: 8,
  		defense: 22,
  		order: 1,
  		category: 3,
  		req: [
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
  		reqAttack: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 100
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "cleric",
  		type: "army",
  		attack: 8,
  		defense: 24,
  		order: 2,
  		category: 3,
  		req: [
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
  		reqAttack: [
  			{
  				type: "resource",
  				id: "food",
  				value: 60
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "juggernaut",
  		type: "army",
  		attack: 15,
  		defense: 50,
  		order: 1,
  		category: 3,
  		req: [
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
  		reqAttack: [
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
  		gen: [
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
  		]
  	},
  	{
  		id: "paladin",
  		type: "army",
  		attack: 28,
  		defense: 56,
  		order: 1,
  		category: 3,
  		req: [
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
  		reqAttack: [
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
  		gen: [
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
  		]
  	},
  	{
  		id: "behemoth",
  		type: "army",
  		attack: 24,
  		defense: 98,
  		order: 1,
  		cap: 20,
  		category: 3,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -3
  			}
  		]
  	},
  	{
  		id: "ancient_balor",
  		type: "army",
  		attack: 150,
  		defense: 750,
  		order: 1,
  		cap: 1,
  		category: 3,
  		req: [
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
  		reqAttack: [
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
  		gen: [
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
  		]
  	},
  	{
  		id: "warrior",
  		type: "army",
  		attack: 8,
  		defense: 8,
  		order: 2,
  		category: 2,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.4
  			}
  		]
  	},
  	{
  		id: "mercenary_veteran",
  		type: "army",
  		attack: 12,
  		defense: 8,
  		order: 1,
  		category: 2,
  		req: [
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
  		reqAttack: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 150
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -5
  			}
  		]
  	},
  	{
  		id: "heavy_warrior",
  		type: "army",
  		attack: 12,
  		defense: 12,
  		order: 2,
  		category: 2,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.6
  			}
  		]
  	},
  	{
  		id: "canava_guard",
  		type: "army",
  		attack: 15,
  		defense: 15,
  		order: 2,
  		category: 2,
  		req: [
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
  		reqAttack: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 50
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: -5
  			}
  		]
  	},
  	{
  		id: "man_at_arms",
  		type: "army",
  		attack: 18,
  		defense: 14,
  		order: 2,
  		category: 2,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.8
  			}
  		]
  	},
  	{
  		id: "line_infantry",
  		type: "army",
  		attack: 34,
  		defense: 22,
  		order: 2,
  		category: 2,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -1.4
  			}
  		]
  	},
  	{
  		id: "jager",
  		type: "army",
  		attack: 82,
  		defense: 18,
  		order: 2,
  		cap: 100,
  		category: 2,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -1.2
  			}
  		]
  	},
  	{
  		id: "colonial_militia",
  		type: "army",
  		attack: 7,
  		defense: 8,
  		order: 1,
  		category: 2,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.1
  			}
  		]
  	},
  	{
  		id: "battle_angel",
  		type: "army",
  		attack: 38,
  		defense: 36,
  		order: 2,
  		category: 2,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -1
  			}
  		]
  	},
  	{
  		id: "commander",
  		type: "army",
  		attack: 30,
  		defense: 26,
  		order: 3,
  		cap: 1,
  		category: 2,
  		req: [
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
  		reqAttack: [
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
  		gen: [
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
  		]
  	},
  	{
  		id: "tamed_djinn",
  		type: "army",
  		attack: 40,
  		defense: 40,
  		order: 2,
  		cap: 1,
  		category: 2,
  		req: [
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
  		reqAttack: [
  			{
  				type: "resource",
  				id: "mana",
  				value: 100
  			}
  		],
  		gen: [
  			{
  				type: "resource",
  				id: "mana",
  				value: -5
  			}
  		]
  	},
  	{
  		id: "general",
  		type: "army",
  		attack: 60,
  		defense: 100,
  		order: 3,
  		cap: 1,
  		category: 2,
  		req: [
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
  		reqAttack: [
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
  		gen: [
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
  		]
  	},
  	{
  		id: "seraphim",
  		type: "army",
  		attack: 450,
  		defense: 400,
  		order: 2,
  		cap: 1,
  		category: 2,
  		req: [
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
  		reqAttack: [
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
  		gen: [
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
  		]
  	},
  	{
  		id: "light_cavarly",
  		type: "army",
  		attack: 10,
  		defense: 4,
  		order: 2,
  		category: 4,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -0.5
  			}
  		]
  	},
  	{
  		id: "knight",
  		type: "army",
  		attack: 26,
  		defense: 22,
  		order: 2,
  		category: 4,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -1.2
  			}
  		]
  	},
  	{
  		id: "cataphract",
  		type: "army",
  		attack: 18,
  		defense: 48,
  		order: 2,
  		category: 4,
  		req: [
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
  		reqAttack: [
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
  		gen: [
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
  		]
  	},
  	{
  		id: "cuirassier",
  		type: "army",
  		attack: 36,
  		defense: 28,
  		order: 2,
  		category: 4,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "food",
  				value: -2
  			}
  		]
  	},
  	{
  		id: "cpt_galliard",
  		type: "army",
  		attack: 80,
  		defense: 65,
  		order: 2,
  		cap: 1,
  		category: 4,
  		req: [
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
  		reqAttack: [
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
  		gen: [
  			{
  				type: "resource",
  				id: "gold",
  				value: 30
  			}
  		]
  	},
  	{
  		id: "ancient_giant",
  		type: "enemy",
  		attack: 250,
  		defense: 16000,
  		order: 3,
  		cap: 1,
  		category: 3
  	},
  	{
  		id: "archdemon",
  		type: "enemy",
  		attack: 90,
  		defense: 52,
  		order: 3,
  		category: 2
  	},
  	{
  		id: "archlich",
  		type: "enemy",
  		attack: 120,
  		defense: 90,
  		order: 3,
  		cap: 1,
  		category: 1
  	},
  	{
  		id: "aqrabuamelu",
  		type: "enemy",
  		attack: 46,
  		defense: 63,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "balor",
  		type: "enemy",
  		attack: 195,
  		defense: 150,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "bugbear",
  		type: "enemy",
  		attack: 7,
  		defense: 16,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "bugbear_chieftain",
  		type: "enemy",
  		attack: 44,
  		defense: 32,
  		order: 2,
  		cap: 1,
  		category: 2
  	},
  	{
  		id: "bulette",
  		type: "enemy",
  		attack: 140,
  		defense: 110,
  		order: 1,
  		category: 4
  	},
  	{
  		id: "basilisk",
  		type: "enemy",
  		attack: 35,
  		defense: 16,
  		order: 1,
  		category: 1
  	},
  	{
  		id: "black_mage",
  		type: "enemy",
  		attack: 52,
  		defense: 22,
  		order: 3,
  		cap: 1,
  		category: 1
  	},
  	{
  		id: "cavarly_archer",
  		type: "enemy",
  		attack: 18,
  		defense: 10,
  		order: 3,
  		category: 4
  	},
  	{
  		id: "charmed_dweller",
  		type: "enemy",
  		attack: 4,
  		defense: 4,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "cyclop",
  		type: "enemy",
  		attack: 25,
  		defense: 76,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "cult_master",
  		type: "enemy",
  		attack: 80,
  		defense: 55,
  		order: 3,
  		cap: 1,
  		category: 1
  	},
  	{
  		id: "daimyo",
  		type: "enemy",
  		attack: 90,
  		defense: 90,
  		order: 3,
  		cap: 1,
  		category: 1
  	},
  	{
  		id: "demoness",
  		type: "enemy",
  		attack: 50,
  		defense: 80,
  		order: 3,
  		cap: 1,
  		category: 1
  	},
  	{
  		id: "demonic_musketeer",
  		type: "enemy",
  		attack: 20,
  		defense: 20,
  		order: 2,
  		category: 2
  	},
  	{
  		id: "dirty_rat",
  		type: "enemy",
  		attack: 1,
  		defense: 1,
  		order: 1,
  		category: 4
  	},
  	{
  		id: "draconic_warrior",
  		type: "enemy",
  		attack: 8,
  		defense: 14,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "draconic_diver",
  		type: "enemy",
  		attack: 20,
  		defense: 10,
  		order: 2,
  		category: 4
  	},
  	{
  		id: "draconic_mage",
  		type: "enemy",
  		attack: 32,
  		defense: 10,
  		order: 3,
  		category: 1
  	},
  	{
  		id: "draconic_leader",
  		type: "enemy",
  		attack: 80,
  		defense: 65,
  		order: 3,
  		category: 1
  	},
  	{
  		id: "eternal_guardian",
  		type: "enemy",
  		attack: 22,
  		defense: 84,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "ettin",
  		type: "enemy",
  		attack: 39,
  		defense: 67,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "fallen_angel",
  		type: "enemy",
  		attack: 150,
  		defense: 100,
  		order: 3,
  		cap: 1,
  		category: 2
  	},
  	{
  		id: "frost_elemental",
  		type: "enemy",
  		attack: 20,
  		defense: 42,
  		order: 1,
  		category: 1
  	},
  	{
  		id: "frost_giant",
  		type: "enemy",
  		attack: 112,
  		defense: 140,
  		order: 2,
  		cap: 1,
  		category: 3
  	},
  	{
  		id: "fire_elemental",
  		type: "enemy",
  		attack: 28,
  		defense: 28,
  		order: 1,
  		category: 1
  	},
  	{
  		id: "gargoyle",
  		type: "enemy",
  		attack: 8,
  		defense: 28,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "golem",
  		type: "enemy",
  		attack: 11,
  		defense: 42,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "gulud",
  		type: "enemy",
  		attack: 250,
  		defense: 180,
  		order: 3,
  		cap: 1,
  		category: 1
  	},
  	{
  		id: "korrigan_slinger",
  		type: "enemy",
  		attack: 3,
  		defense: 2,
  		order: 2,
  		category: 1
  	},
  	{
  		id: "korrigan_swindler",
  		type: "enemy",
  		attack: 3,
  		defense: 5,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "earth_elemental",
  		type: "enemy",
  		attack: 20,
  		defense: 48,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "harpy",
  		type: "enemy",
  		attack: 6,
  		defense: 6,
  		order: 1,
  		category: 4
  	},
  	{
  		id: "hobgoblin_archer",
  		type: "enemy",
  		attack: 11,
  		defense: 4,
  		order: 3,
  		category: 1
  	},
  	{
  		id: "hobgoblin_chieftain",
  		type: "enemy",
  		attack: 20,
  		defense: 34,
  		order: 2,
  		cap: 1,
  		category: 2
  	},
  	{
  		id: "hobgoblin_grunt",
  		type: "enemy",
  		attack: 6,
  		defense: 12,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "hydra",
  		type: "enemy",
  		attack: 950,
  		defense: 900,
  		order: 1,
  		cap: 1,
  		category: 4
  	},
  	{
  		id: "gorgon",
  		type: "enemy",
  		attack: 950,
  		defense: 600,
  		order: 1,
  		cap: 1,
  		category: 2
  	},
  	{
  		id: "lead_golem",
  		type: "enemy",
  		attack: 22,
  		defense: 72,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "bandit",
  		type: "enemy",
  		attack: 3,
  		defense: 4,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "barbarian_warrior",
  		type: "enemy",
  		attack: 13,
  		defense: 6,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "barbarian_chosen",
  		type: "enemy",
  		attack: 30,
  		defense: 12,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "barbarian_drummer",
  		type: "enemy",
  		attack: 6,
  		defense: 18,
  		order: 2,
  		category: 3
  	},
  	{
  		id: "barbarian_leader",
  		type: "enemy",
  		attack: 48,
  		defense: 22,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "barbarian_king",
  		type: "enemy",
  		attack: 76,
  		defense: 56,
  		order: 3,
  		cap: 1,
  		category: 2
  	},
  	{
  		id: "djinn",
  		type: "enemy",
  		attack: 46,
  		defense: 36,
  		order: 2,
  		cap: 1,
  		category: 1
  	},
  	{
  		id: "fire_salamander",
  		type: "enemy",
  		attack: 32,
  		defense: 20,
  		order: 1,
  		category: 4
  	},
  	{
  		id: "galliard",
  		type: "enemy",
  		attack: 70,
  		defense: 120,
  		order: 2,
  		cap: 1,
  		category: 2
  	},
  	{
  		id: "ghast",
  		type: "enemy",
  		attack: 6,
  		defense: 8,
  		order: 2,
  		category: 4
  	},
  	{
  		id: "ghoul",
  		type: "enemy",
  		attack: 4,
  		defense: 5,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "giant_wasp",
  		type: "enemy",
  		attack: 8,
  		defense: 4,
  		order: 1,
  		category: 4
  	},
  	{
  		id: "goblin_marauder",
  		type: "enemy",
  		attack: 3,
  		defense: 3,
  		order: 1,
  		category: 1
  	},
  	{
  		id: "goblin_warrior",
  		type: "enemy",
  		attack: 3,
  		defense: 4,
  		order: 2,
  		category: 2
  	},
  	{
  		id: "goblin_wolfrider",
  		type: "enemy",
  		attack: 6,
  		defense: 7,
  		order: 2,
  		category: 4
  	},
  	{
  		id: "goblin_overlord",
  		type: "enemy",
  		attack: 20,
  		defense: 15,
  		order: 3,
  		cap: 1,
  		category: 2
  	},
  	{
  		id: "lich",
  		type: "enemy",
  		attack: 60,
  		defense: 50,
  		order: 3,
  		cap: 1,
  		category: 1
  	},
  	{
  		id: "ball_lightning",
  		type: "enemy",
  		attack: 55,
  		defense: 20,
  		order: 1,
  		category: 4
  	},
  	{
  		id: "lizard_warrior",
  		type: "enemy",
  		attack: 12,
  		defense: 12,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "lizard_archer",
  		type: "enemy",
  		attack: 13,
  		defense: 6,
  		order: 3,
  		category: 1
  	},
  	{
  		id: "lizard_shaman",
  		type: "enemy",
  		attack: 22,
  		defense: 32,
  		order: 3,
  		category: 1
  	},
  	{
  		id: "lizard_commander",
  		type: "enemy",
  		attack: 50,
  		defense: 75,
  		order: 3,
  		category: 1
  	},
  	{
  		id: "katana_samurai",
  		type: "enemy",
  		attack: 26,
  		defense: 28,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "markanat",
  		type: "enemy",
  		attack: 900,
  		defense: 600,
  		order: 1,
  		cap: 1,
  		category: 4
  	},
  	{
  		id: "myconid",
  		type: "enemy",
  		attack: 3,
  		defense: 10,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "musket_ashigaru",
  		type: "enemy",
  		attack: 22,
  		defense: 18,
  		order: 2,
  		category: 2
  	},
  	{
  		id: "hill_giant",
  		type: "enemy",
  		attack: 20,
  		defense: 36,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "minotaur",
  		type: "enemy",
  		attack: 1000,
  		defense: 1800,
  		order: 1,
  		cap: 1,
  		category: 3
  	},
  	{
  		id: "mountain_giant",
  		type: "enemy",
  		attack: 34,
  		defense: 42,
  		order: 3,
  		category: 3
  	},
  	{
  		id: "pillager",
  		type: "enemy",
  		attack: 3,
  		defense: 5,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "deserter",
  		type: "enemy",
  		attack: 7,
  		defense: 6,
  		order: 2,
  		category: 2
  	},
  	{
  		id: "snake",
  		type: "enemy",
  		attack: 4,
  		defense: 4,
  		order: 1,
  		category: 4
  	},
  	{
  		id: "giant_snake",
  		type: "enemy",
  		attack: 16,
  		defense: 8,
  		order: 2,
  		category: 4
  	},
  	{
  		id: "ravenous_crab",
  		type: "enemy",
  		attack: 2,
  		defense: 1,
  		order: 1,
  		category: 4
  	},
  	{
  		id: "spider",
  		type: "enemy",
  		attack: 3,
  		defense: 2,
  		order: 1,
  		category: 4
  	},
  	{
  		id: "sluagh",
  		type: "enemy",
  		attack: 26,
  		defense: 6,
  		order: 1,
  		category: 4
  	},
  	{
  		id: "giant_spider",
  		type: "enemy",
  		attack: 10,
  		defense: 8,
  		order: 2,
  		category: 4
  	},
  	{
  		id: "skeleton",
  		type: "enemy",
  		attack: 2,
  		defense: 2,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "skeletal_knight",
  		type: "enemy",
  		attack: 18,
  		defense: 22,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "skullface",
  		type: "enemy",
  		attack: 76,
  		defense: 60,
  		order: 3,
  		cap: 1,
  		category: 1
  	},
  	{
  		id: "son_atamar",
  		type: "enemy",
  		attack: 22,
  		defense: 20,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "swamp_horror",
  		type: "enemy",
  		attack: 900,
  		defense: 1400,
  		order: 1,
  		cap: 1,
  		category: 3
  	},
  	{
  		id: "spectra_memory",
  		type: "enemy",
  		attack: 5,
  		defense: 8,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "succubus",
  		type: "enemy",
  		attack: 37,
  		defense: 23,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "succubus_queen",
  		type: "enemy",
  		attack: 1500,
  		defense: 1750,
  		order: 2,
  		cap: 1,
  		category: 1
  	},
  	{
  		id: "zombie",
  		type: "enemy",
  		attack: 3,
  		defense: 3,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "ghost",
  		type: "enemy",
  		attack: 5,
  		defense: 5,
  		order: 2,
  		category: 4
  	},
  	{
  		id: "gnoll_leader",
  		type: "enemy",
  		attack: 23,
  		defense: 18,
  		order: 2,
  		cap: 1,
  		category: 2
  	},
  	{
  		id: "gnoll_raider",
  		type: "enemy",
  		attack: 6,
  		defense: 5,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "oni",
  		type: "enemy",
  		attack: 45,
  		defense: 99,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "orc_champion",
  		type: "enemy",
  		attack: 35,
  		defense: 130,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "orc_berserker",
  		type: "enemy",
  		attack: 55,
  		defense: 11,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "orc_flame_caster",
  		type: "enemy",
  		attack: 45,
  		defense: 12,
  		order: 3,
  		category: 1
  	},
  	{
  		id: "orc_ironskin",
  		type: "enemy",
  		attack: 18,
  		defense: 169,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "orc_shaman",
  		type: "enemy",
  		attack: 33,
  		defense: 28,
  		order: 3,
  		category: 1
  	},
  	{
  		id: "orc_stone_thrower",
  		type: "enemy",
  		attack: 31,
  		defense: 10,
  		order: 3,
  		category: 1
  	},
  	{
  		id: "orc_warg_rider",
  		type: "enemy",
  		attack: 33,
  		defense: 70,
  		order: 2,
  		category: 4
  	},
  	{
  		id: "orc_warlord",
  		type: "enemy",
  		attack: 70,
  		defense: 150,
  		order: 2,
  		category: 2
  	},
  	{
  		id: "orc_warrior",
  		type: "enemy",
  		attack: 25,
  		defense: 63,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "orc_worker",
  		type: "enemy",
  		attack: 17,
  		defense: 48,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "necromancer",
  		type: "enemy",
  		attack: 28,
  		defense: 15,
  		order: 3,
  		cap: 1,
  		category: 1
  	},
  	{
  		id: "imp",
  		type: "enemy",
  		attack: 3,
  		defense: 1,
  		order: 2,
  		category: 1
  	},
  	{
  		id: "lesser_demon",
  		type: "enemy",
  		attack: 8,
  		defense: 8,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "greater_demon",
  		type: "enemy",
  		attack: 16,
  		defense: 16,
  		order: 3,
  		category: 2
  	},
  	{
  		id: "griffin",
  		type: "enemy",
  		attack: 42,
  		defense: 58,
  		order: 1,
  		category: 4
  	},
  	{
  		id: "kobold",
  		type: "enemy",
  		attack: 3,
  		defense: 2,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "kobold_champion",
  		type: "enemy",
  		attack: 5,
  		defense: 12,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "kobold_king",
  		type: "enemy",
  		attack: 42,
  		defense: 48,
  		order: 1,
  		cap: 1,
  		category: 2
  	},
  	{
  		id: "naga",
  		type: "enemy",
  		attack: 12,
  		defense: 12,
  		order: 1,
  		category: 4
  	},
  	{
  		id: "red_dragon",
  		type: "enemy",
  		attack: 280,
  		defense: 180,
  		order: 3,
  		cap: 1,
  		category: 4
  	},
  	{
  		id: "titan",
  		type: "enemy",
  		attack: 1,
  		defense: 52000,
  		order: 1,
  		cap: 1,
  		category: 2
  	},
  	{
  		id: "troll_cave",
  		type: "enemy",
  		attack: 16,
  		defense: 28,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "troll_battle",
  		type: "enemy",
  		attack: 42,
  		defense: 56,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "tyrannosaurus",
  		type: "enemy",
  		attack: 1750,
  		defense: 1200,
  		order: 1,
  		cap: 1,
  		category: 4
  	},
  	{
  		id: "vampire",
  		type: "enemy",
  		attack: 80,
  		defense: 90,
  		order: 3,
  		cap: 1,
  		category: 2
  	},
  	{
  		id: "vampire_bat",
  		type: "enemy",
  		attack: 2,
  		defense: 1,
  		order: 1,
  		category: 4
  	},
  	{
  		id: "vampire_servant",
  		type: "enemy",
  		attack: 15,
  		defense: 32,
  		order: 1,
  		category: 3
  	},
  	{
  		id: "velociraptors",
  		type: "enemy",
  		attack: 37,
  		defense: 22,
  		order: 1,
  		category: 4
  	},
  	{
  		id: "werewolf",
  		type: "enemy",
  		attack: 1150,
  		defense: 600,
  		order: 1,
  		cap: 1,
  		category: 1
  	},
  	{
  		id: "wendigo",
  		type: "enemy",
  		attack: 47,
  		defense: 39,
  		order: 1,
  		category: 2
  	},
  	{
  		id: "wind_elemental",
  		type: "enemy",
  		attack: 22,
  		defense: 42,
  		order: 1,
  		category: 1
  	},
  	{
  		id: "warg",
  		type: "enemy",
  		attack: 22,
  		defense: 18,
  		order: 1,
  		category: 4
  	},
  	{
  		id: "wolf",
  		type: "enemy",
  		attack: 4,
  		defense: 4,
  		order: 1,
  		category: 4
  	},
  	{
  		id: "wyvern",
  		type: "enemy",
  		attack: 32,
  		defense: 28,
  		order: 2,
  		category: 4
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
    return !!navButtons.find(button => button.innerText.includes(page));
  };
  const checkPage = (page, subPage) => {
    const currentPage = getCurrentPageSelector();
    const currentSubPage = getCurrentSubPageSelector();
    const isCorrectPage = !page || page && currentPage && currentPage.innerText.includes(page);
    const isCorrectSubPage = !subPage || subPage && currentSubPage && currentSubPage.innerText.includes(subPage);
    return isCorrectPage && isCorrectSubPage;
  };
  const hasSubPage = subPage => {
    const subTabs = getSubPagesSelector();
    return !!subTabs.find(button => button.innerText.includes(subPage));
  };
  const switchPage = async page => {
    let foundPage = hasPage(page);
    if (!foundPage) {
      await switchPage(CONSTANTS.PAGES.BUILD);
      return;
    }
    let switchedPage = false;
    const navButtons = getPagesSelector();
    const pageButton = navButtons.find(button => button.innerText.includes(page) && button.getAttribute('aria-selected') !== 'true');
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
      const subPageButton = navButtons.find(button => button.innerText.includes(subPage) && button.getAttribute('aria-selected') !== 'true');
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
    const activeOnlySelector = activeOnly ? ':not(.btn-off)' : '';
    return [...getActivePageContent().querySelectorAll(`button.btn${activeOnlySelector}${extraSelectors}`)];
  };
  var selectors = {
    getActivePageContent,
    getAllButtons: getAllButtons$5
  };

  const get = (resourceName = 'Gold') => {
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
      if (resource.textContent.includes(resourceName)) {
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
        selected: ''
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
    return document.querySelectorAll('div[role="tablist"]')[1].querySelector('[aria-selected="true"]').innerText.replace('Army', '').split('/').map(text => +text.trim());
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
      const buttonText = button.innerText.trim();
      if (buttonText === '+1') {
        controls.counts['1'] = button;
      } else if (buttonText === '+10') {
        controls.counts['10'] = button;
      } else if (buttonText === '+50') {
        controls.counts['50'] = button;
      } else if (buttonText) {
        const unitDetails = buttonText.split('\n');
        const unit = units.find(unit => translate(unit.id, 'uni_') === unitDetails[0].trim());
        if (unit) {
          if (unitDetails[1]) {
            unit.count = +unitDetails[1];
          } else {
            unit.count = 0;
          }
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
              const resource = resources.get(translate(resId, 'res_'));
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
          shouldHire = !unit.gen.filter(gen => gen.type === 'resource').find(gen => !resources.get(translate(gen.id, 'res_')) || resources.get(translate(gen.id, 'res_')).speed + maxBulkHire * gen.value <= 0);
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
  const userSelectedUnits = () => {
    return state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.scoutsMax || state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.explorersMax;
  };
  const executeAction$9 = async () => {
    if (!navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.EXPLORE)) return;
    if (state.scriptPaused) return;
    const maxScouts = state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.scoutsMax;
    const minScouts = state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.scoutsMin;
    const maxExplorers = state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.explorersMax;
    const minExplorers = state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.explorersMin;
    const container = document.querySelector('div.tab-container.sub-container');
    if (container) {
      let canExplore = false;
      const boxes = [...container.querySelectorAll('div.grid > div.flex')];
      boxes.shift();
      let unitsSent = [];
      for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        const name = box.querySelector('h5.font-bold').innerText.trim();
        const removeUnitButton = box.querySelector('div.inline-flex button.btn-red');
        const addUnitButton = box.querySelector('div.inline-flex button.btn-green');
        let count = box.querySelector('input[type="text"]').value.split(' / ').map(x => +x);
        const limitMax = name === 'Scout' ? maxScouts : maxExplorers;
        const limitMin = name === 'Scout' ? minScouts : minExplorers;
        if (count[1] < limitMin) {
          break;
        }
        for (let i = 0; i < count[0] - limitMax && removeUnitButton; i++) {
          removeUnitButton.click();
          await sleep(25);
        }
        count = box.querySelector('input[type="text"]').value.split(' / ').map(x => +x);
        for (let i = 0; i < limitMax - count[0] && addUnitButton; i++) {
          addUnitButton.click();
          await sleep(25);
        }
        count = box.querySelector('input[type="text"]').value.split(' / ').map(x => +x);
        if (count[0] >= limitMin) {
          canExplore = true;
          if (name === 'Scout') {
            unitsSent.push(`${count[0]} Scout(s)`);
          } else {
            unitsSent.push(`${count[0]} Explorer(s)`);
          }
        } else {
          while (removeUnitButton) {
            removeUnitButton.click();
            await sleep(25);
          }
        }
      }
      const sendToExplore = container.querySelector('button.btn-blue:not(.btn-off)');
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
  var ArmyExplore = {
    page: CONSTANTS.PAGES.ARMY,
    subpage: CONSTANTS.SUBPAGES.EXPLORE,
    enabled: () => userEnabled$9() && navigation.hasPage(CONSTANTS.PAGES.ARMY) && userSelectedUnits() && new Date().getTime() - (state.lastVisited[`${CONSTANTS.PAGES.ARMY}${CONSTANTS.SUBPAGES.EXPLORE}`] || 0) > 35 * 1000,
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
  const userEnabled$8 = () => {
    return (state.options.pages[CONSTANTS.PAGES.ARMY].enabled || false) && (state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.ATTACK].enabled || false);
  };
  const calculateDamages = (enemyStats, userStats) => {
    let enemyAttack = 0;
    let enemyDefense = 0;
    let userAttack = 0;
    let userDefense = 0;
    // ['Recon', 'Ranged', 'Shock', 'Tank', 'Rider']
    for (let i = 1; i < enemyStats.attack.length; i++) {
      let j = i + 1;
      if (i === 4) j = 1;
      enemyAttack += userStats.attack[j] ? 2 * enemyStats.attack[i] : enemyStats.attack[i];
      enemyDefense += enemyStats.defense[i];
    }
    for (let i = 1; i < userStats.attack.length; i++) {
      let j = i + 1;
      if (i === 4) j = 1;
      userAttack += enemyStats.attack[j] ? 2 * userStats.attack[i] : userStats.attack[i];
      userDefense += userStats.defense[i];
    }
    return {
      enemy: {
        enemyAttack,
        enemyDefense
      },
      user: {
        userAttack,
        userDefense
      }
    };
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
      let army = [];
      let userUnits = [];
      let run = window.localStorage.getItem('run');
      if (run) {
        run = JSON.parse(run);
      }
      const enemySelectorButton = controlBox.querySelector('button.btn');
      const sendToAttackButton = [...controlBox.querySelectorAll('button.btn')].find(button => button.innerText.includes('Send to attack'));
      if (enemySelectorButton && !enemySelectorButton.disabled) {
        enemySelectorButton.click();
        await sleep(25);
        const modal = [...document.querySelectorAll('h3.modal-title')].find(h3 => h3.innerText.includes('enemies'));
        if (modal) {
          enemyList = [...modal.parentElement.querySelectorAll('h5')].map(h5 => {
            const enemyDetails = fights$1.find(fight => fight.id === h5.innerText.trim());
            return {
              button: h5,
              ...enemyDetails
            };
          });
          enemyList.sort((a, b) => {
            if (factionFights.includes(a.key)) {
              a.level -= 100;
            }
            if (factionFights.includes(b.key)) {
              b.level -= 100;
            }
            return a.level - b.level;
          });
          if (enemyList.length) {
            targetSelected = true;
            enemyList[0].button.click();
            await sleep(25);
          } else {
            const closeButton = modal.parentElement.parentElement.parentElement.querySelector('div.absolute > button');
            if (closeButton) {
              closeButton.click();
              await sleep(25);
            }
          }
        }
      }
      if (targetSelected) {
        const difficultyMode = window.localStorage.getItem('difficultyMode');
        const difficultyModeMultiplier = difficultyMode === '0' ? 1 : difficultyMode === '1' ? 1.5 : 2;
        const randomBonus = 1.3;
        army = enemyList[0].army.map(unit => {
          const unitDetails = units.find(enemy => enemy.id === unit.id);
          return {
            ...unit,
            ...unitDetails,
            value: Math.round(unit.value * difficultyModeMultiplier * randomBonus)
          };
        });
      }
      for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        const name = box.querySelector('h5.font-bold').innerText.trim();
        let removeUnitButton = box.querySelector('div.inline-flex button.btn-red');
        const addUnitButton = box.querySelector('div.inline-flex button.btn-green');
        while (removeUnitButton) {
          removeUnitButton.click();
          await sleep(25);
          removeUnitButton = box.querySelector('div.inline-flex button.btn-red');
        }
        const unitDetails = units.find(unit => translate(unit.id, 'uni_') === name);
        if (run && run.modifiers) {
          let bonusAttack = 0;
          let bonusDefense = 0;
          const unitMods = run.modifiers.find(mod => mod.id === unitDetails.id);
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
                } else {
                  if (mod.id === 'attack') {
                    bonusAttack += (mod.value / 100 + 1) * unitDetails.attack;
                  }
                  if (mod.id === 'defense') {
                    bonusDefense += (mod.value / 100 + 1) * unitDetails.defense;
                  }
                }
              }
            }
          }
          unitDetails.attack += bonusAttack;
          unitDetails.defense += bonusDefense;
        }
        userUnits.push({
          ...unitDetails,
          key: unitDetails.id,
          id: name,
          box,
          removeUnitButton,
          addUnitButton
        });
      }
      if (targetSelected && army.length && userUnits.length && sendToAttackButton) {
        const enemyStats = {
          attack: [0, 0, 0, 0, 0],
          defense: [0, 0, 0, 0, 0]
        };
        const userStats = {
          attack: [0, 0, 0, 0, 0],
          defense: [0, 0, 0, 0, 0]
        };
        for (let i = 0; i < army.length; i++) {
          enemyStats.attack[army[i].category] += army[i].attack * army[i].value;
          enemyStats.defense[army[i].category] += army[i].defense * army[i].value;
        }
        const sortMethod = (type = 'defense') => {
          return (a, b) => {
            const aHasAdvantage = a.category !== 4 ? enemyStats.defense[a.category + 1] : enemyStats.defense[1];
            const bHasAdvantage = b.category !== 4 ? enemyStats.defense[b.category + 1] : enemyStats.defense[1];
            const aGivesAdvantage = a.category !== 1 ? enemyStats.attack[a.category - 1] : enemyStats.attack[4];
            const bGivesAdvantage = b.category !== 1 ? enemyStats.attack[b.category - 1] : enemyStats.attack[4];
            if (aGivesAdvantage === bGivesAdvantage) {
              if (aHasAdvantage === bHasAdvantage) {
                if (type === 'defense') {
                  return b.defense - a.defense;
                } else {
                  return b.attack - a.attack;
                }
              } else {
                return bHasAdvantage - aHasAdvantage;
              }
            } else {
              return aGivesAdvantage - bGivesAdvantage;
            }
          };
        };
        const defUnits = [...userUnits].sort(sortMethod('defense'));
        const attUnits = [...userUnits].sort(sortMethod('attack'));
        let gotDef = false;
        let gotAtt = false;
        for (let i = 0; i < defUnits.length; i++) {
          if (gotDef) break;
          const unit = defUnits[i];
          while (!gotDef) {
            const damages = calculateDamages(enemyStats, userStats);
            if (damages.enemy.enemyDefense < damages.user.userAttack) gotAtt = true;
            if (damages.enemy.enemyAttack < damages.user.userDefense) gotDef = true;
            if (gotDef) break;
            unit.removeUnitButton = unit.box.querySelector('div.inline-flex button.btn-red');
            unit.addUnitButton = unit.box.querySelector('div.inline-flex button.btn-green');
            if (unit.addUnitButton) {
              unit.addUnitButton.click();
              await sleep(25);
              if (sendToAttackButton.classList.toString().includes('btn-off')) {
                unit.removeUnitButton.click();
                await sleep(25);
                break;
              }
              userStats.attack[unit.category] += unit.attack;
              userStats.defense[unit.category] += unit.defense;
            } else {
              break;
            }
          }
        }
        if (!gotAtt) {
          for (let i = 0; i < attUnits.length; i++) {
            if (gotAtt) break;
            const unit = attUnits[i];
            while (!gotAtt) {
              const damages = calculateDamages(enemyStats, userStats);
              if (damages.enemy.enemyDefense < damages.user.userAttack) gotAtt = true;
              if (damages.enemy.enemyAttack < damages.user.userDefense) gotDef = true;
              if (gotAtt) break;
              unit.removeUnitButton = unit.box.querySelector('div.inline-flex button.btn-red');
              unit.addUnitButton = unit.box.querySelector('div.inline-flex button.btn-green');
              if (unit.addUnitButton) {
                unit.addUnitButton.click();
                await sleep(25);
                if (sendToAttackButton.classList.toString().includes('btn-off')) {
                  unit.removeUnitButton.click();
                  await sleep(25);
                  break;
                }
                userStats.attack[unit.category] += unit.attack;
                userStats.defense[unit.category] += unit.defense;
              } else {
                break;
              }
            }
          }
        }
        if (state.scriptPaused) return;
        if (gotAtt && gotDef) {
          logger({
            msgLevel: 'log',
            msg: `Launching attack against ${enemyList[0].id}`
          });
          sendToAttackButton.click();
          await sleep(25);
        } else {
          for (let i = 0; i < userUnits.length; i++) {
            let removeUnitButton = userUnits[i].box.querySelector('div.inline-flex button.btn-red');
            while (removeUnitButton) {
              removeUnitButton.click();
              await sleep(25);
              removeUnitButton = userUnits[i].box.querySelector('div.inline-flex button.btn-red');
            }
          }
        }
      }
    }
  };
  var ArmyAttack = {
    page: CONSTANTS.PAGES.ARMY,
    subpage: CONSTANTS.SUBPAGES.ATTACK,
    enabled: () => userEnabled$8() && navigation.hasPage(CONSTANTS.PAGES.ARMY) && new Date().getTime() - (state.lastVisited[`${CONSTANTS.PAGES.ARMY}${CONSTANTS.SUBPAGES.ATTACK}`] || 0) > 35 * 1000,
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
                  resource: translate(gen.id, 'res_'),
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
      const id = button.innerText.split('\n').shift();
      const count = button.querySelector('span.right-0') ? numberParser.parse(button.querySelector('span.right-0').innerText) : 0;
      return {
        id: id,
        element: button,
        count: count,
        building: buildingsList.find(building => building.id === id)
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
      const id = button.innerText.split('\n').shift();
      let count = button.querySelector('span.right-0') ? numberParser.parse(button.querySelector('span.right-0').innerText) : 0;
      const building = buildingsList.find(building => building.id === id);
      if (!building) {
        return {};
      }
      if (button.className.includes('btn-cap') && building.cap) {
        count = building.cap;
      }
      return {
        id: id,
        count: count,
        canBuild: !button.className.includes('btn-off'),
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
                  resource: translate(gen.id, 'res_'),
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
      const id = button.innerText.split('\n').shift();
      const count = button.querySelector('span') ? numberParser.parse(button.querySelector('span').innerText) : 0;
      return {
        id: id,
        element: button,
        count: count,
        building: buildingsList.find(building => building.id === id)
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
      const id = button.innerText.split('\n').shift();
      let count = button.querySelector('span') ? numberParser.parse(button.querySelector('span').innerText) : 0;
      const building = buildingsList.find(building => building.id === id);
      if (!building) {
        return {};
      }
      if (button.className.includes('btn-cap') && building.cap) {
        count = building.cap;
      }
      return {
        id: id,
        count: count,
        canBuild: !button.className.includes('btn-off'),
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

  const resourcesToTrade = ['Cow', 'Horse', 'Food', 'Copper', 'Wood', 'Stone', 'Iron', 'Tools'];
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
    const userResourcesToTrade = Object.keys(state.options.pages[CONSTANTS.PAGES.MARKETPLACE].options).filter(key => key.includes('resource_') && state.options.pages[CONSTANTS.PAGES.MARKETPLACE].options[key]).map(key => translate(key.replace('resource_', '')));
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
    const gold = resources.get('Gold');
    return gold.current + gold.speed * getTimeToWaitUntilFullGold() < gold.max;
  };
  const userEnabled$5 = () => {
    return state.options.pages[CONSTANTS.PAGES.MARKETPLACE].enabled || false;
  };
  const executeAction$5 = async () => {
    let gold = resources.get('Gold');
    if (gold && gold.current < gold.max && shouldSell()) {
      const resourceHolders = [];
      [...document.querySelectorAll('div > div.tab-container > div > div > div')].forEach(resourceHolder => {
        const resNameElem = resourceHolder.querySelector('h5');
        if (resNameElem) {
          const resName = resNameElem.innerText;
          const res = resources.get(resName);
          if (getResourcesToTrade().includes(resName) && res && (res.current === res.max || res.current + res.speed * getTimeToFillResource() >= res.max)) {
            resourceHolders.push(resourceHolder);
          }
        }
      });
      let goldEarned = 0;
      let soldTotals = {};
      for (let i = 0; i < resourceHolders.length && !state.scriptPaused; i++) {
        gold = resources.get('Gold');
        const resourceHolder = resourceHolders[i];
        const resName = resourceHolder.querySelector('h5').innerText;
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
          gold = resources.get('Gold');
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
    navButtons.forEach(button => {
      if (button.innerText.includes(CONSTANTS.PAGES.POPULATION)) {
        unassignedPopulation = !!button.querySelector('span');
      }
    });
    return unassignedPopulation;
  };
  const allJobs = jobs.filter(job => job.gen && job.gen.length).map(job => {
    return {
      ...job,
      id: translate(job.id, 'pop_'),
      key: job.id,
      gen: job.gen.filter(gen => gen.type === 'resource').map(gen => {
        return {
          id: translate(gen.id, 'res_'),
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
      const jobTitle = job.textContent.trim();
      return {
        ...allowedJobs.find(allowedJob => allowedJob.id === jobTitle),
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
    const shouldRebalance = state.options.pages[CONSTANTS.PAGES.POPULATION].options.populationRebalanceTime > 0 && (!state.lastVisited.populationRebalance || state.lastVisited.populationRebalance + state.options.pages[CONSTANTS.PAGES.POPULATION].options.populationRebalanceTime * 60 * 1000 < new Date().getTime());
    if (allowedJobs.length && shouldRebalance) {
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
      while (!state.scriptPaused && canAssignJobs) {
        canAssignJobs = false;
        if (availableJobs.length) {
          const foodJob = availableJobs.find(job => job.resourcesGenerated.find(res => res.id === 'Food'));
          if (foodJob && resources.get('Food').speed <= minimumFood && foodJob.current < foodJob.maxAvailable) {
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
              const resourcesToProduce = ['Natronite', 'Saltpetre', 'Tools', 'Wood', 'Stone', 'Iron', 'Copper', 'Mana', 'Faith', 'Research', 'Materials', 'Steel', 'Supplies', 'Gold', 'Crystal', 'Horse', 'Cow', 'Food'].filter(res => resources.get(res)).filter(res => availableJobs.find(job => job.resourcesGenerated.find(resGen => resGen.id === res)));
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
                      const isFoodJob = !!job.resourcesGenerated.find(res => res.id === 'Food');
                      if (isFoodJob) {
                        isSafeToAdd = isSafeToAdd || resources.get('Food').speed <= minimumFood && foodJob.current < foodJob.maxAvailable;
                      }
                      if (!job.isSafe) {
                        job.resourcesUsed.every(resUsed => {
                          const res = resources.get(resUsed.id);
                          if (!res || res.speed < Math.abs(resUsed.value * 2)) {
                            isSafeToAdd = false;
                          }
                          if (res && resUsed.id === 'Food' && res.speed - resUsed.value < minimumFood) {
                            const foodJob = getAllAvailableJobs().find(job => job.resourcesGenerated.find(res => res.id === 'Food'));
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
                const isFoodJob = !!job.resourcesGenerated.find(res => res.id === 'Food');
                if (isFoodJob) {
                  isSafeToAdd = isSafeToAdd || resources.get('Food').speed <= minimumFood && foodJob.current < foodJob.maxAvailable;
                }
                if (!job.isSafe) {
                  job.resourcesUsed.every(resUsed => {
                    const res = resources.get(resUsed.id);
                    if (!res || res.speed < Math.abs(resUsed.value * 2)) {
                      isSafeToAdd = false;
                    }
                    if (res && resUsed.id === 'Food' && res.speed - resUsed.value < minimumFood) {
                      const foodJob = availableJobs.find(job => job.resourcesGenerated.find(res => res.id === 'Food'));
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
    enabled: () => userEnabled$4() && navigation.hasPage(CONSTANTS.PAGES.POPULATION) && hasUnassignedPopulation() && getAllJobs().length,
    action: async () => {
      await navigation.switchPage(CONSTANTS.PAGES.POPULATION);
      if (navigation.checkPage(CONSTANTS.PAGES.POPULATION)) await executeAction$4();
    }
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
      let button = buttonsList.find(button => button.innerText.split('\n').shift().trim() === tech.id);
      if (!button && tech.id === 'A moonlit night') {
        button = buttonsList.find(button => button.innerText.split('\n').shift().trim() === 'A moonlight night');
      }
      return {
        ...tech,
        button
      };
    }).filter(tech => tech.button).sort((a, b) => b.prio - a.prio);
    return allowedResearch;
  };
  const executeAction$3 = async () => {
    let buttonsList = getAllButtons$2();
    if (buttonsList.length) {
      while (!state.scriptPaused && buttonsList.length) {
        const highestPrio = buttonsList[0].prio;
        buttonsList = buttonsList.filter(tech => tech.prio === highestPrio);
        for (let i = 0; i < buttonsList.length; i++) {
          const research = buttonsList[i];
          research.button.click();
          logger({
            msgLevel: 'log',
            msg: `Researching ${research.id}`
          });
          await sleep(25);
          if (research.confirm) {
            if (!navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) return;
            await sleep(1000);
            const redConfirmButton = [...document.querySelectorAll('.btn.btn-red')].find(button => button.innerText.includes('Confirm'));
            if (redConfirmButton) {
              redConfirmButton.click();
              await sleep(4000);
              if (!navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) return;
            }
          }
          if (!navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) return;
        }
        await sleep(3100);
        buttonsList = getAllButtons$2();
      }
    }
  };
  const hasResearches = () => {
    const resNavButton = navigation.getPagesSelector().find(page => page.innerText.includes(CONSTANTS.PAGES.RESEARCH));
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
      const button = buttonsList.find(button => button.innerText.split('\n').shift().trim() === prayer.id);
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
    enabled: () => userEnabled$2() && navigation.hasPage(CONSTANTS.PAGES.MAGIC) && getAllowedPrayers().length && resources.get('Faith') && resources.get('Faith').max,
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
      const h5 = button.parentElement.parentElement.querySelector('h5');
      if (!h5) {
        return {};
      }
      const spell = allowedSpells.find(spell => h5.innerText.trim() === spell.id);
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
      if (spell.button.innerText.includes('Cancel this spell')) {
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
      const hasEnoughMana = resources.get('Mana').speed + spell.gen.find(gen => gen.id === 'mana').value > (state.options.pages[CONSTANTS.PAGES.MAGIC].subpages[CONSTANTS.SUBPAGES.SPELLS].options.minimumMana || 0);
      if (spell.button.innerText.includes('Cast this spell') && hasEnoughMana) {
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
    enabled: () => userEnabled$1() && navigation.hasPage(CONSTANTS.PAGES.MAGIC) && getAllowedSpells().length && resources.get('Mana') && resources.get('Mana').max,
    action: async () => {
      await navigation.switchSubPage(CONSTANTS.SUBPAGES.SPELLS, CONSTANTS.PAGES.MAGIC);
      if (navigation.checkPage(CONSTANTS.PAGES.MAGIC, CONSTANTS.SUBPAGES.SPELLS)) await executeAction$1();
    }
  };

  const userEnabled = () => {
    return state.options.pages[CONSTANTS.PAGES.DIPLOMACY].enabled || false;
  };
  const mapToFaction = button => {
    let level = 0;
    let parent = button.parentElement;
    let factionName;
    while (!factionName && level < 5) {
      factionName = parent.querySelector('div.font-bold > button.font-bold');
      if (factionName) {
        factionName = factionName.innerText.split('\n').shift().trim();
      } else {
        factionName = null;
        parent = parent.parentElement;
        level += 1;
      }
    }
    if (factionName) {
      const factionData = factions.find(faction => translate(faction.id, 'dip_') === factionName);
      return {
        ...factionData,
        button,
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
      const buttonText = button.button.innerText.trim();
      const buttonType = Object.keys(CONSTANTS.DIPLOMACY_BUTTONS).find(key => buttonText.includes(CONSTANTS.DIPLOMACY_BUTTONS[key]));
      if (buttonType) {
        listOfFactions[button.key].buttons[CONSTANTS.DIPLOMACY_BUTTONS[buttonType]] = button.button;
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
                    const currentRes = resources.get(translate(res.id, 'res_'));
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
          } else if (faction.option === CONSTANTS.DIPLOMACY.GO_TO_WAR) {
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
              logger({
                msgLevel: 'log',
                msg: `Going to war with ${faction.id}`
              });
              longAction = true;
              tookAction = true;
              faction.buttons[CONSTANTS.DIPLOMACY_BUTTONS.WAR].click();
              await sleep(200);
              const redConfirmButton = [...document.querySelectorAll('.btn.btn-red')].find(button => button.innerText.includes('Confirm'));
              if (redConfirmButton) {
                redConfirmButton.click();
                await sleep(200);
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
        const resourceName = cells[0].textContent.trim();
        const resource = resources.get(resourceName);
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
      const resourceName = cells[0].textContent.trim();
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
    let removeButton = button.parentElement.parentElement.querySelector('div.inline-flex button.btn-red');
    while (removeButton) {
      removeButton.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Control',
        code: 'ControlLeft'
      }));
      removeButton.click();
      removeButton.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'Control',
        code: 'ControlLeft'
      }));
      await sleep(10);
      removeButton = button.parentElement.parentElement.querySelector('div.inline-flex button.btn-red');
    }
  };
  const addAllUnits = async button => {
    let addButton = button.parentElement.parentElement.querySelector('div.inline-flex button.btn-green');
    while (addButton) {
      addButton.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Control',
        code: 'ControlLeft'
      }));
      addButton.click();
      addButton.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'Control',
        code: 'ControlLeft'
      }));
      await sleep(10);
      addButton = button.parentElement.parentElement.querySelector('div.inline-flex button.btn-green');
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
    const manualResources = ['Food', 'Wood', 'Stone'];
    while (!state.scriptPaused && state.haveManualResourceButtons) {
      const buttons = [...document.querySelectorAll('#root > div.flex.flex-wrap.w-full.mx-auto.p-2 > div.w-full.lg\\:pl-2 > div > div.order-2.flex.flex-wrap.gap-3 > button')];
      if (!buttons.length) {
        state.haveManualResourceButtons = false;
        return;
      }
      const buttonsToClick = buttons.filter(button => manualResources.includes(button.innerText.trim()));
      while (buttonsToClick.length) {
        const buttonToClick = buttonsToClick.shift();
        buttonToClick.click();
        await sleep(100);
      }
    }
  };

  const defaultAncestor = translate('ancestor_gatherer');
  const autoAncestor = async () => {
    if (!state.options.ancestor.enabled || !state.options.ancestor.selected) return;
    const ancestorToSelect = translate(state.options.ancestor.selected);
    const ancestorPage = document.querySelector('#root > div.mt-6.lg\\:mt-12.xl\\:mt-24.\\32 xl\\:mt-12.\\34 xl\\:mt-24 > div > div.text-center > p.mt-6.lg\\:mt-8.text-lg.lg\\:text-xl.text-gray-500.dark\\:text-gray-400');
    if (ancestorPage) {
      let ancestor = [...document.querySelectorAll('button.btn')].find(button => button.parentElement.innerText.includes(ancestorToSelect));
      if (!ancestor) {
        ancestor = [...document.querySelectorAll('button.btn')].find(button => button.parentElement.innerText.includes(defaultAncestor));
      }
      if (ancestor) {
        ancestor.click();
        state.haveManualResourceButtons = true;
        await sleep(5000);
      }
    }
  };

  const autoPrestige = async () => {
    if (!state.options.prestige.enabled) return;
    let prestigeButton = [...document.querySelectorAll('.btn.btn-red')].find(button => button.innerText.includes('Prestige'));
    if (prestigeButton) {
      localStorage.set('lastVisited', {});
      state.haveManualResourceButtons = true;
      prestigeButton.click();
      await sleep(5000);
      let redConfirmButton = [...document.querySelectorAll('.btn.btn-red')].find(button => button.innerText.includes('Confirm'));
      while (redConfirmButton) {
        redConfirmButton.click();
        await sleep(2000);
        redConfirmButton = [...document.querySelectorAll('.btn.btn-red')].find(button => button.innerText.includes('Confirm'));
      }
    }
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
  const unsafeResearch = ['kobold_nation', 'barbarian_tribes', 'orcish_threat'];
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
            <h3 class="text-lg">Auto-prestige:</h3>
            <div class="mb-2"><label>Enabled:
              <input type="checkbox" data-setting="prestige" data-key="enabled" class="option" />
            </label></div>
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
        value = Math.round(Number(option.value));
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
    zIndex: 99999999;
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

  const hideFullPageOverlay = () => {
    if (!state.scriptPaused && state.options.cosmetics.hideFullPageOverlay.enabled) {
      const fullPageOverlay = document.querySelector('div.modal-container > div.absolute.top-0.right-0.z-20.pt-4.pr-4 > button');
      if (fullPageOverlay && fullPageOverlay.innerText.includes('Close')) {
        fullPageOverlay.click();
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

  var tasks = {
    calculateTippyTTF,
    calculateTTF,
    addArmyButtons,
    autoClicker,
    autoAncestor,
    autoPrestige,
    managePanel,
    manageOptions,
    manageStyles,
    cosmetics
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
        hideFullPageOverlayInterval = setInterval(tasks.cosmetics.hideFullPageOverlay, 1000);
      }
      await sleep(2000);
      mainLoop();
      await sleep(5000);
      tasks.autoClicker();
    } else {
      if (!hideFullPageOverlayInterval) {
        clearInterval(hideFullPageOverlayInterval);
      }
    }
  };
  init();

})();
