
import React, { useState, useEffect } from 'react';
import './PlaceBid.css';
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import Pagination from '../../components/Pagination/Pagination';
import * as constant from '../../id/id';

const PlaceBid = ({ title, data, parentID, status }) => {

  const pageNumberLimit = 100;
  const [passengersData, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPageLimit, setMaxPageLimit] = useState(10);
  const [minPageLimit, setMinPageLimit] = useState(0);
  const [totalPage, setTotalPage] = useState(pageNumberLimit);

  useEffect(async()=>{
    setTimeout(async() => {
      setLoading(true);
      console.log(data);
      const listResData = [];
      if(data != null && data.length>0){
        const startIndex = (currentPage - 1) * maxPageLimit;
        const endIndex = startIndex + maxPageLimit;
        const totalPages = Math.ceil(data.length / maxPageLimit);
        setTotalPage(totalPages);
        for(const d of data.slice(startIndex, endIndex)){
          if(status == 1)
          {
            const listDetailNFT = await constant.client.call('sui_getObject', [d.name.value,{"showContent": true}]);
            const price = await constant.client.call('suix_getDynamicFieldObject',[parentID,d.name]);
            listResData.push({
              d:listDetailNFT.data.content.fields,
              p:price.data.content.fields.value.fields
            });
          }
          else if (status === 2) {
            // Xử lý cho trường hợp đấu giá
            try {
              console.log('Processing dynamic field:', d);
              
              // Kiểm tra nếu đây là dynamic field
              if (!d.name || !d.objectId) {
                console.warn('Invalid dynamic field structure:', d);
                return;
              }
              
              // Lấy thông tin chi tiết của dynamic field
              const dynamicField = await constant.client.getDynamicFieldObject({
                parentId: parentID,
                name: d.name
              });
              
              console.log('Dynamic field data:', dynamicField);
              
              if (!dynamicField?.data?.content?.fields) {
                console.warn('No content in dynamic field:', dynamicField);
                return;
              }
              
              const fields = dynamicField.data.content.fields;
              
              // Lấy thông tin NFT từ dynamic field
              const nftId = fields.nft_id || fields.name;
              if (!nftId) {
                console.warn('No NFT ID found in bid:', dynamicField);
                return;
              }
              
              // Lấy thông tin chi tiết NFT
              const nft = await constant.client.getObject({
                id: nftId,
                options: { showContent: true, showDisplay: true }
              });
              
              if (!nft?.data) {
                console.warn('No NFT data for:', nftId);
                return;
              }
              
              // Lấy URL hình ảnh từ display hoặc content
              let imageUrl = '';
              
              // Kiểm tra display data trước
              if (nft.data.display?.data?.image_url) {
                imageUrl = nft.data.display.data.image_url;
              } 
              // Kiểm tra content.fields
              else if (nft.data.content?.fields) {
                const fields = nft.data.content.fields;
                // Thử các trường có thể chứa URL ảnh
                imageUrl = fields.url || fields.image || fields.uri || fields.metadata?.image || '';
                
                // Nếu là IPFS URL, thêm gateway
                if (imageUrl.startsWith('ipfs://')) {
                  imageUrl = `https://gateway.pinata.cloud/ipfs/${imageUrl.replace('ipfs://', '')}`;
                }
              }
              
              console.log('NFT Image URL:', imageUrl, 'for NFT:', nft.data);
              
              // Thêm thông tin đấu giá vào dữ liệu
              listResData.push({
                d: {
                  ...nft.data.content.fields,
                  url: imageUrl,
                  isAuction: true
                },
                p: {
                  ask: fields.current_bid || '0',
                  owner: fields.seller || '',
                  auctionID: dynamicField.data.objectId,
                  isAuction: true,
                  highestBidder: fields.highest_bidder?.fields?.address || ''
                },
                q: {
                  fields: {
                    change: fields.min_bid_increment || '0',
                    funds: fields.highest_bid || '0'
                  }
                }
              });
            } catch (error) {
              console.error('Error processing bid item:', error);
            }
           
          }
        };
        setData(listResData);
        setLoading(false);
      }
    }, 100);
   
  },[currentPage,data,parentID]);

  const onPageChange= (pageNumber)=>{
    setCurrentPage(pageNumber);
  }
  const onPrevClick = ()=>{
      if((currentPage-1) % pageNumberLimit === 0){
          setMaxPageLimit(maxPageLimit - pageNumberLimit);
          setMinPageLimit(minPageLimit - pageNumberLimit);
      }
      setCurrentPage(prev=> prev-1);
   }

  const onNextClick = ()=>{
       if(currentPage+1 > maxPageLimit){
           setMaxPageLimit(maxPageLimit + pageNumberLimit);
           setMinPageLimit(minPageLimit + pageNumberLimit);
       }
       setCurrentPage(prev=>prev+1);
    }

  const paginationAttributes = {
    currentPage,
    maxPageLimit,
    minPageLimit,
    totalPages: totalPage,
    data: passengersData,
    title: title,
    type:status,
  };

  return (
    <div className="bids-container">
      {!loading ? (
        <Pagination 
          {...paginationAttributes} 
          onPrevClick={onPrevClick} 
          onNextClick={onNextClick}
          onPageChange={onPageChange}
        />
      ) : (
        <div className='bids-container-text'><h1>Loading...</h1></div>
      )}
    </div>
  )
}

export default PlaceBid
