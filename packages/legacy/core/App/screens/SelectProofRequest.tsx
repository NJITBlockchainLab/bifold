/* eslint-disable no-console */
import { useAgent } from '@aries-framework/react-hooks'
import { linkProofWithTemplate, sendProofRequest, useProofRequestTemplates } from '@hyperledger/aries-bifold-verifier'
// import { useNavigation } from '@react-navigation/core'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import CheckBoxRow from '../components/inputs/CheckBoxRow'
import { useTheme } from '../contexts/theme'
import { Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

const initialState = false

const SelectProofRequest = ({ navigation, route }: { navigation: any; route: any }) => {
  const { OnboardingTheme } = useTheme()
  // const navigation = useNavigation()

  if (!route?.params) {
    throw new Error('ProofRequest route prams were not set properly')
  }

  const { connectionId } = route.params
  // const templateId = 1

  // const [selectedFields, setSelectedFields] = useState(initialState)
  const [vehicleName, setvehicleName] = useState(initialState)
  const [vehicleOwner, setvehicleOwner] = useState(initialState)
  const [expiryDate, setexpiryDate] = useState(initialState)
  const [stateIssued, setstateIssued] = useState(initialState)

  console.log(connectionId)
  console.log(vehicleName)
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

  const { agent } = useAgent()
  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  // const [customPredicateValues, setCustomPredicateValues] = useState<Record<string, Record<string, number>>>({})

  const useProofRequest = () => {
    const selectedArray = []
    if (vehicleName) selectedArray.push('vehicle_information')

    if (vehicleOwner) selectedArray.push('vehicle_owner')

    if (stateIssued) selectedArray.push('state_issued')

    if (connectionId) {
      if (!expiryDate) {
        sendProofRequest(agent, useProofRequestTemplates(false, selectedArray)[0], connectionId, {}).then((result) => {
          if (result?.proofRecord) linkProofWithTemplate(agent, result.proofRecord, '1')
        })
      } else {
        sendProofRequest(agent, useProofRequestTemplates(false, selectedArray)[1], connectionId, {}).then((result) => {
          if (result?.proofRecord) linkProofWithTemplate(agent, result.proofRecord, '2')
        })
      }
      setvehicleName(false)
      setvehicleOwner(false)
      setexpiryDate(false)
      navigation.getParent()?.navigate(Screens.Chat, { connectionId })
      // } else {
      // Else redirect to the screen with connectionless request
      // navigation.navigate(Screens.ProofRequesting, { templateId, predicateValues: customPredicateValues })
    }
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={style.container}>
      <ScrollView>
        <View style={style.controlsContainer}>
          <View style={style.marginView}>
            <CheckBoxRow
              title="Vehicle Information"
              checked={vehicleName}
              onPress={() => {
                setvehicleName(!vehicleName)
              }}
              // onPress={() =>
              //   setSelectedFields((prevVal) => {
              //     return {
              //       ...prevVal,
              //       vehicleName: !prevVal.vehicleName,
              //     }
              //   })
              // }
            />
          </View>
          <View style={style.marginView}>
            <CheckBoxRow
              title="Vehicle Owner"
              checked={vehicleOwner}
              onPress={() => setvehicleOwner(!vehicleOwner)}
              // onPress={() =>
              //   setSelectedFields((prevVal) => {
              //     return {
              //       ...prevVal,
              //       vehicleOwner: !prevVal.vehicleOwner,
              //     }
              //   })
              // }
            />
          </View>
          <View style={style.marginView}>
            <CheckBoxRow
              title="State Issued"
              checked={stateIssued}
              onPress={() => setstateIssued((prev) => !prev)}
              // onPress={() =>
              //   setSelectedFields((prevVal) => {
              //     return {
              //       ...prevVal,
              //       expiry_date: !prevVal.expiry_date,
              //     }
              //   })
              // }
            />
          </View>
          <View style={style.marginView}>
            <CheckBoxRow
              title="Is expired or not?"
              checked={expiryDate}
              onPress={() => setexpiryDate((prev) => !prev)}
              // onPress={() =>
              //   setSelectedFields((prevVal) => {
              //     return {
              //       ...prevVal,
              //       expiry_date: !prevVal.expiry_date,
              //     }
              //   })
              // }
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
