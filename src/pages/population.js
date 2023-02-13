import { CONSTANTS, navigation, selectors, logger, sleep, state, translate, resources, numberParser, localStorage } from '../utils'
import { jobs } from '../data'

const hasUnassignedPopulation = () => {
  let unassignedPopulation = false

  const navButtons = navigation.getPagesSelector()
  navButtons.forEach((button) => {
    if (button.innerText.includes(CONSTANTS.PAGES.POPULATION)) {
      unassignedPopulation = !!button.querySelector('span')
    }
  })

  return unassignedPopulation
}

const allJobs = jobs
  .filter((job) => job.gen && job.gen.length)
  .map((job) => {
    return {
      ...job,
      id: translate(job.id, 'pop_'),
      key: job.id,
      gen: job.gen
        .filter((gen) => gen.type === 'resource')
        .map((gen) => {
          return {
            id: translate(gen.id, 'res_'),
            value: gen.value,
          }
        }),
    }
  })
  .map((job) => {
    return {
      ...job,
      isSafe: !job.gen.find((gen) => gen.value < 0),
      resourcesGenerated: job.gen
        .filter((gen) => gen.value > 0)
        .map((gen) => {
          return { id: gen.id, value: gen.value }
        }),
      resourcesUsed: job.gen
        .filter((gen) => gen.value < 0)
        .map((gen) => {
          return { id: gen.id, value: gen.value }
        }),
    }
  })

const userEnabled = () => {
  return state.options.pages[CONSTANTS.PAGES.POPULATION].enabled || false
}

let allowedJobs
const getAllJobs = () => {
  const jobsOptions = state.options.pages[CONSTANTS.PAGES.POPULATION].options

  if (Object.keys(jobsOptions).length) {
    let allowedJobs = Object.keys(jobsOptions)
      .filter((key) => !key.includes('prio_'))
      .filter((key) => !!jobsOptions[key])
      .filter((key) => !!jobsOptions[`prio_${key}`])
      .map((key) => {
        const jobData = allJobs.find((job) => job.key === key) || {}

        const job = {
          ...jobData,
          max: jobsOptions[key] === -1 ? 999 : jobsOptions[key],
          prio: jobsOptions[`prio_${key}`],
        }

        return job
      })

    return allowedJobs
  }

  return []
}

const getAllAvailableJobs = () => {
  const container = selectors.getActivePageContent()

  const availableJobs = [...container.querySelectorAll('h5')]
    .map((job) => {
      const jobTitle = job.textContent.trim()
      return {
        ...allowedJobs.find((allowedJob) => allowedJob.id === jobTitle),
        container: job.parentElement.parentElement,
        current: +job.parentElement.parentElement.querySelector('input').value.split('/').shift().trim(),
        maxAvailable: +job.parentElement.parentElement.querySelector('input').value.split('/').pop().trim(),
      }
    })
    .filter((job) => job.id && !!job.container.querySelector('button.btn-green') && job.current < Math.min(job.max, job.maxAvailable))
    .sort((a, b) => {
      if (a.prio === b.prio) {
        return a.current - b.current
      }

      return b.prio - a.prio
    })

  return availableJobs
}

