import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 20000,
});

// Attach CSRF token header for unsafe methods
api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    const csrf = sessionStorage.getItem("csrf_token");
    if (csrf) config.headers["X-CSRF-Token"] = csrf;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || err.message || "Something went wrong";
    return Promise.reject({ ...err, message });
  }
);

// Public API helpers
export const publicApi = {
  getSettings: () => api.get("/public/settings"),
  getPageContent: (key) => api.get(`/public/page-content/${key}`),
  getProducts: (params) => api.get("/public/products", { params }),
  getProduct: (slug) => api.get(`/public/products/${slug}`),
  getProductCategories: () => api.get("/public/product-categories"),
  getServices: () => api.get("/public/services"),
  getService: (slug) => api.get(`/public/services/${slug}`),
  getJobs: (params) => api.get("/public/jobs", { params }),
  getJob: (slug) => api.get(`/public/jobs/${slug}`),
  applyJob: (id, formData) =>
    api.post(`/public/jobs/${id}/apply`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  createEnquiry: (data) => api.post("/public/enquiries", data),
  getTestimonials: () => api.get("/public/testimonials"),
};

export default api;