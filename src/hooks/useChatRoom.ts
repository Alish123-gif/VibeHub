import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useUserContext } from '@/context/AuthContext';
import { 
    useCreateChatMessage, 
    useLikeMessage, 
    useMarkChatMessagesAsRead 
} from '@/lib/react-query/queriesAndMutations';
import { getChatMessages } from '@/lib/appwrite/api';
import { subscribeToMessages, subscribeToUpdate } from '@/lib/appwrite/Config';
import { toast } from '@/components/ui/use-toast';

export const useChatRoom = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useUserContext();
      // API hooks
    const { mutate: sendMessage, isPending: isSending, reset: resetSendMessage } = useCreateChatMessage();
    const { mutate: likeMessage } = useLikeMessage();
    const { mutate: markAsRead } = useMarkChatMessagesAsRead();
      // State
    const [messages, setMessages] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [pendingMessages, setPendingMessages] = useState<any[]>([]);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<any>(null);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

    // Message handlers
    const handleLike = (messageId: string, like: boolean) => {
        if (!user?.id) return;
        
        likeMessage({ messageId, like }, {
            onError: () => {
                toast({
                    title: "Error",
                    description: "Failed to update message. Please try again.",
                    variant: "destructive"
                });
            }
        });
    };

    const handleSendMessage = (content: string) => {
        if (!id || !content || !user) return;

        // Create optimistic message
        const optimisticMessage = {
            $id: `temp-${Date.now()}`,
            content,
            sender: user,
            $createdAt: new Date().toISOString(),
            likes: false,
            isPending: true
        };

        // Add to pending messages
        setPendingMessages(prev => [...prev, optimisticMessage]);
        setShouldScrollToBottom(true);
        sendMessage({
            chatid: id,
            sender: user,
            content
        }, {
            onError: () => {
                // Remove failed message from pending
                setPendingMessages(prev => prev.filter(msg => msg.$id !== optimisticMessage.$id));
                
                toast({
                    title: "Error",
                    description: "Failed to send message. Please try again.",
                    variant: "destructive"
                });
            }
        });
    };    // Load initial messages and handle pagination
    const loadMessages = useCallback(async (pageNum: number) => {
        if (!id) return;
        
        setIsPending(true);
        setError(null);
        
        try {
            const result = await getChatMessages(id, 20, pageNum * 20);
              if (pageNum === 0) {
                // Initial load - set the most recent messages
                setMessages(result.documents);
                setHasMoreMessages(result.documents.length === 20);
                setShouldScrollToBottom(true);
            } else {
                // Load more older messages - prepend them
                setMessages(prev => [...result.documents, ...prev]);
                setHasMoreMessages(result.documents.length === 20);
                setShouldScrollToBottom(false);
            }
        } catch (err) {
            setError(err);
            toast({
                title: "Error",
                description: "Failed to load messages. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsPending(false);
        }
    }, [id]);

    // Load more messages
    const loadMoreMessages = useCallback(() => {
        if (!hasMoreMessages || isPending) return;
        const nextPage = page + 1;
        setPage(nextPage);
        loadMessages(nextPage);
    }, [hasMoreMessages, isPending, page, loadMessages]);
    useEffect(() => {
        if (user && id) {
            const handleMessageReceived = (message: any) => {
                setMessages(prevMessages => {
                    // Check if message already exists to prevent duplicates
                    const messageExists = prevMessages.some(m => m.$id === message.$id);
                    if (messageExists) {
                        return prevMessages;
                    }
                    // Add new message to the end (most recent)
                    return [...prevMessages, message];
                });                // Check if this message was in our pending list and remove it
                setPendingMessages(prev => {
                    // For our own messages, clear pending messages
                    if (message.sender.$id === user.id) {
                        resetSendMessage();
                        
                        // Remove the pending message that matches this content
                        return prev.filter(pendingMsg => 
                            pendingMsg.content !== message.content
                        );
                    }
                    
                    return prev;
                });
                
                // Only mark as read if it's not our own message
                if (message.sender.$id !== user.id) {
                    markAsRead({ chatId: id, userId: user.id });
                }
                
                // Scroll to bottom for new incoming messages
                setShouldScrollToBottom(true);
            };
            
            const handleLikeUpdate = (like: any) => {
                setMessages(prevMessages => {
                    const index = prevMessages.findIndex((m: any) => m.$id === like.$id);
                    if (index !== -1) {
                        const updatedMessages = [...prevMessages];
                        updatedMessages[index].likes = like.likes;
                        return updatedMessages;
                    }
                    return prevMessages;
                });
            };

            const subscription = subscribeToUpdate(user, id, handleMessageReceived);
            const sub = subscribeToMessages(user, handleLikeUpdate);

            // Mark messages as read when entering chat (only once)
            markAsRead({ chatId: id, userId: user.id });

            return () => {
                subscription();
                sub();
            };        }
    }, [user, id]);

    // Handle chat data loading
    useEffect(() => {
        if (id) {
            // Load initial messages when chat ID changes
            loadMessages(0);
        }
    }, [id, loadMessages]);

    // Reset pagination when chat changes
    useEffect(() => {
        if (id) {
            setPage(0);
            setMessages([]);
            setPendingMessages([]);
            setHasMoreMessages(true);
        }
    }, [id]);    return {
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
    };
};
