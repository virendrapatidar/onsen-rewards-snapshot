'use strict'

const BN = require('bn.js')
const config = require('config')
const fs = require('fs')
const { parseAsync } = require('json2csv')
const Web3 = require('web3')

const lpStakingPoolAbi = require('./src/abi/masterChef.json')
const { getRewardsForAllEpoch } = require('./src/calculateRewards')
const onsenData = require('./src/onsenData')

const nodeUrl = config.get('nodeUrl')
const rewardsStartBlock = parseInt(config.get('rewardsStartBlock'))
const rewardsEndBlock = parseInt(config.get('rewardsEndBlock'))

console.log('Rewards Start Block:', rewardsStartBlock)
console.log('Rewards End Block:', rewardsEndBlock)

function totalRewards() {
  const DECIMAL = new BN('1000000000000000000')
  const totalBlocks = rewardsEndBlock - rewardsStartBlock
  const epochDuration = new BN(config.get('epochDuration'))
  const totalEpoch = new BN(totalBlocks).mul(DECIMAL).div(epochDuration)
  const rewardsPerEpoch = new BN(config.get('rewardsPerEpoch'))
  return rewardsPerEpoch.mul(totalEpoch).div(DECIMAL).toString()
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

// eslint-disable-next-line no-unused-vars
function writeEpochRewards(allEpochRewards) {
  const fields = ['address', 'balance', 'epochEnd', 'rewards']
  allEpochRewards.forEach(function (epochRewards) {
    const fileName = `./output/${epochRewards[0].epochEnd}.csv`
    console.log('Writing rewards data to', fileName)
    return parseAsync(epochRewards, { fields }).then(csvData =>
      fs.writeFileSync(fileName, csvData)
    )
  })
  return allEpochRewards
}

function consolidateRewards(allEpochRewards) {
  const accounts = {}
  allEpochRewards.forEach(function (epochRewards) {
    epochRewards.forEach(function (userInfo) {
      const userRewards = accounts[userInfo.address]
        ? new BN(accounts[userInfo.address].rewards)
            .add(new BN(userInfo.rewards))
            .toString()
        : userInfo.rewards

      accounts[userInfo.address] = {
        address: userInfo.address,
        rewards: userRewards
      }
    })
  })
  return accounts
}

function writeConsolidateRewards(allEpochRewards) {
  const accounts = consolidateRewards(allEpochRewards)
  const accountsList = []
  let calculateRewards = new BN('0')
  Object.values(accounts).forEach(function (account) {
    calculateRewards = calculateRewards.add(new BN(account.rewards))
    accountsList.push({ account: account.address, amount: account.rewards })
  })

  console.log('Unique address with rewards', accountsList.length)
  console.log('Total rewards to distibute:', totalRewards())
  console.log('Calculated total rewards:', calculateRewards.toString())

  const fileName = `./rewards-${rewardsStartBlock}-${rewardsEndBlock}.json`
  console.log('Writing consolidated rewards data to', fileName)

  fs.writeFileSync(fileName, JSON.stringify(accountsList, null, 2))
  // Just to terminate the process once done
  setTimeout(() => process.exit(0), 3000)
}

async function getOnsenRewards() {
  const web3 = new Web3(nodeUrl)
  const lpStakingPool = new web3.eth.Contract(
    lpStakingPoolAbi,
    onsenData.lpStakingPoolAddress
  )

  return lpStakingPool
    .getPastEvents('Deposit', {
      filter: { pid: onsenData.poolId },
      fromBlock: onsenData.pair.deployBlock,
      toBlock: rewardsEndBlock,
      address: lpStakingPool.address
    })
    .then(function (depositEvents) {
      console.log('Total deposit events', depositEvents.length)
      const addressList = depositEvents.map(event => event.returnValues.user)
      const uniqueList = addressList.filter(onlyUnique)
      console.log('Unique address count', uniqueList.length)
      return uniqueList
    })
    .then(function (addresses) {
      return getRewardsForAllEpoch(
        addresses,
        rewardsStartBlock,
        rewardsEndBlock
      )
    })
}

getOnsenRewards()
  // if you want data for each epoch, uncomment below line
  // .then(writeEpochRewards)
  .then(writeConsolidateRewards)
  .catch(e => console.error('Error while calculating rewards', e))
