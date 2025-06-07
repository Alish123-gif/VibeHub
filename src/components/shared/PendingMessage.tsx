import React from 'react';
import LikeButton from './LikeButton';
import MessageStatus from './MessageStatus';

interface PendingMessageProps {
    message: any;
}

const PendingMessage: React.FC<PendingMessageProps> = ({ message }) => {
    return (
        <div className="flex justify-end mb-1">
            {/* Message bubble container */}
            <div className="max-w-[70%] order-2">
                {/* Message bubble */}
                <div className="px-4 py-2 break-words bg-primary-400 text-white rounded-t-xl rounded-bl-xl rounded-br-md opacity-70">
                    <p className="break-words">{message.content}</p>
                </div>
                
                {/* Message metadata */}
                <div className="flex items-center gap-2 mt-1 px-2 justify-end">
                    <span className="text-xs text-light-4">
                        Sending...
                    </span>
                    {/* <MessageStatus 
                        status="pending" 
                        className="ml-1"
                    /> */}
                </div>
            </div>
            
            {/* Like button */}
            <div className="flex-shrink-0 order-1 mr-2 self-end mb-6">
                <LikeButton
                    isLiked={false}
                    onClick={() => {}}
                    disabled={true}
                    size={16}
                    className="message-like-button opacity-50"
                />
            </div>
        </div>
    );
};

export default PendingMessage;
