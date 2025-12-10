import { test, expect, _electron as electron } from '@playwright/test';
import { join } from 'path';

test('guest mode urls should be loaded', async () => {
    const app = await electron.launch({
        args: [join(__dirname, '../dist-electron/main.js')],
    });

    const page = await app.firstWindow();
    await page.waitForLoadState('domcontentloaded');

    // Verify Gemini URL (Default)
    await expect.poll(async () => {
        return await app.evaluate(async ({ BrowserWindow }) => {
            const win = BrowserWindow.getAllWindows()[0];
            const views = win.getBrowserViews();
            return views.length > 0 ? views[0].webContents.getURL() : '';
        });
    }).toContain('gemini.google.com');

    // Switch to ChatGPT
    await page.getByRole('button', { name: 'ChatGPT' }).click();
    await page.waitForTimeout(2000); // Wait for switch

    // Verify ChatGPT URL
    const chatgptUrl = await app.evaluate(async ({ BrowserWindow }) => {
        const win = BrowserWindow.getAllWindows()[0];
        const views = win.getBrowserViews();
        return views.length > 0 ? views[0].webContents.getURL() : null;
    });

    console.log('ChatGPT URL:', chatgptUrl);
    expect(chatgptUrl).toContain('chatgpt.com');

    // Switch to Perplexity
    await page.getByRole('button', { name: 'Perplexity' }).click();
    await page.waitForTimeout(2000);

    const perplexityUrl = await app.evaluate(async ({ BrowserWindow }) => {
        const win = BrowserWindow.getAllWindows()[0];
        const views = win.getBrowserViews();
        return views.length > 0 ? views[0].webContents.getURL() : null;
    });
    console.log('Perplexity URL:', perplexityUrl);
    expect(perplexityUrl).toContain('perplexity.ai');

    await app.close();
});
