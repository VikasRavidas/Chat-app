const API_ROOT = 'http://localhost:8000/api/v2';

export const APIUrls = {
  editProfile: () => `${API_ROOT}/users/edit`,
  login: () => `${API_ROOT}/users/login`,
  signup: () => `${API_ROOT}/users/signup`,
  fetchPosts: (page = 1, limit = 5) =>
    `${API_ROOT}/posts?page=${page}&limit=${limit}`,
  userProfile: (id) => `${API_ROOT}/user/${id}`,
  userFriends: () => `${API_ROOT}/friendship/fetch_user_friends`,
  addFriend: () => `${API_ROOT}/friendship/add`, // ✅ No need to pass ID in URL
  removeFriend: () => `${API_ROOT}/friendship/remove`,
  createPost: () => `${API_ROOT}/posts/create`,
  createComment: () => `${API_ROOT}/comments/`,
  toggleLike: () => `${API_ROOT}/likes/toggle`,
  userSearch: () => `${API_ROOT}/users/search`,
};
