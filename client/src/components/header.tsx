import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/auth";

interface HeaderProps {
  onCartToggle: () => void;
  onAuthModalOpen: () => void;
  cartItemCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ 
  onCartToggle, 
  onAuthModalOpen, 
  cartItemCount, 
  searchQuery, 
  onSearchChange 
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const user = auth.getUser();

  const handleLogout = () => {
    auth.logout();
    window.location.reload();
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary cursor-pointer">ShopFlow</h1>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/">
                <a className={`text-gray-600 hover:text-primary transition-colors ${location === '/' ? 'text-primary' : ''}`}>
                  Products
                </a>
              </Link>
              {user && (
                <Link href="/orders">
                  <a className={`text-gray-600 hover:text-primary transition-colors ${location === '/orders' ? 'text-primary' : ''}`}>
                    Orders
                  </a>
                </Link>
              )}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4 ml-6">
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 hidden sm:inline">
                    {user.firstName || user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-primary"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={onAuthModalOpen}
                  className="text-gray-600 hover:text-primary"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Account</span>
                </Button>
              )}
              
              <Button
                variant="ghost"
                onClick={onCartToggle}
                className="relative text-gray-600 hover:text-primary"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartItemCount}
                  </Badge>
                )}
                <span className="hidden sm:inline ml-2">Cart</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden ml-4"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-3 space-y-3">
            <Link href="/">
              <a className="block text-gray-600 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                Products
              </a>
            </Link>
            {user && (
              <Link href="/orders">
                <a className="block text-gray-600 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                  Orders
                </a>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
