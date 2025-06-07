import { useRef, useEffect } from 'react';

export const useScrollToBottom = (dependencies: any[], shouldScroll?: boolean) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior });
        }
    };

    useEffect(() => {
        if (shouldScroll !== false) { // Only skip scrolling if explicitly set to false
            scrollToBottom();
        }
    }, dependencies);

    return { messagesEndRef, scrollToBottom };
};
