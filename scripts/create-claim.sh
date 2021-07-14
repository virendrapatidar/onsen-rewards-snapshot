#!/bin/bash
# Pre-requisite
# 1. `NODE_URL` (mandatory) and `MNEMONIC` (mandatory) are set in .env file / github secrets on repo

# Set `REPO` and `PULL_REQUEST_TITLE` in .env for local testing with fork.
. .env

title="$PULL_REQUEST_TITLE"
echo "PULL_REQUEST_TITLE: $PULL_REQUEST_TITLE"
echo "Title: $title"

if [[ -z $REPO ]]; then
    REPO="vesperfi/onsen-rewards-snapshot"
fi
echo "Repo: $REPO"
prefix='Automated weekly onsen rewards start block:*'
if  [[ $title == $prefix* ]]; then
    echo "Starting create claim."

    # Checkout main branch and pull latest code.
    git checkout main
    git pull 

    # install node dependencies
    npm i

    # Read the last file name.
    fileName=$(ls -r data | head -1)
    echo "Creating claim for fileName: $fileName"
    noprefix=${fileName/*-/}
    startBlock=${noprefix/.json*/}
    echo "Start Block from file: $startBlock"
    if [[ $title == *$startBlock* ]]; then
        url="https://raw.githubusercontent.com/${REPO}/main/data/${fileName}"
        echo "File url: $url"
        if [[ `wget -S --spider $url  2>&1 | grep 'HTTP/1.1 200 OK'` ]]; then 
            echo "Running claim for url: $url"
            # Run script to create claim
            node create-claim.js -f $url
            echo "Create claim completed."
        else
            echo "File: $fileName not found at URL: $url"      
        fi        
    else
        echo "Last File: $fileName do not match with PR title."
    fi
else
    echo "Skipping create claim."
fi
