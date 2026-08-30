import { apiGet, apiPost, apiPatch } from './apiConfig';

export const authAPI = {
  login: async (email, password) => {
    // backend accepts either email or username
    const data = await apiPost('/users/login', { email, password });
    if (data?.accessToken) {
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data; // { user, accessToken, refreshToken }
  },

  register: async (userData) => {
    // userData: { username, email, fullName, password, phone, role }
    const data = await apiPost('/users/register', userData);
    return data; // backend does NOT auto-login on register — call login() after
  },

  logout: async () => {
    try {
      await apiPost('/users/logout', {});
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: async () => {
    return await apiGet('/users/current-user');
  },

  updateProfile: async (userData) => {
    // backend only accepts fullName and phone
    const data = await apiPatch('/users/update-account', userData);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  },

  // NOTE: the current backend does not implement change-password,
  // forgot-password, or reset-password routes yet. These will fail
  // until those routes/controllers are added on the backend.
  changePassword: async (currentPassword, newPassword) => {
    return await apiPost('/users/change-password', { currentPassword, newPassword });
  },

  forgotPassword: async (email) => {
    return await apiPost('/users/forgot-password', { email });
  },

  resetPassword: async (token, newPassword) => {
    return await apiPost('/users/reset-password', { token, newPassword });
  },
};

export default authAPI;
