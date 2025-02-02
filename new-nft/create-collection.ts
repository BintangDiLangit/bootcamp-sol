import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";

import {
  createUmi,
  generateSigner,
  keypairIdentity,
  percentAmount,
} from "@metaplex-foundation/umi";

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile();

await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.5 * LAMPORTS_PER_SOL
);

console.log(`User public key: ${user.publicKey.toBase58()}`);

const umi = createUmi();
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log(`Set up Umi instance with user keypair`);

const collectionMint = generateSigner(umi);
const transaction = await createNft(umi, {
  mint: collectionMint,
  name: "My NFT Collection",
  symbol: "MBC",
  uri: "https://arweave.net/123456",
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,
});

await transaction.sendAndConfirm(umi);

const createCollectionNft = await fetchDigitalAsset(
  umi,
  collectionMint.publicKey
);

console.log(
  `Created collection, Address is ${getExplorerLink(
    "address",
    createCollectionNft.mint.publicKey,
    "devnet"
  )}`
);
