
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#17212b] p-4 rounded-lg shadow-lg flex items-center justify-between">
      <h1 className="text-2xl font-bold text-white">Telegram Profile Parser</h1>
      <div className="w-10 h-10 bg-[#3390ec] rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 013-1.197M15 21a9 9 0 00-9-9" />
        </svg>
      </div>
    </header>
  );
};