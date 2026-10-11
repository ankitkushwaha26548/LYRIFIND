/** Inline status message. kind = "error" | "success" | "info". */
export default function Alert({ kind = 'info', children }) {
  if (!children) return null;
  const styles = {
    error: 'border-red-300 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200',
    success: 'border-green-300 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200',
    info: 'border-slate-300 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  };
  return <div role={kind === 'error' ? 'alert' : 'status'} className={`mb-3 rounded-lg border px-3 py-2 text-sm ${styles[kind]}`}>{children}</div>;
}
