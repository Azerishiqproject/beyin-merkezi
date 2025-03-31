'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';
import { getApiUrl } from '@/utils/api';

// API Error interface
interface ApiError {
  message?: string;
}

interface Region {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated, isAdmin, token } = useAppSelector((state) => state.auth);

  const fetchRegions = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Token:', token);
      
      if (!token) {
        throw new Error('Token bulunamadı');
      }
      
      const response = await fetch(getApiUrl('api/regions'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Bölgələri əldə edərkən xəta baş verdi');
      }

      setRegions(data.data);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Bölgələri əldə edərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
      return;
    }

    if (token) {
      fetchRegions();
    }
  }, [isAuthenticated, isAdmin, token, router, fetchRegions]);

  const handleDeleteRegion = async (regionId: string) => {
    if (!confirm('Bu bölgəni silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`api/regions/${regionId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Bölgə silinərkən xəta baş verdi');
      }

      // Refresh region list
      fetchRegions();
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Bölgə silinərkən xəta baş verdi');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Bölgələr</h1>
        <Link
          href="/admin/regions/create"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Yeni Bölgə
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ad
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Təsvir
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yaradılma Tarixi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Əməliyyatlar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {regions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Heç bir bölgə tapılmadı
                  </td>
                </tr>
              ) : (
                regions.map((region) => (
                  <tr key={region._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {region._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {region.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {region.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(region.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/regions/edit/${region._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Düzəliş et
                        </Link>
                        <button
                          onClick={() => handleDeleteRegion(region._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 