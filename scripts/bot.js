function convertBoards(moves) {
    return [
        moves.A,
        moves.B,
        moves.C,
        moves.D,
        moves.E,
        moves.F,
        moves.G,
        moves.H,
        moves.I
    ];
}

function getHeuristicMovefromMinimax(nought_turns, cross_turns, player, boards_covered, currentBoard) {
    let invalid = boards_covered.map(x => x.toLowerCase());

    let forcedIndex;
    if (currentBoard === "0") {
        // find the first available board as a forced index, or just pass 0
        // getHeuristicMove will fall back to all boards if that one is invalid
        forcedIndex = -1; // signal for free choice
    } else {
        forcedIndex = currentBoard.charCodeAt(0) - 65;
    }

    let bot = convertBoards(cross_turns);
    let player_turns = convertBoards(nought_turns);
    if (player === "nought") {
        bot = convertBoards(nought_turns);
        player_turns = convertBoards(cross_turns);
    }

    return getHeuristicMove(bot, player_turns, invalid, forcedIndex);
}

function clickCell(move) {
    const [board, cell] = move;
    const cellElement = document.querySelector(
        `.game-board[data-index="${board}"] .cell[data-index="${cell}"]`
    );

    if (cellElement) {
        cellElement.click();
        return true;
    }

    return false; // no matching cell found (e.g., bad board/cell value)
}

function playMove(next_board = "0") {
    if (minimax_enabled.includes(turn) || heuristic_enabled.includes(turn)) {

        const player = turn === "✖" ? "cross" : "nought";

        if (minimax_enabled.includes(turn)) {
            worker.postMessage({
                cross_: cross_turns,
                nought_: nought_turns,
                pruningType: settings[turn].pruningType,
                currentBoard: next_board,
                player,
                depth: settings[turn].depth
            });
            worker.onmessage = function(e) {
                const move = e.data;
                if (move) clickCell(move);
            };
        }

        if (heuristic_enabled.includes(turn)) {
            const move = getHeuristicMovefromMinimax(nought_turns, cross_turns, player, boards_covered, next_board);
            if (move) {
                setTimeout(() => {
                    clickCell([move[0].toUpperCase(), Number(move[1])]);
                }, 0)
            }
        }
    }
}
