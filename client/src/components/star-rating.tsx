import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-0.5" data-testid="component-star-rating">
      {Array.from({ length: maxRating }).map((_, index) => {
        const isFilled = index < Math.floor(rating);
        const isPartial = index === Math.floor(rating) && rating % 1 !== 0;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            disabled={!interactive}
            className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"} focus:outline-none`}
            data-testid={`star-${index + 1}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : isPartial
                  ? "fill-amber-200 text-amber-400"
                  : "fill-none text-muted-foreground"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
