import React from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Wifi, WifiOff } from 'lucide-react';

const ConnectionStatus: React.FC = () => {
    const { isOnline } = useConnectionStatus();

    if (isOnline) return null; // Don't show anything when online

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">No internet connection</span>
        </div>
    );
};

export default ConnectionStatus;
