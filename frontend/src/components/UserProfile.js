import React, { Component } from 'react';
import { useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import image from '../components/img/images.png';
import { fetchUserProfile } from '../actions/profile';
import { APIUrls } from '../helpers/urls';
import { getAuthTokenFromLocalStorage } from '../helpers/utils';
import { addFriend, removeFriend } from '../actions/friends';

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      success: null,
      error: null,
      successMessage: null,
    };
  }

  componentDidUpdate(prevProps) {
    // Handle user ID parameter changes
    const prevUserId = prevProps.params.id;
    const currentUserId = this.props.params.id;

    // Handle friends list updates
    const prevFriends = prevProps.friends;
    const currentFriends = this.props.friends;

    if (prevUserId !== currentUserId) {
      this.props.fetchUserProfile(currentUserId);
    }

    if (prevFriends !== currentFriends) {
      this.setState({}); // Force re-render when friends list changes
    }
  }

  componentDidMount() {
    const { id } = this.props.params; // Get userId from props
    console.log('User ID:', id);

    if (id) {
      this.props.fetchUserProfile(id); // ✅ Correct way to call the action
    }
  }

  checkIfUserIsAFriend = () => {
    console.log('this.props add friend: ', this.props);
    const { id } = this.props.params;
    const { friends } = this.props;

    console.log('Friends List:', friends);

    // Using find() instead of map().indexOf()
    const friend = friends.find((friend) => String(friend.id) === String(id));

    return !!friend; // Returns true if friend exists, otherwise false
  };

  checkIfUserIsSelf = () => {
    console.log('this.props add friend: ', this.props);
    const { id } = this.props.params;
    const { auth } = this.props;
    console.log('Friends List auth:', auth);
    console.log('Friends List auth id:', auth.user.id);
    console.log('Friends List user id:', id);
    return auth.user.id == id;
  };

  handleAddFriendClick = async () => {
    const { id } = this.props.params;
    console.log('add friend id: ', id);
    const url = APIUrls.addFriend(); // Don't pass ID in URL

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthTokenFromLocalStorage()}`,
      },
      body: JSON.stringify({ friendId: id }), // ✅ Send friendId in body
    };

    const response = await fetch(url, options);

    const data = await response.json();
    if (data) {
      console.log('add user data: ', data);
    }
    if (data.success) {
      this.setState({
        success: true,
        successMessage: 'User added successfully!',
      });
      console.log('add user data: ', data.friend);
      this.props.addFriend(data.friend);
    } else {
      this.setState({
        success: null,
        error: data.message,
      });
    }
  };

  handleRemoveFriendClick = async () => {
    const { id } = this.props.params; // Friend's ID
    console.log('remove friend id:', id);

    const url = APIUrls.removeFriend(); // No ID in URL, send it in the body

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthTokenFromLocalStorage()}`,
      },
      body: JSON.stringify({ friendId: id }), // ✅ Send friendId in request body
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (data) {
      console.log('remove user data:', data);
    }

    if (data.success) {
      this.setState({
        success: true,
        successMessage: 'User removed successfully!',
      });

      console.log('Removed user data:', data.friend);
      this.props.removeFriend(data.friend.id); // Dispatch action to remove friend
    } else {
      this.setState({
        success: null,
        error: data.message,
      });
    }
  };

  render() {
    const { profile } = this.props;
    const user = profile?.user || {}; // ✅ Ensure `user` exists
    // if (profile.inProgress) {
    //   return <h1>Loading....</h1>;
    // }
    const isUserSelf = this.checkIfUserIsSelf();
    console.log('is User self: ', isUserSelf);
    const isUserAFriend = this.checkIfUserIsAFriend();
    const { success, error, successMessage } = this.state;
    // const { id } = this.props.params;
    // console.log('curr userid: ', id); //id of the friends showing on clicking profile photos
    // console.log('user id: ', user.id); //id of the friends showing on clicking profile photos
    return (
      <div className="settings">
        <div className="img-container">
          <img src={image} alt="user-dp" />
        </div>

        <div className="field">
          <div className="field-label">Name</div>
          <div className="field-value">{user.name || 'Some name'}</div>
        </div>

        <div className="field">
          <div className="field-label">Email</div>
          <div className="field-value">{user.email || 'a@a.com'}</div>
        </div>

        {!isUserSelf && (
          <div className="btn-grp">
            {!isUserAFriend ? (
              <button
                className="button save-btn"
                onClick={this.handleAddFriendClick}
              >
                Add Friend
              </button>
            ) : (
              <button
                className="button save-btn"
                onClick={this.handleRemoveFriendClick}
              >
                Remove Friend
              </button>
            )}
            {success && (
              <div className="alert success-dailog">{successMessage}</div>
            )}
            {error && <div className="alert error-dailog">{error}</div>}
          </div>
        )}
      </div>
    );
  }
}

// Wrapper function to pass URL params to class component
const UserProfileWithParams = (props) => {
  const params = useParams();
  return <UserProfile {...props} params={params} />;
};

// ✅ Connect Redux state and actions to UserProfile
const mapStateToProps = (state) => ({
  profile: state.profile,
  friends: state.friends,
  auth: state.auth, // Adjust this based on your Redux store structure
});

const mapDispatchToProps = (dispatch) => ({
  fetchUserProfile: (id) => dispatch(fetchUserProfile(id)),
  addFriend: (friend) => dispatch(addFriend(friend)),
  removeFriend: (id) => dispatch(removeFriend(id)), // ✅ Correctly map addFriend action
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserProfileWithParams);
