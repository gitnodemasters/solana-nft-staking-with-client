import BN from "bn.js"

export const getDecimalsExponent = (decimals: number) =>
  new BN(10).pow(new BN(decimals))

export const toRawAmount = (decimals: number, amount: number) => {
  return new BN(10 ** decimals * amount)
}

export const fromRawAmount = (decimals: number, amount: number) => {
  return amount / 10 ** decimals
}
