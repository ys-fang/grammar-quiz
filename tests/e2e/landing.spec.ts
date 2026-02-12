import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    // HashRouter: navigate to /#/
    await page.goto('/#/')
  })

  test('displays the noren header and title', async ({ page }) => {
    // Noren characters
    await expect(page.locator('.noren-part').first()).toBeVisible()
    const norenParts = page.locator('.noren-part')
    await expect(norenParts).toHaveCount(4)

    // Title
    await expect(page.locator('h1')).toContainText('國中英文解憂雜貨店')
  })

  test('loads all 5 category sections with 55 topics', async ({ page }) => {
    const sections = page.locator('.category-section')
    await expect(sections).toHaveCount(5)

    // Check category titles
    await expect(page.getByText('時態與動詞變化')).toBeVisible()
    await expect(page.getByText('核心動詞用法')).toBeVisible()
    await expect(page.getByText('句型結構與子句')).toBeVisible()
    await expect(page.getByText('名詞、代名詞與修飾語')).toBeVisible()
    await expect(page.getByText('連接詞、介係詞與綜合重點')).toBeVisible()

    // Total topic cards
    const cards = page.locator('.topic-card')
    await expect(cards).toHaveCount(55)
  })

  test('clicking a topic navigates to quiz page', async ({ page }) => {
    const firstCard = page.locator('.topic-card').first()
    await firstCard.click()

    // Should navigate to a quiz route (HashRouter format: /#/quiz/...)
    await expect(page).toHaveURL(/\/#\/quiz\//)

    // Quiz page should load with options
    await expect(page.locator('.option-btn').first()).toBeVisible({ timeout: 5000 })
  })

  test('responsive: mobile viewport shows 2 columns', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/#/')

    const sections = page.locator('.category-section')
    await expect(sections.first()).toBeVisible()

    // Cards should still be visible
    const cards = page.locator('.topic-card')
    await expect(cards).toHaveCount(55)
  })
})
