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
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

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

const umi = createUmi(connection.rpcEndpoint);

umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log(`Set up Umi instance with user instance`);

const collectionAddress = publicKey(
  "75V3686FXWNBZDytwGbHSdsNfdT31EJxTSVXsSBB2oCT"
);

console.log(`Creating NFT...`);

const mint = generateSigner(umi);

const transaction = await createNft(umi, {
  mint,
  name: "My NFT",
  uri: "https://raw.githubusercontent.com/BintangDiLangit/bootcamp-sol/refs/heads/master/new-nft/assets/nft/metadata_1/nft_1.json",
  sellerFeeBasisPoints: percentAmount(0),
  collection: {
    key: collectionAddress,
    verified: false,
  },
});

await transaction.sendAndConfirm(umi);

const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

console.log(
  `Created NFT! Address is ${getExplorerLink(
    "address",
    createdNft.mint.publicKey,
    "devnet"
  )}`
);
