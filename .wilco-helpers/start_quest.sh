#!/bin/bash

printf "[=  ] Stashing any existing changes ... \n"
git stash &> /dev/null

printf "[== ] Resetting local 'main' branch to 'origin/main' ... \n"
{
  git checkout main && git fetch origin main && git reset --hard origin/main
} &> /dev/null || {
  printf "[==X] ERROR: Could not reset local 'main' branch. Aborting.\n"
  exit 1
}

printf "[===] SUCCESS: Your local 'main' branch is now up to date with origin.\n"
exit 0
