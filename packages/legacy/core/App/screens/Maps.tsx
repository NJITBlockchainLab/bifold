import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'

import { useTheme } from '../contexts/theme'

const Maps = () => {
  const { ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPallet.brand.secondaryBackground,
    },
    map: {
      width: '100%',
      height: '100%',
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <MapView
          provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          region={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
        ></MapView>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Maps
