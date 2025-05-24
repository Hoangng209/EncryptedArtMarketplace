import React from 'react';
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { Link } from 'react-router-dom';
import './Pagination.css'

// Chỉ sử dụng Pinata gateway
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

// Hàm xử lý URL IPFS
const processIpfsUrl = (url) => {
  if (!url) return { cid: null, urls: [] };
  
  // Nếu URL đã là http/https
  if (url.startsWith('http')) {
    // Nếu đã là URL của Pinata thì giữ nguyên
    if (url.includes('gateway.pinata.cloud/ipfs/')) {
      const cid = url.split('gateway.pinata.cloud/ipfs/')[1]?.split('/')[0];
      if (cid) {
        return {
          cid,
          urls: [url] // Chỉ giữ lại URL gốc của Pinata
        };
      }
    }
    // Nếu là URL khác, vẫn trả về nhưng không xử lý thêm
    return { cid: null, urls: [url] };
  }
  
  // Xử lý IPFS URL (ipfs://...)
  if (url.startsWith('ipfs://')) {
    const cid = url.replace('ipfs://', '').split('/')[0]; // Lấy phần CID
    return {
      cid,
      urls: [`${PINATA_GATEWAY}${cid}`] // Chỉ sử dụng Pinata gateway
    };
  }
  
  // Nếu là CID trực tiếp (bắt đầu bằng Qm...)
  if (url.match(/^Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-Za-z]{50,}$/)) {
    return {
      cid: url,
      urls: [`${PINATA_GATEWAY}${url}`] // Chỉ sử dụng Pinata gateway
    };
  }
  
  return { cid: null, urls: [url] };
};

