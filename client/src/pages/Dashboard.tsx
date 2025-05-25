import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Calendar, 
  Package, 
  Building2, 
  TrendingUp, 
  Users, 
  Star,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Edit
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const responseSchema = z.object({
  message: z.string().min(1, "Сообщение обязательно"),
  proposedPrice: z.string().optional(),
  proposedDeadline: z.string().optional(),
});

type ResponseForm = z.infer<typeof responseSchema>;

const reviewSchema = z.object({
  rating: z.number().min(1, "Рейтинг обязателен").max(5),
  comment: z.string().min(1, "Комментарий обязателен"),
});

type ReviewForm = z.infer<typeof reviewSchema>;

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const responseForm = useForm<ResponseForm>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      message: "",
      proposedPrice: "",
      proposedDeadline: "",
    },
  });

  const reviewForm = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  // Fetch user's orders
  const { data: myOrders = [] } = useQuery({
    queryKey: ["/api/dashboard/my-orders"],
  });

  // Fetch company responses (if user has a company)
  const { data: myResponses = [] } = useQuery({
    queryKey: ["/api/dashboard/my-responses"],
    enabled: !!user?.company,
  });

  // Submit order response
  const submitResponse = async (data: ResponseForm) => {
    if (!selectedOrder) return;

    try {
      await apiRequest("POST", `/api/orders/${selectedOrder.id}/responses`, {
        message: data.message,
        proposedPrice: data.proposedPrice ? parseFloat(data.proposedPrice) : undefined,
        proposedDeadline: data.proposedDeadline || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/my-responses"] });
      setIsResponseModalOpen(false);
      responseForm.reset();
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

  // Submit review
  const submitReview = async (data: ReviewForm) => {
    if (!selectedCompany) return;

    try {
      await apiRequest("POST", `/api/companies/${selectedCompany.id}/reviews`, data);

      queryClient.invalidateQueries({ queryKey: [`/api/companies/${selectedCompany.id}`] });
      setIsReviewModalOpen(false);
      reviewForm.reset();
      toast({
        title: "Отзыв добавлен",
        description: "Ваш отзыв успешно добавлен",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось добавить отзыв",
        variant: "destructive",
      });
    }
  };

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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      active: { label: "Активный", variant: "default", icon: Clock },
      completed: { label: "Завершен", variant: "secondary", icon: CheckCircle },
      cancelled: { label: "Отменен", variant: "destructive", icon: XCircle },
      pending: { label: "Ожидает", variant: "secondary", icon: Clock },
      accepted: { label: "Принят", variant: "default", icon: CheckCircle },
      rejected: { label: "Отклонен", variant: "destructive", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-foreground mb-2">
            Личный кабинет
          </h1>
          <p className="text-muted-foreground">
            Управляйте заказами, откликами и развивайте свой бизнес
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Мои заказы</p>
                  <p className="text-2xl font-bold text-foreground">{myOrders.length}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Отклики</p>
                  <p className="text-2xl font-bold text-foreground">{myResponses.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Активные заказы</p>
                  <p className="text-2xl font-bold text-foreground">
                    {myOrders.filter((order: any) => order.status === 'active').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Рейтинг компании</p>
                  <p className="text-2xl font-bold text-foreground">
                    {user?.company?.rating || "—"}
                  </p>
                </div>
                <Star className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Мои заказы</TabsTrigger>
            <TabsTrigger value="responses" disabled={!user?.company}>
              Отклики компании
            </TabsTrigger>
          </TabsList>

          {/* My Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-montserrat font-bold text-foreground">
                Мои заказы
              </h2>
              <Link href="/orders">
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать заказ
                </Button>
              </Link>
            </div>

            {myOrders.length > 0 ? (
              <div className="space-y-4">
                {myOrders.map((order: any) => (
                  <Card key={order.id} className="card-hover">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {order.title}
                            </h3>
                            {getStatusBadge(order.status)}
                            <Badge variant="outline">
                              {getCategoryLabel(order.category)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3 line-clamp-2">
                            {order.description}
                          </p>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Создан: {formatDate(order.createdAt)}
                            </div>
                            {order.deadline && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Срок: {formatDate(order.deadline)}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Откликов: {order.responseCount}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {order.budget && (
                            <div className="text-lg font-semibold text-primary mb-2">
                              {formatCurrency(order.budget)}
                            </div>
                          )}
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Редактировать
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Заказов пока нет
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Создайте свой первый заказ, чтобы найти подходящих исполнителей
                  </p>
                  <Link href="/orders">
                    <Button className="btn-primary">Создать заказ</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Company Responses Tab */}
          <TabsContent value="responses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-montserrat font-bold text-foreground">
                Отклики компании
              </h2>
              <Link href="/orders">
                <Button variant="outline">
                  Найти заказы
                </Button>
              </Link>
            </div>

            {user?.company ? (
              myResponses.length > 0 ? (
                <div className="space-y-4">
                  {myResponses.map((response: any) => (
                    <Card key={response.id} className="card-hover">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">
                                {response.order.title}
                              </h3>
                              {getStatusBadge(response.status)}
                              <Badge variant="outline">
                                {getCategoryLabel(response.order.category)}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-3">
                              {response.message}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Отправлен: {formatDate(response.createdAt)}
                              </div>
                              {response.proposedDeadline && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Предложенный срок: {formatDate(response.proposedDeadline)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {response.proposedPrice && (
                              <div className="text-lg font-semibold text-primary mb-2">
                                {formatCurrency(response.proposedPrice)}
                              </div>
                            )}
                            {response.status === 'accepted' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // This would implement review functionality
                                  setSelectedCompany({ id: response.order.customerId });
                                  setIsReviewModalOpen(true);
                                }}
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Оставить отзыв
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Откликов пока нет
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Найдите подходящие заказы и отправьте свои предложения
                    </p>
                    <Link href="/orders">
                      <Button className="btn-primary">Найти заказы</Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Компания не зарегистрирована
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Зарегистрируйте компанию, чтобы отвечать на заказы
                  </p>
                  <Link href="/companies">
                    <Button className="btn-primary">Зарегистрировать компанию</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Response Modal */}
        <Dialog open={isResponseModalOpen} onOpenChange={setIsResponseModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Отклик на заказ</DialogTitle>
            </DialogHeader>
            <Form {...responseForm}>
              <form onSubmit={responseForm.handleSubmit(submitResponse)} className="space-y-4">
                <FormField
                  control={responseForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Сообщение</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Опишите ваше предложение..."
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
                    control={responseForm.control}
                    name="proposedPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Предлагаемая цена (₽)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={responseForm.control}
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
                  <Button type="button" variant="outline" onClick={() => setIsResponseModalOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="submit">Отправить отклик</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Review Modal */}
        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Оставить отзыв</DialogTitle>
            </DialogHeader>
            <Form {...reviewForm}>
              <form onSubmit={reviewForm.handleSubmit(submitReview)} className="space-y-4">
                <FormField
                  control={reviewForm.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Рейтинг</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="5">5 звезд - Отлично</SelectItem>
                          <SelectItem value="4">4 звезды - Хорошо</SelectItem>
                          <SelectItem value="3">3 звезды - Нормально</SelectItem>
                          <SelectItem value="2">2 звезды - Плохо</SelectItem>
                          <SelectItem value="1">1 звезда - Ужасно</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={reviewForm.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Комментарий</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Поделитесь своим опытом работы..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setIsReviewModalOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="submit">Отправить отзыв</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}
