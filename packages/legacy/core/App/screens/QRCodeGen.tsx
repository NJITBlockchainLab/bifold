import { NavigationProp, ParamListBase } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import Link from '../components/texts/Link'
import { useTheme } from '../contexts/theme'
import { Screens, Stacks } from '../types/navigators'

interface WhatAreContactsProps {
  navigation: NavigationProp<ParamListBase>
}

const QRCodeGen: React.FC<WhatAreContactsProps> = () => {
  const { ColorPallet, TextTheme } = useTheme()
  const { t } = useTranslation()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    title: {
      ...TextTheme.headingTwo,
      marginBottom: 15,
    },
    pageContent: {
      marginTop: 30,
      paddingLeft: 25,
      paddingRight: 25,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.pageContent}
        directionalLockEnabled
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
      >
        <Text style={styles.title}>Scan the QR Code</Text>
        <QRCode value="https://www.npmjs.com/package/react-native-qrcode-svg" size={325} />
      </ScrollView>
    </SafeAreaView>
  )
}

export default QRCodeGen
