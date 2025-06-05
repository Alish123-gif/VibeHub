import { useEffect, useRef, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { chatValidationSchema } from '@/lib/validation';
import { toast } from '../ui/use-toast';
import { useParams } from 'react-router-dom';
import { useCreateChatMessage, useGetChatMessages, useLikeMessage, useMarkChatMessagesAsRead } from '@/lib/react-query/queriesAndMutations';
import Loader from './Loader';
import { formatTimeFromString } from '@/lib/utils';
import { useUserContext } from '@/context/AuthContext';
import { subscribeToMessages, subscribeToUpdate } from '@/lib/appwrite/Config';

const ChatRoom = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useUserContext();
    const { mutate: sendMessage, isPending: isSending } = useCreateChatMessage();
    const { mutate: likeMessage } = useLikeMessage();
    const { mutate: markAsRead } = useMarkChatMessagesAsRead();

    const [messages, setMessages] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    if (!id) return null;
    
    const { data: chat, isPending, error } = useGetChatMessages(id, 50, page * 50);

    const form = useForm<z.infer<typeof chatValidationSchema>>({
        resolver: zodResolver(chatValidationSchema),
        defaultValues: {
            content: ""
        }
    });

    function onSubmit(data: z.infer<typeof chatValidationSchema>) {
        if (!id || !data.content || !user) return;

        sendMessage({
            chatid: id,
            sender: user,
            content: data.content
        }, {
            onSuccess: () => {
                form.reset();
                // Scroll to bottom after sending message
                setTimeout(() => {
                    if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
                    }
                }, 100);
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "Failed to send message. Please try again.",
                    variant: "destructive"
                });
            }
        });
    }    function onLike(messageId: string, like: boolean) {
        if (!user?.id) return;
        
        likeMessage({ messageId, userId: user.id, like }, {
            onError: () => {
                toast({
                    title: "Error",
                    description: "Failed to update message. Please try again.",
                    variant: "destructive"
                });
            }
        });
    }

    // Load more messages when scrolling to top
    function loadMoreMessages() {
        if (!hasMoreMessages || isPending) return;
        setPage(prev => prev + 1);
    }

    // Handle scroll to load more messages
    function handleScroll() {
        if (!messagesContainerRef.current) return;
        
        const { scrollTop } = messagesContainerRef.current;
        if (scrollTop === 0 && hasMoreMessages && !isPending) {
            loadMoreMessages();
        }
    }

    useEffect(() => {
        if (user && id) {            const handleMessageReceived = (message: any) => {
                console.log("New message received, marking chat as read");
                setMessages(prevMessages => [...prevMessages, message]);
                // Mark messages as read when viewing chat
                markAsRead({ chatId: id, userId: user.id });
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
            const sub = subscribeToMessages(user, handleLikeUpdate);            // Mark messages as read when entering chat
            console.log("Entering chat, marking messages as read");
            markAsRead({ chatId: id, userId: user.id });

            return () => {
                subscription();
                sub();
            };
        }
    }, [user, id, markAsRead]);

    useEffect(() => {
        if (messagesEndRef.current && page === 0) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, page]);

    useEffect(() => {
        if (chat) {
            if (page === 0) {
                setMessages(chat);
                setHasMoreMessages(chat.length === 50);
            } else {
                // Prepend older messages
                setMessages(prev => [...chat, ...prev]);
                setHasMoreMessages(chat.length === 50);
            }
        }
    }, [chat, page]);

    if (error) {
        return (
            <div className="flex-center w-full h-full">
                <p className="text-light-4">Failed to load messages. Please try again.</p>
            </div>
        );
    }

    return (
        <div className='flex flex-col h-screen'>
            <div 
                ref={messagesContainerRef}
                className='flex-1 overflow-y-auto p-4 self-start w-full'
                onScroll={handleScroll}
            >
                {hasMoreMessages && page > 0 && (
                    <div className="flex-center py-4">
                        <Button 
                            onClick={loadMoreMessages}
                            disabled={isPending}
                            variant="outline"
                            size="sm"
                        >
                            {isPending ? <Loader /> : "Load More Messages"}
                        </Button>
                    </div>
                )}
                
                {isPending && page === 0 ? <Loader /> : (
                    <>
                        {messages.map(message => (
                            <div key={message.$id} className={`flex ${message.sender.$id === user?.id ? 'justify-end' : 'justify-start'} gap-2 mb-4`}>
                                {message.sender.$id !== user?.id && (
                                    <img
                                        src={message.sender.imageUrl || "/assets/icons/profile-placeholder.svg"}
                                        alt={message.sender.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                )}
                                <div className={`max-w-[70%] p-3 rounded-lg ${
                                    message.sender.$id === user?.id 
                                        ? 'bg-primary-500 text-white' 
                                        : 'bg-dark-4 text-light-1'
                                }`}>
                                    {message.sender.$id !== user?.id && (
                                        <p className="text-primary-500 font-medium text-sm mb-1">
                                            {message.sender.name}
                                        </p>
                                    )}                                    <p className="break-words">{message.content}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs opacity-70">
                                            {formatTimeFromString(message.$createdAt)}
                                        </p>
                                        {/* Message status temporarily disabled until schema is updated */}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <img
                                        src={`/assets/icons/like${Array.isArray(message.likes) && message.likes.includes(user?.id) ? 'd' : ''}.svg`}
                                        alt="like"
                                        width={16}
                                        height={16}
                                        onClick={() => onLike(message.$id, !(Array.isArray(message.likes) && message.likes.includes(user?.id)))}
                                        className="cursor-pointer hover:scale-110 transition-transform"
                                    />
                                    {Array.isArray(message.likes) && message.likes.length > 0 && (
                                        <span className="text-xs text-light-3">{message.likes.length}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input container */}
            <div className='p-4 bg-dark-2 border-t border-dark-4'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex items-center gap-2'>
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem className='flex-1'>
                                    <FormControl>
                                        <Input 
                                            className='shad-input bg-dark-3 border-dark-4' 
                                            placeholder="Type your message..." 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            disabled={isSending || !form.watch('content')?.trim()}
                            className='bg-primary-500 hover:bg-primary-600 px-4'
                        >
                            {isSending ? (
                                <Loader />
                            ) : (
                                <img src="/assets/icons/right-arrow.svg" width={20} height={20} alt="Send" />
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default ChatRoom;
