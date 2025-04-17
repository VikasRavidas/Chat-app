import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { ClearSearch, logoutUser } from '../actions/auth';
import gif from './img/chat_gif.gif';
import images from './img/images.png';
import search_icon from './img/search_icon.png';
import searchUsers from '../actions/Search';

class Navbar extends React.Component {
  searchInputRef = React.createRef();
  logOut = () => {
    localStorage.removeItem('token'); // Remove token from storage
    this.props.dispatch(logoutUser()); // Dispatch logout action
  };

  handleClearSearch = () => {
    this.props.dispatch(ClearSearch()); // Dispatch clear action
    if (this.searchInputRef.current) {
      this.searchInputRef.current.value = ''; // Clear input field
    }
  };

  handleSearch = (e) => {
    const searchText = e.target.value;

    this.props.dispatch(searchUsers(searchText));
  };

  render() {
    const { auth, results } = this.props;
    return (
      <nav className="nav">
        {/* Logo */}
        <div className="left-div">
          <Link to="/">
            <img src={gif} alt="logo" />
          </Link>
        </div>

        {/* Search Bar */}
        {auth.isLoggedin && (
          <div className="search-container">
            <img className="search-icon" src={search_icon} alt="search-icon" />
            <input
              placeholder="Search"
              onChange={this.handleSearch}
              ref={this.searchInputRef}
            />

            {/* Dummy search results */}
            {results.length > 0 && (
              <div className="search-results">
                <ul>
                  {results.map((user) => (
                    <li
                      className="search-results-row"
                      key={user.id}
                      onClick={this.handleClearSearch}
                    >
                      <Link to={`/user/${user.id}`}>
                        <img src={images} alt="user-dp" />
                        <span>{user.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Right Navigation */}
        <div className="right-nav">
          {/* User Profile */}
          <div className="user">
            <Link to="/settings">
              <img src={images} alt="user-dp" id="user-dp" />
            </Link>
            <span>{auth.isLoggedin ? auth.user.name : 'Guest'}</span>
          </div>

          {/* Navigation Links */}
          <div className="nav-links">
            <ul>
              {!auth.isLoggedin && (
                <li>
                  <Link to="/login">Log in</Link>
                </li>
              )}

              {auth.isLoggedin && (
                <li onClick={this.logOut} style={{ cursor: 'pointer' }}>
                  Log out
                </li>
              )}

              {!auth.isLoggedin && (
                <li>
                  <Link to="/signup">Register</Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}

// Map Redux state to component props
const mapStateToProps = (state) => ({
  auth: state.auth,
  results: state.search.results,
});

// Connect Navbar to Redux
export default connect(mapStateToProps)(Navbar);
