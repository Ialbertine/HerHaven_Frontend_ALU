import React, { useState, useEffect, type ReactNode } from "react";
import { TextSizeContext } from "@/hooks/useTextSize";

export type TextSize = "small" | "medium" | "large" | "extra-large";

export interface TextSizeContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
}

const TEXT_SIZE_STORAGE_KEY = "herhaven-text-size";

export const TextSizeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    const saved = localStorage.getItem(TEXT_SIZE_STORAGE_KEY);
    if (saved && ["small", "medium", "large", "extra-large"].includes(saved)) {
      return saved as TextSize;
    }
    return "medium";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("text-size-small", "text-size-medium", "text-size-large", "text-size-extra-large");
    root.classList.add(`text-size-${textSize}`);
    
    localStorage.setItem(TEXT_SIZE_STORAGE_KEY, textSize);
  }, [textSize]);

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
  };

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize }}>
      {children}
    </TextSizeContext.Provider>
  );
};

