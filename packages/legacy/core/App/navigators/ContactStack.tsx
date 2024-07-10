import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import HeaderRightHome from '../components/buttons/HeaderHome'
import { useTheme } from '../contexts/theme'
import Chat from '../screens/Chat'
import ContactDetails from '../screens/ContactDetails'
import CredentialDetails from '../screens/CredentialDetails'
import CredentialOffer from '../screens/CredentialOffer'
import ListContacts from '../screens/ListContacts'
import ProofDetails from '../screens/ProofDetails'
import ProofRequest from '../screens/ProofRequest'
import ProofRequestDetails from '../screens/ProofRequestDetails'
import QRCodeGen from '../screens/QRCodeGen'
import RenameContact from '../screens/RenameContact'
import ScanBLE from '../screens/ScanBLE'
import SelectProofRequest from '../screens/SelectProofRequest'
import WhatAreContacts from '../screens/WhatAreContacts'
import { ContactStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

const ContactStack: React.FC = () => {
  const Stack = createStackNavigator<ContactStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = createDefaultStackOptions(theme)

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen name={Screens.Contacts} component={ListContacts} options={{ title: t('Screens.Contacts') }} />
      <Stack.Screen
        name={Screens.ContactDetails}
        component={ContactDetails}
        options={{
          title: t('Screens.ContactDetails'),
        }}
      />
      <Stack.Screen
        name={Screens.RenameContact}
        component={RenameContact}
        options={{ title: t('Screens.RenameContact') }}
      />
      <Stack.Screen
        name={Screens.SelectProofRequest}
        component={SelectProofRequest}
        options={{ title: t('Screens.SelectProofRequest') }}
      />
      <Stack.Screen name={Screens.Chat} component={Chat} />
      <Stack.Screen name={Screens.QRCodeGen} component={QRCodeGen} options={{ title: 'QR Code' }} />
      <Stack.Screen name={Screens.ScanBLE} component={ScanBLE} options={{ title: 'Bluetooth' }} />
      <Stack.Screen
        name={Screens.ProofRequestDetails}
        component={ProofRequestDetails}
        options={{ title: 'Proof Request Details' }}
      />
      <Stack.Screen name={Screens.WhatAreContacts} component={WhatAreContacts} options={{ title: '' }} />
      <Stack.Screen
        name={Screens.CredentialDetails}
        component={CredentialDetails}
        options={{ title: t('Screens.CredentialDetails') }}
      />
      <Stack.Screen
        name={Screens.CredentialOffer}
        component={CredentialOffer}
        options={{ title: t('Screens.CredentialOffer') }}
      />
      <Stack.Screen
        name={Screens.ProofDetails}
        component={ProofDetails}
        options={() => ({
          title: '',
          headerRight: () => <HeaderRightHome />,
        })}
      />
      <Stack.Screen
        name={Screens.ProofRequest}
        component={ProofRequest}
        options={{ title: t('Screens.ProofRequest') }}
      />
    </Stack.Navigator>
  )
}

export default ContactStack
