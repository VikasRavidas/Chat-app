import React, { Component } from 'react';
import PostsList from './PostsList';
import FriendsList from './FriendsList';
import Chat from './Chat';

class Home extends Component {
  render() {
    const { posts, friends, isLoggedin } = this.props;
    return (
      <div className="home">
        <PostsList posts={posts} />
        {isLoggedin && <FriendsList friends={isLoggedin && friends} />}
        <Chat />
      </div>
    );
  }
}

export default Home;
