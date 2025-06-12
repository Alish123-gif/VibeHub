import { useRef } from 'react';

export const useScrollHandler = (
    hasMoreMessages: boolean,
    isPending: boolean,
    onLoadMore: () => void
) => {
    const messagesContainerRef = useRef<HTMLDivElement>(null);    const handleScroll = () => {
        if (!messagesContainerRef.current) return;
        
        const { scrollTop } = messagesContainerRef.current;
        if (scrollTop <= 10 && hasMoreMessages && !isPending) {
            onLoadMore();
        }
    };

    return { messagesContainerRef, handleScroll };
};
