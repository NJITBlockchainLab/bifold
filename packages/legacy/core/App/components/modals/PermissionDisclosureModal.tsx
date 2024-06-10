import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, ScrollView, StyleSheet, Text, View, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '../../contexts/theme'
import { Screens, HomeStackParams, TabStacks, Stacks } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'

import DismissiblePopupModal from './DismissiblePopupModal'

interface PermissionDisclosureModalProps {
  type: 'CameraDisclosure' | 'NearbyDevicesDisclosure' | 'LocationDisclosure'
  requestUse: () => Promise<boolean>
}

const PermissionDisclosureModal: React.FC<PermissionDisclosureModalProps> = ({ type, requestUse }) => {
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<HomeStackParams>>()
  const [modalVisible, setModalVisible] = useState(true)
  const [showSettingsPopup, setShowSettingsPopup] = useState(false)
  const [requestInProgress, setRequestInProgress] = useState(false)
  const { ColorPallet, TextTheme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: ColorPallet.brand.modalPrimaryBackground,
      padding: 20,
    },
    messageText: {
      marginTop: 30,
    },
    controlsContainer: {
      backgroundColor: ColorPallet.brand.modalPrimaryBackground,
      marginTop: 'auto',
      margin: 20,
    },
    buttonContainer: {
      paddingTop: 10,
    },
  })

  const onContinueTouched = async () => {
    setRequestInProgress(true)
    const granted = await requestUse()
    if (!granted) {
      setShowSettingsPopup(true)
    }
    setRequestInProgress(false)
  }

  const onOpenSettingsTouched = async () => {
    setModalVisible(false)
    await Linking.openSettings()
    if (type == 'CameraDisclosure') {
      navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
    } else {
      navigation.getParent()?.navigate(Stacks.SettingStack, { screen: Screens.ScanBLE })
    }
  }

  const onNotNowTouched = () => {
    setModalVisible(false)
    if (type == 'CameraDisclosure') {
      navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
    } else {
      navigation.getParent()?.navigate(Stacks.SettingStack, { screen: Screens.ScanBLE })
    }
  }

  const onOpenSettingsDismissed = () => {
    setShowSettingsPopup(false)
  }

  return (
    <Modal visible={modalVisible} animationType={'slide'} supportedOrientations={['portrait', 'landscape']} transparent>
      {showSettingsPopup && (
        <DismissiblePopupModal
          title={t(`${type}.AllowUse`)}
          description={t(`${type}.ToContinueUsing`)}
          onCallToActionLabel={t(`${type}.OpenSettings`)}
          onCallToActionPressed={onOpenSettingsTouched}
          onDismissPressed={onOpenSettingsDismissed}
        />
      )}
      <SafeAreaView style={{ backgroundColor: ColorPallet.brand.modalPrimaryBackground }}>
        <ScrollView style={[styles.container]}>
          <Text style={[TextTheme.modalHeadingOne]} testID={testIdWithKey('AllowUse')}>
            {t(`${type}.AllowUse`)}
          </Text>
          <Text style={[TextTheme.modalNormal, styles.messageText]}>{t(`${type}.Disclosure`)}</Text>
          <Text style={[TextTheme.modalNormal, styles.messageText]}>{t(`${type}.ToContinueUsing`)}</Text>
        </ScrollView>
        <View style={[styles.controlsContainer]}>
          <View style={styles.buttonContainer}>
            <Button
              title={t('Global.Continue')}
              accessibilityLabel={t('Global.Continue')}
              testID={testIdWithKey('Continue')}
              onPress={onContinueTouched}
              buttonType={ButtonType.ModalPrimary}
              disabled={requestInProgress}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title={t('Global.NotNow')}
              accessibilityLabel={t('Global.NotNow')}
              testID={testIdWithKey('NotNow')}
              onPress={onNotNowTouched}
              buttonType={ButtonType.ModalSecondary}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default PermissionDisclosureModal
