import { buildings, tech, jobs } from '../data'
import { state, localStorage, translate, CONSTANTS, runMigrations } from '../utils'

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

const building_cats = ['living_quarters', 'resource', 'science', 'commercial_area', 'defense', 'faith', 'warehouse', 'wonders']
const unsafeResearch = ['kobold_nation', 'barbarian_tribes', 'orcish_threat']

const generatePrioritySelect = (data) => {
  const defaultOptions = [
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

    <div class="mb-2">
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
              <input type="radio" name="buildPageOptions" id="buildPageOptions-${CONSTANTS.SUBPAGES.CITY}" checked class="taTab-switch">
              <label for="buildPageOptions-${CONSTANTS.SUBPAGES.CITY}" class="taTab-label">${CONSTANTS.SUBPAGES.CITY}</label>
              <div class="taTab-content">
                <div class="mb-2"><label>Enabled:
                  <input type="checkbox" data-page="${CONSTANTS.PAGES.BUILD}" data-subpage="${CONSTANTS.SUBPAGES.CITY}" data-key="enabled" class="option" />
                </label></div>

                ${building_cats
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
              <input type="radio" name="buildPageOptions" id="buildPageOptions-${CONSTANTS.SUBPAGES.COLONY}" class="taTab-switch">
              <label for="buildPageOptions-${CONSTANTS.SUBPAGES.COLONY}" class="taTab-label">${CONSTANTS.SUBPAGES.COLONY}</label>
              <div class="taTab-content">
                <div class="mb-2"><label>Enabled:
                  <input type="checkbox" data-page="${CONSTANTS.PAGES.BUILD}" data-subpage="${CONSTANTS.SUBPAGES.COLONY}" data-key="enabled" class="option" />
                </label></div>

                ${building_cats
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

          <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
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
            <h3 class="text-lg">Auto-prestige:</h3>
            <div class="mb-2"><label>Enabled:
              <input type="checkbox" data-setting="ancestor" data-key="enabled" class="option" />
            </label></div>
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
      value = Math.round(Number(option.value))
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
    localStorage.set('options', saveData)
    state.options = saveData
    runMigrations()
    location.reload()
  }
}

export default { createPanel, updatePanel, togglePanel }
