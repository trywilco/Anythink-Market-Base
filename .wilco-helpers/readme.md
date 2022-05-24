# Wilco Helpers

## Installations

Go into the `.wilco-helpers` folder and run:
```bash
yarn install
```

### Print all quest + branch tree:

```bash
API_SERVER_TOKEN=<token> yarn print-tree
````

### Update all child branches of `BRANCH`:
```bash
BRANCH=<branch_name> API_SERVER_TOKEN=<token> yarn update-child-branches
````