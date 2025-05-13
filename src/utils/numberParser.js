// https://stackoverflow.com/a/55366435
class NumberParser {
  constructor(locale) {
    const format = new Intl.NumberFormat(locale)
    const parts = format.formatToParts(12345.6)
    const numerals = Array.from({ length: 10 }).map((_, i) => format.format(i))
    const index = new Map(numerals.map((d, i) => [d, i]))
    this._group = new RegExp(`[${parts.find((d) => d.type === 'group').value}]`, 'g')
    this._decimal = new RegExp(`[${parts.find((d) => d.type === 'decimal').value}]`)
    this._numeral = new RegExp(`[${numerals.join('')}]`, 'g')
    this._index = (d) => index.get(d)
  }

  parse(string) {
    let multiplier = 1
    if (string.includes('K')) {
      multiplier = 1000
    } else if (string.includes('M')) {
      multiplier = 1000000
    }

    string = string.replace('K', '').replace('M', '').trim()

    return (string = string.replace(this._group, '').replace(this._decimal, '.').replace(this._numeral, this._index)) ? +string * multiplier : NaN
  }
}
const numberParser = new NumberParser()

export default numberParser