const executeAction = async () => {
  allowedJobs = getAllJobs()

  const shouldRebalance =
    state.options.pages[CONSTANTS.PAGES.POPULATION].options.populationRebalanceTime > 0 &&
    (!state.lastVisited.populationRebalance ||
      state.lastVisited.populationRebalance + state.options.pages[CONSTANTS.PAGES.POPULATION].options.populationRebalanceTime * 60 * 1000 <
        new Date().getTime())

  if (allowedJobs.length && shouldRebalance) {
    const unassignAllButton = document.querySelector('div.flex.justify-center.mx-auto.pt-3.font-bold.text-lg > button')

    if (unassignAllButton) {
      unassignAllButton.click()
      logger({ msgLevel: 'log', msg: 'Unassigning all workers' })
      await sleep(10)
    }

    state.lastVisited.populationRebalance = new Date().getTime()
    localStorage.set('lastVisited', state.lastVisited)
  }

  let canAssignJobs = true
  const container = selectors.getActivePageContent()

  let availablePop = container
    .querySelector('div > span.ml-2')
    .textContent.split('/')
    .map((pop) => numberParser.parse(pop.trim()))

  let availableJobs = getAllAvailableJobs()

  if (availablePop[0] > 0 && availableJobs.length) {
    const minimumFood = state.options.pages[CONSTANTS.PAGES.POPULATION].options.minimumFood || 0

    while (!state.scriptPaused && canAssignJobs) {
      canAssignJobs = false

      if (availableJobs.length) {
        const foodJob = availableJobs.find((job) => job.resourcesGenerated.find((res) => res.id === 'Food'))

        if (foodJob && resources.get('Food').speed <= minimumFood && foodJob.current < foodJob.maxAvailable) {
          const addJobButton = foodJob.container.querySelector('button.btn-green')
          if (addJobButton) {
            logger({ msgLevel: 'log', msg: `Assigning worker as ${foodJob.id}` })

            addJobButton.click()
            canAssignJobs = true
            foodJob.current += 1
            await sleep(20)
            if (!navigation.checkPage(CONSTANTS.PAGES.POPULATION)) return
          }
        } else {
          let unassigned = container
            .querySelector('div > span.ml-2')
            .textContent.split('/')
            .map((pop) => numberParser.parse(pop.trim()))
            .shift()

          if (unassigned > 0) {
            const resourcesToProduce = [
              'Natronite',
              'Saltpetre',
              'Tools',
              'Wood',
              'Stone',
              'Iron',
              'Copper',
              'Mana',
              'Faith',
              'Research',
              'Materials',
              'Steel',
              'Supplies',
              'Gold',
              'Crystal',
              'Horse',
              'Cow',
              'Food',
            ]
              .filter((res) => resources.get(res))
              .filter((res) => availableJobs.find((job) => job.resourcesGenerated.find((resGen) => resGen.id === res)))

            const resourcesWithNegativeGen = resourcesToProduce.filter((res) => resources.get(res) && resources.get(res).speed < 0)
            const resourcesWithNoGen = resourcesToProduce.filter(
              (res) => !resourcesWithNegativeGen.includes(res) && resources.get(res) && !resources.get(res).speed
            )
            const resourcesSorted = resourcesWithNegativeGen.concat(resourcesWithNoGen)

            if (resourcesSorted.length) {
              for (let i = 0; i < resourcesSorted.length && !state.scriptPaused; i++) {
                if (unassigned === 0) break

                const resourceName = resourcesSorted[i]

                const jobsForResource = availableJobs
                  .filter((job) => job.current < job.max && job.resourcesGenerated.find((resGen) => resGen.id === resourceName))
                  .sort(
                    (a, b) =>
                      b.resourcesGenerated.find((resGen) => resGen.id === resourceName).value -
                      a.resourcesGenerated.find((resGen) => resGen.id === resourceName).value
                  )

                if (jobsForResource.length) {
                  for (let i = 0; i < jobsForResource.length && !state.scriptPaused; i++) {
                    if (unassigned === 0) break
                    const job = jobsForResource[i]

                    let isSafeToAdd = job.current < Math.min(job.max, job.maxAvailable)

                    const isFoodJob = !!job.resourcesGenerated.find((res) => res.id === 'Food')
                    if (isFoodJob) {
                      isSafeToAdd = isSafeToAdd || (resources.get('Food').speed <= minimumFood && foodJob.current < foodJob.maxAvailable)
                    }

                    if (!job.isSafe) {
                      job.resourcesUsed.every((resUsed) => {
                        const res = resources.get(resUsed.id)

                        if (!res || res.speed < Math.abs(resUsed.value * 2)) {
                          isSafeToAdd = false
                        }

                        if (res && resUsed.id === 'Food' && res.speed - resUsed.value < minimumFood) {
                          const foodJob = getAllAvailableJobs().find((job) => job.resourcesGenerated.find((res) => res.id === 'Food'))

                          if (foodJob) {
                            i -= 1
                            job = foodJob
                            isSafeToAdd = true
                            return false
                          } else {
                            isSafeToAdd = false
                          }
                        }

                        return isSafeToAdd
                      })
                    }

                    if (isSafeToAdd) {
                      const addJobButton = job.container.querySelector('button.btn-green')
                      if (addJobButton) {
                        logger({ msgLevel: 'log', msg: `Assigning worker as ${job.id}` })

                        addJobButton.click()
                        job.current += 1
                        unassigned -= 1
                        canAssignJobs = !!unassigned
                        await sleep(20)
                        if (!navigation.checkPage(CONSTANTS.PAGES.POPULATION)) return
                      }
                    }
                  }
                }
              }
            } else {
              for (let i = 0; i < availableJobs.length; i++) {
                if (state.scriptPaused) break

                const job = availableJobs[i]

                let isSafeToAdd = job.current < Math.min(job.max, job.maxAvailable)

                const isFoodJob = !!job.resourcesGenerated.find((res) => res.id === 'Food')
                if (isFoodJob) {
                  isSafeToAdd = isSafeToAdd || (resources.get('Food').speed <= minimumFood && foodJob.current < foodJob.maxAvailable)
                }

                if (!job.isSafe) {
                  job.resourcesUsed.every((resUsed) => {
                    const res = resources.get(resUsed.id)

                    if (!res || res.speed < Math.abs(resUsed.value * 2)) {
                      isSafeToAdd = false
                    }

                    if (res && resUsed.id === 'Food' && res.speed - resUsed.value < minimumFood) {
                      const foodJob = availableJobs.find((job) => job.resourcesGenerated.find((res) => res.id === 'Food'))

                      if (foodJob) {
                        job = foodJob
                        isSafeToAdd = true
                        return false
                      } else {
                        isSafeToAdd = false
                      }
                    }

                    return isSafeToAdd
                  })
                }

                if (isSafeToAdd && !state.scriptPaused) {
                  const addJobButton = job.container.querySelector('button.btn-green')
                  if (addJobButton) {
                    logger({ msgLevel: 'log', msg: `Assigning worker as ${job.id}` })

                    addJobButton.click()
                    job.current += 1
                    unassigned -= 1
                    canAssignJobs = !!unassigned
                    await sleep(20)
                    if (!navigation.checkPage(CONSTANTS.PAGES.POPULATION)) return
                    break
                  }
                }
              }
            }
          }
        }

        availableJobs = getAllAvailableJobs()
      }

      const unassigned = container
        .querySelector('div > span.ml-2')
        .textContent.split('/')
        .map((pop) => numberParser.parse(pop.trim()))
        .shift()
      if (unassigned === 0) {
        canAssignJobs = false
      }

      await sleep(10)
      if (!navigation.checkPage(CONSTANTS.PAGES.POPULATION)) return
    }
  }
}

export default {
  page: CONSTANTS.PAGES.POPULATION,
  enabled: () => userEnabled() && navigation.hasPage(CONSTANTS.PAGES.POPULATION) && hasUnassignedPopulation() && getAllJobs().length,
  action: async () => {
    await navigation.switchPage(CONSTANTS.PAGES.POPULATION)

    if (navigation.checkPage(CONSTANTS.PAGES.POPULATION)) await executeAction()
  },
}
