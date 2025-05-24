import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { pinataService } from './services/pinata';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const response = await pinataService.uploadFile(file);
    const ipfsUrl = pinataService.getIpfsUrl(response.IpfsHash);

    res.json({
      success: true,
      ipfsHash: response.IpfsHash,
      ipfsUrl,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

app.post('/api/upload-metadata', async (req, res) => {
  try {
    const metadata = req.body;
    const response = await pinataService.uploadJson(metadata);
    const ipfsUrl = pinataService.getIpfsUrl(response.IpfsHash);

    res.json({
      success: true,
      ipfsHash: response.IpfsHash,
      ipfsUrl,
    });
  } catch (error) {
    console.error('Error uploading metadata:', error);
    res.status(500).json({ error: 'Failed to upload metadata' });
  }
});

// Endpoint to prepare NFT minting transaction
app.post('/api/prepare-mint', async (req, res) => {
  try {
    const { name, description, metadataUrl, price, royalties, category } = req.body;
    
    if (!name || !description || !metadataUrl) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: req.body 
      });
    }
    
    console.log('Received mint request:', req.body);
    
    // Instead of creating a mock transaction block, we'll return the metadata
    // and other necessary information for the frontend to create its own transaction
    
    // Return the data that the frontend needs
    res.json({
      success: true,
      name,
      description,
      metadataUrl,
      price,
      royalties,
      category,
      // Include a flag to indicate this is not a serialized transaction
      requiresClientSideTxn: true
    });
  } catch (error) {
    console.error('Error preparing mint transaction:', error);
    res.status(500).json({ error: 'Failed to prepare mint transaction' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
