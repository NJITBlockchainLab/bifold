/* eslint-disable no-console */
import { DidExchangeState } from '@aries-framework/core'
import { useAgent } from '@aries-framework/react-hooks'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  Switch,
  FlatList,
  StyleSheet,
  NativeEventEmitter,
  NativeModules,
  Alert,
} from 'react-native'
import BleManager from 'react-native-ble-manager'

import ButtonLoading from '../../components/animated/ButtonLoading'
import Button, { ButtonType } from '../../components/buttons/Button'
import { domain } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { useConnectionByOutOfBandId } from '../../hooks/connections'
import { ScanProps } from '../../screens/Scan'
import { Stacks, Screens } from '../../types/navigators'
import { createConnectionInvitation, stringToBytes } from '../../utils/helpers'
import { handleInvitation } from '../../utils/invitation'
import { testIdWithKey } from '../../utils/testable'

const { BleAdvertise } = NativeModules

// Define the local device interface for TypeScript
interface LocalDevice {
  id: string
  name?: string
  rssi?: number
  advertising?: Advertising
}

interface Advertising {
  serviceUUIDs: string[]
}

// Styling for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  device: {
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceName: {
    fontWeight: 'bold',
  },
  noDevicesText: {
    textAlign: 'center',
    marginTop: 20,
  },
})

