import {
  ADD_POST,
  UPDATE_POSTS,
  ADD_COMMENT,
  UPDATE_POST_LIKE,
} from '../actions/actionTypes';

export default function posts(state = [], action) {
  switch (action.type) {
    case UPDATE_POSTS:
      return action.posts;
    case ADD_COMMENT:
      const newPosts = state.map((post) => {
        if (post.id === action.postId) {
          return {
            ...post,
            comments: [action.comment, ...post.comments],
          };
        }

        return post;
      });
      return newPosts;
    case ADD_POST:
      return [action.post, ...state];
    case UPDATE_POST_LIKE:
      return state.map((post) => {
        if (post.id === action.postId) {
          return {
            ...post,
            likes: action.deleted
              ? post.likes.filter((id) => id !== action.userId)
              : [...post.likes, action.userId],
          };
        }
        return post;
      });
    default:
      return state;
  }
}
