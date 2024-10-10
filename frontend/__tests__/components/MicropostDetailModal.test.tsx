// __tests__/components/MicropostDetailModal.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MicropostDetailModal } from '../../src/app/components/microposts/MicropostDetailModal';
import { Micropost } from '../../src/app/types/models';

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

describe('MicropostDetailModal', () => {
  const mockPost: Micropost = {
    id: 1,
    userId: 1,
    title: 'Test Micropost',
    userName: 'Test User',
    imagePath: 'test/image.jpg',
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with correct content', () => {
    render(<MicropostDetailModal post={mockPost} onClose={mockOnClose} />);

    expect(screen.getByText('Test Micropost')).toBeInTheDocument();
    expect(screen.getByAltText('Test Micropost')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('calls onClose when Close button is clicked', () => {
    render(<MicropostDetailModal post={mockPost} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders without image when imagePath is not provided', () => {
    const postWithoutImage = { ...mockPost, imagePath: undefined };
    render(<MicropostDetailModal post={postWithoutImage} onClose={mockOnClose} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('uses normalized image path', () => {
    const postWithWindowsPath = { ...mockPost, imagePath: 'test\\image.jpg' };
    render(<MicropostDetailModal post={postWithWindowsPath} onClose={mockOnClose} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', expect.stringContaining('test/image.jpg'));
  });
});