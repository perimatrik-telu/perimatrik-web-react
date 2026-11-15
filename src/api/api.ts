import { MAIN_URL } from "@/constants/constant";
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: MAIN_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
