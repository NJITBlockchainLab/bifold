import { Agent } from '@aries-framework/core'
import { RouteProp } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'

import { BifoldError } from '../types/error'
import { ConnectStackParams, Screens, Stacks } from '../types/navigators'

import { connectFromInvitation, getJson, getUrl, receiveMessageFromUrlRedirect } from './helpers'
import { t } from 'i18next'

export const handleInvitation = async (
  navigation: StackNavigationProp<ConnectStackParams, keyof ConnectStackParams>,
  route: RouteProp<ConnectStackParams, keyof ConnectStackParams>,
  agent: Agent<any> | undefined,
  value: string
): Promise<void> => {
  let implicitInvitations = false
  if (route?.params && route.params['implicitInvitations']) {
    implicitInvitations = route.params['implicitInvitations']
  }
  let reuseConnections = false
  if (route?.params && route.params['reuseConnections']) {
    reuseConnections = route.params['reuseConnections']
  }

  try {
    const receivedInvitation = await connectFromInvitation(value, agent, implicitInvitations, reuseConnections)
    if (receivedInvitation?.connectionRecord?.id) {
      // not connectionless
      navigation.getParent()?.navigate(Stacks.ConnectionStack, {
        screen: Screens.Connection,
        params: { connectionId: receivedInvitation.connectionRecord.id },
      })
    } else {
      //connectionless
      navigation.navigate(Stacks.ConnectionStack as any, {
        screen: Screens.Connection,
        params: { threadId: receivedInvitation?.outOfBandRecord.outOfBandInvitation.threadId },
      })
    }
  } catch (err: unknown) {
    // [Error: Connection does not have an ID]
    // [AriesFrameworkError: An out of band record with invitation 05fe3693-2c12-4165-a3b6-370280ccd43b has already been received. Invitations should have a unique id.]
    try {
      // if scanned value is json -> pass into AFJ as is
      const json = getJson(value)
      if (json) {
        await agent?.receiveMessage(json)
        navigation.getParent()?.navigate(Stacks.ConnectionStack, {
          screen: Screens.Connection,
          params: { threadId: json['@id'] },
        })
        return
      }

      // if scanned value is url -> receive message from it
      const url = getUrl(value)
      if (url) {
        const message = await receiveMessageFromUrlRedirect(value, agent)
        navigation.getParent()?.navigate(Stacks.ConnectionStack, {
          screen: Screens.Connection,
          params: { threadId: message['@id'] },
        })
        return
      }
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1031'), t('Error.Message1031'), (err as Error)?.message ?? err, 1031)
      // throwing for QrCodeScanError
      throw error
    }
  }
}
