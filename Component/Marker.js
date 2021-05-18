import React from 'react';
import { Text, Alert, StyleSheet, View } from "react-native";

function Marker (props) {
    const dragStart = e => {
        const target = e.target;

        e.dataTransfer.setData('marker_id', target.id);

        setTimeout(() => {
            target.style.display="none";
        }, 0);
    }

    const dragOver = e => {
        e.stopPropagation();
    }

    return(
        <View
        id={props.id}
        className={props.className}
        onDragStart={dragStart}
        onDragOver={dragOver}>
            { props.children }
        </View>
    )
}

export default Marker