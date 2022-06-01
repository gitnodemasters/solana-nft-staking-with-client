#anchor 0.20.1
#solana 1.18.3
#rustup 1.24.3

##rust&solana&anchor

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup component add rustfmt

sh -c "$(curl -sSfL https://release.solana.com/v1.8.13/install)"

cargo install --git https://github.com/project-serum/anchor --tag v0.20.1 anchor-cli --locked

anchor build
anchor verify <program-id>
anchor deploy --provider.wallet <keypath>
anchor upgrade target/deploy/nft_staking.so --program-id <program-id> --provider.wallet <keypath>