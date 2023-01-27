import { numberParser, formatTime, resources } from '../utils'

const calculateTippyTTF = () => {
  let potentialResourcesToFillTable = document.querySelectorAll('div.tippy-box > div.tippy-content > div > div > table')
  if (potentialResourcesToFillTable.length) {
    potentialResourcesToFillTable = potentialResourcesToFillTable[0]
    const rows = potentialResourcesToFillTable.querySelectorAll('tr')
    rows.forEach((row) => {
      const cells = row.querySelectorAll('td')
      const resourceName = cells[0].textContent.trim()

      const resource = resources.get(resourceName)
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
