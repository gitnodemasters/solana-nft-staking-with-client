import { PublicKey } from "@solana/web3.js"
import { useAnchorWallet } from "@solana/wallet-adapter-react"

const useWalletPublicKey = () => {
  const wallet = useAnchorWallet()

  const impersonate = ""

  if (impersonate) {
    return new PublicKey(impersonate)
  }

  return wallet?.publicKey
}

export default useWalletPublicKey
