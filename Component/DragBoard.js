import React from 'react'
import { Text, Alert, StyleSheet, View } from "react-native";

function DragBoard (props) {
    const drop = e => {
        e.preventDefault();

        const marker_id = e.dataTransfer.getData('marker_id');
        const marker = document.getElementById(marker_id);
        marker.style.display = 'block';

        e.target.appendChild(marker);
    }

    const dragOver = e => {
        e.preventDefault();
    }

    return (
        <View 
        id={props.id}
        className={props.className}
        onDrop={drop}
        onDragOver={dragOver}>
            { props.children }
        </View>
    )
}

export default DragBoard;