/* eslint-disable max-len */
'use strict'
const fs = require('fs')
const titlePrefix = 'Automated weekly onsen rewards start block:'
const title = process.env.PULL_REQUEST_TITLE || process.argv.splice(2)[0]
console.log(`title: '${title}'`)
if (title && title.startsWith(titlePrefix)) {
  try {
    // Get Start and End block number from PR title.
    const numberPattern = /\d+/g
    const numbers = title.match(numberPattern)
    process.env.REWARDS_START_BLOCK = numbers[0]
    process.env.REWARDS_END_BLOCK = numbers[1]

    // generate reward file in temp directory for validation.
    const tempDirectory = 'temp'
    process.env.DIRECTORY = tempDirectory
    const { getOnsenRewards } = require('./index')
    return getOnsenRewards().then(function () {
      const filename = `dataset-${process.env.REWARDS_START_BLOCK}-${process.env.REWARDS_END_BLOCK}.json`
      const originalDataFileContent = fs.readFileSync(`data/${filename}`)
      const tempDataFileContent = fs.readFileSync(
        `${tempDirectory}/${filename}`
      )
      if (originalDataFileContent.equals(tempDataFileContent)) {
        console.log(`Reward file: ${filename} is valid.`)
        return
      }
      throw new Error(`Can't verify reward file: ${filename}`)
    })
  } catch (error) {
    console.log(error)
    throw new Error(`Something went wrong. Please check logs: ${error}`)
  }
}
throw new Error('Found empty title on pull request.')
