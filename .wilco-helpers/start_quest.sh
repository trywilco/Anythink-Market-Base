#!/bin/bash

echo "Stashing any existing changes..."
git stash

echo "Resetting local 'main' branch to 'origin/main'..."
{
  git checkout main &&
  git fetch origin main &&
  git reset --hard origin/main
} || {
  echo "Could not reset 'main' branch. Aborting."
  exit 1
}

echo "Your 'main' branch is now up to date."
exit 0
