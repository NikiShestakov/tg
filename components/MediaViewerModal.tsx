
import React, { useState, useEffect } from 'react';
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import { MediaItem } from '../types';

interface MediaViewerModalProps {
    mediaItems: MediaItem[];
    startIndex: number;
    onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ mediaItems, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);

    const goToPrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isFirst = currentIndex === 0;
        const newIndex = isFirst ? mediaItems.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isLast = currentIndex === mediaItems.length - 1;
        const newIndex = isLast ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goToPrevious(e as any);
            if (e.key === 'ArrowRight') goToNext(e as any);
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, mediaItems.length]);


    if (!mediaItems || mediaItems.length === 0) {
        return null;
    }
    
    const currentMedia = mediaItems[currentIndex];

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 transition-opacity"
            onClick={onClose}
        >
            {/* Main Content */}
            <div 
                className="relative bg-black rounded-lg max-w-4xl max-h-full flex items-center justify-center" 
                onClick={e => e.stopPropagation()}
            >
                {currentMedia.type === 'photo' ? (
                    <img src={currentMedia.url} alt={`User submission ${currentIndex + 1}`} className="max-w-full max-h-[90vh] object-contain rounded-lg" />
                ) : (
                    <video src={currentMedia.url} controls autoPlay className="max-w-full max-h-[90vh] object-contain rounded-lg">
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>

            {/* Controls */}
            <div className="absolute top-4 right-4 flex items-center space-x-4">
                 <span className="text-white text-lg font-mono bg-black bg-opacity-50 px-2 py-1 rounded">
                    {currentIndex + 1} / {mediaItems.length}
                </span>
                <button
                    onClick={onClose}
                    className="text-white hover:text-gray-300 z-50"
                    aria-label="Close media viewer"
                >
                    <CloseIcon />
                </button>
            </div>
           
            {mediaItems.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 z-50"
                        aria-label="Previous media"
                    >
                        <ChevronLeftIcon />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 z-50"
                        aria-label="Next media"
                    >
                        <ChevronRightIcon />
                    </button>
                </>
            )}
        </div>
    );
};