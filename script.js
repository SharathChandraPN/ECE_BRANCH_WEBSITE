function toggleMenu() {
    let menu = document.getElementById("menu");

    if (menu.style.display === "flex") {
        menu.style.display = "none";
    } else {
        menu.style.display = "flex";
    }
}

function toggleTheme() {
    document.body.classList.toggle("light-mode");
    const themeToggleBtn = document.getElementById("theme-toggle");
    
    if (document.body.classList.contains("light-mode")) {
        themeToggleBtn.innerText = "🌙 Dark Mode";
        localStorage.setItem("theme", "light");
    } else {
        themeToggleBtn.innerText = "☀️ Light Mode";
        localStorage.setItem("theme", "dark");
    }
}

// Check saved theme on load
window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        const themeBtn = document.getElementById("theme-toggle");
        if(themeBtn) themeBtn.innerText = "🌙 Dark Mode";
    }
});

function toggleLogoMenu() {
    document.getElementById("logoDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.closest('.logo-dropdown-btn')) {
    var dropdowns = document.getElementsByClassName("logo-dropdown-content");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
