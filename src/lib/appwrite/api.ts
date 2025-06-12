import { IMessage, INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { ID, Query } from "appwrite";
import { avatars, account, databases, appwriteConfig, storage } from "./Config";




export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name,
        );

        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(user.name);

        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            imageUrl: avatarUrl,
            username: user.username,
            email: newAccount.email
        });

        return newUser;
    } catch (error) {
        console.log(error)
        return error
    }
}

export async function saveUserToDB(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;
}) {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user,
        );
        return newUser
    } catch (error) {
        console.log(error)
    }
}
export async function signInAccount(user: { email: string, password: string }) {
    try {
        const session = await account.createEmailPasswordSession(user.email, user.password);

        return session;
    } catch (error: any) {
        // Check if the error is a rate limit exception
        if (error.message && error.message.includes('Rate limit')) {
            console.error('Rate limit exceeded. Please try again later.');
            // Optionally, you can return a specific error message or object to the caller
            return { error: 'Rate limit exceeded. Please try again later.' };
        } else {
            // Log other types of errors
            console.error(error);
            // Return or throw the error
            return { error: 'An error occurred. Please try again.' };
        }
    }
}
export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();

        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )
        if (!currentUser) throw Error;

        return currentUser.documents[0]
    } catch (error) {
        console.log(error)
    }
}
export async function signOutAccount() {
    try {
        const session = await account.deleteSession("current");
        return session
    } catch (error) {
        console.log(error)
    }
}
export async function createPost(post: INewPost) {
    try {
        // Upload file to appwrite storage
        const uploadedFile = await uploadFile(post.file[0]);

        if (!uploadedFile) throw Error;

        // Get direct download url to avoid image transformation restrictions
        const fileUrl = getFilePreview(uploadedFile.$id);
        if (!fileUrl) {
            await deleteFile(uploadedFile.$id);
            throw Error;
        }

        // Convert tags into array
        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        // Create post
        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags,
            }
        );

        if (!newPost) {
            await deleteFile(uploadedFile.$id);
            throw Error;
        }

        return newPost;
    } catch (error) {
        console.log("Error creating post:", error);
        return null;
    }
}
export async function uploadFile(file: File) {
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        );

        return uploadedFile;
    } catch (error) {
        console.log("Error uploading file:", error);
        return null;
    }
}
export async function commentOnPost(postId: string, comment: string, userId: string) {
    try {
        const newComment = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.commentCollectionId,
            ID.unique(),
            {
                post: postId,
                content: comment,
                user: userId,
            }
        );

        if (!newComment) throw Error;

        return newComment;
    } catch (error) {
        console.log(error);
    }
}
export async function getComments(postId: string) {
    try {
        const comments = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.commentCollectionId,
            [Query.equal("post", postId), Query.orderDesc('$createdAt')]
        );

        if (!comments) throw Error;

        return comments;
    } catch (error) {
        console.log(error);
    }
}
export async function deleteComment(commentId: string) {
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.commentCollectionId,
            commentId
        );

        if (!statusCode) throw Error;

        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}
export function getFilePreview(fileId: string): string | null {
    try {
        // Construct the file URL manually using Appwrite REST API endpoint
        // This completely bypasses the SDK and any automatic transformations
        const baseUrl = appwriteConfig.url; // e.g., 'https://fra.cloud.appwrite.io/v1'
        const projectId = appwriteConfig.projectId;
        const storageId = appwriteConfig.storageId;
        
        // Construct direct file view URL without any transformation parameters
        const fileUrl = `${baseUrl}/storage/buckets/${storageId}/files/${fileId}/view?project=${projectId}`;
        
        console.log("Generated manual file URL:", fileUrl);
        return fileUrl;
    } catch (error) {
        console.log("Error constructing file preview URL:", error);
        return null;
    }
}
export async function getUserById(userId: string) {
    try {
        const user = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId
        );

        if (!user) throw Error;

        return user;
    } catch (error) {
        console.log(error);
    }
}
export async function deleteFile(fileId: string) {
    try {
        await storage.deleteFile(appwriteConfig.storageId, fileId);
        return { status: "ok" };
    } catch (error) {
        console.log("Error deleting file:", error);
        return { status: "error", message: error };
    }
}
export async function getRecentPosts() {

    const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [Query.orderDesc('$createdAt'), Query.limit(20)]
    )
    if (!posts) throw Error

    return posts
}
export async function likePost(postId: string, likesArray: string[]) {
    try {
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray,
            }
        );

        if (!updatedPost) throw Error;

        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}
