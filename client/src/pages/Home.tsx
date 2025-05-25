import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Building2, ShoppingCart, BarChart3, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderCard from "@/components/OrderCard";
import CompanyCard from "@/components/CompanyCard";

export default function Home() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: featuredOrders } = useQuery({
    queryKey: ["/api/featured/orders", { limit: 3 }],
  });

  const { data: featuredCompanies } = useQuery({
    queryKey: ["/api/featured/companies", { limit: 3 }],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-foreground mb-2">
            Добро пожаловать, {user?.firstName || 'Пользователь'}!
          </h1>
          <p className="text-muted-foreground">
            Управляйте своими заказами и развивайте бизнес на РосПроизводство
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover cursor-pointer" onClick={() => window.location.href = '/orders'}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
                Заказы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Найти новые заказы</p>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer" onClick={() => window.location.href = '/companies'}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-primary" />
                Компании
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Найти производителей</p>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer" onClick={() => window.location.href = '/dashboard'}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                Дашборд
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Ваши заказы и отклики</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Статистика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats?.totalOrders || 0}</div>
              <p className="text-sm text-muted-foreground">активных заказов</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-montserrat font-bold text-foreground">
              Новые заказы
            </h2>
            <Link href="/orders">
              <Button variant="outline">Смотреть все</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredOrders?.map((order: any) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>

        {/* Featured Companies */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-montserrat font-bold text-foreground">
              Рекомендуемые компании
            </h2>
            <Link href="/companies">
              <Button variant="outline">Смотреть все</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredCompanies?.map((company: any) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section>
          <h2 className="text-2xl font-montserrat font-bold text-foreground mb-6">
            Статистика платформы
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {stats?.totalCompanies || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Компаний</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {stats?.totalOrders || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Заказов</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {stats?.totalRegions || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Регионов</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {stats?.totalVolume || 0}М ₽
                  </div>
                  <div className="text-sm text-muted-foreground">Объем</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
