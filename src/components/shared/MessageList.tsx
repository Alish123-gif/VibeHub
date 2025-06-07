import React from 'react';
import ChatMessage from './ChatMessage';
import PendingMessage from './PendingMessage';
import LoadMoreIndicator from './LoadMoreIndicator';
import Loader from './Loader';

interface MessageListProps {
    messages: any[];
    pendingMessages: any[];
    currentUserId: string;
    isPending: boolean;
    page: number;
    hasMoreMessages: boolean;
    onLike: (messageId: string, like: boolean) => void;
    messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({
    messages,
    pendingMessages,
    currentUserId,
    isPending,
    page,
    hasMoreMessages,
    onLike,
    messagesEndRef
}) => {
    if (isPending && page === 0) {
        return <Loader />;
    }    return (
        <>
            {/* Load more messages indicator */}
            <LoadMoreIndicator 
                isLoading={isPending}
                hasMore={hasMoreMessages}
                page={page}
            />
            
            {/* Regular messages */}
            {messages.map((message, index) => {
                const isFirstInGroup = index === 0 || messages[index - 1].sender.$id !== message.sender.$id;
                const isLastInGroup = index === messages.length - 1 || messages[index + 1].sender.$id !== message.sender.$id;
                
                return (
                    <ChatMessage
                        key={message.$id}
                        message={message}
                        currentUserId={currentUserId}
                        onLike={onLike}
                        isFirstInGroup={isFirstInGroup}
                        isLastInGroup={isLastInGroup}
                        messageStatus={message.status || 'delivered'}
                    />
                );
            })}
            
            {/* Pending messages */}
            {pendingMessages.map(message => (
                <PendingMessage
                    key={message.$id}
                    message={message}
                />
            ))}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
        </>
    );
};

export default MessageList;
