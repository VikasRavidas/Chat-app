import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { fetchPosts } from '../actions/posts';
import Navbar from './Navbar';
import Page404 from './Page404';
import Home from './Home';
import Login from './Login';
import Signup from './SignUp';
import { jwtDecode } from 'jwt-decode';
import { authenticateUser } from '../actions/auth';
import Settings from './Setting';

import { useLocation } from 'react-router-dom';
import UserProfile from './UserProfile';
import { fetchUserFriends } from '../actions/friends';

const PrivateRoute = ({ children, isLoggedin }) => {
  const location = useLocation(); // ✅ Get current location

  return isLoggedin ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

class App extends React.Component {
  componentDidUpdate(prevProps) {
    if (prevProps.auth.user?.id !== this.props.auth.user?.id) {
      if (this.props.auth.user) {
        this.props.dispatch(fetchUserFriends(this.props.auth.user.id));
      }
    }
  }

  componentDidMount() {
    this.props.dispatch(fetchPosts());

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const user = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Convert to seconds

        if (user.exp < currentTime) {
          // Token expired
          console.warn('Token expired, logging out user...');
          this.handleLogout();
        } else {
          // Token is still valid
          this.props.dispatch(
            authenticateUser({
              id: user.id,
              name: user.name,
              email: user.email,
            }),
          );

          // Auto logout when the token expires
          const timeToExpire = (user.exp - currentTime) * 1000;
          this.autoLogoutTimer = setTimeout(() => {
            console.warn('Token expired automatically, logging out user...');
            this.handleLogout();
          }, timeToExpire);
        }
        this.props.dispatch(fetchUserFriends(user.id));
      } catch (error) {
        console.error('Invalid token:', error);
        this.handleLogout();
      }
    }
  }

  // Logout function to clear token and redirect
  handleLogout = () => {
    localStorage.removeItem('token');
    this.props.dispatch(authenticateUser(null)); // Clear auth state
    window.location.href = '/login'; // Redirect to login page
  };

  // Clear timeout when component unmounts
  componentWillUnmount() {
    if (this.autoLogoutTimer) {
      clearTimeout(this.autoLogoutTimer);
    }
  }

  render() {
    const { posts, auth, friends } = this.props;
    console.log('friend in FriendsList: ', friends);
    return (
      <Router>
        <div>
          <Navbar user={auth.user} />
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute isLoggedin={auth.isLoggedin}>
                  <Home
                    posts={posts}
                    friends={friends}
                    isLoggedin={auth.isLoggedin}
                  />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/settings"
              element={
                <PrivateRoute isLoggedin={auth.isLoggedin}>
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/:id"
              element={
                <PrivateRoute isLoggedin={auth.isLoggedin}>
                  <UserProfile />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Page404 />} />
          </Routes>
        </div>
      </Router>
    );
  }
}

const mapStateToProps = (state) => ({
  posts: state.posts,
  auth: state.auth,
  friends: state.friends,
});

App.propTypes = {
  posts: PropTypes.array.isRequired,
  auth: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(App);
