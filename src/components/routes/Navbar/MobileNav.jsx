import React, { useState, useContext } from "react";
import "./MobileNav.css";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../Authenticator/Authenticator"; // Adjust path if needed

const MobileNav = ({ isOpen, toggleMenu, getSearchResults }) => {
  const [searchText, setSearchText] = useState("");
  const { isAuthenticated, logout } = useContext(AuthContext);

  const handleNavClick = () => {
    if (isOpen) toggleMenu();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (getSearchResults) {
      getSearchResults(searchText.trim());
    }
    setSearchText("");
    toggleMenu();
  };

  return (
    <div className={`mobile-menu ${isOpen ? "active" : ""}`} onClick={toggleMenu}>
      <div className="mobile-menu-container" onClick={(e) => e.stopPropagation()}>
        <ul className="mobile-ul">
          <NavLink to="/">
            <span onClick={handleNavClick} className="menu-mobile-item">Movie Central</span>
          </NavLink>
          <NavLink to="/watchlist">
            <span onClick={handleNavClick} className="menu-mobile-item">My Watch List</span>
          </NavLink>
          <NavLink to="/completed_watchlist">
            <span onClick={handleNavClick} className="menu-mobile-item">Movie History</span>
          </NavLink>
          <NavLink to="/addMovie">
            <span onClick={handleNavClick} className="menu-mobile-item">Log A Movie</span>
          </NavLink>

          {isAuthenticated ? (
            <button className="contact-btn-mobile" onClick={() => { logout(); toggleMenu(); }}>
              Logout
            </button>
          ) : (
            <NavLink to="/login">
              <button className="mobile-search-button login" onClick={toggleMenu}>Login</button>
            </NavLink>
          )}
        </ul>

        <form onSubmit={handleSubmit} className="mobile-search-form">
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="mobile-search-input"
          />
          <button type="submit" className="mobile-search-button">Go</button>
        </form>
      </div>
    </div>
  );
};

export default MobileNav;
