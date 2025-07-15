import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import ProductCard from "@/components/product-card";
import ProductFilters from "@/components/product-filters";
import CartSidebar from "@/components/cart-sidebar";
import AuthModal from "@/components/auth-modal";
import { authenticatedApiRequest } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Product, CartItemWithProduct } from "@shared/schema";
import { useLocation } from "wouter";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceRanges: [] as string[],
    brands: [] as string[],
    ratings: [] as number[],
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const user = auth.getUser();

  // Build query parameters for products
  const buildProductQuery = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (sortBy && sortBy !== "featured") params.append("sortBy", sortBy);
    
    // Handle price ranges
    filters.priceRanges.forEach(range => {
      if (range === "0-50") {
        params.append("minPrice", "0");
        params.append("maxPrice", "50");
      } else if (range === "50-100") {
        params.append("minPrice", "50");
        params.append("maxPrice", "100");
      } else if (range === "100-500") {
        params.append("minPrice", "100");
        params.append("maxPrice", "500");
      } else if (range === "500+") {
        params.append("minPrice", "500");
      }
    });

    // Handle brands
    if (filters.brands.length > 0) {
      params.append("brand", filters.brands[0]); // API limitation: single brand
    }

    return params.toString();
  };

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", buildProductQuery()],
    queryFn: async () => {
      const query = buildProductQuery();
      const response = await fetch(`/api/products?${query}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json() as Promise<Product[]>;
    },
  });

  // Fetch cart items
  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ["/api/cart"],
    queryFn: async () => {
      if (!user) return [];
      const response = await authenticatedApiRequest("GET", "/api/cart");
      return response.json() as Promise<CartItemWithProduct[]>;
    },
    enabled: !!user,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      if (!user) {
        setIsAuthModalOpen(true);
        throw new Error("Please sign in to add items to cart");
      }
      return authenticatedApiRequest("POST", "/api/cart", {
        productId,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart successfully.",
      });
    },
    onError: (error: any) => {
      if (!error.message.includes("sign in")) {
        toast({
          variant: "destructive",
          title: "Failed to add to cart",
          description: error.message || "Please try again.",
        });
      }
    },
  });

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      return authenticatedApiRequest("PUT", `/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to update cart",
        description: error.message || "Please try again.",
      });
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return authenticatedApiRequest("DELETE", `/api/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to remove item",
        description: error.message || "Please try again.",
      });
    },
  });

  const handleAddToCart = (productId: number) => {
    addToCartMutation.mutate(productId);
  };

  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCartMutation.mutate(itemId);
    } else {
      updateCartMutation.mutate({ itemId, quantity });
    }
  };

  const handleRemoveItem = (itemId: number) => {
    removeFromCartMutation.mutate(itemId);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setLocation("/checkout");
  };

  const handleAuthSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Hero section with featured products
  const { data: featuredProducts = [] } = useQuery({
    queryKey: ["/api/products/featured"],
    queryFn: async () => {
      const response = await fetch("/api/products/featured");
      if (!response.ok) throw new Error("Failed to fetch featured products");
      return response.json() as Promise<Product[]>;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onCartToggle={() => setIsCartOpen(true)}
        onAuthModalOpen={() => setIsAuthModalOpen(true)}
        cartItemCount={cartItemCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Category Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 py-3 overflow-x-auto">
            <Button variant="link" className="whitespace-nowrap text-sm text-gray-600 hover:text-primary">
              Electronics
            </Button>
            <Button variant="link" className="whitespace-nowrap text-sm text-gray-600 hover:text-primary">
              Clothing
            </Button>
            <Button variant="link" className="whitespace-nowrap text-sm text-gray-600 hover:text-primary">
              Home & Garden
            </Button>
            <Button variant="link" className="whitespace-nowrap text-sm text-gray-600 hover:text-primary">
              Sports
            </Button>
            <Button variant="link" className="whitespace-nowrap text-sm text-gray-600 hover:text-primary">
              Books
            </Button>
            <Button variant="link" className="whitespace-nowrap text-sm text-gray-600 hover:text-primary">
              Beauty
            </Button>
            <Button variant="link" className="whitespace-nowrap text-sm text-gray-600 hover:text-primary">
              Toys
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {!searchQuery && (
          <section className="mb-12">
            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-r from-primary to-primary/80">
              <div className="absolute inset-0 flex items-center justify-center text-center text-white p-8">
                <div>
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">Summer Sale</h2>
                  <p className="text-lg md:text-xl mb-6 opacity-90">Up to 50% off on selected items</p>
                  <Button className="bg-white text-primary hover:bg-gray-100">
                    Shop Now
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <ProductFilters filters={filters} onFiltersChange={setFilters} />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Sort and Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {productsLoading ? "Loading..." : `Showing ${products.length} products`}
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Sort by: Featured</SelectItem>
                  <SelectItem value="price">Price: Low to High</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                  <SelectItem value="rating">Customer Rating</SelectItem>
                  <SelectItem value="created">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        isLoading={updateCartMutation.isPending || removeFromCartMutation.isPending}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
