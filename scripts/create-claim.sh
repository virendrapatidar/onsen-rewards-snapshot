#!/bin/bash
# Pre-requisite
# 1. `NODE_URL` and `MNEMONIC` are set in .env file / github secrets on repo
title=PULL_REQUEST_TITLE
echo "PULL_REQUEST_TITLE: $PULL_REQUEST_TITLE"
echo "Title: $title"
if  [[ $title == "Automated weekly onsen rewards start block:*" ]];
then
    echo "Starting create claim."

    # Checkout main branch and pull latest code.
    git checkout main
    git pull 

    # install node dependencies
    npm i

    # Read the last file name.
    fileName=$(ls -r data | head -1)
    echo "Creating claim for fileName: $fileName"

    url="https://raw.githubusercontent.com/vesperfi/onsen-rewards-snapshot/main/data/${fileName}"
    #url="https://raw.githubusercontent.com/virendrapatidar/onsen-rewards-snapshot/main/data/${fileName}"
    echo "Running claim for url: $url"

    # Run script to create claim
    node create-claim.js -f $url

    echo "Create claim completed."
else
    echo "Skipping create claim."
fi
