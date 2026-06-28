// heuristic.js
// JavaScript port of the original heuristic algorithm for standard Tic-Tac-Toe.
// This is the precursor to the Minimax UTTT bot — a hand-crafted scoring system
// that evaluates moves by looking a few steps ahead using weighted heuristics
// rather than a full game-tree search.
//
// Public API:
//   getHeuristicMove(bot, player, invalid, lastMove)
//
// bot      : array of 9 arrays (indices 0-8, boards a-i), each containing
//            the cell numbers (1-9) the bot has played in that board
// player   : same structure for the human player
// invalid  : array of board letters ('a'-'i') that are won or drawn (off-limits)
// lastMove : string like "e5" — the last move played, determines forced board
//
// Returns: move string like "e5", or null if no moves available.
//
// Note: bot and player arrays are NOT mutated — the function works on copies
// internally for look-ahead scoring and restores state via push/pop.

const ALL_MOVES = [1,2,3,4,5,6,7,8,9];
const CORNERS = [1,3,7,9];

// ---- Win/draw detection ------------------------------------------------

function boardWinner(a, b) {
    for (const c of game_win) {
        const aInC = c.filter(x => a.includes(x)).length;
        const bInC = c.filter(x => b.includes(x)).length;
        if (aInC === 3 && bInC === 0) return "bot";
        if (bInC === 3 && aInC === 0) return "player";
    }
    return null;
}

function hasWon(cells) {
    return game_win.some(c => c.every(x => cells.includes(x)));
}

// ---- Per-move heuristic score ------------------------------------------
// w1: immediate tactical value (win/block)
// w2: quality of the board we're sending the opponent to
// w3-w5: lookahead over the next 3 plies (mirrors the original Python depth)

function scoreW1(a, b, cell) {
    for (const c of game_win) {
        if (!c.includes(cell)) continue;
        const aInC = c.filter(x => a.includes(x)).length;
        const bInC = c.filter(x => b.includes(x)).length;
        if (aInC === 2 && bInC === 0) return 1.0;   // winning move
        if (bInC === 2 && aInC === 0) return 0.9;   // blocking move
    }
    return 0.5;
}

function scoreW2(cell, invalid) {
    return invalid.includes(String.fromCharCode(cell + 96)) ? 0.1 : 0.5;
}

function avgOrDefault(arr, def = 0.5) {
    return arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : def;
}

// Recursively scores 3 plies of lookahead (w3, w4, w5)
// depth: 3 = w3 level, 2 = w4 level, 1 = w5 level (leaf)
function lookahead(bot, player, boardIndex, depth, invalid) {
    const a = bot[boardIndex];
    const b = player[boardIndex];
    const available = ALL_MOVES.filter(x => !a.includes(x) && !b.includes(x));

    const scores = [];

    for (const cell of available) {
        let score = 0.5;

        // tactical score for this cell
        for (const c of game_win) {
            if (!c.includes(cell)) continue;
            const aInC = c.filter(x => a.includes(x)).length;
            const bInC = c.filter(x => b.includes(x)).length;
            if (aInC === 2 && bInC === 0) { score = depth === 3 ? 0.9 : 0.9; break; }
            if (bInC === 2 && aInC === 0) { score = depth === 3 ? 0.8 : 0.8; break; }
        }

        // sending to an invalid board is good (opponent gets free choice, no forced advantage)
        if (invalid.includes(String.fromCharCode(cell + 96))) score = 1.0;

        if (depth > 1) {
            bot[boardIndex].push(cell);
            const childScores = lookahead(bot, player, cell - 1, depth - 1, invalid);
            bot[boardIndex].pop();
            score *= avgOrDefault(childScores);
        }

        scores.push(score);
    }

    return scores;
}

// ---- Main entry point --------------------------------------------------

function getHeuristicMove(bot, player, invalid, forcedIndex) {
    const ratingMoves = {};

    let boardsToCheck = [];

    if (forcedIndex === -1 || forcedIndex === null) {
        // free choice — check all valid boards
        for (let k = 0; k < 9; k++) {
            if (!invalid.includes(String.fromCharCode(k + 97))) {
                boardsToCheck.push(k);
            }
        }
    } else {
        const forcedLetter = String.fromCharCode(forcedIndex + 97);
        if (!invalid.includes(forcedLetter)) {
            boardsToCheck = [forcedIndex];
        } else {
            for (let k = 0; k < 9; k++) {
                if (!invalid.includes(String.fromCharCode(k + 97))) {
                    boardsToCheck.push(k);
                }
            }
        }
    }

    for (const boardIndex of boardsToCheck) {
        const ltr = String.fromCharCode(boardIndex + 97);
        const a = bot[boardIndex];
        const b = player[boardIndex];
        const available = ALL_MOVES.filter(x => !a.includes(x) && !b.includes(x));

        for (const cell of available) {
            const w1 = scoreW1(a, b, cell);
            const w2 = scoreW2(cell, invalid);

            // 3-ply lookahead from the board this move sends the opponent to
            bot[boardIndex].push(cell);
            const w3Scores = lookahead(bot, player, cell - 1, 3, invalid);
            bot[boardIndex].pop();

            const w3 = avgOrDefault(w3Scores);
            ratingMoves[`${ltr}${cell}`] = w1 * w2 * w3;
        }
    }

    if (Object.keys(ratingMoves).length === 0) return null;

    // pick the highest-scored move, preferring center then corners on ties
    const bestScore = Math.max(...Object.values(ratingMoves));
    const bestMoves = Object.keys(ratingMoves).filter(m => ratingMoves[m] === bestScore);

    const centerMoves = bestMoves.filter(m => parseInt(m.slice(1)) === 5);
    const cornerMoves = bestMoves.filter(m => CORNERS.includes(parseInt(m.slice(1))));

    if (centerMoves.length) return centerMoves[Math.floor(Math.random() * centerMoves.length)];
    if (cornerMoves.length) return cornerMoves[Math.floor(Math.random() * cornerMoves.length)];
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

// ---- Helpers for external use ------------------------------------------

// Check all boards and return updated invalid, botWin, playerWin arrays.
// Call this after every move to keep game state consistent.
function updateGameState(bot, player, invalid, botWin, playerWin) {
    for (let i = 0; i < 9; i++) {
        const ltr = String.fromCharCode(i + 97);
        if (invalid.includes(ltr)) continue;

        if (hasWon(bot[i]) && !botWin.includes(ltr)) {
            botWin.push(ltr);
            invalid.push(ltr);
        } else if (hasWon(player[i]) && !playerWin.includes(ltr)) {
            playerWin.push(ltr);
            invalid.push(ltr);
        } else if (bot[i].length + player[i].length === 9) {
            invalid.push(ltr); // draw
        }
    }
}

// Check for a global win given an array of won board letters.
function checkGlobalWin(wonBoards) {
    const nums = wonBoards.map(l => l.charCodeAt(0) - 96);
    return game_win.some(c => c.every(x => nums.includes(x)));
}

// Node module export -- no-op in browser
if (typeof module !== "undefined") {
    module.exports = { getHeuristicMove, updateGameState, checkGlobalWin, hasWon, game_win };
}