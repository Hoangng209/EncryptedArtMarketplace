<h1 align="center">ENCRYPTEDARTMARKETPLACE</h1>
<p align="center"><em>Empowering Artists, Securing Digital Art Ownership</em></p>
  <!-- Badges -->
  <br/><br/>
 <p align="center">
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/JSON-000000?style=flat-square&logo=json&logoColor=white" alt="JSON"/>
  <img src="https://img.shields.io/badge/Markdown-000000?style=flat-square&logo=markdown&logoColor=white" alt="Markdown"/>
  <img src="https://img.shields.io/badge/npm-CB3837?style=flat-square&logo=npm&logoColor=white" alt="npm"/>
  <img src="https://img.shields.io/badge/TOML-000000?style=flat-square" alt="TOML"/>
  <img src="https://img.shields.io/badge/dotenv-000000?style=flat-square&logo=dotenv&logoColor=white" alt="dotenv"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/React_Bootstrap-563D7C?style=flat-square&logo=react&logoColor=white" alt="React Bootstrap"/>
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Sanity-000000?style=flat-square" alt="Sanity"/>
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white" alt="GitHub Actions"/>
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=reactrouter&logoColor=white" alt="React Router"/>
</p>
</p>

---

## Table of Contents

- [Overview](#overview)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  


---

## Overview

EncryptedArtMarketplace is a cutting-edge decentralized platform designed for the secure buying, selling, and trading of encrypted digital art.

**Why EncryptedArtMarketplace?**  
This project leverages blockchain technology to ensure secure transactions and ownership verification, fostering a transparent marketplace for artists and collectors. The core features include:

- 🔒 **Decentralized Marketplace:** Enables secure trading of digital art, addressing trust and ownership concerns.  
- 🛡️ **Blockchain Integration:** Ensures transaction security and transparency.  
- 🖼️ **NFT Management:** Simplifies creation and transfer of NFTs, streamlining digital asset workflows.  
- ✨ **User-Friendly UI:** Offers a responsive interface for seamless user interactions.  
- 📦 **Efficient Asset Uploading:** Integrates with IPFS for reliable asset storage.  
- ⚡ **Real-Time Updates:** Provides immediate feedback on transactions, improving engagement.

---

## Getting Started

### Prerequisites

- **Programming Language:** JavaScript  
- **Package Manager:** npm

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Hoangng289/EncryptedArtMarketplace.git

2. **Navigate to the project directory:**
   ```bash
   cd EncryptedArtMarketplace

3. **Install dependencies:**
   ```bash
   npm install

4. **Publish package**
   ```bash
   sui client publish --gas-budget 5000000

5. **Pulish marketplace package**
   ```bash
   sui client call --package <yourpackageid> --module marketplace --function create --type-args 0x2::sui::SUI --gas-budget 100000000 



[⬆️ Back to top](#table-of-contents)
