const util = require("util");
const exec = util.promisify(require("child_process").exec);

async function reset() {
  await exec("git checkout main");
  await exec("git fetch origin main");
  await exec("git reset --hard origin/main");
}

reset().then(() => {
  console.log("Your `main` branch is now up to date.");
}).catch(err => {
  console.error(err.message);
});