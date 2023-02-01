import { buildings, tech, jobs } from '../data'
import { state, localStorage, translate, CONSTANTS } from '../utils'

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

const id = 'theresmore-automation-options-panel'
let start

const building_cats = ['living_quarters', 'resource', 'science', 'commercial_area', 'defense', 'faith', 'warehouse', 'wonders']

const createPanel = (startFunction) => {
  start = startFunction

  const saveTextarea = document.createElement('textarea')
  saveTextarea.id = `${id}-save`
  saveTextarea.style.position = 'absolute'
  saveTextarea.style.top = '-1000px'
  saveTextarea.style.left = '-1000px'
  saveTextarea.style.width = '1px'
  saveTextarea.style.height = '1px'
  document.querySelector('div#root').insertAdjacentElement('afterend', saveTextarea)

  const panelElement = document.createElement('div')
  panelElement.id = id
  panelElement.style.position = 'fixed'
  panelElement.style.top = '0'
  panelElement.style.left = '0'
  panelElement.style.zIndex = '9999999999'
  panelElement.style.padding = '20px'
  panelElement.style.height = '100vh'
  panelElement.style.width = '100vw'
  panelElement.style.display = 'none'
  panelElement.style.backdropFilter = 'blur(10px)'

  const innerPanelElement = document.createElement('div')
  innerPanelElement.classList.add('dark')
  innerPanelElement.classList.add('dark:bg-mydark-300')
  innerPanelElement.style.position = 'relative'
  innerPanelElement.style.height = '100%'
  innerPanelElement.style.width = '100%'
  innerPanelElement.style.padding = '10px'
  innerPanelElement.style.border = '1px black solid'
  innerPanelElement.style.overflowY = 'auto'
  innerPanelElement.style.overflowX = 'none'

  innerPanelElement.innerHTML = `
    <p class="mb-2">
      <h2 class="text-xl">Theresmore Automation Options:</h2>

      <div class="mb-6">
        <h3 class="text-lg">Build:</h3>
        <p class="mb-2">Max values: -1 -> build unlimited; 0 -> do not build;</p>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="pages-${CONSTANTS.PAGES.BUILD}" class="option" ${
    state.options.pages[CONSTANTS.PAGES.BUILD] ? 'checked="checked"' : ''
  } /></label></div>

  ${building_cats
    .map(
      (cat) => `
    <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
      <div class="w-full pb-3 font-bold text-center xl:text-left">${translate(cat)}</div>
      <div class="grid gap-3 grid-cols-fill-180 min-w-full px-12 xl:px-0 mb-2">
        ${buildings
          .filter((building) => building.cat === cat)
          .map((building) => {
            return `<div class="flex flex-col"><label>${translate(building.id)} max:<br /><input type="number" data-id="${CONSTANTS.PAGES.BUILD}-${
              building.id
            }" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-400 border-y border-gray-400 dark:border-mydark-200" value="${
              state.options[CONSTANTS.PAGES.BUILD][building.id] ? state.options[CONSTANTS.PAGES.BUILD][building.id] : '0'
            }" min="-1" max="${building.cap ? building.cap : 99999}" step="1" /></label></div>`
          })
          .join('')}
      </div>
    </div>
  `
    )
    .join('')}

        <div class="mb-2"><label>Prioritize Wonders: <input type="checkbox" data-id="automation-prioWonders" class="option" ${
          state.options.automation.prioWonders ? 'checked="checked"' : ''
        } /></label></div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Research:</h3>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="pages-${CONSTANTS.PAGES.RESEARCH}" class="option" ${
    state.options.pages[CONSTANTS.PAGES.RESEARCH] ? 'checked="checked"' : ''
  } /></label></div>

        <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
          <div class="w-full pb-3 font-bold text-center xl:text-left">Regular researches:</div>
          <div class="grid gap-3 grid-cols-fill-180 min-w-full px-12 xl:px-0 mb-2">
            ${tech
              .filter((technology) => !technology.confirm)
              .map((technology) => {
                return `<div class="flex flex-col"><label><input type="checkbox" data-id="${CONSTANTS.PAGES.RESEARCH}-${technology.id}" class="option" ${
                  state.options[CONSTANTS.PAGES.RESEARCH][technology.id] ? 'checked="checked"' : ''
                } /> ${translate(technology.id, 'tec_')}</label></div>`
              })
              .join('')}
          </div>
        </div>

        <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600">
          <div class="w-full pb-3 font-bold text-center xl:text-left">Dangerous researches (requiring confirmation):</div>
          <div class="grid gap-3 grid-cols-fill-180 min-w-full px-12 xl:px-0 mb-2">
            ${tech
              .filter((technology) => technology.confirm)
              .map((technology) => {
                return `<div class="flex flex-col"><label><input type="checkbox" data-id="${CONSTANTS.PAGES.RESEARCH}-${technology.id}" class="option" ${
                  state.options[CONSTANTS.PAGES.RESEARCH][technology.id] ? 'checked="checked"' : ''
                } /> ${translate(technology.id, 'tec_')}</label></div>`
              })
              .join('')}
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Marketplace:</h3>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="pages-${CONSTANTS.PAGES.MARKETPLACE}" class="option" ${
    state.options.pages[CONSTANTS.PAGES.MARKETPLACE] ? 'checked="checked"' : ''
  } /></label></div>
        <div class="grid gap-3 grid-cols-fill-180 min-w-full px-12 xl:px-0 mb-2">
          ${['cow', 'horse', 'food', 'copper', 'wood', 'stone', 'iron', 'tools']
            .map((res) => {
              return `<div class="flex flex-col"><label><input type="checkbox" data-id="${CONSTANTS.PAGES.MARKETPLACE}-resource_${res}" class="option" ${
                state.options[CONSTANTS.PAGES.MARKETPLACE][`resource_${res}`] ? 'checked="checked"' : ''
              } /> Sell ${translate(res, 'res_')}</label></div>`
            })
            .join('')}
        </div>
        <div>Don't sell if max gold can be reached in <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-400 border-y border-gray-400 dark:border-mydark-200" data-id="${
          CONSTANTS.PAGES.MARKETPLACE
        }-timeToWaitUntilFullGold" value="${
    state.options[CONSTANTS.PAGES.MARKETPLACE].timeToWaitUntilFullGold ? state.options[CONSTANTS.PAGES.MARKETPLACE].timeToWaitUntilFullGold : '60'
  }" /> seconds</div>
  <div>Sell the same resource at most every <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-400 border-y border-gray-400 dark:border-mydark-200" data-id="${
    CONSTANTS.PAGES.MARKETPLACE
  }-secondsBetweenSells" value="${
    state.options[CONSTANTS.PAGES.MARKETPLACE].secondsBetweenSells ? state.options[CONSTANTS.PAGES.MARKETPLACE].secondsBetweenSells : '90'
  }" /> seconds</div>
  <div>Sell the resource if it can be refilled in at most <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-400 border-y border-gray-400 dark:border-mydark-200" data-id="${
    CONSTANTS.PAGES.MARKETPLACE
  }-timeToFillResource" value="${
    state.options[CONSTANTS.PAGES.MARKETPLACE].timeToFillResource ? state.options[CONSTANTS.PAGES.MARKETPLACE].timeToFillResource : '90'
  }" /> seconds</div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Population:</h3>
        <p class="mb-2">Max values: -1 -> hire unlimited; 0 -> do not hire;</p>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="pages-${CONSTANTS.PAGES.POPULATION}" class="option" ${
    state.options.pages[CONSTANTS.PAGES.POPULATION] ? 'checked="checked"' : ''
  } /></label></div>

        <div class="flex flex-wrap min-w-full mt-3 p-3 shadow rounded-lg ring-1 ring-gray-300 dark:ring-mydark-200 bg-gray-100 dark:bg-mydark-600 mb-2">
          <div class="w-full pb-3 font-bold text-center xl:text-left">Hire:</div>
          <div class="grid gap-3 grid-cols-fill-180 min-w-full px-12 xl:px-0 mb-2">
            ${jobs
              .filter((job) => job.gen)
              .map((job) => {
                return `<div class="flex flex-col"><label>${translate(
                  job.id,
                  'pop_'
                )}:<br /><input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-400 border-y border-gray-400 dark:border-mydark-200" data-id="${
                  CONSTANTS.PAGES.POPULATION
                }-${job.id}" value="${
                  state.options[CONSTANTS.PAGES.POPULATION][job.id] ? state.options[CONSTANTS.PAGES.POPULATION][job.id] : '0'
                }" min="-1" max="999999" step="1" /></label></div>`
              })
              .join('')}
          </div>
        </div>

        <div class="mb-2"><label>Minimum Food production to aim for: <input type="number" class="option w-min text-center lg:text-sm text-gray-700 bg-gray-100 dark:text-mydark-50 dark:bg-mydark-400 border-y border-gray-400 dark:border-mydark-200" data-id="automation-minimumFood" value="${
          state.options.automation.minimumFood ? state.options.automation.minimumFood : '1'
        }" min="0" max="999999" step="1" /></label></div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Army:</h3>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="pages-${CONSTANTS.PAGES.ARMY}" class="option" ${
    state.options.pages[CONSTANTS.PAGES.ARMY] ? 'checked="checked"' : ''
  } /></label></div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Auto-ancestor:</h3>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="automation-ancestor" class="option" ${
          state.options.automation.ancestor ? 'checked="checked"' : ''
        } /></label></div>

        <div class="mb-2">
          Ancestor to pick:
        </div>
        <div class="grid gap-3 grid-cols-fill-180 min-w-full px-12 xl:px-0 mb-2">
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
            .map((ancestor) => {
              return `<div class="flex flex-col"><label><input type="radio" name="automation-selected_ancestor" data-id="automation-selected_${ancestor}" class="option" ${
                state.options.automation[`selected_${ancestor}`] ? 'checked="checked"' : ''
              } /> ${translate(ancestor)}</label></div>`
            })
            .join('')}
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg">Auto-prestige:</h3>
        <div class="mb-2"><label>Enabled: <input type="checkbox" data-id="automation-prestige" class="option" ${
          state.options.automation.prestige ? 'checked="checked"' : ''
        } /></label></div>
      </div>

      <div class="mb-2">
        <button id="saveOptions" type="button" class="btn btn-green w-min px-4 mr-2">Save options</button>
        <button id="exportOptions" type="button" class="btn btn-blue w-min px-4 mr-2">Export options</button>
        <button id="importOptions" type="button" class="btn btn-blue w-min px-4 mr-2">Import options</button>
      </div>
    </p>
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
}

const updatePanel = () => {}

let previousScriptState = state.scriptPaused

const togglePanel = () => {
  const panelElement = document.querySelector(`div#${id}`)
  if (panelElement.style.display === 'none') {
    previousScriptState = state.scriptPaused
    state.scriptPaused = true
    panelElement.style.display = 'block'
  } else {
    state.scriptPaused = previousScriptState
    panelElement.style.display = 'none'
  }

  start()
}

const saveOptions = () => {
  const options = [...document.querySelector(`div#${id}`).querySelectorAll('.option')]
  options.forEach((option) => {
    if (option.type === 'checkbox' || option.type === 'radio') {
      const ids = option.dataset.id.split('-')
      state.options[ids[0]][ids[1]] = option.checked
    } else if (option.type === 'number') {
      const ids = option.dataset.id.split('-')
      state.options[ids[0]][ids[1]] = Math.round(Number(option.value))
    } else {
      console.log('Unhandled', option)
      console.log(option.dataset.id.split('-'))
      console.log(option.type)
      console.log(typeof option.value, option.value)
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
    location.reload()
  }
}

export default { createPanel, updatePanel, togglePanel }
