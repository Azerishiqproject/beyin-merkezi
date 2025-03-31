'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';
import { getApiUrl } from '@/utils/api';

// API Error interface
interface ApiError {
  message?: string;
}

export default function EditRegionPage() {
  // useParams hook ile id parametresini alıyoruz
  const params = useParams();
  const id = params.id as string;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();
  const { isAuthenticated, isAdmin, token } = useAppSelector((state) => state.auth);

  const fetchRegion = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl(`api/regions/${id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Bölgə məlumatları əldə edilərkən xəta baş verdi');
      }

      setName(data.data.name);
      setDescription(data.data.description || '');
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Bölgə məlumatları əldə edilərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
      return;
    }

    if (token) {
      fetchRegion();
    }
  }, [isAuthenticated, isAdmin, token, id, router, fetchRegion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(getApiUrl(`api/regions/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Bölgə yenilənərkən xəta baş verdi');
      }

      setSuccess('Bölgə uğurla yeniləndi');
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Bölgə yenilənərkən xəta baş verdi');
    } finally {
      setUpdating(false);
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
        <h1 className="text-3xl font-bold text-gray-800">Bölgə Düzəlişi</h1>
        <Link
          href="/admin/regions"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Geri
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Bölgə Adı
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              Təsvir
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={updating}
              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-orange-300"
            >
              {updating ? 'Yenilənir...' : 'Yenilə'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 