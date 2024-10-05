import { test, expect, Page } from '@playwright/test';
import path from 'path';

// Constants
const CONFIG = {
  BASE_URL: 'http://localhost:3000',
  API_URL: 'http://localhost:3001',
  EMAIL: 'alice@example.com',
  PASSWORD: 'hashed_password_here',
  IMAGE_FILE_NAME: 'test.png',
};

// Helper functions
async function waitForElement(page: Page, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

// User actions
async function loginUser(page: Page): Promise<void> {
  await page.goto(CONFIG.BASE_URL);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByLabel('Email').fill(CONFIG.EMAIL);
  await page.getByLabel('Password').fill(CONFIG.PASSWORD);
  await page.locator('form').getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('Alice', { exact: true })).toBeVisible();
}

async function createPost(page: Page, postTitle: string): Promise<void> {
  await page.getByRole('button').first().click();
  const testImagePath = path.join(__dirname, 'test-data', CONFIG.IMAGE_FILE_NAME);
  await page.locator('input[type="file"]').setInputFiles(testImagePath);
  await page.getByLabel('Title').fill(postTitle);
  await page.getByRole('button', { name: 'Share' }).click();
  await page.waitForSelector('div[role="dialog"]', { state: 'hidden' });
}

async function verifyPost(page: Page, postTitle: string): Promise<void> {
  const newPost = page.locator(`h2:has-text("${postTitle}")`).first();
  await expect(newPost).toBeVisible();
  const postImage = page.locator(`img[alt="${postTitle}"]`).first();
  await expect(postImage).toBeVisible();
}

async function logoutUser(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
}

// Test setup
test.beforeEach(async ({ request }) => {
  try {
    await request.post(`${CONFIG.API_URL}/test/reset-db`);
  } catch (error) {
    console.error('Failed to reset database:', error);
    throw error;
  }
});

// Main test
test('User journey: Login, create a micropost, and logout', async ({ page }) => {
  const POST_TITLE = `Test Post ${Date.now()}`; // Unique title for each test run

  try {
    // Step 1: Login
    await loginUser(page);

    // Step 2: Create a new post
    await createPost(page, POST_TITLE);

    // Step 3: Verify the new post
    await verifyPost(page, POST_TITLE);

    // Step 4: Logout
    await logoutUser(page);
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
});