import { ReactNode, useState, useEffect } from "react"
import Head from "next/head"
import type { AppProps } from "next/app"
import dynamic from "next/dynamic"
import { ChakraProvider } from "@chakra-ui/react"
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { Program, Provider } from "@project-serum/anchor"
import AnchorAccountCacheProvider from "../contexts/AnchorAccountsCacheProvider"
import { ClusterContextProvider } from "../contexts/cluster"
import { getNftStakingProgram } from "../solana/getPrograms"
import SidebarWithHeader from "../components/Layout"
import { theme } from "../styles/theme"
import "../styles/globals.css"

const WalletConnectionProvider = dynamic(
  () => import("../contexts/walletConnectionProvider"),
  {
    ssr: false,
  }
)

const AccountsCacheProvidersSetup = ({ children }: { children: ReactNode }) => {
  const { connection } = useConnection()
  const wallet = useAnchorWallet()
  const [nftStakingProgram, setNftStakingProgram] = useState<
    Program | undefined
  >()

  useEffect(() => {
    if (!connection) {
      return
    }
    ;(async function () {
      // @ts-ignore - calling provider without wallet is used to instantiate connection
      const provider = new Provider(connection, wallet, {})
      const nftStakingProgram = await getNftStakingProgram(provider)
      setNftStakingProgram(nftStakingProgram)
    })()
  }, [connection, wallet])

  if (!nftStakingProgram) {
    return <>{children}</>
  }

  return (
    <AnchorAccountCacheProvider nftStakingProgram={nftStakingProgram}>
      {children}
    </AnchorAccountCacheProvider>
  )
}

function VibeMarketApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link
          href="https://solanamonkette.business/static/css/main.92f3fdef.chunk.css"
          rel="stylesheet"
        />
      </Head>
      <ChakraProvider theme={theme}>
        <ClusterContextProvider>
          <WalletConnectionProvider>
            <AccountsCacheProvidersSetup>
              <SidebarWithHeader>
                <Component {...pageProps} />
              </SidebarWithHeader>
            </AccountsCacheProvidersSetup>
          </WalletConnectionProvider>
        </ClusterContextProvider>
      </ChakraProvider>
    </>
  )
}

export default VibeMarketApp
