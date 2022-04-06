 
// Starting-point branches are branches that contain the state of the code that is needed to be able to start and complete a quest. 

// There can be 2 types of checkpoint branches:
//  1. 'starting_point/<prevQuestName>_solution' - for quests that rely on previous quests being completed by the user in order to be played
//  2. 'starting_point/<questName>_prerequisite' - for quests that need a custom code setup that isn't organically added by the user in previous quests (example: a "fix-ui-bug" quest that upon starting adds a new piece of UI that wasn't present before)


const BRANCHES = {
  MAIN: "main",
  LOCAL_SETUP_SOLUTION: "checkpoint/localsetup_solution",
  DATA_SEEDING_SOLUTION: "checkpoint/dataseeding_solution",
};

/*
  main
    |_ local_setup_solution
        |_ data_seeding_solution
 */
const branchHierarchyMap = {
  [BRANCHES.MAIN]: [BRANCHES.LOCAL_SETUP_SOLUTION],
  [BRANCHES.LOCAL_SETUP_SOLUTION]: [BRANCHES.DATA_SEEDING_SOLUTION],
};

module.exports = {
  branchHierarchyMap
}
