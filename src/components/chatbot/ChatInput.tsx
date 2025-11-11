import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  placeholder = "Type your message...",
  disabled = false,
  isLoading = false,
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-1 sm:gap-2 p-2 sm:p-4 border-t border-gray-200 bg-white"
    >
      <button
        type="button"
        className="flex-shrink-0 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
        disabled={disabled}
        aria-label="Attach file"
      >
        <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Text input */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="w-full resize-none border border-gray-300 rounded-lg px-2 sm:px-3 py-1 pr-10 sm:pr-12 
            focus:outline-none focus:ring-2 focus:ring-[#9c27b0] focus:border-transparent 
            disabled:bg-gray-50 disabled:opacity-50 min-h-[1rem] max-h-16
            text-sm sm:text-base"
          rows={1}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled || isLoading}
          className="absolute right-1.5 sm:right-2 bottom-2 p-1.5 sm:p-2 bg-[#9c27b0] text-white rounded-lg 
            hover:bg-[#7b1fa2] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </form>
  );
};
