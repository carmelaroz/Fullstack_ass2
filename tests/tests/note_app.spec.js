const { test, describe, expect, beforeEach } = require('@playwright/test')

describe('Note app', () => {

  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('check change theme', async ({ page }) => {
    await page.getByRole('button', { name: 'Change Theme' }).click()
  })

  const register = async (page, thename, email, username, password) => {
    await page.getByRole('button', { name: 'Create User' }).click()
    const textboxes = await page.getByRole('textbox').all()
    await textboxes[0].fill(thename)
    await textboxes[1].fill(email)
    await textboxes[2].fill(username)
    await textboxes[3].fill(password)
    await page.getByRole('button', { name: 'register' }).click()
  }

  test('check create user', async ({ page }) => {
    await register(page, 'user 100', 'mail_100@gmail.com', 'username 100', 'password100')
  })

  const login = async (page, username, password)  => {
    await page.getByRole('button', { name: 'Login' }).click()
    await page.getByRole('textbox').first().fill(username)
    await page.getByRole('textbox').last().fill(password)
    await page.getByRole('button', { name: 'Log in' }).click()
  }

  test('check login', async ({ page }) => {
    // await register(page, 'user 1', 'mail_1@gmail.com', 'username 1', 'password1')
    await login(page, 'username 1', 'password1')
  })  

  describe('when logged in', () => {

    beforeEach(async ({ page }) => {
      // await register(page, 'user 5', 'mail_5@gmail.com', 'username 5', 'password5')
      await login(page, 'username 5', 'password5')
    })

    test('check create new note', async ({ page }) => {
      await page.getByRole('button', { name: 'Add new note' }).click()
      const textboxes = await page.getByRole('textbox').all()
      await textboxes[0].fill('10')
      await textboxes[1].fill('title 10')
      await textboxes[2].fill('content 10')
      await page.getByRole('button', { name: 'Save' }).click()
    })

    test('check logout', async ({ page }) => {
      await page.getByRole('button', {name: 'Logout'}).click()
    })
  })
})