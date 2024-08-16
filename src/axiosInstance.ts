import axios from "axios";
import { keycloakInstance } from "./keycloak";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_STAC_API,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    if (keycloakInstance.authenticated) {
      const token = await keycloakInstance.token;
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