export async function deleteSavedPost(savedRecordId: string) {
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId
        )
        if (!statusCode) throw Error;

        return { status: 'ok' }
    } catch (error) {
        console.log(error)
    }
}
export async function savePost(postId: string, userId: string) {
    try {
        const updatedPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                user: userId,
                post: postId
            }
        )
        if (!updatedPost) return Error;

        return updatedPost
    } catch (error) {
        console.log(error)
    }
}

export async function getPostById(postId: string) {
    try {
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )

        if (!post) throw Error
        return post;
    } catch (error) {
        console.log(error)
    }
}
export async function updatePost(post: IUpdatePost) {
    const hasFileToUpdate = post.file.length > 0;

    try {
        // Upload file to appwrite storage
        let image = {
            imageUrl: post.imageUrl,
            imageId: post.imageId,
        };
        
        if (hasFileToUpdate) {
            const uploadedFile = await uploadFile(post.file[0]);
            if (!uploadedFile) throw Error;            // Use direct download URL to avoid transformation limitations
            const fileUrl = getFilePreview(uploadedFile.$id);
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw Error;
            }
            image = { ...image, imageUrl: fileUrl as any, imageId: uploadedFile.$id };
        }

        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            post.postId,
            {
                caption: post.caption,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                location: post.location,
                tags: tags,
            }
        );

        if (!updatedPost) {
            if (hasFileToUpdate) {
                await deleteFile(image.imageId);
            }
            throw Error;
        }

        return updatedPost;
    } catch (error) {
        console.log("Error updating post:", error);
        return null;
    }
}
export async function deletePost(postId: string, imageId: string) {
    if (!postId || !imageId) {
        throw Error
    }
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )
        return { status: "ok" }
    } catch (error) {
        console.log(error)
    }

}
export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
    const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

    if (pageParam) {
        queries.push(Query.cursorAfter(pageParam.toString()));
    }

    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            queries
        );

        if (!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}
export async function searchPosts(searchTerm: string) {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.search("caption", searchTerm)]
        );

        if (!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}
export async function followUser(userId: string, followingId: string) {
    try {
        const newFollow = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.followCollectionId,
            ID.unique(),
            {
                follower: userId,
                followed: followingId,
            }
        );

        if (!newFollow) throw Error;

        return newFollow;
    } catch (error) {
        console.log(error);
    }
}
export async function unfollowUser(followDocId: string) {
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.followCollectionId,
            followDocId
        );

        if (!statusCode) throw Error;

        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}
export async function getUsers() {
    try {
        const users = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.orderDesc("$createdAt")]
        );

        if (!users) throw Error;

        return users;
    } catch (error) {
        console.log(error);
    }
}
export async function updateUser(user: IUpdateUser) {
    const hasFileToUpdate = user.file.length > 0;
    try {
        let image = {
            imageUrl: user.imageUrl,
            imageId: user.imageId,
        };
          if (hasFileToUpdate) {
            // Upload new file to appwrite storage
            const uploadedFile = await uploadFile(user.file[0]);
            if (!uploadedFile) throw Error;

            // Get direct download URL
            const fileUrl = getFilePreview(uploadedFile.$id);
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw Error;
            }

            image = { ...image, imageUrl: fileUrl as string, imageId: uploadedFile.$id };
        }

        //  Update user
        const updatedUser = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            user.userId,
            {
                name: user.name,
                bio: user.bio,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
            }
        );

        // Failed to update
        if (!updatedUser) {
            // Delete new file that has been recently uploaded
            if (hasFileToUpdate) {
                await deleteFile(image.imageId);
            }
            // If no new file uploaded, just throw error
            throw Error;
        }

        // Safely delete old file after successful update
        if (user.imageId && hasFileToUpdate) {
            await deleteFile(user.imageId);
        }

        return updatedUser;
    } catch (error) {
        console.log(error);
    }
}
export async function getChatMessages(chatid: string, limit: number = 20, offset: number = 0) {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.messagesCollectionId,
            [
                Query.equal("chat_id", chatid), 
                Query.orderDesc("$createdAt"), // Get newest messages first
                Query.limit(limit),
                Query.offset(offset)
            ]
        );

        return {
            documents: response.documents.reverse(), // Return in ascending order for display
            total: response.total
        };
    } catch (error) {
        console.error("Error fetching chat messages:", error);
        throw error;
    }
}
export async function createChatMessages(message: IMessage) {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.messagesCollectionId,
            ID.unique(),
            {
                chat_id: message.chatid,
                content: message.content,
                sender: message.sender.id,
                status: "sent" // Set initial status as sent
            }
        );
        
        // Update the chat with the last message info
        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.chatCollectionId,
            message.chatid,
            {
                last_message: message.content,
                last_message_time: new Date().toISOString(),
                last_sender_name: message.sender.name,
                last_sender_id: message.sender.id,
                last_message_id: response.$id,
            }
        );
        
        return response;
    } catch (error) {
        console.error("Error creating message:", error);
        throw new Error("Failed to send message. Please try again.");
    }
}

