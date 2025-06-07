import React from 'react';

interface LikeButtonProps {
    isLiked: boolean;
    onClick: () => void;
    disabled?: boolean;
    size?: number;
    className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ 
    isLiked, 
    onClick, 
    disabled = false,
    size = 16,
    className = ""
}) => {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled) {
            onClick();
        }
    };

    return (
        <div className={`flex flex-col items-center gap-1 justify-center ${className}`}>
            <img
                src={`/assets/icons/like${isLiked ? 'd' : ''}.svg`}
                alt="like"
                width={size}
                height={size}
                onClick={handleClick}
                className={`${
                    disabled 
                        ? 'cursor-not-allowed opacity-50' 
                        : 'cursor-pointer hover:scale-110 transition-all duration-200'
                }`}
                aria-label="Like message"
                aria-pressed={isLiked}
            />
        </div>
    );
};

export default LikeButton;
