import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Comment from './Comment';
import { createComment } from '../actions/posts';
import image from '../components/img/images.png';
import like_icon from '../components/img/love.jpeg';
import comment_icon from '../components/img/comment_icon.png';
import { addLike } from '../actions/posts';

class Post extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comment: '',
    };
  }
  handleAddComment = (e) => {
    const { comment } = this.state;
    const { post } = this.props;

    if (e.key === 'Enter') {
      this.props.dispatch(createComment(comment, post.id));

      // clear comment
      this.setState({
        comment: '',
      });
    }
  };

  handleOnCommentChange = (e) => {
    this.setState({
      comment: e.target.value,
    });
  };

  handlePostLike = () => {
    const { post, user } = this.props;
    this.props.dispatch(addLike(post.id, 'post', user.id));
  };

  render() {
    const { post, user } = this.props;
    const { comment } = this.state;
    const isPostLikedByUser = post.likes.includes(user.id);
    return (
      <div className="post-wrapper" key={post.id}>
        <div className="post-header">
          <div className="post-avatar">
            <Link to={`/user/${post.id}`}>
              <img src={image} alt="user-pic" />
            </Link>
            <div>
              <span className="post-author">{post.user.name}</span>
              <span className="post-time">a minute ago</span>
            </div>
          </div>
          <div className="post-content">{post.content}</div>

          <div className="post-actions">
            <button className="post-like no-btn" onClick={this.handlePostLike}>
              {isPostLikedByUser ? (
                <img src={like_icon} alt="like post" />
              ) : (
                <img src={like_icon} alt="likes-icon" />
              )}
              <span>{post.likes.length}</span>
            </button>

            <div className="post-comments-icon">
              <img src={comment_icon} alt="comments-icon" />
              <span>{post.comments.length}</span>
            </div>
          </div>
          <div className="post-comment-box">
            <input
              placeholder="Start typing a comment"
              onChange={this.handleOnCommentChange}
              onKeyPress={this.handleAddComment}
              value={comment}
            />
          </div>

          <div className="post-comments-list">
            {post.comments.map((comment) => (
              <Comment comment={comment} key={comment.id} postId={post.id} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

Post.propTypes = {
  post: PropTypes.object.isRequired,
};

function mapStateToProps({ auth }) {
  return {
    user: auth.user,
  };
}
export default connect(mapStateToProps)(Post);
