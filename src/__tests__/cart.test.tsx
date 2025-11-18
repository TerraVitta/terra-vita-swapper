import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider } from '@/contexts/CartContext';
import { useCart } from '@/hooks/useCart';

function TestComponent() {
  const { items, addItem, itemCount } = useCart();
  return (
    <div>
      <div data-testid="count">{itemCount}</div>
      <button onClick={() => addItem({ id: 'test', title: 'Test', price: 1, currency: 'INR', image: '' })}>Add</button>
      <ul>
        {items.map(i => (
          <li key={i.id}>{i.title}</li>
        ))}
      </ul>
    </div>
  );
}

describe('CartProvider', () => {
  it('updates itemCount when adding item', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const btn = screen.getByRole('button', { name: /add/i });
    const count = screen.getByTestId('count');
    expect(count.textContent).toBe('0');

    await userEvent.click(btn);
    expect(count.textContent).toBe('1');

    await userEvent.click(btn);
    expect(count.textContent).toBe('2');
  });
});
