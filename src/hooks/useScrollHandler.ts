import { useRef } from 'react';

export const useScrollHandler = (
    hasMoreMessages: boolean,
    isPending: boolean,
    onLoadMore: () => void
) => {
    const messagesContainerRef = useRef<HTMLDivElement>(null);    const handleScroll = () => {
        if (!messagesContainerRef.current) return;
        
        const { scrollTop } = messagesContainerRef.current;
        // Add a small threshold (10px) to make it more reliable
        if (scrollTop <= 10 && hasMoreMessages && !isPending) {
            console.log('Loading more messages...'); // Debug log
            onLoadMore();
        }
    };

    return { messagesContainerRef, handleScroll };
};
