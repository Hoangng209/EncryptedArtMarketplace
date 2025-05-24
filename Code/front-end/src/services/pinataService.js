import axios from 'axios';
import config from '../config/config';

const API_BASE_URL = config.apiBaseUrl;

/**
 * Tải lên hình ảnh lên Pinata thông qua backend
 * @param {File} file - File ảnh cần tải lên
 * @returns {Promise<string>} - URL của hình ảnh đã tải lên
 */
export const uploadImageToPinata = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      `${API_BASE_URL}${config.endpoints.upload}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data && response.data.ipfsHash) {
      return `https://gateway.pinata.cloud/ipfs/${response.data.ipfsHash}`;
    }
    
    throw new Error('Không nhận được IPFS hash từ server');
  } catch (error) {
    console.error('Lỗi khi tải lên hình ảnh:', error);
    throw new Error('Không thể tải lên hình ảnh. Vui lòng thử lại sau.');
  }
};

/**
 * Tải lên metadata của NFT lên Pinata
 * @param {Object} metadata - Metadata của NFT
 * @returns {Promise<string>} - URL của metadata đã tải lên
 */
export const uploadMetadataToPinata = async (metadata) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}${config.endpoints.uploadJson}`,
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.ipfsHash) {
      return `https://gateway.pinata.cloud/ipfs/${response.data.ipfsHash}`;
    }
    
    throw new Error('Không nhận được IPFS hash từ server');
  } catch (error) {
    console.error('Lỗi khi tải lên metadata:', error);
    throw new Error('Không thể tải lên metadata. Vui lòng thử lại sau.');
  }
};
