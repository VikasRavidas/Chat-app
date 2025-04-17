import { FETCH_SEARCH_RESULTS_SUCCESS } from './actionTypes';
import { getAuthTokenFromLocalStorage } from '../helpers/utils';
import { APIUrls } from '../helpers/urls';

export default function searchUsers(searchText) {
  return (dispatch) => {
    const url = APIUrls.userSearch();

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthTokenFromLocalStorage()}`,
      },
      body: JSON.stringify({ searchText }),
    })
      .then((repsonse) => repsonse.json())
      .then((data) => {
        console.log('SEARCH data', data);
        if (data.success) {
          dispatch(searchResultsSuccess(data.data.users));
        } else {
          dispatch(searchResultsSuccess([]));
        }
      })
      .catch((error) => {
        console.log('search error: ', error);
      });
  };
}

export function searchResultsSuccess(users) {
  return {
    type: FETCH_SEARCH_RESULTS_SUCCESS,
    users,
  };
}
