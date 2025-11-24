import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarrantyStatusBadge } from "@/components/warranty-status-badge";
import { StarRating } from "@/components/star-rating";
import { ArrowLeft, AlertTriangle, Edit, Trash2, Calendar, Package, FileText, History, Star, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { ProductWithDetails, Review } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

export default function ProductDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: product, isLoading } = useQuery<ProductWithDetails>({
    queryKey: ["/api/products", id],
  });

  const deleteProduct = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/products/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produto eliminado",
        description: "O produto foi removido com sucesso.",
      });
      setLocation("/");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Produto não encontrado</h2>
          <Button onClick={() => setLocation("/")} data-testid="button-back-home">
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const warrantyExpiration = new Date(product.warrantyExpiration);
  const purchaseDate = new Date(product.purchaseDate);
  const today = new Date();
  const daysRemaining = Math.ceil((warrantyExpiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const totalWarrantyDays = Math.ceil((warrantyExpiration.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = totalWarrantyDays - Math.max(daysRemaining, 0);
  const warrantyProgress = (daysPassed / totalWarrantyDays) * 100;
  const warrantyStatus = daysRemaining < 0 ? "expired" : daysRemaining <= 90 ? "expiring" : "valid";

  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0;

  const images = product.photoUrls || [];
  const currentImage = images[selectedImageIndex] || null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-product-name">{product.name}</h1>
              <p className="text-muted-foreground">{product.brand.name} • {product.model}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" data-testid="button-edit">
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" data-testid="button-delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar produto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser revertida. O produto e todas as informações associadas serão permanentemente eliminados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteProduct.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Gallery */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                {currentImage ? (
                  <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="h-24 w-24 text-muted-foreground" />
                )}
              </div>
            </Card>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-md overflow-hidden hover-elevate transition-all ${
                      index === selectedImageIndex ? "ring-2 ring-primary" : ""
                    }`}
                    data-testid={`thumbnail-${index}`}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Warranty Status Card */}
          <div className="space-y-4">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Estado da Garantia</h2>
                <WarrantyStatusBadge status={warrantyStatus} daysRemaining={daysRemaining > 0 ? daysRemaining : undefined} />
              </div>
              
              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">{Math.round(warrantyProgress)}%</span>
                  </div>
                  <Progress value={warrantyProgress} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Data de Compra</span>
                    <span className="text-sm font-medium text-right" data-testid="text-purchase-date">
                      {purchaseDate.toLocaleDateString('pt-PT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Expira em</span>
                    <span className="text-sm font-medium text-right" data-testid="text-expiry-date">
                      {warrantyExpiration.toLocaleDateString('pt-PT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {daysRemaining >= 0 && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">Dias Restantes</span>
                      <span className="text-sm font-bold text-primary" data-testid="text-days-remaining">
                        {daysRemaining} dias
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <Button 
                className="w-full" 
                onClick={() => setLocation(`/produto/${id}/suporte`)}
                data-testid="button-report-issue"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reportar Avaria
              </Button>
            </Card>

            {/* Quick Info */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Categoria</span>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
              {product.serialNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nº Série</span>
                  <span className="text-sm font-mono">{product.serialNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avaliação</span>
                <div className="flex items-center gap-2">
                  <StarRating rating={averageRating} size="sm" />
                  <span className="text-sm text-muted-foreground">
                    ({product.reviews?.length || 0})
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full justify-start" data-testid="tabs-navigation">
            <TabsTrigger value="details" data-testid="tab-details">
              <FileText className="h-4 w-4 mr-2" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="receipt" data-testid="tab-receipt">
              <Download className="h-4 w-4 mr-2" />
              Talão
            </TabsTrigger>
            <TabsTrigger value="support" data-testid="tab-support">
              <History className="h-4 w-4 mr-2" />
              Histórico de Suporte
            </TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">
              <Star className="h-4 w-4 mr-2" />
              Avaliações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Informações do Produto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Marca</label>
                  <p className="font-medium">{product.brand.name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Modelo</label>
                  <p className="font-medium">{product.model}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Categoria</label>
                  <p className="font-medium">{product.category}</p>
                </div>
                {product.serialNumber && (
                  <div>
                    <label className="text-sm text-muted-foreground">Número de Série</label>
                    <p className="font-medium font-mono">{product.serialNumber}</p>
                  </div>
                )}
              </div>
              {product.notes && (
                <div className="mt-4">
                  <label className="text-sm text-muted-foreground">Notas</label>
                  <p className="mt-1">{product.notes}</p>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contacto do Fabricante</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Email de Suporte</label>
                  <p className="font-medium">{product.brand.supportEmail}</p>
                </div>
                {product.brand.supportPhone && (
                  <div>
                    <label className="text-sm text-muted-foreground">Telefone</label>
                    <p className="font-medium">{product.brand.supportPhone}</p>
                  </div>
                )}
                {product.brand.website && (
                  <div>
                    <label className="text-sm text-muted-foreground">Website</label>
                    <a href={product.brand.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                      {product.brand.website}
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="receipt">
            <Card className="p-6">
              {product.receiptUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Talão de Compra</h3>
                    <Button variant="outline" size="sm" asChild>
                      <a href={product.receiptUrl} download>
                        <Download className="h-4 w-4 mr-2" />
                        Descarregar
                      </a>
                    </Button>
                  </div>
                  <img src={product.receiptUrl} alt="Receipt" className="max-w-full rounded-lg" />
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum talão carregado</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card className="p-6">
              {product.supportRequests && product.supportRequests.length > 0 ? (
                <div className="space-y-4">
                  {product.supportRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={request.status === "resolved" ? "default" : "secondary"}>
                          {request.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                      <p className="text-sm"><strong>Categoria:</strong> {request.category}</p>
                      <p className="text-sm"><strong>Severidade:</strong> {request.severity}</p>
                      <p className="text-sm">{request.issueDescription}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum pedido de suporte registado</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="p-6">
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <StarRating rating={review.rating} />
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                      {review.title && <h4 className="font-semibold mb-1">{review.title}</h4>}
                      {review.content && <p className="text-sm text-muted-foreground">{review.content}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma avaliação ainda</p>
                  <Button className="mt-4" onClick={() => setLocation(`/produto/${id}/avaliar`)} data-testid="button-add-review">
                    Adicionar Avaliação
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
