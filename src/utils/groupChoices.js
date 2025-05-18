function groupChoices(inputJSON) {
  let blockingArray = inputJSON.filter((item) => item['gen']).filter(blocksOthers)
  blockingArray.sort(function (a, b) {
    return ('' + a['id']).localeCompare(b['id'])
  })

  let outputJSON = []
  let foundIDs = []
  for (let i = 0; i < blockingArray.length; i++) {
    if (!foundIDs.includes(blockingArray[i]['id'])) {
      const key = blockingArray[i]
      const value = [blockingArray[i]['id']].concat(blockedItems(blockingArray[i]['gen']))
      value.sort()
      outputJSON.push({ key, value })
      value.forEach(function (item) {
        foundIDs.push(item)
      })
    }
  }
  outputJSON.push(foundIDs)
  return outputJSON
}

function blocksOthers(value) {
  return value['gen'].find((item) => item['value'] == -1 && item['type'] != 'resource')
}

function blockedItems(gen) {
  let returnValue = []
  const blocked = gen.filter((item) => item['value'] === -1)
  blocked.forEach((item) => returnValue.push(item['id']))
  return returnValue
}

export default groupChoices
