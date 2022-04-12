#!/bin/sh

ANYTHINK_MARKET_REPO="trywilco/Anythink-Market-Base.git"
ANYTHINK_MARKET_BACKUP_REPO="trywilco/Anythink-Market-Base-Previous-Version.git"
TMP_DIR=$(mktemp -d -t ci-XXXXXXXXXX)

cd $TMP_DIR
echo "Creating a temp folder at $TMP_DIR"

echo "Cloning backup repo $ANYTHINK_MARKET_BACKUP_REPO"
git clone --bare git@github.com:$ANYTHINK_MARKET_BACKUP_REPO repo
cd repo

read -p "This will override the Anythink Market base, are you sure you want to continue? press any key to continue (or ctrl+c to cancel)"  -n 1 -r
echo "Pushing to market repo $ANYTHINK_MARKET_REPO"
git push --mirror git@github.com:$ANYTHINK_MARKET_REPO

rm -rf $TMP_DIR
