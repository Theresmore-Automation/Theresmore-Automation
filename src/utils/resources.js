import numberParser from './numberParser'
import formatTime from './formatTime'

const get = (resourceName = 'Gold') => {
  let resourceFound = false
  let resourceToFind = { name: resourceName, current: 0, max: 0, speed: 0, ttf: null, ttz: null }
  const resources = [...document.querySelectorAll('#root div > div > div > table > tbody > tr > td:nth-child(1) > span')]
  resources.map((resource) => {
    if (resource.textContent.includes(resourceName)) {
      resourceFound = true
      const values = resource.parentNode.parentNode.childNodes[1].textContent.split('/').map((x) => numberParser.parse(x.replace(/[^0-9KM\-,\.]/g, '').trim()))
      resourceToFind.current = values[0]
      resourceToFind.max = values[1]

      resourceToFind.speed = numberParser.parse(resource.parentNode.parentNode.childNodes[2].textContent.replace(/[^0-9KM\-,\.]/g, '').trim()) || 0

      resourceToFind.ttf =
        resourceToFind.speed > 0 && resourceToFind.max !== resourceToFind.current
          ? formatTime(Math.ceil((resourceToFind.max - resourceToFind.current) / resourceToFind.speed))
          : null
      resourceToFind.ttz =
        resourceToFind.speed < 0 && resourceToFind.current ? formatTime(Math.ceil(resourceToFind.current / (resourceToFind.speed * -1))) : null
    }
  })

  return resourceFound ? resourceToFind : null
}

export default { get }
