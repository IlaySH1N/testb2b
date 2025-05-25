import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Building2, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

interface CompanyCardProps {
  company: {
    id: number;
    name: string;
    description: string;
    category: string;
    region: string;
    logoUrl?: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    tags?: string[];
    tariff?: {
      name: string;
      features: string[];
    };
  };
}

export default function CompanyCard({ company }: CompanyCardProps) {
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const isPremium = company.tariff && company.tariff.name !== 'Бесплатный';

  return (
    <Card className={`card-hover h-full ${isPremium ? 'ring-2 ring-primary/20' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Avatar className="h-16 w-16 mr-4">
            <AvatarImage src={company.logoUrl} alt={company.name} />
            <AvatarFallback>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                {company.name}
              </h3>
              {company.isVerified && (
                <ShieldCheck className="h-4 w-4 text-green-600" />
              )}
              {isPremium && (
                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                  {company.tariff.name}
                </Badge>
              )}
            </div>
            
            {Number(company.rating) > 0 && (
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {renderStars(Number(company.rating))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {Number(company.rating).toFixed(1)} ({company.reviewCount} отзыв{company.reviewCount === 1 ? '' : company.reviewCount < 5 ? 'а' : 'ов'})
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="text-muted-foreground mb-4 line-clamp-3">
          {company.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {getCategoryLabel(company.category)}
          </Badge>
          {company.tags?.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {company.tags && company.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{company.tags.length - 2}
            </Badge>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{getRegionLabel(company.region)}</span>
          </div>
          
          <Link href={`/companies/${company.id}`}>
            <Button size="sm" className="btn-primary">
              Подробнее
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
