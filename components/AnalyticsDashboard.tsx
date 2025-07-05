
import React from 'react';
import { AnalyticsData } from '../types';
import { UsersIcon, ChartBarIcon, CameraIcon, VideoCameraIcon } from './icons';

interface AnalyticsDashboardProps {
  data: AnalyticsData | null;
  isLoading: boolean;
}

const AnalyticsCard: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string; }> = ({ icon, title, value, color }) => (
    <div className={`bg-[#17212b] p-5 rounded-lg shadow-lg flex items-center space-x-4 border-l-4 ${color}`}>
        {icon}
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const BarChart: React.FC<{ data: { date: string; count: number }[] }> = ({ data }) => {
    const maxCount = Math.max(...data.map(d => d.count), 0);
    const today = new Date();
    const dayLabels = [...Array(7)].map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        return { 
            full: d.toISOString().split('T')[0], 
            short: d.toLocaleDateString('ru-RU', { weekday: 'short' })
        };
    }).reverse();

    const chartData = dayLabels.map(label => {
        const dayData = data.find(d => d.date === label.full);
        return { label: label.short, count: dayData ? dayData.count : 0 };
    });

    return (
        <div className="bg-[#17212b] p-5 rounded-lg shadow-lg col-span-1 md:col-span-2 lg:col-span-4">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Анкет за неделю</h3>
            <div className="flex justify-around items-end h-48 space-x-2">
                {chartData.map(({ label, count }) => (
                    <div key={label} className="flex flex-col items-center flex-1">
                         <div className="text-white text-sm font-medium">{count}</div>
                        <div
                            className="w-full bg-blue-500 hover:bg-blue-400 rounded-t-md transition-all duration-300"
                            style={{ height: maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%' }}
                            title={`${count} анкет`}
                        ></div>
                        <div className="text-xs text-gray-400 mt-2">{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-[#17212b] rounded-lg"></div>)}
                <div className="h-64 bg-[#17212b] rounded-lg col-span-1 md:col-span-2 lg:col-span-4"></div>
            </div>
        );
    }

    if (!data) {
        return null; // Don't show anything if there's an error or no data
    }

    const photoPercentage = data.totalProfiles > 0 ? ((data.profilesWithPhoto / data.totalProfiles) * 100).toFixed(0) : '0';
    const videoPercentage = data.totalProfiles > 0 ? ((data.profilesWithVideo / data.totalProfiles) * 100).toFixed(0) : '0';
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticsCard 
                icon={<UsersIcon />}
                title="Всего анкет"
                value={data.totalProfiles.toString()}
                color="border-blue-500"
            />
             <AnalyticsCard 
                icon={<ChartBarIcon />}
                title="Средний возраст"
                value={data.avgAge ? data.avgAge.toFixed(1) : '—'}
                color="border-green-500"
            />
            <AnalyticsCard 
                icon={<CameraIcon />}
                title="Анкеты с фото"
                value={`${photoPercentage}%`}
                color="border-indigo-500"
            />
            <AnalyticsCard 
                icon={<VideoCameraIcon />}
                title="Анкеты с видео"
                value={`${videoPercentage}%`}
                color="border-rose-500"
            />
            <BarChart data={data.dailyCounts} />
        </div>
    );
};