const BLEScanner: React.FC<ScanProps> = ({ navigation, route }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [recordId, setRecordId] = useState<string | undefined>(undefined)
  const [devices, setDevices] = useState<LocalDevice[]>([])
  const [discoverable, setDiscoverable] = useState<boolean>()
  const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(null)
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState<boolean>(false)
  const { ColorPallet, TextTheme } = useTheme()
  const bleManagerModule = NativeModules.BleManager
  const bleManagerEmitter = new NativeEventEmitter(bleManagerModule)
  const bleAdvertiseEmitter = new NativeEventEmitter(NativeModules.BleAdvertise)
  const { agent } = useAgent()
  const { t } = useTranslation()

  const record = useConnectionByOutOfBandId(recordId || '')
  const uuid = '1357d860-1eb6-11ef-9e35-0800200c9a66'
  const cuuid = 'd918d942-8516-4165-922f-dd6823d32b2f'
  let receivedInvitation = ''

  BleAdvertise.setCompanyId(0x00e0)

  const handleBleManagerDidUpdateState = (args: { state: string }) => {
    if (args.state === 'on') {
      setIsBluetoothEnabled(true)
    } else {
      setIsBluetoothEnabled(false)
    }
  }

  const handleDiscoverPeripheral = (peripheral: LocalDevice) => {
    console.log(peripheral)
    if (peripheral && peripheral.id && peripheral.name) {
      setDevices((prevDevices) => {
        const deviceExists = prevDevices.some((device) => device.id === peripheral.id)
        if (!deviceExists) console.log(peripheral)
        return deviceExists
          ? prevDevices
          : [...prevDevices, { id: peripheral.id, name: peripheral.name, rssi: peripheral.rssi }]
      })
    }
  }

  const handleRead = async ({ data }: { data: string }) => {
    console.log('Received data from', cuuid, 'in service', uuid)
    console.log('Data:', data)

    receivedInvitation += data

    if (data.includes('\n')) {
      receivedInvitation.replace('\n', '')
      await handleInvitation(navigation, route, agent, receivedInvitation)
    }
  }

  useEffect(() => {
    BleManager.start({ showAlert: false }).catch((error) => {
      console.error('BleManager initialization error:', error)
    })

    const updateListener = bleManagerEmitter.addListener('BleManagerDidUpdateState', handleBleManagerDidUpdateState)

    BleManager.checkState()

    const stopListener = bleManagerEmitter.addListener('BleManagerStopScan', () => {
      setIsScanning(false)
      console.log('Scan is stopped')
    })

    const discoverListener = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral)

    const readListener = bleAdvertiseEmitter.addListener('onRead', handleRead)

    return () => {
      updateListener.remove()
      stopListener.remove()
      discoverListener.remove()
      readListener.remove()
    }
  }, [])

  useEffect(() => {
    console.log(record)
    if (record?.state === DidExchangeState.Completed) {
      navigation.getParent()?.navigate(Stacks.ConnectionStack, {
        screen: Screens.Connection,
        params: { connectionId: record.id },
      })
    }
  }, [record])

  const startScan = async () => {
    setDevices([]) // Clear devices list before scanning
    BleManager.scan([uuid], 10, true)
      .then(() => {
        setIsScanning(true)
      })
      .catch((err: any) => {
        console.error('Scan failed', err)
        setIsScanning(false)
      })
  }

  const createInvitation = async (): Promise<string> => {
    const result = await createConnectionInvitation(agent)
    setRecordId(result.record.id)
    return result.record.outOfBandInvitation.toUrl({ domain }) + '\n' // Add delimiter \n to detect completion in bluetooth send
  }

  const sendInvitation = async (deviceId: string, invitationURL: string) => {
    await BleManager.write(deviceId, uuid, cuuid, stringToBytes(invitationURL))
      .then(() => {
        console.log('Invitation URL sent successfully')
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const disconnectDevice = (deviceId: string) => {
    BleManager.disconnect(deviceId)
      .then(() => {
        // Success code
        console.log('Disconnected')
      })
      .catch((error) => {
        // Failure code
        console.log(error)
      })
  }

  const connectToDevice = (deviceId: string) => {
    BleManager.connect(deviceId)
      .then(async () => {
        console.log('Connected to', deviceId)
        setConnectedDeviceId(deviceId)
        // Alert.alert('Connection Successful', `Connected to device ${deviceId}`)

        return BleManager.retrieveServices(deviceId)
      })
      .then(async (peripheralInfo) => {
        console.log('Peripheral info:', peripheralInfo)
        const invitationURL = await createInvitation()

        console.log(invitationURL)
        return sendInvitation(deviceId, invitationURL)
      })
      .then(() => {
        disconnectDevice(deviceId)
      })
      .catch((err: any) => {
        console.error('Connection failed', err)
        Alert.alert('Connection Failed', `Failed to connect to device ${deviceId}`)
      })
  }

  const startAdvertising = async () => {
    setDiscoverable(true)
    console.log('permissionsGranted')
    // const permissionsGranted = await requestPermissions()
    // console.log(permissionsGranted)
    // if (permissionsGranted) {
    try {
      BleAdvertise.broadcast(uuid, cuuid, {
        includeDeviceName: true,
      })
        .then((success: any) => {
          console.log(success)
        })
        .catch((error: string) => {
          console.log('broadcast failed with: ' + error)
        })
    } catch (error) {
      console.log('Broadcast failed with: ' + error)
      Alert.alert('Broadcast Failed', `Failed to start broadcasting: ${error}`)
    }
    // } else {
    //   console.log('Permissions not granted')
    //   Alert.alert('Permissions Denied', 'Necessary permissions are not granted')
    // }
  }

  const stopAdvertising = async () => {
    setDiscoverable(false)
    try {
      await BleAdvertise.stopBroadcast()
      console.log('Stopped advertising')
    } catch (error) {
      console.error('Failed to stop advertising:', error)
    }
  }

  const renderItem = ({ item }: { item: LocalDevice }) => (
    <View style={styles.device}>
      <Text style={[TextTheme.title]}>{item.name}</Text>
      <Button title="Connect" onPress={() => connectToDevice(item.id)} buttonType={ButtonType.Secondary} />
    </View>
  )

  if (!isBluetoothEnabled) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 10, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ marginBottom: 10, alignContent: 'center' }}>
          <Text style={[TextTheme.bold]}>{t('ScanBLE.BluetoothText')}</Text>
        </View>
      </SafeAreaView>
    )
  } else {
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
                onValueChange={(value) => (value ? startAdvertising() : stopAdvertising())}
                value={discoverable}
                // disabled={!biometryAvailable}
              />
            </Pressable>
          </View>
        </View>
        <View style={{ marginBottom: 10 }}>
          <Text style={[TextTheme.normal]}>{t('ScanBLE.Text1')}</Text>
        </View>
        {!isScanning && devices.length === 0 && <Text style={styles.noDevicesText}>No devices found.</Text>}
        <FlatList data={devices} renderItem={renderItem} keyExtractor={(item) => item.id} />
        {connectedDeviceId && <Text>Connected to device: {connectedDeviceId}</Text>}
        <Button
          title={t('ScanBLE.ScanDevices')}
          onPress={startScan}
          disabled={isScanning}
          buttonType={ButtonType.Primary}
        >
          {isScanning && <ButtonLoading />}
        </Button>
      </SafeAreaView>
    )
  }
}

export default BLEScanner
