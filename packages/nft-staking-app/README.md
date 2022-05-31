# Monkettes NFT Staking

## Initializing a pool

Prerequisites: make sure you have installed all dependencies using `yarn install`

### Step 1: Fill out the script config

The first step is to fill out the config file found in `./scripts/scriptConfig.json`. Each of the fields is described below.
```js
{
  "cluster": "mainnet-beta", // devnet | mainnet-beta
  "keypair": "./mainnet-wallet.json", // path to admin keypair
  "stakingProgramId": "BHvGoqbTvVVBUdDY42Et73FckAhBXj9QKFqKmf68PZ9S", // 
  "maxNumNftMints": 10, // maximum number of NFTs in the collection, this number cannot be changed
  "rewardDuration": 31536000, // how often you plan to refund the pool (in seconds)
  "unstakeDuration": 300, // how long it will take to withdraw an NFT after unstaking (in seconds)
  "rewardMint": "DgNPX1ESu2G3Hrjex9jB8FtC8gv4ZA5uZWsLCnn4rbe3", // the token mint used for paying rewards
  "validNftMints": [
    "3yhe9ctad2gKtKR3KPeNCRTkdt3cAw7zFkx2KaEMmsXJ",
    "G9stsZsqfJJ7R2aZVBd1jN5FCEdotiRm5mt7iHdG7fiy"    
  ] // the list of valid NFTs mints for staking 
}
```

### Step 2: Initialize pool

`yarn init-pool`
Once the script config is filled out, run the command above to initialize the pool. After this finishes running, write down the `pool-key` emitted by the script. This is the address of your NFT staking pool.

### Step 3: Add mint addresses

`yarn add-mint-addresses -- --pool-key=<POOL_KEY>`
This step will kick off the process of batch uploading the `validNftMints` to the program.

### Step 4: Replace the addresses on the app

Navigate to `./constants/mainnetBeta.ts` and replace the addresses you see there with the ones corresponding to your pool.
