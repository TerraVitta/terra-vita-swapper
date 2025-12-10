import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Auth from '@/pages/Auth';
import { supabase } from '@/integrations/supabase/client';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/integrations/supabase/client', async () => {
  const supabase = {
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: { success: true, reply: 'Hello there!' } })),
    },
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } }))
    }
  } as any;
  return { supabase };
});

describe('Auth Chatbot', () => {
  it('opens chatbot, types message and invokes supabase function', async () => {
    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );

    const openBtn = await screen.findByRole('button', { name: /open ai chat/i });
    await userEvent.click(openBtn);

    const input = await screen.findByPlaceholderText(/ask anything/i);
    await userEvent.type(input, 'Hello{Enter}');

    const reply = await screen.findByText(/Hello there!/i);
    expect(reply).toBeInTheDocument();
    expect((supabase as any).functions.invoke).toHaveBeenCalled();
  });
});

