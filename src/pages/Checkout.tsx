import React, { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const { items, total, itemCount, clearCart } = useCart();
  const [selectedCard, setSelectedCard] = useState('test-4242');
  const navigate = useNavigate();

  const handlePlaceOrder = () => {
    // Simplified checkout: clear cart and show success toast
    clearCart();
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Payment</h2>
          <Card className="p-4">
            <div className="flex gap-2 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="card"
                  checked={selectedCard === 'test-4242'}
                  onChange={() => setSelectedCard('test-4242')}
                />
                <span className="font-medium">Test Card •••• 4242</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium">Cardholder Name</label>
              <Input placeholder="Jane Doe" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium">Expiry</label>
                <Input placeholder="02/28" />
              </div>
              <div>
                <label className="block text-sm font-medium">CVC</label>
                <Input placeholder="424" />
              </div>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Items ({itemCount})</span>
                <span className="font-semibold">{items[0]?.currency === 'INR' ? '₹' : 'AED'} {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span>
                  {selectedCard === 'test-4242' ? 'Test Card •••• 4242' : '•••• 4242'}
                </span>
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={handlePlaceOrder} className="w-full">Place order</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
