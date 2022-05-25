# Wilco Helpers

This directory holds all kinds of utilities we use for managing the anythink-market codebase.

There are some helper functions for working with the quest and branch dependencies. 

## Installations

Go into the `.wilco-helpers` folder and run:
```bash
yarn install
```

## Scripts

These scripts work against the production `wilco-engine` and require an API TOKEN (available in 1Password shared vault under `Update Quest Branches (Anythink-Market-Base)`).

### Print all quest + branch tree (data is from `prod`):

```bash
API_SERVER_TOKEN=<token> yarn print-tree
````

### Update all child branches of `BRANCH`:

This is the script we run whenever a PR is merged, which updates (via rebase) all child branches of the branch we just changed. Read more about it in the [Notion Documentation](https://www.notion.so/trywilco/Managing-User-Repos-ac870873ff4b481ca501e2c373e59d3d)

NOTE: This does not modify this Github repo directly, but merely allows you to test the actions locally on your own machine.

```bash
BRANCH=<branch_name> API_SERVER_TOKEN=<token> yarn update-child-branches
````