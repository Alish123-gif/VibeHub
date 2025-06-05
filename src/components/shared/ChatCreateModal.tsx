import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetUsers, useGetCurrentUser, useCreateChat } from '@/lib/react-query/queriesAndMutations';
import { Models } from 'appwrite';
import Loader from './Loader';
import { X, Search, Users, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ChatCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChatCreateModal: React.FC<ChatCreateModalProps> = ({ isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<Models.Document[]>([]);
    const [chatName, setChatName] = useState('');
    const [chatType, setChatType] = useState<'direct' | 'group'>('direct');
    const [filteredUsers, setFilteredUsers] = useState<Models.Document[]>([]);
    
    const { data: currentUser } = useGetCurrentUser();
    const { data: users, isLoading: isLoadingUsers } = useGetUsers();
    const { mutate: createChat, isPending: isCreatingChat } = useCreateChat();
    const { toast } = useToast();

    // Filter users based on search and exclude current user
    useEffect(() => {
        if (users?.documents && currentUser) {
            let filtered = users.documents.filter(user => 
                user.$id !== currentUser.$id && 
                (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 user.username.toLowerCase().includes(searchTerm.toLowerCase()))
            );

            // For direct messages, prioritize followers/following
            if (chatType === 'direct') {
                filtered = filtered.sort((a, b) => {
                    const aIsFollower = currentUser.followers?.includes(a.$id) || currentUser.following?.includes(a.$id);
                    const bIsFollower = currentUser.followers?.includes(b.$id) || currentUser.following?.includes(b.$id);
                    
                    if (aIsFollower && !bIsFollower) return -1;
                    if (!aIsFollower && bIsFollower) return 1;
                    return 0;
                });
            }

            setFilteredUsers(filtered);
        }
    }, [users, searchTerm, currentUser, chatType]);

    // Auto-generate chat name for direct messages
    useEffect(() => {
        if (chatType === 'direct' && selectedUsers.length === 1) {
            setChatName(`${currentUser?.name} & ${selectedUsers[0].name}`);
        } else if (chatType === 'group' && selectedUsers.length > 0) {
            if (!chatName) {
                const names = selectedUsers.slice(0, 2).map(user => user.name);
                setChatName(names.join(', ') + (selectedUsers.length > 2 ? ` +${selectedUsers.length - 2} others` : ''));
            }
        }
    }, [selectedUsers, chatType, currentUser]);

    const handleUserSelect = (user: Models.Document) => {
        if (chatType === 'direct') {
            setSelectedUsers([user]);
        } else {
            setSelectedUsers(prev => {
                const isSelected = prev.some(u => u.$id === user.$id);
                if (isSelected) {
                    return prev.filter(u => u.$id !== user.$id);
                } else {
                    return [...prev, user];
                }
            });
        }
    };    const handleCreateChat = async () => {
        if (selectedUsers.length === 0) {
            toast({ title: "Please select at least one user", variant: "destructive" });
            return;
        }

        if (chatType === 'group' && !chatName.trim()) {
            toast({ title: "Please enter a group name", variant: "destructive" });
            return;
        }

        const members = [currentUser!.$id, ...selectedUsers.map(user => user.$id)];
        
        createChat({
            name: chatType === 'group' && chatName ? chatName : 
                  chatType === 'direct' ? "manual" : // Let API auto-generate name for direct messages
                  `Group Chat`,
            members: members
        }, {
            onSuccess: () => {
                toast({ 
                    title: "Success!", 
                    description: "Chat created successfully!" 
                });
                onClose();
                resetForm();
            },
            onError: (error: any) => {
                const errorMessage = error?.message || "Failed to create chat. Please try again.";
                toast({ 
                    title: "Error", 
                    description: errorMessage,
                    variant: "destructive" 
                });
            }
        });
    };

    const resetForm = () => {
        setSearchTerm('');
        setSelectedUsers([]);
        setChatName('');
        setChatType('direct');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-dark-2 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-light-1">Create New Chat</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Chat Type Selection */}
                <div className="flex gap-2 mb-4">
                    <Button
                        variant={chatType === 'direct' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChatType('direct')}
                        className="flex-1"
                    >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Direct Message
                    </Button>
                    <Button
                        variant={chatType === 'group' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChatType('group')}
                        className="flex-1"
                    >
                        <Users className="h-4 w-4 mr-2" />
                        Group Chat
                    </Button>
                </div>

                {/* Group Name Input (only for group chats) */}
                {chatType === 'group' && (
                    <div className="mb-4">
                        <Input
                            placeholder="Enter group name..."
                            value={chatName}
                            onChange={(e) => setChatName(e.target.value)}
                            className="shad-input"
                        />
                    </div>
                )}

                {/* User Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-light-4" />
                    <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="shad-input pl-10"
                    />
                </div>

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm text-light-3 mb-2">Selected Users:</p>
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map(user => (
                                <div key={user.$id} className="flex items-center bg-dark-3 rounded-full px-3 py-1">
                                    <img
                                        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                                        alt={user.name}
                                        className="w-4 h-4 rounded-full mr-2"
                                    />
                                    <span className="text-sm text-light-2">{user.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleUserSelect(user)}
                                        className="ml-1 p-0 h-auto"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Users List */}
                <div className="mb-4 max-h-60 overflow-y-auto">
                    {isLoadingUsers ? (
                        <div className="flex justify-center py-4">
                            <Loader />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredUsers.length === 0 ? (
                                <p className="text-light-4 text-center py-4">No users found</p>
                            ) : (
                                filteredUsers.map(user => {
                                    const isSelected = selectedUsers.some(u => u.$id === user.$id);
                                    const isFollower = currentUser?.followers?.includes(user.$id) || currentUser?.following?.includes(user.$id);
                                    
                                    return (
                                        <div
                                            key={user.$id}
                                            onClick={() => handleUserSelect(user)}
                                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                                                isSelected 
                                                    ? 'bg-primary-500 text-white' 
                                                    : 'bg-dark-3 hover:bg-dark-4'
                                            }`}
                                        >
                                            <img
                                                src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full mr-3"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-light-3">@{user.username}</p>
                                            </div>
                                            {isFollower && (
                                                <div className="text-xs bg-primary-600 px-2 py-1 rounded">
                                                    Following
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateChat}
                        disabled={isCreatingChat || selectedUsers.length === 0}
                        className="flex-1"
                    >
                        {isCreatingChat ? <Loader /> : 'Create Chat'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatCreateModal;
