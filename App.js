import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps' //marker er named import her
import * as Location from 'expo-location' //finder ud af hvor man er henne

export default function App() {
  const [markers, setMarkers] = useState([]) //markers i flertal fordi det er array vi setter, []
  const [region, setRegion] = useState({  // hook, destructuring assignment, useState tager objekt med fire properties
    latitude: 55,
    longitude: 12,
    latitudeDelta: 20,
    longitudeDelta: 20
  })

  //skal bruge location nu. Vi skal lave reference til MapView objektet i vores return, bruger useRef

  const mapView = useRef<MapView>(null) //holder reference på tværs af renderings. 
  //useState forårsager nu rendering hvis dens værdi/variabel ændres, det gør useRef ikke
  //vi bruger useRef fordi den ikke ændres eller forsvinder eller forårsager renderings
  const locationSubscription = useRef(null) //bruges til at den skal stoppe med at lytte når vi lukker appen
  //locationSubscription er en liestener som skal slukkes når appen lukkes

  useEffect(() => { //skal lytte på hvor man er, gøres i baggrunden
    async function startListening() {
      let { status } = await Location.requestBackgroundPermissionsAsync() //requestB... returnere et objekt, her vil vi kun have status property, destructuring assignment
      if (status !== 'granted') {
        alert("Access to location was not granted")
        return //gøres for at afslutte funktionen hvis ingen access
      }
      //hvis man har sagt ja tak til at dele lokation:
      locationSubscription.current = await Location.watchPositionAsync({ //denne kan overskrives, men ikke const locationSubscription = useRef(null), den er konstant
        distanceInterval: 100,  //hvor mange meter der gør før den opdaterer
        accuracy: Location.Accuracy.High, //skal være på ellers vil Android telefoner ikke vise hvor man er i verden 
      }, (location) => {
        //hvad skal der ske ved ændret lokation: watchPositionAsync tager to objekter
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 20,
          longitudeDelta: 20
        }
        //setter region, så vi placerer kortet der hvor man er henne i verden
        setRegion(newRegion)
        //bare fordi region settes flyttes mappet ikke. Her gøres at mappet grafisk flytter sig:
        if (mapView.current){
          mapView.current.animateToRegion(newRegion)
        }
      })
    }
    startListening()
  })

  function addMarker(data) {
    //alert('hej'), virker, reagere på onLongPress
    const { latitude, longitude } = data.nativeEvent.coordinate //får koordinater for fingertrykket, array destructuring/destructuring assignment igen
    //laver objekt som er vores koordinater
    const newMarker = {
      coordinate: { latitude, longitude }, //dem vi fik lige ovenover
      key: data.timeStamp, //skal have key for hver marker skal være unik, den er random her med timeStamp fra data objektet
      title: "Great place" //hvad der står når man klikker på markeren
    }
    //vores marker tilføjes nu til marker-hook'en
    setMarkers([...markers, newMarker]) //([]) parantes fordi setMarkers er en funktion der tager noget ind og lægger det i markers array, her med spread operator gøres at hele marker array settes først (i den nye array i memory som spread jo laver, vi lægger ikke newMarker i eksisterende markers men laver en ny markers array som nu har newMarker som sidste element) og nye marker kommer til sidst

  }

  function onMarkerPressed(text) {
    alert("you pressed " + text) //alert kan ikke bruge komma, er ikke variadic function
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onLongPress={addMarker} //MapView er en component som er et objekt som har properties, 
      //et af dem er onLongPress, er intrinisci til MapView her, addMarker er en funktion som gives 
      //som value til key/navn på prop'en som er onLongPress. Dette gøres når funktionen skal kaldes
      //senere. Så nu er funktionen gemt i MapView objekt og kan kaldes når som helst. Det er ikke som html onClick hvor funktionen rent faktisk kaldes dér
      //MapView har eventListeners for properties som man kan interagere med dem, som onLongPress
      //eventHandlers er de her funktioner vi selv laver såsom addMarker
      >
        {markers.map(marker => (  //vis marker
          <Marker
            coordinate={marker.coordinate}
            key={marker.key}
            title={marker.title}
            onPress={() => onMarkerPressed(marker.title)} //viste intet først, var fordi jeg longPressede, skal være kort klik
          //inPress har eventlistener også, som venter på tryk
          //vores arrow funktion er event handler, som sker når tryk aktivere eventListener. Arrow funktionen er nu vaue til onPress key/property
          />
        ))
        }
      </MapView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    height: '100%',
    width: '100%',
  }
});
