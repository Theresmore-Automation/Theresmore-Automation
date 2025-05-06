import { buildings, tech, jobs, spells, factions, units, locations, legacies } from '../data'
import { state, localStorage, translate, CONSTANTS, runMigrations, cheats } from '../utils'
import { getDefaultOptions } from '../utils/state'

// https://github.com/pieroxy/lz-string
var LZString = (function () {
  function o(o, r) {
    if (!t[o]) {
      t[o] = {}
      for (var n = 0; n < o.length; n++) t[o][o.charAt(n)] = n
    }
    return t[o][r]
  }
  var r = String.fromCharCode,
    n = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    e = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$',
    t = {},
    i = {
      compressToBase64: function (o) {
        if (null == o) return ''
        var r = i._compress(o, 6, function (o) {
          return n.charAt(o)
        })
        switch (r.length % 4) {
          default:
          case 0:
            return r
          case 1:
            return r + '==='
          case 2:
            return r + '=='
          case 3:
            return r + '='
        }
      },
      decompressFromBase64: function (r) {
        return null == r
          ? ''
          : '' == r
            ? null
            : i._decompress(r.length, 32, function (e) {
                return o(n, r.charAt(e))
              })
      },
      compressToUTF16: function (o) {
        return null == o
          ? ''
          : i._compress(o, 15, function (o) {
              return r(o + 32)
            }) + ' '
      },
      decompressFromUTF16: function (o) {
        return null == o
          ? ''
          : '' == o
            ? null
            : i._decompress(o.length, 16384, function (r) {
                return o.charCodeAt(r) - 32
              })
      },
      compressToUint8Array: function (o) {
        for (var r = i.compress(o), n = new Uint8Array(2 * r.length), e = 0, t = r.length; t > e; e++) {
          var s = r.charCodeAt(e)
          ;(n[2 * e] = s >>> 8), (n[2 * e + 1] = s % 256)
        }
        return n
      },
      decompressFromUint8Array: function (o) {
        if (null === o || void 0 === o) return i.decompress(o)
        for (var n = new Array(o.length / 2), e = 0, t = n.length; t > e; e++) n[e] = 256 * o[2 * e] + o[2 * e + 1]
        var s = []
        return (
          n.forEach(function (o) {
            s.push(r(o))
          }),
          i.decompress(s.join(''))
        )
      },
      compressToEncodedURIComponent: function (o) {
        return null == o
          ? ''
          : i._compress(o, 6, function (o) {
              return e.charAt(o)
            })
      },
      decompressFromEncodedURIComponent: function (r) {
        return null == r
          ? ''
          : '' == r
            ? null
            : ((r = r.replace(/ /g, '+')),
              i._decompress(r.length, 32, function (n) {
                return o(e, r.charAt(n))
              }))
      },
      compress: function (o) {
        return i._compress(o, 16, function (o) {
          return r(o)
        })
      },
      _compress: function (o, r, n) {
        if (null == o) return ''
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
          v = 0
        for (i = 0; i < o.length; i += 1)
          if (
            ((u = o.charAt(i)),
            Object.prototype.hasOwnProperty.call(s, u) || ((s[u] = f++), (p[u] = !0)),
            (c = a + u),
            Object.prototype.hasOwnProperty.call(s, c))
          )
            a = c
          else {
            if (Object.prototype.hasOwnProperty.call(p, a)) {
              if (a.charCodeAt(0) < 256) {
                for (e = 0; h > e; e++) (m <<= 1), v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++
                for (t = a.charCodeAt(0), e = 0; 8 > e; e++) (m = (m << 1) | (1 & t)), v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++, (t >>= 1)
              } else {
                for (t = 1, e = 0; h > e; e++) (m = (m << 1) | t), v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++, (t = 0)
                for (t = a.charCodeAt(0), e = 0; 16 > e; e++) (m = (m << 1) | (1 & t)), v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++, (t >>= 1)
              }
              l--, 0 == l && ((l = Math.pow(2, h)), h++), delete p[a]
            } else for (t = s[a], e = 0; h > e; e++) (m = (m << 1) | (1 & t)), v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++, (t >>= 1)
            l--, 0 == l && ((l = Math.pow(2, h)), h++), (s[c] = f++), (a = String(u))
          }
        if ('' !== a) {
          if (Object.prototype.hasOwnProperty.call(p, a)) {
            if (a.charCodeAt(0) < 256) {
              for (e = 0; h > e; e++) (m <<= 1), v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++
              for (t = a.charCodeAt(0), e = 0; 8 > e; e++) (m = (m << 1) | (1 & t)), v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++, (t >>= 1)
            } else {
              for (t = 1, e = 0; h > e; e++) (m = (m << 1) | t), v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++, (t = 0)
              for (t = a.charCodeAt(0), e = 0; 16 > e; e++) (m = (m << 1) | (1 & t)), v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++, (t >>= 1)
            }
            l--, 0 == l && ((l = Math.pow(2, h)), h++), delete p[a]
          } else for (t = s[a], e = 0; h > e; e++) (m = (m << 1) | (1 & t)), v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++, (t >>= 1)
          l--, 0 == l && ((l = Math.pow(2, h)), h++)
        }
        for (t = 2, e = 0; h > e; e++) (m = (m << 1) | (1 & t)), v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++, (t >>= 1)
        for (;;) {
          if (((m <<= 1), v == r - 1)) {
            d.push(n(m))
            break
          }
          v++
        }
        return d.join('')
      },
      decompress: function (o) {
        return null == o
          ? ''
          : '' == o
            ? null
            : i._decompress(o.length, 32768, function (r) {
                return o.charCodeAt(r)
              })
      },
      _decompress: function (o, n, e) {
        var t,
          i,
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
          A = { val: e(0), position: n, index: 1 }
        for (i = 0; 3 > i; i += 1) f[i] = i
        for (p = 0, c = Math.pow(2, 2), a = 1; a != c; )
          (u = A.val & A.position), (A.position >>= 1), 0 == A.position && ((A.position = n), (A.val = e(A.index++))), (p |= (u > 0 ? 1 : 0) * a), (a <<= 1)
        switch ((t = p)) {
          case 0:
            for (p = 0, c = Math.pow(2, 8), a = 1; a != c; )
              (u = A.val & A.position), (A.position >>= 1), 0 == A.position && ((A.position = n), (A.val = e(A.index++))), (p |= (u > 0 ? 1 : 0) * a), (a <<= 1)
            l = r(p)
            break
          case 1:
            for (p = 0, c = Math.pow(2, 16), a = 1; a != c; )
              (u = A.val & A.position), (A.position >>= 1), 0 == A.position && ((A.position = n), (A.val = e(A.index++))), (p |= (u > 0 ? 1 : 0) * a), (a <<= 1)
            l = r(p)
            break
          case 2:
            return ''
        }
        for (f[3] = l, s = l, w.push(l); ; ) {
          if (A.index > o) return ''
          for (p = 0, c = Math.pow(2, m), a = 1; a != c; )
            (u = A.val & A.position), (A.position >>= 1), 0 == A.position && ((A.position = n), (A.val = e(A.index++))), (p |= (u > 0 ? 1 : 0) * a), (a <<= 1)
          switch ((l = p)) {
            case 0:
              for (p = 0, c = Math.pow(2, 8), a = 1; a != c; )
                (u = A.val & A.position),
                  (A.position >>= 1),
                  0 == A.position && ((A.position = n), (A.val = e(A.index++))),
                  (p |= (u > 0 ? 1 : 0) * a),
                  (a <<= 1)
              ;(f[d++] = r(p)), (l = d - 1), h--
              break
            case 1:
              for (p = 0, c = Math.pow(2, 16), a = 1; a != c; )
                (u = A.val & A.position),
                  (A.position >>= 1),
                  0 == A.position && ((A.position = n), (A.val = e(A.index++))),
                  (p |= (u > 0 ? 1 : 0) * a),
                  (a <<= 1)
              ;(f[d++] = r(p)), (l = d - 1), h--
              break
            case 2:
              return w.join('')
          }
          if ((0 == h && ((h = Math.pow(2, m)), m++), f[l])) v = f[l]
          else {
            if (l !== d) return null
            v = s + s.charAt(0)
          }
          w.push(v), (f[d++] = s + v.charAt(0)), h--, (s = v), 0 == h && ((h = Math.pow(2, m)), m++)
        }
      },
    }
  return i
})()
'function' == typeof define && define.amd
  ? define(function () {
      return LZString
    })
  : 'undefined' != typeof module && null != module && (module.exports = LZString)

