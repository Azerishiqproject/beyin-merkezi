// API URL'sini çevre değişkenlerinden alır
export const API_URL = process.env.API_URL || 'http://localhost:5001';

// API endpoint'lerini oluşturmak için yardımcı fonksiyon
export const getApiUrl = (endpoint: string): string => {
  // Endpoint zaten / ile başlıyorsa, doğrudan ekle
  if (endpoint.startsWith('/')) {
    return `${API_URL}${endpoint}`;
  }
  
  // Aksi takdirde / ekleyerek birleştir
  return `${API_URL}/${endpoint}`;
}; 