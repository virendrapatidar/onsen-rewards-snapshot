#!/usr/bin/env node
'use strict'
const config = require('config')
const createErc20 = require('../packages/erc-20-lib')
const fetch = require('node-fetch')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const createMerkleBox = require('../packages/merkle-box-lib')
// VSP Token address
const token = '0xbA4cFE5741b357FA371b506e5db0774aBFeCf8Fc'
const nodeUrl = config.get('nodeUrl')

const provider = new HDWalletProvider({
  addressIndex: process.env.ACCOUNT || 0,
  mnemonic: config.get('mnemonic'),
  numberOfAddresses: 1,
  providerOrUrl: nodeUrl
})
const from = provider.getAddress(0)
const web3 = new Web3(provider)
const merkleBoxAddress = createMerkleBox.addresses.mainnet
const merkleBox = createMerkleBox(web3, merkleBoxAddress, { from })

const tokenAddress = token.startsWith('0x')
  ? token
  : createErc20.util.tokenAddress(token)

const toTimestamp = str =>
  /^[0-9]+$/.test(str)
    ? Number.parseInt(str)
    : Math.round(new Date(str).getTime() / 1000)

function prepareExpiryDate(expiryDays) {
  const date = new Date()
  date.setDate(date.getDate() + expiryDays)
  return date.toISOString().split('T')[0]
}

function createClaimGroup(datasetUrl, expiryDays) {
  const memo = `datasetUri=${datasetUrl}`
  const expiryDate = prepareExpiryDate(expiryDays)
  return fetch(datasetUrl)
    .then(res => res.json())
    .then(function (recipients) {
      const total = recipients
        .reduce((sum, recipient) => sum + BigInt(recipient.amount), BigInt(0))
        .toString()
      const root = createMerkleBox.util.bufferToHex(
        createMerkleBox.util.calcMerkleTree(recipients).getRoot()
      )
      return Promise.all([
        total,
        root,
        createErc20(web3, tokenAddress, { from }).approve(
          merkleBoxAddress,
          total
        )
      ])
    })
    .then(([total, root]) =>
      merkleBox.newClaimsGroup(
        tokenAddress,
        total,
        root,
        toTimestamp(expiryDate),
        memo
      )
    )
    .then(function (receipt) {
      console.log(receipt.events.NewMerkle.returnValues)
    })
    .catch(console.error)
    .finally(function () {
      provider.engine.stop()
    })
}

module.exports = { createClaimGroup }