// Get user's chats
export async function getUserChats(userId: string) {
    try {
        // Since we can't query on relationship attributes, we need to fetch and filter
        // But we'll optimize by limiting the initial fetch and ordering by relevance
        const chats = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.chatCollectionId,
            [
                Query.orderDesc("last_message_time"), // Get most recent chats first
                Query.limit(200) // Increased limit but still reasonable
            ]
        );

        // Filter chats where user is a member - but do it efficiently
        const userChats = chats.documents.filter(chat => {
            if (!chat.user_id || !Array.isArray(chat.user_id)) return false;
            
            // Optimized check - use some() for early exit
            return chat.user_id.some((member: any) => {
                const memberId = typeof member === 'string' ? member : member?.$id;
                return memberId === userId;
            });
        });

        return userChats;
    } catch (error) {
        console.error("Error fetching user chats:", error);
        throw new Error("Failed to load chats. Please try again.");
    }
}

// Check if a chat already exists with the same participants
export async function checkExistingChat(members: string[]) {
    try {
        // For direct chats (2 members), check if chat exists with both users
        if (members.length === 2) {
            const chats = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.chatCollectionId,
                [
                    Query.equal("user_id", members[0]),
                    Query.equal("user_id", members[1]),
                    Query.limit(1)
                ]
            );
            
            return chats.documents.length > 0 ? chats.documents[0] : null;
        }
        
        // For group chats, we still need to check manually since Appwrite 
        // doesn't support complex array matching
        const chats = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.chatCollectionId,
            [
                Query.equal("user_id", members[0]), // At least include first member
                Query.limit(50) // Limit results for performance
            ]
        );

        if (!chats || chats.documents.length === 0) return null;

        // Sort members to ensure consistent checking regardless of order
        const sortedMembers = [...members].sort();

        // Filter to find exact match for group chats
        const existingChat = chats.documents.find(chat => {
            if (!chat.user_id || !Array.isArray(chat.user_id)) return false;
            
            // Extract IDs from chat members (handle both string IDs and user objects)
            const chatMemberIds = chat.user_id.map((member: any) => {
                if (typeof member === 'string') return member;
                if (typeof member === 'object' && member.$id) return member.$id;
                return null;
            }).filter(Boolean).sort();
            
            return chatMemberIds.length === sortedMembers.length && 
                   chatMemberIds.every((memberId, index) => memberId === sortedMembers[index]);
        });

        return existingChat || null;
    } catch (error) {
        console.error("Error checking existing chat:", error);
        return null;
    }
}

// Get user's followers and following for better chat suggestions
export async function getUserConnections(userId: string) {
    try {
        // Get followers
        const followers = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.followCollectionId,
            [Query.equal("followed", userId)]
        );

        // Get following
        const following = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.followCollectionId,
            [Query.equal("follower", userId)]
        );

        return {
            followers: followers.documents.map(doc => doc.follower),
            following: following.documents.map(doc => doc.followed)
        };
    } catch (error) {
        console.error("Error getting user connections:", error);
        return { followers: [], following: [] };
    }
}

