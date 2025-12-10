import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BuyerDashboard from '@/pages/BuyerDashboard';
import { supabase } from '@/integrations/supabase/client';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '@/contexts/CartContext';

vi.mock('@/integrations/supabase/client', async () => {
  const supabase = {
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: { success: true, reply: 'Hello there!' } })),
    },
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } }))
    },
    from: vi.fn(() => ({ select: vi.fn(() => Promise.resolve({ data: [], error: null })) }))
  } as any;
  return { supabase };
});

vi.mock('@/hooks/useCart', () => ({ useCart: () => ({ addItem: vi.fn() }) }));

describe('Buyer Chatbot', () => {
  it('opens chatbot in buyer dashboard, types, and invokes supabase function', async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <BuyerDashboard />
        </CartProvider>
      </MemoryRouter>
    );

    const openBtn = await screen.findByRole('button', { name: /open ai chat/i });
    await userEvent.click(openBtn);

    const input = await screen.findByPlaceholderText(/ask anything/i);
    await userEvent.type(input, 'Hello buyer{Enter}');

    const reply = await screen.findByText(/Hello there!/i);
    expect(reply).toBeInTheDocument();
    expect((supabase as any).functions.invoke).toHaveBeenCalled();
  });
});
