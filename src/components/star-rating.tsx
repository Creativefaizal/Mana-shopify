import { Star } from "lucide-react";
import { formatReviews } from "@/lib/format";

interface StarRatingProps {
  rating: number;
  reviews?: number;
  size?: number;
  /** Hide the "(1.2k Reviews)" suffix, e.g. in the compact rails. */
  hideReviews?: boolean;
}

export function StarRating({ rating, reviews, size = 14, hideReviews = false }: StarRatingProps) {
  const filled = Math.round(Math.min(5, Math.max(0, rating)));

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-[3px]" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((index) => (
          <Star
            key={index}
            width={size}
            height={size}
            strokeWidth={1.4}
            className={
              index <= filled
                ? "fill-star text-star"
                : "fill-transparent text-ink-muted/50"
            }
          />
        ))}
      </span>
      <span className="text-xs text-ink-muted">
        <span className="sr-only">{rating.toFixed(1)} out of 5 stars</span>
        <span aria-hidden="true">
          {rating.toFixed(1)}
          {!hideReviews && reviews !== undefined ? ` (${formatReviews(reviews)} Reviews)` : ""}
        </span>
      </span>
    </div>
  );
}
