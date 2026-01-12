import { test, expect } from '@playwright/test';

test.describe('Notes CRUD', () => {
  let consoleMessages: string[] = [];
  let failedRequests: string[] = [];
  let requests: string[] = [];
  const responses: string[] = [];
  let pageErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Collect console messages and failed requests for debugging
    consoleMessages = [];
    page.on('console', (msg) => {
      try {
        consoleMessages.push(`${msg.type()}: ${msg.text()}`);
      } catch (e) {
        // ignore collection errors but log for visibility
        console.debug('console listener error', e);
      }
    });

    failedRequests = [];
    page.on('requestfailed', (req) => {
      try {
        failedRequests.push(`${req.method()} ${req.url()} ${req.failure()?.errorText || ''}`);
      } catch (e) {
        console.debug('requestfailed listener error', e);
      }
    });

    // Also collect all requests and responses to inspect 200/404 statuses
    requests = [];
    page.on('request', (req) => {
      try {
        requests.push(`${req.method()} ${req.url()}`);
      } catch (e) {
        console.debug('request listener error', e);
      }
    });
    page.on('response', (res) => {
      try {
        responses.push(`${res.status()} ${res.url()}`);
      } catch (e) {
        console.debug('response listener error', e);
      }
    });

    // Capture page errors (runtime exceptions)
    pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err?.message || String(err)));
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      // Attach screenshot
      const screenshotPath = `test-results/${testInfo.title.replace(/[^a-z0-9-]/gi, '_')}-failure.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      await testInfo.attach('screenshot', { path: screenshotPath, contentType: 'image/png' });

      // Attach page HTML
      const html = await page.content();
      await testInfo.attach('page.html', { body: Buffer.from(html), contentType: 'text/html' });

      // Attach console logs
      await testInfo.attach('console.log', { body: Buffer.from(consoleMessages.join('\n') || 'No console messages'), contentType: 'text/plain' });

      // Attach failed requests
      await testInfo.attach('failed-requests', { body: Buffer.from(failedRequests.join('\n') || 'No failed requests'), contentType: 'text/plain' });

      // Attach all requests and responses
      await testInfo.attach('requests.log', { body: Buffer.from(requests.join('\n') || 'No requests'), contentType: 'text/plain' });
      await testInfo.attach('responses.log', { body: Buffer.from(responses.join('\n') || 'No responses'), contentType: 'text/plain' });

      // Attach page errors
      await testInfo.attach('page.errors', { body: Buffer.from((pageErrors.join('\n') || 'No page errors')), contentType: 'text/plain' });
    }
  });

  test('create → edit → delete a note', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.getByPlaceholder('example@email.com').fill('test@example.com');
    await page.getByPlaceholder('비밀번호를 입력하세요').fill('password123');
    await page.getByRole('button', { name: '로그인' }).click();

    // Wait for redirect to notes page
    await page.waitForURL('/notes');
    await page.waitForLoadState('networkidle');

    // Wait for the Create button to be available (longer timeout in CI)
    const createButton = page.getByRole('button', { name: '+ 새 노트' });
    await createButton.waitFor({ timeout: 15000 });

    // Create
    await createButton.click();
    await page.getByPlaceholder('제목을 입력하세요').fill('E2E Note Title');
    await page.getByPlaceholder('내용을 입력하세요...').fill('E2E note content');
    await page.getByRole('button', { name: '저장' }).click();

    // Verify created in list
    await expect(page.locator('h3').filter({ hasText: 'E2E Note Title' })).toBeVisible();

    // Open detail
    await page.locator('h3').filter({ hasText: 'E2E Note Title' }).click();
    const detailContent = page.getByTestId('note-detail-content');
    await expect(detailContent).toContainText('E2E note content');

    // Edit
    await page.getByRole('button', { name: '수정' }).click();
    const newContent = 'Updated content from E2E';
    await page.getByPlaceholder('내용을 입력하세요...').fill(newContent);
    await page.getByRole('button', { name: '저장' }).click();

    // Verify update
    await expect(detailContent).toContainText(newContent);

    // Delete (accept confirm)
    page.once('dialog', (dialog) => dialog.accept());
    const deleteButton = page.getByTestId('note-delete-button');
    await deleteButton.click();

    // Verify removed
    await expect(page.getByText('E2E Note Title')).toHaveCount(0);
  });
});
