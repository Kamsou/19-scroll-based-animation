// Obtenez le chemin de l'URL actuelle
const currentURL = window.location.pathname;

// Fonction pour charger un script dynamiquement
function loadScript(scriptURL) {
  const script = document.createElement("script");
  script.src = scriptURL;
  script.type = "module";
  document.body.appendChild(script);
}

window.addEventListener("load", () => {
  if (currentURL === "/sphere") {
    loadScript("sphere-test.js");
  } else if (currentURL === "/sphere-2") {
    loadScript("sphere-test-3.js");
  } else {
    loadScript("script_noel.js");
  }
});

window.addEventListener("popstate", () => {
  if (currentURL === "/sphere") {
    const sections = document.querySelectorAll("section");
    sections.forEach((section) => {
      section.style.display = "none";
    });
    loadScript("sphere-test.js");
  } else if (currentURL === "/sphere-2") {
    const sections = document.querySelectorAll("section");
    sections.forEach((section) => {
      section.style.display = "none";
    });
    loadScript("sphere-test-3.js");
  } else {
    loadScript("script_noel.js");
  }
});
