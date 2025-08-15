import React from "react";
import Cell from "./Cell";
import "../styles/Board.css";

function Board({ board, onCellClick }) {
  return (
    <div className="board">
      {board.map((value, index) => (
        <Cell key={index} value={value} onClick={() => onCellClick(index)} />
      ))}
    </div>
  );
}

export default Board;
