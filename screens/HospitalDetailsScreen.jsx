import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import axios from 'axios';

const HospitalDetailsScreen = ({ route }) => {
  const { hospitalId } = route.params;
  const [hospital, setHospital] = useState(null);

  useEffect(() => {
    axios.get(`https://hospitalgisapi.onrender.com/api/hospital/${hospitalId}`)
      .then(response => {
        setHospital(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, [hospitalId]);

  if (!hospital) return <Text style={styles.loadingText}>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{hospital.name}</Text>
        <Text style={styles.description}>{hospital.description}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact Information</Text>
        <Text style={styles.cardText}>Phone: {hospital.contact.phone}</Text>
        <Text style={styles.cardText}>Email: {hospital.contact.email}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Address</Text>
        <Text style={styles.cardText}>{hospital.contact.address.street}</Text>
        <Text style={styles.cardText}>{hospital.contact.address.city}, {hospital.contact.address.state} {hospital.contact.address.postalCode}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Services</Text>
        <Text style={styles.cardText}>{hospital.services.join(', ')}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Operating Hours</Text>
        {Object.keys(hospital.operatingHours).map(day => (
          <Text key={day} style={styles.cardText}>
            {day.charAt(0).toUpperCase() + day.slice(1)}: {hospital.operatingHours[day].open} - {hospital.operatingHours[day].close}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  loadingText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
});

export default HospitalDetailsScreen;