// https://stackoverflow.com/a/1421988
const isNumber = (n) => /^-?[\d.]+(?:e-?\d+)?$/.test(n)

const id = 'theresmore-automation-options-panel'
let start

const buildingCats = ['living_quarters', 'resource', 'science', 'commercial_area', 'defense', 'faith', 'warehouse', 'wonders']
const unsafeResearch = ['kobold_nation', 'barbarian_tribes', 'orcish_threat', 'huge_cave_t']

const userUnits = units.filter((unit) => unit.type !== 'enemy' && unit.type !== 'settlement' && unit.type !== 'spy')
const userUnitsCategory = ['Recon', 'Ranged', 'Shock', 'Tank', 'Rider']

const fights = factions
  .concat(locations)
  .filter((fight) => !fight.id.includes('orc_war_party_'))
  .map((fight) => {
    return {
      key: fight.id,
      id: translate(fight.id),
      army: fight.army,
      level: fight.level,
    }
  })
  .filter((fight) => typeof fight.level !== 'undefined')

let fightLevels = []
for (let i = 0; i < 15; i++) {
  const hasFight = !!fights.find((fight) => fight.level === i)
  if (hasFight) {
    fightLevels.push(i)
  }
}

const generatePrioritySelect = (data, defaultOptions) => {
  defaultOptions = defaultOptions || [
    { key: 'Disabled', value: 0 },
    { key: 'Lowest', value: 1 },
    { key: 'Low', value: 2 },
    { key: 'Medium Low', value: 3 },
    { key: 'Medium', value: 4 },
    { key: 'Medium High', value: 5 },
    { key: 'High', value: 6 },
    { key: 'Highest', value: 7 },
  ]

  const options = []

  defaultOptions.forEach((option) => {
    options.push(`<option value="${option.value}">${option.key}</option>`)
  })

  return `<select class="option dark:bg-mydark-200"
  ${data.setting ? `data-setting="${data.setting}"` : ''}
  ${data.page ? `data-page="${data.page}"` : ''}
  ${data.subpage ? `data-subpage="${data.subpage}"` : ''}
  ${data.key ? `data-key="${data.key}"` : ''}
  ${data.subkey ? `data-subkey="${data.subkey}"` : ''}
  >${options.join('')}</select>`
}

