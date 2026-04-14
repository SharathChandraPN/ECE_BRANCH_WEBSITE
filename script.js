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
        if (themeBtn) themeBtn.innerText = "🌙 Dark Mode";
    }
});

function toggleLogoMenu() {
    document.getElementById("logoDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
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




// SAMPLE DATA (add your full list)
const students = {
    "23EC001": "ABH091104",
    "23EC002": "ADA130705",
    "23EC003": "AMR230206"
};

function openSIS() {
    document.getElementById("sisBox").style.display = "block";
}

function closeSIS() {
    document.getElementById("sisBox").style.display = "none";
}
// GET PASSWORD
function getPassword() {
    const usn = document.getElementById("sis-usn").value.trim().toUpperCase();

    if (students[usn]) {
        document.getElementById("result").innerText = "Password: " + students[usn];
    } else {
        document.getElementById("result").innerText = "USN not found";
    }
}

// COPY
function copyPassword() {
    const text = document.getElementById("result").innerText.replace("Password: ", "");

    if (text && text !== "USN not found") {
        navigator.clipboard.writeText(text);
        alert("Copied!");
    }
}

// CLOSE ON OUTSIDE CLICK
window.onclick = function (e) {
    const box = document.getElementById("sisBox");
    if (e.target === box) {
        box.style.display = "none";
    }
}

window.onclick = function (e) {
    const box = document.getElementById("sisBox");
    if (e.target === box) {
        closeSIS();
    }
}


window.onclick = function (e) {
    const box = document.getElementById("sisBox");
    if (e.target === box) {
        closeSIS();
    }
}

// SAFE GLOBAL HANDLER (OVERRIDES ALL OLD ONCLICK)
window.addEventListener("click", function (event) {

    // CLOSE DROPDOWN
    if (!event.target.closest('.logo-dropdown-btn')) {
        let dropdowns = document.getElementsByClassName("logo-dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            dropdowns[i].classList.remove('show');
        }
    }

    // CLOSE SIS POPUP WHEN CLICK OUTSIDE
    const box = document.getElementById("sisBox");
    if (event.target === box) {
        box.style.display = "none";
    }
});

window.addEventListener("DOMContentLoaded", function () {
    document.getElementById("sisBox").style.display = "none";
});