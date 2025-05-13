import { reactUtil } from '../utils'

const updateStats = () => {
  const controlPanel = document.querySelector('div#theresmore-automation')

  if (controlPanel && reactUtil.getGameData()) {
    controlPanel.querySelector('.legacyCount').innerText = reactUtil.getGameData().LegacyStore.ownedLegacies.length ?? 0
    controlPanel.querySelector('.lpCount').innerText = (reactUtil.getGameData().run.resources.find((res) => res.id === 'legacy') || { value: 0 }).value ?? 0
  }
}

export default updateStats
