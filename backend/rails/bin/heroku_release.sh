#!/usr/bin/env bash
#
# Usage: bin/heroku_deploy

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NO_COLOR='\033[0m'

set -euo pipefail

schema_version=$(bin/rails db:version | { grep "^Current version: [0-9]\\+$" || true; } | tr -s ' ' | cut -d ' ' -f3)

if [ -z "$schema_version" ]; then
  printf "\n⏳${YELLOW}   [Release Phase]: Seeding db from scratch.${NO_COLOR}\n"
  bin/rails db:init
  bin/rails db:migrate
  bin/rails db:seed
elif [ "$schema_version" -eq "0" ]; then
  printf "\n⏳${YELLOW}   [Release Phase]: Loading the database schema.${NO_COLOR}\n"
  bin/rails db:schema:load
  bin/rails db:seed
fi

printf "\n🎉${GREEN}   [Release Phase]: Database is up to date.${NO_COLOR}\n"