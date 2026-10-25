// Chạy Python (Pyodide) trong Web Worker để không làm đơ giao diện; luồng chính có thể terminate() khi quá thời gian.
const BASE = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/";
let py = null;
self.onmessage = async ({ data: { code, packages } }) => {
  const out = [];
  try {
    if (!py) { importScripts(BASE + "pyodide.js"); py = await loadPyodide({ indexURL: BASE }); }
    await py.loadPackage(packages || []);
    py.setStdout({ batched: s => out.push(s) }); py.setStderr({ batched: s => out.push(s) });
    await py.runPythonAsync(code, { globals: py.globals.get("dict")() }); // namespace mới cho mỗi lần chạy
    self.postMessage({ type: "done", out: out.join("\n") });
  } catch (err) { self.postMessage({ type: "error", out: out.join("\n"), message: String((err && err.message) || err) }); }
};
