import React from 'react';
import Loader from './Loader';

interface LoadMoreIndicatorProps {
    isLoading: boolean;
    hasMore: boolean;
    page: number;
}

const LoadMoreIndicator: React.FC<LoadMoreIndicatorProps> = ({ 
    isLoading, 
    hasMore, 
    page 
}) => {
    
    if (!hasMore || page === 0) return null;

    return (
        <div className="flex-center py-4">
            <div className="flex items-center gap-2">
                {isLoading && <Loader />}
                <span className="text-light-4 text-sm">
                    {isLoading ? "Loading messages..." : "Scroll up to load more messages"}
                </span>
            </div>
        </div>
    );
};

export default LoadMoreIndicator;
