import { ShoppingCart, Minus, Plus, Trash2, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Badge } from './ui/badge';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

export function CartDrawer() {
  const { items, updateQuantity, removeItem, clearCart, total, itemCount } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    toast.success('Checkout feature coming soon!');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative border-primary/50 hover:bg-primary/10">
          <ShoppingCart className="h-5 w-5 text-primary" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({itemCount} items)
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <>
              {items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 border border-border rounded-lg bg-card/40 backdrop-blur-sm">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{item.title}</h3>
                    <p className="text-sm text-accent font-bold">
                      {item.currency === 'INR' ? '₹' : 'AED'} {item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                        onClick={() => {
                          removeItem(item.id);
                          toast.success('Item removed from cart');
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Subtotal:</span>
                  <span className="text-accent">
                    {items[0]?.currency === 'INR' ? '₹' : 'AED'} {total.toFixed(2)}
                  </span>
                </div>
                
                <Button onClick={handleCheckout} className="w-full" size="lg">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to Checkout
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    clearCart();
                    toast.success('Cart cleared');
                  }}
                >
                  Clear Cart
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
