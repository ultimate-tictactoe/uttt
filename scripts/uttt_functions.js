// TIC TAC TOE FUNCTIONS
function checkWin(moves, player, board) {
    const winningCombo = game_win.find(combination =>
        combination.every(pos => moves.includes(pos)))
    if (winningCombo) {
        boards_covered.push(board);
        boards_won.push(board);

        if (player === "Cross"){
            cross_boards.push(board);
        } else {
            nought_boards.push(board);
        }

        document.querySelector(".moves-grid").lastChild.lastChild.textContent += "+";

        const boardElement = document.querySelector(`.game-board[data-index="${board}"]`);
        drawWinLine(winningCombo, boardElement);
        boardElement.querySelectorAll(".cell").forEach(cell => {
            if (!cell.classList.contains("clicked-cell")) {
                cell.classList.remove("open-cell");
                cell.classList.add("closed-cell");
            }
        });
        boardElement.querySelector(".board-cover").style.opacity = "1";
        boardElement.querySelector(".board-cover").style.display = "flex";
        boardElement.querySelector(".win").innerText = player === "Cross" ? "✖" : "⬤";
        checkOverallWin(player === "Cross" ? "✖" : "⬤");
    }
}

function checkDraw(board) {
    if (boards_won.includes(board)) return;

    if (cross_turns[board].length + nought_turns[board].length === 9) {
        boards_covered.push(board);
        const boardElement = document.querySelector(`.game-board[data-index="${board}"]`);
        boardElement.querySelector(".win").innerText = "/";
        boardElement.querySelector(".board-cover").style.opacity = "1";
        boardElement.querySelector(".board-cover").style.display = "flex";
    }
}

function drawWinLine(combination, board) {
    const cells = board.querySelectorAll(".cell");
    const firstCell = cells[combination[0] - 1];
    const lastCell = cells[combination[2] - 1];

    const firstRect = firstCell.getBoundingClientRect();
    const lastRect = lastCell.getBoundingClientRect();
    const boardRect = firstCell.closest(".game-board").getBoundingClientRect();

    const x1 = firstRect.left - boardRect.left + firstRect.width / 2;
    const y1 = firstRect.top - boardRect.top + firstRect.height / 2;
    const x2 = lastRect.left - boardRect.left + lastRect.width / 2;
    const y2 = lastRect.top - boardRect.top + lastRect.height / 2;

    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    const line = document.createElement("div");
    line.classList.add("win-line");
    line.style.width = `${length}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;

    firstCell.closest(".game-board").appendChild(line);
}

// SUPER TIC TAC TOE FUNCTIONS
function renderOpenBoards(currentBoard = "0", lastClickedCell = null) {
    document.querySelectorAll(".game-board").forEach((board) => {
        const isAwake = currentBoard === "0" || currentBoard === board.dataset.index;

        board.querySelectorAll(".cell").forEach(cell => {

            if (cell.classList.contains("clicked-cell") && cell !== lastClickedCell) {
                cell.classList.remove("clicked-cell");
                cell.classList.add("closed-cell");
                return;
            }

            if (isAwake) {
                if (cell.classList.contains("open-sleeping-cell")) {
                    cell.classList.remove("open-sleeping-cell");
                    cell.classList.add("open-cell");
                } else if (cell.classList.contains("closed-sleeping-cell")) {
                    cell.classList.remove("closed-sleeping-cell");
                    cell.classList.add("closed-cell");
                }
            } else {
                if (cell.classList.contains("open-cell")) {
                    cell.classList.remove("open-cell");
                    cell.classList.add("open-sleeping-cell");
                } else if (cell.classList.contains("closed-cell")) {
                    cell.classList.remove("closed-cell");
                    cell.classList.add("closed-sleeping-cell");
                }
            }
        });
    });
}

function checkOverallWin(player) {
    const winningNoughtCombo = game_win.find(combination =>
        combination.every(pos => nought_boards.map(letter => letter.charCodeAt(0) - 64).includes(pos)))

    const winningCrossCombo = game_win.find(combination =>
        combination.every(pos => cross_boards.map(letter => letter.charCodeAt(0) - 64).includes(pos)))

    const drawCombo = boards_covered.length === 9;

    if (winningNoughtCombo || winningCrossCombo || drawCombo) {
        const el = document.querySelector(".moves-grid").lastElementChild.lastElementChild;
        el.textContent = el.textContent.slice(0, -1) + "#";

        // Use the player argument directly — it's already correct
        const winner = drawCombo ? "/" : player;
        // Lock all cells
        game_over = true;
        renderOpenBoards(null);

        // Show a winner message
        document.querySelector(".winner").innerText = winner;
    }
}
