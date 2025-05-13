import { i18n } from '../data'

const translate = (id, prefix = '') => {
  const knownPrefixes = ['ancestor_', 'bui_', 'cat_', 'dip_', 'ene_', 'fai_', 'leg_', 'not_', 'pop_', 'res_', 'tec_', 'uni_']

  let translated = i18n.en[prefix + id] ? i18n.en[prefix + id] : ''

  if (!translated) {
    prefix = knownPrefixes.find((knownPrefix) => i18n.en[knownPrefix + id])

    if (prefix) {
      translated = i18n.en[prefix + id]
    }
  }

  return translated
}

export default translate
