/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */
import React, { useState, useEffect, useCallback } from 'react'
import {
  PermissionsAndroid,
  SafeAreaView,
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native'
import BleAdvertise from 'react-native-ble-advertise'
import BleManager from 'react-native-ble-manager'

// Define the local device interface for TypeScript
interface LocalDevice {
  id: string
  name?: string
}

// Styling for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  device: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  deviceName: {
    color: '#000000',
    fontWeight: 'bold',
  },
  noDevicesText: {
    textAlign: 'center',
    marginTop: 20,
  },
})

const ScanBLE = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [devices, setDevices] = useState<LocalDevice[]>([])
  const [scanFinished, setScanFinished] = useState(false)
  const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(null)

  const handleDiscoverPeripheral = (peripheral: { id: string; name: any }) => {
    if (peripheral && peripheral.id && peripheral.name) {
      setDevices((prevDevices) => {
        const deviceExists = prevDevices.some((device) => device.id === peripheral.id)
        return deviceExists ? prevDevices : [...prevDevices, { id: peripheral.id, name: peripheral.name }]
      })
    }
  }

  useEffect(() => {
    BleManager.start({ showAlert: false }).catch((error) => {
      console.error('BleManager initialization error:', error)
    })

    const subscription = BleManager.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral)
    return () => {
      subscription.remove()
    }
  }, [])

  const requestPermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]

      const granted = await PermissionsAndroid.requestMultiple(permissions)

      const allPermissionsGranted = Object.values(granted).every(
        (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
      )

      return allPermissionsGranted
    }
    return true
  }, [])

  const startScan = useCallback(async () => {
    const permissionsGranted = await requestPermissions()
    if (permissionsGranted) {
      setDevices([]) // Clear devices list before scanning
      setIsScanning(true)
      setScanFinished(false)
      BleManager.scan([], 10, true)
        .then(() => {
          console.log('Scanning...')
          setTimeout(() => {
            setIsScanning(false)
            setScanFinished(true)
            if (devices.length === 0) {
              Alert.alert('Scan Complete', 'No devices found.')
            }
            console.log('Scan complete')
          }, 10000) // Adjusted timeout to match scan duration
        })
        .catch((err: any) => {
          console.error('Scan failed', err)
          setIsScanning(false)
          setScanFinished(true)
        })
    } else {
      console.log('Permissions not granted')
    }
  }, [requestPermissions, devices])

  const connectToDevice = (deviceId: string) => {
    BleManager.connect(deviceId)
      .then(() => {
        console.log('Connected to', deviceId)
        setConnectedDeviceId(deviceId)
        Alert.alert('Connection Successful', `Connected to device ${deviceId}`)
      })
      .catch((err: any) => {
        console.error('Connection failed', err)
        Alert.alert('Connection Failed', `Failed to connect to device ${deviceId}`)
      })
  }

  const renderItem = ({ item }: { item: LocalDevice }) => (
    <View style={styles.device}>
      <Text style={styles.deviceName}>{item.name}</Text>
      <Text style={styles.deviceName}>ID: {item.id}</Text>
      <Button title="Connect" onPress={() => connectToDevice(item.id)} />
    </View>
  )

  const startBLEAdvertising = async () => {
    const permissionsGranted = await requestPermissions()
    if (permissionsGranted) {
      const uuid = '44C13E43-097A-9C9F-537F-5666A6840C08'
      const major = '00001'
      const minor = '00003'
      try {
        BleAdvertise.setCompanyId('0x00e0')
        await BleAdvertise.broadcast(uuid, major, minor)
        console.log('Broadcast started')
        Alert.alert('Broadcast Started', 'Your device is now broadcasting as a peripheral')
      } catch (error) {
        console.log('Broadcast failed with: ' + error)
        Alert.alert('Broadcast Failed', `Failed to start broadcasting: ${error}`)
      }
    } else {
      console.log('Permissions not granted')
      Alert.alert('Permissions Denied', 'Necessary permissions are not granted')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Scan for devices" onPress={startScan} disabled={isScanning} />
      <Button title="Advertise as peripheral" onPress={startBLEAdvertising} />
      {scanFinished && devices.length === 0 && <Text style={styles.noDevicesText}>No devices found.</Text>}
      <FlatList data={devices} renderItem={renderItem} keyExtractor={(item) => item.id} />
      {connectedDeviceId && <Text>Connected to device: {connectedDeviceId}</Text>}
    </SafeAreaView>
  )
}

export default ScanBLE
