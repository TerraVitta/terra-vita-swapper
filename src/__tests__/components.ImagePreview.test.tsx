import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImagePreview from '@/components/ImagePreview';

describe('ImagePreview', () => {
  it('renders when open and calls onClose on background click', async () => {
    const onClose = vi.fn();
    render(<ImagePreview src="/test.jpg" alt="test" isOpen={true} onClose={onClose} caption="Caption" />);

    const img = screen.getByAltText('test');
    expect(img).toBeInTheDocument();

    // click background overlay to close
    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when escape is pressed', async () => {
    const onClose = vi.fn();
    render(<ImagePreview src="/test.jpg" alt="test" isOpen={true} onClose={onClose} />);

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    const onClose = vi.fn();
    const { container } = render(<ImagePreview src="/test.jpg" alt="test" isOpen={false} onClose={onClose} />);
    expect(container).toBeEmptyDOMElement();
  });
});
