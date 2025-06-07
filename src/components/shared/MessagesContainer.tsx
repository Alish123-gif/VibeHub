import React from 'react';
import MessageList from './MessageList';
import { useScrollHandler } from '@/hooks/useScrollHandler';

interface MessagesContainerProps {
    messages: any[];
    pendingMessages: any[];
    currentUserId: string;
    isPending: boolean;
    page: number;
    hasMoreMessages: boolean;
    onLike: (messageId: string, like: boolean) => void;
    onLoadMore: () => void;
    messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessagesContainer: React.FC<MessagesContainerProps> = ({
    messages,
    pendingMessages,
    currentUserId,
    isPending,
    page,
    hasMoreMessages,
    onLike,
    onLoadMore,
    messagesEndRef
}) => {
    const { messagesContainerRef, handleScroll } = useScrollHandler(
        hasMoreMessages,
        isPending,
        onLoadMore
    );

    return (
        <div 
            ref={messagesContainerRef}
            className='flex-1 overflow-y-auto p-4 self-start w-full'
            onScroll={handleScroll}
        >
            <MessageList
                messages={messages}
                pendingMessages={pendingMessages}
                currentUserId={currentUserId}
                isPending={isPending}
                page={page}
                hasMoreMessages={hasMoreMessages}
                onLike={onLike}
                messagesEndRef={messagesEndRef}
            />
        </div>
    );
};

export default MessagesContainer;
