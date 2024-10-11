import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MicropostCard } from '../../src/app/components/microposts/MicropostCard';
import { Micropost } from '../../src/app/types/models';

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt} src={props.src} onClick={props.onClick} onError={props.onError} />
  },
}));

describe('MicropostCard', () => {
  const mockPost: Micropost = {
    id: 1,
    userId: 1,
    title: 'Test Post',
    userName: 'Test User',
    imagePath: 'test/image.jpg',
    userAvatarPath: 'test/avatar.jpg',
    categories: [{
      id: 1,
      title: 'abc'
    }],
  };

  it('renders post with image correctly', () => {
    render(<MicropostCard post={mockPost} />);
    expect(screen.getByAltText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('renders "No image available" when imagePath is not provided', () => {
    const postWithoutImage = { ...mockPost, imagePath: null };
    render(<MicropostCard post={postWithoutImage} />);
    expect(screen.getByText('No image available')).toBeInTheDocument();
  });

  // it('renders "No image available" when image fails to load', async () => {
  //   render(<MicropostCard post={mockPost} />);
  //   const img = screen.getByAltText('Test Post');
    
  //   fireEvent.error(img);

  //   expect(screen.getByText('No image available')).toBeInTheDocument();
  // });

  it('renders "Post not available" when post is undefined', () => {
    render(<MicropostCard post={undefined} />);
    expect(screen.getByText('Post not available')).toBeInTheDocument();
  });

  it('normalizes image path correctly', () => {
    const postWithWindowsPath = { ...mockPost, imagePath: 'test\\image.jpg' };
    render(<MicropostCard post={postWithWindowsPath} />);
    const img = screen.getByAltText('Test Post');
    expect(img).toHaveAttribute('src', expect.stringContaining('test/image.jpg'));
  });

  it('calls onClick when the card is clicked', () => {
    const onClickMock = jest.fn();
    render(<MicropostCard post={mockPost} onClick={onClickMock} />);
    fireEvent.click(screen.getByText('Test Post'));
    expect(onClickMock).toHaveBeenCalledWith(mockPost);
  });
});