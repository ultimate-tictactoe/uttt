const gameCoefficients = {
    Win: 1.0,
    Draw: 0.75,
    Loss: 0.5
}

function getAnalysis (player, returnRating = true) {
    const avgTimeMs =
        moveTimes[player].reduce((a, b) => a + b, 0) /
        moveTimes[player].length;

    const avgTime = avgTimeMs / 1000;

    const boardsDrawn =
        boards_covered.length -
        cross_boards.length -
        nought_boards.length;

    let boardsWon = 0;
    if (player === "✖") {
        boardsWon = cross_boards.length;
    } else {
        boardsWon = nought_boards.length;
    }

    let gameCoefficient = 0;
    const winner = document.querySelector(".winner").textContent;
    if (winner === player) {
        gameCoefficient = gameCoefficients.Win;
    } else if (winner === "/") {
        gameCoefficient = gameCoefficients.Draw;
    } else {
        gameCoefficient = gameCoefficients.Loss;
    }

    const rating = (gameCoefficient * (boardsWon+ (boardsDrawn/2))) / avgTime

    if (returnRating) {
        return rating;
    } else {
        console.log(`============================= ${player} =============================`);
        console.log(`Average Time: ${avgTime} seconds`);
        console.log(`Boards Drawn: ${boardsDrawn}`);
        console.log(`Boards Won: ${boardsWon}`);
        console.log(`Game Coefficient: ${gameCoefficient}`);
        console.log(`⁂ Rating: ${rating}`);
        console.log("=====================================================================");
    }

}