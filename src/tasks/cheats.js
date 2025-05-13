import { state } from '../utils'

let initialWaitTime
let initialwaitTimeOracle

const initCheats = async () => {
  if (!state.MainStore) return

  if (state.options.instantArmy.enabled && initialWaitTime == undefined) {
    initialWaitTime = state.MainStore.ArmyStore.waitTime
    state.MainStore.ArmyStore.waitTime = 0
  } else if (!state.options.instantArmy.enabled && initialWaitTime != undefined) {
    state.MainStore.ArmyStore.waitTime = initialWaitTime
    initialWaitTime = undefined
  }

  if (state.options.instantOracle.enabled && initialwaitTimeOracle == undefined) {
    initialwaitTimeOracle = state.MainStore.ArmyStore.waitTime
    state.MainStore.ArmyStore.waitTimeOracle = 0
  } else if (!state.options.instantOracle.enabled && initialwaitTimeOracle != undefined) {
    state.MainStore.ArmyStore.waitTimeOracle = initialwaitTimeOracle
    initialwaitTimeOracle = undefined
  }
}

export default initCheats
