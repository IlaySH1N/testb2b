import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Building2, MapPin, Calendar, RussianRuble } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderCard from "@/components/OrderCard";
import CompanyCard from "@/components/CompanyCard";
import PricingSection from "@/components/PricingSection";

export default function Landing() {
  const [searchFilters, setSearchFilters] = useState({
    category: "",
    region: "",
    budget: "",
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: featuredOrders } = useQuery({
    queryKey: ["/api/featured/orders"],
  });

  const { data: featuredCompanies } = useQuery({
    queryKey: ["/api/featured/companies"],
  });

  const handleSearch = () => {
    // In a real app, this would navigate to orders page with filters
    console.log("Search with filters:", searchFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-montserrat font-bold mb-6">
              Объединяем российские<br />
              <span className="text-blue-200">производства и клиентов</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Бесплатное размещение компаний, поиск заказов и развитие бизнеса на одной платформе
            </p>
            
            {/* Search Bar */}
            <Card className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                    <Select value={searchFilters.category} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все категории" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все категории</SelectItem>
                        <SelectItem value="metalworking">Металлообработка</SelectItem>
                        <SelectItem value="food">Пищевое производство</SelectItem>
                        <SelectItem value="textile">Текстиль</SelectItem>
                        <SelectItem value="machinery">Машиностроение</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Регион</label>
                    <Select value={searchFilters.region} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, region: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все регионы" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все регионы</SelectItem>
                        <SelectItem value="moscow">Москва</SelectItem>
                        <SelectItem value="spb">Санкт-Петербург</SelectItem>
                        <SelectItem value="ekb">Екатеринбург</SelectItem>
                        <SelectItem value="nsk">Новосибирск</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Бюджет</label>
                    <Input 
                      type="text" 
                      placeholder="от 100 000 ₽" 
                      value={searchFilters.budget}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, budget: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <Button onClick={handleSearch} className="w-full btn-primary">
                      Найти заказы
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={() => window.location.href = '/api/login'} 
                className="bg-white text-primary hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold"
              >
                Разместить компанию
              </Button>
              <Button 
                onClick={() => window.location.href = '/api/login'} 
                className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 rounded-lg font-semibold"
              >
                Опубликовать заказ
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-montserrat font-bold text-primary mb-2">
                {stats?.totalCompanies || 0}+
              </div>
              <div className="text-gray-600">Компаний</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-montserrat font-bold text-primary mb-2">
                {stats?.totalOrders || 0}+
              </div>
              <div className="text-gray-600">Активных заказов</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-montserrat font-bold text-primary mb-2">
                {stats?.totalRegions || 0}
              </div>
              <div className="text-gray-600">Регионов России</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-montserrat font-bold text-primary mb-2">
                {stats?.totalVolume || 0} млн ₽
              </div>
              <div className="text-gray-600">Объем заказов</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Orders Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-foreground mb-4">
              Актуальные заказы
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Свежие заказы от проверенных клиентов по всей России
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredOrders?.map((order: any) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          <div className="text-center">
            <Button className="btn-secondary">Смотреть все заказы</Button>
          </div>
        </div>
      </section>

      {/* Featured Companies Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-foreground mb-4">
              Проверенные производители
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Надежные партнеры с многолетним опытом работы
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredCompanies?.map((company: any) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          <div className="text-center">
            <Button className="btn-secondary">Все компании</Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-foreground mb-4">
              Как это работает
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Простой процесс для эффективного сотрудничества
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Регистрация</h3>
              <p className="text-muted-foreground">
                Создайте профиль компании или клиента. Это быстро и бесплатно.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Поиск и публикация</h3>
              <p className="text-muted-foreground">
                Ищите подходящие заказы или размещайте свои потребности.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Сотрудничество</h3>
              <p className="text-muted-foreground">
                Находите партнеров и развивайте свой бизнес вместе с нами.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-foreground mb-4">
              Отзывы клиентов
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Что говорят о нас наши пользователи
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                rating: 5,
                text: "Благодаря платформе нашли надежного партнера для изготовления металлоконструкций. Сэкономили время и получили качественный результат.",
                name: "Александр Петров",
                company: "ООО \"СтройДеталь\"",
              },
              {
                rating: 5,
                text: "Отличная платформа для поиска заказов. Удобные фильтры и быстрая связь с клиентами. Рекомендую всем производителям.",
                name: "Мария Соколова",
                company: "ПромТех Решения",
              },
              {
                rating: 4,
                text: "Хорошее решение для B2B сегмента. Нашли несколько постоянных клиентов. Поддержка работает оперативно.",
                name: "Дмитрий Волков",
                company: "МеталлКомплект",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0">
                  <div className="flex text-yellow-400 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < testimonial.rating ? 'fill-current' : ''}`}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">{testimonial.text}</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mr-3">
                      <span className="text-lg font-semibold">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-4">
            Готовы начать сотрудничество?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Присоединяйтесь к тысячам успешных производителей и клиентов
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => window.location.href = '/api/login'} 
              className="bg-white text-primary hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold"
            >
              Зарегистрировать компанию
            </Button>
            <Button 
              onClick={() => window.location.href = '/api/login'} 
              className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 rounded-lg font-semibold"
            >
              Разместить заказ
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
