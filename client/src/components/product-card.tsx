import { useState } from "react";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await onAddToCart(product.id);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercentage = hasDiscount 
    ? Math.round(((parseFloat(product.originalPrice!) - parseFloat(product.price)) / parseFloat(product.originalPrice!)) * 100)
    : 0;

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={product.imageUrl || "/placeholder-product.jpg"}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="h-4 w-4 text-gray-400 hover:text-red-500" />
        </Button>
        {hasDiscount && (
          <Badge className="absolute top-3 left-3 bg-red-500 text-white">
            {discountPercentage}% OFF
          </Badge>
        )}
        {product.featured && (
          <Badge className="absolute top-3 left-3 bg-blue-500 text-white">
            FEATURED
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(parseFloat(product.rating || "0"))
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-gray-500 text-sm ml-1">({product.reviewCount || 0})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-semibold text-gray-900">${product.price}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
            className={`text-sm font-medium transition-colors ${
              isAdded 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isLoading ? "Adding..." : isAdded ? "Added!" : "Add to Cart"}
          </Button>
        </div>
        {product.stock !== undefined && product.stock < 10 && product.stock > 0 && (
          <p className="text-xs text-orange-600 mt-2">Only {product.stock} left in stock</p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-red-600 mt-2">Out of stock</p>
        )}
      </CardContent>
    </Card>
  );
}
