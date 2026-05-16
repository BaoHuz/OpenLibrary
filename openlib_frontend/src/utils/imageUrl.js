export const getImageUrl = (path) => {
  if (!path) return null;
  if (typeof path !== 'string') return null;
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
  
  // Backend host - adjust if necessary
  const BACKEND_URL = 'http://127.0.0.1:8000';
  
  // Ensure path starts with / if it doesn't
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${BACKEND_URL}${normalizedPath}`;
};
