let reactVarCache
function getReactData(el, level = 0) {
  let data
  if (reactVarCache && el[reactVarCache]) {
    data = el[reactVarCache]
  } else {
    const key = Object.keys(el).find((k) => k.startsWith('__reactFiber$'))
    if (key) {
      reactVarCache = key
      data = el[reactVarCache]
    }
  }

  for (let i = 0; i < level && data; i++) {
    data = data.return
  }

  return data
}

function getNearestKey(el, limit = -1) {
  let key = undefined
  let data = getReactData(el)
  let level = 0
  while (!key && data && (limit < 0 || level <= limit)) {
    key = data.key
    data = data.return
    level++
  }
  return key
}

function getBtnIndex(el, level = 0) {
  let data = getReactData(el, level)
  if (data) {
    return data.index
  } else {
    return undefined
  }
}

let gameDataCache
function getGameData() {
  if (gameDataCache) {
    return gameDataCache
  }

  const root = document.querySelector('#root')
  const key = Object.keys(root).find((k) => k.startsWith('__reactContainer$'))
  if (key) {
    const container = root[key]
    gameDataCache = container.stateNode.current.child.memoizedProps.MainStore
    return gameDataCache
  } else {
    return undefined
  }
}

export default { getReactData, getNearestKey, getBtnIndex, getGameData }
