import { useEffect } from 'react';
import { useChatRoom } from '@/hooks/useChatRoom';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import MessagesContainer from './MessagesContainer';
import MessageInput from './MessageInput';
import ChatError from './ChatError';

const ChatRoom = () => {
    const {
        id,
        user,
        messages,
        pendingMessages,
        page,
        hasMoreMessages,
        isPending,
        isSending,
        error,
        shouldScrollToBottom,
        setShouldScrollToBottom,
        handleLike,
        handleSendMessage,
        loadMoreMessages
    } = useChatRoom();    
    const { messagesEndRef } = useScrollToBottom(
        [messages, pendingMessages],
        shouldScrollToBottom
    );

    // Reset shouldScrollToBottom after scrolling
    useEffect(() => {
        if (shouldScrollToBottom) {
            setShouldScrollToBottom(false);
        }
    }, [shouldScrollToBottom, setShouldScrollToBottom]);

    if (!id) return null;    if (error) {
        return <ChatError />;
    }

    return (
        <div className='flex flex-col h-screen'>
            <MessagesContainer
                messages={messages}
                pendingMessages={pendingMessages}
                currentUserId={user?.id || ''}
                isPending={isPending}
                page={page}
                hasMoreMessages={hasMoreMessages}
                onLike={handleLike}
                onLoadMore={loadMoreMessages}
                messagesEndRef={messagesEndRef}
            />            <MessageInput
                onSubmit={handleSendMessage}
                isSending={isSending}
            />
        </div>
    );
};

export default ChatRoom;
