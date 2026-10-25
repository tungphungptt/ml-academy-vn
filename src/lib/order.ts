/** Đổi chỗ phần tử với láng giềng; trả về thứ tự id mới, hoặc null nếu không thể (đã ở đầu/cuối hoặc không tồn tại). */
export function reorder(ids: string[], id: string, dir: "up" | "down"): string[] | null {
  const i = ids.indexOf(id); if (i < 0) return null;
  const j = dir === "up" ? i - 1 : i + 1; if (j < 0 || j >= ids.length) return null;
  const a = ids.slice(); [a[i], a[j]] = [a[j], a[i]]; return a;
}
