import { CONSTANTS } from '../utils'

import ArmyArmy from './army-army'
import ArmyExplore from './army-explore'
import ArmyAttack from './army-attack'
import { getBuildSubpage } from './build'
import Marketplace from './marketplace'
import Population from './population'
import ResearchResearch from './research-research'
import MagicPrayers from './magic-prayers'
import MagicSpells from './magic-spells'
import Diplomacy from './diplomacy'

export default {
  ArmyArmy,
  ArmyExplore,
  ArmyAttack,
  BuildCity: getBuildSubpage(CONSTANTS.SUBPAGES.CITY),
  BuildColony: getBuildSubpage(CONSTANTS.SUBPAGES.COLONY),
  BuildAbyss: getBuildSubpage(CONSTANTS.SUBPAGES.ABYSS),
  Marketplace,
  Population,
  ResearchResearch,
  MagicPrayers,
  MagicSpells,
  Diplomacy,
}
