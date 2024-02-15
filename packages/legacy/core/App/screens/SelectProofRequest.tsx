import { useAgent } from '@aries-framework/react-hooks'
import { linkProofWithTemplate, sendProofRequest, useProofRequestTemplates } from '@hyperledger/aries-bifold-verifier'
// import { useNavigation } from '@react-navigation/core'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import CheckBoxRow from '../components/inputs/CheckBoxRow'
import { useTheme } from '../contexts/theme'
import { Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type SelectedFields = {
  vehicleName: boolean
  vehicleOwner: boolean
  expiry_date: boolean
}

const SelectProofRequest = ({ navigation, route }: { navigation: any; route: any }) => {
  const { OnboardingTheme } = useTheme()
  // const navigation = useNavigation()

  if (!route?.params) {
    throw new Error('ProofRequest route prams were not set properly')
  }

  const { connectionId } = route.params
  // const templateId = 1

  // eslint-disable-next-line no-console
  console.log(connectionId)

  const [selectedFields, setSelectedFields] = useState<SelectedFields>({
    vehicleName: false,
    vehicleOwner: false,
    expiry_date: false,
  })
  const { t } = useTranslation()

  const style = StyleSheet.create({
    container: {
      ...OnboardingTheme.container,
      padding: 20,
    },
    controlsContainer: {
      marginTop: 'auto',
      marginBottom: 20,
    },
    marginView: {
      marginTop: 10,
      marginBottom: 10,
    },
  })

  const handleFieldToggle = (fieldName: keyof SelectedFields) => {
    setSelectedFields((prevFields) => ({
      ...prevFields,
      [fieldName]: !prevFields[fieldName],
    }))
  }

  // const handleRequest = () => {
  //   const selectedArray = []
  //   if (selectedFields.vehicleName) {
  //     selectedArray.push('first_name')
  //   }
  //   if (selectedFields.vehicleOwner) {
  //     selectedArray.push('last_name')
  //   }
  //   // Now selectedArray contains the desired strings based on the state of vehicleName and vehicleOwner
  //   useProofRequestTemplates(true, selectedArray)
  //   // Proceed with further logic using selectedArray
  // }

  const { agent } = useAgent()
  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  // const [customPredicateValues, setCustomPredicateValues] = useState<Record<string, Record<string, number>>>({})

  const useProofRequest = useCallback(async () => {
    const selectedArray = []
    if (selectedFields.vehicleName) {
      selectedArray.push('vehicle_name')
    }
    if (selectedFields.vehicleOwner) {
      selectedArray.push('vehicle_owner')
    }
    if (connectionId) {
      // Send to specific contact and redirect to the chat with him
      if (!selectedFields.expiry_date) {
        sendProofRequest(agent, useProofRequestTemplates(true, selectedArray), connectionId, []).then((result) => {
          if (result?.proofRecord) {
            linkProofWithTemplate(agent, result.proofRecord, '1')
          }
        })
      } else {
        sendProofRequest(agent, useProofRequestTemplates(true, selectedArray), connectionId, []).then((result) => {
          if (result?.proofRecord) {
            linkProofWithTemplate(agent, result.proofRecord, '2')
          }
        })
      }
      navigation.getParent()?.navigate(Screens.Chat, { connectionId })
    } else {
      // Else redirect to the screen with connectionless request
      // navigation.navigate(Screens.ProofRequesting, { templateId, predicateValues: customPredicateValues })
    }
  }, [agent, connectionId])

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={style.container}>
      <ScrollView>
        <View style={style.controlsContainer}>
          <View style={style.marginView}>
            <CheckBoxRow
              title="Vehicle Name"
              checked={selectedFields.vehicleName}
              onPress={() => handleFieldToggle('vehicleName')}
            />
          </View>
          <View style={style.marginView}>
            <CheckBoxRow
              title="Vehicle Owner"
              checked={selectedFields.vehicleOwner}
              onPress={() => handleFieldToggle('vehicleOwner')}
            />
          </View>
          <View style={style.marginView}>
            <CheckBoxRow
              title="Date of Birth"
              checked={selectedFields.expiry_date}
              onPress={() => handleFieldToggle('expiry_date')}
            />
          </View>
        </View>
        <View style={{ paddingTop: 10, marginBottom: 20 }}>
          <Button
            title={connectionId ? t('Verifier.SendThisProofRequest') : t('Verifier.UseProofRequest')}
            accessibilityLabel={connectionId ? t('Verifier.SendThisProofRequest') : t('Verifier.UseProofRequest')}
            testID={connectionId ? testIdWithKey('SendThisProofRequest') : testIdWithKey('UseProofRequest')}
            buttonType={ButtonType.Primary}
            onPress={() => useProofRequest()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SelectProofRequest
