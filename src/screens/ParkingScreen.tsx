import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ParkingScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Map')}
        style={styles.iconButton}>
        <Icon name="map" size={30} color="#4CAF50" />
      </TouchableOpacity>
      <Text style={styles.title}>Check available spaces</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for a parking spot"
      />
      <View style={styles.parkingSpot}>
        <Text style={styles.spotTitle}>Lot A - West Campus</Text>
        <TouchableOpacity style={styles.reserveButton}>
          <Text style={styles.reserveText}>Reserve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  iconButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4CAF50',
  },
  searchInput: {
    width: '100%',
    padding: 10,
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  parkingSpot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 5,
  },
  spotTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  reserveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  reserveText: {
    color: '#fff',
  },
});
