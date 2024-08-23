import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from './screens/MapScreen.jsx';
import HospitalDetailsScreen from './screens/HospitalDetailsScreen';
import { HeaderTitle } from 'react-navigation-stack';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Map">
        {/* <Stack.Screen name="Map" component={MapScreen} /> */}
        <Stack.Screen name="Map" component={MapScreen}options={{headerTitleAlign:"center"}} />
        <Stack.Screen name="HospitalDetails" component={HospitalDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
