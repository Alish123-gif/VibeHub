import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';

interface MessageStatusProps {
    status: 'sent' | 'delivered' | 'read' | 'pending';
    className?: string;
}

const MessageStatus: React.FC<MessageStatusProps> = ({ status, className = "" }) => {
    const getStatusIcon = () => {
        switch (status) {
            case 'pending':
                return <Clock className="w-3 h-3 text-light-4 animate-pulse" />;
            case 'sent':
                return <Check className="w-3 h-3 text-light-4" />;
            case 'delivered':
                return <CheckCheck className="w-3 h-3 text-light-4" />;
            case 'read':
                return <CheckCheck className="w-3 h-3 text-primary-500" />;
            default:
                return null;
        }
    };

    return (
        <div className={`flex items-center justify-center ${className}`} aria-label={`Message ${status}`}>
            {getStatusIcon()}
        </div>
    );
};

export default MessageStatus;
