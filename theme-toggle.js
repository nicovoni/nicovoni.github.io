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
      toast.textContent = message;
      toast.style.display = 'block';
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
          toast.style.display = 'none';
        }, 300);
      }, 2500);
    }

    (function applySystemTheme() {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) body.classList.add('dark');
      setThemeIcon(body.classList.contains('dark'));
    })();
