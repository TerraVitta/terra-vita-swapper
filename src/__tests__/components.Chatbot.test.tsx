import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chatbot } from '@/components/Chatbot';

describe('Chatbot', () => {
  beforeEach(() => {
    // Mock global fetch
    (global as any).fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: async () => ({ success: true, reply: 'Hello!' })
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends chat request with function secret header when submitting a message', async () => {
    // Provide an env value for function secret used inside the component
    (import.meta as any).env = { VITE_SUPABASE_URL: 'https://supabase.test', VITE_SUPABASE_PUBLISHABLE_KEY: 'pk.test', VITE_FUNCTION_SECRET: 'secret.test' };

    render(<Chatbot />);

    const input = screen.getByPlaceholderText(/ask anything/i);
    await userEvent.type(input, 'Hello');

    const sendButton = screen.getByRole('button', { name: /send/i }) || screen.getByRole('button', { hidden: true });
    // Submit the form
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalled();
    });

    const calledWith = (global as any).fetch.mock.calls[0];
    const headers = calledWith[1].headers;

    expect(headers['x-function-secret']).toBe('secret.test');
    expect(headers['Authorization']).toContain('pk.test');
  });
});
