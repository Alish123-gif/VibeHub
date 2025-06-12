import React, { memo } from 'react';

interface UserAvatarProps {
    user: any;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = memo(({ 
    user, 
    size = 'sm',
    className = ""
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    return (
        <img
            src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt={user.name}
            className={`${sizeClasses[size]} rounded-full ${className}`}
        /> 
    );
});

export default UserAvatar;
