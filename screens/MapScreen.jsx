import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, ScrollView, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import { getDistance } from 'geolib';

const MapScreen = ({ navigation }) => {
  const [hospitals, setHospitals] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [nearestHospital, setNearestHospital] = useState(null);
  const [travelTime, setTravelTime] = useState(null);

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
      } else {
        Alert.alert('Permission Denied', 'Location permission is required to find the nearest hospital.');
      }
    };

    fetchHospitals();
    getLocation();
  }, []);

  useEffect(() => {
    if (currentLocation && hospitals.length > 0) {
      const distances = hospitals.map(hospital => {
        const distance = getDistance(
          { latitude: hospital.location.coordinates[0], longitude: hospital.location.coordinates[1] },
          currentLocation
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

  const handleGetTravelTime = (duration) => {
    setTravelTime(duration);
    Alert.alert("Travel Time", `It will take approximately ${duration} minutes to reach the nearest hospital.`);
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      <TouchableWithoutFeedback onPress={() => setSelectedHospital(null)}>
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
                latitude: hospital.location.coordinates[0],
                longitude: hospital.location.coordinates[1],
              }}
              title={hospital.name}
              description={hospital.description}
              onPress={() => setSelectedHospital(hospital)}
            />
          ))}
          {currentLocation && nearestHospital && (
            <MapViewDirections
              apikey={"AIzaSyCNWnIGrkR4kMpdia1t3i6_Pnn-8hYNgsM"}
              origin={currentLocation}
              destination={{
                latitude: nearestHospital.location.coordinates[0] || 0,
                longitude: nearestHospital.location.coordinates[1] || 0,
              }}
              strokeWidth={3}
              strokeColor="hotpink"
              onError={(errorMessage) => {
                console.error("Directions API Error: ", errorMessage);
                Alert.alert("Error", "Unable to get directions at the moment.");
              }}
              onReady={result => handleGetTravelTime(Math.ceil(result.duration))}
            />
          )}
        </MapView>
      </TouchableWithoutFeedback>

      {selectedHospital && (
        <View style={styles.sidebar}>
          <ScrollView>
            <Text style={styles.sidebarTitle}>{selectedHospital.name}</Text>
            <Text style={styles.sidebarSubtitle}>Contact:</Text>
            <Text>Phone: {selectedHospital.contact.phone}</Text>
            <Text>Email: {selectedHospital.contact.email}</Text>
            <Text style={styles.sidebarSubtitle}>Address:</Text>
            <Text>{selectedHospital.contact.address.street}</Text>
            <Text>{selectedHospital.contact.address.city}, {selectedHospital.contact.address.state} {selectedHospital.contact.address.postalCode}</Text>
            <Text style={styles.sidebarSubtitle}>Services:</Text>
            <Text>{selectedHospital.services.join(', ')}</Text>
            <Text style={styles.sidebarSubtitle}>Operating Hours:</Text>
            
            {(() => {
              const operatingDays = Object.keys(selectedHospital.operatingHours);
              const firstDay = operatingDays[0].charAt(0).toUpperCase() + operatingDays[0].slice(1);
              const lastDay = operatingDays[operatingDays.length - 1].charAt(0).toUpperCase() + operatingDays[operatingDays.length - 1].slice(1);
              return (
                <Text>{firstDay} - {lastDay}: {selectedHospital.operatingHours[firstDay.toLowerCase()].open} - {selectedHospital.operatingHours[lastDay.toLowerCase()].close}</Text>
              );
            })()}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedHospital(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {travelTime && (
        <Text style={styles.travelTimeText}>
          Estimated Time to Nearest Hospital: {travelTime} minutes
        </Text>
      )}

      <TextInput
        style={styles.searchInput}
        placeholder="Search hospitals and services... "
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
    zIndex:3
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  travelTimeText: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    
  },
});

export default MapScreen;
