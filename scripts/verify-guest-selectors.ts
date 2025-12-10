import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true }); // Headless for speed, set false to debug
    const context = await browser.newContext();

    console.log('Checking Gemini Guest Mode...');
    const geminiPage = await context.newPage();
    await geminiPage.goto('https://gemini.google.com/');
    try {
        // Wait for potential redirect or load
        await geminiPage.waitForLoadState('networkidle');
        // Check for selector from main.ts
        const geminiSelector = await geminiPage.$('div[role="textbox"], div[contenteditable="true"], rich-textarea > div > div, .input-area');
        console.log(`Gemini Selector Found: ${!!geminiSelector}`);
    } catch (e) {
        console.log('Gemini Check Failed:', e.message);
    }

    console.log('Checking ChatGPT Guest Mode...');
    const chatgptPage = await context.newPage();
    await chatgptPage.goto('https://chatgpt.com/');
    try {
        await chatgptPage.waitForLoadState('networkidle');
        const chatgptSelector = await chatgptPage.$('#prompt-textarea, textarea[data-id="root"], div[contenteditable="true"]');
        console.log(`ChatGPT Selector Found: ${!!chatgptSelector}`);
    } catch (e) {
        console.log('ChatGPT Check Failed:', e.message);
    }

    await browser.close();
})();
