// src/components/ui/SafeAvatar.tsx

import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

interface SafeAvatarProps {
  src?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-20 w-20",
};

const SafeAvatar = ({ src, fallback, size = "md", className = "" }: SafeAvatarProps) => {
  const fallbackChar = fallback?.[0]?.toUpperCase() || "U";
  const [imgError, setImgError] = useState(false);

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {!imgError && src ? (
        <AvatarImage src={src} onError={() => setImgError(true)} />
      ) : (
        <AvatarFallback>{fallbackChar}</AvatarFallback>
      )}
    </Avatar>
  );
};

export default SafeAvatar;
