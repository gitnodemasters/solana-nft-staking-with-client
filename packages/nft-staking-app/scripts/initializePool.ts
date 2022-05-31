import _ from "lodash"
import { Program, BN } from "@project-serum/anchor"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js"
import config from "./scriptConfig.json"
import * as utils from "./utils"
import scriptRunner, { ScriptRunnerArgs } from "./scriptRunner"

const main = async ({
  connection,
  keypair,
  wallet,
  provider,
  program,
  scriptConfig,
}: ScriptRunnerArgs) => {
  let [configAccount, configUuid] = await utils.getConfigAccount(
    wallet.publicKey,
    program.programId
  )
  let [poolAccount, poolBump] = await utils.getPoolAccount(
    wallet.publicKey,
    configAccount,
    program.programId
  )
  let [rewardAccount, rewardBump] = await utils.getRewardAccount(
    wallet.publicKey,
    poolAccount,
    new PublicKey(config.rewardMint),
    program.programId
  )

  const { maxNumNftMints, rewardDuration, unstakeDuration, rewardMint } =
    scriptConfig

  const configSpace =
    8 + // discriminator
    32 + // authority
    4 +
    6 + // uuid + u32 le
    4 + // num_mint
    4 + // u32 len for Vec<Pubkey>
    32 * maxNumNftMints

  console.log("configSpace", configSpace)

  const authorityPublicKey = program.provider.wallet.publicKey

  console.log("Initializing pool...")

  const txSig = await program.rpc.initializePool(
    configUuid,
    new BN(maxNumNftMints),
    new BN(rewardDuration),
    new BN(unstakeDuration),
    poolBump,
    rewardBump,
    {
      accounts: {
        authority: authorityPublicKey,
        poolAccount: poolAccount,
        config: configAccount,
        rewardMint: new PublicKey(rewardMint),
        rewardVault: rewardAccount,
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      },
      instructions: [
        SystemProgram.createAccountWithSeed({
          fromPubkey: authorityPublicKey,
          newAccountPubkey: configAccount,
          basePubkey: authorityPublicKey,
          seed: configUuid,
          lamports:
            await program.provider.connection.getMinimumBalanceForRentExemption(
              configSpace
            ),
          space: configSpace,
          programId: program.programId,
        }),
      ],
    }
  )

  await program.provider.connection.confirmTransaction(txSig, "finalized")

  console.log("Unpausing pool...")
  await program.rpc.resume({
    accounts: {
      authority: authorityPublicKey,
      poolAccount: poolAccount,
    },
  })
  await program.provider.connection.confirmTransaction(txSig, "finalized")

  const poolAccountInfo = await program.account.pool.fetch(poolAccount)
  console.log("pool public key", poolAccount.toString())
  console.log("poolAccountInfo", poolAccountInfo)
  return
}

scriptRunner(main)
