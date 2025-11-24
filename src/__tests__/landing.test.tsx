import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Landing from '@/pages/Landing';

describe('Landing page image preview integration', () => {
  it('opens the image preview when a featured image is clicked', async () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const btn = screen.getByRole('button', { name: /preview image 1/i });
    expect(btn).toBeInTheDocument();

    await userEvent.click(btn);

    // The modal should render with an image alt text
    const modalImg = await screen.findByAltText(/featured 1/i);
    expect(modalImg).toBeInTheDocument();
  });
});
