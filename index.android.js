/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Alert,
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import MapView from 'react-native-maps';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  maps: {
    ...StyleSheet.absoluteFillObject,
  },
});

var wholeMarkers = [];
var idx = 0;

export default class ReactNativeMapSample extends Component {

  constructor(props){
        super(props);

        this.state = {
            region: {
              latitude: 37.46923,
              longitude: 126.90664,
              latitudeDelta: 5,
              longitudeDelta: 5,
            },
            markers: [],
        };

        this.insertMarkers()
  }

  insertMarkers() {
    fetch('http://dalinmang.com/pins.json')
      .then((response) => response.json())
      .then((responseData) => {
        var len = responseData.length

        for ( var i = 0; i < len; i++ ) {
          var coord = {
            latitude: responseData[i].lat,
            longitude: responseData[i].lng,
          }
          wholeMarkers.push({coordinate: coord})
        }

        this.onRegionChange(this.state.region);
      })
  }

  onRegionChange = (region) => {
    var tempMarkers = [];
    var top = region.latitude - (region.latitudeDelta / 2);
    var left = region.longitude - (region.longitudeDelta / 2);
    var bottom = region.latitude + (region.latitudeDelta / 2);
    var right = region.longitude + (region.longitudeDelta / 2);

    // filtering
    {
      var len = wholeMarkers.length
      for ( var i = 0; i < len; i++ ) {
        var lat = wholeMarkers[i].coordinate.latitude;
        var lng = wholeMarkers[i].coordinate.longitude;
        if ( top <= lat && lat <= bottom && left <= lng && lng <= right )
          tempMarkers.push(wholeMarkers[i]);
      }
    }

    // clustering
    var resultMarkers = [];
    {
      const LATITUDE_PARTS = 5;
      const LONGITUDE_PARTS = 4;

      // init
      var cl = [];
      for ( var i = 0; i < LATITUDE_PARTS; i++ ) {
        cl[i] = [];
        for ( var j = 0; j < LONGITUDE_PARTS; j++ ) {
          cl[i][j] = [];
        }
      }

      // routine
      var len = tempMarkers.length;
      for ( var i = 0; i < len; i++ ) {
        var lat = tempMarkers[i].coordinate.latitude;
        var lng = tempMarkers[i].coordinate.longitude;
        var r = Math.floor(LATITUDE_PARTS * (lat - top) / region.latitudeDelta);
        var c = Math.floor(LONGITUDE_PARTS * (lng - left) / region.longitudeDelta);
        cl[r][c].push(tempMarkers[i]);
      }

      // result
      for ( var i = 0; i < LATITUDE_PARTS; i++ ) {
        for ( var j = 0; j < LONGITUDE_PARTS; j++ ) {
          var len = cl[i][j].length;
          var avg_lat = 0;
          var avg_lng = 0;

          if ( len == 0 )
            continue;

          for ( var k = 0; k < len; k++ ) {
            avg_lat += cl[i][j][k].coordinate.latitude;
            avg_lng += cl[i][j][k].coordinate.longitude;
          }
          avg_lat /= len;
          avg_lng /= len;

          var coord = {
            latitude: avg_lat,
            longitude: avg_lng,
          }
          resultMarkers.push({coordinate: coord, key: idx++, alpha: "rgba(200, 0, 0, "+(0.3 + (0.1*len))+")"})
        }
      }
    }

    // set state
    this.setState({markers: resultMarkers, region: region})
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView
          provider={this.props.provider}
          style={styles.maps}
          initialRegion={this.state.region}
          onRegionChangeComplete={this.onRegionChange}
        >
          {this.state.markers.map(marker => (
            <MapView.Circle
              key={marker.key}
              center={marker.coordinate}
              radius={4000 * this.state.region.latitudeDelta}
              fillColor={marker.alpha}
              strokeColor="rgba(0, 0, 0, 0.3)"
            />
          ))}
        </MapView>
      </View>
    );
  }
}

AppRegistry.registerComponent('ReactNativeMapSample', () => ReactNativeMapSample);
