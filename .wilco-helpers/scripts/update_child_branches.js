const util = require("util");
const exec = util.promisify(require("child_process").exec);
const args = require("yargs").argv;
const axios = require("axios");

const ENGINE_URL = 'https://engine.wilco.gg';

let git;
let BRANCH;
let ANYTHINK_REPO_PATH;
let RESULTS = [];
let BRANCHES_TO_UPDATE = [];
let HAS_ERRORS = false;
const branchHierarchyMap = {};
const questHierarchyMap = {};

function printUsage() {
  console.log(
    "Run using the command: \n node update_child_branches.js --repoPath=<local-path-to-market-base-repo> --branch=<branch-name> --onlyPrintTree"
  );
}

async function main() {
  if (!args.repoPath || !args.branch) {
    printUsage();
    return;
  } else {
    BRANCH = args.branch;
    ANYTHINK_REPO_PATH = args.repoPath;
  }

  if (!process.env.API_SERVER_TOKEN) {
    console.log("Please include the API_SERVER_TOKEN env var");
  }

  const { data } = await axios.get(`${ENGINE_URL}/api/v1/quests`, {
    headers: { Authorization: `ServerToken ${process.env.API_SERVER_TOKEN}` }
  });
  const questsMap = data.quests.reduce((map, quest) => {
    map[quest.primaryId] = quest;
    return map;
  }, {});
  branchHierarchyMap.main = ['quest_solution/onboarding'];
  for (const quest of data.quests) {
    if (quest.questDependency) {
      const questDependency = questsMap[quest.questDependency];
      if (quest.solutionBranch) {
        branchHierarchyMap[questDependency.solutionBranch] = branchHierarchyMap[questDependency.solutionBranch] || [];
        branchHierarchyMap[questDependency.solutionBranch].push(quest.solutionBranch);
      }
      questHierarchyMap[questDependency.primaryId] = questHierarchyMap[questDependency.primaryId] || [];
      questHierarchyMap[questDependency.primaryId].push(quest.primaryId);
    }
  }
  git = initGit(args.repoPath);
  await git("status");

  console.log("\n+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=");
  console.log("Tree of child branches for '" + args.branch + "':");
  console.log("+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=\n");
  printTreeView(args.branch, branchHierarchyMap);

  console.log("\n+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=");
  console.log("Tree of quests:");
  console.log("+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=\n");
  printTreeView('onboarding', questHierarchyMap);

  if (args.onlyPrintTree) {
    return;
  }

  await updateChildBranches(args.branch);
  if (args.forcePush === "true" && !HAS_ERRORS) {
    await forcePushChildBranches();
  }
}

async function forcePushChildBranches() {
  console.log("\n+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=");
  console.log(
    "Force pushing updated branches:\n",
    "*",
    BRANCHES_TO_UPDATE.join("\n * ")
  );
  console.log("+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=\n");

  await git(`push --force origin ${BRANCHES_TO_UPDATE.join(" ")}`);
}

const initGit = (path) => async (args) => {
  return await exec(`git ${args}`, { cwd: path });
};

let treeOutput = "";

function buildTreeView(item, hierarchyMap, tabs = 2) {
  if (hierarchyMap[item]) {
    hierarchyMap[item].map((childItem) => {
      for (let i = 0; i < tabs; i++) {
        treeOutput += " ";
      }
      treeOutput += `|_ ${childItem} \n`;
      buildTreeView(childItem, hierarchyMap, tabs + 3);
    });
  }
}

function printTreeView(root, hierarchyMap) {
  treeOutput = "";
  console.log(root);
  buildTreeView(root, hierarchyMap);
  console.log(treeOutput);
}

async function rebaseTree(branch, branchHierarchyMap) {
  if (branchHierarchyMap[branch]) {
    for (const childBranch of branchHierarchyMap[branch]) {
      const report = { branch: childBranch };
      process.stdout.write(`* Rebasing "${childBranch}" onto "${branch}"...`);
      try {
        await git(`checkout ${childBranch}`)
        await git(`rebase ${branch}`);
        console.log(` DONE.`);
        await rebaseTree(childBranch, branchHierarchyMap);
      } catch (e) {
        HAS_ERRORS = true;
        report.error = e;
        console.log(` ERROR.`);
        if (e.stderr?.includes("git rebase --abort")) {
          const { stdout } = await git("diff");
          report.diff = stdout;
          await git(`rebase --abort`);
        }
      } finally {
        RESULTS.push(report);
        BRANCHES_TO_UPDATE.push(childBranch);
      }
    }
  }
}

async function updateChildBranches(branch) {
  console.log("\n+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=");
  console.log("Updating all child branches of '" + branch + "':");
  console.log("+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=\n");
  await git(`checkout ${branch}`);

  await rebaseTree(branch, branchHierarchyMap);
  await git(`checkout ${branch}`);

  if (RESULTS.filter((b) => b.error).length > 0) {
    console.log("\n DETAILED REPORT: \n");
    RESULTS.forEach((branch) => {
      console.log(
        "--------------------------------------------------------------------------------"
      );
      console.log(
        `##### "${branch.branch}": ${branch.error ? "FAILED" : "SUCCESS"}`
      );

      if (branch.error) {
        console.log("\n# ERROR: \n" + branch.error.message);
        if (branch.diff) {
          console.log("# DIFF: \n" + branch.diff);
        }
      }
    });
    process.exit(1);
  } else {
    console.log("\n **** DONE SUCCESSFULLY.");
  }
}

function getSubstringAfter(str, substr) {
  return str.substring(str.indexOf(substr) + substr.length);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    if (err.code === "ENOENT") {
      console.log(`ERROR: Path not found: ${ANYTHINK_REPO_PATH}`);
    } else if (err?.stderr?.includes("you need to resolve")) {
      console.log("ERROR: Git is in the middle of a conflict");
    } else if (err?.stderr?.includes("did not match any file")) {
      const badBranch = getSubstringAfter(err.cmd, "git checkout ");
      console.log(`ERROR: Branch name "${badBranch}" not found`);
    } else {
      console.log(err);
    }
    process.exit(1);
  });
