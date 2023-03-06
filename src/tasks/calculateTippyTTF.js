import { numberParser, formatTime, resources, reactUtil, keyGen, CONSTANTS } from '../utils'
import { buildings, tech, spells, units, factions } from '../data'

const calculateTippyTTF = () => {
  let potentialResourcesToFillTable = document.querySelectorAll('div.tippy-box > div.tippy-content > div > div > table')
  if (potentialResourcesToFillTable.length) {
    potentialResourcesToFillTable = potentialResourcesToFillTable[0]
    const rows = potentialResourcesToFillTable.querySelectorAll('tr')
    rows.forEach((row) => {
      const cells = row.querySelectorAll('td')
      let reqKey = reactUtil.getNearestKey(cells[0], 1)
      if (!keyGen.tooltipReq.check(reqKey)) {
        return
      }

	  reqKey = keyGen.tooltipReq.id(reqKey)
	  
	  let dataList;
	  let dataId;
	  let reqField = "req"
	  if (reqKey.startsWith(CONSTANTS.TOOLTIP_PREFIX.BUILDING)) {
		dataList = buildings;
		dataId = reqKey.replace(CONSTANTS.TOOLTIP_PREFIX.BUILDING, "");
	  } else if (reqKey.startsWith(CONSTANTS.TOOLTIP_PREFIX.TECH)) {
		dataList = tech;
		dataId = reqKey.replace(CONSTANTS.TOOLTIP_PREFIX.TECH, "");
	  } else if (reqKey.startsWith(CONSTANTS.TOOLTIP_PREFIX.PRAYER)) {
		dataList = spells;
		dataId = reqKey.replace(CONSTANTS.TOOLTIP_PREFIX.PRAYER, "");
	  } else if (reqKey.startsWith(CONSTANTS.TOOLTIP_PREFIX.UNIT)) {
		dataList = units;
		dataId = reqKey.replace(CONSTANTS.TOOLTIP_PREFIX.UNIT, "");
	  } else if (reqKey.startsWith(CONSTANTS.TOOLTIP_PREFIX.FACTION_IMPROVE)) {
		dataList = factions;
		dataId = reqKey.replace(CONSTANTS.TOOLTIP_PREFIX.FACTION_IMPROVE, "");
		reqField = "reqImproveRelationship"
	  } else if (reqKey.startsWith(CONSTANTS.TOOLTIP_PREFIX.FACTION_DELEGATION)) {
		dataList = factions;
		dataId = reqKey.replace(CONSTANTS.TOOLTIP_PREFIX.FACTION_DELEGATION, "");
		reqField = "reqDelegation"
	  }
	  
	  if (!dataId || !dataList) {
        return
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

	  let req = data[reqField]
	  if (req) {
		req = req[reqIdx]
	  }

	  if (!req) {
		return;
	  }

      const resource = resources.get(req.id)
      if (resource) {
        let ttf = '✅'

        const target = numberParser.parse(
          cells[1].textContent
            .split(' ')
            .shift()
            .replace(/[^0-9KM\-,\.]/g, '')
            .trim()
        )

        if (target > resource.max || resource.speed <= 0) {
          ttf = 'never'
        } else if (target > resource.current) {
          ttf = formatTime(Math.ceil((target - resource.current) / resource.speed)).timeShort
        }

        if (!cells[2]) {
          const ttfElement = document.createElement('td')
          ttfElement.className = 'px-4 3xl:py-1 text-right'
          ttfElement.textContent = ttf
          row.appendChild(ttfElement)
        } else {
          cells[2].textContent = ttf
        }
      }
    })
  }
}

export default calculateTippyTTF
