import React, { useState, useEffect, useCallback } from 'react';
import BidHistory from '../BidHistory/BidHistory';
import * as constant from '../../id/id';

const MarketplaceItems = () => {
  const [parentID, setParentID] = useState(null);
  const [bagData, setBagData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm tải dữ liệu NFT
  const loadNFT = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Đang tải dữ liệu NFT với marketID:', constant.marketID);
      
      // Kiểm tra nếu marketID không tồn tại
      if (!constant.marketID) {
        throw new Error('marketID không được định nghĩa trong file constant');
      }
      
      // Kiểm tra nếu client không tồn tại
      if (!constant.client) {
        throw new Error('Sui client chưa được khởi tạo');
      }
      
      const options = {
        showType: true,
        showOwner: true,
        showPreviousTransaction: true,
        showDisplay: true,
        showContent: true,
        showBcs: true,
        showStorageRebate: true
      };
      
      console.log('📡 Gọi API với tham số:', { 
        method: 'sui_getObject', 
        params: [constant.marketID, options] 
      });
      
      const result = await constant.client.call('sui_getObject', [
        constant.marketID,
        options
      ]);

      console.log('📥 Kết quả từ API:', result);
      
      // Kiểm tra lỗi từ API
      if (result?.error) {
        console.error('❌ Lỗi từ API:', result.error);
        throw new Error(result.error.message || `Lỗi khi tải dữ liệu từ API: ${JSON.stringify(result.error)}`);
      }
      
      if (!result) {
        throw new Error('Không nhận được phản hồi từ API');
      }

      setBagData(result);
      return result;
    } catch (err) {
      console.error('❌ Lỗi khi tải NFT:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
      setBagData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load dữ liệu khi component mount
  useEffect(() => {
    loadNFT();
  }, [loadNFT]);

  // Xử lý khi bagData thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!bagData) return;
      
      try {
        const id = bagData?.data?.content?.fields?.items?.fields?.id?.id;
        if (id) {
          setParentID(id);
        } else {
          console.warn('⚠️ Không tìm thấy ID trong dữ liệu bagData');
        }
      } catch (err) {
        console.error('❌ Lỗi khi xử lý dữ liệu bagData:', err);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [bagData]);

  // Xử lý khi parentID thay đổi
  useEffect(() => {
    if (!parentID) return;
    
    const fetchItems = async () => {
      try {
        const response = await constant.client.call('suix_getDynamicFields', [parentID]);
        if (response.error) {
          throw new Error(response.error.message || 'Lỗi khi tải danh sách items');
        }
        setItems(response.data || []);
      } catch (err) {
        console.error('❌ Lỗi khi tải items:', err);
        setItems([]);
      }
    };
    
    fetchItems();
  }, [parentID]);

return (
    <div className="NFTSaleTab">
      <BidHistory title="Welcome to EAM Marketplace" data={items} parentID={parentID} status={1} />
    </div>
  );
};

export default MarketplaceItems;
