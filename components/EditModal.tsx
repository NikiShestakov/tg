
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface EditModalProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

export const EditModal: React.FC<EditModalProps> = ({ profile, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<UserProfile, 'photoUrl' | 'videoUrl'> & { photoUrl: string, videoUrl: string }>({
      ...profile,
      photoUrl: (profile.photoUrl || []).join('\n'),
      videoUrl: (profile.videoUrl || []).join('\n'),
  });

  useEffect(() => {
    setFormData({
      ...profile,
      photoUrl: (profile.photoUrl || []).join('\n'),
      videoUrl: (profile.videoUrl || []).join('\n'),
    });
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        const isNumeric = ['age', 'height', 'weight'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumeric ? (value === '' ? null : Number(value)) : value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProfile: UserProfile = {
        ...formData,
        // Convert newline-separated strings back to arrays, filtering out empty lines
        photoUrl: formData.photoUrl.split('\n').filter(url => url.trim() !== ''),
        videoUrl: formData.videoUrl.split('\n').filter(url => url.trim() !== ''),
    };
    onSave(finalProfile);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity p-4" onClick={onClose}>
      <div className="bg-[#17212b] rounded-lg shadow-2xl p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-6">Редактировать анкету: @{profile.username}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Имя</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-[#242f3d] border border-[#334155] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#3390ec]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Возраст</label>
              <input type="number" name="age" value={formData.age || ''} onChange={handleChange} className="w-full bg-[#242f3d] border border-[#334155] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#3390ec]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Рост (см)</label>
              <input type="number" name="height" value={formData.height || ''} onChange={handleChange} className="w-full bg-[#242f3d] border border-[#334155] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#3390ec]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Вес (кг)</label>
              <input type="number" name="weight" value={formData.weight || ''} onChange={handleChange} className="w-full bg-[#242f3d] border border-[#334155] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#3390ec]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Параметры</label>
            <input type="text" name="measurements" value={formData.measurements || ''} onChange={handleChange} className="w-full bg-[#242f3d] border border-[#334155] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#3390ec]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">О себе</label>
            <textarea name="about" rows={3} value={formData.about || ''} onChange={handleChange} className="w-full bg-[#242f3d] border border-[#334155] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#3390ec]" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Заметка администратора</label>
            <textarea name="adminNotes" rows={3} value={formData.adminNotes || ''} onChange={handleChange} className="w-full bg-[#242f3d] border border-[#334155] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#3390ec]" placeholder="Эта заметка видна только администраторам"/>
          </div>
           <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Ссылки на фото (каждая с новой строки)</label>
                <textarea name="photoUrl" rows={3} value={formData.photoUrl} onChange={handleChange} className="w-full bg-[#242f3d] border border-[#334155] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#3390ec]" />
           </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Ссылки на видео (каждая с новой строки)</label>
                <textarea name="videoUrl" rows={3} value={formData.videoUrl} onChange={handleChange} className="w-full bg-[#242f3d] border border-[#334155] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#3390ec]" />
            </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-[#242f3d] text-gray-300 rounded-md hover:bg-[#334155] transition-colors">Отмена</button>
            <button type="submit" className="px-5 py-2 bg-[#3390ec] text-white font-semibold rounded-md hover:bg-[#2672c3] transition-colors">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
};