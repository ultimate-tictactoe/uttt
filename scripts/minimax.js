// minimax.js
// Standalone Minimax + Alpha-Beta Pruning move-selector for Ultimate Tic-Tac-Toe.
// No other script files required -- this is fully self-contained.
//
// Public API:
//   getMove(cross_, nought_, pruningType, currentBoard = "0", player = "cross", depth = 3)
//
// cross_ / nought_ : objects keyed "A".."I", each value an array of cell
//                     numbers (1-9) that player has played in that board.
// pruningType       : "nothing" | "heuristic" | "minimax"
//                     "nothing"   -> static cell-priority ordering (center > corner > edge)
//                     "heuristic" -> scores moves by position + immediate tactical wins
//                     "minimax"   -> iterative deepening, reusing each depth's best
//                                    move to order the next, for the strongest pruning
// currentBoard      : "0" (free choice) or a board letter "A".."I" the move is forced into
// player            : "cross" | "nought" -- whose move is being chosen
// depth             : how many plies deep to search
//
// Returns: [board, cell] e.g. ["E", 5], or null if no legal moves exist.

const game_win = [
    [1,2,3],
    [4,5,6],
    [7,8,9],
    [1,4,7],
    [2,5,8],
    [3,6,9],
    [1,5,9],
    [3,5,7]
];

const WEIGHTS = {
    center_win: 1000, corner_win: 700, edge_win: 500,
    center_board: 50, corner_board: 30, edge_board: 20,
    two_in_row: 10, center_moves: 5, corner_moves: 3, edge_moves: 1
};

function hasWon(moves) {
    return game_win.some(combo => combo.every(pos => moves.includes(pos)));
}

function evaluate(nought_, cross_, player) {
    let nought_score = 0;
    let cross_score = 0;

    const nought_wins = [];
    const cross_wins = [];

    for (const board of "ABCDEFGHI") {
        if (hasWon(nought_[board])) nought_wins.push(board);
        if (hasWon(cross_[board])) cross_wins.push(board);

        for (const line of game_win) {
            if (!nought_wins.includes(board) && !cross_wins.includes(board)) {
                const nought_in_line = line.filter(cell => nought_[board].includes(cell)).length;
                const cross_in_line = line.filter(cell => cross_[board].includes(cell)).length;

                if (nought_in_line === 2 && cross_in_line === 0) nought_score += WEIGHTS.two_in_row;
                if (cross_in_line === 2 && nought_in_line === 0) cross_score += WEIGHTS.two_in_row;
            }
        }

        for (const i of nought_[board]) {
            if (i === 5) nought_score += WEIGHTS.center_moves;
            else if ([1,3,7,9].includes(i)) nought_score += WEIGHTS.corner_moves;
            else nought_score += WEIGHTS.edge_moves;
        }
        for (const i of cross_[board]) {
            if (i === 5) cross_score += WEIGHTS.center_moves;
            else if ([1,3,7,9].includes(i)) cross_score += WEIGHTS.corner_moves;
            else cross_score += WEIGHTS.edge_moves;
        }

        const nought_count = nought_[board].length;
        const cross_count = cross_[board].length;
        let controlling = null;
        if (nought_count > cross_count) controlling = "nought";
        else if (cross_count > nought_count) controlling = "cross";

        if (board === "E") {
            if (controlling === "nought") nought_score += WEIGHTS.center_board;
            else if (controlling === "cross") cross_score += WEIGHTS.center_board;
        } else if ("ACGI".includes(board)) {
            if (controlling === "nought") nought_score += WEIGHTS.corner_board;
            else if (controlling === "cross") cross_score += WEIGHTS.corner_board;
        } else {
            if (controlling === "nought") nought_score += WEIGHTS.edge_board;
            else if (controlling === "cross") cross_score += WEIGHTS.edge_board;
        }
    }

    for (const board of nought_wins) {
        if (board === "E") nought_score += WEIGHTS.center_win;
        else if ("ACGI".includes(board)) nought_score += WEIGHTS.corner_win;
        else nought_score += WEIGHTS.edge_win;
    }
    for (const board of cross_wins) {
        if (board === "E") cross_score += WEIGHTS.center_win;
        else if ("ACGI".includes(board)) cross_score += WEIGHTS.corner_win;
        else cross_score += WEIGHTS.edge_win;
    }

    // Always oriented to cross internally -- callers flip sign for "nought" perspective.
    return cross_score - nought_score;
}

