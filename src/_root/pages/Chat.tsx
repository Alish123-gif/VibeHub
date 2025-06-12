import { useGetCurrentUser, useGetUserChats } from '@/lib/react-query/queriesAndMutations';
import { useState } from 'react';
import ChatList from '../../components/shared/ChatList';
import Loader from '@/components/shared/Loader';
import ChatCreateModal from '@/components/shared/ChatCreateModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Chat = () => {
    const { data: currentUser } = useGetCurrentUser();
    const { data: userChats, isLoading: isLoadingChats, error: chatsError } = useGetUserChats(currentUser?.$id || "");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    if (!currentUser) {
        return (
            <div className="flex-center w-full h-full">
                <Loader />
            </div>
        );
    }

    if (isLoadingChats) {
        return (
            <div className="flex-center w-full h-full">
                <Loader />
            </div>
        );
    }

    if (chatsError) {
        return (
            <div className="flex-center w-full h-full">
                <p className="text-light-4">Failed to load chats. Please try again.</p>
            </div>
        );
    }

    return (
        <div className='px-5'>
            <div className="flex justify-between items-center mb-5 mt-5">
                <h1 className="h2-bold text-left">Messages</h1>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600"
                >
                    <Plus className="h-4 w-4" />
                    New Chat
                </Button>
            </div>

            {userChats && userChats.length > 0 ? (
                <ChatList chats={userChats} />
            ) : (
                <div className="flex-center flex-col gap-4 py-10">
                    <img
                        src="/assets/icons/chat.svg"
                        alt="No chats"
                        className="w-16 h-16 opacity-50"
                    />
                    <p className="text-light-4 text-center">
                        No conversations yet. Start chatting with your friends!
                    </p>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-primary-500 hover:bg-primary-600"
                    >
                        Start Your First Chat
                    </Button>
                </div>
            )}

            <ChatCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}

export default Chat;
