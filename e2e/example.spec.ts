import { test, expect, _electron as electron } from '@playwright/test';
import { join } from 'path';

test('app should launch and have correct title', async () => {
    const app = await electron.launch({
        args: [join(__dirname, '../dist-electron/main.js')],
    });

    const page = await app.firstWindow();

    // Wait for the app to load
    await page.waitForLoadState('domcontentloaded');

    const title = await page.title();
    expect(title).toBe('prompt_builder');

    // Checking if the main root element exists
    await expect(page.locator('#root')).toBeVisible();

    await app.close();
});
