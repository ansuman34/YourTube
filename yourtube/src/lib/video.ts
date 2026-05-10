export type VideoRecord = {
  _id: string;
  videotitle?: string;
  filename?: string;
  filepath?: string;
  filetype?: string;
  filesize?: string | number;
  videochanel?: string;
  description?: string;
  category?: string;
  Like?: number;
  Dislike?: number;
  views?: number;
  uploader?: string;
  createdAt?: string;
};

export const VIDEO_CATEGORIES = [
  "All",
  "Music",
  "Gaming",
  "Movies",
  "News",
  "Sports",
  "Technology",
  "Comedy",
  "Education",
  "Science",
  "Travel",
  "Food",
  "Fashion",
];

export const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export function getVideoUrl(filepath?: string) {
  if (!filepath) return "";
  if (/^https?:\/\//i.test(filepath)) return filepath;

  const cleanBase = backendUrl.replace(/\/$/, "");
  const cleanPath = filepath.replace(/\\/g, "/").replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
}

export function getChannelInitial(channelName?: string) {
  return channelName?.trim()?.[0]?.toUpperCase() || "Y";
}

export function formatViews(views?: number) {
  return `${(views || 0).toLocaleString()} views`;
}
