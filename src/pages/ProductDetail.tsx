import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Award, Leaf, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CartDrawer } from '@/components/CartDrawer';
import productsData from '@/data/products.json';
import { useState } from 'react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);

  const product = productsData.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate('/buyer')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency,
      image: product.image,
    });
    toast.success(`${product.title} added to cart! 🎉`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-theme">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 transition-theme">
        <div className="container flex items-center justify-between py-4">
          <Button variant="ghost" onClick={() => navigate('/buyer')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
          <div className="flex items-center gap-2">
            <CartDrawer />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Product Detail */}
      <main className="container py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg aspect-square">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 bg-background/80 backdrop-blur"
                onClick={() => {
                  setIsFavorite(!isFavorite);
                  toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
                }}
              >
                <Heart 
                  className={`h-5 w-5 transition-colors ${
                    isFavorite ? 'fill-red-500 text-red-500' : ''
                  }`} 
                />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
              <p className="text-muted-foreground text-lg">{product.short}</p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">
                {product.currency === 'INR' ? '₹' : 'AED'} {product.price.toFixed(2)}
              </span>
              <span className="text-muted-foreground">{product.currency}</span>
            </div>

            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 transition-theme">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Sustainability Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-primary">{product.eco_score}</div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${product.eco_score}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {product.eco_score >= 90
                        ? 'Excellent eco-friendly choice!'
                        : product.eco_score >= 80
                        ? 'Great sustainable option'
                        : 'Good eco-conscious pick'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-theme">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-primary" />
                  Why It's Eco-Friendly
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 leading-relaxed">{product.eco_reason}</p>
              </CardContent>
            </Card>

            <Button onClick={handleAddToCart} size="lg" className="w-full">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
