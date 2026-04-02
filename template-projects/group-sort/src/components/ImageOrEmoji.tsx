import { isEmoji } from "../utils/isEmoji";

interface ImageOrEmojiProps {
  imagePath: string;
  alt: string;
  size?: "large" | "small" | "tiny";
}

export const ImageOrEmoji: React.FC<ImageOrEmojiProps> = ({
  imagePath,
  alt,
  size = "large",
}) => {
  if (isEmoji(imagePath)) {
    const sizeClass =
      size === "large"
        ? "text-6xl"
        : size === "small"
          ? "text-5xl"
          : "text-2xl";
    return (
      <span className={`${sizeClass} pointer-events-none select-none`}>
        {imagePath}
      </span>
    );
  }
  const sizeClass =
    size === "large" ? "w-24 h-24" : size === "small" ? "w-20 h-20" : "w-8 h-8";
  return (
    <img src={imagePath} alt={alt} className={`${sizeClass} object-contain`} />
  );
};
