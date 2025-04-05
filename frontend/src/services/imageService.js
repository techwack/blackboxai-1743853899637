import api from './api.js';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return data.url;
};

export const deleteImage = async (url) => {
  await api.delete('/upload', { data: { url } });
};