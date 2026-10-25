"""Kiểm tra nội dung: file bài học tồn tại, quiz hợp lệ, nguồn là https, công thức $$ cân đối."""
import json, pathlib, re, sys
bad = []
cat = json.load(open("content/catalog.json")); n = 0
for co in cat["courses"]:
    for m in co["modules"]:
        for l in m["lessons"]:
            if isinstance(l, str): continue
            n += 1; f = pathlib.Path("content/lessons") / l["f"]
            if not f.exists(): bad.append(f"thiếu {f}"); continue
            txt = f.read_text()
            if txt.count("$$") % 2: bad.append(f"$$ lệch trong {f}")
            if re.search(r"lorem ipsum|TODO", txt, re.I): bad.append(f"placeholder trong {f}")
            if not l.get("src") or not all(s["url"].startswith("https://") for s in l["src"]): bad.append(f"nguồn lỗi: {l['s']}")
            q = pathlib.Path("content/quizzes") / (l["s"] + ".json")
            if not q.exists(): bad.append(f"thiếu quiz {q}"); continue
            for i, x in enumerate(json.load(open(q))):
                if not (0 <= x["correct"] < len(x["options"])) or not x["explanation"]: bad.append(f"quiz lỗi {q}#{i}")
print(f"{n} bài đầy đủ;", "LỖI: " + "; ".join(bad) if bad else "hợp lệ"); sys.exit(1 if bad else 0)
