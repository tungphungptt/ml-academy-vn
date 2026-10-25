import { test, expect } from "@playwright/test";
test("luồng học chính: đăng ký, mở bài, hoàn thành, làm quiz, tải lại vẫn còn", async ({ page }) => {
  const email = `e2e${Date.now()}@example.com`;
  await page.goto("/register"); await page.getByLabel("Email").fill(email); await page.getByLabel(/Mật khẩu/).fill("matkhau-e2e-123");
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();
  await expect(page.getByRole("heading", { name: "Tiến độ của bạn" })).toBeVisible();
  await page.goto("/learn/gradient-descent"); await expect(page.getByRole("heading", { name: "Gradient Descent", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Đánh dấu hoàn thành" }).click(); await expect(page.getByRole("button", { name: /Đã hoàn thành/ })).toBeVisible();
  await page.reload(); await expect(page.getByRole("button", { name: /Đã hoàn thành/ })).toBeVisible();
  for (const fs of await page.locator("fieldset").all()) await fs.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Nộp bài" }).click(); await expect(page.getByText(/Điểm: \d+\/\d+/)).toBeVisible();
});
test("người dùng chưa đăng nhập không vào được /admin", async ({ page }) => {
  await page.goto("/admin"); await expect(page.getByText("Không tìm thấy trang")).toBeVisible();
});
test("tìm kiếm không phân biệt dấu", async ({ page }) => {
  await page.goto("/search?q=dao+ham"); await expect(page.getByRole("link", { name: /Đạo hàm/ }).first()).toBeVisible();
});
