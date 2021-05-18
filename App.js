import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  Animated,
  Dimensions,
  AsyncStorage
} from 'react-native';
import MapboxGL from "@react-native-mapbox-gl/maps";
import { createRef } from "react";
import MyIcon from 'assets/plusSign.svg';
// import { Icon } from 'react-native-elements'
// import Draggable from 'react-native-draggable';


MapboxGL.setAccessToken(
  'pk.eyJ1IjoiY29kZXJsZWUxMjMiLCJhIjoiY2ttN3ZyNXRoMGoycDJubnVvZXVrOWplZSJ9.xq_e59PlJXCWyQjl3cqx7g'
  );
  

class App extends Component{
  constructor(props){
    super(props);
    this.mapRef = createRef();
    this.state = {
        pan1     : new Animated.ValueXY({x:0, y:0}),   //Step 1
        location: null,
        dropZoneValues: null,
        curr_id: -1,
        arr: [],
        coord: {},
        UserIcon: null,
        height: 0,
        inRange: true
    };

    AsyncStorage.clear(); //disable if want to store data locally

    //pan responder used for the draggable point 
    this.panResponder1 = PanResponder.create({    //Step 2
        onStartShouldSetPanResponder : () => true,
        onPanResponderMove           : Animated.event([null,{ //Step 3
            dx : this.state.pan1.x,
            dy : this.state.pan1.y
        }],{
          useNativeDriver: false,
          listener: (e, gesture) => {
            if(this.isDropZone(gesture)){
              this.setState({
                inRange: false
              })
            }
            else{
              this.setState({
                inRange: true
              })
            }
          }
        }),
        onPanResponderRelease           : async (e, gesture) => {
          if(this.isDropZone(gesture)){ //Step 1
            const coordinate = await this.mapRef.current.getCoordinateFromView([gesture.moveX,gesture.moveY]); //cannot await above this line or else will mess up the coordinates
            this._storeData(this.state.curr_id.toString(), coordinate)
            currCoord = this.state.coord
            currCoord[this.state.curr_id.toString()] = coordinate
            this.setState({
              coord: currCoord
            })
          }
          this.setState({
            inRange: true
          })
          Animated.spring(            //Step 1
            this.state.pan1,         //Step 2
            {toValue:{x:0,y:0}, useNativeDriver: false }     //Step 3
          ).start();
      }
    });
  }
  
  //set current draggable value
  setDropZoneValues(event){      //Step 1
    this.setState({
        dropZoneValues : event.nativeEvent.layout
    });
  }

  //check if draggable can be drop at current point
  isDropZone(gesture){
    var dz = this.state.dropZoneValues;
    var first = gesture.moveY > dz.y && gesture.moveY < dz.y + dz.height;
    var second = Math.abs(gesture.moveX - 50) > 100 || Math.abs(gesture.moveY - 750) > 100;
    return (first && second);
  }

  //store data at cache storage
  _storeData = async (a,b) => {
    try {
        stringifiedArray = JSON.stringify(b)
        await AsyncStorage.setItem(a, stringifiedArray);
    } catch (error) {
        console.log("data error");
    }
  }

  //retrive data from cache storage
  _retrieveData = async (a) => {
    try {
        const value = await AsyncStorage.getItem(a);
        if (value !== null) {
            // Our data is fetched successfully
            restoredArray = JSON.parse(value)
            return [a,restoredArray];
        }
    } catch (error) {
        // Error retrieving data
        console.log("retrieve error");
    }
  }

  componentDidMount() {
    this.getTotal().then((total) => {
      this.setState({
        curr_id: total,
      })
    })
    this.getKeys().then((keys) => {
      curr = {};
      for(i = 0; i < this.state.curr_id; i++){  
        this._retrieveData(keys[i].toString()).then((data) => {
          curr[data[0]] = data[1]
        }).catch((error)=>{
          console.log("Api call error");
          // alert(error.message);
      });
      }
      this.setState({
        arr: keys,
        coord: curr,
        height: Dimensions.get('window').height
      })
    })
  }

  async componentDidUpdate(){
    this.setState({
      curr_id: (await AsyncStorage.getAllKeys()).length,
      arr: await AsyncStorage.getAllKeys(),
    })
  }

  //get total data in storage
  async getTotal() {
    return (await AsyncStorage.getAllKeys()).length;
  }

  //get all keys of storage
  async getKeys() {
    return await AsyncStorage.getAllKeys()
  }

  render(){
    return (
      <View style={[styles.container, {flexDirection: "column"}]}>
        <View style={styles.page}>
          <View style={styles.container}>
            <MapboxGL.MapView 
            style={styles.map}
            styleURL={MapboxGL.StyleURL.Dark}
            onLayout={this.setDropZoneValues.bind(this)}
            ref={this.mapRef}>
              <MapboxGL.UserLocation/>
              <MapboxGL.Camera
                zoomLevel={8}
                maxZoomLevel={17}
                followUserLocation={true}
              />
              {this.renderMapView()}
            </MapboxGL.MapView>
          </View>
          {this.renderDraggable()}
        </View>
        <View style={{flex: 1}}></View>
      </View>
    );
  }

  //draggable point view
  renderDraggable(){
    if(this.state.inRange){
      return (
        <View style={{
          flex: 1,
          alignItems: "center", 
          justifyContent: "center",
          position:"absolute",
          marginTop: (this.state.height / 6 * 4.8),
          // marginBottom: "375%",
          width: 100,
          height: 100
        }}>
          <Animated.View {...this.panResponder1.panHandlers} style={[this.state.pan1.getLayout()]}>   
            <MyIcon width={48} height={48} fill="#000" />
          </Animated.View>
        </View>
      )
    }
    else{
        return (
          <View style={{
            flex: 1,
            alignItems: "center", 
            justifyContent: "center",
            position:"absolute",
            marginTop: (this.state.height / 6 * 4.8),
            // marginBottom: "375%",
            width: 100,
            height: 100
          }}>
            <Animated.View {...this.panResponder1.panHandlers} style={[this.state.pan1.getLayout(), styles.circle1]}>   
            </Animated.View>
          </View>
        )
    }
    
  }
  
  //render map 
  renderMapView() {
    markers = []
    arr = this.state.arr;
    {arr.map((item,index)=>{
      currCoord = this.state.coord[arr[index]];
      markers.push(
        <MapboxGL.MarkerView
        id={arr[index]+1}
        key={arr[index]+1}
        coordinate={currCoord}>
          <View style={styles.dot}/>
        </MapboxGL.MarkerView>
      )
    })}
    return markers;
  }
}

const styles = StyleSheet.create({
  page: {
    flex: 20,
  },
  holder: {
    flex: 1,
    alignItems: "center", 
    justifyContent: "center",
    position:"absolute",
    // marginTop:"10%",
    // marginBottom: "375%",
    width: 100,
    height: 100
  },
  header:{
    paddingTop: "50%",
    flex: 2,
    position:"absolute",
    height: '100%',
    width: '100%',
  },
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: 'black',
  },
  map: {
    flex: 1,
  },
  circle1:{
    backgroundColor:'red',
    width:30,
    height:30,
    borderRadius: 15
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 10,
  },
});

export default App;