import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompanyCard from "@/components/CompanyCard";
import SearchFilters from "@/components/SearchFilters";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const companySchema = z.object({
  name: z.string().min(1, "Название компании обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  category: z.string().min(1, "Категория обязательна"),
  region: z.string().min(1, "Регион обязателен"),
  website: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Некорректный email").optional(),
  address: z.string().optional(),
});

type CompanyForm = z.infer<typeof companySchema>;

export default function Companies() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    category: "",
    region: "",
    search: "",
  });
  const [page, setPage] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const form = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      region: "",
      website: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  const { data: companiesData, isLoading } = useQuery({
    queryKey: ["/api/companies", { ...filters, offset: page * 20 }],
  });

  const createCompanyMutation = {
    mutationFn: async (data: CompanyForm) => {
      const response = await apiRequest("POST", "/api/companies", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/featured/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsCreateModalOpen(false);
      form.reset();
      toast({
        title: "Компания создана",
        description: "Ваша компания успешно зарегистрирована",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать компанию",
        variant: "destructive",
      });
    },
  };

  const handleSearch = (newFilters: any) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleCreateCompany = async (data: CompanyForm) => {
    await createCompanyMutation.mutationFn(data);
  };

  const canCreateCompany = user && !user.company;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-montserrat font-bold text-foreground">Компании</h1>
            <p className="text-muted-foreground">
              Найдите надежных производителей или зарегистрируйте свою компанию
            </p>
          </div>
          
          {canCreateCompany && (
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Зарегистрировать компанию
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Регистрация компании</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateCompany)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название компании</FormLabel>
                          <FormControl>
                            <Input placeholder="ООО «Производственная компания»" {...field} />
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
                              placeholder="Опишите деятельность вашей компании, опыт работы, основные направления..."
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
                                <SelectItem value="construction">Строительство</SelectItem>
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
                                <SelectItem value="nnov">Нижний Новгород</SelectItem>
                                <SelectItem value="kzn">Казань</SelectItem>
                                <SelectItem value="other">Другой регион</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Веб-сайт</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Телефон</FormLabel>
                            <FormControl>
                              <Input placeholder="+7 (495) 123-45-67" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="info@company.ru" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Адрес</FormLabel>
                          <FormControl>
                            <Input placeholder="г. Москва, ул. Примерная, д. 123" {...field} />
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
                      <Button type="submit">Зарегистрировать</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search and Filters */}
        <SearchFilters onSearch={handleSearch} type="companies" />

        {/* Companies List */}
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
          ) : companiesData?.companies.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companiesData.companies.map((company: any) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
              
              {/* Pagination */}
              {companiesData.total > 20 && (
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
                      Страница {page + 1} из {Math.ceil(companiesData.total / 20)}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(page + 1)}
                      disabled={(page + 1) * 20 >= companiesData.total}
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
                  Компании не найдены. Попробуйте изменить параметры поиска.
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
