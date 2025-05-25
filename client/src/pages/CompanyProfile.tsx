import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Phone, Mail, Globe, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CompanyProfile() {
  const { id } = useParams();

  const { data: company, isLoading } = useQuery({
    queryKey: [`/api/companies/${id}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Компания не найдена</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      metalworking: "Металлообработка",
      food: "Пищевое производство",
      textile: "Текстиль",
      machinery: "Машиностроение",
      electronics: "Электроника",
      construction: "Строительство",
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
      nnov: "Нижний Новгород",
      kzn: "Казань",
      other: "Другой регион",
    };
    return regions[region] || region;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={company.logoUrl} alt={company.name} />
                <AvatarFallback className="text-2xl">
                  <Building2 className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-3xl font-montserrat font-bold text-foreground">
                    {company.name}
                  </h1>
                  {company.isVerified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Проверена
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  {company.rating > 0 && (
                    <div className="flex items-center space-x-1">
                      <div className="flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(company.rating) ? 'fill-current' : ''}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {company.rating} ({company.reviewCount} отзывов)
                      </span>
                    </div>
                  )}
                  
                  <Badge variant="outline">
                    {getCategoryLabel(company.category)}
                  </Badge>
                  
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{getRegionLabel(company.region)}</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  {company.description}
                </p>
                
                {/* Contact Information */}
                <div className="flex flex-wrap gap-4">
                  {company.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      {company.phone}
                    </div>
                  )}
                  
                  {company.email && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {company.email}
                    </div>
                  )}
                  
                  {company.website && (
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Веб-сайт
                    </a>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Button className="btn-primary">Написать сообщение</Button>
                <Button variant="outline" className="w-full">Добавить в избранное</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Details */}
            <Card>
              <CardHeader>
                <CardTitle>О компании</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {company.description}
                </p>
                
                {company.address && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Адрес</h4>
                    <p className="text-muted-foreground">{company.address}</p>
                  </div>
                )}
                
                {company.tags && company.tags.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Специализация</h4>
                    <div className="flex flex-wrap gap-2">
                      {company.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Отзывы ({company.reviews?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {company.reviews && company.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {company.reviews.map((review: any) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex text-yellow-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold">
                            {review.customer.firstName} {review.customer.lastName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Отзывов пока нет</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Категория</div>
                  <div>{getCategoryLabel(company.category)}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Регион</div>
                  <div>{getRegionLabel(company.region)}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Рейтинг</div>
                  <div className="flex items-center space-x-1">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(company.rating) ? 'fill-current' : ''}`}
                        />
                      ))}
                    </div>
                    <span>{company.rating}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Дата регистрации</div>
                  <div>{new Date(company.createdAt).toLocaleDateString('ru-RU')}</div>
                </div>
              </CardContent>
            </Card>

            {/* Tariff Info */}
            {company.tariff && (
              <Card>
                <CardHeader>
                  <CardTitle>Тарифный план</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold text-primary mb-2">
                    {company.tariff.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {company.tariff.price === 0 ? 'Бесплатно' : `${company.tariff.price} ₽/мес`}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
