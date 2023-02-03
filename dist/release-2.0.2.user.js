// ==UserScript==
// @name        Theresmore Automation
// @description Automation suite for Theresmore game
// @namespace   github.com/Theresmore-Automation/Theresmore-Automation
// @match       https://www.theresmoregame.com/play/
// @license     MIT
// @run-at      document-idle
// @version     2.0.2
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

const taVersion = "2.0.2";


(function () {
  'use strict';

  const PAGES = {
    BUILD: 'Build',
    RESEARCH: 'Research',
    POPULATION: 'Population',
    ARMY: 'Army',
    MARKETPLACE: 'Marketplace',
    MAGIC: 'Magic'
  };
  const SUBPAGES = {
    RESEARCH: 'Research',
    SPELLS: 'Spells',
    PRAYERS: 'Prayers',
    ARMY: 'Army',
    EXPLORE: 'Explore',
    ATTACK: 'Attack',
    GARRISON: 'Garrison'
  };
  var CONSTANTS = {
    PAGES,
    SUBPAGES
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
  	completed: "Completed",
  	confirm: "Confirm",
  	confirm_reward_ad_title: "Support our devs!",
  	confirm_reward_ad_description: "Theresmore is completely free! To help our devs make the game even better you can watch an ad and get this random reward:",
  	dark_light_mode: "Dark / Light mode",
  	defeat: "You have been defeated!",
  	defense: "Defense",
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
  	bui_artisan_workshop: "Artisan Workshop",
  	bui_artisan_workshop_description: "The tools these artisans produce will be the manufacturing focus of the settlement",
  	bui_ancient_vault: "Ancient vault",
  	bui_ancient_vault_description: "Where ancient knowledge is stored",
  	bui_ballista: "Ballista",
  	bui_ballista_description: "Ballista will stop even the biggest enemies",
  	bui_barracks: "Barracks",
  	bui_barracks_description: "Citizens will feel protected with a couple of guards around",
  	bui_bank: "Bank",
  	bui_bank_description: "A money generator for our city",
  	bui_builder_district: "Builder district",
  	bui_builder_district_description: "An area where our builders can join together",
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
  	bui_conclave: "Conclave",
  	bui_conclave_description: "The order of clerics meets in these conclaves",
  	bui_common_house: "Common House",
  	bui_common_house_description: "A small place to live",
  	bui_credit_union: "Credit union",
  	bui_credit_union_description: "Traders can generate gold here",
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
  	bui_industrial_plant: "Industrial plant",
  	bui_industrial_plant_description: "A definite boost to production",
  	bui_large_warehouse: "Large storehouse",
  	bui_large_warehouse_description: "A building to store large quantities of goods",
  	bui_library_souls: "Library of SouLs",
  	bui_library_souls_description: "By reading library books, the hapless scholars lose a piece of their soul, become partially undead",
  	bui_library_of_theresmore: "Library of Theresmore",
  	bui_library_of_theresmore_description: "The place where ancient knowledge is preserved",
  	bui_lumberjack_camp: "Lumberjack Camp",
  	bui_lumberjack_camp_description: "Wood is the resource on which we will base our city",
  	bui_machines_of_gods: "Machines of gods",
  	bui_machines_of_gods_description: "Machinery of a forgotten knowledge",
  	bui_mana_pit: "Mana pit",
  	bui_mana_pit_description: "A very deep pit to accumulate all the mana we will need",
  	bui_mana_pit_part: "Mana pit part",
  	bui_mana_pit_part_description: "A part of the Mana pit",
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
  	bui_military_academy: "Military academy",
  	bui_military_academy_description: "Military academy will train a professional army",
  	bui_mind_shrine: "Mind Shrine",
  	bui_mind_shrine_description: "The sanctuary dedicated to Wisdom will help us discover the secrets of Theresmore",
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
  	bui_quarry: "Quarry",
  	bui_quarry_description: "The quarry will supply the city with stone",
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
  	bui_tower_mana: "Tower of mana",
  	bui_tower_mana_description: "A tower to channel the power of sacred places",
  	bui_tower_mana_part: "Tower of mana part",
  	bui_tower_mana_part_description: "A part of the Tower",
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
  	ene_ancient_hideout: "Ancient hideout",
  	ene_ancient_hideout_description: "Bandits have occupied this old hideout, a few dozen of soldiers should eliminate them",
  	ene_harpy_nest: "Harpy Nest",
  	ene_harpy_nest_description: "The harpies' nest from where they attract unsuspecting travelers",
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
  	ene_djinn_palace: "Djinn Palace",
  	ene_djinn_palace_description: "The abode of a Djinn, several nagas guard the entrance. It will be a tough battle",
  	ene_east_sacred_place: "East sacred place",
  	ene_east_sacred_place_description: "There is a place in the east where the power of Theresmore is alive in the air, elementals guard it",
  	ene_eternal_halls: "Eternal Halls",
  	ene_eternal_halls_description: "The Eternal Halls are a holy place for the people of the Western Kingdom. They are protected by stone guardians",
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
  	ene_lich_temple: "Lich temple",
  	ene_lich_temple_description: "The Lich is a source of dark power and commands dozens of undead",
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
  	ene_old_storage_room: "Old storage room",
  	ene_old_storage_room_description: "An old storage room in which spiders have nested, a dozen of spearmen will conquer this place",
  	ene_prisoner_wagon: "Prisoner wagon",
  	ene_prisoner_wagon_description: "A wagon in which bandits trapped civilians, a few spearman with archers will eliminate them",
  	ene_rat_cellar: "Rat cellar",
  	ene_rat_cellar_description: "A cellar infested with ravenous rats, let's bring some spearmen",
  	ene_rusted_warehouse: "Rusted warehouse",
  	ene_rusted_warehouse_description: "An abandoned farmhouse that will become a good warehouse",
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
  	ene_temple_gargoyle: "Temple of gargoyles",
  	ene_temple_gargoyle_description: "This ancient temple in the forest is guarded by several gargoyles",
  	ene_troll_cave: "Troll Cave",
  	ene_troll_cave_description: "A smelly cave that trolls call home, driving out the occupants will be a serious problem",
  	ene_vampire_crypt: "Vampire crypt",
  	ene_vampire_crypt_description: "A crypt forgotten by time, apparently now home to vampires or servants of them",
  	ene_vampire_lair: "Vampire lair",
  	ene_vampire_lair_description: "The home of a vampire, a terrible enemy capable of instilling fear in even the most valiant soldiers",
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
  	fai_army_faith: "Army of faith",
  	fai_army_faith_description: "Armies of faith will burn our enemies",
  	fai_banish_druid: "Banish the Druid",
  	fai_banish_druid_description: "Banish the Druid from the city, we don't need gurus",
  	fai_blessing_city: "City great blessing",
  	fai_city_blessing: "City blessing",
  	fai_city_blessing_description: "We must gather the city's wise men and create a protection spell",
  	fai_create_sacred_golem: "Create a sacred golem",
  	fai_create_sacred_golem_description: "We will be able to create a blessed mana powered golem",
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
  	img_colony_description: "Our little civilization has come a long way and is now ready for a new adventure. A colony on a continent to the west beyond the shores of the known kingdoms, only the gods know what challenges our first settlers will face far from our valley!",
  	img_deep_mine: "The depths of Theresmore",
  	img_deep_mine_description: "Our miners are digging in the depths of Theresmore, and the deeper we descend, the more eerie noises can be heard coming from the abyss. Continuing to dig could be very dangerous",
  	img_demoness_castle: "The dark horned demoness",
  	img_demoness_castle_description: "\"How dare you have defiled my village and freed my slaves from their eternal pleasure? And now you approach my castle! Don't you dare take another step or you will become my docile puppet\"",
  	img_elf: "The elven people",
  	img_elf_description: "A long life is available to elves, they fill it with wisdom and intelligence. Great wizards, superb archers, they patrol the forests of Theresmore in search of their sworn enemies",
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
  	img_orc: "The orc tribes",
  	img_orc_description: "Ruthless warriors orcs are on average larger than humans. They live in tribes commanded by leaders who are obeyed without question; their commanders rule with an iron fist. They roam Theresmore in search of peoples to subjugate and enslave",
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
  	leg_ancient_vault: "Ancient Vault",
  	leg_ancient_vault_description: "Unlock the Ancient Vault",
  	leg_ancient_treasury: "Ancient Treasury",
  	leg_ancient_treasury_description: "An aid to minds and pockets",
  	leg_ancient_treasury_II: "Ancient Treasury II",
  	leg_ancient_treasury_II_description: "Revealing and buying Theresmore",
  	leg_ancient_treasury_III: "Ancient Treasury III",
  	leg_ancient_treasury_III_description: "Bye bye caps",
  	leg_angel: "Battle Angel",
  	leg_angel_description: "A holy warrior who fights for men",
  	leg_army_of_men: "Army of Men",
  	leg_army_of_men_description: "Let's enlarge our army",
  	leg_army_of_men_II: "Army of Men II",
  	leg_army_of_men_II_description: "The west will not fall",
  	leg_army_of_men_III: "Army of Men III",
  	leg_army_of_men_III_description: "We are legion!",
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
  	leg_craftmen: "Craftsmen",
  	leg_craftmen_description: "Producing researched materials",
  	leg_craftmen_II: "Craftsmen II",
  	leg_craftmen_II_description: "Are you having trouble with supplies?",
  	leg_craftmen_III: "Craftsmen III",
  	leg_craftmen_III_description: "No more trouble with supplies",
  	leg_deep_pockets: "Deep Pockets",
  	leg_deep_pockets_description: "Pockets to store a lot of gold",
  	leg_deep_pockets_II: "Deep Pockets II",
  	leg_deep_pockets_II_description: "More gold, more stuffs",
  	leg_deep_pockets_III: "Deep Pockets III",
  	leg_deep_pockets_III_description: "Swimming in gold",
  	leg_defensive_rampart: "Rampart",
  	leg_defensive_rampart_description: "Unlock the Rampart",
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
  	leg_heirloom_horseshoes: "Heirloom of the Horseshoes",
  	leg_heirloom_horseshoes_description: "Hidden in the Monument enhances its strength",
  	leg_heirloom_momento: "Heirloom of the Momento",
  	leg_heirloom_momento_description: "Hidden in the Monument enhances its strength",
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
  	leg_stock_resources: "Stock Resources",
  	leg_stock_resources_description: "A bunch of resource for an easy start",
  	leg_stock_resources_II: "Stock Resources II",
  	leg_stock_resources_II_description: "A lot of resource for an easy start",
  	leg_strengthening_faith: "Strengthening Faith",
  	leg_strengthening_faith_description: "More convinced prayers",
  	leg_strengthening_faith_II: "Strengthening Faith II",
  	leg_strengthening_faith_II_description: "Mana and faith for everyone",
  	leg_strong_workers: "Strong Workers",
  	leg_strong_workers_description: "Your citizens will collect more resources manually",
  	leg_strong_workers_II: "Strong Workers II",
  	leg_strong_workers_II_description: "Your citizens will collect even more resources manually",
  	leg_undead_herds: "Undead Herds",
  	leg_undead_herds_description: "Learn how to breed undead herds",
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
  	log_bui_5_common_house: "Your settlement is starting to grow",
  	log_bui_8_common_house: "The memory of the past times is alive and is handed down from father to son, we can now research the mythology",
  	log_bui_15_common_house: "Congratulations, your little settlement is now a village!",
  	log_bui_1_credit_union: "We can now assume traders in the population tab",
  	log_bui_5_farm: "Our farmers are learning to farm better and better",
  	log_bui_15_farm: "The development of agriculture is creating new landowners",
  	log_bui_1_grocery: "With food and livestock we can now create supplies",
  	log_bui_1_industrial_plant: "In the industrial plant, our artisans turn into workers",
  	log_bui_1_library_souls: "Scholars are partially transformed into the undead, which explains the resulting abundance of food. They no longer have to feed themselves and can work without the need for sleep",
  	log_bui_5_lumberjack_camp: "A community of woodcarvers is emerging",
  	log_bui_15_lumberjack_camp: "Our woodworking is reaching a quality envied by many other kingdoms",
  	log_bui_1_mansion: "To conclude the feudal era we will have to create more universities, grocery, steelworks, carpentry workshop and mansion. This will make our village a city!",
  	log_bui_1_marketplace: "Finally the market! Now we can buy and sell goods",
  	log_bui_5_marketplace: "The market is getting bigger, we will be able to organize fairs",
  	log_bui_1_magic_circle: "How many amazing things we can do with mana. But beware of its dark side",
  	log_bui_1_military_academy: "Some plans to make a defensive super weapon were presented at the military academy",
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
  	log_ene_ancient_hideout: "Our scout found an ancient hideout, will there still be loot left?",
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
  	log_ene_demonic_portal: "Our scout discovered a portal surrounded by demons",
  	log_ene_demoness_castle: "Our scout discovered the castle of the demoness",
  	log_ene_deserters_den: "Our scout discovered a cove of deserter and bandits",
  	log_ene_djinn_palace: "Our scout discovered where the Djinn had gone, created a magnificent glass palace and guarded it with several naga",
  	log_ene_east_sacred_place: "Our scout discovered the east sacred place!",
  	log_ene_eternal_halls: "Our scout discovered the Eternal Halls, we must conquer them to prove our worth to the people of the west",
  	log_ene_hell_hole: "Our scout discovered an entrance to the underworld, demons patrol the cave and the horrors we will find there will be unimaginable. Warning!",
  	log_ene_loot: "Your scout returned to the settlement and brought back everything he could find",
  	log_ene_no_loot: "Your scout explored the territories for days but came back empty handed",
  	log_ene_bandit_camp: "Our scout discovered an encampment of bandits. By knocking it out we can eliminate the threat to our farmers and merchants",
  	log_ene_basilisk_cave: "Our scout discovered a cave of basilisks, beware of their petrifying gaze",
  	log_ene_black_mage_tower: "Our scout discovered a black tower inhabited by a large group of goblins together with their master",
  	log_ene_cave_bats: "Our scout discovered a cave full of vampire bats",
  	log_ene_gloomy_werewolf_forest: "Our scout discovered the forest of the legendary monster Werewolf",
  	log_ene_goblin_lair: "Our scout discovered a lair of goblins, we will have to chase away these fetid creatures and occupy their territories",
  	log_ene_golem_cave: "Our scout discovered a cave full of statues, it is unhealthy to approach",
  	log_ene_gold_mine: "Our scout discovered a huge gold mine, too bad it is being used by a swarm of trolls",
  	log_ene_gorgon_cave: "Our scout discovered the cave of the legendary monsters the Gorgon",
  	log_ene_gnoll_camp: "Our scout discovered a large camp of gnoll commanded by a leader",
  	log_ene_gnoll_raiding_party: "Our scout discovered a party full of Gnoll raider roaming the lands",
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
  	log_ene_old_storage_room: "Our scout discovered an old storage room with a nest of spiders",
  	log_ene_prisoner_wagon: "Our scout discovered a wagon full of prisoners. Some bandits guard it",
  	log_ene_rat_cellar: "Our scout discovered a cellar infested by ravenous rats",
  	log_ene_rusted_warehouse: "Our scout discovered an isolated and rusted warehouse",
  	log_ene_skullface_encampment: "Our scout discovered where Skullface is hiding, we just have to eliminate him",
  	log_ene_snakes_nest: "Our scout discovered a nest full of snakes",
  	log_ene_spider_forest: "Our scout discovered a dense forest full of giant cobwebs",
  	log_ene_son_atamar: "Our scout found, in an old destroyed farm, where the son of Atamar gather",
  	log_ene_south_sacred_place: "Our scout discovered the south sacred place!",
  	log_ene_strange_village: "Our scout discovered a strange village, he was attacked by the inhabitants who showed a strange aggressiveness, they seemed bewitched",
  	log_ene_temple_gargoyle: "Our scout discovered a temple in a very dense forest, it is guarded by gargoyles",
  	log_ene_troll_cave: "Our scout discovered a cave of trolls, better to stay away until our army is powerful enough",
  	log_ene_vampire_crypt: "Our scout discovered a crypt of vampire, we must investigate",
  	log_ene_vampire_lair: "Our scout find the vampire, her power is a threat to any free citizen of Theresmore",
  	log_ene_west_sacred_place: "Our scout discovered the west sacred place!",
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
  	log_fai_northern_star_power: "We can use the power of the Northern Star in two ways: to protect our city or channel its energy to produce more. Only one of the two powers is obtainable; choose carefully",
  	log_fai_prayer_for_the_ancient_monk: "We can now train warrior monks",
  	log_fai_prayer_goddess_luck: "Luck is an asset that everyone should keep in mind on Theresmore, the more luck, the better",
  	log_fai_prayer_lonely_druid: "The request for a blessing to the Druid has been granted, and a powerful spell can now be cast. The Druid's creed banishes natronite and despises vile money, why is it granted in his blessing instead?",
  	log_fai_sacred_place: "We can now send our scouts to discover the sacred places around Theresmore. Conquering them, we can channel all the mana into a Tower and cast the 4 Spells of Power. This will be our goal for the prestige of Ascension",
  	log_fai_strange_lamp: "Handling the lamp, it activated and a Djinn came out, thanking us for freeing him: he flew away with a loud laugh. We should send our scouts to look for his home",
  	log_fai_the_aid: "To solve the refugees problem we will have to create a new district, it will cost us a lot in terms of resources, but we can then make something out of the work of all these people",
  	log_fai_temple_mirune: "Mirune the woods goddess has granted us a powerful spell. Now we can cast it",
  	log_fai_zenix_aid: "Following the way of Atamar and with the teachings of Zenix we will now be able to train the Strategist. The archmage returns to his lands promising help when times become darker",
  	log_spy_full: "The spy mission has succeeded, the enemy has:",
  	log_spy_up50: "The spy mission was a partial success, here is what was discovered about the enemy:",
  	log_spy_down50: "The spy mission was a failure, no information was recovered. You must send more spies for higher probability of success",
  	log_spy_death: "Spies killed in action:",
  	log_tec_agricolture: "Being able to feed the population has always been the biggest problem for early human settlements. We can now build Farm",
  	log_tec_alchemical_reactions: "With saltpetre and mana, we can transmute matter and increase our productions",
  	log_tec_astronomy: "By building observatories we will be able to train Skymancers",
  	log_tec_archery: "We can start train archers and scouts, it will consume food but will provide us with protection and we can send scouts to understand Theresmore and its mysteries. The army is divided into categories, each of which has advantages against another. Tank is strong against Cavalry, Cavalry is strong against Ranged, Ranged is strong against Shock, Shock is strong against Tank",
  	log_tec_ancient_stockpile: "We can explore the ancient vault and guard its secrets",
  	log_tec_architecture: "We can now build the Carpenter workshop and the Mansion",
  	log_tec_bandit_chief: "Skullface is somewhere in the neighboring provinces, we have to send our scouts and find him",
  	log_tec_banking: "Now we can build the Bank",
  	log_tec_barbarian_tribes: "Our scouts can now push further into the wastelands in search of even larger barbarian villages",
  	log_tec_biology: "Better than servitude?",
  	log_tec_breeding: "We can now train light cavalry, a good and fast assault unit. Now we can build Stable",
  	log_tec_bronze_working: "We can train spearmen and warriors, our army can both defend and attack effectively. Units enter battle in a set order , in front will be the tanks and general melee units to absorb the blows while the firing units will be behind the lines and the last to die. Now we can build Barracks",
  	log_tec_canava_mercenary: "Now we can recruit the Canava Guard, an elite mercenary troop from the nearby village",
  	log_tec_chemistry: "Chemistry in Theresmore is more a matter for alchemists. Now we can build Alchemical laboratory",
  	log_tec_cloistered_life: "We can now build the Monastery",
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
  	log_tec_espionage: "Now we can train spies, to get intel about our enemies",
  	log_tec_establish_boundaries: "As our city has expanded, we have realized that our borders are far from secure. Rumors of an approaching danger to the east are swirling among our scouts. We must be very careful",
  	log_tec_daylong_celebration: "You enter the square and are celebrated as a hero by all the residents, you have saved the settlement from certain death, and everyone will be eternally grateful. Your fame has increased, soon even the most distant peoples will know our deeds!",
  	log_tec_deserter_origin: "These deserters called themselves Sons of Atamar, we need to find out more with our scouts",
  	log_tec_exterminate_competition: "We are one step away from being the richest ever, let's raise our treasure again and no one will be able to hinder us anymore",
  	log_tec_fairs_and_markets: "Now we can build a Great Fair",
  	log_tec_feudalism: "Feudalism opened the door to a new concept of society, where the estates and fiefdoms of small and large lords prospered undisturbed. Now we can build the Fiefdom",
  	log_tec_financial_markets: "Now we can build the credit union and accumulate even more gold",
  	log_tec_field_artillery: "Now we can train cannons, who knows if they can shoot down giants as well?",
  	log_tec_flame_atamar: "Now we can choose what to do with the Flame: ATTENTION one choice will exclude the other!",
  	log_tec_flight: "Natronite-fueled hot air balloons will serve as lookouts",
  	log_tec_flintlock_musket: "We can now train line infantry",
  	log_tec_food_conservation: "We can now build the Grocery",
  	log_tec_fortification: "Now we can build Palisade and Wall",
  	log_tec_large_storage_space: "Now we can build the Large storehouse",
  	log_tec_large_defensive_project: "Now we can build the Great Bombard",
  	log_tec_library_of_souls: "The library has many missing but after some time of study it is easy to deduce that is a collection of unholy magic practices, those who learn such knowledge can offer up pieces of their soul to the well in exchange for freedom from their mortal shackles",
  	log_tec_lonely_druid: "This druid appeared out of nowhere in the city and professes harmony and love for the communion of humans with Theresmore. He is averse to modernity and indiscriminate exploitation of resources. His beliefs are rapidly proselytizing, and more and more people in town are going to listen to his words",
  	log_tec_long_expedition: "Now finally scouts will have new ways to die, what will they discover?",
  	log_tec_glorious_parade: "You are carried in triumph along the streets of the city in a great celebration that not even late at night intends to die down. From every corner of the neighboring provinces flock to the city to see the dragon exterminator! (Even if he was only put to flight at the moment)",
  	log_tec_glorious_retirement: "AH, a glorious retirement! the first prestige in Theresmore! Prestige is a key mechanic in Theresmore; it gives you bonuses that you could never get in other ways. It's always worth it",
  	log_tec_grain_surplus: "We can now build the Granary",
  	log_tec_guild: "A guild of explorers is now ready to lend its services",
  	log_tec_gunpowder: "We can train arquebusiers, together with our shock troops will dominate the battlefields",
  	log_tec_joyful_nation_1: "Each battle makes the triumph greater. Let us look to the sky and be aware that whatever difficulties Theresmore still has in store for us we can face and master them!",
  	log_tec_joyful_nation_2: "Each battle makes the triumph greater. Let us look to the sky and be aware that whatever difficulties Theresmore still has in store for us we can face and master them!",
  	log_tec_harbor_project: "Now we can build the Harbor district",
  	log_tec_herald_canava: "A laborer from the small border village, Canava, managed to get to the city. He brings with him alarming news of a goblin invasion from the east, the village of Canava has been destroyed. We must build some watchman outpost to survey the surroundings of the settlement",
  	log_tec_holy_fury: "We can now train Battle Angels, to release the holy fury on the battlefield",
  	log_tec_housing: "We can now build Common house",
  	log_tec_knighthood: "Knightly orders are the core of human nobility of Theresmore",
  	log_tec_kobold_nation: "Now we have to send our scouts to find the nation of Kobolds, but beware: I do not think they will be very friendly",
  	log_tec_iron_working: "We can now train heavy warriors",
  	log_tec_land_mine: "Let's undermine the territories around the city, let those damn goblins come back, pieces of wolfrider will fly everywhere",
  	log_tec_order_of_clerics: "With the construction of a few conclaves we will have access to higher spells",
  	log_tec_pentagram_tome: "The tome is written in a demonic language and the pentagram on the ground was used to subdue all those people in the village. We need to translate the tome; let's have our clergymen study it",
  	log_tec_necromancy: "The necromancer had drawn his power from some dark force, we must follow its trail with the scouts",
  	log_tec_northern_star: "The Northern Star is imprisoned among the eternal ice. A monolith as black as night capable of radiating immense power. Our scholars must understand its workings, and soon we will be able to harness its power",
  	log_tec_magic: "Now we can build the Magic circle",
  	log_tec_magic_arts_teaching: "Now we can build the Magical tower",
  	log_tec_mana_conveyors: "By creating some pillars of mana we will be able to channel the energy of Theresmore and use it for both scientific and religious purposes",
  	log_tec_mana_engine: "By combining saltpetre with mana our scholars can create natronite, it will have unexpected uses",
  	log_tec_mana_utilization: "We finish the third era by building a pit that can hold all the mana our sapients will need to discover fantastic new inventions",
  	log_tec_manufactures: "We can now create the builders' district to increase our wood and stone production",
  	log_tec_mathematic: "With the discovery of mathematics we begin to get serious about productions",
  	log_tec_mechanization: "With mechanization we can speed up all areas of our production. Now we can build the Industrial plant",
  	log_tec_mercenary_bands: "We can now recruit mercenary veterans",
  	log_tec_metal_casting: "Now we can build the Foundry",
  	log_tec_military_science: "We can now train bombard to dominate the battlefield. We can now build the Military academy",
  	log_tec_military_tactics: "Now we can build the Officers training ground and enlist the General",
  	log_tec_mining: "Now we can build the Mine",
  	log_tec_miracle_city: "Now we can build the Fountain of Prosperity, the druid has been miraculous for our city",
  	log_tec_monster_epuration: "Now we can build the Hall of heroic deeds!",
  	log_tec_monster_hunting: "There seem to be four legendary beasts: a gorgon, a five-headed hydra, a werewolf and a minotaur. By tracking them down and defeating them we can have fame and glory in abundance! Let our scouts set out on a quest!",
  	log_tec_monument_past: "Now we can build the Monument",
  	log_tec_mythology: "Now we can dedicate a shrine to our beliefs. Attention: only one shrine can be built",
  	log_tec_municipal_administration: "Now we can build the City Hall",
  	log_tec_natrocity: "Now we can build the City of Lights",
  	log_tec_natronite_storage: "Handle natronite with care. Now we can build Natronite depot",
  	log_tec_persuade_nobility: "We can now train cataphract",
  	log_tec_persuade_people: "We must find the Eternal Halls and defeat their guardians. Let us unleash our explorers.",
  	log_tec_plate_armor: "We can now recruit man at arms",
  	log_tec_plenty_valley: "Now we can build the Valley of plenty",
  	log_tec_pottery: "By working on the first pieces of craftsmanship, we can create tools. We can build the Artisan workshop",
  	log_tec_preparation_war: "Now we will be able to create natronite shields capable of strengthening our defenses",
  	log_tec_printing_press: "In some newly printed newspapers there is a discussion about some legendary beasts that would inhabit Theresmore. We need to look into this topic further",
  	log_tec_professional_soldier: "Now we can build the Recruit training center",
  	log_tec_rage_druid: "The Druid has cast off his mask of gentle holy man, his voice is somber and his eyes are as red as fire. He threatens the city and its citizens, speaks of an immense power that will soon come upon us and devour us. We must prepare for the worst",
  	log_tec_regional_markets: "From Canava and other nearby villages we can make several profits",
  	log_tec_religion: "By building a temple we will have access to prayers and spells",
  	log_tec_religious_orders: "Now we can build a Cathedral",
  	log_tec_research_district: "Now we can build the Research plant",
  	log_tec_remember_the_ancients: "We can now build a Library to hold the knowledge of past generations",
  	log_tec_safe_roads: "We can now build the tax revenue checkpoints",
  	log_tec_shores_theresmore: "We have identified a place far from the borders of other kingdoms where we can build a harbor, now we can research the Harbor Project",
  	log_tec_siege_techniques: "We can now train trebuchet",
  	log_tec_steeling: "A new resource made of other metals can now be produced and we can build the Steelworks",
  	log_tec_storage: "Now we can build the Store",
  	log_tec_storage_district: "Enough of these caps! Now we can build the Storage facility and the Large warehouse",
  	log_tec_storing_valuable_materials: "We can now build the Guarded warehouse",
  	log_tec_stone_masonry: "We can now build the Quarry",
  	log_tec_tamed_barbarian: "We must find out with our scouts more about these barbarians so that we can export our civilization to them!",
  	log_tec_the_scourge: "Refugees tell of entire villages burned by a flying monster, and all along the western border a mass of displaced people are coming toward the city",
  	log_tec_trail_blood: "We have a trail of blood. We still have to send our scouts to find the vampire",
  	log_tec_trail_power: "We have to win the approval of the kingdom, we can either persuade the nobility or win the hearts of the people. We choose carefully because one option EXCLUDES the other",
  	log_tec_training_militia: "We can now build the Castrum Militia",
  	log_tec_warfare: "The art of war will give rise to a great commander in our nation",
  	log_tec_white_t_company: "We can now train the White Company",
  	log_tec_wood_cutting: "We can now build Lumberjack camp",
  	log_tec_wood_saw: "We can now build the Sawmill",
  	log_tec_writing: "We can now build the School",
  	log_tec_underground_kobold_mission: "Now our scouts can find out what lies behind the kobold tunnels",
  	not_academy_of_freethinkers: "Freethinkers united",
  	not_academy_of_freethinkers_title: "Academy of Freethinkers",
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
  	not_harbor_district: "Seafaring",
  	not_harbor_district_title: "Harbor District",
  	not_persuade_nobility: "Paying bribes",
  	not_persuade_nobility_title: "Persuade the Nobility",
  	not_library_souls: "Forbidden knowledge",
  	not_library_souls_title: "Library of SouLs",
  	not_loved_people: "Acclaimed by the people",
  	not_loved_people_title: "Persuade the people",
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
  	not_5_artisan_workshop: "Shaping the pot",
  	not_5_artisan_workshop_title: "5 Artisan Workshop",
  	not_15_artisan_workshop: "Handicraft area",
  	not_15_artisan_workshop_title: "15 Artisan Workshop",
  	not_30_artisan_workshop: "Handicraft city",
  	not_30_artisan_workshop_title: "30 Artisan Workshop",
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
  	not_5_carpenter_workshop: "Building material",
  	not_5_carpenter_workshop_title: "5 Carpenter Workshop",
  	not_15_carpenter_workshop: "Building a city",
  	not_15_carpenter_workshop_title: "15 Carpenter Workshop",
  	not_cathedral: "A sacred place",
  	not_cathedral_title: "Build the Cathedral",
  	not_city_center: "We build better cities",
  	not_city_center_title: "Build the City Center",
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
  	not_5_large_warehouse: "Finally a little more space",
  	not_5_large_warehouse_title: "5 Large Storehouse",
  	not_15_large_warehouse: "Finally a lot more space",
  	not_15_large_warehouse_title: "15 Large Storehouse",
  	not_5_lumberjack_camp: "Tree after tree",
  	not_5_lumberjack_camp_title: "5 Lumberjack Camp",
  	not_15_lumberjack_camp: "Lumber Passion",
  	not_15_lumberjack_camp_title: "15 Lumberjack Camp",
  	not_30_lumberjack_camp: "Lumber dedication",
  	not_30_lumberjack_camp_title: "30 Lumberjack Camp",
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
  	not_5_quarry: "Increasing back pain",
  	not_5_quarry_title: "5 Quarry",
  	not_15_quarry: "Stone Squad",
  	not_15_quarry_title: "15 Quarry",
  	not_30_quarry: "Stone army",
  	not_30_quarry_title: "30 Quarry",
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
  	pop_farmer: "Farmer",
  	pop_lumberjack: "Lumberjack",
  	pop_merchant: "Merchant",
  	pop_trader: "Trader",
  	pop_miner: "Miner",
  	pop_quarryman: "Quarryman",
  	pop_priest: "Priest",
  	pop_carpenter: "Carpenter",
  	pop_steelworker: "Steelworker",
  	pop_professor: "Professor",
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
  	tec_alchemical_reactions: "Alchemical reactions",
  	tec_alchemical_reactions_description: "Through alchemy we will be able to further increase our productions",
  	tec_archery: "Archery",
  	tec_archery_description: "The bow will allow us to strike from a safe distance",
  	tec_architecture: "Architecture",
  	tec_architecture_description: "The Middle Ages gave impulse to our builders to realize great works",
  	tec_astronomy: "Astronomy",
  	tec_astronomy_description: "We must turn our gaze to the sky if we want to leave behind the feudal era",
  	tec_ancient_stockpile: "Ancient stockpile",
  	tec_ancient_stockpile_description: "Past generations have left us ancient warehouses",
  	tec_bandit_chief: "Bandit chief",
  	tec_bandit_chief_description: "One bandit questioned for information told us about a leader calling himself Skullface from whom they all took orders",
  	tec_banking: "Banking",
  	tec_banking_description: "What's mine is mine, what's yours is mine",
  	tec_barbarian_tribes: "Barbarian tribes",
  	tec_barbarian_tribes_description: "From the torture, err no, investigations carried out in the barbarian village we found out that their nation is divided into tribes",
  	tec_biology: "Biology",
  	tec_biology_description: "Theresmore's nature study applied to the lives of citizens",
  	tec_breeding: "Breeding",
  	tec_breeding_description: "We will have to breed the best horses in Theresmore",
  	tec_bronze_working: "Bronze working",
  	tec_bronze_working_description: "The Bronze Age, one of my favorite eras!",
  	tec_canava_mercenary: "Canava Guard",
  	tec_canava_mercenary_description: "Elite mercenary troops on our payroll",
  	tec_chemistry: "Chemistry",
  	tec_chemistry_description: "Chemistry is the art of studying Theresmore in its components",
  	tec_cloistered_life: "Cloistered life",
  	tec_cloistered_life_description: "The rise of monastic orders",
  	tec_craftsmen_guild: "Guild of the Craftsmen",
  	tec_craftsmen_guild_description: "With the craftsmen's guild we will be able to increase the production of Tier 2 resources!",
  	tec_crop_rotation: "Crop Rotation",
  	tec_crop_rotation_description: "Crop rotation is a fundamental process for keeping fields productive",
  	tec_crossbow: "Crossbow",
  	tec_crossbow_description: "More powerful than the bow is also much easier to use",
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
  	tec_forging_equipments: "Forge of equipments",
  	tec_forging_equipments_description: "Forge better equipments for the army",
  	tec_forging_equipments_II: "Forge of equipments II",
  	tec_forging_equipments_II_description: "Forge much better equipments for the army",
  	tec_fortification: "Fortification",
  	tec_fortification_description: "High walls to defend our settlement",
  	tec_fortune_sanctuary: "Fortune sanctuary",
  	tec_fortune_sanctuary_description: "We must build a place where the goddess of luck can infuse her power",
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
  	tec_heirloom_horseshoes_t: "Heirloom of the Horseshoes",
  	tec_heirloom_horseshoes_t_description: "Give us gold and workers",
  	tec_heirloom_housing: "Heirloom of the Housing",
  	tec_heirloom_housing_description: "Give us workers for our village",
  	tec_heirloom_momento_t: "Heirloom of the Momento",
  	tec_heirloom_momento_t_description: "Give us research and mana",
  	tec_herald_canava: "Canava herald",
  	tec_herald_canava_description: "The messenger from the Kingdom of Canava comes galloping into the city. This research will allow us to build watchman outposts, crucial to the advance into the new era",
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
  	tec_large_defensive_project: "Large defensive project",
  	tec_large_defensive_project_description: "At the military academy new projects are created for a super weapon capable of protecting our city",
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
  	tec_magic: "Magic",
  	tec_magic_description: "The Mana is the essence of Theresmore",
  	tec_magic_arts_teaching: "Magic arts teaching",
  	tec_magic_arts_teaching_description: "We study the magical arts in depth",
  	tec_mana_conveyors: "Mana conveyors",
  	tec_mana_conveyors_description: "With the right research we should be able to convey a lot of mana",
  	tec_mana_engine: "Mana engine",
  	tec_mana_engine_description: "Our scholars have in mind how to develop machinery capable of using mana",
  	tec_mana_utilization: "Mana utilization",
  	tec_mana_utilization_description: "Our researchers are discovering that with large amounts of mana we will be able to create new ways to change the lives of our citizens",
  	tec_manufactures: "Manufacture",
  	tec_manufactures_description: "Carvers and stonemasons create corporations in the city",
  	tec_master_craftsmen: "Master craftsmen",
  	tec_master_craftsmen_description: "True master craftsmen are emerging in the city",
  	tec_mathematic: "Mathematics",
  	tec_mathematic_description: "Two plus two is always four",
  	tec_mechanization: "Mechanization",
  	tec_mechanization_description: "We develop our civilization with new machinery",
  	tec_metal_casting: "Metal casting",
  	tec_metal_casting_description: "Metalworking is a fundamental process in developing our civilization",
  	tec_mercenary_bands: "Mercenary bands",
  	tec_mercenary_bands_description: "A convenient resource for kingdoms that abound in gold",
  	tec_military_tactics: "Military tactics",
  	tec_military_tactics_description: "New weapons appear on the battlefield, and we will use them to pulverize our enemies",
  	tec_moonlight_night: "A moonlight night",
  	tec_moonlight_night_description: "One night shortly after learning of the destruction of Canava the surroundings of our city became agitated, we may have to reinforce the defenses",
  	tec_military_science: "Military science",
  	tec_military_science_description: "Scientific innovation at the service of the army",
  	tec_mining: "Mining",
  	tec_mining_description: "Copper and iron will come in handy",
  	tec_mining_efficency: "Mining efficiency",
  	tec_mining_efficency_description: "Drums in the dark depths",
  	tec_miracle_city: "Miracle in the city",
  	tec_miracle_city_description: "Miraculous wonders are taking place in the city",
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
  	tec_northern_star: "Northern Star",
  	tec_northern_star_description: "The Nightdale Protectorate held the Northern Star, a very powerful artifact from the earliest days of Theresmore",
  	tec_order_of_clerics: "Order of clerics",
  	tec_order_of_clerics_description: "Half priests and half soldiers, they will serve the human cause in Theresmore",
  	tec_pentagram_tome: "Demoniac pentagram",
  	tec_pentagram_tome_description: "In the strange village we found a pentagram and a tome written in an obscure language. We must investigate",
  	tec_portal_of_the_dead: "Portal of the dead",
  	tec_portal_of_the_dead_description: "From a place long forgotten and sealed away. Beware the dead guard the passage. Beware",
  	tec_pottery: "Pottery",
  	tec_pottery_description: "Ceramics will allow us to preserve things and will favor the birth of commerce",
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
  	tec_research_district: "Research district",
  	tec_research_district_description: "Unveiling Theresmore is our goal",
  	tec_safe_roads: "Safe roads",
  	tec_safe_roads_description: "Now that we have secured the roads we can develop a gab system",
  	tec_scientific_theory: "Scientific Theory",
  	tec_scientific_theory_description: "The birth of the scientific method is the key to knowledge",
  	tec_scout_mission_east: "Scout Mission to the East",
  	tec_scout_mission_east_description: "Now that we have subdued the Wanders we can explore their lands freely",
  	tec_servitude: "Servitude",
  	tec_servitude_description: "I will serve you my master",
  	tec_shores_theresmore: "Shores of Theresmore",
  	tec_shores_theresmore_description: "Far from our current borders there is access to a great sea, we must explore those places",
  	tec_siege_defense_weapons: "Siege defense weapons",
  	tec_siege_defense_weapons_description: "Arm our walls with ballistae to repel enemy attacks",
  	tec_siege_techniques: "Siege techniques",
  	tec_siege_techniques_description: "We will be able to create more powerful siege machines than catapults",
  	tec_steeling: "Steeling",
  	tec_steeling_description: "With steel we can raise our military level to new heights",
  	tec_stone_extraction_tools: "Stone extraction tools",
  	tec_stone_extraction_tools_description: "New stone extraction and processing techniques",
  	tec_stone_masonry: "Stone masonry",
  	tec_stone_masonry_description: "The quarry is not a place for weak arms",
  	tec_storage: "Storage",
  	tec_storage_description: "We need more and more material!",
  	tec_storage_district: "Storage district",
  	tec_storage_district_description: "We always need more space",
  	tec_storing_valuable_materials: "Storing valuable materials",
  	tec_storing_valuable_materials_description: "We need to create a guarded place to store our valuable materials",
  	tec_persuade_nobility: "Persuade the nobility",
  	tec_persuade_nobility_description: "Persuading the nobility will require a large amount of gold but will allow us to train the powerful knights of the west",
  	tec_persuade_people: "Persuade the people",
  	tec_persuade_people_description: "In order to break through to people's hearts, we must make a heroic gesture. Only by defeating a fearsome enemy will they consider us worthy",
  	tec_plenty_valley: "Plenty valley",
  	tec_plenty_valley_description: "Our lands generate an abundance that should not be wasted",
  	tec_tamed_barbarian: "Tamed Barbarian",
  	tec_tamed_barbarian_description: "In the barbarian camp we just defeated, we tamed some of them to obey us. We have to find out more about these people",
  	tec_the_scourge: "The scourge",
  	tec_the_scourge_description: "Some groups of refugees are asking to enter the city, something seems to have happened along the western borders",
  	tec_the_vault: "The vault",
  	tec_the_vault_description: "In order to start our world economic domination we need to hoard huge amounts of gold",
  	tec_theresmore_richest_nation: "Richest nation",
  	tec_theresmore_richest_nation_description: "We finally made it, we are the richest nation in all of Theresmore",
  	tec_underground_kobold_mission: "Underground mission",
  	tec_underground_kobold_mission_description: "The tunnels of the kobolds branch off in several directions, we must explore them",
  	tec_trail_blood: "Trail of blood",
  	tec_trail_blood_description: "The vampire crypt contained no coffin, we must look elsewhere",
  	tec_trail_power: "Trail of power",
  	tec_trail_power_description: "The Western Kingdom is conquered but its people are hostile to us. We have to come up with something",
  	tec_training_militia: "Training militia",
  	tec_training_militia_description: "We have seen how ruthless Theresmore can be, we must create a militia force",
  	tec_warfare: "Warfare",
  	tec_warfare_description: "Appear weak when you are strong, and strong when you are weak",
  	tec_white_t_company: "White Company",
  	tec_white_t_company_description: "The famous White Company is ready to lend its services",
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
  	uni_eternal_guardian: "Eternal guardian",
  	uni_eternal_guardian_plural: "Eternal guardians",
  	uni_harpy: "Harpy",
  	uni_harpy_description: "Harpies bewitch humans with their song and devour wretches who get too close",
  	uni_harpy_plural: "Harpies",
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
  	uni_explorer: "Explorer",
  	uni_explorer_description: "A seasoned scout",
  	uni_explorer_plural: "Explorers",
  	uni_fallen_angel: "Fallen Angel",
  	uni_fallen_angel_plural: "Fallen Angels",
  	uni_fire_elemental: "Fire elemental",
  	uni_fire_elemental_description: "Its breath is fiery and leaves behind lava pools",
  	uni_fire_elemental_plural: "Fire elementals",
  	uni_frost_elemental: "Frost elemental",
  	uni_frost_elemental_description: "The frost elemental generates an aura of ice around itself",
  	uni_frost_elemental_plural: "Frost elementals",
  	uni_frost_giant: "Frost giant",
  	uni_frost_giant_plural: "Frost giants",
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
  	uni_korrigan_slinger: "Korrigan slinger",
  	uni_korrigan_slinger_plural: "Korrigan slingers",
  	uni_korrigan_swindler: "Korrigan swindler",
  	uni_korrigan_swindler_plural: "Korrigan swindlers",
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
  	uni_red_dragon: "Red Dragon",
  	uni_red_dragon_plural: "Red Dragons",
  	uni_sacred_golem: "Sacred Golem",
  	uni_sacred_golem_description: "A powerful stone warrior animated with magic",
  	uni_sacred_golem_plural: "Sacred Golems",
  	uni_scout: "Scout",
  	uni_scout_description: "The Recon Squad is our family",
  	uni_scout_plural: "Scouts",
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
  	uni_snake: "Snake",
  	uni_snake_description: "A poisonous snake",
  	uni_snake_plural: "Snakes",
  	uni_spearman: "Spearman",
  	uni_spearman_description: "The cheap front line of any deployment. It has a good defense",
  	uni_spearman_plural: "Spearmen",
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
  	uni_warrior: "Warrior",
  	uni_warrior_description: "Simple unit of the ancient era",
  	uni_warrior_plural: "Warriors",
  	uni_warrior_monk: "Monk",
  	uni_warrior_monk_description: "Disciplined and fearsome in battle",
  	uni_warrior_monk_plural: "Monks",
  	uni_werewolf: "Werewolf",
  	uni_werewolf_plural: "Werewolfs",
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
  	uni_trebuchet: "Trebuchet",
  	uni_trebuchet_description: "With the evolution of ballistics, we can deploy trebuchets. They have a very good offense",
  	uni_trebuchet_plural: "Trebuchets",
  	uni_troll_battle: "Battle Troll",
  	uni_troll_battle_plural: "Battle Trolls",
  	uni_troll_cave: "Cave Troll",
  	uni_troll_cave_description: "Big and dumb, live in caves that they occupy as their dens. Their huge clubs can crush a man with a single blow",
  	uni_troll_cave_plural: "Cave Trolls",
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
  var localStorage = {
    get: get$1,
    set
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
    await sleep(2000);
    if (switchedPage) {
      logger({
        msgLevel: 'debug',
        msg: `Switched page to ${page}`
      });
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
      await sleep(2000);
      if (switchedSubPage) {
        logger({
          msgLevel: 'debug',
          msg: `Switched subPage to ${subPage}`
        });
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
  const getAllButtons$2 = (activeOnly = true) => {
    const activeOnlySelector = activeOnly ? ':not(.btn-off)' : '';
    return [...getActivePageContent().querySelectorAll(`button.btn${activeOnlySelector}`)];
  };
  var selectors = {
    getActivePageContent,
    getAllButtons: getAllButtons$2
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

  const state = {
    scriptPaused: true,
    lastVisited: {
      [CONSTANTS.PAGES.BUILD]: 0,
      [CONSTANTS.PAGES.RESEARCH]: 0,
      [CONSTANTS.PAGES.POPULATION]: 0,
      [CONSTANTS.PAGES.ARMY]: 0,
      [CONSTANTS.PAGES.MARKETPLACE]: 0
    },
    buildings: [],
    options: {
      pages: {
        [CONSTANTS.PAGES.BUILD]: true,
        [CONSTANTS.PAGES.RESEARCH]: true,
        [CONSTANTS.PAGES.POPULATION]: true,
        [CONSTANTS.PAGES.ARMY]: false,
        [CONSTANTS.PAGES.MARKETPLACE]: true
      },
      [CONSTANTS.PAGES.BUILD]: {},
      [CONSTANTS.PAGES.RESEARCH]: {},
      [CONSTANTS.PAGES.POPULATION]: {},
      [CONSTANTS.PAGES.ARMY]: {},
      [CONSTANTS.PAGES.MARKETPLACE]: {},
      automation: {}
    }
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

  const timeToWaitUntilFullResource = 60;
  const hasBA = () => {
    const leg = window.localStorage.getItem('leg');
    if (leg) {
      return !!JSON.parse(leg).find(legacy => legacy.id === 'angel');
    }
    return false;
  };
  const canAffordBA = () => {
    const faith = resources.get('Faith');
    const mana = resources.get('Mana');
    if (faith && mana) {
      if (faith.current >= 2000 && mana.current >= 600) {
        return true;
      }
    }
    return false;
  };
  const shouldBuyBA = () => {
    const faith = resources.get('Faith');
    const mana = resources.get('Mana');
    if (faith && mana) {
      if (faith.current + faith.speed * timeToWaitUntilFullResource >= faith.max && mana.current + mana.speed * timeToWaitUntilFullResource >= mana.max && mana.speed > 20) {
        return true;
      }
    }
    return false;
  };
  const userEnabled$4 = () => {
    return state.options.pages[CONSTANTS.PAGES.ARMY] || false;
  };
  const doArmyWork = async () => {
    if (hasBA() && canAffordBA() && shouldBuyBA()) {
      const allButtons = [...document.querySelectorAll('div > div > div > div > div > span > button:not(.btn-off)')];
      const buyBAButton = allButtons.find(button => button.innerText.includes('Battle Angel'));
      if (buyBAButton) {
        buyBAButton.click();
        logger({
          msgLevel: 'log',
          msg: `Buying Battle Angel(s)`
        });
        await sleep(4000);
        if (!navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.ARMY)) return;
      }
    }
  };
  var army = {
    id: CONSTANTS.PAGES.ARMY,
    enabled: () => userEnabled$4() && navigation.hasPage(CONSTANTS.PAGES.ARMY) && hasBA() && canAffordBA() && shouldBuyBA() && state.lastVisited[CONSTANTS.PAGES.ARMY] + 2 * 60 * 1000 < new Date().getTime(),
    action: async () => {
      await navigation.switchSubPage(CONSTANTS.SUBPAGES.ARMY, CONSTANTS.PAGES.ARMY);
      if (navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.ARMY)) await doArmyWork();
    }
  };

  const getBuildingsList = () => {
    if (Object.keys(state.options[CONSTANTS.PAGES.BUILD]).length) {
      let buildingsList = Object.keys(state.options[CONSTANTS.PAGES.BUILD]).filter(key => !key.includes('prio_')).filter(key => !!state.options[CONSTANTS.PAGES.BUILD][key]).filter(key => !!state.options[CONSTANTS.PAGES.BUILD][`prio_${key}`]).map(key => {
        const building = {
          key: key,
          id: translate(key, 'bui_'),
          max: state.options[CONSTANTS.PAGES.BUILD][key] === -1 ? 999 : state.options[CONSTANTS.PAGES.BUILD][key],
          prio: state.options[CONSTANTS.PAGES.BUILD][`prio_${key}`],
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
  const userEnabled$3 = () => {
    return state.options.pages[CONSTANTS.PAGES.BUILD] || false;
  };
  const getAllButtons$1 = () => {
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
      if (state.options.automation.prioWonders) {
        if (a.building.cat !== b.building.cat) {
          if (a.building.cat === 'wonders') {
            return -1;
          }
          if (b.building.cat === 'wonders') {
            return 1;
          }
        }
      }
      if (a.building.prio !== b.building.prio) {
        return b.building.prio - a.building.prio;
      }
      return a.count - b.count;
    });
    return buttons;
  };
  const doBuildWork = async () => {
    let buttons = getAllButtons$1();
    if (buttons.length) {
      while (!state.scriptPaused && buttons.length) {
        let shouldBuild = true;
        const button = buttons.shift();
        if (!button.building.isSafe && button.building.requires.length) {
          shouldBuild = !button.building.requires.find(req => !resources.get(req.resource) || resources.get(req.resource)[req.parameter] <= req.minValue);
        }
        if (shouldBuild) {
          button.element.click();
          logger({
            msgLevel: 'log',
            msg: `Building ${button.building.id}`
          });
          await sleep(4000);
          if (!navigation.checkPage(CONSTANTS.PAGES.BUILD)) return;
          buttons = getAllButtons$1();
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
  var build = {
    id: CONSTANTS.PAGES.BUILD,
    enabled: () => userEnabled$3() && navigation.hasPage(CONSTANTS.PAGES.BUILD) && getBuildingsList().length,
    action: async () => {
      await navigation.switchPage(CONSTANTS.PAGES.BUILD);
      if (navigation.checkPage(CONSTANTS.PAGES.BUILD)) await doBuildWork();
    }
  };

  const resourcesToTrade = ['Cow', 'Horse', 'Food', 'Copper', 'Wood', 'Stone', 'Iron', 'Tools'];
  const timeToFillResource = 90;
  const timeToWaitUntilFullGold = 60;
  const secondsBetweenSells = 90;
  const getTimeToFillResource = () => {
    return state.options[CONSTANTS.PAGES.MARKETPLACE].timeToFillResource || timeToFillResource;
  };
  const getTimeToWaitUntilFullGold = () => {
    return state.options[CONSTANTS.PAGES.MARKETPLACE].timeToWaitUntilFullGold || timeToWaitUntilFullGold;
  };
  const getSecondsBetweenSells = () => {
    return state.options[CONSTANTS.PAGES.MARKETPLACE].secondsBetweenSells || secondsBetweenSells;
  };
  const getResourcesToTrade = () => {
    const userResourcesToTrade = Object.keys(state.options[CONSTANTS.PAGES.MARKETPLACE]).filter(key => key.includes('resource_') && state.options[CONSTANTS.PAGES.MARKETPLACE][key]).map(key => translate(key.replace('resource_', '')));
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
  const userEnabled$2 = () => {
    return state.options.pages[CONSTANTS.PAGES.MARKETPLACE] || false;
  };
  const doMarketWork = async () => {
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
          await sleep(1);
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
  var marketplace = {
    id: CONSTANTS.PAGES.MARKETPLACE,
    enabled: () => userEnabled$2() && navigation.hasPage(CONSTANTS.PAGES.MARKETPLACE) && hasNotEnoughGold() && shouldSell(),
    action: async () => {
      await navigation.switchPage(CONSTANTS.PAGES.MARKETPLACE);
      if (navigation.checkPage(CONSTANTS.PAGES.MARKETPLACE)) await doMarketWork();
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
  const userEnabled$1 = () => {
    return state.options.pages[CONSTANTS.PAGES.POPULATION] || false;
  };
  let allowedJobs;
  const getAllJobs = () => {
    if (Object.keys(state.options[CONSTANTS.PAGES.POPULATION]).length) {
      let allowedJobs = Object.keys(state.options[CONSTANTS.PAGES.POPULATION]).filter(key => !key.includes('prio_')).filter(key => !!state.options[CONSTANTS.PAGES.POPULATION][key]).filter(key => !!state.options[CONSTANTS.PAGES.POPULATION][`prio_${key}`]).map(key => {
        const jobData = allJobs.find(job => job.key === key) || {};
        const job = {
          ...jobData,
          max: state.options[CONSTANTS.PAGES.POPULATION][key] === -1 ? 999 : state.options[CONSTANTS.PAGES.POPULATION][key],
          prio: state.options[CONSTANTS.PAGES.POPULATION][`prio_${key}`]
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
  const doPopulationWork = async () => {
    allowedJobs = getAllJobs();
    const shouldRebalance = !state.lastVisited.populationRebalance || state.lastVisited.populationRebalance + 5 * 60 * 1000 < new Date().getTime();
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
      const minimumFood = state.options.automation.minimumFood || 0;
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
              } else {
                const job = availableJobs.shift();
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
  var population = {
    id: CONSTANTS.PAGES.POPULATION,
    enabled: () => userEnabled$1() && navigation.hasPage(CONSTANTS.PAGES.POPULATION) && hasUnassignedPopulation() && getAllJobs().length,
    action: async () => {
      await navigation.switchPage(CONSTANTS.PAGES.POPULATION);
      if (navigation.checkPage(CONSTANTS.PAGES.POPULATION)) await doPopulationWork();
      await sleep(5000);
    }
  };

  const userEnabled = () => {
    return state.options.pages[CONSTANTS.PAGES.RESEARCH] || false;
  };
  const getAllowedResearch = () => {
    if (Object.keys(state.options[CONSTANTS.PAGES.RESEARCH]).length) {
      let allowedResearch = Object.keys(state.options[CONSTANTS.PAGES.RESEARCH]).filter(key => !!state.options[CONSTANTS.PAGES.RESEARCH][key]).map(key => {
        const research = {
          key: key,
          id: translate(key, 'tec_'),
          prio: state.options[CONSTANTS.PAGES.RESEARCH][key]
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
  const getAllButtons = () => {
    const allowedResearch = getAllowedResearch();
    const buttonsList = selectors.getAllButtons(true).filter(button => !!allowedResearch.find(tech => tech.id === button.innerText.split('\n').shift().trim())).sort((a, b) => {
      return allowedResearch.find(tech => tech.id === b.innerText.split('\n').shift().trim()).prio - allowedResearch.find(tech => tech.id === a.innerText.split('\n').shift().trim()).prio;
    });
    return buttonsList;
  };
  const doResearchWork = async () => {
    const allowedResearch = getAllowedResearch();
    let buttonsList = getAllButtons();
    if (buttonsList.length) {
      while (!state.scriptPaused && buttonsList.length) {
        const button = buttonsList.shift();
        button.click();
        logger({
          msgLevel: 'log',
          msg: `Researching ${button.innerText.split('\n').shift()}`
        });
        if (allowedResearch.find(tech => tech.id === button.innerText.split('\n').shift().trim()).confirm) {
          await sleep(1000);
          if (!navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) return;
          const redConfirmButton = [...document.querySelectorAll('.btn.btn-red')].find(button => button.innerText.includes('Confirm'));
          if (redConfirmButton) {
            redConfirmButton.click();
            await sleep(4000);
            if (!navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) return;
          }
        }
        await sleep(4000);
        if (!navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) return;
        buttonsList = getAllButtons();
      }
    }
  };
  var research = {
    id: CONSTANTS.PAGES.RESEARCH,
    enabled: () => userEnabled() && navigation.hasPage(CONSTANTS.PAGES.RESEARCH) && getAllowedResearch().length,
    action: async () => {
      await navigation.switchSubPage(CONSTANTS.SUBPAGES.RESEARCH, CONSTANTS.PAGES.RESEARCH);
      if (navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) await doResearchWork();
    }
  };

  var pages = {
    army,
    build,
    marketplace,
    population,
    research
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

  let haveManualResourceButtons = true;
  const autoClicker = async () => {
    if (!haveManualResourceButtons) return;
    if (state.scriptPaused) return;
    const manualResources = ['Food', 'Wood', 'Stone'];
    while (!state.scriptPaused && haveManualResourceButtons) {
      const buttons = [...document.querySelectorAll('#root > div.flex.flex-wrap.w-full.mx-auto.p-2 > div.w-full.lg\\:pl-2 > div > div.order-2.flex.flex-wrap.gap-3 > button')];
      if (!buttons.length) {
        haveManualResourceButtons = false;
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
    if (!state.options.automation.ancestor) return;
    let ancestorToSelect = Object.keys(state.options.automation).filter(key => key.includes('selected_ancestor_') && state.options.automation[key]).map(key => translate(key.replace('selected_', '')));
    ancestorToSelect = ancestorToSelect.length > 0 ? ancestorToSelect.shift() : defaultAncestor;
    const ancestorPage = document.querySelector('#root > div.mt-6.lg\\:mt-12.xl\\:mt-24.\\32 xl\\:mt-12.\\34 xl\\:mt-24 > div > div.text-center > p.mt-6.lg\\:mt-8.text-lg.lg\\:text-xl.text-gray-500.dark\\:text-gray-400');
    if (ancestorPage) {
      let ancestor = [...document.querySelectorAll('button.btn')].find(button => button.parentElement.innerText.includes(ancestorToSelect));
      if (!ancestor) {
        ancestor = [...document.querySelectorAll('button.btn')].find(button => button.parentElement.innerText.includes(defaultAncestor));
      }
      if (ancestor) {
        ancestor.click();
        await sleep(5000);
      }
    }
  };

  const autoPrestige = async () => {
    if (!state.options.automation.prestige) return;
    let prestigeButton = [...document.querySelectorAll('.btn.btn-red')].find(button => button.innerText.includes('Prestige'));
    if (prestigeButton) {
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
  const id$1 = 'theresmore-automation-options-panel';
  let start$1;
  const building_cats = ['living_quarters', 'resource', 'science', 'commercial_area', 'defense', 'faith', 'warehouse', 'wonders'];
  const generatePrioritySelect = (key, id) => {
    const defaultOptions = [{
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
    const selectedOption = state.options[key][id] && parseInt(state.options[key][id], 10) === state.options[key][id] ? state.options[key][id] : 0;
    defaultOptions.forEach(option => {
      options.push(`<option value="${option.value}" ${option.value === selectedOption ? 'selected="selected"' : ''}>${option.key}</option>`);
    });
    return `<select class="option dark:bg-mydark-200" data-id="${key}-${id}">${options.join('')}</select>`;
  };
  const createPanel$1 = startFunction => {
    start$1 = startFunction;
    const saveTextarea = document.createElement('textarea');
    saveTextarea.id = `${id$1}-save`;
    saveTextarea.style.position = 'absolute';
    saveTextarea.style.top = '-1000px';
    saveTextarea.style.left = '-1000px';
    saveTextarea.style.width = '1px';
    saveTextarea.style.height = '1px';
    document.querySelector('div#root').insertAdjacentElement('afterend', saveTextarea);
    const panelElement = document.createElement('div');
    panelElement.id = id$1;
    panelElement.style.position = 'fixed';
    panelElement.style.top = '0';
    panelElement.style.left = '0';
    panelElement.style.zIndex = '9999999999';
    panelElement.style.padding = '20px';
    panelElement.style.height = '100vh';
    panelElement.style.width = '100vw';
    panelElement.style.display = 'none';
    panelElement.style.backdropFilter = 'blur(10px)';
    const innerPanelElement = document.createElement('div');
    innerPanelElement.classList.add('dark');
    innerPanelElement.classList.add('dark:bg-mydark-300');
    innerPanelElement.style.position = 'relative';
    innerPanelElement.style.height = '100%';
    innerPanelElement.style.width = '100%';
    innerPanelElement.style.padding = '10px';
    innerPanelElement.style.border = '1px black solid';
    innerPanelElement.style.overflowY = 'auto';
    innerPanelElement.style.overflowX = 'none';
    innerPanelElement.innerHTML = `
    <p class="mb-2">
      <h2 class="text-xl">Theresmore Automation Options:</h2>

      <div class="mb-6">
        <h3 class="text-lg">Build:</h3>
        <p class="mb-2">Max values: -1 -> build unlimited; 0 -> do not build;</p>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="pages-${CONSTANTS.PAGES.BUILD}" class="option" ${state.options.pages[CONSTANTS.PAGES.BUILD] ? 'checked="checked"' : ''} /></label></div>

  ${building_cats.map(cat => `
    <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
      <div class="w-full pb-3 font-bold text-center xl:text-left">${translate(cat)}</div>
      <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
        ${buildings.filter(building => building.cat === cat).map(building => {
    return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(building.id)}</span><br/>
            Max: <input type="number" data-id="${CONSTANTS.PAGES.BUILD}-${building.id}" class="option text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200" value="${state.options[CONSTANTS.PAGES.BUILD][building.id] ? state.options[CONSTANTS.PAGES.BUILD][building.id] : '0'}" min="-1" max="${building.cap ? building.cap : 999}" step="1" /><br />
            Prio: ${generatePrioritySelect(CONSTANTS.PAGES.BUILD, `prio_${building.id}`)}</label></div>`;
  }).join('')}
      </div>
    </div>
  `).join('')}

        <div class="mb-2"><label>Prioritize Wonders: <input type="checkbox" data-id="automation-prioWonders" class="option" ${state.options.automation.prioWonders ? 'checked="checked"' : ''} /></label></div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Research:</h3>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="pages-${CONSTANTS.PAGES.RESEARCH}" class="option" ${state.options.pages[CONSTANTS.PAGES.RESEARCH] ? 'checked="checked"' : ''} /></label></div>

        <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
          <div class="w-full pb-3 font-bold text-center xl:text-left">Regular researches:</div>
          <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
            ${tech.filter(technology => !technology.confirm).map(technology => {
    return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(technology.id, 'tec_')}</span><br />
                Prio: ${generatePrioritySelect(CONSTANTS.PAGES.RESEARCH, technology.id)}</label></div>`;
  }).join('')}
          </div>
        </div>

        <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
          <div class="w-full pb-3 font-bold text-center xl:text-left">Dangerous researches (requiring confirmation):</div>
          <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
            ${tech.filter(technology => technology.confirm).map(technology => {
    return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(technology.id, 'tec_')}</span><br />
                Prio: ${generatePrioritySelect(CONSTANTS.PAGES.RESEARCH, technology.id)}</label></div>`;
  }).join('')}
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Marketplace:</h3>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="pages-${CONSTANTS.PAGES.MARKETPLACE}" class="option" ${state.options.pages[CONSTANTS.PAGES.MARKETPLACE] ? 'checked="checked"' : ''} /></label></div>
        <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
          ${['cow', 'horse', 'food', 'copper', 'wood', 'stone', 'iron', 'tools'].map(res => {
    return `<div class="flex flex-col mb-2"><label><input type="checkbox" data-id="${CONSTANTS.PAGES.MARKETPLACE}-resource_${res}" class="option" ${state.options[CONSTANTS.PAGES.MARKETPLACE][`resource_${res}`] ? 'checked="checked"' : ''} /> Sell ${translate(res, 'res_')}</label></div>`;
  }).join('')}
        </div>
        <div>Don't sell if max gold can be reached in <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200" data-id="${CONSTANTS.PAGES.MARKETPLACE}-timeToWaitUntilFullGold" value="${state.options[CONSTANTS.PAGES.MARKETPLACE].timeToWaitUntilFullGold ? state.options[CONSTANTS.PAGES.MARKETPLACE].timeToWaitUntilFullGold : '60'}" /> seconds</div>
  <div>Sell the same resource at most every <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200" data-id="${CONSTANTS.PAGES.MARKETPLACE}-secondsBetweenSells" value="${state.options[CONSTANTS.PAGES.MARKETPLACE].secondsBetweenSells ? state.options[CONSTANTS.PAGES.MARKETPLACE].secondsBetweenSells : '90'}" /> seconds</div>
  <div>Sell the resource if it can be refilled in at most <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200" data-id="${CONSTANTS.PAGES.MARKETPLACE}-timeToFillResource" value="${state.options[CONSTANTS.PAGES.MARKETPLACE].timeToFillResource ? state.options[CONSTANTS.PAGES.MARKETPLACE].timeToFillResource : '90'}" /> seconds</div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Population:</h3>
        <p class="mb-2">Max values: -1 -> hire unlimited; 0 -> do not hire;</p>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="pages-${CONSTANTS.PAGES.POPULATION}" class="option" ${state.options.pages[CONSTANTS.PAGES.POPULATION] ? 'checked="checked"' : ''} /></label></div>

        <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600 mb-2">
          <div class="w-full pb-3 font-bold text-center xl:text-left">Hire:</div>
          <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
            ${jobs.filter(job => job.gen).map(job => {
    return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(job.id, 'pop_')}</span><br />
                Max: <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200" data-id="${CONSTANTS.PAGES.POPULATION}-${job.id}" value="${state.options[CONSTANTS.PAGES.POPULATION][job.id] ? state.options[CONSTANTS.PAGES.POPULATION][job.id] : '0'}" min="-1" max="999" step="1" /><br />
                Prio: ${generatePrioritySelect(CONSTANTS.PAGES.POPULATION, `prio_${job.id}`)}</label></div>`;
  }).join('')}
          </div>
        </div>

        <div class="mb-2"><label>Minimum Food production to aim for: <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200" data-id="automation-minimumFood" value="${state.options.automation.minimumFood ? state.options.automation.minimumFood : '1'}" min="0" max="999999" step="1" /></label></div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Army:</h3>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="pages-${CONSTANTS.PAGES.ARMY}" class="option" ${state.options.pages[CONSTANTS.PAGES.ARMY] ? 'checked="checked"' : ''} /></label></div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Auto-ancestor:</h3>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="automation-ancestor" class="option" ${state.options.automation.ancestor ? 'checked="checked"' : ''} /></label></div>

        <div class="mb-2">
          Ancestor to pick:
        </div>
        <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
          ${['ancestor_farmer', 'ancestor_believer', 'ancestor_forager', 'ancestor_gatherer', 'ancestor_miner', 'ancestor_researcher', 'ancestor_spellcrafter', 'ancestor_trader', 'ancestor_warrior'].map(ancestor => {
    return `<div class="flex flex-col mb-2"><label><input type="radio" name="automation-selected_ancestor" data-id="automation-selected_${ancestor}" class="option" ${state.options.automation[`selected_${ancestor}`] ? 'checked="checked"' : ''} /> ${translate(ancestor)}</label></div>`;
  }).join('')}
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Auto-prestige:</h3>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="automation-prestige" class="option" ${state.options.automation.prestige ? 'checked="checked"' : ''} /></label></div>
      </div>

      <div class="mb-2">
        <button id="saveOptions" type="button" class="btn btn-green w-min px-4 mr-2">Save options</button>
        <button id="exportOptions" type="button" class="btn btn-blue w-min px-4 mr-2">Export options</button>
        <button id="importOptions" type="button" class="btn btn-blue w-min px-4 mr-2">Import options</button>
      </div>
    </p>
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
  };
  const updatePanel$1 = () => {};
  let previousScriptState = state.scriptPaused;
  const togglePanel = () => {
    const panelElement = document.querySelector(`div#${id$1}`);
    if (panelElement.style.display === 'none') {
      previousScriptState = state.scriptPaused;
      state.scriptPaused = true;
      panelElement.style.display = 'block';
    } else {
      state.scriptPaused = previousScriptState;
      panelElement.style.display = 'none';
    }
    start$1();
  };
  const saveOptions = () => {
    const options = [...document.querySelector(`div#${id$1}`).querySelectorAll('.option')];
    options.forEach(option => {
      if (option.type === 'checkbox' || option.type === 'radio') {
        const ids = option.dataset.id.split('-');
        state.options[ids[0]][ids[1]] = option.checked;
      } else if (option.type === 'number') {
        const ids = option.dataset.id.split('-');
        state.options[ids[0]][ids[1]] = Math.round(Number(option.value));
      } else if (option.type === 'select-one') {
        const ids = option.dataset.id.split('-');
        state.options[ids[0]][ids[1]] = parseInt(option.value, 10);
      } else {
        console.log('Unhandled', option);
        console.log(option.dataset.id.split('-'));
        console.log(option.type);
        console.log(typeof option.value, option.value);
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
      localStorage.set('options', saveData);
      location.reload();
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
    controlPanelElement.style.position = 'fixed';
    controlPanelElement.style.bottom = '10px';
    controlPanelElement.style.left = '10px';
    controlPanelElement.style.zIndex = '99999999';
    controlPanelElement.style.border = '1px black solid';
    controlPanelElement.style.padding = '10px';
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

  const hideFullPageOverlay = () => {
    if (!state.scriptPaused) {
      const fullPageOverlay = document.querySelector('div.modal-container > div.absolute.top-0.right-0.z-20.pt-4.pr-4 > button');
      if (fullPageOverlay && fullPageOverlay.innerText.includes('Close')) {
        fullPageOverlay.click();
      }
    }
  };

  var tasks = {
    calculateTippyTTF,
    calculateTTF,
    autoClicker,
    autoAncestor,
    autoPrestige,
    managePanel,
    manageOptions,
    hideFullPageOverlay
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
      await tasks.autoPrestige();
      await tasks.autoAncestor();
      const pagesToCheck = Object.keys(pages);
      pagesToCheck.sort((a, b) => {
        return state.lastVisited[pages[a].id] - state.lastVisited[pages[b].id];
      });
      while (!state.scriptPaused && pagesToCheck.length) {
        const pageToCheck = pagesToCheck.shift();
        if (pages[pageToCheck] && pages[pageToCheck].enabled()) {
          const page = pages[pageToCheck];
          if (page) {
            logger({
              msgLevel: 'debug',
              msg: `Executing ${page.id} action`
            });
            state.lastVisited[page.id] = new Date().getTime();
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
    tasks.managePanel.createPanel(switchScriptState);
    tasks.manageOptions.createPanel(start);
    tasks.managePanel.updatePanel();
    setInterval(tasks.calculateTTF, 100);
    setInterval(tasks.calculateTippyTTF, 100);
    start();
  };
  const start = async () => {
    document.querySelector('html').classList.add('dark');
    tasks.managePanel.updatePanel();
    if (!state.scriptPaused) {
      logger({
        msgLevel: 'log',
        msg: 'Starting automation'
      });
      if (!hideFullPageOverlayInterval) {
        hideFullPageOverlayInterval = setInterval(tasks.hideFullPageOverlay, 100);
      }
      await sleep(2000);
      tasks.autoClicker();
      mainLoop();
    } else {
      clearInterval(hideFullPageOverlayInterval);
      hideFullPageOverlayInterval = null;
    }
  };
  init();

})();
