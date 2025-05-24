import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';

// Package and module names
export const packageObjectId = "0x1a1ba1470d8acd3c2aa6e6df08757181524ab20114dad69418c9cfd1ca5e57f8";
export const moduleName = "nft";
export const moduleMarketName = "marketplace";

// API Keys and URLs
export const defaultImgURL = "https://th.bing.com/th/id/OIP.eFAj7sVAyYiIDJU60PtUVwHaHa?rs=1&pid=ImgDetMain";
export const suiExploreLink = "https://suiscan.xyz/devnet/object/";
export const suiCoin = "0x2::sui::SUI";

// Marketplace ID - Created with the command:
// sui client call --package 0x355f92949de2695eadb32573ed2d94390cf52bd0d5506e1829fb895a68d52e20 --module marketplace --function create --type-args 0x2::sui::SUI --gas-budget 100000000
// Marketplace instance created with the new package
export const marketID = "0x34dab6096d95980c19d6832f3125ef770e41c39609f419e4d8297c2741894e04";
export const bagID = "0x34dab6096d95980c19d6832f3125ef770e41c39609f419e4d8297c2741894e04";

// Derived constants
export const typeArgNFT = `${packageObjectId}::${moduleName}::NFT`;

// Sui client configuration
export const rpcUrl = getFullnodeUrl('devnet');
export const client = new SuiClient({ url: rpcUrl });

// Bid market IDs - Using the same market ID for simplicity
// If you have a separate bid market contract, update these with the correct IDs
// Using the same market ID for bid market
export const bidMarketID = "0x34dab6096d95980c19d6832f3125ef770e41c39609f419e4d8297c2741894e04"; // Same as marketID
export const bidMarketBagID = "0x34dab6096d95980c19d6832f3125ef770e41c39609f419e4d8297c2741894e04"; // Same as bagID

// Other important IDs from transactions
// Get this from the package upgrade transaction
export const upgradeCapId = "";
export const gasObjectId = "0xdb65e4ce41c8f97011732e45b8d7f63d6bd05487dacf6e28471d545801f57df4";