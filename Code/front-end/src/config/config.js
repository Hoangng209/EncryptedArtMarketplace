// Cấu hình backend
const config = {
  // URL của backend API
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  
  // Các endpoint API
  endpoints: {
    upload: '/api/upload',
    uploadJson: '/api/upload-metadata',
  },
  
  // Các thông báo lỗi
  errorMessages: {
    uploadFailed: 'Không thể tải lên tệp. Vui lòng thử lại sau.',
    invalidFile: 'Tệp không hợp lệ. Vui lòng chọn một tệp hình ảnh.',
    networkError: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn.',
  },
};

export default config;
