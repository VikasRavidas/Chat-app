import {
  FETCH_SEARCH_RESULTS_SUCCESS,
  CLEAR_SEARCH,
} from '../actions/actionTypes';

const initialSearchState = {
  results: [],
};

export default function search(state = initialSearchState, action) {
  switch (action.type) {
    case FETCH_SEARCH_RESULTS_SUCCESS:
      return {
        ...state,
        results: action.users,
      };
    case CLEAR_SEARCH:
      return {
        ...state,
        results: [],
      };
    default:
      return state;
  }
}
