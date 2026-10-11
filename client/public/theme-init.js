// Runs before first paint: applies the saved theme so dark-mode users never see a white flash.
// Kept as an external file (not inline) so the server's Content-Security-Policy ("script-src 'self'") allows it.
try {
  var t = localStorage.getItem('lf_theme');
  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
} catch (e) { /* storage unavailable: fall back to light */ }
