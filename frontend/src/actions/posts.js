import {
  ADD_POST,
  UPDATE_POSTS,
  ADD_COMMENT,
  UPDATE_POST_LIKE,
} from './actionTypes';
import { APIUrls } from '../helpers/urls';
import { getAuthTokenFromLocalStorage } from '../helpers/utils';

export function fetchPosts() {
  return (dispatch) => {
    const url = APIUrls.fetchPosts();
    fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        dispatch(updatePosts(data.data.posts));
      });
  };
}

export function updatePosts(posts) {
  return {
    type: UPDATE_POSTS,
    posts,
  };
}

export function addPost(post) {
  return {
    type: ADD_POST,
    post,
  };
}

export function createPost(content) {
  return async (dispatch) => {
    const url = APIUrls.createPost();

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthTokenFromLocalStorage()}`,
      },
      body: JSON.stringify({ content }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      console.log('DATA:', data);

      if (data.success) {
        dispatch(addPost(data.post));
      } else {
        console.error('Failed to create post:', data.message);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };
}

export function createComment(content, postId) {
  return (dispatch) => {
    const url = APIUrls.createComment();
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthTokenFromLocalStorage()}`,
      },
      body: JSON.stringify({ content, postId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          dispatch(addComment(data.comment, postId));
        }
      });
  };
}

export function addComment(comment, postId) {
  return {
    type: ADD_COMMENT,
    comment,
    postId,
  };
}

export function addLike(id, likeType, userId) {
  return (dispatch) => {
    const url = APIUrls.toggleLike();

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthTokenFromLocalStorage()}`,
      },
      body: JSON.stringify({ id, likeType }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Use the response to determine if like was added or removed
          const deleted = !data.data.likeable.likes.includes(userId);
          dispatch(addLikeToStore(id, userId, deleted));
        }
      })
      .catch((error) => {
        console.log('add like error: ', error);
      });
  };
}

export function addLikeToStore(postId, userId, deleted) {
  return {
    type: UPDATE_POST_LIKE,
    postId,
    userId,
    deleted, // Add this flag to know if we're adding or removing
  };
}
