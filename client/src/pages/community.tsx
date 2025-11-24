import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type CommunityReview = {
  id: string;
  productId: string;
  rating: number;
  title?: string;
  content?: string;
  recommend: boolean;
  createdAt: Date;
  product: any;
};

export default function Community() {
  const { data: reviews, isLoading } = useQuery<CommunityReview[]>({
    queryKey: ["/api/community/reviews"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Comunidade de Avaliações</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Comunidade de Avaliações</h1>
          <p className="text-muted-foreground mt-2">
            Veja as avaliações de outros utilizadores sobre produtos e marcas
          </p>
        </div>

        {!reviews || reviews.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              Ainda não há avaliações. Seja o primeiro a partilhar!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6 hover-elevate" data-testid={`card-review-${review.id}`}>
                <div className="space-y-3">
                  {/* Product Info */}
                  <div>
                    <h3 className="font-bold text-lg">{review.product?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {review.product?.brand?.name} • {review.product?.model}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold">{review.rating}/5</span>
                  </div>

                  {/* Title and Content */}
                  {review.title && (
                    <h4 className="font-semibold">{review.title}</h4>
                  )}
                  {review.content && (
                    <p className="text-sm text-foreground/90">{review.content}</p>
                  )}

                  {/* Recommendation Badge */}
                  <div className="flex gap-2">
                    {review.recommend && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        ✓ Recomendado
                      </Badge>
                    )}
                  </div>

                  {/* Date */}
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("pt-PT")}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
