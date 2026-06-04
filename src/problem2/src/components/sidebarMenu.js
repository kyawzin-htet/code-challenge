export function createSidebarMenu({ menuButton, closeButton, sidebar, backdrop, links }) {
  function open() {
    sidebar.classList.add("is-open");
    sidebar.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    backdrop.hidden = false;
    document.body.classList.add("sidebar-open");
    closeButton.focus();
  }

  function close() {
    sidebar.classList.remove("is-open");
    sidebar.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    backdrop.hidden = true;
    document.body.classList.remove("sidebar-open");
  }

  function bind() {
    menuButton.addEventListener("click", open);
    closeButton.addEventListener("click", close);
    backdrop.addEventListener("click", close);
    links.forEach((link) => link.addEventListener("click", close));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && sidebar.classList.contains("is-open")) {
        close();
      }
    });
  }

  return { bind, close, open };
}
