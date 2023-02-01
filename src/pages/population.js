import { CONSTANTS, navigation, selectors, logger, sleep, state, translate, resources, numberParser } from '../utils'
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
      id: translate(job.id, 'pop_'),
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
      id: job.id,
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
  return state.options.pages[CONSTANTS.PAGES.POPULATION] || false
}

const getAllJobs = () => {
  if (Object.keys(state.options[CONSTANTS.PAGES.POPULATION]).length) {
    let allowedJobs = Object.keys(state.options[CONSTANTS.PAGES.POPULATION])
      .filter((key) => !!state.options[CONSTANTS.PAGES.POPULATION][key])
      .map((key) => {
        const jobData = jobs.find((job) => job.id === key) || {}

        const job = {
          ...jobData,
          key: key,
          id: translate(key, 'pop_'),
          max: state.options[CONSTANTS.PAGES.POPULATION][key] === -1 ? 99999 : state.options[CONSTANTS.PAGES.POPULATION][key],
        }

        return job
      })
      .map((job) => {
        return {
          ...job,
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

    return allowedJobs
  }

  return []
}

const getAllAvailableJobs = () => {
  const allowedJobs = getAllJobs()
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
    .filter((job) => job.id && !!job.container.querySelector('button.btn-green') && job.current < job.maxAvailable)

  return availableJobs
}

const doPopulationWork = async () => {
  let canAssignJobs = true
  const container = selectors.getActivePageContent()

  let availablePop = container
    .querySelector('div > span.ml-2')
    .textContent.split('/')
    .map((pop) => numberParser.parse(pop.trim()))

  let availableJobs = getAllAvailableJobs()

  if (availablePop[0] > 0 && availableJobs.length) {
    const minimumFood = state.options.automation.minimumFood || 0

    while (!state.scriptPaused && canAssignJobs) {
      const jobsWithSpace = availableJobs.filter((job) => !!job.container.querySelector('button.btn-green'))
      canAssignJobs = false

      if (jobsWithSpace.length) {
        const foodJob = jobsWithSpace.find((job) => job.resourcesGenerated.find((res) => res.id === 'Food'))

        if (foodJob && (resources.get('Food').speed <= minimumFood || foodJob.current < foodJob.max) && foodJob.current < foodJob.maxAvailable) {
          const addJobButton = foodJob.container.querySelector('button.btn-green')
          if (addJobButton) {
            logger({ msgLevel: 'log', msg: `Assigning worker as ${foodJob.id}` })

            addJobButton.click()
            canAssignJobs = true
            foodJob.current++
            await sleep(1000)
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
              // 'Copper', // Same as Iron
              'Mana',
              // 'Faith', // Same as Mana
              'Research',
              'Materials',
              'Steel',
              'Supplies',
              'Gold',
              'Crystal',
              'Horse',
              // 'Cow', // Same as Horse
            ]
              .filter((res) => resources.get(res))
              .filter((res) => jobsWithSpace.find((job) => job.resourcesGenerated.find((resGen) => resGen.id === res)))

            const resourcesWithNegativeGen = resourcesToProduce.filter((res) => resources.get(res) && res.speed < 0)
            const resourcesWithNoGen = resourcesToProduce.filter((res) => !resourcesWithNegativeGen.includes(res) && resources.get(res) && !res.speed)
            const resourcesLeft = resourcesToProduce.filter((res) => !resourcesWithNegativeGen.includes(res) && !resourcesWithNoGen.includes(res))

            const resourcesSorted = resourcesWithNegativeGen.concat(resourcesWithNoGen).concat(resourcesLeft)

            if (resourcesSorted.length) {
              for (let i = 0; i < resourcesSorted.length && !state.scriptPaused; i++) {
                if (unassigned === 0) break

                const resourceName = resourcesSorted[i]

                const jobsForResource = jobsWithSpace
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

                    let isSafeToAdd = true

                    if (!job.isSafe) {
                      job.resourcesUsed.forEach((resUsed) => {
                        const res = resources.get(resUsed.id)

                        if (!res || res.speed < Math.abs(resUsed.value * 2)) {
                          isSafeToAdd = false
                        }
                      })
                    }

                    if (isSafeToAdd) {
                      const addJobButton = job.container.querySelector('button.btn-green')
                      if (addJobButton) {
                        logger({ msgLevel: 'log', msg: `Assigning worker as ${job.id}` })

                        addJobButton.click()
                        unassigned -= 1
                        canAssignJobs = !!unassigned
                        await sleep(1000)
                        if (!navigation.checkPage(CONSTANTS.PAGES.POPULATION)) return
                      }
                    }
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
  id: CONSTANTS.PAGES.POPULATION,
  enabled: () => userEnabled() && navigation.hasPage(CONSTANTS.PAGES.POPULATION) && hasUnassignedPopulation() && getAllJobs().length,
  action: async () => {
    await navigation.switchPage(CONSTANTS.PAGES.POPULATION)

    if (navigation.checkPage(CONSTANTS.PAGES.POPULATION)) await doPopulationWork()

    await sleep(5000)
  },
}
