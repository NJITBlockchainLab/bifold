/* eslint-disable no-console */
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { PERMISSIONS, Permission, RESULTS, Rationale, checkMultiple, requestMultiple } from 'react-native-permissions'
import Toast from 'react-native-toast-message'

import BLEScanner from '../components/misc/BLEScanner'
import PermissionDisclosureModal, { DisclosureTypes } from '../components/modals/PermissionDisclosureModal'
import { ToastType } from '../components/toast/BaseToast'
import LoadingView from '../components/views/LoadingView'
import { MultiplePermissionContract } from '../types/permissions'

import { ScanProps } from './Scan'

const ScanBLE: React.FC<ScanProps> = ({ navigation, route }) => {
  const [loading, setLoading] = useState<boolean>(true)
  const [showDisclosureModal, setShowDisclosureModal] = useState<boolean>(true)
  const [disclosureType, setDisclosureType] = useState<DisclosureTypes>('NearbyDevicesDisclosure')
  const { t } = useTranslation()
  
  const permissionFlow = async (
    method: MultiplePermissionContract,
    permission: Permission[],
    rationale?: Rationale
  ): Promise<boolean> => {
    try {
      const permissionResult = await method(permission, rationale)
      let allPermissionsGranted = false
      if (Object.values(permissionResult).length) {
        allPermissionsGranted = Object.values(permissionResult).every((permission) => permission === RESULTS.GRANTED)
      }

      if (allPermissionsGranted) {
        setShowDisclosureModal(false)
        return true
      }
    } catch (error: unknown) {
      Toast.show({
        type: ToastType.Error,
        text1: t('Global.Failure'),
        text2: (error as Error)?.message || t('Error.Unknown'),
        visibilityTime: 2000,
        position: 'bottom',
      })
    }

    return false
  }

  useEffect(() => {
    const asyncEffect = async () => {
      if (Platform.OS === 'android') {
        const isAndroid12OrAbove = Platform.Version >= 31

        const permissions = [
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
        ]

        setDisclosureType(isAndroid12OrAbove ? 'NearbyDevicesDisclosure' : 'LocationDisclosure')
        await permissionFlow(checkMultiple, permissions)
      } else if (Platform.OS === 'ios') {
        await permissionFlow(checkMultiple, [PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL])
      }
      setLoading(false)
    }

    asyncEffect()
  }, [])

  const requestBLEUse = async (rationale?: Rationale): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const isAndroid12OrAbove = Platform.Version >= 31

      const permissions = [
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
      ]

      return await permissionFlow(requestMultiple, permissions, rationale)
    } else if (Platform.OS === 'ios') {
      return await permissionFlow(requestMultiple, [PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL], rationale)
    }

    return false
  }

  if (loading) {
    return <LoadingView />
  }

  if (showDisclosureModal) {
    return <PermissionDisclosureModal requestUse={requestBLEUse} type={disclosureType} />
  } else {
    return <BLEScanner navigation={navigation} route={route} />
  }
}

export default ScanBLE
