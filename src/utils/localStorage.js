const prefix = 'TA_'

const get = (key) => {
  const data = window.localStorage.getItem(`${prefix}${key}`)

  if (data) {
    return JSON.parse(data)
  }
}

const set = (key, value) => {
  window.localStorage.setItem(`${prefix}${key}`, JSON.stringify(value))
}

export default {
  get,
  set,
}
