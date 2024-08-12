import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export function timeAgo(dateString: string): string {
  const date: Date = new Date(dateString);
  const now: Date = new Date();
  const diffInSeconds: number = Math.floor((now.getTime() - date.getTime()) / 1000);

  const units: { name: string; seconds: number }[] = [
    { name: "year", seconds: 31536000 },
    { name: "month", seconds: 2592000 },
    { name: "week", seconds: 604800 },
    { name: "day", seconds: 86400 },
    { name: "hour", seconds: 3600 },
    { name: "min", seconds: 60 },
    { name: "sec", seconds: 1 },
  ];

  for (const unit of units) {
    const interval: number = Math.floor(diffInSeconds / unit.seconds);
    if (interval >= 1) {
      return `${interval} ${unit.name}${interval !== 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}
export const checkIsLiked = (likeList: string[], userId: string) => {
  return likeList.includes(userId);
};

export function formatTimeFromString(dateString: string) {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date string");
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Determine AM or PM
  const period = hours >= 12 ? 'PM' : 'AM';

  // Convert hours to 12-hour format
  const adjustedHours = hours % 12 || 12;

  // Format minutes to always have two digits
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${adjustedHours}:${formattedMinutes} ${period}`;
}
