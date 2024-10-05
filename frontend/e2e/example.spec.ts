import { test, expect } from '@playwright/test';
import path from 'path';

test.beforeEach(async ({ request }) => {
  // Clean up the database before each test
  await request.post(`http://localhost:3001/test/reset-db`);
});

test('Login and create a micropost with image', async ({ page }) => {
  // Constants
  const BASE_URL = 'http://localhost:3000';
  const EMAIL = 'alice@example.com';
  const PASSWORD = 'hashed_password_here';
  const IMAGE_FILE_NAME = 'test.png';
  const POST_TITLE = `Test Post ${Date.now()}`; // Unique title for each test run

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

  // Wait for the modal to close
  await page.waitForSelector('div[role="dialog"]', { state: 'hidden' });

  // Verify the new post appears (look for the most recent post with the unique title)
  const newPost = page.locator(`h2:has-text("${POST_TITLE}")`).first();
  await expect(newPost).toBeVisible();

  // Optionally, verify the image is visible
  const postImage = page.locator(`img[alt="${POST_TITLE}"]`).first();
  await expect(postImage).toBeVisible();
});