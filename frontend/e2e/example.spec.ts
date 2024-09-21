import { test, expect } from '@playwright/test';
import path from 'path';

test('Image upload functionality', async ({ page }) => {
  // 定数定義
  const BASE_URL = 'http://localhost:3000/';
  const IMAGE_FILE_NAME = '2024-09-14_05h42_47.png';
  const UPLOAD_BUTTON_TEXT = 'アップロード';
  const UPLOADED_IMAGE_ALT_TEXT = 'Uploaded';
  const UPLOADED_IMAGE_HEADING = 'アップロードされた画像:';

  // テスト用画像のパス
  const testImagePath = path.join(__dirname, 'test-data', IMAGE_FILE_NAME);

  // ページへの遷移
  await page.goto(BASE_URL);

  // ファイル選択操作
  const fileInput = page.getByLabel('ファイルを選択');
  await fileInput.click();
  await fileInput.setInputFiles(testImagePath);

  // アップロードボタンのクリック
  const uploadButton = page.getByRole('button', { name: UPLOAD_BUTTON_TEXT });
  await uploadButton.click();

  // アップロードされた画像の確認
  const uploadedImage = page.getByRole('img', { name: UPLOADED_IMAGE_ALT_TEXT });
  await uploadedImage.click();

  // アップロード完了の見出し確認
  const uploadedHeading = page.getByRole('heading', { name: UPLOADED_IMAGE_HEADING });
  await uploadedHeading.click();

  // アサーション
  await expect(uploadedImage).toBeVisible();
  await expect(uploadedHeading).toBeVisible();
});