function movesEqual(a, b) {
    return !!a && !!b && a[0] === b[0] && a[1] === b[1];
}

// lastBestMove is passed explicitly rather than stored globally, so this
// module has no shared mutable state -- every call to getMove is independent.
function orderMoves(legalMoves, nought_, cross_, player, priority, lastBestMove) {
    if (priority === "heuristic") {
        const scored = legalMoves.map(([board, cell]) => {
            let score = 0;
            if (cell === 5) score += 100;
            else if ([1, 3, 7, 9].includes(cell)) score += 50;

            cross_[board].push(cell);
            if (hasWon(cross_[board])) score += 1000;
            cross_[board].pop();

            nought_[board].push(cell);
            if (hasWon(nought_[board])) score += 1000;
            nought_[board].pop();

            return { score, move: [board, cell] };
        });
        scored.sort((a, b) => b.score - a.score);
        return scored.map(s => s.move);
    }

    if (priority === "minimax") {
        if (lastBestMove && legalMoves.some(m => movesEqual(m, lastBestMove))) {
            return [lastBestMove, ...legalMoves.filter(m => !movesEqual(m, lastBestMove))];
        }
        return legalMoves;
    }

    // "nothing" (default): static cell-priority ordering
    const score = ([, cell]) => {
        if (cell === 5) return 0;
        if ([1, 3, 7, 9].includes(cell)) return 1;
        return 2;
    };
    return [...legalMoves].sort((a, b) => score(a) - score(b));
}

function legalMovesFor(nought_, cross_, currentBoard) {
    const boardsToCheck = currentBoard === "0" ? [..."ABCDEFGHI"] : [currentBoard];
    let moves = [];
    for (const board of boardsToCheck) {
        if (hasWon(nought_[board]) || hasWon(cross_[board])) continue;
        const occupied = new Set([...nought_[board], ...cross_[board]]);
        if (occupied.size === 9) continue;
        for (let cell = 1; cell <= 9; cell++) {
            if (!occupied.has(cell)) moves.push([board, cell]);
        }
    }

    // Forced board already finished -> fall back to free choice
    if (moves.length === 0 && currentBoard !== "0") {
        for (const board of "ABCDEFGHI") {
            if (hasWon(nought_[board]) || hasWon(cross_[board])) continue;
            const occupied = new Set([...nought_[board], ...cross_[board]]);
            for (let cell = 1; cell <= 9; cell++) {
                if (!occupied.has(cell)) moves.push([board, cell]);
            }
        }
    }

    return moves;
}

