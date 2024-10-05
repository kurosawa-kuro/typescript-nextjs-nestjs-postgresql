
// __tests__/components/MicropostList.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MicropostList } from '../../src/app/components/microposts/MicropostList';
import { Micropost } from '../../src/app//types/models';

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt} src={props.src} />
  },
}));

describe('MicropostList', () => {
  const mockMicroposts: Micropost[] = [
    { id: 1, userId: 1, title: 'Test Post 1', userName: 'User 1', imagePath: '/test1.jpg' },
    { id: 2, userId: 2, title: 'Test Post 2', userName: 'User 2', imagePath: '/test2.jpg' },
  ];

  it('renders micropost cards correctly', () => {
    render(<MicropostList microposts={mockMicroposts} />);

    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
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

    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    expect(screen.queryByText('null')).not.toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });

  it('renders correct number of MicropostCard components', () => {
    render(<MicropostList microposts={mockMicroposts} />);

    const micropostCards = screen.getAllByRole('img');
    expect(micropostCards).toHaveLength(2);
  });
});