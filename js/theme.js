// theme.js — controle de dark / light mode

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("themeToggle");
  const html = document.documentElement;

  if (!toggle) return;

  // aplica tema salvo
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    html.classList.add("dark");
    toggle.textContent = "☀️";
  } else {
    toggle.textContent = "🌙";
  }

  // clique no botão
  toggle.addEventListener("click", () => {
    html.classList.toggle("dark");

    const isDark = html.classList.contains("dark");
    toggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
});
// ===== MENU MOBILE =====
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const menuClose = document.getElementById("menuClose");
  const mobileMenu = document.getElementById("mobileMenu");

  if (!menuToggle || !menuClose || !mobileMenu) return;

  const openMenu = () => {
    mobileMenu.classList.remove("hidden");
    requestAnimationFrame(() => {
      mobileMenu.classList.remove("translate-x-[-100%]");
      mobileMenu.classList.add("translate-x-0");
    });
    document.body.classList.add("overflow-hidden");
  };

  const closeMenu = () => {
    mobileMenu.classList.remove("translate-x-0");
    mobileMenu.classList.add("translate-x-[-100%]");
    document.body.classList.remove("overflow-hidden");

    setTimeout(() => {
      mobileMenu.classList.add("hidden");
    }, 300);
  };

  menuToggle.addEventListener("click", openMenu);
  menuClose.addEventListener("click", closeMenu);
});

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('siteHeader');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    // SHRINK
    if (currentScroll > 80) {
      header.classList.add('py-3');
      header.classList.remove('py-5');
    } else {
      header.classList.add('py-5');
      header.classList.remove('py-3');
    }

    // ESCONDE AO DESCER / MOSTRA AO SUBIR
    if (currentScroll > lastScrollY && currentScroll > 120) {
      header.style.transform = 'translateY(-100%)';
    } else {
      header.style.transform = 'translateY(0)';
    }

    lastScrollY = currentScroll;
  });
});
