import { resources } from '../utils'

const calculateTTF = () => {
  const resourceTrNodes = document.querySelectorAll('#root > div > div:not(#maintabs-container) > div > div > div > table:not(.hidden) > tbody > tr')
  resourceTrNodes.forEach((row) => {
    const cells = row.querySelectorAll('td')
    const resourceName = cells[0].textContent.trim()
    const resource = resources.get(resourceName)
    let ttf = ''

    if (resource && resource.current < resource.max && resource.speed) {
      ttf = resource.ttf ? resource.ttf.timeShort : resource.ttz ? resource.ttz.timeShort : ''
    }

    if (!cells[3]) {
      const ttfElement = document.createElement('td')
      ttfElement.className = 'px-3 3xl:px-5 py-3 lg:py-2 3xl:py-3 whitespace-nowrap w-1/3 text-right'
      ttfElement.textContent = ttf
      row.appendChild(ttfElement)
    } else {
      cells[3].textContent = ttf
    }
  })
}

export default calculateTTF
