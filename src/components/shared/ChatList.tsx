import { timeAgo } from '@/lib/utils';
import { Models } from 'appwrite';
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Users } from 'lucide-react';
import { useGetUnreadCounts } from '@/lib/react-query/queriesAndMutations';
import { useUserContext } from '@/context/AuthContext';

type ChatListProps = {
    chats: Array<Models.Document>;
};

const ChatList = ({ chats }: ChatListProps) => {
    const { user } = useUserContext();
    const { data: unreadCounts } = useGetUnreadCounts(user?.id || "");
    console.log(chats);
    return (
        <div className='w-full mt-5'>
            <h2 className="h3-bold md:h2-bold text-left w-full mb-4">Chats</h2>
            {chats.length === 0 ? (
                <div className="flex-center flex-col gap-4 py-10">
                    <MessageCircle className="w-12 h-12 text-light-4" />
                    <p className="text-light-4 text-center">No chats yet</p>
                </div>
            ) : (
                <ul className="flex flex-col w-full gap-3">                    {chats.map((chat: Models.Document) => {
                        const isGroupChat = chat.user_id && chat.user_id.length > 2;
                        const hasMessages = chat.last_message && chat.last_message.trim() !== '';
                        const lastMessageTime = chat.last_message_time;
                        const unreadCount = unreadCounts?.[chat.$id] || 0;
                        
                        return (
                            <React.Fragment key={chat.$id}>
                                <Link to={`/chat/${chat.$id}`}>
                                    <li className="bg-dark-2 p-4 rounded-lg hover:bg-dark-3 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {/* Chat Avatar */}
                                            <div className="relative">
                                                {isGroupChat ? (
                                                    <div className="w-12 h-12 bg-dark-4 rounded-full flex items-center justify-center">
                                                        <Users className="w-6 h-6 text-light-3" />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                                                        <MessageCircle className="w-6 h-6 text-white" />
                                                    </div>                                                )}
                                                {unreadCount > 0 ? (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                                        <span className="text-xs text-white font-medium">
                                                            {unreadCount > 99 ? '99+' : unreadCount}
                                                        </span>
                                                    </div>
                                                ) : hasMessages && (
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full"></div>
                                                )}
                                            </div>
                                            
                                            {/* Chat Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="text-light-2 font-medium truncate">
                                                        {chat.name || 'Unnamed Chat'}
                                                    </h3>
                                                    {lastMessageTime && (
                                                        <span className="text-xs text-light-4 flex-shrink-0 ml-2">
                                                            {timeAgo(lastMessageTime)}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {hasMessages ? (
                                                    <div className="flex items-center gap-2">
                                                        {chat.last_sender_name && (
                                                            <span className="text-xs text-light-4">
                                                                {chat.last_sender_name}:
                                                            </span>
                                                        )}
                                                        <p className="text-sm text-light-3 truncate">
                                                            {chat.last_message || 'No message content'}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-light-4">
                                                        No messages yet
                                                    </p>
                                                )}
                                            </div>
                                            
                                            {/* Member Count for Group Chats */}
                                            {isGroupChat && (
                                                <div className="flex-shrink-0">
                                                    <span className="text-xs bg-dark-4 px-2 py-1 rounded-full text-light-4">
                                                        {chat.user_id.length} members
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                </Link>
                            </React.Fragment>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default ChatList;
