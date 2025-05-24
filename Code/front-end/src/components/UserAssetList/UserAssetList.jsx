import React, { useEffect, useState, useCallback } from 'react';
import './UserAssetList.css';
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { useWallet } from '@suiet/wallet-kit';
import Pagination from '../Pagination/Pagination';
import { packageObjectId, moduleName } from '../../id/id';

const UserAssetList = () => {
  const wallet = useWallet();
  const rpcUrl = getFullnodeUrl('devnet');
  const client = new SuiClient({ url: rpcUrl });
  
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Hàm lấy danh sách NFT
  const fetchNFTs = useCallback(async () => {
    if (!wallet.connected || !wallet.account?.address) return;
    
    setLoading(true);
    try {
      // Lấy tất cả các object thuộc sở hữu của ví
      const result = await client.getOwnedObjects({
        owner: wallet.account.address,
        options: {
          showContent: true,
          showType: true,
        },
      });

      console.log('Owned objects response:', result);
      
      if (!result.data) {
        console.log('No data in response');
        setNfts([]);
        setTotalItems(0);
        return;
      }
      
      // Lọc ra các object là NFT của chúng ta
      const nftObjects = result.data.filter(obj => 
        obj.data?.content?.type?.includes(`${packageObjectId}::${moduleName}::NFT`)
      );
      
      console.log('NFT Type being filtered:', `${packageObjectId}::${moduleName}::NFT`);
      
      console.log('Filtered NFTs:', nftObjects);
      
      // Chuyển đổi dữ liệu về định dạng phù hợp
      const formattedNfts = nftObjects.map(obj => ({
        id: obj.data.objectId,
        ...obj.data.content.fields,
        type: obj.data.content.type,
        display: obj.data.content.fields,
      }));
      
      setNfts(formattedNfts);
      setTotalItems(formattedNfts.length);
      
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  }, [wallet.connected, wallet.account?.address]);

  // Gọi hàm fetchNFTs khi component mount hoặc khi wallet thay đổi
  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = nfts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Xử lý thay đổi trang
  const onPageChange = (pageNumber) => setCurrentPage(pageNumber);
  
  const onPrevClick = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const onNextClick = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const paginationAttributes = {
    currentPage,
    maxPageLimit: Math.min(5, totalPages),
    minPageLimit: 0,
    totalPages,
    data: currentItems,
    title: "Danh sách NFT của tôi",
    type: 3,
  };

  return (
    <div className='container'>
      {loading ? (
        <div className='bids-container-text'><h1>Đang tải...</h1></div>
      ) : nfts.length === 0 ? (
        <div className="no-nfts">Bạn chưa sở hữu NFT nào</div>
      ) : (
        <Pagination 
          {...paginationAttributes} 
          onPrevClick={onPrevClick} 
          onNextClick={onNextClick}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

export default UserAssetList;
