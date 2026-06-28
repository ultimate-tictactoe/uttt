// SETUP
const tooltip = document.querySelector(".tooltip");
let forcedTooltip = null;

document.addEventListener("mousemove", (e) => {
    tooltip.style.left = `${e.clientX}px`;
    tooltip.style.top = `${e.clientY}px`;
});


// BASIC FUNCTIONS
function showTooltip(text) {
    tooltip.textContent = text;
    tooltip.style.display = "block";
    tooltip.style.opacity = "1";
}

function hideTooltip() {
    if (forcedTooltip) {
        tooltip.textContent = forcedTooltip;
    } else {
        tooltip.style.opacity = "0";
    }
}

// TOOLTIP FUNCTIONS

function addTooltip(text, class_) {
    document.querySelectorAll(`.${class_}`).forEach(e =>{
        e.addEventListener("mouseenter", () => showTooltip(text))
        e.addEventListener("mouseleave", () => hideTooltip())}
    )}

function addForcedTooltip(text) {
    forcedTooltip = text;
    showTooltip(text);
}

function removeForcedTooltip() {
    forcedTooltip = null;
    hideTooltip();
}

// DEFAULT TOOLTIPS
addTooltip("Color Scheme", "color-wrapper");
addTooltip("Cross Moves", "cross")
addTooltip("Nought Moves", "nought")
addTooltip("Moves", "moves-label")

addTooltip("Winner", "winner");
addTooltip("Current Turn", "turn");

addTooltip("Title", "title");

addTooltip("Start", "continue");
addTooltip("Cross Settings", "cross-icon");
addTooltip("Nought Settings", "nought-icon");

addTooltip("AI Depth", "depth-input")
addTooltip("Enable AI", "enable")
addTooltip("Enable Heuristic", "heuristic")
