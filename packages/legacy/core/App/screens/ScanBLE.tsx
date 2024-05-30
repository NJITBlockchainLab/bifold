/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */
import React, { useState, useEffect, useCallback } from 'react'
import {
  PermissionsAndroid,
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
  Pressable,
  Switch,
  NativeModules,
  NativeEventEmitter,
} from 'react-native'
import Button, { ButtonType } from '../components/buttons/Button'
import BleAdvertise from 'react-native-ble-advertise'
import BleManager from 'react-native-ble-manager'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'
import { useAnimatedComponents } from '../contexts/animated-components'

// Define the local device interface for TypeScript
interface LocalDevice {
  id: string
  name?: string
}

// Styling for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
  },
  device: {
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  deviceName: {
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
  const [discoverable, setDiscoverable] = useState<boolean>()
  const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(null)
  const BleManagerModule = NativeModules.BleManager;
  const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);
  const { ColorPallet, TextTheme } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const { t } = useTranslation()

  const handleDiscoverPeripheral = (peripheral: { id: string; name: any }) => {
    if (peripheral && peripheral.id && peripheral.name) {
      setDevices((prevDevices) => {
        console.log(prevDevices)
        const deviceExists = prevDevices.some((device) => device.id === peripheral.id)
        return deviceExists ? prevDevices : [...prevDevices, { id: peripheral.id, name: peripheral.name }]
      })
    }
  }

  useEffect(() => {
    BleManager.start({ showAlert: false }).catch((error) => {
      console.error('BleManager initialization error:', error)
    })

    let stopListener = BleManagerEmitter.addListener(
      'BleManagerStopScan',
      () => {
        setIsScanning(false);
        console.log('Scan is stopped');
      },
    );

    const subscription = BleManager.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral)
    return () => {
      stopListener.remove()
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
    console.log(permissionsGranted)
    if (permissionsGranted) {
      setDevices([]) // Clear devices list before scanning
      BleManager.scan([], 10, true)
      .then(() => {
          setIsScanning(true)
        })
        .catch((err: any) => {
          console.error('Scan failed', err)
          setIsScanning(false)
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
      <Text style={[TextTheme.title]}>{item.name}</Text>
      <Button title="Connect" onPress={() => connectToDevice(item.id)} buttonType={ButtonType.Secondary} />
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
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 20,
        }}
      >
        <View style={{ flexShrink: 1, marginRight: 10, justifyContent: 'center' }}>
          <Text style={[TextTheme.bold]}>{t('ScanBLE.MakeDiscoverable')}</Text>
        </View>
        <View style={{ justifyContent: 'center' }}>
          <Pressable
            testID={testIdWithKey('ToggleBluetooth')}
            accessible
            accessibilityLabel={t('ScanBLE.Toggle')}
            accessibilityRole={'switch'}
          >
            <Switch
              trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
              thumbColor={discoverable ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
              ios_backgroundColor={ColorPallet.grayscale.lightGrey}
              onValueChange={(value) => setDiscoverable(value)}
              value={discoverable}
              // disabled={!biometryAvailable}
            />
          </Pressable>
        </View>
      </View>
      <View style={{marginBottom: 10}}>
        <Text style={[TextTheme.normal]}>{t('ScanBLE.Text1')}</Text>
      </View>
      {!isScanning && devices.length === 0 && <Text style={styles.noDevicesText}>No devices found.</Text>}
      <FlatList data={devices} renderItem={renderItem} keyExtractor={(item) => item.id} />
      {connectedDeviceId && <Text>Connected to device: {connectedDeviceId}</Text>}
      <Button title={t('ScanBLE.ScanDevices')} onPress={startScan} disabled={isScanning} buttonType={ButtonType.Primary}>
        {isScanning && <ButtonLoading />}
      </Button>
      {/* <Button title="Advertise as peripheral" onPress={startBLEAdvertising} buttonType={ButtonType.Primary} /> */}
    </SafeAreaView>
  )
}

export default ScanBLE
