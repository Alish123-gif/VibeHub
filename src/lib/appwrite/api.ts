import { IMessage, INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { ID, Models, Query } from "appwrite";
import client, { avatars, account, databases, appwriteConfig, storage, messaging } from "./Config";
import { Lasso } from "lucide-react";




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
    } catch (error) {
        // Check if the error is a rate limit exception
        if (error.message.includes('Rate limit')) {
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

        // Get file url
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
        console.log(error);
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
        console.log(error);
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
export function getFilePreview(fileId: string) {
    try {
        const fileUrl = storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            "top",
            100
        );

        if (!fileUrl) throw Error;

        return fileUrl;
    } catch (error) {
        console.log(error);
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
        console.log(error);
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
    const hasFileToIpdate = post.file.length > 0;

    try {
        // Upload file to appwrite storage
        let image = {
            imageUrl: post.imageUrl,
            imageId: post.imageId,
        }
        if (hasFileToIpdate) {
            const uploadedFile = await uploadFile(post.file[0]);
            if (!uploadedFile) throw Error;

            const fileUrl = getFilePreview(uploadedFile.$id);
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw Error;
            }
            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id }
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
            await deleteFile(post.imageId);
            throw Error;
        }

        return updatedPost;
    } catch (error) {
        console.log(error);
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

            // Get new file url
            const fileUrl = getFilePreview(uploadedFile.$id);
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw Error;
            }

            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
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
export async function getChatMessages(chatid: string) {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.messagesCollectionId,
            [Query.equal("chat_id", chatid), Query.orderDesc("$createdAt")]
        );

        // Reverse the array of documents
        const reversedDocuments = response.documents.reverse();

        return reversedDocuments;
    } catch (error) {
        console.error(error);
        throw error; // Optionally rethrow the error if you want to handle it further up
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
            }
        );
        const chat = await databases.updateDocument(
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
        )
        return response;
    } catch (error) {
        console.error(error);
    }
}
export async function createChat(chat: { name: string; members: string[] }) {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.chatCollectionId,
            ID.unique(),
            {
                name: chat.name,
                user_id: chat.members,
            }
        );
        return response;
    } catch (error) {
        console.error(error);
    }
}
export async function likeMessage(messageId: string, like: boolean) {
    try {
        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.messagesCollectionId,
            messageId,
            {
                likes: like,
            }
        );
        return response;
    } catch (error) {
        console.error(error);
    }
}