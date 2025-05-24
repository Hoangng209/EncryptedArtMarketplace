import React, { useState, useEffect } from 'react';
import './AssetDetails.css';
import { useParams } from 'react-router-dom';
import { useWallet } from '@suiet/wallet-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as constant from '../../id/id';
import toast, { Toaster } from 'react-hot-toast';

const AssetDetails = () => {
  let id = useParams().id;
  const wallet = useWallet();
  const [data, setData] = useState([]);
  const [addressWallet, setAddressWallet] = useState('');
  const [transferAddress, settransferAddress] = useState('');
  const packageObjectId = constant.packageObjectId;
  const moduleName = constant.moduleName;
  const moduleMarketName = constant.moduleMarketName;
  const [res, setRes] = useState({});
  const [urlEx, seturlEx] = useState('');
  const [NFTPrice, setNFTPrice] = useState('');

  async function fetchJsonMetadata(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch metadata');
      const metadata = await response.json();
      return metadata.image || metadata.image_url || url;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return url; // Return original URL if metadata fetch fails
    }
  }

  async function formatPinataUrl(ipfsUrl) {
    if (!ipfsUrl) return constant.defaultImgURL;
    
    // If it's already a direct image URL, return as is
    if (ipfsUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return ipfsUrl;
    }
    
    // Format IPFS URL
    let formattedUrl = ipfsUrl;
    if (ipfsUrl.startsWith('ipfs://')) {
      const ipfsHash = ipfsUrl.replace('ipfs://', '');
      formattedUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    }
    
    // If it's a JSON URL, fetch and extract the image URL
    if (formattedUrl.endsWith('.json') || !formattedUrl.match(/\.[a-zA-Z0-9]+$/)) {
      return fetchJsonMetadata(formattedUrl);
    }
    
    return formattedUrl || constant.defaultImgURL;
  }

  async function getNFT() {
    try {
      const infoObject = await constant.client.call('sui_getObject', [id, {"showContent": true}]);
      if (infoObject?.data?.content?.fields) {
        const nftData = infoObject.data.content.fields;
        // Format the URL before setting the state
        const formattedUrl = await formatPinataUrl(nftData.url);
        setData([{ ...nftData, url: formattedUrl }]);
      } else {
        console.error('No NFT data found');
        setData([{ url: constant.defaultImgURL }]);
      }
    } catch (error) {
      console.error('Error fetching NFT:', error);
      setData([{ url: constant.defaultImgURL }]);
    }
  }

  useEffect(() => {
    if (!wallet.connected) return;
    setAddressWallet(wallet.account?.address);
    getNFT();
  }, [wallet.connected])

  useEffect(() => {
    if (res?.digest) {
      getRespond();
    }
  }, [res])

  async function getRespond(){
    try {
      if (!res?.digest) return;
      
      const event = await constant.client.call('sui_getEvents', [res.digest]);
      console.log('Transaction events:', event);
      
      if (event?.[0]?.parsedJson?.object_id) {
        const idObj = event[0].parsedJson.object_id;
        seturlEx(constant.suiExploreLink + idObj);
      }
    } catch (error) {
      console.error('Error getting transaction events:', error);
    }
  }

  async function transferTo(){
    console.log("transferTo", id, addressWallet,transferAddress);
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${packageObjectId}::${moduleName}::transfer`,
      arguments: [tx.pure(id), tx.pure(transferAddress)],
    });
    try {
      const respond = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });
      console.log(respond);
      toast.success('Transfer NFT to'+transferAddress+' success!');
      setRes(respond);
      window.location.href = window.location.origin + "/my-assets";
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Transfer failed: ' + (error.message || 'Unknown error'));
    }
  }

  async function SaleNFT() {
    if (!wallet.connected) {
      toast.error('Vui lòng kết nối ví!');
      return;
    }

    if (!NFTPrice || isNaN(NFTPrice) || parseFloat(NFTPrice) <= 0) {
      toast.error('Vui lòng nhập giá bán hợp lệ!');
      return;
    }

    const tx = new TransactionBlock();
    // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
    const priceMist = Math.floor(parseFloat(NFTPrice) * 1e9).toString();
    
    tx.moveCall({
      target: `${packageObjectId}::${moduleMarketName}::list`,
      typeArguments: [constant.typeArgNFT, constant.suiCoin],
      arguments: [
        tx.object(constant.marketID),
        tx.object(id),
        tx.pure(priceMist)
      ]
    });

    try {
      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: {
          showEffects: true,
          showEvents: true
        }
      });
      
      console.log('Sale result:', result);
      toast.success('Đã đưa NFT lên sàn giao dịch!');
      
      setTimeout(() => {
        window.location.href = `${window.location.origin}/ItemOwner`;
      }, 2000);
      
    } catch (error) {
      console.error('Sale error:', error);
      toast.error('Đặt bán thất bại: ' + (error.message || 'Lỗi không xác định'));
    }
  }

  async function burn() {
    if (!wallet.connected) {
      toast.error('Vui lòng kết nối ví!');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn đốt NFT này không? Hành động này không thể hoàn tác.')) {
      return;
    }

    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${packageObjectId}::${moduleName}::burn`,
      arguments: [tx.object(id)]
    });

    try {
      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });
      
      console.log('Burn result:', result);
      toast.success('Đã đốt NFT thành công!');
      
      setTimeout(() => {
        window.location.href = `${window.location.origin}/ItemOwner`;
      }, 2000);
      
    } catch (error) {
      console.error('Burn error:', error);
      toast.error('Đốt NFT thất bại: ' + (error.message || 'Lỗi không xác định'));
    }
  }

  return (
    <div className='nft-detail-container'>
      <div><Toaster position="top-right" reverseOrder={false}/></div>
      {data.map((d, index) => (
        <div key={index} className='nft-detail-card'>
          <div className='nft-image-container'>
            <img src={d.url} alt={d.name} className='nft-image' />
          </div>
          <div className='nft-details'>
            <h2 className='nft-title'>{d.name}</h2>
            <p className='nft-description'>{d.description}</p>
            
            <div className='nft-actions'>
              <div className='action-group'>
                <input 
                  type='text' 
                  placeholder="Giá bán (SUI)" 
                  value={NFTPrice} 
                  onChange={e => setNFTPrice(e.target.value)}
                  className='nft-input'
                />
                <button 
                  onClick={SaleNFT} 
                  disabled={!NFTPrice} 
                  className={`nft-button ${!NFTPrice ? 'disabled' : ''}`}
                >
                  Bán NFT
                </button>
              </div>

              <div className='action-group'>
                <input 
                  type='text' 
                  placeholder="Địa chỉ nhận" 
                  value={transferAddress} 
                  onChange={e => settransferAddress(e.target.value)}
                  className='nft-input'
                />
                <button 
                  onClick={transferTo} 
                  disabled={!transferAddress} 
                  className={`nft-button ${!transferAddress ? 'disabled' : ''}`}
                >
                  Chuyển NFT
                </button>
              </div>

              <button 
                onClick={burn} 
                className='nft-button danger'
              >
                Đốt NFT
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetDetails;