const createPanel = (startFunction) => {
  start = startFunction

  const saveTextarea = document.createElement('textarea')
  saveTextarea.id = `${id}-save`
  saveTextarea.classList.add('taSaveArea')
  document.querySelector('div#root').insertAdjacentElement('afterend', saveTextarea)

  const panelElement = document.createElement('div')
  panelElement.id = id
  panelElement.classList.add('taPanelElement')

  const innerPanelElement = document.createElement('div')
  innerPanelElement.classList.add('dark')
  innerPanelElement.classList.add('dark:bg-mydark-300')
  innerPanelElement.classList.add('taInnerPanelElement')

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
              <input type="radio" name="${CONSTANTS.PAGES.BUILD}PageOptions" id="${CONSTANTS.PAGES.BUILD}PageOptions-${
                CONSTANTS.SUBPAGES.CITY
              }" checked class="taTab-switch">
              <label for="${CONSTANTS.PAGES.BUILD}PageOptions-${CONSTANTS.SUBPAGES.CITY}" class="taTab-label">${CONSTANTS.SUBPAGES.CITY}</label>
              <div class="taTab-content">
                <div class="mb-2"><label>Enabled:
                  <input type="checkbox" data-page="${CONSTANTS.PAGES.BUILD}" data-subpage="${CONSTANTS.SUBPAGES.CITY}" data-key="enabled" class="option" />
                </label></div>

                <div class="mb-2">
                  <button type="button" class="btn btn-blue w-min px-4 mr-2 minus1Medium">Set all to -1/Medium</button>
                  <button type="button" class="btn btn-blue w-min px-4 mr-2 zeroDisabled">Set all to 0/Disabled</button>
                </div>

                ${buildingCats
                  .map(
                    (cat) => `
                  <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
                    <div class="w-full pb-3 font-bold text-center xl:text-left">${translate(cat)}</div>
                    <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
                      ${buildings
                        .filter((building) => building.cat === cat)
                        .filter((building) => building.tab === 1)
                        .map((building) => {
                          return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(building.id)}</span><br/>
                          Max:
                            <input type="number" data-page="${CONSTANTS.PAGES.BUILD}" data-subpage="${
                              CONSTANTS.SUBPAGES.CITY
                            }" data-key="options" data-subkey="${building.id}"
                            class="option text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
                            value="0" min="-1" max="${building.cap ? building.cap : 999}" step="1" /><br />
                          Prio: ${generatePrioritySelect({
                            page: CONSTANTS.PAGES.BUILD,
                            subpage: CONSTANTS.SUBPAGES.CITY,
                            key: 'options',
                            subkey: `prio_${building.id}`,
                          })}</label></div>`
                        })
                        .join('')}
                    </div>
                  </div>
                `
                  )
                  .join('')}

              </div>
            </div>
            <div class="taTab">
              <input type="radio" name="${CONSTANTS.PAGES.BUILD}PageOptions" id="${CONSTANTS.PAGES.BUILD}PageOptions-${
                CONSTANTS.SUBPAGES.COLONY
              }" class="taTab-switch">
              <label for="${CONSTANTS.PAGES.BUILD}PageOptions-${CONSTANTS.SUBPAGES.COLONY}" class="taTab-label">${CONSTANTS.SUBPAGES.COLONY}</label>
              <div class="taTab-content">
                <div class="mb-2"><label>Enabled:
                  <input type="checkbox" data-page="${CONSTANTS.PAGES.BUILD}" data-subpage="${CONSTANTS.SUBPAGES.COLONY}" data-key="enabled" class="option" />
                </label></div>

                <div class="mb-2">
                  <button type="button" class="btn btn-blue w-min px-4 mr-2 minus1Medium">Set all to -1/Medium</button>
                  <button type="button" class="btn btn-blue w-min px-4 mr-2 zeroDisabled">Set all to 0/Disabled</button>
                </div>

                ${buildingCats
                  .map(
                    (cat) => `
                  <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
                    <div class="w-full pb-3 font-bold text-center xl:text-left">${translate(cat)}</div>
                    <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
                      ${buildings
                        .filter((building) => building.cat === cat)
                        .filter((building) => building.tab === 2)
                        .map((building) => {
                          return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(building.id)}</span><br/>
                          Max:
                            <input type="number" data-page="${CONSTANTS.PAGES.BUILD}" data-subpage="${
                              CONSTANTS.SUBPAGES.COLONY
                            }" data-key="options" data-subkey="${building.id}"
                            class="option text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
                            value="0" min="-1" max="${building.cap ? building.cap : 999}" step="1" /><br />
                          Prio: ${generatePrioritySelect({
                            page: CONSTANTS.PAGES.BUILD,
                            subpage: CONSTANTS.SUBPAGES.COLONY,
                            key: 'options',
                            subkey: `prio_${building.id}`,
                          })}</label></div>`
                        })
                        .join('')}
                    </div>
                  </div>
                `
                  )
                  .join('')}

              </div>
            </div>
            <div class="taTab">
              <input type="radio" name="${CONSTANTS.PAGES.BUILD}PageOptions" id="${CONSTANTS.PAGES.BUILD}PageOptions-${
                CONSTANTS.SUBPAGES.ABYSS
              }" class="taTab-switch">
              <label for="${CONSTANTS.PAGES.BUILD}PageOptions-${CONSTANTS.SUBPAGES.ABYSS}" class="taTab-label">${CONSTANTS.SUBPAGES.ABYSS}</label>
              <div class="taTab-content">
                <div class="mb-2"><label>Enabled:
                  <input type="checkbox" data-page="${CONSTANTS.PAGES.BUILD}" data-subpage="${CONSTANTS.SUBPAGES.ABYSS}" data-key="enabled" class="option" />
                </label></div>

                <div class="mb-2">
                  <button type="button" class="btn btn-blue w-min px-4 mr-2 minus1Medium">Set all to -1/Medium</button>
                  <button type="button" class="btn btn-blue w-min px-4 mr-2 zeroDisabled">Set all to 0/Disabled</button>
                </div>

                ${buildingCats
                  .map(
                    (cat) => `
                  <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
                    <div class="w-full pb-3 font-bold text-center xl:text-left">${translate(cat)}</div>
                    <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
                      ${buildings
                        .filter((building) => building.cat === cat)
                        .filter((building) => building.tab === 3)
                        .map((building) => {
                          return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(building.id)}</span><br/>
                          Max:
                            <input type="number" data-page="${CONSTANTS.PAGES.BUILD}" data-subpage="${
                              CONSTANTS.SUBPAGES.ABYSS
                            }" data-key="options" data-subkey="${building.id}"
                            class="option text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
                            value="0" min="-1" max="${building.cap ? building.cap : 999}" step="1" /><br />
                          Prio: ${generatePrioritySelect({
                            page: CONSTANTS.PAGES.BUILD,
                            subpage: CONSTANTS.SUBPAGES.ABYSS,
                            key: 'options',
                            subkey: `prio_${building.id}`,
                          })}</label></div>`
                        })
                        .join('')}
                    </div>
                  </div>
                `
                  )
                  .join('')}

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

          <div class="mb-2"><label>Dangerous fights should require enough army to win before researching:
            <input type="checkbox" data-page="${CONSTANTS.PAGES.RESEARCH}" data-subpage="${CONSTANTS.SUBPAGES.RESEARCH}"
              data-key="options" data-subkey="dangerousFights" class="option" />
          </label></div>

          <div class="mb-2">
            <button type="button" class="btn btn-blue w-min px-4 mr-2 minus1Medium">Set all regular to Medium</button>
            <button type="button" class="btn btn-blue w-min px-4 mr-2 zeroDisabled">Set all regular to Disabled</button>
          </div>

          <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
            <div class="w-full pb-3 font-bold text-center xl:text-left">Regular researches:</div>
            <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
              ${tech
                .filter((technology) => !technology.confirm && !unsafeResearch.includes(technology.id))
                .map((technology) => {
                  return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(technology.id, 'tec_')}</span><br />
                  Prio: ${generatePrioritySelect({
                    page: CONSTANTS.PAGES.RESEARCH,
                    subpage: CONSTANTS.SUBPAGES.RESEARCH,
                    key: 'options',
                    subkey: technology.id,
                  })}</label></div>`
                })
                .join('')}
            </div>
          </div>

          <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600 unsafe">
            <div class="w-full pb-3 font-bold text-center xl:text-left">Dangerous researches (requiring confirmation):</div>
            <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
              ${tech
                .filter((technology) => technology.confirm || unsafeResearch.includes(technology.id))
                .map((technology) => {
                  return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(technology.id, 'tec_')}</span><br />
                  Prio: ${generatePrioritySelect({
                    page: CONSTANTS.PAGES.RESEARCH,
                    subpage: CONSTANTS.SUBPAGES.RESEARCH,
                    key: 'options',
                    subkey: technology.id,
                  })}</label></div>`
                })
                .join('')}
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
          ${['cow', 'horse', 'food', 'copper', 'wood', 'stone', 'iron', 'tools']
            .map((res) => {
              return `<div class="flex flex-col mb-2"><label>
                <input type="checkbox" data-page="${CONSTANTS.PAGES.MARKETPLACE}" data-key="options" data-subkey="resource_${res}" class="option" />
              Sell ${translate(res, 'res_')}</label></div>`
            })
            .join('')}
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
              ${jobs
                .filter((job) => job.gen)
                .map((job) => {
                  return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(job.id, 'pop_')}</span><br />
                  Max:
                    <input type="number" data-page="${CONSTANTS.PAGES.POPULATION}" data-key="options" data-subkey="${job.id}"
                    class="option text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
                    value="0" min="-1" max="999" step="1" /><br />
                  Prio: ${generatePrioritySelect({
                    page: CONSTANTS.PAGES.POPULATION,
                    key: 'options',
                    subkey: `prio_${job.id}`,
                  })}</label></div>`
                })
                .join('')}
            </div>
          </div>

          <div class="mb-2"><label>Minimum Food production to aim for:
            <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
            data-page="${CONSTANTS.PAGES.POPULATION}" data-key="options" data-subkey="minimumFood" value="1" min="0" max="999999" step="1" /></label></div>

          <div class="mb-2"><label>Ratio for unsafe jobs (speed of resource production to usage):
            <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
            data-page="${CONSTANTS.PAGES.POPULATION}" data-key="options" data-subkey="unsafeJobRatio"
            value="2" min="0" max="999999" step="0.01" /></label></div>


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

              ${userUnitsCategory
                .map(
                  (cat, index) => `
                <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
                  <div class="w-full pb-3 font-bold text-center xl:text-left">${cat}</div>
                  <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
                    ${userUnits
                      .filter((unit) => unit.category === index)
                      .map((unit) => {
                        return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(unit.id, 'uni_')}</span><br/>
                        Max:
                          <input type="number" data-page="${CONSTANTS.PAGES.ARMY}" data-subpage="${CONSTANTS.SUBPAGES.ARMY}" data-key="options" data-subkey="${
                            unit.id
                          }"
                          class="option text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
                          value="0" min="-1" max="${unit.cap ? unit.cap : 999}" step="1" /><br />
                        Prio: ${generatePrioritySelect({
                          page: CONSTANTS.PAGES.ARMY,
                          subpage: CONSTANTS.SUBPAGES.ARMY,
                          key: 'options',
                          subkey: `prio_${unit.id}`,
                        })}</label></div>`
                      })
                      .join('')}
                  </div>
                </div>
              `
                )
                .join('')}
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


              <div class="mb-2"><label>Familiars to send:<br />
              Min: <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
              data-page="${CONSTANTS.PAGES.ARMY}" data-subpage="${CONSTANTS.SUBPAGES.EXPLORE}"
              data-key="options" data-subkey="familiarsMin" value="0" min="0" max="999999" step="1" /><br />
              Max: <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
              data-page="${CONSTANTS.PAGES.ARMY}" data-subpage="${CONSTANTS.SUBPAGES.EXPLORE}"
              data-key="options" data-subkey="familiarsMax" value="0" min="0" max="999999" step="1" /></label></div>
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
                ${fightLevels
                  .map(
                    (level) => `
                <button type="button" class="btn btn-blue w-min px-4 mr-2 toggleLevelFights" data-checked="1" data-level="${level}">Toggle all Level ${level}</button>
                `
                  )
                  .join('')}
              </div>

              ${fightLevels
                .map(
                  (level) => `
                <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600 taFights level${level}">
                  <div class="w-full pb-3 font-bold text-center xl:text-left">Level ${level}</div>
                  <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
                    ${fights
                      .filter((fight) => fight.level === level)
                      .map((fight) => {
                        return `<div class="flex flex-col mb-2"><label>
                        <input type="checkbox"  data-page="${CONSTANTS.PAGES.ARMY}" data-subpage="${CONSTANTS.SUBPAGES.ATTACK}"
                          data-key="options" data-subkey="${fight.key}" class="option" />
                        <span class="font-bold">${fight.id}</span></label></div>`
                      })
                      .join('')}
                  </div>
                </div>
              `
                )
                .join('')}

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
              <input type="radio" name="${CONSTANTS.PAGES.MAGIC}PageOptions" id="${CONSTANTS.PAGES.MAGIC}PageOptions-${
                CONSTANTS.SUBPAGES.PRAYERS
              }" checked class="taTab-switch">
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
                    ${spells
                      .filter((prayer) => prayer.type === 'prayer')
                      .map((prayer) => {
                        return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(prayer.id)}</span><br/>
                        Prio: ${generatePrioritySelect({
                          page: CONSTANTS.PAGES.MAGIC,
                          subpage: CONSTANTS.SUBPAGES.PRAYERS,
                          key: 'options',
                          subkey: prayer.id,
                        })}</label></div>`
                      })
                      .join('')}
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
                    ${spells
                      .filter((spell) => spell.type === 'spell')
                      .filter((spell) => spell.gen && !spell.gen.find((gen) => gen.type === 'modifier' && gen.type_id === 'army'))
                      .map((spell) => {
                        return `<div class="flex flex-col mb-2"><label>
                        <input type="checkbox" data-page="${CONSTANTS.PAGES.MAGIC}" data-subpage="${CONSTANTS.SUBPAGES.SPELLS}"
                          data-key="options" data-subkey="${spell.id}" class="option" />
                        <span class="font-bold">${translate(spell.id)}</span></label></div>`
                      })
                      .join('')}
                  </div>
                </div>

                <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600 spellsArmy">
                  <div class="w-full pb-3 font-bold text-center xl:text-left">Army spells:</div>
                  <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
                    ${spells
                      .filter((spell) => spell.type === 'spell')
                      .filter((spell) => spell.gen && spell.gen.find((gen) => gen.type === 'modifier' && gen.type_id === 'army'))
                      .map((spell) => {
                        return `<div class="flex flex-col mb-2"><label>
                        <input type="checkbox" data-page="${CONSTANTS.PAGES.MAGIC}" data-subpage="${CONSTANTS.SUBPAGES.SPELLS}"
                          data-key="options" data-subkey="${spell.id}" class="option" />
                        <span class="font-bold">${translate(spell.id)}</span></label></div>`
                      })
                      .join('')}
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
              ${factions
                .filter((faction) => faction.gen)
                .filter((faction) => faction.relationship)
                .map((faction) => {
                  const options = [
                    { key: 'Disabled', value: CONSTANTS.DIPLOMACY.DISABLED },
                    { key: 'Go to war', value: CONSTANTS.DIPLOMACY.GO_TO_WAR },
                    { key: 'Just trade', value: CONSTANTS.DIPLOMACY.JUST_TRADE },
                    { key: 'Trade, then ally', value: CONSTANTS.DIPLOMACY.TRADE_AND_ALLY },
                    { key: 'Ally without trading', value: CONSTANTS.DIPLOMACY.ONLY_ALLY },
                  ]

                  return `<div class="flex flex-col mb-2"><label><span class="font-bold">${translate(faction.id)}</span><br />
                  ${generatePrioritySelect(
                    {
                      page: CONSTANTS.PAGES.DIPLOMACY,
                      key: 'options',
                      subkey: `${faction.id}`,
                    },
                    options
                  )}
                  </label></div>`
                })
                .join('')}
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
                ${[
                  'ancestor_farmer',
                  'ancestor_believer',
                  'ancestor_forager',
                  'ancestor_gatherer',
                  'ancestor_miner',
                  'ancestor_researcher',
                  'ancestor_spellcrafter',
                  'ancestor_trader',
                  'ancestor_warrior',
                ]
                  .map((ancestor) => `<option value="${ancestor}">${translate(ancestor)}</option>`)
                  .join('')}
              </select>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="text-lg">Auto-NG+:</h3>
            <div class="mb-2"><label>Enabled:
              <input type="checkbox" data-setting="ngplus" data-key="enabled" class="option" />
            </label></div>

            <div class="mb-2"><label>Minimum Legacies to NG+:
              <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-200 border-y border-gray-400 dark:border-mydark-200"
              data-setting="ngplus" data-key="value" value="0" min="0" max="999" step="1" /></label>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="text-lg">Auto-difficulty:</h3>
            <div class="mb-2"><label>Enabled:
              <input type="checkbox" data-setting="difficulty" data-key="enabled" class="option" />
            </label></div>

            <div class="mb-2">
              Difficulty to pick:

              <select class="option dark:bg-mydark-200"
              data-setting="difficulty" data-key="selected"
              >
                ${['difficulty_99', 'difficulty_0', 'difficulty_1', 'difficulty_2', 'difficulty_3']
                  .map((difficulty) => `<option value="${difficulty}">${translate(difficulty)}</option>`)
                  .join('')}
              </select>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="text-lg">Auto-prestige:</h3>
            <div class="mb-2"><label>Enabled:
              <input type="checkbox" data-setting="prestige" data-key="enabled" class="option" />
            </label></div>
          </div>

          <div class="mb-2">
            <button type="button" class="btn btn-blue w-min px-4 mr-2 minus1Medium">Set all to Medium</button>
            <button type="button" class="btn btn-blue w-min px-4 mr-2 zeroDisabled">Set all to Disabled</button>
          </div>

          <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
            <div class="grid gap-3 grid-cols-fill-240 min-w-full px-12 xl:px-0 mb-2">
              ${legacies
                .map((legacy) => {
                  return `<div class="flex flex-col mb-2"><label>
                  <span class="font-bold">${translate(legacy.id, 'leg_')} (${legacy.req.find((req) => req.id === 'legacy').value})</span><br />
                  Prio: ${generatePrioritySelect({
                    setting: 'prestige',
                    key: 'options',
                    subkey: legacy.id,
                  })}</label></div>`
                })
                .join('')}
            </div>
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

      <div class="taTab">
        <input type="radio" name="topLevelOptions" id="topLevelOptions-Cheats" class="taTab-switch">
        <label for="topLevelOptions-Cheats" class="taTab-label">Cheats</label>
        <div class="taTab-content">
          <div class="mb-2">
            The cheats will be applied immediately upon pressing the button. Please save your game state before if you're unsure about your decisions.
          </div>

          <div class="mb-2">
            <button type="button" class="btn btn-blue w-min px-4 mr-2 maxResources">Max resources</button>
          </div>

          <div class="mb-2">
            Legacy Points:
              <button type="button" class="btn btn-blue w-min px-4 mr-2 maxLegacyPoints10">+10</button>
              <button type="button" class="btn btn-blue w-min px-4 mr-2 maxLegacyPoints100">+100</button>
              <button type="button" class="btn btn-blue w-min px-4 mr-2 maxLegacyPoints1000">+1000</button>
          </div>

          <div class="mb-2">
            Prestige Currencies:
              <button type="button" class="btn btn-blue w-min px-4 mr-2 maxPrestigeCurrencies1">+1</button>
              <button type="button" class="btn btn-blue w-min px-4 mr-2 maxPrestigeCurrencies10">+10</button>
              <button type="button" class="btn btn-blue w-min px-4 mr-2 maxPrestigeCurrencies100">+100</button>
          </div>

        </div>
      </div>
    </div>

    <div class="absolute top-0 right-0 z-20 pt-4 pr-4">
      <a href="#" title="Close" id="closeOptions">X</a>
    </div>
  `

  panelElement.appendChild(innerPanelElement)

  document.querySelector('div#root').insertAdjacentElement('afterend', panelElement)
  document.querySelector('#closeOptions').addEventListener('click', togglePanel)
  document.querySelector('#saveOptions').addEventListener('click', saveOptions)
  document.querySelector('#exportOptions').addEventListener('click', exportOptions)
  document.querySelector('#importOptions').addEventListener('click', importOptions)

  // Cheats
  document.querySelector('button.maxResources').addEventListener('click', cheats.maxResources)

  document.addEventListener('keydown', (e) => {
    // shortcut for maxResources
    if (e.ctrlKey && e.key === 'm') {
      e.preventDefault()
      cheats.maxResources()
    }
  })
  document.querySelector('button.maxLegacyPoints10').addEventListener('click', () => {
    cheats.maxLegacyPoints(10)
  })
  document.querySelector('button.maxLegacyPoints100').addEventListener('click', () => {
    cheats.maxLegacyPoints(100)
  })
  document.querySelector('button.maxLegacyPoints1000').addEventListener('click', () => {
    cheats.maxLegacyPoints(1000)
  })
  document.querySelector('button.maxPrestigeCurrencies1').addEventListener('click', () => {
    cheats.maxPrestigeCurrencies(1)
  })
  document.querySelector('button.maxPrestigeCurrencies10').addEventListener('click', () => {
    cheats.maxPrestigeCurrencies(10)
  })
  document.querySelector('button.maxPrestigeCurrencies100').addEventListener('click', () => {
    cheats.maxPrestigeCurrencies(100)
  })

  const setAllValues = (allContainers, options) => {
    allContainers.forEach((container) => {
      container.querySelectorAll('input.option[type=number]').forEach((input) => (input.value = options.number))
      container.querySelectorAll('input.option[type=checkbox]').forEach((input) => (input.checked = options.checked ? 'checked' : ''))
      container.querySelectorAll('select').forEach((select) => (select.value = options.select))
    })
  }

  const minus1Mediums = [...document.querySelectorAll('.minus1Medium')]
  minus1Mediums.forEach((button) => {
    button.addEventListener('click', function (e) {
      const allGrids = [...e.currentTarget.parentElement.parentElement.querySelectorAll('div.flex.flex-wrap:not(.unsafe)')]
      setAllValues(allGrids, { select: 4, number: -1 })
    })
  })

  const zeroDisabled = [...document.querySelectorAll('.zeroDisabled')]
  zeroDisabled.forEach((button) => {
    button.addEventListener('click', function (e) {
      const allGrids = [...e.currentTarget.parentElement.parentElement.querySelectorAll('div.flex.flex-wrap:not(.unsafe)')]
      setAllValues(allGrids, { select: 0, number: 0 })
    })
  })

  const spellsResourceEnable = [...document.querySelectorAll('.spellsResourceEnable')]
  spellsResourceEnable.forEach((button) => {
    button.addEventListener('click', function (e) {
      const allGrids = [...e.currentTarget.parentElement.parentElement.querySelectorAll('div.flex.flex-wrap.spellsResource')]
      setAllValues(allGrids, { checked: true })
    })
  })

  const spellsResourceDisable = [...document.querySelectorAll('.spellsResourceDisable')]
  spellsResourceDisable.forEach((button) => {
    button.addEventListener('click', function (e) {
      const allGrids = [...e.currentTarget.parentElement.parentElement.querySelectorAll('div.flex.flex-wrap.spellsResource')]
      setAllValues(allGrids, { checked: false })
    })
  })

  const spellsArmyEnable = [...document.querySelectorAll('.spellsArmyEnable')]
  spellsArmyEnable.forEach((button) => {
    button.addEventListener('click', function (e) {
      const allGrids = [...e.currentTarget.parentElement.parentElement.querySelectorAll('div.flex.flex-wrap.spellsArmy')]
      setAllValues(allGrids, { checked: true })
    })
  })

  const spellsArmyDisable = [...document.querySelectorAll('.spellsArmyDisable')]
  spellsArmyDisable.forEach((button) => {
    button.addEventListener('click', function (e) {
      const allGrids = [...e.currentTarget.parentElement.parentElement.querySelectorAll('div.flex.flex-wrap.spellsArmy')]
      setAllValues(allGrids, { checked: false })
    })
  })

  const toggleLevelFights = [...document.querySelectorAll('.toggleLevelFights')]
  toggleLevelFights.forEach((button) => {
    button.addEventListener('click', function (e) {
      const toggleState = e.currentTarget.dataset.checked === '1'
      const allGrids = [...document.querySelectorAll(`div.taFights.level${e.currentTarget.dataset.level}`)]
      setAllValues(allGrids, { checked: toggleState })
      e.currentTarget.dataset.checked = toggleState ? '0' : '1'
    })
  })

  const options = [...document.querySelector(`div#${id}`).querySelectorAll('.option')]
  options.forEach((option) => {
    const setting = option.dataset.setting
    const page = option.dataset.page
    const subPage = option.dataset.subpage
    const key = option.dataset.key
    const subKey = option.dataset.subkey

    let root

    if (setting) {
      root = state.options[setting]
    } else {
      if (subPage) {
        root = state.options.pages[page].subpages[subPage]
      } else {
        root = state.options.pages[page]
      }
    }

    if (root) {
      const value = subKey ? root[key][subKey] : root[key]

      if (typeof value !== 'undefined') {
        if (option.type === 'checkbox') {
          if (value) {
            option.checked = 'checked'
          }
        } else if (option.type === 'number') {
          option.value = value
        } else if (option.type === 'select-one') {
          option.value = value
        }
      }
    }
  })
}

