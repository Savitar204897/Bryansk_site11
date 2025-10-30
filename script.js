// ---------- БУРГЕР-МЕНЮ ----------
const burger = document.getElementById("burger");
const navbar = document.getElementById("navbar");
if (burger) {
  burger.addEventListener("click", () => {
    navbar.classList.toggle("show");
  });
}

// ---------- ПЛАВНОЕ ПОЯВЛЕНИЕ ПРИ ПЕРВОМ ВХОДЕ ----------
document.addEventListener("DOMContentLoaded", () => {
  const fadeEls = document.querySelectorAll(".fade-in, .news-card, .event-card, .award-card, .partner-card");

  // Проверяем, была ли анимация уже показана ранее
  const alreadyAnimated = sessionStorage.getItem("fadeShown");

  if (!alreadyAnimated) {
    // Плавное появление при первом заходе
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    fadeEls.forEach(el => observer.observe(el));

    // Помечаем, что анимация уже была
    sessionStorage.setItem("fadeShown", "true");
  } else {
    // Если пользователь уже был — всё сразу видимо
    fadeEls.forEach(el => el.classList.add("visible"));
  }
});

// ---------- ЭФФЕКТ НАВЕДЕНИЯ ДЛЯ КАРТОЧЕК ----------
document.addEventListener("mouseover", e => {
  const card = e.target.closest(".news-card, .event-card, .award-card, .partner-card");
  if (card) card.classList.add("hovered");
});
document.addEventListener("mouseout", e => {
  const card = e.target.closest(".news-card, .event-card, .award-card, .partner-card");
  if (card) card.classList.remove("hovered");
});

// ---------- ПОИСК (умный: локальный или глобальный) ----------
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const suggestionsBox = document.getElementById("searchSuggestions");
  if (!searchInput || !suggestionsBox) return;

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // --- Глобальные данные (для index.html и about.html) ---
  const globalData = [
    { title: "Главная — Ассоциация ветеранов", href: "index.html" },
    { title: "О Ассоциации", href: "about.html" },
    { title: "Новости", href: "news.html" },
    { title: "Мероприятия", href: "events.html" },
    { title: "Партнёры", href: "partners.html" },
    { title: "Награды", href: "awards.html" },
    { title: "Контакты Ассоциации", href: "about.html#contacts" },
    { title: "Ассоциация ветеранов — поддержка и память", href: "about.html" },
  ];

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const isGlobalPage = currentPage === "index.html" || currentPage === "about.html";

  function getLocalData() {
    let nodes = [];
    let type = "other";

    if (currentPage.includes("news")) {
      nodes = Array.from(document.querySelectorAll(".news-card"));
      type = "news";
    } else if (currentPage.includes("events")) {
      nodes = Array.from(document.querySelectorAll(".event-card"));
      type = "events";
    } else if (currentPage.includes("awards")) {
      nodes = Array.from(document.querySelectorAll(".award-card"));
      type = "awards";
    } else {
      nodes = Array.from(document.querySelectorAll("h1, h2, h3"));
    }

    return nodes.map(el => {
      let title = el.querySelector("h3, h2, h1")?.textContent?.trim() || el.textContent.trim();
      let id = el.dataset?.id || null;
      let href = null;
      const link = el.querySelector("a[href]");
      if (link) href = link.getAttribute("href");

      return { title, element: el, href, id, type };
    }).filter(x => x.title);
  }

  function showSuggestions(query) {
    suggestionsBox.innerHTML = "";
    const q = query.trim().toLowerCase();
    if (!q) {
      suggestionsBox.style.display = "none";
      return;
    }

    const data = isGlobalPage ? globalData : getLocalData();
    const matches = data.filter(item => item.title.toLowerCase().includes(q));
    const max = 8;
    const regex = new RegExp("(" + escapeRegExp(q) + ")", "ig");

    if (matches.length === 0) {
      suggestionsBox.innerHTML = "<li class='no-result'>Совпадений не найдено</li>";
      suggestionsBox.style.display = "block";
      return;
    }

    matches.slice(0, max).forEach(item => {
      const li = document.createElement("li");
      const safeTitle = item.title
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      li.innerHTML = safeTitle.replace(regex, "<mark>$1</mark>");
      li.addEventListener("click", () => openResult(item));
      suggestionsBox.appendChild(li);
    });

    suggestionsBox.style.display = "block";
  }

  function openResult(item) {
    if (isGlobalPage) {
      if (item.href) window.location.href = item.href;
    } else {
      let url = null;
      if (item.href) {
        url = item.href;
      } else if (item.type === "news" && item.id) {
        url = `news-detail.html?id=${item.id}`;
      } else if (item.type === "events" && item.id) {
        url = `event.html?id=${item.id}`;
      } else if (item.type === "awards" && item.id) {
        url = `award.html?id=${item.id}`;
      }

      if (url) {
        window.location.href = url;
      } else {
        item.element.scrollIntoView({ behavior: "smooth", block: "center" });
        item.element.classList.add("highlight");
        setTimeout(() => item.element.classList.remove("highlight"), 1500);
      }
    }
  }

  let timer = null;
  searchInput.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => showSuggestions(searchInput.value), 150);
  });

  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") e.preventDefault();
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".search-container")) {
      suggestionsBox.style.display = "none";
    }
  });
});
// ---------- ПЛАВНОЕ ПОЯВЛЕНИЕ HEADER И FOOTER ----------
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");

  // Проверяем, была ли уже показана анимация
  const headerShown = sessionStorage.getItem("headerShown");
  const footerShown = sessionStorage.getItem("footerShown");

  if (header && !headerShown) {
    header.classList.add("slide-down");
    sessionStorage.setItem("headerShown", "true");
  } else if (header) {
    header.classList.add("visible");
  }

  if (footer && !footerShown) {
    footer.classList.add("slide-up");
    sessionStorage.setItem("footerShown", "true");
  } else if (footer) {
    footer.classList.add("visible");
  }
});
// Гамбургер меню с анимацией
const hamburgerMenu = document.getElementById("hamburgerMenu");
const hamburgerIcon = document.getElementById("hamburgerIcon");
const hamburgerContent = document.getElementById("hamburgerContent");

hamburgerIcon.addEventListener("click", () => {
  hamburgerMenu.classList.toggle("active");
});
<script>
document.addEventListener("DOMContentLoaded", function() {
  const burger = document.querySelector(".burger");
  const navList = document.querySelector("nav ul");

  burger.addEventListener("click", () => {
    navList.classList.toggle("show");
  });
});
</script>

