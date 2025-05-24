import React from 'react';
import './Footer.css';
import { AiOutlineInstagram, AiOutlineTwitter } from "react-icons/ai";
import { RiDiscordFill } from "react-icons/ri";
import { FaTelegramPlane } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} ForFuture, Inc. All Rights Reserved</p>
        <div className="footer-social">
          <AiOutlineInstagram size={20} color='white' className='footer-icon' />
          <AiOutlineTwitter size={20} color='white' className='footer-icon' />
          <RiDiscordFill size={20} color='white' className='footer-icon' />
          <FaTelegramPlane size={20} color='white' className='footer-icon' />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
