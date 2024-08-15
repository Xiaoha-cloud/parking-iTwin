import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import MapView, {Marker, Callout} from 'react-native-maps';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 53.279326,
          longitude: -9.057267,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}>
        <Marker
          coordinate={{latitude: 53.279326, longitude: -9.057267}}
          title="Bodkin">
          <Callout>
            <View style={styles.callout}>
              <Text style={styles.title}>Parking</Text>
              <Text>Cars: 3 Stands: 15</Text>
            </View>
          </Callout>
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  callout: {
    width: 150,
  },
  title: {
    fontWeight: 'bold',
  },
});
