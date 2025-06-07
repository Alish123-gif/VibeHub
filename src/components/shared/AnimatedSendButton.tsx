import { useState, useEffect } from 'react';

interface AnimatedSendButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSending: boolean;
  messageContent: string;
}

const AnimatedSendButton = ({ onClick, disabled, isSending, messageContent }: AnimatedSendButtonProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [letters, setLetters] = useState<string[]>([]);

  useEffect(() => {
    if (isSending && messageContent) {
      setIsAnimating(true);
      setLetters(messageContent.split(''));
      
      // Reset animation after 2 seconds
      const timeout = setTimeout(() => {
        setIsAnimating(false);
        setLetters([]);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isSending, messageContent]);

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <button
      type="submit"
      disabled={disabled}
      onClick={handleClick}
      className={`relative bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-md transition-all duration-300 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
      }`}
    >
      {/* Bird SVG */}
      <div className={`relative transition-transform duration-500 ${isAnimating ? 'animate-bounce' : ''}`}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`text-white transition-all duration-500 ${isAnimating ? 'scale-110' : ''}`}
        >
          {/* Bird body */}
          <path
            d="M12 2C10.5 2 9.5 3 9.5 4.5C9.5 5.5 10 6.5 11 7L9 9C8.5 9.5 8 10.5 8 11.5C8 13 9 14 10.5 14H13.5C15 14 16 13 16 11.5C16 10.5 15.5 9.5 15 9L13 7C14 6.5 14.5 5.5 14.5 4.5C14.5 3 13.5 2 12 2Z"
            fill="currentColor"
            className={`transition-all duration-300 ${isAnimating ? 'animate-pulse' : ''}`}
          />
          {/* Wing */}
          <path
            d="M8 8C7 8.5 6 9.5 6 11C6 12 6.5 13 7.5 13.5C8 13.7 8.5 13.5 8.7 13C8.9 12.5 8.7 12 8.2 11.8C7.8 11.6 7.5 11.2 7.5 10.8C7.5 10.2 8 9.8 8.5 9.5"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className={`transition-all duration-300 ${isAnimating ? 'animate-ping' : ''}`}
          />
          {/* Beak */}
          <path
            d="M9.5 4.5L7 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Eye */}
          <circle
            cx="11"
            cy="4.5"
            r="0.5"
            fill="white"
          />
        </svg>
      </div>

      {/* Flying letters animation */}
      {isAnimating && letters.length > 0 && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          {letters.map((letter, index) => (
            <span
              key={index}
              className="absolute text-xs text-white font-medium animate-fly-letter"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                animationDelay: `${index * 100}ms`,
                animationDuration: '1500ms',
              }}
            >
              {letter === ' ' ? '•' : letter}
            </span>
          ))}
        </div>
      )}

      {/* Loading overlay */}
      {isSending && (
        <div className="absolute inset-0 bg-primary-600 rounded-md flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
};

export default AnimatedSendButton;
