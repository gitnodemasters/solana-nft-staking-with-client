import _ from "lodash"
import { PublicKey } from "@solana/web3.js"
import scriptRunner, { ScriptRunnerArgs } from "./scriptRunner"

const main = async ({
  connection,
  keypair,
  wallet,
  provider,
  program,
  scriptConfig,
  args,
}: ScriptRunnerArgs) => {
  const mintAddresses = scriptConfig.validNftMints
  const authorityPublicKey = program.provider.wallet.publicKey

  if (!args["pool-key"]) {
    throw new Error("Must provide pool public key")
  }
  const poolPublicKey = new PublicKey(args["pool-key"])
  const poolAccountInfo = await program.account.pool.fetch(poolPublicKey)

  let batchSize = 20
  if (mintAddresses.length < batchSize) {
    console.log("adding mintAddress:", mintAddresses)
    await program.rpc.addMintAddresses(
      mintAddresses.map((element) => new PublicKey(element)),
      0,
      {
        accounts: {
          authority: authorityPublicKey,
          poolAccount: poolPublicKey,
          config: poolAccountInfo.config,
        },
      }
    )
  } else {
    let start = 0
    do {
      let mintAddressesBatch = mintAddresses.slice(start, start + batchSize)
      console.log("adding mintAddress:", mintAddressesBatch)
      await program.rpc.addMintAddresses(
        mintAddressesBatch.map((element) => new PublicKey(element)),
        start,
        {
          accounts: {
            authority: authorityPublicKey,
            poolAccount: poolPublicKey,
            config: poolAccountInfo.config,
          },
        }
      )
      start = start + batchSize
    } while (start < mintAddresses.length)
  }
  return
}

scriptRunner(main)
