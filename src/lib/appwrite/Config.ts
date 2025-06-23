import { IUser } from '@/types';
import { Client, Account, Databases, Storage, Avatars, Messaging } from 'appwrite'

export const appwriteConfig = {
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    url: import.meta.env.VITE_APPWRITE_URL,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID,
    userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
    savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
    postCollectionId: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
    commentCollectionId: import.meta.env.VITE_APPWRITE_COMMENT_COLLECTION_ID,
    followCollectionId: import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID,
    chatCollectionId: import.meta.env.VITE_APPWRITE_CHAT_COLLECTION_ID,
    messagesCollectionId: import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID,
}

const client = new Client();

client.setProject(appwriteConfig.projectId)
client.setEndpoint(appwriteConfig.url)


export const subscribeToUpdate = (user: IUser, chat_id: string, onMessageReceived: (message: any) => void) => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 1000; // Start with 1 second
    
    const createSubscription = () => {
        try {
            const subscription = client.subscribe(`databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.chatCollectionId}.documents`, response => {
                try {
                    if (user && chat_id === (response.payload as { $id: string }).$id) {
                        const message = {
                            $id: (response.payload as { last_message_id: string }).last_message_id,
                            content: (response.payload as { last_message: string }).last_message,
                            sender: {
                                name: (response.payload as { last_sender_name: string }).last_sender_name,
                                $id: (response.payload as { last_sender_id: string }).last_sender_id
                            },
                            $createdAt: (response.payload as { last_message_time: string }).last_message_time,
                        };
                        onMessageReceived(message);
                        reconnectAttempts = 0; // Reset on successful message
                    }
                } catch (error) {
                    console.error('Error processing subscription message:', error);
                }
            });
            
            return subscription;
        } catch (error) {
            console.error('Error creating subscription:', error);
            
            // Attempt to reconnect with exponential backoff
            if (reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                const delay = reconnectDelay * Math.pow(2, reconnectAttempts - 1);
                
                console.log(`Attempting to reconnect subscription in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
                
                setTimeout(() => {
                    return createSubscription();
                }, delay);
            } else {
                console.error('Max reconnection attempts reached for subscription');
            }
            
            return () => {}; // Return empty cleanup function
        }
    };
    
    return createSubscription();
};
export const subscribeToMessages = (user: IUser, handleLikeUpdate: (message: any) => void) => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 1000; // Start with 1 second
    
    const createSubscription = () => {
        try {
            const subscription = client.subscribe(`databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.messagesCollectionId}.documents`, response => {
                try {
                    if (user) {
                        const updatedMessage = {
                            $id: (response.payload as { $id: string }).$id,
                            likes: (response.payload as { likes: boolean }).likes
                        };
                        handleLikeUpdate(updatedMessage);
                        reconnectAttempts = 0; // Reset on successful message
                    }
                } catch (error) {
                    console.error('Error processing like subscription message:', error);
                }
            });
            
            return subscription;
        } catch (error) {
            console.error('Error creating like subscription:', error);
            
            // Attempt to reconnect with exponential backoff
            if (reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                const delay = reconnectDelay * Math.pow(2, reconnectAttempts - 1);
                
                console.log(`Attempting to reconnect like subscription in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
                
                setTimeout(() => {
                    return createSubscription();
                }, delay);
            } else {
                console.error('Max reconnection attempts reached for like subscription');
            }
            
            return () => {}; // Return empty cleanup function
        }
    };
    
    return createSubscription();
}


export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export const messaging = new Messaging(client);

export default client