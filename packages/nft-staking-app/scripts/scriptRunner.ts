import _ from "lodash"
import fs from "fs"
import { Provider, Wallet, Program, Idl } from "@project-serum/anchor"
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js"
import nftStakingIdl from "./nft_staking.json"
import scriptConfig from "./scriptConfig.json"

interface Config {
  cluster: "devnet" | "mainnet-beta"
  keypair: string
  stakingProgramId: string
  maxNumNftMints: number
  rewardDuration: number
  unstakeDuration: number
  rewardMint: string
  validNftMints: string[]
}

export interface ScriptRunnerArgs {
  connection: Connection
  keypair: Keypair
  wallet: Wallet
  provider: Provider
  program: Program
  scriptConfig: Config
  args: Record<string, string>
}

const validateConfig = (value: any): value is Readonly<Config> => {
  const invalidKeyMap: string[] = []
  if (!_.includes(["devnet", "mainnet-beta"], value.cluster)) {
    invalidKeyMap.push("cluster")
  }
  _.forEach(["maxNumNftMints", "rewardDuration", "unstakeDuration"], (key) => {
    if (typeof value[key] !== "number") {
      invalidKeyMap.push(key)
    }
  })
  if (!_.isArray(value["validNftMints"])) {
    invalidKeyMap.push("validNftMints")
  }
  _.forEach(["keypair", "stakingProgramId"], (key) => {
    if (typeof value[key] !== "string") {
      invalidKeyMap.push(key)
    }
  })
  if (_.isEmpty(invalidKeyMap)) {
    return true
  }
  console.log(`Invalid keys: ${_.join(invalidKeyMap, ", ")}`)
  return false
}

const loadKeypair = (keypairPath: string) => {
  let keypair: Keypair
  try {
    const rawSecretKey = fs.readFileSync(keypairPath)
    const parsedSecretKey = new Uint8Array(JSON.parse(rawSecretKey.toString()))
    keypair = Keypair.fromSecretKey(parsedSecretKey)
  } catch (err) {
    console.log(err)
    throw new Error("Failed to load keypair")
  }
  return keypair
}

const parseArgs = (args: string[]) => {
  return _.reduce(
    args,
    (accum, value) => {
      if (_.startsWith(value, "--")) {
        let [argKey, argValue] = _.split(value, "=")
        argKey = argKey.slice(2)
        accum[argKey] = argValue
      }
      return accum
    },
    {}
  )
}

const scriptRunner = async (
  script: ({
    connection,
    keypair,
    wallet,
    provider,
    program,
  }: ScriptRunnerArgs) => Promise<void>
) => {
  if (!validateConfig(scriptConfig)) {
    throw new Error("Config is invalid")
  }
  const args = parseArgs(process.argv)
  const connection = new Connection(clusterApiUrl(scriptConfig.cluster))
  const keypair = loadKeypair(scriptConfig.keypair)
  const wallet = new Wallet(keypair)
  console.log(`Using wallet: ${wallet.publicKey.toString()}`)

  const provider = new Provider(connection, wallet, {
    preflightCommitment: "recent",
    commitment: "recent",
  })
  const PROGRAM_NFT_STAKING = new PublicKey(scriptConfig.stakingProgramId)
  const nftStakingProgram = new Program(
    nftStakingIdl as Idl,
    PROGRAM_NFT_STAKING,
    provider
  )
  console.log(`NFT Staking Program: ${PROGRAM_NFT_STAKING.toString()}`)

  await script({
    connection,
    keypair,
    wallet,
    provider,
    program: nftStakingProgram,
    scriptConfig,
    args,
  })

  console.log("Process complete")
}

export default scriptRunner
