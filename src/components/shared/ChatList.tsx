import { timeAgo } from '@/lib/utils';
import { Models } from 'appwrite';
import React from 'react';
import { Link } from 'react-router-dom';

type ChatListProps = {
    chats: Models.DocumentList<Models.Document>, // Adjusted type
};

const ChatList = ({ chats }: ChatListProps) => {
    console.log(chats);
    return (
        <div className='w-full mt-5'>
            <h2 className="h3-bold md:h2-bold text-left w-full">Chats</h2>
            {chats.length === 0 ?
                <p className="text-light-4">No chats</p>
                :
                <ul className="flex flex-col w-full mt-5 gap-3">
                    {chats.map((chat) => (
                        <React.Fragment key={chat.$id}>
                            <Link to={`/chat/${chat.$id}`}>
                                <li className="bg-dark-2 p-4 rounded-lg flex flex-col gap-2">
                                    <h3 className="text-light-2 small-medium">{chat.name}</h3>
                                    {chat.messages.length > 0 ? <>
                                        <p className='text-light-3 '>{chat.last_message}</p>
                                        <p className='small-medium self-end'>last message was {timeAgo(chat.last_message_time)}</p>
                                    </> :
                                        <p className='text-light-3 '>No messages</p>}
                                </li>
                            </Link>
                        </React.Fragment>
                    ))}
                </ul>
            }
        </div>
    );
};

export default ChatList;
