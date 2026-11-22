/** bcrypt consumes at most 72 UTF-8 bytes, which differs from character count
 * for Vietnamese passwords. Never silently truncate a newly chosen password. */
export function newPasswordError(password: string): string | null {
  if (password.length < 8 || password.length > 100) return "Mật khẩu phải có 8–100 ký tự.";
  if (new TextEncoder().encode(password).length > 72) return "Mật khẩu vượt giới hạn 72 byte UTF-8. Hãy dùng chuỗi ngắn hơn, đặc biệt khi có dấu tiếng Việt.";
  return null;
}
