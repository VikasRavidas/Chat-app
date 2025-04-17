import {
  CLEAR_AUTH_STATE,
  CLEAR_SEARCH,
  EDIT_USER_FAILED,
  EDIT_USER_SUCCESSFUL,
  LOGIN_FAILED,
  LOGIN_START,
  LOGIN_SUCCESS,
  LOG_OUT,
} from './actionTypes';
import { APIUrls } from '../helpers/urls';
import { SIGNUP_START, SIGNUP_SUCCESS, SIGNUP_FAILED } from './actionTypes';
import { getAuthTokenFromLocalStorage } from '../helpers/utils';
import { fetchUserFriends } from './friends';

export function startLogin() {
  return { type: LOGIN_START };
}

export function loginFailed(errorMessage) {
  return { type: LOGIN_FAILED, error: errorMessage };
}

export function loginSuccess(user) {
  return { type: LOGIN_SUCCESS, user }; // ✅ Corrected to return user
}

export function login(email, password) {
  return (dispatch) => {
    dispatch(startLogin());

    fetch(APIUrls.login(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // ✅ Fixed to send JSON
      },
      body: JSON.stringify({ email, password }),
    })
      .then(async (response) => {
        const data = await response.json();
        console.log('Response data', data);
        if (!response.ok) {
          throw new Error(data.error || 'Invalid email or password');
        }
        const u = data.token;
        if (u) {
          localStorage.setItem('token', u);
          console.log('token: ', u);
        }
        dispatch(loginSuccess(data.user));
      })
      .catch((error) => {
        dispatch(loginFailed(error.message));
      });
  };
}

export function startSignup() {
  return { type: SIGNUP_START };
}

export function signupSuccess(user) {
  return { type: SIGNUP_SUCCESS, user };
}

export function signupFailed(errorMessage) {
  return { type: SIGNUP_FAILED, error: errorMessage };
}

export function signup(name, email, password) {
  return async (dispatch) => {
    dispatch(startSignup());

    try {
      const response = await fetch(APIUrls.signup(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }
      const u = data.token;
      if (u) {
        console.log(u);
        localStorage.setItem('token', u);
      }
      dispatch(signupSuccess(data.user));
    } catch (error) {
      console.error('Signup error:', error);
      dispatch(
        signupFailed(error.message || 'Network error, please try again!'),
      );
    }
  };
}

export const authenticateUser = (user) => {
  return (dispatch) => {
    dispatch({
      type: 'AUTHENTICATE_USER',
      user,
    });

    // Fetch friends immediately after authentication
    if (user?.id) {
      dispatch(fetchUserFriends(user.id));
    }
  };
};

export function logoutUser() {
  return {
    type: LOG_OUT,
  };
}

export function clearAuthState() {
  return {
    type: CLEAR_AUTH_STATE,
  };
}

export function editUserSuccesful(user) {
  return { type: EDIT_USER_SUCCESSFUL, user };
}

export function editUserFailed(error) {
  return { type: EDIT_USER_FAILED, error };
}

export function editUser(id, name, password, confirmPassword) {
  return (dispatch) => {
    const url = APIUrls.editProfile();
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthTokenFromLocalStorage()}`,
      },
      body: JSON.stringify({ id, name, password, confirmPassword }),
    })
      .then(async (response) => {
        const data = await response.json();
        console.log('Response data edit', data);
        if (!response.ok) {
          throw new Error(data.error || 'Invalid email or password');
        }
        const u = data.token;
        if (u) {
          localStorage.setItem('token', u);
        }
        console.log('userId: ', data.user.id);
        dispatch(editUserSuccesful(data.user));
      })
      .catch((error) => {
        console.error('Edit profile error:', error);
        dispatch(editUserFailed(error.message));
      });
  };
}

export function ClearSearch() {
  return {
    type: CLEAR_SEARCH,
  };
}
