import React, { useState, useContext } from "react";
import "./Navbar.css";
import MobileNav from "./MobileNav";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../Authenticator/Authenticator"; // Adjust path if needed

function NavBar({ getSearchResults }) {
  const [openMenu, setOpenMenu] = useState(false);
  const [searchText, setSearchText] = useState("");

  const { isAuthenticated, logout } = useContext(AuthContext);

  const toggleMenu = () => setOpenMenu(!openMenu);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (getSearchResults) {
      await getSearchResults(searchText.trim());
    }
    setSearchText("");
  };

  return (
    <>
      <MobileNav
        isOpen={openMenu}
        toggleMenu={toggleMenu}
        getSearchResults={getSearchResults}
      />

      <button className="menu-btn-fixed" onClick={toggleMenu}>
        <div className="material-symbols-outlined" style={{ fontSize: "1.8rem" }}>
          {openMenu ? "close" : "menu"}
        </div>
      </button>

      <nav className="nav-wrapper">
        <div className="nav-content">
          <NavLink to="/">
            <p className="navbar-p">
              <i className="fa-solid fa-tv"></i> UWatchFree
            </p>
          </NavLink>

          <ul>
            <NavLink to="/">
              <span className="menu-item">Home</span>
            </NavLink>
            <NavLink to="/watchlist">
              <span className="menu-item">To-Watch List</span>
            </NavLink>
            <NavLink to="/completed_watchlist">
              <span className="menu-item">Completed Watchlist</span>
            </NavLink>
            <NavLink to="/addMovie">
              <span className="menu-item">Add A Movie</span>
            </NavLink>

            <li className="search-container">
              <form onSubmit={handleSubmit} className="search-form">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button">Go</button>
              </form>
            </li>

            {isAuthenticated ? (
              <button className="contact-btn" onClick={logout}>
                Logout
              </button>
            ) : (
              <NavLink to="/login">
                <button className="contact-btn">Login</button>
              </NavLink>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
