import axiosInstance from './axiosConfig';

export const getMarketplaceProducts = async (category, search) => {
  const response = await axiosInstance.get('/products/marketplace', { params: { category, search } });
  return response.data;
};

export const getProductDetails = async (id) => {
  const response = await axiosInstance.get(`/products/${id}/details`);
  return response.data;
};

export const getCategories = async () => {
  const response = await axiosInstance.get('/products/categories');
  return response.data;
};

export const addVendorProduct = async (vendorId, productData) => {
  const response = await axiosInstance.post('/products/add', productData, { params: { vendorId } });
  return response.data;
};

export const getVendorInventory = async (vendorId) => {
  const response = await axiosInstance.get('/products/vendor-inventory', { params: { vendorId } });
  return response.data;
};

export const updateVendorInventory = async (id, data) => {
  const response = await axiosInstance.put(`/products/vendor-inventory/${id}`, data);
  return response.data;
};

export const deleteVendorInventory = async (id) => {
  const response = await axiosInstance.delete(`/products/vendor-inventory/${id}`);
  return response.data;
};

export const compareProducts = async (ids) => {
  const response = await axiosInstance.get('/products/compare', { params: { ids: ids.join(',') } });
  return response.data;
};

export const submitRating = async (userId, vendorId, rating, review) => {
  const response = await axiosInstance.post('/ratings/submit', null, { params: { userId, vendorId, rating, review } });
  return response.data;
};
