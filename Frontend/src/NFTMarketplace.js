import { useState } from "react";

const mockNFTs = [
  {
    id: 1,
    title: "Digital Sunset",
    image: "https://imgs.search.brave.com/_PTww4Y8WbPrDoxF1-SCIhDdI2YZQu7x-pa8jbxGCLQ/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtd2l4bXAtZWQz/MGE4NmI4YzRjYTg4/Nzc3MzU5NGMyLndp/eG1wLmNvbS9mLzQx/NzJmNzBhLTFkMWQt/NDg3Zi1hMTUzLWVm/OGRkM2YzZTA1MC9k/ZnltdDQxLTY4ZTdm/OWIwLTFjYzYtNDY0/My1iYjM5LWI1NmQy/YzQ4ZTJhOS5qcGcv/djEvZmlsbC93XzYw/MCxoXzMzNyxxXzc1/LHN0cnAvYV9mYW50/YXN5X2RpZ2l0YWxf/YXJ0X3ByZXR0eV9z/dW5zZXRfbGFuZHNj/YXBlX2J5X3NpbW9u/ZWVkd2FyZGFydF9k/ZnltdDQxLWZ1bGx2/aWV3LmpwZz90b2tl/bj1leUowZVhBaU9p/SktWMVFpTENKaGJH/Y2lPaUpJVXpJMU5p/SjkuZXlKemRXSWlP/aUoxY200NllYQndP/amRsTUdReE9EZzVP/REl5TmpRek56TmhO/V1l3WkRReE5XVmhN/R1F5Tm1Vd0lpd2lh/WE56SWpvaWRYSnVP/bUZ3Y0RvM1pUQmtN/VGc0T1RneU1qWTBN/emN6WVRWbU1HUTBN/VFZsWVRCa01qWmxN/Q0lzSW05aWFpSTZX/MXQ3SW1obGFXZG9k/Q0k2SWp3OU16TTNJ/aXdpY0dGMGFDSTZJ/bHd2Wmx3dk5ERTNN/bVkzTUdFdE1XUXha/QzAwT0RkbUxXRXhO/VE10WldZNFpHUXpa/ak5sTURVd1hDOWta/bmx0ZERReExUWTRa/VGRtT1dJd0xURmpZ/ell0TkRZME15MWlZ/ak01TFdJMU5tUXlZ/elE0WlRKaE9TNXFj/R2NpTENKM2FXUjBh/Q0k2SWp3OU5qQXdJ/bjFkWFN3aVlYVmtJ/anBiSW5WeWJqcHpa/WEoyYVdObE9tbHRZ/V2RsTG05d1pYSmhk/R2x2Ym5NaVhYMC56/TVc0eEI4ZGhCVXRn/cl9ZVmtVcXVFSnM5/Z0tqTDBDY2RmTDE0/MDFHemo4",
    price: "2.5 SUI",
    artist: "Alice Art",
  },
  {
    id: 2,
    title: "Cyberpunk City",
    image: "https://imgs.search.brave.com/XO3WeTSQvwqpioHY2Y4Cz9us0CvQgYhXZtb2JfpiKbg/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMwLmdhbWVyYW50/aW1hZ2VzLmNvbS93/b3JkcHJlc3Mvd3At/Y29udGVudC91cGxv/YWRzLzIwMjIvMDkv/Y3liZXJwdW5rLTIw/NzctY2l0eS1jZW50/ZXItQ3JvcHBlZC5q/cGc",
    price: "3.0 SUI",
    artist: "Bob Creative",
  },
  {
    id: 3,
    title: "Futuristic Dream",
    image: "https://imgs.search.brave.com/3-miM96vSllc5mAVe069fx0k5vDmUHOgtPhJco7bK2c/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzgzLzg2/LzgxLzgzODY4MWM2/OWVmMjMyZGE3Zjhj/ODNhMzA5MzBlMjAx/LnBuZw",
    price: "1.8 SUI",
    artist: "Charlie NFT",
  },
];

export default function NFTMarketplace() {
  const [nfts, setNfts] = useState(mockNFTs);
  const [walletConnected, setWalletConnected] = useState(false);

  const connectWallet = () => {
    setWalletConnected(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative">
      <div className="absolute top-6 right-6">
        {walletConnected ? (
          <button className="bg-green-500 text-white py-2 px-4 rounded-lg">
            Wallet Connected
          </button>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
          >
            Connect Wallet
          </button>
        )}
      </div>
      <h1 className="text-4xl font-bold text-center mb-8">NFT Marketplace</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <div key={nft.id} className="bg-gray-800 p-4 rounded-2xl shadow-lg">
            <img
              src={nft.image}
              alt={nft.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-semibold">{nft.title}</h2>
            <p className="text-gray-400">Artist: {nft.artist}</p>
            <p className="mt-2 font-bold text-lg">Price: {nft.price}</p>
            <button className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg">
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
