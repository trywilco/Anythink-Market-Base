const util = require("util");
const exec = util.promisify(require("child_process").exec);
const args = require("yargs").argv;
const axios = require("axios");
const actionsExec = require("@actions/exec");

const ENGINE_URL = "https://engine.wilco.gg";
process.env['WILCO_ID'] = 'fake-wilco-id';

let git;

// Skip unstable quest tests
// TODO fix the quest tests: https://app.clickup.com/t/3aybyvq
const SKIPPED_QUESTS = ['newrelic_performance'];

const initGit = (path) => async (args) => {
  return await exec(`git ${args}`, { cwd: path });
};

function printUsage() {
  console.log(
    "Run using the command: \n node test_branches.js --backend=<node|rails|python>"
  );
}

async function main() {
  if (!process.env.API_SERVER_TOKEN) {
    console.log("Please include the API_SERVER_TOKEN env var");
  }

  if (!args.backend) {
    printUsage();
    return;
  }

  const { data } = await axios.get(`${ENGINE_URL}/api/v1/quests/lastSimulationGitHubActions`, {
    headers: { Authorization: `ServerToken ${process.env.API_SERVER_TOKEN}` },
  });

  git = initGit(args.repoPath);

  const allQuests = data.quests;
  for (const quest of allQuests) {
    if (SKIPPED_QUESTS.includes(quest.primaryId)) {
      console.log(`Quest ${quest.primaryId} is marked as skipped, skipping...`)
      continue;
    }
    await testQuest(quest, allQuests, args.backend);
  }
}

async function runCommands(item) {
  if (item.hasOwnProperty("or")) {
    let lastError;
    for (let cmd of item.or) {
      try {
        await runCommands(cmd);
        return;
      } catch (e) {
        lastError = e;
      }
    }
    if (lastError) {
      throw lastError;
    }
  } else if (Array.isArray(item)) {
    for (let cmd of item) {
      await runCommands(cmd);
    }
  } else {
    const { cmd, ...args } = item;
    console.log(`Runs command: ${cmd}`)
    await actionsExec.exec(cmd, null, args);
  }
}


function getGithubActionsCommands(githubActions, backend) {
  let actions = githubActions.map((action) => ({
    ...action, cwd: `../backend/${backend}`
  }))
  if (backend === "node") {
    actions = actions.concat({
      cmd: 'mongo anythink-market --eval "db.dropDatabase();"',
      cwd: `../backend/${backend}`
    });
  }
  return actions;
}

async function testFailOnQuestDependencyBranch({
                                                 quest,
                                                 questDependencyBranch,
                                                 simulationPrimaryId,
                                                 simulationId,
                                                 githubActions,
                                                 backend
                                               }) {
  let hasErrors = false;
  await git(`checkout -f ${questDependencyBranch}`);
  console.log(`\nRunning Github actions from quest: "${quest.primaryId}", making sure they are failing on quest dependency solution branch: "${questDependencyBranch}"`);
  const commands = getGithubActionsCommands(githubActions, backend);
  try {
    await runCommands(commands);
    console.error("=============================================================");
    console.error(`Git actions should not pass for solution branch: "${questDependencyBranch}"`);
    console.error("=============================================================");
    console.log({
      simulationPrimaryId,
      simulationId,
      githubActionCommands: commands,
    })
    hasErrors = true;
  } catch (error) {
    console.log('Git action failed as expected');
  }
  if (hasErrors) {
    throw new Error(`Github actions should pass for solution branch: "${questDependencyBranch}"`)
  }
}

async function testSolutionBranch({ quest, simulationPrimaryId, simulationId, githubActions, backend }) {
  await git(`checkout -f ${quest.solutionBranch}`);
  console.log(`\nRunning Github actions for quest: "${quest.primaryId}", should pass`)
  const commands = getGithubActionsCommands(githubActions, backend);
  try {
    await runCommands(commands);
    console.log('=============================================================');
    console.log(`Github actions passed for quest: "${quest.primaryId}"`);
    console.log('=============================================================');
  } catch (error) {
    console.log('=============================================================');
    console.log(`Failed running Github actions for quest: "${quest.primaryId}"`)
    console.log({
      simulationPrimaryId,
      simulationId,
      githubActionCommands: commands,
    })
    console.error(error);
    console.log('=============================================================');
    throw error;
  }
}

async function testQuest(quest, allQuests, backend) {
  if (!quest.solutionBranch) {
    console.log(`No solution branch for quest "${quest.primaryId}" Skipping...`);
    return;
  }
  const { simulationPrimaryId, simulationId, githubActionsByFramework } = quest?.lastSimulationGitHubActions || {};
  if (!githubActionsByFramework) {
    console.log(`No github actions for quest "${quest.primaryId}", Skipping...`);
    return;
  }
  const githubActions = githubActionsByFramework[backend];
  const questDependency = allQuests.find(q => q.primaryId === quest.questDependency);
  if (!questDependency) {
    console.log(`No quest dependency for quest "${quest.primaryId}", Skipping...`);
    return;
  }

  const questDependencyBranch = questDependency?.solutionBranch || 'main';
  await testFailOnQuestDependencyBranch({
    quest,
    questDependencyBranch,
    simulationPrimaryId,
    simulationId,
    githubActions,
    backend
  });
  await testSolutionBranch({ quest, simulationPrimaryId, simulationId, githubActions, backend });
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
