// VARIABLES
let minimax_enabled = "";
let heuristic_enabled = "";
const settings = {
    "⬤": {
        "pruningType": "nothing",
        depth: 3
    },

    "✖": {
        "pruningType": "nothing",
        depth: 3
    }}

const worker = new Worker("scripts/worker.js");

let turn = document.querySelector(".turn").textContent;
const turnDiv = document.querySelector(".turn");

let debug = false;

let boards_won = [];
let boards_covered = [];

let cross_boards = [];
let nought_boards = [];

let cross_turns = {
    "A": [],
    "B": [],
    "C": [],
    "D": [],
    "E": [],
    "F": [],
    "G": [],
    "H": [],
    "I": [],
}
let nought_turns = {
    "A": [],
    "B": [],
    "C": [],
    "D": [],
    "E": [],
    "F": [],
    "G": [],
    "H": [],
    "I": [],
}

let game_over = false;

// COMPARISON
let turnStartTime = performance.now();

let moveTimes = {
    "✖": [],
    "⬤": []
};

document.querySelector(".continue").addEventListener(
    "click",
    () => {
        removeForcedTooltip();
        minimax_enabled = "";
        heuristic_enabled = "";
        disableSettings();

        if (getSettings()[0].enabled) {
            minimax_enabled += "✖"
        }
        if (getSettings()[1].enabled) {
            minimax_enabled += "⬤"
        }

        if (getSettings()[0].heuristic) {
            heuristic_enabled += "✖"
        }
        if (getSettings()[1].heuristic) {
            heuristic_enabled += "⬤"
        }

        settings["✖"].pruningType = getSettings()[0].pruning;
        settings["⬤"].pruningType = getSettings()[1].pruning;

        settings["✖"].depth = getSettings()[0].depth;
        settings["⬤"].depth = getSettings()[1].depth;

        renderBoardwithCheck();
        playMove();
    }
)

addForcedTooltip("Adjust settings & continue to Begin")
disableBoard();
renderOpenBoards();
document.querySelectorAll(".cell").forEach(cell => {
    cell.addEventListener("mouseover", () => {
        if (cell.classList.contains("open-cell")) {
            cell.textContent = turn;
        }
    });

    cell.addEventListener("mouseout", () => {
        if (cell.classList.contains("open-cell")) {
            cell.textContent = "";
        }
    });

    cell.addEventListener("click", () => {
        if (!cell.classList.contains("open-cell")) return;
        // COMPARISON
        const moveTime = performance.now() - turnStartTime;
        moveTimes[turn].push(moveTime);

        let board = cell.closest(".game-board").dataset.index;
        const turn_notation = board + cell.dataset.index;

        const movesGrid = document.querySelector(".moves-grid");

        const row = document.createElement("div");
        row.classList.add("move-row");

        const crossDiv = document.createElement("div");
        crossDiv.classList.add("cross-box");

        const noughtDiv = document.createElement("div");
        noughtDiv.classList.add("nought-box");

        if (turn === "✖") {
            cross_turns[board].push(+cell.dataset.index);
            crossDiv.textContent = turn_notation;
            row.appendChild(crossDiv);
        } else {
            nought_turns[board].push(+cell.dataset.index);
            noughtDiv.textContent = turn_notation;
            row.appendChild(noughtDiv);
        }

        if (debug) {
            navigator.clipboard.writeText(turn_notation);
            console.log(turn_notation);
        }


        movesGrid.appendChild(row);

        cell.textContent = turn;
        cell.classList.add("clicked-cell");
        cell.classList.remove("open-cell");

        checkWin(cross_turns[board], "Cross", board);
        checkWin(nought_turns[board], "Nought", board);
        checkDraw(board);

        let next_board = "0"
        if (!game_over){
            renderOpenBoards("0", cell); // converts old clicked-cell, skips current
            next_board = String.fromCharCode(64 + +cell.dataset.index)
            if (boards_covered.includes(next_board)) {
                next_board = "0";
            }
            renderOpenBoards(next_board, cell);
        }

        turn = turn === "⬤" ? "✖" : "⬤";
        turnDiv.textContent = turn;

        // COMPARISON
        turnStartTime = performance.now();

        renderBoardwithCheck();

        if (!game_over) {
            playMove(next_board);
        } else {
            getAnalysis("✖", false);
            getAnalysis("⬤", false);
        }

    });
});
