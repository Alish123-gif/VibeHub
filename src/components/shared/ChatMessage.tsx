import React from 'react';
import LikeButton from './LikeButton';
import MessageContent from './MessageContent';
import UserAvatar from './UserAvatar';
import MessageStatus from './MessageStatus';
import { formatMessageTime } from '@/lib/utils';

interface ChatMessageProps {
    message: any;
    currentUserId: string;
    onLike: (messageId: string, like: boolean) => void;
    isFirstInGroup?: boolean;
    isLastInGroup?: boolean;
    messageStatus?: 'sent' | 'delivered' | 'read' | 'pending';
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
    message, 
    currentUserId, 
    onLike, 
    isFirstInGroup = false,
    isLastInGroup = false,
    messageStatus = 'delivered' 
}) => {
    const isOwnMessage = message.sender.$id === currentUserId;

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
            isLastInGroup ? 'mb-4' : 'mb-1'
        }`}>            {/* Avatar for other users - only show on first message in group */}
            {!isOwnMessage && (
                <div className={`flex-shrink-0 mr-2 ${isFirstInGroup ? '' : 'invisible'}`}>
                    <UserAvatar user={message.sender} size="sm" />
                </div>
            )}
            
            {/* Message bubble container */}
            <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                {/* Sender name for other users - only show on first message in group */}
                {!isOwnMessage && isFirstInGroup && (
                    <p className="text-primary-500 font-medium text-sm mb-1 ml-3">
                        {message.sender.name}
                    </p>
                )}
                
                {/* Message bubble */}
                <div className={`px-4 py-2 break-words ${
                    isOwnMessage 
                        ? `bg-primary-500 text-white ${isFirstInGroup ? 'rounded-t-xl' : 'rounded-t-md'} ${isLastInGroup ? 'rounded-bl-xl' : 'rounded-bl-md'} rounded-br-md` 
                        : `bg-dark-3 text-light-1 ${isFirstInGroup ? 'rounded-t-xl' : 'rounded-t-md'} ${isLastInGroup ? 'rounded-br-xl' : 'rounded-br-md'} rounded-bl-md`
                }`}>
                    <MessageContent message={message} />
                </div>
                
                {/* Message metadata */}
                <div className={`flex items-center gap-2 mt-1 px-2 ${
                    isOwnMessage ? 'justify-end' : 'justify-start'
                }`}>
                    <span className="text-xs text-light-4">
                        {formatMessageTime(message.$createdAt)}
                    </span>
                    {/* {isOwnMessage && (
                        <MessageStatus 
                            status={messageStatus} 
                            className="ml-1"
                        />
                    )} */}
                </div>
            </div>
            
            {/* Like button */}
            <div className={`flex-shrink-0 ${
                isOwnMessage ? 'order-1 mr-2' : 'order-2 ml-2'
            } self-end mb-6`}>
                <LikeButton
                    isLiked={message.likes}
                    onClick={() => onLike(message.$id, !message.likes)}
                    size={16}
                    className="message-like-button"
                />
            </div>
        </div>
    );
};

export default ChatMessage;
