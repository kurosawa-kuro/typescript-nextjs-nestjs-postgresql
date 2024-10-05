import { test, expect } from '@playwright/test';
import path from 'path';

test('Login and create a micropost with image', async ({ page }) => {
  // Constants
  const BASE_URL = 'http://localhost:3000';
  const EMAIL = 'alice@example.com';
  const PASSWORD = 'hashed_password_here';
  const IMAGE_FILE_NAME = 'test.png';
  const POST_TITLE = 'test';

  // Navigate to the home page
  await page.goto(BASE_URL);

  // Login process
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByLabel('Email').fill(EMAIL);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.locator('form').getByRole('button', { name: 'Login' }).click();

  // Verify login was successful
  await expect(page.getByText('Alice', { exact: true })).toBeVisible();

  // Create new post
  await page.getByRole('button').first().click();

  // Set up the file path
  const testImagePath = path.join(__dirname, 'test-data', IMAGE_FILE_NAME);

  // Upload the image
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testImagePath);

  // Enter the post title
  await page.getByLabel('Title').fill(POST_TITLE);

  // Share the post
  await page.getByRole('button', { name: 'Share' }).click();

  // Verify the new post appears
  await expect(page.getByRole('heading', { name: POST_TITLE })).toBeVisible();
});