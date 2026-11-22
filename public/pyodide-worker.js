// Chạy Python (Pyodide) trong Web Worker để không làm đơ giao diện; luồng chính có thể terminate() khi quá thời gian.
const BASE = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/";
let py = null;
self.onmessage = async ({ data: { code, packages } }) => {
  const out = [];
  try {
    if (!py) { self.postMessage({ type: "status", phase: "loading-runtime" }); importScripts(BASE + "pyodide.js"); py = await loadPyodide({ indexURL: BASE }); }
    self.postMessage({ type: "status", phase: "loading-packages" });
    await py.loadPackage(packages || []);
    const missing = (packages || []).filter(name => !(name in py.loadedPackages));
    if (missing.length) throw new Error(`Chưa tải được thư viện: ${missing.join(", ")}. Hãy kiểm tra kết nối và thử lại.`);
    self.postMessage({ type: "status", phase: "running" });
    py.setStdout({ batched: s => out.push(s) }); py.setStderr({ batched: s => out.push(s) });
    const dict = py.globals.get("dict");
    const globals = dict(); // namespace mới cho mỗi lần chạy
    try {
      const result = await py.runPythonAsync(code, { globals });
      // runPythonAsync may return an owned PyProxy for a final expression.
      if (result && typeof result.destroy === "function") result.destroy();
    } finally { globals.destroy(); dict.destroy(); }
    self.postMessage({ type: "done", out: out.join("\n") });
  } catch (err) { self.postMessage({ type: "error", out: out.join("\n"), message: String((err && err.message) || err) }); }
};
