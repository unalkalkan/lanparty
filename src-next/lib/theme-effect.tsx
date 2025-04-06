// This script is executed immediately before render to prevent flash of wrong theme
export function ThemeEffect() {
  const themeScript = `
    (function() {
      function getThemePreference() {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
          return localStorage.getItem('theme');
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }

      const theme = getThemePreference();
      
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      document.documentElement.style.colorScheme = theme;
    })()
  `;

  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
} 