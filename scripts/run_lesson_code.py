"""Chạy mọi khối ```python trong bài học có dòng 'Kết quả kỳ vọng ... `x`' và so khớp với output thật."""
import glob, re, subprocess, sys
pat = re.compile(r"```python\n(.*?)```\s*\n?Kết quả kỳ vọng[^`\n]*`([^`]+)`", re.S)
bad = n = 0
for f in sorted(glob.glob("content/lessons/*.md")):
    for code, exp in pat.findall(open(f).read()):
        n += 1; r = subprocess.run([sys.executable, "-c", code], capture_output=True, text=True, timeout=120)
        ok = r.returncode == 0 and r.stdout.strip() == exp.strip()
        print(("OK  " if ok else "LỆCH"), f, "| kỳ vọng:", exp, "| thực tế:", (r.stdout.strip() or r.stderr.strip()[-80:])); bad += (not ok)
print(f"{n} khối code đã kiểm tra, {bad} lệch"); sys.exit(1 if bad else 0)
