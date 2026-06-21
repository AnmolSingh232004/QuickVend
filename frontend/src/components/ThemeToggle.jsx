import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button onClick={() => setDark(!dark)} className="text-gray-600 hover:text-indigo-600 text-lg" title="Toggle theme">
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
