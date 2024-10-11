// __tests__/components/MicropostList.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MicropostList } from '../../src/app/components/microposts/MicropostList';
import { Micropost, Category } from '../../src/app/types/models';

// Mock the child components
jest.mock('../../src/app/components/microposts/MicropostCard', () => ({
  MicropostCard: ({ post, onClick }: { post: Micropost; onClick: () => void }) => (
    <div data-testid={`micropost-card-${post.id}`} onClick={onClick}>
      {post.title}
    </div>
  ),
}));

jest.mock('../../src/app/components/microposts/MicropostDetailModal', () => ({
  MicropostDetailModal: ({ post, onClose }: { post: Micropost; onClose: () => void }) => (
    <div data-testid="micropost-detail-modal">
      <h2 data-testid="modal-title">{post.title}</h2>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('MicropostList', () => {
  const mockMicroposts: Micropost[] = [
    { id: 1, userId: 1, title: 'Test Post 1', userName: 'User 1', imagePath: '/test1.jpg', userAvatarPath: '/avatar1.jpg', categories: ['Category1' as unknown as Category] },
    { id: 2, userId: 2, title: 'Test Post 2', userName: 'User 2', imagePath: '/test2.jpg', userAvatarPath: '/avatar2.jpg', categories: ['Category2' as unknown as Category] },
  ];

  it('renders micropost cards correctly', () => {
    render(<MicropostList microposts={mockMicroposts} />);

    expect(screen.getByTestId('micropost-card-1')).toHaveTextContent('Test Post 1');
    expect(screen.getByTestId('micropost-card-2')).toHaveTextContent('Test Post 2');
  });

  it('displays "No posts available" when microposts array is empty', () => {
    render(<MicropostList microposts={[]} />);

    expect(screen.getByText('No posts available')).toBeInTheDocument();
  });

  it('handles invalid micropost objects gracefully', () => {
    const invalidMicroposts = [
      ...mockMicroposts,
      null,
      undefined,
      {} as Micropost, // Invalid object without id
    ];

    render(<MicropostList microposts={invalidMicroposts as Micropost[]} />);

    expect(screen.getByTestId('micropost-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('micropost-card-2')).toBeInTheDocument();
    expect(screen.queryAllByTestId(/micropost-card-/)).toHaveLength(2);
  });

  it('renders correct number of MicropostCard components', () => {
    render(<MicropostList microposts={mockMicroposts} />);

    const micropostCards = screen.getAllByTestId(/micropost-card-/);
    expect(micropostCards).toHaveLength(2);
  });

  it('opens MicropostDetailModal when a post is clicked', () => {
    render(<MicropostList microposts={mockMicroposts} />);

    fireEvent.click(screen.getByTestId('micropost-card-1'));

    expect(screen.getByTestId('micropost-detail-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Test Post 1');
  });

  it('closes MicropostDetailModal when close button is clicked', () => {
    render(<MicropostList microposts={mockMicroposts} />);

    fireEvent.click(screen.getByTestId('micropost-card-1'));
    expect(screen.getByTestId('micropost-detail-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('micropost-detail-modal')).not.toBeInTheDocument();
  });

  it('updates selectedPost state when a post is clicked', () => {
    render(<MicropostList microposts={mockMicroposts} />);

    fireEvent.click(screen.getByTestId('micropost-card-2'));

    expect(screen.getByTestId('micropost-detail-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Test Post 2');
  });
});