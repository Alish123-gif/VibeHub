import React from 'react';

interface ChatErrorProps {
    message?: string;
}

const ChatError: React.FC<ChatErrorProps> = ({ 
    message = "Failed to load messages. Please try again." 
}) => {
    return (
        <div className="flex-center w-full h-full">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 opacity-50">
                    <svg 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        className="w-full h-full text-light-4"
                    >
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <p className="text-light-4">{message}</p>
            </div>
        </div>
    );
};

export default ChatError;
