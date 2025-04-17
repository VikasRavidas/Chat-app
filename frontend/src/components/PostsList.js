import React, { Component } from 'react';
import images from './img/images.png';
import PropTypes from 'prop-types';
import like from './img/love.jpeg';
import comment_icon from './img/comment_icon.png';
import { Link } from 'react-router-dom';
import CreatePost from './CreatePost';
import Post from './Post';

class PostsList extends Component {
  render() {
    const { posts } = this.props;
    return (
      <div className="posts-list">
        <CreatePost />
        {posts.map((post) => (
          <Post post={post} key={post.id} />
        ))}
      </div>
    );
  }
}

PostsList.propTypes = {
  posts: PropTypes.array.isRequired,
};
export default PostsList;
