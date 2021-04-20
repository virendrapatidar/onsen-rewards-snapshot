'use strict'
const config = require('config')
const args = require('minimist')(process.argv.slice(2))
const { createClaimGroup } = require('./src/create-claim-group')
const datasetUrl = args.f
const expiryDays = config.get('expiryDays')
if (datasetUrl) {
  createClaimGroup(datasetUrl, expiryDays)
    .then(function () {
      console.log('Claim group created.')
    })
    .catch(e => console.error('Error while calculating rewards', e))
} else {
  console.error('Use -f option to provide data set file URL.')
  process.exit(-1)
}
