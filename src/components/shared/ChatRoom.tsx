import React, { useEffect, useRef, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { chatValidationSchema } from '@/lib/validation';
import { toast } from '../ui/use-toast';
import { useParams } from 'react-router-dom';
import { useCreateChatMessage, useGetChatMessages, useLikeMessage } from '@/lib/react-query/queriesAndMutations';
import Loader from './Loader';
import { timeAgo } from '@/lib/utils';
import { useUserContext } from '@/context/AuthContext';
import { subscribeToMessages, subscribeToUpdate } from '@/lib/appwrite/Config';

const ChatRoom = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useUserContext();
    const { mutate: sendMessage, isPending: isSending } = useCreateChatMessage();
    const { mutate: likeMessage } = useLikeMessage();

    const [messages, setMessages] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    if (!id) return null;

    const { data: chat, isPending } = useGetChatMessages(id);
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
        });
        form.reset();
    }
    function onLike(messageId: string, like: boolean) {
        likeMessage({ messageId, like });
    }
    useEffect(() => {
        if (user) {
            const handleMessageReceived = (message: any) => {
                setMessages(prevMessages => [...prevMessages, message]);
            };
            const handleLikeUpdate = (like: any) => {
                console.log(like);
                setMessages(prevMessages => {
                    // Find the index of the message being updated
                    const index = prevMessages.findIndex(m => m.$id === like.id);
                    console.log(messages);

                    if (index !== -1) {
                        // Update the existing message
                        const updatedMessages = [...prevMessages];
                        updatedMessages[index].likes = like.likes;
                        return updatedMessages;
                    }
                    return prevMessages;
                });
            };


            const subscription = subscribeToUpdate(user, handleMessageReceived);
            const sub = subscribeToMessages(user, handleLikeUpdate);

            return () => {
                subscription(); // Clean up the subscription on unmount
                sub();
            };
        }
    }, [user]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]); // Scroll to the last message when messages change

    useEffect(() => {
        if (chat) {
            setMessages(chat.documents);
        }
    }, [chat]);

    return (
        <div className='flex flex-col sm:h-screen h-[74vh] w-full'>
            <div className='flex-1 overflow-y-auto p-4 self-start w-full'>
                {isPending ? <Loader /> : (
                    <>
                        {messages.map(message => (
                            <div key={message.$id} className={`flex ${message.sender.$id === user.id ? 'justify-end' : 'justify-start'} gap-2 mb-2`}>
                                {message.sender.$id === user.id && (
                                    <img
                                        src={`/assets/icons/like${message.likes ? 'd' : ''}.svg`}
                                        alt="like"
                                        width={20}
                                        height={20}
                                        onClick={() => onLike(message.$id, !message.likes)}
                                        className="cursor-pointer"
                                    />
                                )}
                                <div className='bg-dark-4 p-2 rounded-lg'>
                                    <p className={`base-medium text-primary-500`}>{message.sender.name}</p>
                                    <p className='text-white p-4 py-2'>{message.content}</p>
                                    <p className={`${message.sender.$id === user.id ? 'text-left' : 'text-right'}  small-medium`}>{timeAgo(message.$createdAt)}</p>
                                </div>
                                {message.sender.$id !== user.id && (
                                    <img
                                        src={`/assets/icons/like${message.likes ? 'd' : ''}.svg`}
                                        alt="like"
                                        width={20}
                                        height={20}
                                        onClick={() => onLike(message.$id, !message.likes)}
                                        className="cursor-pointer"
                                    />
                                )}
                            </div>


                        ))}
                        <div ref={messagesEndRef} /> {/* This div is used to scroll to the bottom */}
                    </>
                )}
            </div>

            {/* Input container */}
            <div className='p-4'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex items-center w-full'>
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem className='flex-1'>
                                    <FormControl>
                                        <div className='flex items-center w-full'>
                                            <Input className='shad-input' placeholder="your message" {...field} />
                                            <Button
                                                type="submit"
                                                className='absolute right-4 text-black'
                                            >
                                                {!isSending ? <img src="/assets/icons/right-arrow.svg" width={24} height={24} alt="" /> : <Loader />}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </div>
        </div >
    );
};

export default ChatRoom;
