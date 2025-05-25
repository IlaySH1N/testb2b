import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface SearchFiltersProps {
  onSearch: (filters: any) => void;
  type: 'orders' | 'companies';
}

export default function SearchFilters({ onSearch, type }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    region: "",
    budgetMin: "",
    budgetMax: "",
  });

  const categories = [
    { value: "metalworking", label: "Металлообработка" },
    { value: "food", label: "Пищевое производство" },
    { value: "textile", label: "Текстиль" },
    { value: "machinery", label: "Машиностроение" },
    { value: "electronics", label: "Электроника" },
    { value: "construction", label: "Строительство" },
    { value: "other", label: "Другое" },
  ];

  const regions = [
    { value: "moscow", label: "Москва" },
    { value: "spb", label: "Санкт-Петербург" },
    { value: "ekb", label: "Екатеринбург" },
    { value: "nsk", label: "Новосибирск" },
    { value: "nnov", label: "Нижний Новгород" },
    { value: "kzn", label: "Казань" },
    { value: "other", label: "Другой регион" },
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const searchFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== "")
    );
    onSearch(searchFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: "",
      category: "",
      region: "",
      budgetMin: "",
      budgetMax: "",
    };
    setFilters(resetFilters);
    onSearch({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Main Search Bar */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={type === 'orders' ? "Поиск заказов..." : "Поиск компаний..."}
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Фильтры
          </Button>
          <Button onClick={handleSearch} className="btn-primary">
            Найти
          </Button>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Категория
                </label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все категории</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Region Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Регион
                </label>
                <Select value={filters.region} onValueChange={(value) => handleFilterChange("region", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все регионы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все регионы</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Budget Filters - Only for orders */}
              {type === 'orders' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Бюджет от (₽)
                    </label>
                    <Input
                      type="number"
                      placeholder="100000"
                      value={filters.budgetMin}
                      onChange={(e) => handleFilterChange("budgetMin", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Бюджет до (₽)
                    </label>
                    <Input
                      type="number"
                      placeholder="1000000"
                      value={filters.budgetMax}
                      onChange={(e) => handleFilterChange("budgetMax", e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              <div className="flex gap-2">
                <Button onClick={handleSearch} className="btn-primary">
                  Применить фильтры
                </Button>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={handleReset}>
                    <X className="h-4 w-4 mr-2" />
                    Сбросить
                  </Button>
                )}
              </div>
              
              {hasActiveFilters && (
                <div className="text-sm text-muted-foreground">
                  Активных фильтров: {Object.values(filters).filter(v => v !== "").length}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
