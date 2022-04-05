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
