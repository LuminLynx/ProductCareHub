import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type SupportHistoryItem = {
  id: string;
  productId: string;
  issueDescription: string;
  category: string;
  severity: string;
  status: string;
  createdAt: Date;
  emailSentAt?: Date;
  product: any;
};

const statusColors: { [key: string]: string } = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  sent: "bg-blue-50 text-blue-700 border-blue-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
};

const severityColors: { [key: string]: string } = {
  low: "text-muted-foreground",
  medium: "text-yellow-600",
  high: "text-red-600",
};

export default function SupportHistory() {
  const { data: history, isLoading } = useQuery<SupportHistoryItem[]>({
    queryKey: ["/api/support-history"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Histórico de Reclamações</h1>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
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
          <h1 className="text-4xl font-bold">Histórico de Reclamações</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe o estado de todas as suas reclamações de garantia
          </p>
        </div>

        {!history || history.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Você ainda não tem reclamações de garantia
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id} className="p-6 hover-elevate" data-testid={`card-support-${item.id}`}>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg">{item.product?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.product?.brand?.name} • {item.product?.model}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={statusColors[item.status]}>
                        {item.status === "pending" && "⏳ Pendente"}
                        {item.status === "sent" && "✉️ Enviado"}
                        {item.status === "resolved" && "✓ Resolvido"}
                      </Badge>
                      <Badge variant="outline" className={`border-muted-foreground ${severityColors[item.severity]}`}>
                        {item.severity === "low" && "Baixa"}
                        {item.severity === "medium" && "Média"}
                        {item.severity === "high" && "Alta"}
                      </Badge>
                    </div>
                  </div>

                  {/* Issue Description */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Descrição do Problema:</p>
                    <p className="text-sm text-foreground/80">{item.issueDescription}</p>
                  </div>

                  {/* Category */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Categoria: {item.category}</span>
                    <span className="text-muted-foreground">
                      Data: {new Date(item.createdAt).toLocaleDateString("pt-PT")}
                    </span>
                  </div>

                  {/* Email Sent Date */}
                  {item.emailSentAt && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Email enviado em {new Date(item.emailSentAt).toLocaleDateString("pt-PT")}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
