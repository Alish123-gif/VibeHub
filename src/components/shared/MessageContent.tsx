import React from 'react';

interface MessageContentProps {
    message: any;
}

const MessageContent: React.FC<MessageContentProps> = ({ message }) => {
    return (
        <p className="break-words">{message.content}</p>
    );
};

export default MessageContent;
