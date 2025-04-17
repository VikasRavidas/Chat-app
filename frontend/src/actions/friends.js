import { APIUrls } from '../helpers/urls';
import { getAuthTokenFromLocalStorage } from '../helpers/utils';
import {
  FETCH_FRIENDS_SUCCESS,
  ADD_FRIEND,
  REMOVE_FRIEND,
} from './actionTypes';

export function fetchUserFriends(id) {
  return (dispatch) => {
    const url = APIUrls.userFriends(id);
    fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthTokenFromLocalStorage()}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('data', data);
        dispatch(fetchFriendsSuccess(data.friends));
      })
      .catch((error) => {
        console.log('friends error: ', error);
      });
  };
}

export function fetchFriendsSuccess(friends) {
  // ✅ Corrected function name
  return {
    type: FETCH_FRIENDS_SUCCESS,
    friends,
  };
}

export function addFriend(friend) {
  return {
    type: ADD_FRIEND,
    friend,
  };
}
export function removeFriend(id) {
  return {
    type: REMOVE_FRIEND,
    id,
  };
}
