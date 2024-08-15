import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import * as Location from 'expo-location';

const MapScreen = ({ navigation }) => {
  const [hospitals, setHospitals] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [nearestHospital, setNearestHospital] = useState(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await axios.get('https://hospitalgisapi.onrender.com/api/hospital');
        setHospitals(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');

      if (status === 'granted') {
        const { coords } = await Location.getCurrentPositionAsync();
        setCurrentLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      }
    };

    fetchHospitals();
    getLocation();
  }, []);

  useEffect(() => {
    if (currentLocation && hospitals.length > 0) {
      const distances = hospitals.map(hospital => {
        const distance = Math.sqrt(
          Math.pow(hospital.location.coordinates[0] - currentLocation.latitude, 2) +
          Math.pow(hospital.location.coordinates[1] - currentLocation.longitude, 2)
        );
        return { ...hospital, distance };
      });
      const nearest = distances.reduce((prev, curr) => (prev.distance < curr.distance ? prev : curr));
      setNearestHospital(nearest);
    }
  }, [currentLocation, hospitals]);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (hasLocationPermission === false) return <Text>No access to location.</Text>;

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(search.toLowerCase()) ||
    hospital.services.some(service => service.toLowerCase().includes(search.toLowerCase()))
  );

//   console.log(
//     { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
//     { latitude: nearestHospital.latitude, longitude: nearestHospital.longitude }
//   )
console.log(nearestHospital.location.coordinates)
  return (
    <View style={styles.container}>
      <MapView
        customMapStyle={require("../src/components/map.json")}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation ? currentLocation.latitude : 5.0382,
          longitude: currentLocation ? currentLocation.longitude : 7.8340,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {filteredHospitals.map(hospital => (
          <Marker
            key={hospital._id}
            coordinate={{
              latitude: 0.1,
              longitude: 0.1,
            }}
            title={hospital.name}
            description={hospital.description}
            onPress={() => {
              setSelectedHospital(hospital);
              navigation.navigate('HospitalDetails', { hospitalId: hospital._id });
            }}
          />
        ))}
        {currentLocation && nearestHospital && (
          <Polyline
            coordinates={[
              { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
              { latitude: nearestHospital.location.coordinates[0], longitude:nearestHospital.location.coordinates[1] }
            ]}
            strokeColor="#FF0000"
            strokeWidth={2}
          />
        )}
      </MapView>

      {selectedHospital && (
        <View style={styles.sidebar}>
          <ScrollView>
            <Text style={styles.sidebarTitle}>{selectedHospital.name}</Text>
            <Text style={styles.sidebarSubtitle}>Description:</Text>
            <Text>{selectedHospital.description}</Text>
            <Text style={styles.sidebarSubtitle}>Contact:</Text>
            <Text>Phone: {selectedHospital.contact.phone}</Text>
            <Text>Email: {selectedHospital.contact.email}</Text>
            <Text style={styles.sidebarSubtitle}>Address:</Text>
            <Text>{selectedHospital.contact.address.street}</Text>
            <Text>{selectedHospital.contact.address.city}, {selectedHospital.contact.address.state} {selectedHospital.contact.address.postalCode}</Text>
            <Text style={styles.sidebarSubtitle}>Services:</Text>
            <Text>{selectedHospital.services.join(', ')}</Text>
            <Text style={styles.sidebarSubtitle}>Operating Hours:</Text>
            {Object.keys(selectedHospital.operatingHours).map(day => (
              <Text key={day}>{day.charAt(0).toUpperCase() + day.slice(1)}: {selectedHospital.operatingHours[day].open} - {selectedHospital.operatingHours[day].close}</Text>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedHospital(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      <TextInput
        style={styles.searchInput}
        placeholder="Search hospitals..."
        value={search}
        onChangeText={setSearch}
      />
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
  sidebar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sidebarSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  closeButton: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchInput: {
    position: 'absolute',
    top: 20,
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default MapScreen;
