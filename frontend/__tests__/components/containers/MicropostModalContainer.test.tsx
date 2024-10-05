// __tests__/components/containers/MicropostModalContainer.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MicropostModalContainer } from '../../../src/app/components/containers/MicropostModalContainer';
import * as usePostFormModule from '../../../src/app/hooks/usePostForm';
import * as createMicropostModule from '../../../src/app/actions/createMicropost';
import { useRouter } from 'next/navigation';

// Mocking modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../src/app/hooks/usePostForm', () => ({
  usePostForm: jest.fn(),
}));

jest.mock('../../../src/app/actions/createMicropost', () => ({
  createMicropost: jest.fn(),
}));

jest.mock('../../../src/app/components/microposts/MicropostModal', () => ({
  MicropostModal: ({ onSubmit, onImageChange, setTitle }: any) => (
    <div>
      <input type="text" onChange={(e) => setTitle(e.target.value)} data-testid="title-input" />
      <input type="file" onChange={onImageChange} data-testid="image-input" />
      <button onClick={onSubmit} data-testid="submit-button">Submit</button>
    </div>
  ),
}));

describe('MicropostModalContainer', () => {
  const mockRouter = { refresh: jest.fn() };
  const mockSetFormTitle = jest.fn();
  const mockSetFormImage = jest.fn();
  const mockResetForm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePostFormModule.usePostForm as jest.Mock).mockReturnValue({
      formTitle: '',
      setFormTitle: mockSetFormTitle,
      formImage: null,
      setFormImage: mockSetFormImage,
      resetForm: mockResetForm,
    });
    localStorage.clear();
  });

  it('renders the MicropostModal when isOpen is true', () => {
    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);
    expect(screen.getByTestId('title-input')).toBeInTheDocument();
    expect(screen.getByTestId('image-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

//   it('does not render the MicropostModal when isOpen is false', () => {
//     render(<MicropostModalContainer isOpen={false} onClose={() => {}} />);
//     expect(screen.queryByTestId('title-input')).not.toBeInTheDocument();
//   });

  it('handles form submission successfully', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
    (createMicropostModule.createMicropost as jest.Mock).mockResolvedValue({ success: true });

    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

    fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Test Post' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(createMicropostModule.createMicropost).toHaveBeenCalled();
      expect(mockResetForm).toHaveBeenCalled();
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

//   it('handles form submission error', async () => {
//     localStorage.setItem('user', JSON.stringify({ id: 1 }));
//     (createMicropostModule.createMicropost as jest.Mock).mockResolvedValue({ 
//       success: false, 
//       error: 'Failed to create micropost' 
//     });

//     render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

//     fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Test Post' } });
//     fireEvent.click(screen.getByTestId('submit-button'));

//     await waitFor(() => {
//       expect(createMicropostModule.createMicropost).toHaveBeenCalled();
//       expect(screen.getByText('Failed to create micropost')).toBeInTheDocument();
//     });
//   });

  it('handles image change', () => {
    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    fireEvent.change(screen.getByTestId('image-input'), { target: { files: [file] } });

    expect(mockSetFormImage).toHaveBeenCalledWith(file);
  });

//   it('handles missing user error', async () => {
//     render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

//     fireEvent.click(screen.getByTestId('submit-button'));

//     await waitFor(() => {
//       expect(screen.getByText('User not found')).toBeInTheDocument();
//     });
//   });
});