const updatePanel = () => {}

let previousScriptState = state.scriptPaused

const togglePanel = () => {
  const panelElement = document.querySelector(`div#${id}`)
  panelElement.classList.toggle('taPanelElementVisible')
  if (panelElement.classList.contains('taPanelElementVisible')) {
    previousScriptState = state.scriptPaused
    state.scriptPaused = true
  } else {
    state.scriptPaused = previousScriptState

    if (!state.scriptPaused) {
      start()
    }
  }
}

const saveOptions = () => {
  const options = [...document.querySelector(`div#${id}`).querySelectorAll('.option')]
  state.options = getDefaultOptions()

  options.forEach((option) => {
    const setting = option.dataset.setting
    const page = option.dataset.page
    const subPage = option.dataset.subpage
    const key = option.dataset.key
    const subKey = option.dataset.subkey

    let value
    if (option.type === 'checkbox') {
      value = !!option.checked
    } else if (option.type === 'number') {
      value = Number(option.value)
    } else if (option.type === 'select-one') {
      value = option.value
    }

    if (isNumber(value)) {
      value = +value
    }

    let root

    if (setting) {
      root = state.options[setting]
    } else {
      if (subPage) {
        root = state.options.pages[page].subpages[subPage]
      } else {
        root = state.options.pages[page]
      }
    }

    if (root) {
      if (subKey) {
        root[key][subKey] = value
      } else {
        root[key] = value
      }
    }
  })

  localStorage.set('options', state.options)
}

const exportOptions = () => {
  document.querySelector(`#${id}-save`).value = LZString.compressToBase64(JSON.stringify(state.options))
  document.querySelector(`#${id}-save`).select()
  document.execCommand('copy')
  window.alert('Options copied to clipboard')
}

const importOptions = () => {
  const saveString = window.prompt('Paste exported Theresmore Automation settings here')

  if (saveString) {
    const saveData = JSON.parse(LZString.decompressFromBase64(saveString))
    if (!Array.isArray(saveData)) {
      localStorage.set('options', saveData)
      state.options = saveData
      runMigrations()
      location.reload()
    }
  }
}

export default { createPanel, updatePanel, togglePanel }
