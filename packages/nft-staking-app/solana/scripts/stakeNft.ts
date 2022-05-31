import _ from "lodash"
import {
  PublicKey,
  Transaction,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
} from "@solana/web3.js"
import {
  getUserAddress,
  generateUuid,
  getMintStakeAddress,
} from "../seedAddresses"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import BN from "bn.js"
import { IAnchorAccountCacheContext } from "../../contexts/AnchorAccountsCacheProvider"
import { getClusterConstants } from "../../constants"

const stakeNft = async (
  anchorAccountsCache: IAnchorAccountCacheContext,
  walletPublicKey: PublicKey,
  userNftAccountAddress: PublicKey
) => {
  if (!anchorAccountsCache.isEnabled) {
    throw new Error("Accounts cache not initialized")
  }
  const { nftStakingProgram } = anchorAccountsCache
  const { ADDRESS_STAKING_POOL } = getClusterConstants("ADDRESS_STAKING_POOL")

  const [userAddress, userAddressBump] = await getUserAddress(
    ADDRESS_STAKING_POOL,
    walletPublicKey,
    nftStakingProgram.programId
  )

  const mintStakedUuid1 = generateUuid()
  const [userMintStakeAddress1, userMintStakeAdressBump1] =
    await getMintStakeAddress(
      ADDRESS_STAKING_POOL,
      userAddress,
      mintStakedUuid1,
      nftStakingProgram.programId
    )

  let userAccount: any
  try {
    userAccount = await nftStakingProgram.account.user.fetch(userAddress)
  } catch (err) {}

  const tx = new Transaction()

  let currentMintStakedAddress: PublicKey
  if (userAccount) {
    currentMintStakedAddress = userAccount.mintStaked
  } else {
    currentMintStakedAddress = userMintStakeAddress1
    tx.add(
      nftStakingProgram.instruction.createUser(
        userAddressBump,
        userMintStakeAdressBump1,
        mintStakedUuid1,
        {
          accounts: {
            user: walletPublicKey,
            poolAccount: ADDRESS_STAKING_POOL,
            userAccount: userAddress,
            mintStaked: userMintStakeAddress1,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
          },
        }
      )
    )
  }

  const mintStakedUuid2 = generateUuid()
  const [userMintStakeAddress2, userMintStakeAdressBump2] =
    await getMintStakeAddress(
      ADDRESS_STAKING_POOL,
      userAddress,
      mintStakedUuid2,
      nftStakingProgram.programId
    )

  const poolAccount = await nftStakingProgram.account.pool.fetch(
    ADDRESS_STAKING_POOL
  )
  const configAccount = await nftStakingProgram.account.config.fetch(
    poolAccount.config
  )
  const userNftAccount = await anchorAccountsCache.fetch(
    "hTokenAccount",
    userNftAccountAddress
  )
  if (!userNftAccount) {
    throw new Error("userNftAccount not found")
  }
  const mintIndex = _.findIndex(
    configAccount.mints,
    (mint: PublicKey) => mint.toString() === userNftAccount.data.mint
  )
  if (mintIndex === -1) {
    throw new Error("nftMint is invalid")
  }

  tx.add(
    nftStakingProgram.instruction.stake(
      userMintStakeAdressBump2,
      mintStakedUuid2,
      new BN(mintIndex),
      {
        accounts: {
          staker: walletPublicKey,
          poolAccount: ADDRESS_STAKING_POOL,
          config: poolAccount.config,
          authority: poolAccount.authority,
          userAccount: userAddress,
          stakeFromAccount: userNftAccount.publicKey,
          mintStaked: userMintStakeAddress2,
          currentMintStaked: currentMintStakedAddress,
          rent: SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        },
      }
    )
  )

  return await nftStakingProgram.provider.send(tx)
}

export default stakeNft
