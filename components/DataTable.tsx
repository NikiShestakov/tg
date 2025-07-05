
import React from 'react';
import { UserProfile, MediaItem } from '../types';
import { EditIcon, DeleteIcon, PhotoIcon, VideoIcon, NoMediaIcon, NoteIcon, SortIcon, SortUpIcon, SortDownIcon } from './icons';

type SortableHeaderProps = {
  columnKey: keyof UserProfile;
  title: string;
  onSort: (key: keyof UserProfile) => void;
  sortConfig: { key: keyof UserProfile; direction: 'ascending' | 'descending' } | null;
  className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ columnKey, title, onSort, sortConfig, className }) => {
  const isSorted = sortConfig?.key === columnKey;
  const direction = sortConfig?.direction;

  const getSortIcon = () => {
    if (!isSorted) return <SortIcon />;
    if (direction === 'ascending') return <SortUpIcon />;
    return <SortDownIcon />;
  };

  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-[#334155] ${className}`} onClick={() => onSort(columnKey)}>
      <div className="flex items-center">
        <span>{title}</span>
        <span className="ml-1.5">{getSortIcon()}</span>
      </div>
    </th>
  )
};


interface DataTableProps {
  profiles: UserProfile[];
  onEdit: (profile: UserProfile) => void;
  onDelete: (id: number) => void;
  onSort: (key: keyof UserProfile) => void;
  sortConfig: { key: keyof UserProfile; direction: 'ascending' | 'descending' } | null;
  onMediaView: (items: MediaItem[], startIndex: number) => void;
  isSearching: boolean;
}

const DataTableRow: React.FC<{ profile: UserProfile; onEdit: (profile: UserProfile) => void; onDelete: (id: number) => void; onMediaView: (items: MediaItem[], startIndex: number) => void; }> = ({ profile, onEdit, onDelete, onMediaView }) => {
  
  const photoCount = profile.photoUrl?.length || 0;
  const videoCount = profile.videoUrl?.length || 0;
  const allMedia: MediaItem[] = [
      ...(profile.photoUrl || []).map(url => ({ url, type: 'photo' as const })),
      ...(profile.videoUrl || []).map(url => ({ url, type: 'video' as const }))
  ];

  const handleMediaClick = (type: 'photo' | 'video') => {
      if (allMedia.length === 0) return;
      const startIndex = type === 'photo' ? 0 : photoCount;
      if (startIndex >= allMedia.length) return; // No media of this type
      onMediaView(allMedia, startIndex);
  }
  
  return (
    <tr className="bg-[#17212b] hover:bg-[#242f3d] transition-colors duration-200">
      <td className="px-4 py-3 text-sm text-gray-300 border-b border-[#242f3d] whitespace-nowrap">{new Date(profile.date).toLocaleString()}</td>
      <td className="px-4 py-3 text-sm text-gray-200 font-medium border-b border-[#242f3d]">@{profile.username}</td>
      <td className="px-4 py-3 border-b border-[#242f3d] text-center">
        {photoCount > 0 ? (
          <button onClick={() => handleMediaClick('photo')} className="flex items-center justify-center w-full space-x-1">
            <PhotoIcon isClickable={true} />
            <span className="text-xs text-gray-400">({photoCount})</span>
          </button>
        ) : <NoMediaIcon />}
      </td>
      <td className="px-4 py-3 border-b border-[#242f3d] text-center">
        {videoCount > 0 ? (
           <button onClick={() => handleMediaClick('video')} className="flex items-center justify-center w-full space-x-1">
            <VideoIcon isClickable={true} />
            <span className="text-xs text-gray-400">({videoCount})</span>
          </button>
        ) : <NoMediaIcon />}
      </td>
      <td className="px-4 py-3 text-sm text-gray-300 border-b border-[#242f3d]">{profile.name || '—'}</td>
      <td className="px-4 py-3 text-sm text-gray-300 border-b border-[#242f3d]">{profile.age || '—'}</td>
      <td className="px-4 py-3 text-sm text-gray-300 border-b border-[#242f3d]">{profile.height || '—'}</td>
      <td className="px-4 py-3 text-sm text-gray-300 border-b border-[#242f3d]">{profile.weight || '—'}</td>
      <td className="px-4 py-3 text-sm text-gray-300 border-b border-[#242f3d]">{profile.measurements || '—'}</td>
      <td className="px-4 py-3 text-sm text-gray-400 border-b border-[#242f3d] max-w-xs truncate" title={profile.about || ''}>{profile.about || '—'}</td>
      <td className="px-4 py-3 text-sm text-gray-400 border-b border-[#242f3d] max-w-xs truncate" title={profile.adminNotes || ''}>{profile.adminNotes || '—'}</td>
      <td className="px-4 py-3 text-sm border-b border-[#242f3d]">
        <div className="flex items-center space-x-3">
          <button onClick={() => onEdit(profile)} className="text-blue-400 hover:text-blue-300" title="Редактировать"><EditIcon /></button>
          <button onClick={() => onDelete(profile.id)} className="text-red-500 hover:text-red-400" title="Удалить"><DeleteIcon /></button>
        </div>
      </td>
    </tr>
  );
};


export const DataTable: React.FC<DataTableProps> = ({ profiles, onEdit, onDelete, onSort, sortConfig, onMediaView, isSearching }) => {
  return (
    <div className="bg-[#0e1621] rounded-lg shadow-inner overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[#242f3d]">
            <tr>
              <SortableHeader columnKey="date" title="Дата" onSort={onSort} sortConfig={sortConfig} />
              <SortableHeader columnKey="username" title="Пользователь" onSort={onSort} sortConfig={sortConfig} />
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Фото</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Видео</th>
              <SortableHeader columnKey="name" title="Имя" onSort={onSort} sortConfig={sortConfig} />
              <SortableHeader columnKey="age" title="Возраст" onSort={onSort} sortConfig={sortConfig} />
              <SortableHeader columnKey="height" title="Рост" onSort={onSort} sortConfig={sortConfig} />
              <SortableHeader columnKey="weight" title="Вес" onSort={onSort} sortConfig={sortConfig} />
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Параметры</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">О себе</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Заметки</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length > 0 ? (
              profiles.map(profile => (
                <DataTableRow key={profile.id} profile={profile} onEdit={onEdit} onDelete={onDelete} onMediaView={onMediaView} />
              ))
            ) : (
              <tr>
                <td colSpan={12} className="text-center py-10 text-gray-500">
                  {isSearching
                    ? "Анкеты не найдены. Попробуйте изменить поисковый запрос."
                    : "Анкеты пока отсутствуют. Они появятся здесь после добавления ботом."
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};