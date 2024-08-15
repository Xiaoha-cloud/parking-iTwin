import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Map')}
        style={{position: 'absolute', top: 20, left: 20}}>
        <Icon name="map" size={30} color="#000" />
      </TouchableOpacity>
      <Text>Home Screen</Text>
    </View>
  );
}
