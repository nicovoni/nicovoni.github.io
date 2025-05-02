    const body = document.body;
    const toggleBtn = document.querySelector('.theme-toggle');
    const toggleSound = new Audio('ding.mp3');
    toggleSound.volume = 0.4;

    function setThemeIcon(isDark) {
      toggleBtn.textContent = isDark ? '☀️' : '🌙';
    }

    function toggleTheme() {
      body.classList.toggle('dark');
      const isDark = body.classList.contains('dark');
      setThemeIcon(isDark);
      toggleSound.play().catch(() => {});
      showToast(`Tema ${isDark ? 'scuro' : 'chiaro'} attivato temporaneamente`);
    }

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500); // Durata visibilità toast
}


    (function applySystemTheme() {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) body.classList.add('dark');
      setThemeIcon(body.classList.contains('dark'));
    })();
