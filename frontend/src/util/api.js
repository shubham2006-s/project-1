import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
});

// ✅ Attach token in every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = "Bearer " + token;
  }
  return req;
});

// ✅ Handle expired token globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response &&
      err.response.status === 401
    ) {

      const currentPath =
        window.location.pathname;

      const publicRoutes = [
        "/login",
        "/signup",
        "/forgot-password",
      ];

      if (
        !publicRoutes.includes(currentPath)
      ) {
        localStorage.removeItem("token");

        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default API;