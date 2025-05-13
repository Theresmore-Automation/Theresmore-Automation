let keyGen = {
  manual: _gen('manual_'),
  armyArmy: _gen('army_create_'),
  armyAttack: _gen('army_combat_'),
  market: _gen('stock_'),
  resource: _gen('resource_'),
  research: _gen('tec_'),
  building: _gen('bui_'),
  population: _gen('population_'),
  magic: _gen('fai_'),
  enemy: _gen('enemy-'),
  diplomacy: _gen('dip_card_'),
  tooltipReq: _gen('tooltip_req_'),
  legacy: _gen('leg_'),
  ancestor: _gen('ancestor_'),
}

function _gen(prefix) {
  return {
    key(id) {
      return prefix + id
    },
    id(key) {
      return key.replace(new RegExp('^' + prefix), '')
    },
    check(key) {
      return key && !!key.match(new RegExp('^' + prefix + '.+'))
    },
  }
}

export default keyGen
