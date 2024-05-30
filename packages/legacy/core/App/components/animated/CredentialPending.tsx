import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

import CarImage from '../../assets/img/carside.svg'

const CredentialPending: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const tranAnim = useRef(new Animated.Value(0)).current
  const slideTiming: Animated.TimingAnimationConfig = {
    toValue: 1100,
    duration: 2200,
    useNativeDriver: true,
  }
  const fadeTiming: Animated.TimingAnimationConfig = {
    toValue: 1,
    duration: 400,
    useNativeDriver: true,
  }
  const style = StyleSheet.create({
    container: {
      flexDirection: 'column',
    },
    card: {
      marginLeft: -550,
    },
  })

  useEffect(() => {
    const animationDelay = 200

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([Animated.timing(fadeAnim, fadeTiming), Animated.timing(tranAnim, slideTiming)])
      ).start()
    }, animationDelay)
  }, [])

  return (
    <View style={[style.container]}>
      <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateX: tranAnim }] }]}>
        <CarImage style={[style.card]} {...{ height: 250, width: 350 }} />
      </Animated.View>
    </View>
  )
}

export default CredentialPending
