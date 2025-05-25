import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { MapPin, Calendar, MessageSquare, RussianRuble } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OrderCardProps {
  order: {
    id: number;
    title: string;
    description: string;
    category: string;
    region: string;
    budget?: number;
    budgetMin?: number;
    budgetMax?: number;
    deadline?: string;
    status: string;
    responseCount: number;
    isUrgent: boolean;
    createdAt: string;
    customer: {
      firstName?: string;
      lastName?: string;
    };
  };
  showActions?: boolean;
}

const responseSchema = z.object({
  message: z.string().min(1, "Сообщение обязательно"),
  proposedPrice: z.string().optional(),
  proposedDeadline: z.string().optional(),
});

type ResponseForm = z.infer<typeof responseSchema>;

export default function OrderCard({ order, showActions = false }: OrderCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

  const form = useForm<ResponseForm>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      message: "",
      proposedPrice: "",
      proposedDeadline: "",
    },
  });

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      metalworking: "Металлообработка",
      food: "Пищевое производство",
      textile: "Текстиль",
      machinery: "Машиностроение",
      electronics: "Электроника",
      other: "Другое",
    };
    return categories[category] || category;
  };

  const getRegionLabel = (region: string) => {
    const regions: Record<string, string> = {
      moscow: "Москва",
      spb: "Санкт-Петербург",
      ekb: "Екатеринбург",
      nsk: "Новосибирск",
      other: "Другой регион",
    };
    return regions[region] || region;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getBudgetDisplay = () => {
    if (order.budget) {
      return formatCurrency(order.budget);
    }
    if (order.budgetMin && order.budgetMax) {
      return `${formatCurrency(order.budgetMin)} - ${formatCurrency(order.budgetMax)}`;
    }
    if (order.budgetMin) {
      return `от ${formatCurrency(order.budgetMin)}`;
    }
    if (order.budgetMax) {
      return `до ${formatCurrency(order.budgetMax)}`;
    }
    return "По договоренности";
  };

  const handleResponse = async (data: ResponseForm) => {
    try {
      await apiRequest("POST", `/api/orders/${order.id}/responses`, {
        message: data.message,
        proposedPrice: data.proposedPrice ? parseFloat(data.proposedPrice) : undefined,
        proposedDeadline: data.proposedDeadline || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/my-responses"] });
      setIsResponseModalOpen(false);
      form.reset();
      toast({
        title: "Отклик отправлен",
        description: "Ваш отклик успешно отправлен",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить отклик",
        variant: "destructive",
      });
    }
  };

  const canRespond = user?.company && order.status === 'active';

  return (
    <>
      <Card className="card-hover h-full">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {getCategoryLabel(order.category)}
              </Badge>
              {order.isUrgent && (
                <Badge variant="destructive">Срочно</Badge>
              )}
            </div>
            <div className="text-lg font-semibold text-primary">
              {getBudgetDisplay()}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {order.title}
          </h3>

          <p className="text-muted-foreground mb-4 line-clamp-3">
            {order.description}
          </p>

          <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{getRegionLabel(order.region)}</span>
            </div>
            {order.deadline && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>До {formatDate(order.deadline)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{order.responseCount} откликов</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {order.customer.firstName && order.customer.lastName 
                ? `${order.customer.firstName} ${order.customer.lastName}`
                : "Клиент"
              } • {formatDate(order.createdAt)}
            </div>
            
            {showActions && canRespond && (
              <Dialog open={isResponseModalOpen} onOpenChange={setIsResponseModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="btn-primary">
                    Откликнуться
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Отклик на заказ</DialogTitle>
                  </DialogHeader>
                  <div className="mb-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">{order.title}</h4>
                    <p className="text-sm text-muted-foreground">{order.description.slice(0, 100)}...</p>
                  </div>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleResponse)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ваше предложение</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Опишите ваше предложение, опыт и подход к выполнению заказа..."
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="proposedPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Предлагаемая цена (₽)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="100000" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="proposedDeadline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Предлагаемый срок</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end space-x-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsResponseModalOpen(false)}
                        >
                          Отмена
                        </Button>
                        <Button type="submit">Отправить отклик</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
