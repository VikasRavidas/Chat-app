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
  const location = useLocation();
  return isLoggedin ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

class App extends React.Component {
  state = {
    isLoading: true,
    error: null,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.auth.user?.id !== this.props.auth.user?.id) {
      if (this.props.auth.user) {
        this.props.dispatch(fetchUserFriends(this.props.auth.user.id));
      }
    }
  }

  async componentDidMount() {
    try {
      await this.props.dispatch(fetchPosts());
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const user = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (user.exp < currentTime) {
            console.warn('Token expired, logging out user...');
            this.handleLogout();
          } else {
            this.props.dispatch(
              authenticateUser({
                id: user.id,
                name: user.name,
                email: user.email,
              }),
            );

            const timeToExpire = (user.exp - currentTime) * 1000;
            this.autoLogoutTimer = setTimeout(() => {
              console.warn('Token expired automatically, logging out user...');
              this.handleLogout();
            }, timeToExpire);
          }
          await this.props.dispatch(fetchUserFriends(user.id));
        } catch (error) {
          console.error('Invalid token:', error);
          this.handleLogout();
        }
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      this.setState({ error: 'Failed to load application data' });
    } finally {
      this.setState({ isLoading: false });
    }
  }

  handleLogout = () => {
    localStorage.removeItem('token');
    this.props.dispatch(authenticateUser(null));
    window.location.href = '/login';
  };

  componentWillUnmount() {
    if (this.autoLogoutTimer) {
      clearTimeout(this.autoLogoutTimer);
    }
  }

  render() {
    const { posts, auth, friends } = this.props;
    const { isLoading, error } = this.state;

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>Error: {error}</div>;
    }

    return (
      <Router>
        <div>
          <Navbar />
          <Routes>
            <Route
              exact
              path="/"
              element={
                <PrivateRoute isLoggedin={auth.isLoggedin}>
                  <Home posts={posts} friends={friends} />
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
              path="/user/:userId"
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

App.propTypes = {
  posts: PropTypes.array.isRequired,
  auth: PropTypes.object.isRequired,
  friends: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  posts: state.posts,
  auth: state.auth,
  friends: state.friends,
});

export default connect(mapStateToProps)(App);
