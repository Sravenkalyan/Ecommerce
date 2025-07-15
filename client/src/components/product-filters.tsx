import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Filters {
  priceRanges: string[];
  brands: string[];
  ratings: number[];
}

interface ProductFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export default function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const priceRanges = [
    { id: "0-50", label: "$0 - $50", min: 0, max: 50 },
    { id: "50-100", label: "$50 - $100", min: 50, max: 100 },
    { id: "100-500", label: "$100 - $500", min: 100, max: 500 },
    { id: "500+", label: "$500+", min: 500, max: Infinity },
  ];

  const brands = ["Apple", "Samsung", "Sony", "AudioTech", "TechCorp", "CompuTech", "FitTech"];

  const ratings = [5, 4, 3];

  const handlePriceRangeChange = (rangeId: string, checked: boolean) => {
    const newRanges = checked
      ? [...filters.priceRanges, rangeId]
      : filters.priceRanges.filter(r => r !== rangeId);
    
    onFiltersChange({ ...filters, priceRanges: newRanges });
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...filters.brands, brand]
      : filters.brands.filter(b => b !== brand);
    
    onFiltersChange({ ...filters, brands: newBrands });
  };

  const handleRatingChange = (rating: number, checked: boolean) => {
    const newRatings = checked
      ? [...filters.ratings, rating]
      : filters.ratings.filter(r => r !== rating);
    
    onFiltersChange({ ...filters, ratings: newRatings });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <div key={range.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`price-${range.id}`}
                  checked={filters.priceRanges.includes(range.id)}
                  onCheckedChange={(checked) => 
                    handlePriceRangeChange(range.id, checked as boolean)
                  }
                />
                <Label htmlFor={`price-${range.id}`} className="text-sm text-gray-600">
                  {range.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Brand */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Brand</h4>
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={(checked) => 
                    handleBrandChange(brand, checked as boolean)
                  }
                />
                <Label htmlFor={`brand-${brand}`} className="text-sm text-gray-600">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Rating */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Rating</h4>
          <div className="space-y-2">
            {ratings.map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.ratings.includes(rating)}
                  onCheckedChange={(checked) => 
                    handleRatingChange(rating, checked as boolean)
                  }
                />
                <Label htmlFor={`rating-${rating}`} className="text-sm text-gray-600 flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-1">({rating}+)</span>
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
