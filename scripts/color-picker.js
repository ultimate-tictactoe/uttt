["--background-color", "--secondary-color", "--accent-color"].forEach(cssVar => {
    const saved = localStorage.getItem(cssVar);
    if (saved) {
        document.documentElement.style.setProperty(cssVar, saved);
    }
});

document.querySelectorAll(".color-box").forEach(box => {
    // figure out dot color based on the swatch background
    const bg = getComputedStyle(box).backgroundColor;
    const isLight = isLightColor(bg);

    const dot = document.createElement("div");
    dot.classList.add("dot");
    dot.style.background = isLight ? "#0f0f13" : "#ffffff";
    box.appendChild(dot);

    box.addEventListener("click", () => {
        document.querySelectorAll(".color-box").forEach(b => b.classList.remove("active"));
        box.classList.add("active");
    });
});

function isLightColor(rgb) {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

document.querySelectorAll(".color-box").forEach(box => {
    const input = box.querySelector(".color-input");
    const cssVar = box.dataset.var;

    // set input's initial value to the current CSS variable value
    const currentColor = getComputedStyle(document.documentElement)
        .getPropertyValue(cssVar).trim();
    input.value = rgbToHex(currentColor); // browsers need hex, CSS vars may be rgb()

    box.addEventListener("click", () => input.click());

    input.addEventListener("input", () => {
        document.documentElement.style.setProperty(cssVar, input.value);
        box.style.backgroundColor = input.value;
        localStorage.setItem(cssVar, input.value);
    });
});

// converts "rgb(r, g, b)" to "#rrggbb" since input[type=color] only accepts hex
function rgbToHex(color) {
    if (color.startsWith("#")) return color;
    const [r, g, b] = color.match(/\d+/g).map(Number);
    return "#" + [r, g, b].map(n => n.toString().padStart(2, "0")).join("");
}
