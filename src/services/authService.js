import api from "../api/axios";

export const registerUser = async (formData) => {
  const res = await api.post("/users/register", formData);
  return res.data;
};

export const loginUser = async (formData) => {
  const res = await api.post("/users/login", formData);
  return res.data;
};

export const logoutUser = async () => {
  const res = await api.post("/users/logout");
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/users/current-user");
  return res.data;
};
