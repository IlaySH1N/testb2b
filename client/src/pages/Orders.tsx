import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderCard from "@/components/OrderCard";
import SearchFilters from "@/components/SearchFilters";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const orderSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  category: z.string().min(1, "Категория обязательна"),
  region: z.string().min(1, "Регион обязателен"),
  budget: z.string().optional(),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  deadline: z.string().optional(),
  requirements: z.string().optional(),
});

type OrderForm = z.infer<typeof orderSchema>;

export default function Orders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    category: "",
    region: "",
    budgetMin: "",
    budgetMax: "",
    search: "",
  });
  const [page, setPage] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const form = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      region: "",
      budget: "",
      budgetMin: "",
      budgetMax: "",
      deadline: "",
      requirements: "",
    },
  });

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["/api/orders", { ...filters, offset: page * 20 }],
  });

  const createOrderMutation = {
    mutationFn: async (data: OrderForm) => {
      const response = await apiRequest("POST", "/api/orders", {
        ...data,
        budget: data.budget ? parseFloat(data.budget) : undefined,
        budgetMin: data.budgetMin ? parseFloat(data.budgetMin) : undefined,
        budgetMax: data.budgetMax ? parseFloat(data.budgetMax) : undefined,
        deadline: data.deadline || undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/featured/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsCreateModalOpen(false);
      form.reset();
      toast({
        title: "Заказ создан",
        description: "Ваш заказ успешно опубликован",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать заказ",
        variant: "destructive",
      });
    },
  };

  const handleSearch = (newFilters: any) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleCreateOrder = async (data: OrderForm) => {
    await createOrderMutation.mutationFn(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-montserrat font-bold text-foreground">Заказы</h1>
            <p className="text-muted-foreground">
              Найдите подходящие заказы или разместите свой
            </p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Создать заказ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Создать новый заказ</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateOrder)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название заказа</FormLabel>
                        <FormControl>
                          <Input placeholder="Изготовление металлоконструкций" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Подробное описание требований к заказу..."
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
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Категория</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите категорию" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="metalworking">Металлообработка</SelectItem>
                              <SelectItem value="food">Пищевое производство</SelectItem>
                              <SelectItem value="textile">Текстиль</SelectItem>
                              <SelectItem value="machinery">Машиностроение</SelectItem>
                              <SelectItem value="electronics">Электроника</SelectItem>
                              <SelectItem value="other">Другое</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Регион</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите регион" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="moscow">Москва</SelectItem>
                              <SelectItem value="spb">Санкт-Петербург</SelectItem>
                              <SelectItem value="ekb">Екатеринбург</SelectItem>
                              <SelectItem value="nsk">Новосибирск</SelectItem>
                              <SelectItem value="other">Другой регион</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="budgetMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Бюджет от (₽)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="100000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budgetMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Бюджет до (₽)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="500000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Срок выполнения</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дополнительные требования</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Особые требования, условия работы..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateModalOpen(false)}
                    >
                      Отмена
                    </Button>
                    <Button type="submit">Создать заказ</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <SearchFilters onSearch={handleSearch} type="orders" />

        {/* Orders List */}
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : ordersData?.orders.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ordersData.orders.map((order: any) => (
                  <OrderCard key={order.id} order={order} showActions />
                ))}
              </div>
              
              {/* Pagination */}
              {ordersData.total > 20 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                    >
                      Назад
                    </Button>
                    <span className="px-4 py-2 text-sm text-muted-foreground">
                      Страница {page + 1} из {Math.ceil(ordersData.total / 20)}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(page + 1)}
                      disabled={(page + 1) * 20 >= ordersData.total}
                    >
                      Вперед
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  Заказы не найдены. Попробуйте изменить параметры поиска.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
