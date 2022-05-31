import { FC, createContext, useContext, useEffect } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { setCluster } from "../constants"

export const ClusterContext = createContext<WalletAdapterNetwork>(
  WalletAdapterNetwork.Mainnet
)

export const useCluster = () => useContext(ClusterContext)

export const ClusterContextProvider: FC = ({ children }) => {
  const envRpcNetwork = process.env.NEXT_PUBLIC_RPC_NETWORK || ""
  const network =
    envRpcNetwork === "devnet"
      ? WalletAdapterNetwork.Devnet
      : WalletAdapterNetwork.Mainnet

  useEffect(() => {
    setCluster(network)
  }, [network])

  return (
    <ClusterContext.Provider value={network}>
      {children}
    </ClusterContext.Provider>
  )
}
