importScripts("minimax.js"); // gives the worker access to getMove

self.onmessage = function(e) {
    const { cross_, nought_, pruningType, currentBoard, player, depth } = e.data;
    const move = getMove(cross_, nought_, pruningType, currentBoard, player, depth);
    self.postMessage(move); // sends the result back when done
};
