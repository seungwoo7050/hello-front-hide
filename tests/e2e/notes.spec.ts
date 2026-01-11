import { test, expect } from '@playwright/test';

test.describe('Notes CRUD', () => {
  test('create → edit → delete a note', async ({ page }) => {
    await page.goto('/');

    // Create
    await page.getByRole('button', { name: '+ 새 노트' }).click();
    await page.getByPlaceholder('제목을 입력하세요').fill('E2E Note Title');
    await page.getByPlaceholder('내용을 입력하세요...').fill('E2E note content');
    await page.getByRole('button', { name: '저장' }).click();

    // Verify created in list
    await expect(page.getByText('E2E Note Title')).toBeVisible();

    // Open detail
    await page.getByText('E2E Note Title').click();
    await expect(page.getByText('E2E note content')).toBeVisible();

    // Edit
    await page.getByRole('button', { name: '수정' }).click();
    const newContent = 'Updated content from E2E';
    await page.getByPlaceholder('내용을 입력하세요...').fill(newContent);
    await page.getByRole('button', { name: '저장' }).click();

    // Verify update
    await expect(page.getByText(newContent)).toBeVisible();

    // Delete (accept confirm)
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: '삭제' }).click();

    // Verify removed
    await expect(page.getByText('E2E Note Title')).toHaveCount(0);
  });
});
