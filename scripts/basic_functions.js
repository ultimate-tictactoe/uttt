function disableBoard() {
    document.querySelector(".big-board").classList.add("disabled");
}

function enableBoard() {
    document.querySelector(".big-board").classList.remove("disabled");
}

function renderBoardwithCheck() {
    if (!(minimax_enabled.includes(turn) ||
        heuristic_enabled.includes(turn)) ||
        game_over){
        enableBoard();
        removeForcedTooltip();
    } else {
        disableBoard();
        addForcedTooltip("Computing Move...")
    }
}

function disableSettings() {
    document
        .querySelector(".settings-panel")
        .classList.add("settings-disabled");
}
