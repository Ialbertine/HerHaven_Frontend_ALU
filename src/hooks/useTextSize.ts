import { createContext, useContext } from "react";
import type { TextSizeContextType } from "@/contexts/TextSizeContext";

export const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

export const useTextSize = (): TextSizeContextType => {
  const context = useContext(TextSizeContext);
  if (context === undefined) {
    throw new Error("useTextSize must be used within a TextSizeProvider");
  }
  return context;
};

