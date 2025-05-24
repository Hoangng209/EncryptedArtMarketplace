import { useEffect, useState } from 'react';
import './App.css';
import { Navigation, Footer } from './components';
import { HomePage, AssetView, CreateAsset, MintAsset, UserAssets, AssetDetails, PlaceBid } from './pages';
import { Routes, Route, useLocation } from 'react-router-dom';

// Main content wrapper component
const MainContent = ({ children, isMenuOpen, onMenuToggle }) => {
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1050) {
        onMenuToggle(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onMenuToggle]);

  return (
    <div className="app-container">
      <Navigation isMenuOpen={isMenuOpen} onMenuToggle={onMenuToggle} />
      <main className={`main-content ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="app">
      <MainContent isMenuOpen={isMenuOpen} onMenuToggle={setIsMenuOpen}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/asset/:id/:price/:owner/:type" element={<AssetView />} />
          <Route path="/place-bid/:id/:price/:owner/:auctionID" element={<PlaceBid />} />
          <Route path="/asset-details/:id" element={<AssetDetails />} />
          <Route path="/create-asset" element={<CreateAsset />} />
          <Route path="/mint-asset" element={<MintAsset />} />
          <Route path="/my-assets" element={<UserAssets />} />
        </Routes>
      </MainContent>
      <Footer />
    </div>
  );
}

export default App;
