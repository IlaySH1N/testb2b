import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function PricingSection() {
  const { isAuthenticated } = useAuth();

  const { data: tariffs = [] } = useQuery({
    queryKey: ["/api/tariffs"],
  });

  const handleSelectPlan = (tariffId: number) => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    
    // In a real implementation, this would handle payment processing
    console.log('Selected tariff:', tariffId);
  };

  const getFeatureLabel = (feature: string) => {
    const features: Record<string, string> = {
      basic_profile: "Карточка компании",
      limited_responses: "5 откликов в месяц",
      basic_support: "Базовая поддержка",
      unlimited_responses: "Неограниченные отклики", 
      top_placement: "Размещение в топе по региону",
      analytics: "Аналитика по откликам",
      banner_ads: "Баннерная реклама на главной",
      personal_manager: "Персональный менеджер",
      search_promotion: "Продвижение в поиске",
      priority_support: "Приоритетная поддержка",
    };
    return features[feature] || feature;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!tariffs.length) {
    return null;
  }

  // Sort tariffs by price
  const sortedTariffs = [...tariffs].sort((a, b) => a.price - b.price);
  const popularTariffIndex = Math.floor(sortedTariffs.length / 2);

  return (
    <section id="pricing" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-foreground mb-4">
            Тарифные планы
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Выберите подходящий тариф для развития вашего бизнеса
          </p>
        </div>

        <div className={`grid grid-cols-1 ${
          sortedTariffs.length === 4 ? 'md:grid-cols-4' : 
          sortedTariffs.length === 3 ? 'md:grid-cols-3' : 
          'md:grid-cols-2'
        } gap-6`}>
          {sortedTariffs.map((tariff, index) => {
            const isPopular = index === popularTariffIndex && sortedTariffs.length > 2;
            const isFree = tariff.price === 0;
            
            return (
              <Card 
                key={tariff.id} 
                className={`relative ${
                  isPopular 
                    ? 'ring-2 ring-primary shadow-lg scale-105' 
                    : 'border-2 border-border'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white">Популярный</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {tariff.name}
                  </CardTitle>
                  <div className="text-3xl font-bold text-foreground">
                    {isFree ? '0 ₽' : formatPrice(tariff.price)}
                  </div>
                  <div className="text-muted-foreground">
                    {isFree ? 'навсегда' : 'в месяц'}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {Array.isArray(tariff.features) && tariff.features.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">
                          {getFeatureLabel(feature)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleSelectPlan(tariff.id)}
                    className={`w-full ${
                      isPopular 
                        ? 'btn-primary' 
                        : isFree 
                        ? 'bg-muted text-muted-foreground hover:bg-muted/80' 
                        : 'btn-primary'
                    }`}
                    disabled={isFree}
                  >
                    {isFree ? 'Текущий план' : 'Выбрать план'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Все тарифы включают доступ к основным функциям платформы. 
            Можно изменить или отменить подписку в любое время.
          </p>
        </div>
      </div>
    </section>
  );
}
