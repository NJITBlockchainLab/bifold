import { DidExchangeState } from '@aries-framework/core'
import { useAgent } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, Text, ScrollView, useWindowDimensions } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import LoadingIndicator from '../components/animated/LoadingIndicator'
import QRRenderer from '../components/misc/QRRenderer'
import { domain } from '../constants'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useConnectionByOutOfBandId } from '../hooks/connections'
import { QrCodeScanError } from '../types/error'
import { Screens, Stacks, ConnectStackParams } from '../types/navigators'
import { createConnectionInvitation } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

type ConnectProps = StackScreenProps<ConnectStackParams>

interface Props extends ConnectProps {
  defaultToConnect: boolean
  handleCodeScan: (value: string) => Promise<void>
  error?: QrCodeScanError | null
  enableCameraOnError?: boolean
}

const QRCodeGen: React.FC<Props> = ({ navigation }) => {
  const { width } = useWindowDimensions()
  const qrSize = width - 40
  const [store] = useStore()
  const [invitation, setInvitation] = useState<string | undefined>(undefined)
  const [recordId, setRecordId] = useState<string | undefined>(undefined)
  const { t } = useTranslation()
  const { ColorPallet, TextTheme, TabTheme } = useTheme()
  const { agent } = useAgent()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPallet.brand.secondaryBackground,
    },
    camera: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cameraViewContainer: {
      alignItems: 'center',
      flex: 1,
      width: '100%',
    },
    viewFinder: {
      width: 250,
      height: 250,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: ColorPallet.grayscale.white,
    },
    viewFinderContainer: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      paddingHorizontal: 20,
    },
    icon: {
      color: ColorPallet.grayscale.white,
      padding: 4,
    },
    tabContainer: {
      flexDirection: 'row',
      ...TabTheme.tabBarStyle,
    },
    qrContainer: {
      marginTop: 10,
      flex: 1,
    },
    walletName: {
      ...TextTheme.headingTwo,
      textAlign: 'center',
      marginBottom: 20,
    },
    secondaryText: {
      ...TextTheme.normal,
      textAlign: 'center',
    },
    editButton: { ...TextTheme.headingTwo, marginBottom: 20, marginLeft: 10, color: ColorPallet.brand.primary },
  })

  const createInvitation = useCallback(async () => {
    setInvitation(undefined)
    const result = await createConnectionInvitation(agent)
    if (result) {
      setRecordId(result.record.id)
      setInvitation(result.record.outOfBandInvitation.toUrl({ domain }))
    }
  }, [])

  const handleEdit = () => {
    navigation.navigate(Screens.NameWallet)
  }

  useEffect(() => {
    createInvitation()
  }, [])

  const record = useConnectionByOutOfBandId(recordId || '')

  useEffect(() => {
    if (record?.state === DidExchangeState.Completed) {
      navigation.getParent()?.navigate(Stacks.ConnectionStack, {
        screen: Screens.Connection,
        params: { connectionId: record.id },
      })
    }
  }, [record])

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      <ScrollView>
        <View style={{ alignItems: 'center' }}>
          <View style={styles.qrContainer}>
            {!invitation && <LoadingIndicator />}
            {invitation && <QRRenderer value={invitation} size={qrSize} />}
          </View>
          <View style={{ paddingHorizontal: 20, flex: 1 }}>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text testID={testIdWithKey('WalletName')} style={[styles.walletName, { paddingHorizontal: 20 }]}>
                {store.preferences.walletName}
              </Text>
              <TouchableOpacity
                accessibilityLabel={t('NameWallet.EditWalletName')}
                testID={testIdWithKey('EditWalletName')}
                onPress={handleEdit}
              >
                <Icon style={styles.editButton} name="edit" size={24}></Icon>
              </TouchableOpacity>
            </View>
            <Text style={styles.secondaryText}>{t('Connection.ShareQR')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default QRCodeGen
