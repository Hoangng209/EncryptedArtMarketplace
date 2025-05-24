import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export const pinataService = {
  // Upload file to IPFS via Pinata
  async uploadFile(file: Express.Multer.File): Promise<PinataResponse> {
    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('file', blob, file.originalname);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    return response.data;
  },

  // Upload JSON metadata to IPFS via Pinata
  async uploadJson(metadata: any): Promise<PinataResponse> {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataMetadata: {
          name: metadata.name || 'metadata.json',
        },
        pinataContent: metadata,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    return response.data;
  },

  // Get IPFS URL from hash
  getIpfsUrl(hash: string): string {
    return `https://ipfs.io/ipfs/${hash}`;
  },
};
