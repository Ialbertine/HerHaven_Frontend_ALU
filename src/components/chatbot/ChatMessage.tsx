import React from "react";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage as ChatMessageType } from "./types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isTyping = message.isTyping;

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-3 sm:mb-4`}
    >
      <div
        className={`flex max-w-[85%] sm:max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        } items-start gap-1.5 sm:gap-2`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-[#9c27b0] text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {isUser ? (
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          ) : (
            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </div>

        {/* Message Content */}
        <div
          className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg ${
            isUser ? "bg-[#9c27b0] text-white" : "bg-gray-100 text-gray-800"
          }`}
        >
          {isTyping ? (
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 ml-2">
                Haven AI is typing...
              </span>
            </div>
          ) : (
            <div className="text-xs sm:text-sm prose prose-sm max-w-none">
              {isUser ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <ReactMarkdown
                  className="markdown-content"
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0 text-xs sm:text-sm">
                        {children}
                      </p>
                    ),
                    em: ({ children }) => <span>{children}</span>,
                    strong: ({ children }) => (
                      <strong className="font-semibold">{children}</strong>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-2 space-y-1">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => <li className="ml-2">{children}</li>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          )}

          {/* Timestamp */}
          {!isTyping && (
            <div
              className={`text-[10px] sm:text-xs mt-1 ${
                isUser ? "text-purple-100" : "text-gray-500"
              }`}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
