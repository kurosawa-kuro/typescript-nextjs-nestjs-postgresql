import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MicropostDetailModal } from '../../src/app/components/microposts/MicropostDetailModal';
import { Micropost } from '../../src/app/types/models';

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // objectFit を style オブジェクトに変換
    const { objectFit, ...rest } = props;
    return <img {...rest} style={{ objectFit }} />;
  },
}));

// Mock the next/link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('MicropostDetailModal', () => {
  const mockPost: Micropost = {
    id: 1,
    userId: 1,
    title: 'Test Micropost',
    userName: 'Test User',
    imagePath: 'test/image.jpg',
    userAvatarPath: 'test/avatar.jpg',
    categories: [{ id: 1, title: 'Test Category' }],
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
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('calls onClose when Close button is clicked', () => {
    render(<MicropostDetailModal post={mockPost} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders without main image when imagePath is not provided', () => {
    const postWithoutImage = { ...mockPost, imagePath: null };
    render(<MicropostDetailModal post={postWithoutImage} onClose={mockOnClose} />);

    expect(screen.queryByAltText('Test Micropost')).not.toBeInTheDocument();
  });

  it('uses normalized image path', () => {
    const postWithWindowsPath = { ...mockPost, imagePath: 'test\\image.jpg' };
    render(<MicropostDetailModal post={postWithWindowsPath} onClose={mockOnClose} />);

    const img = screen.getByAltText('Test Micropost');
    expect(img).toHaveAttribute('src', expect.stringContaining('test/image.jpg'));
  });

  it('renders avatar image when userAvatarPath is provided', () => {
    render(<MicropostDetailModal post={mockPost} onClose={mockOnClose} />);

    const avatarImg = screen.getByAltText("Test User's avatar");
    expect(avatarImg).toBeInTheDocument();
  });

  it('does not render avatar image when userAvatarPath is not provided', () => {
    const postWithoutAvatar = { ...mockPost, userAvatarPath: null };
    render(<MicropostDetailModal post={postWithoutAvatar} onClose={mockOnClose} />);

    expect(screen.queryByAltText("Test User's avatar")).not.toBeInTheDocument();
  });
});