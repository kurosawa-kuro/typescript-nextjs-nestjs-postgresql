import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MicropostModalContainer } from '../../../src/app/components/containers/MicropostModalContainer';
import * as createMicropostModule from '../../../src/app/actions/createMicropost';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../src/app/actions/createMicropost', () => ({
  createMicropost: jest.fn(),
}));

// MicropostModalのモックを簡略化
jest.mock('../../../src/app/components/microposts/MicropostModal', () => ({
  MicropostModal: ({ onSubmit, onImageChange, setTitle, error }: any) => (
    <form onSubmit={onSubmit} data-testid="micropost-form">
      <input type="text" onChange={(e) => setTitle(e.target.value)} data-testid="title-input" />
      <input type="file" onChange={onImageChange} data-testid="image-input" />
      <button type="submit" data-testid="submit-button">Submit</button>
      {error && <p data-testid="error-message">{error}</p>}
    </form>
  ),
}));

describe('MicropostModalContainer', () => {
  const mockRouter = { refresh: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
  });

  it('submits form data correctly', async () => {
    (createMicropostModule.createMicropost as jest.Mock).mockResolvedValue({ success: true });

    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

    // フォームに入力
    fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Test Post with Image' } });
    const file = new File(['test image content'], 'test.png', { type: 'image/png' });
    fireEvent.change(screen.getByTestId('image-input'), { target: { files: [file] } });

    // フォームを送信
    fireEvent.submit(screen.getByTestId('micropost-form'));

    await waitFor(() => {
      // createMicropostが呼び出されたことを確認
      expect(createMicropostModule.createMicropost).toHaveBeenCalled();

      // createMicropostに渡されたFormDataの内容を確認
      const calledFormData = (createMicropostModule.createMicropost as jest.Mock).mock.calls[0][0];
      expect(calledFormData.get('title')).toBe('Test Post with Image');
      expect(calledFormData.get('userId')).toBe('1');
      expect(calledFormData.get('image')).toBeInstanceOf(File);
      expect((calledFormData.get('image') as File).name).toBe('test.png');

      // その他の期待される動作を確認
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it('handles form submission error', async () => {
    (createMicropostModule.createMicropost as jest.Mock).mockResolvedValue({ success: false, error: 'Submission failed' });

    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

    fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Test Post' } });
    fireEvent.submit(screen.getByTestId('micropost-form'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Submission failed');
    });
  });

  it('handles "User not found" error', async () => {
    localStorage.removeItem('user');

    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

    fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Test Post' } });
    fireEvent.submit(screen.getByTestId('micropost-form'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('User not found');
    });
  });

  it('handles specific error from createMicropost', async () => {
    (createMicropostModule.createMicropost as jest.Mock).mockResolvedValue({ success: false, error: 'Failed to create micropost' });

    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

    fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Test Post' } });
    fireEvent.submit(screen.getByTestId('micropost-form'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to create micropost');
    });
  });

  it('handles generic error during micropost creation', async () => {
    (createMicropostModule.createMicropost as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<MicropostModalContainer isOpen={true} onClose={() => {}} />);

    fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Test Post' } });
    fireEvent.submit(screen.getByTestId('micropost-form'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('An error occurred while creating the micropost');
    });
  });
});