import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { commentOnPost, createChat, createChatMessages, createPost, createUserAccount, deleteComment, deletePost, deleteSavedPost, followUser, getChatMessages, getComments, getCurrentUser, getInfinitePosts, getPostById, getRecentPosts, getUserById, getUsers, likeMessage, likePost, savePost, searchPosts, signInAccount, signOutAccount, unfollowUser, updatePost, updateUser, checkExistingChat, getUserConnections, getUserChats, updateMessageStatus, markChatMessagesAsRead, getUnreadCounts } from '../appwrite/api'
import { IMessage, INewPost, INewUser, IUpdatePost, IUpdateUser } from '@/types'
import { QUERY_KEYS } from './queryKeys'

export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user)
    })
}
export const useGetUserById = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
        queryFn: () => getUserById(userId),
        enabled: !!userId,
    });
};
export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (post: INewPost) => createPost(post),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        },
    });
};

export const useSignInAccount = () => {
    return useMutation({
        mutationFn: (user: { email: string; password: string }) => signInAccount(user)
    })
}
export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: signOutAccount
    })
}
export const useCommentOnPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (
            { postId, comment, userId }
                : { postId: string; comment: string; userId: string }
        ) => commentOnPost(postId, comment, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COMMENT]
            })
        }
    })
}
export const useGetComments = (postId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.COMMENT],
        queryFn: () => getComments(postId),
        enabled: !!postId
    })
}
export const useDeleteComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (commentId: string) => deleteComment(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COMMENT]
            })
        }
    })
}

export const useGetRecentPost = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts,
    })
}
export const useSavePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            postId,
            userId,
        }: {
            postId: string;
            userId: string;
        }) => savePost(postId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
        },
    });
};
export const useLikePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            postId,
            likesArray,
        }: {
            postId: string;
            likesArray: string[];
        }) => likePost(postId, likesArray),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
        },
    });
};
export const useDeleteSavedPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
        },
    });
};
export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: getCurrentUser,
        staleTime: 60000, // Consider data fresh for 1 minute
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    })
}

export const useGetPostById = (postId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getPostById(postId),
        enabled: !!postId
    })
}
export const useUpdatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (post: IUpdatePost) => updatePost(post),
        onSuccess(data) {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.id]
            })
        },
    })
}
export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, imageId }: { postId: string, imageId: string }) => deletePost(postId, imageId),
        onSuccess() {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        },
    })
}
export const useGetPosts = () => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
        queryFn: getInfinitePosts as any,
        getNextPageParam: (lastPage: any) => {
            if (lastPage && lastPage.documents.length === 0) {
                return null;
            }

            const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
            return lastId;
        },
        initialPageParam: null,
    });
};
export const useSearchPosts = (searchTerm: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
        queryFn: () => searchPosts(searchTerm),
        enabled: !!searchTerm,
    });
}
export const useFollowUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, followingId }: { userId: string, followingId: string }) => followUser(userId, followingId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_USER_BY_ID]
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            });
        }
    });
};

export const useUnfollowUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (followDocId: string) => unfollowUser(followDocId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_USER_BY_ID]
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            });
        }
    });
};

export const useGetUsers = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USERS],
        queryFn: () => getUsers(),
    });
};
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: IUpdateUser) => updateUser(user),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
            });
        },
    });
};
export const useGetChatMessages = (chatId: string, limit?: number, offset?: number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CHAT_MESSAGES, chatId, limit, offset],
        queryFn: () => getChatMessages(chatId, limit, offset),
        enabled: !!chatId
    });
}

export const useGetUserChats = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_CHATS, userId],
        queryFn: () => getUserChats(userId),
        enabled: !!userId,
        staleTime: 30000, // Consider data fresh for 30 seconds
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    });
}

