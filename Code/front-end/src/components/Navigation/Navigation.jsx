import React, { useState, useEffect } from 'react';
import './Navigation.css';
import { RiMenu3Line, RiCloseLine, RiSearchLine, RiHome4Line, RiImageAddLine, RiStore2Line, RiLogoutBoxLine } from 'react-icons/ri';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { ConnectButton } from '@suiet/wallet-kit';

// Menu items component
const Menu = ({ onItemClick }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <NavLink to="/" className={isActive('/') ? 'active' : ''} onClick={onItemClick}>
        <p><RiHome4Line className="menu-icon" /> Home</p>
      </NavLink>
      <NavLink to="/mint-asset" className={isActive('/mint-asset') ? 'active' : ''} onClick={onItemClick}>
        <p><RiImageAddLine className="menu-icon" /> Mint</p>
      </NavLink>
      <NavLink to="/my-assets" className={isActive('/my-assets') ? 'active' : ''} onClick={onItemClick}>
        <p><RiStore2Line className="menu-icon" /> My Assets</p>
      </NavLink>
    </>
  );
};

const Navbar = ({ isMenuOpen, onMenuToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Close mobile menu when route changes or window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1050) {
        onMenuToggle(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onMenuToggle]);

  const toggleMenu = () => {
    onMenuToggle(!isMenuOpen);
  };

  const closeMenu = () => {
    if (window.innerWidth <= 1050) {
      onMenuToggle(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <>
      <div className={`navbar ${isMenuOpen ? 'active' : ''}`}>
        <div className="navbar-links">
          <div className="navbar-links_logo">
            <Link to="/">
              <h1>Eam</h1>
            </Link>
          </div>
          
          <div className="navbar-links_container">
            <div className="menu-items">
              <Menu onItemClick={closeMenu} />
            </div>
          </div>
          
          {/* Empty spacer to push wallet to bottom */}
          <div className="navbar-spacer"></div>
          
          <div className="navbar-wallet-container">
            <div className="navbar-sign">
              <div className="connect-wallet-btn">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu toggle button */}
      <div className="navbar-menu" onClick={toggleMenu}>
        {isMenuOpen ? (
          <RiCloseLine color="#fff" size={27} />
        ) : (
          <RiMenu3Line color="#fff" size={27} />
        )}
      </div>
      
      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div className="navbar-overlay" onClick={toggleMenu}></div>
      )}
    </>
  )
}

export default Navbar