const Pagination = (props)=>{
    const { currentPage, maxPageLimit, minPageLimit, data, title } = props;
    const totalPages = props.totalPages - 1;
    const pages = [];
    for(let i=1 ; i<=totalPages; i++){
        pages.push(i);
    }

    
    const handlePrevClick = ()=>{
        props.onPrevClick();
    }
    const handleNextClick = ()=>{
        props.onNextClick();
    }
    const handlePageClick = (e)=>{
        props.onPageChange(Number(e.target.id));
    }
    
    const pageNumbers = pages.map(page => {
        if(page <= maxPageLimit  && page > minPageLimit) {
            return(
                <li key={page} id={page} onClick={handlePageClick} 
                    className={currentPage===page ? 'active' : ''}>
                    {page}
                </li>
                    );
                }else{
                    return null;
                }
    });

    let pageIncrementEllipses = null;
    if(pages.length > maxPageLimit){
        pageIncrementEllipses = <li className='mid' onClick={handleNextClick}>&hellip;</li>
    }
    let pageDecremenEllipses = null;
    if(minPageLimit >=1){
        pageDecremenEllipses = <li className='mid' onClick={handlePrevClick}>&hellip;</li> 
    }
    // console.log(props.data);
    const renderData = (data)=>{
        if(props.type ==1)
        {
            return(
                <div className='bids section__padding'>
                  <div className="bids-container">
                    <div className="bids-container-text">
                      <h1>{title}</h1>
                    </div>
                    <div className="bids-container-card">
                      {data.map((d, index) => {
                        // Lấy URL hình ảnh từ dữ liệu NFT
                        let imageUrl = d.d?.url || d.d?.image || '';
                        
                        // Đảm bảo URL bắt đầu bằng https://
                        if (imageUrl && !imageUrl.startsWith('http')) {
                          // Nếu là CID IPFS, thêm gateway
                          if (imageUrl.startsWith('ipfs://')) {
                            const cid = imageUrl.replace('ipfs://', '');
                            imageUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
                          } else {
                            // Nếu chỉ là CID, thêm gateway
                            imageUrl = `https://gateway.pinata.cloud/ipfs/${imageUrl}`;
                          }
                        }
                        
                        const nftId = d.d?.id?.id || index;
                        const nftName = d.d?.name || 'Unnamed NFT';
                        // Convert from MIST to SUI (1 SUI = 1,000,000,000 MIST)
                        const priceInMist = parseInt(d.p?.ask || '0', 10);
                        const priceInSui = priceInMist / 1e9; // Using Sui's standard conversion
                        const nftPrice = priceInSui.toFixed(2); // Format to 2 decimal places
                        const ownerAddress = d.p?.owner || '';
                        
                        // Tạo URL dự phòng nếu cần
                        const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2Ugbm90IGF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
                        
                        // Format price display
                        const priceDisplay = `${nftPrice} SUI`;
                        
                        return (
                          <div key={`nft-${nftId}`} className='card-column'>
                            <Link to={`/asset/${nftId}/${nftPrice}/${ownerAddress}/${props.type || '1'}`} className="nft-link">
                              <div className="bids-card">
                                {imageUrl ? (
                                  <img 
                                    className="nft-image" 
                                    src={imageUrl} 
                                    alt={nftName}
                                    onError={(e) => {
                                      console.error('Error loading image from:', imageUrl);
                                      const jsonUrl = imageUrl;
                                      fetch(jsonUrl)
                                        .then(response => response.json())
                                        .then(data => {
                                          const newImageUrl = data.image;
                                          if (newImageUrl) {
                                            e.target.src = newImageUrl;
                                          } else {
                                            throw new Error('Image field not found in JSON');
                                          }
                                        })
                                        .catch(() => {
                                          e.target.src = fallbackImage;
                                        });
                                    }}
                                  />
                                ) : (
                                  <div className="nft-image-placeholder">
                                    No image available
                                  </div>
                                )}
                                <div className="bids-card-content">
                                  <div className="bids-card-top">
                                    <p className="nft-name">{nftName}</p>
                                    <p className="nft-collection">{priceDisplay}</p>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                )
        }
        else if(props.type ==2)
        {
            return(
                <div className='bids section__padding'>
                    <div className="bids-container">
                      <div className="bids-container-text">
                        <h1>{title}</h1>
                      </div>
                      <div className="bids-container-card">
                        {data.map((d, index) => (
                          <div key={`auction-${d.d.id.id || index}`} className='card-column'>
                            <div className="bids-card">
                              <div className="bids-card-top">
                                {d.d.url && (
                                  <img 
                                    className="photo" 
                                    src={d.d.url.startsWith('ipfs://') ? 
                                      `https://gateway.pinata.cloud/ipfs/${d.d.url.replace('ipfs://', '')}` : 
                                      d.d.url} 
                                    alt={d.d.name}
                                    onError={(e) => {
                                      console.error('Error loading image from:', d.d.url);
                                      // Nếu URL không phải là ảnh trực tiếp, thử lấy từ JSON
                                      const imageUrl = d.d.url.startsWith('ipfs://') ? 
                                        `https://gateway.pinata.cloud/ipfs/${d.d.url.replace('ipfs://', '')}` : 
                                        d.d.url;
                                      
                                      fetch(imageUrl)
                                        .then(response => response.json())
                                        .then(data => {
                                          if (data.image) {
                                            const newImageUrl = data.image.startsWith('ipfs://') ? 
                                              `https://gateway.pinata.cloud/ipfs/${data.image.replace('ipfs://', '')}` : 
                                              data.image;
                                            e.target.src = newImageUrl;
                                          } else {
                                            e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Available';
                                          }
                                        })
                                        .catch(error => {
                                          console.error('Failed to fetch image from JSON:', error);
                                          e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Available';
                                        });
                                    }}
                                  />
                                )}
                                <Link to={`/place-bid/${d.d.id.id}/${d.p.ask}/${d.p.owner}/${d.p.auctionID}`}>
                                  <p className="bids-title">
                                    {d.d.name}
                                    {d.d.isAuction && (
                                      <span className="auction-badge">
                                        {d.p.isHighestBidder ? 'Giá cao nhất' : 'Đang đấu giá'}
                                      </span>
                                    )}
                                  </p>
                                </Link>
                              </div>
                              <div className="bids-card-bottom">
                                {d.d.isAuction ? (
                                  <>
                                    <p>Giá hiện tại: {Number(d.q?.fields?.funds || d.p.ask) / 1000000000} SUI</p>
                                    <p>Bước giá: {Number(d.q?.fields?.change || 0) / 1000000000} SUI</p>
                                    {d.p.highestBidder && (
                                      <p className="bidder-info">
                                        {d.p.isHighestBidder ? 'Bạn' : 'Người khác'} đang giữ giá
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <p>Giá: {Number(d.p.ask) / 1000000000} SUI</p>
                                )}
                              </div>
                            </div>
                          </div>
                          ))}
                        </div>
                    </div>
                  </div>
                )
        }
        else {
          return (
            <div className='bids section__padding'>
              <div className="bids-container">
                <div className="bids-container-text">
                  <h1>{title}</h1>
                </div>
                <div className="bids-container-card">
                  {data?.map((item, index) => {
                    // Handle different data structures
                    const itemData = item.d || item;
                    const imageInfo = processIpfsUrl(itemData.url || itemData.image);
                    const itemId = itemData.id?.id || index;
                    const itemName = itemData.name || 'Unnamed NFT';
                    const primaryImageUrl = imageInfo.urls?.[0]; // Use the first URL as primary
                    
                    return (
                      <div key={`nft-${itemId}`} className='card-column'>
                        <div className="bids-card">
                          <div className="bids-card-top">
                            {primaryImageUrl && (
                              <div className="image-container" style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
                                  <img 
                                    className="photo" 
                                    src={primaryImageUrl}
                                    alt={itemName}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      opacity: 1,
                                      transition: 'opacity 0.3s ease-in-out'
                                    }}
                                    onError={async (e) => {
                                      const currentSrc = e.target.src;
                                      console.error('❌ Lỗi khi tải ảnh từ:', currentSrc);
                                      
                                      try {
                                        // Thử tải dữ liệu từ URL như một JSON
                                        const response = await fetch(currentSrc);
                                        if (!response.ok) throw new Error('Lỗi khi tải dữ liệu');
                                        
                                        const data = await response.json();
                                        
                                        // Kiểm tra nếu có trường image trong JSON
                                        if (data.image) {
                                          console.log('🔄 Tìm thấy URL ảnh trong JSON:', data.image);
                                          e.target.src = data.image;
                                          return;
                                        }
                                        
                                        // Nếu không có trường image, thử các trường thông dụng khác
                                        const possibleImageFields = ['image_url', 'imageUrl', 'url', 'uri'];
                                        for (const field of possibleImageFields) {
                                          if (data[field]) {
                                            console.log(`🔄 Tìm thấy URL ảnh trong trường ${field}:`, data[field]);
                                            e.target.src = data[field];
                                            return;
                                          }
                                        }
                                        
                                        throw new Error('Không tìm thấy URL ảnh trong dữ liệu JSON');
                                      } catch (error) {
                                        console.error('❌ Lỗi khi xử lý dữ liệu ảnh:', error);
                                        
                                        // Nếu không thể xử lý JSON, thử tải lại với cache buster
                                        const retryCount = parseInt(e.target.getAttribute('data-retry') || '0');
                                        if (retryCount < 1) {
                                          e.target.setAttribute('data-retry', '1');
                                          const cacheBusterUrl = `${currentSrc.split('?')[0]}?t=${Date.now()}`;
                                          console.log('🔄 Thử tải lại với cache buster...');
                                          e.target.src = cacheBusterUrl;
                                          return;
                                        }
                                        
                                        // Nếu đã thử đủ số lần
                                        e.target.style.opacity = 0.3;
                                        e.target.style.filter = 'grayscale(100%)';
                                        
                                        // Hiển thị fallback
                                        const fallback = e.target.parentElement.querySelector('.image-fallback');
                                        if (fallback) {
                                          fallback.style.display = 'flex';
                                          fallback.textContent = 'Không thể tải ảnh';
                                        }
                                      }
                                    }}
                                    onLoad={(e) => {
                                      console.log('✅ Đã tải ảnh thành công từ:', e.target.src);
                                      e.target.style.opacity = 1;
                                    }}
                                  />
                                <div className="image-fallback" style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: '#f5f5f5',
                                  color: '#666',
                                  fontSize: '14px',
                                  textAlign: 'center',
                                  padding: '10px',
                                  zIndex: -1
                                }}>
                                  Loading NFT image...
                                </div>
                              </div>
                            )}
                            <Link to={`/asset-details/${itemId}`}>
                              <p className="bids-title">{itemName}</p>
                            </Link>
                          </div>
                          <div className="bids-card-bottom">
                            <p>{itemData.description || 'No description'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }
     
        
    }



    return(
        <div className="main">
            <div className="mainData">
                {renderData(data)}
            </div>
            <ul className="pageNumbers">
                {pageDecremenEllipses}
                {pageNumbers}
                {pageIncrementEllipses}
            </ul>
        </div>
    )
}
export default Pagination;