export async function createChat(chat: { name: string; members: string[] }) {
    try {
        // Check for existing chat first (especially for direct messages)
        if (chat.members.length === 2) {
            const existingChat = await checkExistingChat(chat.members);
            if (existingChat) {
                throw new Error("Chat already exists with these participants");
            }
        }

        // Auto-generate name for direct messages if not provided
        let chatName = chat.name;
        if (chat.members.length === 2 && (!chatName || chatName === "manual")) {
            try {
                const user1 = await getUserById(chat.members[0]);
                const user2 = await getUserById(chat.members[1]);
                chatName = `${user1?.name} & ${user2?.name}`;
            } catch (error) {
                chatName = "Direct Message";
            }
        }        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.chatCollectionId,
            ID.unique(),
            {
                name: chatName,
                user_id: chat.members,
                last_message: "",
                last_message_time: new Date().toISOString(),
                last_sender_name: "",
                last_sender_id: "",
                last_message_id: "",
            }
        );
        return response;
    } catch (error) {
        console.error("Error creating chat:", error);
        throw error;
    }
}
export async function likeMessage(messageId: string, like: boolean) {
    try {
        // Since the likes field appears to be a boolean in the database schema,
        // we'll update it directly instead of using an array
        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.messagesCollectionId,
            messageId,
            {
                likes: like, // Set as boolean directly
            }
        );
        return response;
    } catch (error) {
        console.error("Error updating message like:", error);
        throw new Error("Failed to update message. Please try again.");
    }
}

export async function updateMessageStatus(_messageId: string, _status: "sent" | "delivered" | "read") {

    const message = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.messagesCollectionId,
        _messageId);

    if (!message) {
        console.error("Message not found:", _messageId);
        throw new Error("Message not found");
    }

    // Update the status field in the message document
    try{
        const updatedMessage = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.messagesCollectionId,
            _messageId,
            {
                status: _status,
            }
        )
        return updatedMessage;
    } catch (error) {
        console.error("Error updating message status:", error);
        throw new Error("Failed to update message status. Please try again.");
    }
}

// Get unread message count for a specific chat
export async function getUnreadMessageCount(chatId: string, userId: string) {
    try {
        const messages = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.messagesCollectionId,
            [
                Query.equal("chat_id", chatId),
                Query.notEqual("sender", userId),
                Query.notEqual("status", "read")
            ]
        );

        return messages.total;
    } catch (error) {
        console.error("Error getting unread message count:", error);
        return 0;
    }
}

// Get unread message counts for all user's chats
export async function getUnreadCounts(userId: string) {
    try {
        // Get all unread messages for this user in one query
        const unreadMessages = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.messagesCollectionId,
            [
                Query.notEqual("sender", userId), // Not sent by this user
                Query.notEqual("status", "read"), // Not read yet
                Query.limit(1000) // Reasonable limit
            ]
        );

        // Group by chat_id to count unread messages per chat
        const unreadCounts: { [chatId: string]: number } = {};
        
        unreadMessages.documents.forEach(message => {
            const chatId = message.chat_id;
            unreadCounts[chatId] = (unreadCounts[chatId] || 0) + 1;
        });

        return unreadCounts;
    } catch (error) {
        console.error("Error getting unread counts:", error);
        return {};
    }
}

// Mark all unread messages in a chat as read
export async function markChatMessagesAsRead(chatId: string, userId: string) {
    try {
        // Get all unread messages in the chat that were not sent by the user
        const messages = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.messagesCollectionId,
            [
                Query.equal("chat_id", chatId),
                Query.notEqual("sender", userId),
                Query.notEqual("status", "read")
            ]
        );

        if (messages.documents.length === 0) {
            return { success: true, updatedCount: 0 };
        }

        // Update each message status to "read"
        const updatePromises = messages.documents.map(async (message) => {
            return await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.messagesCollectionId,
                message.$id,
                {
                    status: "read"
                }
            );
        });
        await Promise.all(updatePromises);
        return { success: true, updatedCount: messages.documents.length };
    } catch (error) {
        console.error("Error marking chat messages as read:", error);
        throw new Error("Failed to mark messages as read. Please try again.");
    }
}