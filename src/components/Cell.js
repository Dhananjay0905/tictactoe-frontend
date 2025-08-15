import React from 'react';
import '../styles/Cell.css';

function Cell({ value, onClick }) {
    const cellClass = value ? `cell cell-${value}` : 'cell';
    return (
        <button className={cellClass} onClick={onClick}>
            {value}
        </button>
    );
}

export default Cell;