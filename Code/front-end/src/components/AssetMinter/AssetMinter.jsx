import React, { useState, useEffect, useRef } from 'react';
import './AssetMinter.css';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useWallet } from '@suiet/wallet-kit';
import { toast, Toaster } from 'react-hot-toast';
import * as moment from 'moment';
import * as constant from '../../id/id';
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { uploadImageToPinata, uploadMetadataToPinata } from '../../services/pinataService';

const AssetMinter = () => {
  const [data, setData] = useState(null);
  const [state, setState] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [nameNFT, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imgUrl, setImgUrl] = useState(null);

  const wallet = useWallet();
  const packageObjectId = constant.packageObjectId;
  const moduleName = constant.moduleName;

  const rpcUrl = getFullnodeUrl('devnet');
  const client = new SuiClient({ url: rpcUrl });
  const [res, setRes] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!nameNFT.trim()) {
      toast.error('Vui lòng nhập tên cho NFT');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả cho NFT');
      return;
    }
    
    if (!selectedFile) {
      toast.error('Vui lòng chọn một ảnh để tải lên');
      return;
    }

    setIsUploading(true);
    setState(true);
    
    try {
      // 1. Tải lên ảnh lên IPFS thông qua Pinata
      toast.loading('Đang tải ảnh lên IPFS...');
      const imageUrl = await uploadImageToPinata(selectedFile);
      
      // 2. Tạo metadata cho NFT
      const metadata = {
        name: nameNFT,
        description: description,
        image: imageUrl,
        attributes: [
          {
            trait_type: 'Created At',
            value: new Date().toISOString(),
          },
        ],
      };
      
      // 3. Tải lên metadata lên IPFS
      toast.loading('Đang tải metadata lên IPFS...');
      const metadataUrl = await uploadMetadataToPinata(metadata);
      
      // 4. Tạo NFT với metadata URL
      await mintNFT(metadataUrl);
      
      // 5. Hiển thị ảnh đã tải lên
      setImgUrl(imageUrl);
      toast.success('Đã tạo NFT thành công!');
    } catch (error) {
      console.error('Lỗi khi tạo NFT:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi tạo NFT');
    } finally {
      toast.dismiss();
      setIsUploading(false);
      setState(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file (JPEG, PNG, GIF)');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }
    
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const mintNFT = async (imageUrl) => {
    try {
      const tx = new TransactionBlock();
      tx.moveCall({
        target: `${packageObjectId}::${moduleName}::mint_to_sender`,
        arguments: [
          tx.pure(nameNFT),
          tx.pure(description),
          tx.pure(imageUrl)
        ],
      });
      
      const respond = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });
      
      // Lưu cả URL ảnh và thông tin giao dịch
      setRes(respond);
      setData(imageUrl);
      setImgUrl(imageUrl); // Đảm bảo imgUrl được cập nhật
      toast.success('NFT minted successfully!');
      
      // Log thông tin để debug
      console.log('Minted NFT with URL:', imageUrl);
      console.log('Transaction response:', respond);
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT');
    } finally {
      setState(false);
      setIsUploading(false);
    }
  };

  // Function to reset the form
  const resetForm = () => {
    setData(null);
    setPreview('');
    setSelectedFile(null);
    setName('');
    setDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!wallet.connected) {
      toast.error('Please connect your wallet first');
      return;
    }
  }, [wallet.connected]);
  
  // Set up event listener for successful mint
  useEffect(() => {
    const setupEventListeners = async () => {
      if (res && res.digest) {
        try {
          const event = await client.getTransactionBlock({
            digest: res.digest,
            options: { showEvents: true }
          });
          
          if (event.events && event.events.length > 0) {
            const objectId = event.events[0].parsedJson.object_id;
            if (objectId) {
              // URL will be constructed when needed
            }
          }
        } catch (error) {
          console.error('Error fetching transaction details:', error);
        }
      }
    };
    
    setupEventListeners();
  }, [res]);

  // Clean up function
  useEffect(() => {
    return () => {
      // Clean up any resources if needed
    };
  }, []);

  async function tryclick(){
    setData(null);
  };

  if (data) {
    // Sử dụng imgUrl thay vì data để hiển thị ảnh
    const displayImage = imgUrl || data;
    return (
      <div className='bids section__padding'>
        <div><Toaster position="top-right" reverseOrder={false}/></div>
        
        <div className="bids-container-text">
          <h1>Congratulations! This is your NFT!</h1>
        </div>
        
        <div className="nft-card">
          <div className="nft-card-image">
            <img 
              src={displayImage} 
              alt={nameNFT || 'Your NFT'}
              onError={(e) => {
                console.error('Failed to load image:', displayImage);
                e.target.onerror = null; // Ngăn chặn lặp vô hạn khi ảnh lỗi
                e.target.src = 'path/to/default-image.png'; // Đường dẫn đến ảnh mặc định
              }}
            />
          </div>
          
          <div className="nft-card-content">
            <h3>{nameNFT}</h3>
            <p>{description}</p>
            
            {res?.digest && (
              <div className="nft-card-actions">
                <a 
                  target='_blank' 
                  rel="noopener noreferrer" 
                  href={`https://suiscan.xyz/devnet/tx/${res.digest}`}
                  className="explorer-button"
                >
                  View on Explorer
                </a>
              </div>
            )}
          </div>
        </div>
        
        <div className="nft-actions">
          <button className="mint-button" onClick={resetForm}>
            Create Another NFT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bids section__padding'>
      <div><Toaster position="top-right" reverseOrder={false}/></div>
      <div className="bids-container-text">
        <h1>Create Your NFT</h1>
      </div>
      
      <div className="mint-form">
        <div className="form-group">
          <label>NFT Name</label>
          <input 
            type="text" 
            value={nameNFT}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a name for your NFT"
            className="form-input"
            disabled={state}
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your NFT"
            className="form-textarea"
            rows="3"
            disabled={state}
          />
        </div>
        
        <div className="form-group">
          <label>Upload Image</label>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
            disabled={state}
          />
          
          <div 
            className="upload-area" 
            onClick={!state ? triggerFileSelect : undefined}
            style={{ cursor: state ? 'not-allowed' : 'pointer' }}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="preview-image" />
            ) : (
              <div className="upload-placeholder">
                <span>Click to select an image</span>
                <p>Supports JPG, PNG, GIF (Max 5MB)</p>
              </div>
            )}
          </div>
        </div>
        
        {isUploading && (
          <div className="progress-bar">
            <div className="progress-bar-fill">
              Processing...
            </div>
          </div>
        )}
        
        <div className="load-more">
          <button 
            onClick={handleImageUpload} 
            disabled={state || !wallet.connected || !preview || !nameNFT.trim() || !description.trim()}
            className="mint-button"
          >
            {state ? (isUploading ? 'Uploading...' : 'Minting...') : 'Mint NFT'}
          </button>
        </div>
        
        {!wallet.connected && (
          <div className="wallet-notice">
            <p>Please connect your wallet to mint an NFT</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AssetMinter;
