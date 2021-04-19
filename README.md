# Onsen rewards snapshot

Generate snapshot for distributing Vesper rewards to staker of VSP-ETH LP token in Sushi Onsen.

## Setup
1. Install 
```
npm i
```

2. Set required properties
- Set variables for NODE_URL and MNEMONIC
```
export NODE_URL="eth_mainnet_url"
export MNEMONIC="mnemonic"
```

Set other variables via command line options or export.
``` 
export REWARDS_START_BLOCK="rewardsStartBlock"       
export REWARDS_END_BLOCK="rewardsEndBlock"           
```

Check other default values in `config/local.json`  and `config/default.json`

3. Calculate onsen rewards data file using command line args. 
   
Command Syntax   
```
node index.js -s <rewardsStartBlock> -e <rewardsEndBlock>
```

Example: `calculate-rewards`
```
node index.js -s 12194440 -e 12240161
```

Raise Pull request to verify generated data file. Once PR is verified, approved and merged, call `create-claim` operation. 

4. Create claim using generated data file. 

Command Syntax
```
node create-claim.js -f <datasetUrl>
```

Example: `create-claim`
```
node create-claim.js -f "https://raw.githubusercontent.com/vesperfi/onsen-rewards/main/dataset4.json"
```

Create claim using fork for testing.
1. Create `config/local.json` and add `nodeUrl`
```
{
  "nodeUrl": "http://localhost:8545"
}
```
2. Create fork
```
npm run fork
```
3. Run 
```
node create-claim.js -f <datasetUrl>
```