export const useCreateChatMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (message: IMessage) => createChatMessages(message),
        onSuccess: (newMessage, variables) => {
            // Only invalidate specific chat messages instead of all
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CHAT_MESSAGES, variables.chatid]
            });            
            
            // Update the specific chat's query data if it exists
            queryClient.setQueryData(
                [QUERY_KEYS.GET_CHAT_MESSAGES, variables.chatid],
                (oldData: any) => {
                    if (oldData?.documents) {
                        return {
                            ...oldData,
                            documents: [...oldData.documents, newMessage]
                        };
                    }
                    return oldData;
                }
            );
            
            // Only invalidate user chats for the sender (more targeted)
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_USER_CHATS, variables.sender.id],
                exact: true
            });
            
            // Invalidate unread counts only for the specific user
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_UNREAD_COUNTS, variables.sender.id],
                exact: true
            });
        },
        onError: (error) => {
            console.error('Error sending message:', error);
        }
    });
}

export const useUpdateMessageStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ messageId, status }: { messageId: string, status: "sent" | "delivered" | "read" }) => 
            updateMessageStatus(messageId, status),
        onSuccess: (updatedMessage, variables) => {
            // Only invalidate specific message queries instead of all chat messages
            if (updatedMessage?.chat_id) {
                queryClient.invalidateQueries({
                    queryKey: [QUERY_KEYS.GET_CHAT_MESSAGES, updatedMessage.chat_id],
                    exact: true
                });
                
                // Update the message in cache directly if possible
                queryClient.setQueryData(
                    [QUERY_KEYS.GET_CHAT_MESSAGES, updatedMessage.chat_id],
                    (oldData: any) => {
                        if (oldData?.documents) {
                            return {
                                ...oldData,
                                documents: oldData.documents.map((msg: any) =>
                                    msg.$id === variables.messageId
                                        ? { ...msg, status: variables.status }
                                        : msg
                                )
                            };
                        }
                        return oldData;
                    }
                );
            }
            
            // Only invalidate unread counts if marking as read
            if (variables.status === 'read') {
                queryClient.invalidateQueries({
                    queryKey: [QUERY_KEYS.GET_UNREAD_COUNTS],
                    exact: true
                });
            }
        }
    });
}

export const useMarkChatMessagesAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ chatId, userId }: { chatId: string, userId: string }) => 
            markChatMessagesAsRead(chatId, userId),
        onSuccess: (result, variables) => {
            // Only invalidate specific chat messages
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CHAT_MESSAGES, variables.chatId],
                exact: true
            });
            
            // Only invalidate unread counts for specific user
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_UNREAD_COUNTS, variables.userId],
                exact: true
            });
            
            // Update message status in cache directly if we know how many were updated
            if (result?.updatedCount > 0) {
                queryClient.setQueryData(
                    [QUERY_KEYS.GET_CHAT_MESSAGES, variables.chatId],
                    (oldData: any) => {
                        if (oldData?.documents) {
                            return {
                                ...oldData,
                                documents: oldData.documents.map((msg: any) =>
                                    msg.sender.$id !== variables.userId && msg.status !== 'read'
                                        ? { ...msg, status: 'read' }
                                        : msg
                                )
                            };
                        }
                        return oldData;
                    }
                );
            }
        }
    });
};

export const useCreateChat = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (chat: { name: string, members: string[] }) => createChat(chat),
        onSuccess: () => {
            // Invalidate user chats to show new chat
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_USER_CHATS]
            });
            // Invalidate current user to update chat list
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            });
        },
        onError: (error) => {
            console.error('Error creating chat:', error);
        }
    });
}
export const useLikeMessage = () => {
    return useMutation({
        mutationFn: ({ messageId, like }: { messageId: string, like: boolean }) => 
            likeMessage(messageId, like),
    });
}
export const useCheckExistingChat = () => {
    return useMutation({
        mutationFn: (userIds: string[]) => checkExistingChat(userIds),
    });
};
export const useGetUserConnections = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_CONNECTIONS, userId],
        queryFn: () => getUserConnections(userId),
        enabled: !!userId,
    });
};
export const useGetUnreadCounts = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_UNREAD_COUNTS, userId],
        queryFn: () => getUnreadCounts(userId),
        enabled: !!userId,
        refetchInterval: 60000, // Reduce from 30s to 60s to reduce API calls
        staleTime: 30000, // Consider data fresh for 30 seconds
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    });
};