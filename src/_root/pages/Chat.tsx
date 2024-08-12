import { useCreateChat, useGetCurrentUser } from '@/lib/react-query/queriesAndMutations';
import React from 'react';
import ChatList from '../../components/shared/ChatList';
import Loader from '@/components/shared/Loader';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';

const Chat = () => {
    const { data: currentUser } = useGetCurrentUser();
    const { mutate: createChat } = useCreateChat();
    const queryClient = useQueryClient();
    queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CHAT_MESSAGES]
    });

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
