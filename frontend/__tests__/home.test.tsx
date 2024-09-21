import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Home from '@/app/page';

jest.spyOn(console, 'error').mockImplementation(() => {});
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Home', () => {
  beforeEach(() => {
    mockedAxios.post.mockReset();
    jest.clearAllMocks();
  });

  const setupComponent = () => {
    render(<Home />);
    const fileInput = screen.getByLabelText('ファイルを選択') as HTMLInputElement;
    const uploadButton = screen.getByRole('button', { name: /アップロード/i });
    return { fileInput, uploadButton };
  };

  const createTestFile = () => new File(['test'], 'test.png', { type: 'image/png' });

  it('renders file input and upload button', () => {
    const { fileInput, uploadButton } = setupComponent();
    
    expect(fileInput).toBeInTheDocument();
    expect(uploadButton).toBeInTheDocument();
    expect(uploadButton).toBeEnabled();
  });

  it('allows file selection', () => {
    const { fileInput } = setupComponent();
    const file = createTestFile();
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(fileInput.files?.[0]).toBe(file);
  });

  it('uploads file and displays status', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        message: 'ファイルが正常にアップロードされました',
        file: { filename: '1726356094725_test-image.png' },
        url: 'http://localhost:3001/Images/1726356094725_test-image.png'
      }
    });

    const { fileInput, uploadButton } = setupComponent();
    const file = createTestFile();

    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      const statusElement = screen.getByTestId('upload-status');
      expect(statusElement).toHaveTextContent('アップロードステータス: ファイルが正常にアップロードされました');
    });

    const uploadedImage = await screen.findByAltText('Uploaded');
    expect(uploadedImage).toBeInTheDocument();
    expect(uploadedImage).toHaveAttribute('src', 'http://localhost:3001/Images/1726356094725_test-image.png');
  });

  it('displays "ファイルが選択されていません" when trying to upload without a file', async () => {
    const { uploadButton } = setupComponent();
    
    fireEvent.click(uploadButton);
  
    await waitFor(() => {
      const statusElement = screen.getByTestId('upload-status');
      expect(statusElement).toHaveTextContent('アップロードステータス: ファイルが選択されていません');
    });
  });

  it('displays error message when upload fails', async () => {
    const mockError = new Error('Network Error');
    mockedAxios.post.mockRejectedValue(mockError);
  
    const { fileInput, uploadButton } = setupComponent();
    const file = createTestFile();
  
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(uploadButton);
  
    await waitFor(() => {
      const statusElement = screen.getByTestId('upload-status');
      expect(statusElement).toHaveTextContent('アップロードステータス: アップロードエラーが発生しました');
    });
  
    expect(console.error).toHaveBeenCalledWith('アップロードエラー:', mockError);
  });
});