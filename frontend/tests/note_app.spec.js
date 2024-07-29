
import { test, describe, expect, beforeEach } from '@playwright/test'

describe('Note app', () => {

  beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('check change theme', async ({ page }) => {
    const [message] = await Promise.all([
      page.waitForEvent('console', msg => msg.text() === 'theme has changed'),
      (async () => {
        await page.getByRole('button', { name: 'Change Theme' }).click()
      })()
    ]);
        expect(message.text()).toBe('theme has changed');
  })

  const register = async (page, thename, email, username, password) => {
    const [message] = await Promise.all([
      page.waitForEvent('console', msg => msg.text() === 'resigister successfully'),
      (async () => {
  
        const textboxes = await page.getByRole('textbox').all();
        await textboxes[0].fill(thename);
        await textboxes[1].fill(email);
        await textboxes[2].fill(username);
        await textboxes[3].fill(password);
  
        await page.getByRole('button', { name: 'register' }).click()
      })()
    ]);
        expect(message.text()).toBe('resigister successfully');
  }

  test('check create user', async ({ page }) => {
    await register(page, 'user 200', 'mail_200@gmail.com', 'username 200', 'password200')
  })

  const login = async (page, username, password)  => {
    const [message] = await Promise.all([
      page.waitForEvent('console', msg => msg.text() === 'Logged in successfully'),
      (async () => {

        const textboxes = await page.getByRole('textbox').all();
        await textboxes[4].fill(username);
        await textboxes[5].fill(password);
  
        await page.getByRole('button', { name: 'Login' }).click()
      })()
    ]);
        expect(message.text()).toBe('Logged in successfully');
  }

  test('check login', async ({ page }) => {
    await login(page, 'username 200', 'password200')
    
  })  

  describe('when logged in', () => {

    beforeEach(async ({ page }) => {
      await login(page, 'username 200', 'password200')
    })

    test('check create new note', async ({ page }) => {
      const [message] = await Promise.all([
        page.waitForEvent('console', msg => msg.text() === 'new note was created'),
        (async () => {
          await page.getByRole('button', { name: 'Add new note' }).click();
    
          const textboxes = await page.getByRole('textbox').all();
          await textboxes[0].fill('200')
          await textboxes[1].fill('title 200')
          await textboxes[2].fill('content 200')
    
          await page.getByRole('button', { name: 'Save' }).click()
        })()
      ]);
          expect(message.text()).toBe('new note was created');
    })

    test('check logout', async ({ page }) => {
      await page.getByRole('button', {name: 'Logout'}).click()

      const [message] = await Promise.all([
        page.waitForEvent('console', msg => msg.text() === 'Logged out successfully'),
        page.getByRole('button', { name: 'Logout' }).click(),
      ]);

      expect(message.text()).toBe('Logged out successfully');
    })
  })
})
