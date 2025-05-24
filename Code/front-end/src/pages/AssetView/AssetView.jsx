import React, { useState, useEffect } from 'react';
import './AssetView.css';
import { useParams } from 'react-router-dom';
import { useWallet } from '@suiet/wallet-kit'
import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as constant from '../../id/id';
import toast, { Toaster } from 'react-hot-toast';

const AssetView = () => {
  let id = useParams().id;
  let price = useParams().price;
  let owner = useParams().owner;
  let type = useParams().type;
  

  const packageObjectId = constant.packageObjectId;
  const moduleMarketName = constant.moduleMarketName;

  const [data, setData] = useState(null);
  const [addressWallet, setAddressWallet] = useState(null);
  const [buttonPage,setButtonPage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const wallet = useWallet();
  


  async function getNFT() {
    try {
      const listNFT = [];
      const infoObject = await constant.client.call('sui_getObject', [id,{"showContent": true,"showOwner": true}]);
      console.log('NFT Object:', infoObject);
      console.log('NFT Object Structure:', JSON.stringify(infoObject, null, 2));
      
      // Lấy dữ liệu NFT
      let nftData;
      try {
        nftData = infoObject.data.content.fields;
        console.log('NFT Data Fields:', nftData);
      } catch (e) {
        console.error('Error accessing data.content.fields:', e);
        // Thử cấu trúc khác
        if (infoObject.details && infoObject.details.data) {
          nftData = infoObject.details.data.fields;
          console.log('Using alternative data structure:', nftData);
        } else {
          console.error('Could not find NFT data in response');
          return;
        }
      }
      
      listNFT.push(nftData);
      setData(listNFT);
      
      // Xử lý URL hình ảnh
      if (nftData.url) {
        let imgUrl = nftData.url;
        console.log('Original URL:', imgUrl);
        
        // Giả sử tất cả URL đều trỏ đến JSON metadata
        // Chuyển đổi các loại URL sang Pinata Gateway trước khi fetch
        if (imgUrl.startsWith('ipfs://')) {
          // Chuyển đổi ipfs:// URL
          const ipfsHash = imgUrl.replace('ipfs://', '');
          imgUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
          console.log('Converted IPFS URL to Pinata:', imgUrl);
        } else if (imgUrl.includes('ipfs.io/ipfs/')) {
          // Chuyển đổi ipfs.io URL
          const ipfsPath = imgUrl.replace(/.*\/ipfs\//, '');
          imgUrl = `https://gateway.pinata.cloud/ipfs/${ipfsPath}`;
          console.log('Converted IPFS.io URL to Pinata:', imgUrl);
        } else if (imgUrl.includes('ipfs/')) {
          // Xử lý các URL chứa ipfs/ nhưng không phải định dạng chuẩn
          const ipfsPath = imgUrl.replace(/.*\/ipfs\//, '');
          imgUrl = `https://gateway.pinata.cloud/ipfs/${ipfsPath}`;
          console.log('Converted other IPFS URL to Pinata:', imgUrl);
        }
        
        // Luôn coi URL là JSON metadata và thử fetch
        try {
          console.log('Fetching metadata from:', imgUrl);
          const response = await fetch(imgUrl);
          const metadata = await response.json();
          console.log('Metadata:', metadata);
          
          if (metadata.image) {
            // Xử lý URL ảnh từ metadata
            let metadataImageUrl = metadata.image;
            console.log('Image URL from metadata:', metadataImageUrl);
            
            // Chuyển đổi tất cả các loại URL trong metadata sang Pinata
            if (metadataImageUrl.startsWith('ipfs://')) {
              const ipfsHash = metadataImageUrl.replace('ipfs://', '');
              metadataImageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
            } else if (metadataImageUrl.includes('ipfs.io/ipfs/')) {
              const ipfsPath = metadataImageUrl.replace(/.*\/ipfs\//, '');
              metadataImageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsPath}`;
            } else if (metadataImageUrl.includes('ipfs/')) {
              const ipfsPath = metadataImageUrl.replace(/.*\/ipfs\//, '');
              metadataImageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsPath}`;
            } else if (metadataImageUrl.includes('cloudflare-ipfs.com')) {
              // Xử lý Cloudflare IPFS gateway
              const ipfsPath = metadataImageUrl.replace(/.*\/ipfs\//, '');
              metadataImageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsPath}`;
            }
            
            console.log('Converted metadata image URL to Pinata:', metadataImageUrl);
            imgUrl = metadataImageUrl;
          }
        } catch (error) {
          console.error('Error fetching metadata, using original URL:', error);
          // Nếu không phải JSON, sử dụng URL gốc
        }
        
        console.log('Final image URL:', imgUrl);
        setImageUrl(imgUrl);
        
        // Cập nhật URL trong dữ liệu NFT để hiển thị
        nftData.url = imgUrl;
        setData([...listNFT]);
      }
    } catch (error) {
      console.error('Error fetching NFT data:', error);
    }
  }

  useEffect(() => {
    // Kiểm tra chính xác quyền sở hữu NFT
    const currentWalletAddress = wallet.account?.address;
    
    // Kiểm tra xem địa chỉ ví hiện tại có phải là người bán NFT hay không
    // owner trong trường hợp này là địa chỉ của người bán, được truyền qua URL
    const isSeller = currentWalletAddress && 
                    owner && 
                    currentWalletAddress.toLowerCase() === owner.toLowerCase();
    
    console.log('Seller check:', {
      currentWalletAddress: currentWalletAddress || 'Not connected',
      sellerAddress: owner,
      isSeller: isSeller,
      type: type // Kiểm tra loại giao dịch (sale)
    });
    
    // Nếu là người bán hoặc chủ sở hữu, hiển thị nút Unlist
    if(isSeller){
      setButtonPage( 
              <div className="item-content-buy">
                <button onClick={() => unList()} className="primary-btn" >Unlist</button>
              </div>
             )
    }
    else
    {
      // Nếu không phải người bán, hiển thị nút Buy
      setButtonPage( 
        <div className="item-content-buy">
          <button onClick={() => buy()} className="primary-btn">Buy for {price} SUI</button>
        </div>
       )
    }
  },[data, wallet.account?.address, owner, type])

  useEffect(() => {
    if (!wallet.connected) return;
    setAddressWallet(wallet.account?.address);
    console.log('Wallet info:', {
      walletName: wallet.name,
      walletAddress: wallet.account?.address,
      nftOwner: owner
    });
    getNFT();

  }, [wallet.connected,id])


  async function unList(){
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${packageObjectId}::${moduleMarketName}::delist_and_take`,
      typeArguments: [constant.typeArgNFT,constant.suiCoin],
      arguments: [tx.pure(constant.marketID),tx.pure(id)],
    });
    try{
      const res = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });
      console.log(res);
      toast.success('Reback NFT success!');
      window.location.href = window.location.origin;
    }
    catch{
      toast.error('Reback NFT fail!');
    }
  }

  async function buy(){
    try {
      console.log('=== Starting buy transaction ===');
      
      // First, get the marketplace details
      console.log('Fetching marketplace data...');
      const marketplace = await constant.client.getObject({
        id: constant.marketID,
        options: { 
          showContent: true,
          showType: true,
          showOwner: true
        }
      });

      if (!marketplace.data?.content) {
        console.error('Marketplace data is missing content');
        throw new Error('Could not fetch marketplace data');
      }

      console.log('=== Marketplace Data ===');
      console.log('Marketplace ID:', constant.marketID);
      console.log('Marketplace content:', JSON.stringify(marketplace.data.content, null, 2));

      // Get the listing object
      console.log('\nFetching listing data...');
      const listing = await constant.client.getObject({
        id: id,
        options: { 
          showContent: true,
          showType: true,
          showOwner: true
        }
      });

      // Check if the NFT is actually listed in the marketplace
      console.log('\nChecking if NFT is listed in marketplace...');
      const listingTableId = marketplace.data.content.fields.items.fields.id.id;
      const isListed = await constant.client.getDynamicFieldObject({
        parentId: listingTableId,
        name: {
          type: '0x2::object::ID',
          value: id
        }
      });

      console.log('Raw listing data:', JSON.stringify(isListed, null, 2));
      
      if (!isListed.data) {
        throw new Error('NFT is not listed in the marketplace. Please list it for sale first.');
      }

      // Get listing details from the response
      const listingData = isListed.data.content.fields.value.fields;
      const listedPriceMist = listingData.ask;
      // Convert from MIST to SUI (1 SUI = 1,000,000,000 MIST)
      const listedPriceSui = parseInt(listedPriceMist) / 1e9;
      const listingOwner = listingData.owner;
      
      console.log('=== Listing Details ===');
      console.log('Listed price (MIST):', listedPriceMist);
      console.log('Listed price (SUI):', listedPriceSui);
      console.log('Listing owner:', listingOwner);
      
      if (!listedPriceMist || listedPriceMist === '0') {
        throw new Error('Invalid listing price found. The item may not be properly listed.');
      }
      
      // Update the price to use the actual listed price
      price = listedPriceSui;

      if (!listing.data?.content) {
        console.error('Listing data is missing content');
        throw new Error('Could not fetch listing data');
      }

      console.log('=== Listing Data ===');
      console.log('Listing ID:', id);
      console.log('Listing content:', JSON.stringify(listing.data.content, null, 2));

      // Try to get the price from different possible locations
      const listingPrice = listing.data.content.fields?.ask || 
                          listing.data.content.fields?.value?.fields?.ask || 
                          price;
      
      if (isNaN(listingPrice)) {
        console.error('Invalid price value:', listingPrice);
        throw new Error('Invalid price value in listing');
      }

      // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
      const valueInMist = Math.floor(listingPrice * 1e9).toString();
      
      console.log('\n=== Transaction Details ===');
      console.log('UI Price (SUI):', price);
      console.log('Listing Price (SUI):', listingPrice);
      console.log('Value in MIST:', valueInMist);
      console.log('Marketplace ID:', constant.marketID);
      console.log('Item ID:', id);

      // Create transaction
      console.log('\nCreating transaction...');
      const tx = new TransactionBlock();
      tx.setGasBudget(100000000); // 0.1 SUI
      
      // Prepare payment
      console.log('Preparing payment...');
      const [coin] = tx.splitCoins(tx.gas, [
        tx.pure(valueInMist)
      ]);

      // Create the move call
      console.log('Creating move call...');
      tx.moveCall({
        target: `${packageObjectId}::${moduleMarketName}::buy_and_take`,
        typeArguments: [constant.typeArgNFT, constant.suiCoin],
        arguments: [
          tx.object(constant.marketID),
          tx.object(id),
          coin
        ],
      });

      console.log('\n=== Transaction Payload ===');
      console.log('Target:', `${packageObjectId}::${moduleMarketName}::buy_and_take`);
      console.log('Type Args:', [constant.typeArgNFT, constant.suiCoin]);
      console.log('Arguments:', [
        { type: 'object', value: constant.marketID },
        { type: 'object', value: id },
        { type: 'coin', value: valueInMist }
      ]);
      
      console.log('Executing transaction with:', {
        target: `${packageObjectId}::${moduleMarketName}::buy_and_take`,
        typeArgs: [constant.typeArgNFT, constant.suiCoin],
        value: valueInMist,
        gasBudget: 100000000,
        marketID: constant.marketID,
        itemID: id
      });
      
      const res = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: {
          showEffects: true,
          showEvents: true
        }
      });
      
      console.log('Transaction result:', res);
      
      if (res.effects?.status?.status === 'success') {
        toast.success('Buy NFT successful!');
        window.location.href = window.location.origin;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error in buy function:', error);
      toast.error(`Buy failed: ${error.message || 'Unknown error'}`);
    }
  }

  return (
    <div className='nft-marketplace-container'>
      <div><Toaster position="top-right" reverseOrder={false}/></div>
      {data?.map((d, index) => {
        return (
          <div key={`nft-${index}`} className='nft-detail-container'>
            <div className="nft-card">
              <div className="nft-card-image">
                {(imageUrl || d.url) ? (
                  <img 
                    src={imageUrl || d.url} 
                    alt={d.name || 'NFT'} 
                    onError={(e) => {
                      console.log('Image failed to load, trying direct URL');
                      e.target.onerror = null;
                      e.target.src = d.url;
                    }} 
                  />
                ) : (
                  <div className="no-image">No image available</div>
                )}
              </div>
              
              <div className="nft-card-content">
                <div className="nft-card-header">
                  <h1>{d.name}</h1>
                  <div className="nft-price">
                    <span>{price} SUI</span>
                  </div>
                </div>
                
                <div className="nft-card-description">
                  <p>{d.description}</p>
                </div>
                
                <div className="nft-card-actions">
                  {buttonPage}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
};

export default AssetView;
