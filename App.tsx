
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { DataTable } from './components/DataTable';
import { EditModal } from './components/EditModal';
import { UserProfile, AnalyticsData, MediaItem } from './types';
import { SearchIcon } from './components/icons';
import { MediaViewerModal } from './components/MediaViewerModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

// !!! ВАЖНО ДЛЯ РАЗВЕРТЫВАНИЯ !!!
// При переносе на сервер замените 'localhost' на IP-адрес вашего сервера.
// Например: 'http://123.45.67.89:3001/api'
const API_URL = 'http://localhost:3001/api';

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof UserProfile; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });
  const [viewingMedia, setViewingMedia] = useState<{ items: MediaItem[]; startIndex: number } | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profilesRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/profiles`),
        fetch(`${API_URL}/analytics`)
      ]);
      if (!profilesRes.ok || !analyticsRes.ok) {
        throw new Error('Failed to fetch data from the server.');
      }
      const profilesData = await profilesRes.json();
      const analyticsData = await analyticsRes.json();
      setProfiles(profilesData);
      setAnalytics(analyticsData);
    } catch (err) {
      if (err instanceof Error) {
          setError(`Не удалось загрузить данные. Убедитесь, что бэкенд-сервер запущен. Ошибка: ${err.message}`);
      } else {
          setError('Произошла неизвестная ошибка.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту анкету?')) return;

    try {
        const response = await fetch(`${API_URL}/profiles/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete profile.');
        setProfiles(prev => prev.filter(p => p.id !== id));
        // Refresh analytics after deletion
        const analyticsRes = await fetch(`${API_URL}/analytics`);
        setAnalytics(await analyticsRes.json());
    } catch (err) {
        alert('Не удалось удалить анкету.');
        console.error(err);
    }
  }, []);

  const handleEdit = useCallback((profile: UserProfile) => {
    setEditingProfile(profile);
  }, []);
  
  const handleSave = useCallback(async (updatedProfile: UserProfile) => {
    try {
        const response = await fetch(`${API_URL}/profiles/${updatedProfile.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProfile),
        });
        if (!response.ok) throw new Error('Failed to save profile.');
        const savedProfile = await response.json();
        setProfiles(prev => prev.map(p => p.id === savedProfile.id ? savedProfile : p));
        setEditingProfile(null);
    } catch (err) {
        alert('Не удалось сохранить анкету.');
        console.error(err);
    }
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingProfile(null);
  }, []);

  const handleSort = useCallback((key: keyof UserProfile) => {
    setSortConfig(prevConfig => {
      const isAsc = prevConfig?.key === key && prevConfig.direction === 'ascending';
      return { key, direction: isAsc ? 'descending' : 'ascending' };
    });
  }, []);

  const handleMediaView = useCallback((items: MediaItem[], startIndex: number = 0) => {
    setViewingMedia({ items, startIndex });
  }, []);
  
  const isSearching = searchQuery.length > 0;

  const filteredAndSortedProfiles = useMemo(() => {
    let filtered = profiles.filter(p => {
        const query = searchQuery.toLowerCase();
        return (
            p.username.toLowerCase().includes(query) ||
            (p.name && p.name.toLowerCase().includes(query)) ||
            (p.about && p.about.toLowerCase().includes(query)) ||
            (p.adminNotes && p.adminNotes.toLowerCase().includes(query))
        );
    });

    if (sortConfig !== null) {
        filtered.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;
            
            if (aVal < bVal) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aVal > bVal) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }

    return filtered;
  }, [profiles, searchQuery, sortConfig]);

  return (
    <div className="min-h-screen bg-[#0e1621] text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl">
        <Header />
        <main className="mt-6 space-y-8">
          {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">{error}</div>}
          
          <AnalyticsDashboard data={analytics} isLoading={isLoading} />
          
          <div className="bg-[#17212b] p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-300">База данных анкет</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-[#242f3d] border border-[#334155] rounded-md py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3390ec]"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
              </div>
            </div>
            {isLoading && !error ? (
              <div className="text-center py-10 text-gray-500">Загрузка данных...</div>
            ) : (
              <DataTable 
                  profiles={filteredAndSortedProfiles} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                  onSort={handleSort}
                  sortConfig={sortConfig}
                  onMediaView={handleMediaView}
                  isSearching={isSearching}
              />
            )}
          </div>
        </main>
      </div>
      {editingProfile && (
        <EditModal 
          profile={editingProfile}
          onSave={handleSave}
          onClose={handleCancelEdit}
        />
      )}
      {viewingMedia && (
        <MediaViewerModal
            mediaItems={viewingMedia.items}
            startIndex={viewingMedia.startIndex}
            onClose={() => setViewingMedia(null)}
        />
      )}
    </div>
  );
};

export default App;