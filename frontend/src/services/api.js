import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API endpoints
export const poojaAPI = {
  getAll: (params) => api.get("/poojas", { params }),
  getBySlug: (slug) => api.get(`/poojas/${slug}`),
  getFeatured: () => api.get("/poojas?featured=true"),
  search: (query) => api.get(`/poojas/search`, { params: { q: query } }),
};

export const productAPI = {
  getAll: (params) => api.get("/shop/products", { params }),
  getBySlug: (slug) => api.get(`/shop/products/${slug}`),
  getByCategory: (category) => api.get(`/shop/products?category=${category}`),
};

export const panditAPI = {
  getAll: (params) => api.get("/pandits", { params }),
  getById: (id) => api.get(`/pandits/${id}`),
  book: (bookingData) => api.post("/bookings", bookingData),
};

export const templeAPI = {
  getAll: (params) => api.get("/temples", { params }),
  getById: (id) => api.get(`/temples/${id}`),
  search: (query) => api.get(`/temples/search`, { params: { q: query } }),
};

export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
  verify: () => api.get("/auth/verify"),
};

export const cartAPI = {
  get: () => api.get("/cart"),
  add: (item) => api.post("/cart/add", item),
  update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete("/cart"),
};

export const orderAPI = {
  create: (orderData) => api.post("/orders", orderData),
  getAll: () => api.get("/orders"),
  getById: (id) => api.get(`/orders/${id}`),
};

export const wasteAPI = {
  createRequest: (data) => api.post("/waste/requests", data),
  getRequests: () => api.get("/waste/requests"),
  trackRequest: (id) => api.get(`/waste/requests/${id}`),
};

export const courseAPI = {
  getAll: () => api.get("/sanskrit/courses"),
  getById: (id) => api.get(`/sanskrit/courses/${id}`),
  enroll: (courseId) => api.post(`/sanskrit/courses/${courseId}/enroll`),
};

export const chatbotAPI = {
  sendMessage: (message) => api.post("/chatbot/query", { message }),
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
