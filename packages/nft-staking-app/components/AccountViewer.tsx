import _ from "lodash"
import { ChangeEvent, useState } from "react"
import { PublicKey } from "@solana/web3.js"
import { BN } from "@project-serum/anchor"
import { Select, Code, Spinner, Text, Button } from "@chakra-ui/react"
import { Center, Box, VStack } from "@chakra-ui/layout"
import { AccountTypes } from "../models"
import { useAccount } from "../hooks/useAccounts"

type RenderItem = [string, string]

const renderObjData = (obj: any) => {
  return _.reduce(
    obj,
    (accum: RenderItem[], value: any, key: string) => {
      if (_.isArray(value) && value[0] instanceof PublicKey) {
        const result: RenderItem[] = _.map(value, (item, index) => [
          `${key} ${index.toString()}`,
          item.toString(),
        ])
        return _.concat(accum, result)
      }
      if (value instanceof PublicKey || BN.isBN(value)) {
        accum.push([key, value.toString()])
        return accum
      }
      accum.push([key, value])
      return accum
    },
    []
  )
}

export const renderObj = (obj: any, prefix?: string): JSX.Element[] => {
  return _.map(renderObjData(obj), ([key, value]) => {
    return (
      <Code
        color="white"
        w="full"
        textAlign="left"
        mb="2"
        key={`item-${key}`}
        backgroundColor="transparent"
      >
        {`${key}: ${value}`}
      </Code>
    )
  })
}

export const AccountViewer = ({
  accountType,
  accountAddresses,
  closeAccountHandler,
}: {
  accountType: AccountTypes
  accountAddresses: PublicKey[] | undefined
  closeAccountHandler?: () => Promise<void>
}) => {
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>()
  const handleSelectionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccount(event.target.value)
  }

  const [account, accountLoading] = useAccount(
    accountType,
    selectedAccount ? new PublicKey(selectedAccount) : undefined
  )

  return (
    <VStack w="96" spacing="8">
      <Select
        color="grey"
        value={selectedAccount}
        onChange={handleSelectionChange}
        cursor="pointer"
        placeholder="Select Account"
      >
        {_.map(accountAddresses, (accountAddress) => (
          <option
            key={accountAddress.toString()}
            value={accountAddress.toString()}
          >
            {accountAddress.toString()}
          </option>
        ))}
      </Select>
      {account && closeAccountHandler && (
        <Button
          colorScheme="red"
          mt="4"
          px="8"
          w="40"
          onClick={closeAccountHandler}
        >
          Close Account
        </Button>
      )}
      <Box h="96" overflow="auto" w="530px" color="white">
        {account && (
          <Code
            color="white"
            w="full"
            textAlign="left"
            mb="2"
            key={`account-data-publicKey`}
            backgroundColor="transparent"
          >{`publicKey: ${account.publicKey.toString()}`}</Code>
        )}
        {account && renderObj(account.data)}
        {!account && accountLoading && (
          <Center>
            <Spinner />
          </Center>
        )}
        {!account && selectedAccount && !accountLoading && (
          <Text textAlign="center">Account not found</Text>
        )}
      </Box>
    </VStack>
  )
}

export default AccountViewer
