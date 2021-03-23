# Onsen rewards snapshot

Generate snapshot for distributing Vesper rewards to staker of VSP-ETH LP token in Sushi Onsen.

## Setup
1. Install 
```
npm i
```

2. Set required properties. There are 2 ways to do it, choose what seems best to you.
- Using env var
```bash
export NODE_URL="eth mainnet url"
export REWARDS_START_BLOCK="eth block number"
export REWARDS_END_BLOCK="eth block number"
```
- Using `config/local.json`
```json
{
    "nodeUrl": "eth mainnet url",
    "rewardsStartBlock": "eth block number",
    "rewardsEndBlock": "eth block number"
}
```

3. Verify that default properties are valid for you case, if not use env var or `local.json` to override them.
- Default properties
```json
{
  "epochDuration": 1440,
  "rewardsPerEpoch": "625000000000000000000"
}
```

4. Run app to generate snopshot
```node
node index.js
```
> It will generate `rewards.json` file in root of the project. This file contains all the addresses and their rewards for given strat and end block.