import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/app/page';

// fetchのモック
global.fetch = jest.fn();

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMicroposts = [
    { id: 1, userId: 1, title: 'Test Post', content: 'This is a test post', userName: 'Test User' },
  ];

  const setupComponent = () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/microposts')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMicroposts),
        });
      }
      return Promise.reject(new Error('not found'));
    });

    render(<Home />);
  };

  it('renders the Microposts heading', async () => {
    setupComponent();
    await waitFor(() => {
      expect(screen.getByText('Microposts')).toBeInTheDocument();
    });
  });

  it('renders the New Micropost button', async () => {
    setupComponent();
    await waitFor(() => {
      expect(screen.getByText('New Micropost')).toBeInTheDocument();
    });
  });

  it('opens the modal when New Micropost button is clicked', async () => {
    setupComponent();
    await waitFor(() => {
      fireEvent.click(screen.getByText('New Micropost'));
    });
    expect(screen.getByText('Create a new Micropost')).toBeInTheDocument();
  });

  it('renders micropost cards', async () => {
    setupComponent();
    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
      expect(screen.getByText('This is a test post')).toBeInTheDocument();
    });
  });

  it('submits a new micropost', async () => {
    setupComponent();
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ micropost: { id: 2, userId: 1, title: 'New Post', content: 'New content', userName: 'Test User' } }),
      })
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('New Micropost'));
    });

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Post' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'New content' } });

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText('Choose File') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByText('Post'));

    await waitFor(() => {
      expect(screen.getByText('New Post')).toBeInTheDocument();
      expect(screen.getByText('New content')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('handles error when fetching microposts fails', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.reject(new Error('Failed to fetch'))
    );

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Error fetching microposts. Please try again later.')).toBeInTheDocument();
    });
  });
});