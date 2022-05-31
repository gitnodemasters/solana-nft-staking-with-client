import _ from "lodash"
import {
  Heading,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  Input,
  Image,
  HStack,
  Text,
} from "@chakra-ui/react"
import { PublicKey } from "@solana/web3.js"
import { Center, VStack, StackDivider, Box } from "@chakra-ui/layout"
import authorizeFunder from "../../solana/scripts/authorizeFunder"
import deauthorizeFunder from "../../solana/scripts/deauthorizeFunder"
import fundPool from "../../solana/scripts/fundPool"
import { getClusterConstants } from "../../constants"
import useWalletPublicKey from "../../hooks/useWalletPublicKey"
import { useMemo, useState, useCallback } from "react"
import { useAnchorAccountCache } from "../../contexts/AnchorAccountsCacheProvider"
import useTxCallback from "../../hooks/useTxCallback"
import AccountViewer from "../../components/AccountViewer"
import { useAccount } from "../../hooks/useAccounts"
import { useTokenRegistry } from "../../hooks/useTokenRegistry"
import { useTokenAccounts } from "../../hooks/useTokenAccounts"

const ManagePoolPage = () => {
  const walletPublicKey = useWalletPublicKey()
  const anchorAccountCache = useAnchorAccountCache()

  const { ADDRESS_STAKING_POOL } = getClusterConstants("ADDRESS_STAKING_POOL")
  const tokenRegistry = useTokenRegistry()
  const [pool] = useAccount("pool", ADDRESS_STAKING_POOL, {
    subscribe: true,
  })

  const tokenAccounts = useTokenAccounts(walletPublicKey)
  const [config] = useAccount("config", pool?.data.config)

  const rewardTokenAccount = useMemo(() => {
    if (!pool || !tokenAccounts) {
      return
    }
    return _.find(
      tokenAccounts,
      (tokenAccount) =>
        tokenAccount.data.mint === pool.data.rewardMint.toString()
    )
  }, [pool, tokenAccounts])

  const [amountPerWeek, setAmountPerWeek] = useState(0)
  const handleFundAmountChange = (valueAsString: string) => {
    setAmountPerWeek(Number(valueAsString))
  }

  const _fundPoolClickHandler = useCallback(async () => {
    if (
      !anchorAccountCache.isEnabled ||
      !walletPublicKey ||
      !pool ||
      !rewardTokenAccount ||
      !amountPerWeek
    ) {
      throw new Error("Invalid data")
    }

    await fundPool(
      anchorAccountCache,
      walletPublicKey,
      pool.publicKey,
      pool.data.config,
      pool.data.rewardVault,
      rewardTokenAccount.publicKey,
      amountPerWeek
    )
    setAmountPerWeek(0)
  }, [
    anchorAccountCache.isEnabled,
    walletPublicKey?.toString(),
    pool,
    rewardTokenAccount,
    amountPerWeek,
  ])

  const fundPoolClickHandler = useTxCallback(_fundPoolClickHandler, {
    info: "Funding pool...",
    success: "Pool funded!",
    error: "Transaction failed",
  })

  const [newFunderAddress, setNewFunderAddress] = useState("")
  const handleNewFunderAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewFunderAddress(event.target.value)
  }

  const _authorizeFunderClickHandler = useCallback(async () => {
    if (
      !anchorAccountCache.isEnabled ||
      !walletPublicKey ||
      !newFunderAddress
    ) {
      throw new Error("Invalid data")
    }

    await authorizeFunder(
      anchorAccountCache.nftStakingProgram,
      walletPublicKey,
      ADDRESS_STAKING_POOL,
      new PublicKey(newFunderAddress)
    )
    setNewFunderAddress("")
  }, [
    anchorAccountCache.isEnabled,
    walletPublicKey?.toString(),
    newFunderAddress,
  ])

  const authorizeFunderClickHandler = useTxCallback(
    _authorizeFunderClickHandler,
    {
      info: "Authorize funder...",
      success: "Funder authorized!",
      error: "Transaction failed",
    }
  )

  const [oldFunderAddress, setOldFunderAddress] = useState("")
  const handleOldFunderAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOldFunderAddress(event.target.value)
  }

  const _deauthorizeFunderClickHandler = useCallback(async () => {
    if (
      !anchorAccountCache.isEnabled ||
      !walletPublicKey ||
      !oldFunderAddress
    ) {
      throw new Error("Invalid data")
    }

    await deauthorizeFunder(
      anchorAccountCache.nftStakingProgram,
      walletPublicKey,
      ADDRESS_STAKING_POOL,
      new PublicKey(oldFunderAddress)
    )
    setOldFunderAddress("")
  }, [
    anchorAccountCache.isEnabled,
    walletPublicKey?.toString(),
    newFunderAddress,
  ])

  const deauthorizeFunderClickHandler = useTxCallback(
    _deauthorizeFunderClickHandler,
    {
      info: "Deauthorize funder...",
      success: "Funder deauthorized!",
      error: "Transaction failed",
    }
  )

  const rewardMint = pool?.data.rewardMint.toString()
  const rewardMintInfo =
    tokenRegistry && rewardMint && tokenRegistry[rewardMint]

  const approxFundAmount = useMemo(() => {
    if (!pool || !config || !rewardMintInfo) {
      return "..."
    }
    return pool
      .getFundAmountDisplay(
        amountPerWeek,
        rewardMintInfo.decimals,
        config.data.numMint
      )
      .toString()
  }, [pool, config, amountPerWeek, rewardMintInfo])

  return (
    <VStack
      w="full"
      divider={<StackDivider borderColor="gray.200" />}
      spacing={16}
      textAlign="center"
    >
      <VStack w="96">
        <Heading w="full" mb="8">
          Fund Pool
        </Heading>
        {rewardMintInfo && (
          <HStack w="full">
            <Image
              alt="token image"
              w="8"
              h="8"
              borderRadius="20"
              src={tokenRegistry[rewardMint].logoURI}
            />
            <Text fontSize="16">{tokenRegistry[rewardMint].name}</Text>
          </HStack>
        )}
        <Text
          w="full"
          fontSize="16"
          textAlign={"left"}
        >{`Number of tokens rewarded per NFT per week`}</Text>
        <NumberInput
          w="full"
          value={amountPerWeek}
          defaultValue={0}
          min={0}
          onChange={handleFundAmountChange}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Box w="full" textAlign={"left"}>
          <Text>{`Approximate fund amount: ${approxFundAmount}`}</Text>
          <Text>{`Funds refresh date: ${
            pool?.rewardEndDisplay || "NOW"
          }`}</Text>
        </Box>
        <Button
          colorScheme="purple"
          mt="4"
          px="8"
          w="40"
          onClick={fundPoolClickHandler}
          disabled={!rewardTokenAccount || !amountPerWeek}
        >
          Submit
        </Button>
      </VStack>
      <Center flexDirection="column" w="96">
        <Heading w="full" mb="8">
          Authorize Funder
        </Heading>
        <Input
          placeholder="Address"
          w="full"
          value={newFunderAddress}
          onChange={handleNewFunderAddressChange}
        />
        <Button
          colorScheme="purple"
          mt="4"
          px="8"
          w="40"
          onClick={authorizeFunderClickHandler}
          disabled={!newFunderAddress}
        >
          Submit
        </Button>
      </Center>
      <Center flexDirection="column" w="96">
        <Heading w="full" mb="8">
          De-Authorize Funder
        </Heading>
        <Input
          placeholder="Address"
          w="full"
          value={oldFunderAddress}
          onChange={handleOldFunderAddressChange}
        />
        <Button
          colorScheme="purple"
          mt="4"
          px="8"
          w="40"
          onClick={deauthorizeFunderClickHandler}
          disabled={!oldFunderAddress}
        >
          Submit
        </Button>
      </Center>
      <VStack w="full">
        <Heading w="full" mb="8">
          View Pool
        </Heading>
        <AccountViewer
          accountType="pool"
          accountAddresses={[ADDRESS_STAKING_POOL]}
        />
      </VStack>
    </VStack>
  )
}

export default ManagePoolPage