function minimax(nought_, cross_, currentBoard, depth, alpha, beta, maximizing, player, pruningType) {
    const noughtWins = [..."ABCDEFGHI"].filter(b => hasWon(nought_[b]));
    const crossWins = [..."ABCDEFGHI"].filter(b => hasWon(cross_[b]));

    // Always oriented to cross internally -- callers flip sign for "nought" perspective.
    if (hasWon(noughtWins.map(b => b.charCodeAt(0) - 64))) {
        return -10000;
    }
    if (hasWon(crossWins.map(b => b.charCodeAt(0) - 64))) {
        return 10000;
    }
    if (depth === 0) {
        return evaluate(nought_, cross_, player);
    }

    let legalMoves = legalMovesFor(nought_, cross_, currentBoard);
    legalMoves = orderMoves(legalMoves, nought_, cross_, player, pruningType, null);

    if (legalMoves.length === 0) return 0; // Draw

    if (maximizing) {
        let best = -Infinity;
        for (const [board, cell] of legalMoves) {
            cross_[board].push(cell);
            let nextBoard = String.fromCharCode(64 + cell);
            if (hasWon(nought_[nextBoard]) || hasWon(cross_[nextBoard]) ||
                nought_[nextBoard].length + cross_[nextBoard].length === 9) {
                nextBoard = "0";
            }
            const score = minimax(nought_, cross_, nextBoard, depth - 1, alpha, beta, false, player, pruningType);
            cross_[board].pop();

            best = Math.max(best, score);
            alpha = Math.max(alpha, best);
            if (beta <= alpha) break;
        }
        return best;
    } else {
        let best = Infinity;
        for (const [board, cell] of legalMoves) {
            nought_[board].push(cell);
            let nextBoard = String.fromCharCode(64 + cell);
            if (hasWon(nought_[nextBoard]) || hasWon(cross_[nextBoard]) ||
                nought_[nextBoard].length + cross_[nextBoard].length === 9) {
                nextBoard = "0";
            }
            const score = minimax(nought_, cross_, nextBoard, depth - 1, alpha, beta, true, player, pruningType);
            nought_[board].pop();

            best = Math.min(best, score);
            beta = Math.min(beta, best);
            if (beta <= alpha) break;
        }
        return best;
    }
}

function getMove(cross_, nought_, pruningType = "nothing", currentBoard = "0", player = "cross", depth = 3) {
    let bestMove = null;

    if (pruningType === "minimax") {
        // Iterative deepening: search depth 1, then 2, ... up to `depth`,
        // reusing each pass's best move to order the next pass's moves.
        let lastBestMove = null;

        for (let currentDepth = 1; currentDepth <= depth; currentDepth++) {
            let bestScore = -Infinity;
            let legalMoves = legalMovesFor(nought_, cross_, currentBoard);
            legalMoves = orderMoves(legalMoves, nought_, cross_, player, "minimax", lastBestMove);

            for (const [board, cell] of legalMoves) {
                if (player === "cross") cross_[board].push(cell);
                else nought_[board].push(cell);

                let nextBoard = String.fromCharCode(64 + cell);
                if (hasWon(nought_[nextBoard]) || hasWon(cross_[nextBoard]) ||
                    nought_[nextBoard].length + cross_[nextBoard].length === 9) {
                    nextBoard = "0";
                }

                const score = minimax(
                    nought_, cross_, nextBoard,
                    currentDepth - 1, -Infinity, Infinity,
                    player !== "cross", player, pruningType
                );


                if (player === "cross") cross_[board].pop();
                else nought_[board].pop();

                const orientedScore = player === "cross" ? score : -score;
                if (orientedScore > bestScore) {
                    bestScore = orientedScore;
                    bestMove = [board, cell];
                }
            }

            lastBestMove = bestMove;
        }
        return bestMove;
    }

    // Single fixed-depth search ("nothing" or "heuristic")
    let bestScore = -Infinity;
    let legalMoves = legalMovesFor(nought_, cross_, currentBoard);
    legalMoves = orderMoves(legalMoves, nought_, cross_, player, pruningType, null);

    for (const [board, cell] of legalMoves) {
        if (player === "cross") cross_[board].push(cell);
        else nought_[board].push(cell);

        let nextBoard = String.fromCharCode(64 + cell);
        if (hasWon(nought_[nextBoard]) || hasWon(cross_[nextBoard]) ||
            nought_[nextBoard].length + cross_[nextBoard].length === 9) {
            nextBoard = "0";
        }

        const score = minimax(
            nought_, cross_, nextBoard,
            depth - 1, -Infinity, Infinity,
            player !== "cross", player, pruningType
        );

        if (player === "cross") cross_[board].pop();
        else nought_[board].pop();

        const orientedScore = player === "cross" ? score : -score;
        if (orientedScore > bestScore) {
            bestScore = orientedScore;
            bestMove = [board, cell];
        }
    }
    return bestMove;
}

// Works as a plain <script> include and as a Node module for testing.
if (typeof module !== "undefined") {
    module.exports = { game_win, WEIGHTS, hasWon, evaluate, getMove };
}
