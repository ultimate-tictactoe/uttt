// grid.js
let board = "";

for (let i = 65; i <= 73; i++) {
    let cells = "";
    for (let j = 1; j <= 9; j++) {
        cells += `<div class="open-cell cell" data-index="${j}"></div>`;
    }

    board += `
        <div class="game-board" data-index="${String.fromCharCode(i)}">
            ${cells}
            <div class="board-cover" data-index="${String.fromCharCode(i)}">
                <div class="win"></div>
            </div>
        </div>
    `;
}

document.querySelector(".big-board").innerHTML = board;
