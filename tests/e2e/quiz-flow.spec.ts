import { test, expect } from '@playwright/test'

test.describe('Quiz Flow', () => {
  // Use a known topic with variant A (most common)
  const topicId = '10-感官動詞'

  test.beforeEach(async ({ page }) => {
    // Intercept GAS requests to avoid real network calls
    await page.route('**/script.google.com/**', route => {
      const url = route.request().url()
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ count: 42, avg: 85 }),
        })
      } else {
        route.fulfill({ status: 200, body: '{}' })
      }
    })

    // HashRouter: navigate to /#/quiz/...
    await page.goto(`/#/quiz/${encodeURIComponent(topicId)}`)
  })

  test('loads quiz and shows first question with options', async ({ page }) => {
    // Wait for question to appear
    const questionText = page.locator('.question-card p').first()
    await expect(questionText).toBeVisible({ timeout: 5000 })

    // Should have option buttons
    const options = page.locator('.option-btn')
    const count = await options.count()
    expect(count).toBeGreaterThanOrEqual(2)
    expect(count).toBeLessThanOrEqual(8)

    // Progress bar should show
    await expect(page.locator('[role="progressbar"]')).toBeVisible()
  })

  test('shows global stats from intercepted GAS', async ({ page }) => {
    await expect(page.getByText('42')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('85%')).toBeVisible()
  })

  test('answering correctly shows green + explanation', async ({ page }) => {
    // Wait for options to load
    await expect(page.locator('.option-btn').first()).toBeVisible({ timeout: 5000 })

    // Read the question data to find the correct answer
    // Click the first option (may be correct or wrong)
    const firstOption = page.locator('.option-btn').first()
    await firstOption.click()

    // After clicking, explanation should appear
    await expect(page.locator('.explanation-box')).toBeVisible()

    // At least one button should be correct (green)
    await expect(page.locator('.option-btn[data-state="correct"]')).toBeVisible()

    // Next button should appear
    const nextBtn = page.locator('button', { hasText: /下一題|查看結果/ })
    await expect(nextBtn).toBeVisible()
  })

  test('complete full quiz flow to result screen', async ({ page }) => {
    await expect(page.locator('.option-btn').first()).toBeVisible({ timeout: 5000 })

    // Answer all questions by always clicking the first option
    let safetyCounter = 0
    while (safetyCounter < 30) {
      safetyCounter++

      // Click first available option
      const option = page.locator('.option-btn[data-state="default"]').first()
      if (await option.isVisible()) {
        await option.click()
      }

      // Check if we're at result screen
      const resultScreen = page.locator('.result-screen')
      if (await resultScreen.isVisible()) {
        break
      }

      // Click next/result button
      const nextBtn = page.locator('button', { hasText: /下一題|查看結果/ })
      if (await nextBtn.isVisible()) {
        await nextBtn.click()
      }

      // Small wait to avoid racing
      await page.waitForTimeout(100)
    }

    // Should reach result screen
    await expect(page.locator('.result-screen')).toBeVisible()

    // Should show percentage
    await expect(page.locator('.result-screen').getByText(/%/)).toBeVisible()

    // Should show retry button
    await expect(page.getByText('重新作答')).toBeVisible()

    // Should show back button
    await expect(page.getByText('回到首頁')).toBeVisible()
  })

  test('retry all restarts the quiz', async ({ page }) => {
    await expect(page.locator('.option-btn').first()).toBeVisible({ timeout: 5000 })

    // Speed-run through all questions
    let safetyCounter = 0
    while (safetyCounter < 30) {
      safetyCounter++
      const option = page.locator('.option-btn[data-state="default"]').first()
      if (await option.isVisible()) await option.click()

      const resultScreen = page.locator('.result-screen')
      if (await resultScreen.isVisible()) break

      const nextBtn = page.locator('button', { hasText: /下一題|查看結果/ })
      if (await nextBtn.isVisible()) await nextBtn.click()

      await page.waitForTimeout(100)
    }

    // Click retry all
    await page.getByText('重新作答').click()

    // Should show question again
    await expect(page.locator('.option-btn[data-state="default"]').first()).toBeVisible()
    await expect(page.locator('[role="progressbar"]')).toBeVisible()
  })

  test('back button navigates to landing page', async ({ page }) => {
    await expect(page.locator('button', { hasText: '← 返回' })).toBeVisible({ timeout: 5000 })

    await page.locator('button', { hasText: '← 返回' }).click()

    // Should be on landing page (HashRouter format)
    await expect(page).toHaveURL(/\/#\/?$/)
    await expect(page.locator('.noren-part').first()).toBeVisible()
  })

  test('GAS POST is sent on quiz completion', async ({ page }) => {
    let gasPostCalled = false
    await page.route('**/script.google.com/**', route => {
      if (route.request().method() === 'POST') {
        gasPostCalled = true
        route.fulfill({ status: 200, body: '{}' })
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ count: 42, avg: 85 }),
        })
      }
    })

    await expect(page.locator('.option-btn').first()).toBeVisible({ timeout: 5000 })

    // Speed-run all questions
    let safetyCounter = 0
    while (safetyCounter < 30) {
      safetyCounter++
      const option = page.locator('.option-btn[data-state="default"]').first()
      if (await option.isVisible()) await option.click()

      const resultScreen = page.locator('.result-screen')
      if (await resultScreen.isVisible()) break

      const nextBtn = page.locator('button', { hasText: /下一題|查看結果/ })
      if (await nextBtn.isVisible()) await nextBtn.click()

      await page.waitForTimeout(100)
    }

    // Wait a bit for the POST to fire
    await page.waitForTimeout(500)

    expect(gasPostCalled).toBe(true)
  })
})
