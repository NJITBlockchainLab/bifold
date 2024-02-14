import { useAgent } from '@aries-framework/react-hooks'
import { linkProofWithTemplate, sendProofRequest, useProofRequestTemplates } from '@hyperledger/aries-bifold-verifier'
import { useNavigation } from '@react-navigation/core'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import CheckBoxRow from '../components/inputs/CheckBoxRow'
import { useTheme } from '../contexts/theme'
import { Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

const SelectProofRequest = (connectionId: string) => {
  const { OnboardingTheme } = useTheme()
  const navigation = useNavigation()

  const [selectedFields, setSelectedFields] = useState({
    firstName: false,
    lastName: false,
    dob: false,
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

  const handleFieldToggle = (fieldName: string) => {
    setSelectedFields((prevFields) => ({
      ...prevFields,
      [fieldName]: !prevFields[fieldName],
    }))
  }

  // const handleRequest = () => {
  //   const selectedArray = []
  //   if (selectedFields.firstName) {
  //     selectedArray.push('first_name')
  //   }
  //   if (selectedFields.lastName) {
  //     selectedArray.push('last_name')
  //   }
  //   // Now selectedArray contains the desired strings based on the state of firstName and lastName
  //   useProofRequestTemplates(true, selectedArray)
  //   // Proceed with further logic using selectedArray
  // }

  const { agent } = useAgent()

  const useProofRequest = useCallback(async () => {
    const selectedArray = []
    if (selectedFields.firstName) {
      selectedArray.push('first_name')
    }
    if (selectedFields.lastName) {
      selectedArray.push('last_name')
    }
    if (connectionId) {
      // Send to specific contact and redirect to the chat with him
      sendProofRequest(agent, useProofRequestTemplates(true, selectedArray), connectionId, []).then((result) => {
        if (result?.proofRecord) {
          linkProofWithTemplate(agent, result.proofRecord, templateId)
        }
      })

      navigation.getParent()?.navigate(Screens.Chat, { connectionId })
    } else {
      // Else redirect to the screen with connectionless request
      navigation.navigate(Screens.ProofRequesting, { templateId, predicateValues: customPredicateValues })
    }
  }, [agent, connectionId])

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={style.container}>
      <ScrollView>
        <View style={style.controlsContainer}>
          <View style={style.marginView}>
            <CheckBoxRow
              title="First Name"
              checked={selectedFields.firstName}
              onPress={() => handleFieldToggle('firstName')}
            />
          </View>
          <View style={style.marginView}>
            <CheckBoxRow
              title="Last Name"
              checked={selectedFields.lastName}
              onPress={() => handleFieldToggle('lastName')}
            />
          </View>
          <View style={style.marginView}>
            <CheckBoxRow title="Date of Birth" checked={selectedFields.dob} onPress={() => handleFieldToggle('dob')} />
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
