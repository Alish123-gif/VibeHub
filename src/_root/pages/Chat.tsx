import { useCreateChat, useGetChats, useGetCurrentUser } from '@/lib/react-query/queriesAndMutations';
import React from 'react';
import ChatList from '../../components/shared/ChatList';
import Loader from '@/components/shared/Loader';

const Chat = () => {
    const { data: currentUser } = useGetCurrentUser();
    const { mutate: createChat } = useCreateChat();

    if (!currentUser) {
        return (
            <div className="flex-center w-full h-full">
                <Loader />
            </div>
        );
    }


    return (
        <div className='w-full px-5'>
            {currentUser.chats.length > 0 ? <ChatList chats={currentUser.chats} /> : <p>No chats</p>}
            <div className='w-full mt-5'>
                <ul className="w-full mt-5">
                    <li className="bg-dark-2 p-4 rounded-lg flex justify-center gap-2 cursor-pointer">
                        <p className='text-light-3 p-2' onClick={() => createChat({ name: "manual", members: [currentUser.$id] })}>+</p>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Chat;
