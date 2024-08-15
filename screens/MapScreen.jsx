import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';

const MapScreen = ({ navigation }) => {
  const [hospitals, setHospitals] = useState([]);
    console.log(hospitals)
  useEffect(() => {
    axios.get('https://hospitalgisapi.onrender.com/api/hospital')
      .then(response => {
        setHospitals(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
            latitude: 5.0452,       // Latitude for Uyo
            longitude: 7.8333,      // Longitude for Uyo
            latitudeDelta: 0.0922,  // Adjust this value to zoom in or out
            longitudeDelta: 0.0421, // Adjust this value to zoom in or out
          }}
      >
        {hospitals.map(hospital => (
          <Marker
            key={hospital._id}
            coordinate={{
              latitude: 5.010688751707921,
              longitude: 7.861493196128016,
            }}
            title={hospital.name}
            description={hospital.description}
            onPress={() => navigation.navigate('HospitalDetails', { hospitalId: hospital._id })}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;
