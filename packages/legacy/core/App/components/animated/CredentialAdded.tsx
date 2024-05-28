import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

import CarImage from '../../assets/img/carfront.svg'
import ShieldImage from '../../assets/img/shield.svg'

const CredentialAdded: React.FC = () => {
  const cardFadeAnim = useRef(new Animated.Value(0)).current
  const checkFadeAnim = useRef(new Animated.Value(0)).current
  const tranAnim = useRef(new Animated.Value(0)).current // Start the shield above the screen
  const slideTiming: Animated.TimingAnimationConfig = {
    toValue: 60, // Slide the shield down by 90 units
    duration: 200,
    useNativeDriver: true,
  }
  const fadeTiming: Animated.TimingAnimationConfig = {
    toValue: 1,
    duration: 200,
    useNativeDriver: true,
  }
  const style = StyleSheet.create({
    container: {
      flexDirection: 'column',
    },
    back: {
      backgroundColor: 'transparent',
      position: 'absolute',
      marginTop: -30,
    },
    front: {
      backgroundColor: 'transparent',
    },
    card: {
      backgroundColor: 'transparent',
      position: 'absolute',
      marginLeft: 10,
    },
    check: {
      alignItems: 'center',
      marginRight: -180,
      zIndex: 100,
    },
  })

  useEffect(() => {
    const animationDelay = 300

    setTimeout(() => {
      Animated.sequence([
        Animated.timing(cardFadeAnim, fadeTiming),
        Animated.timing(tranAnim, slideTiming), // Apply the slide timing animation here
        Animated.timing(checkFadeAnim, fadeTiming),
      ]).start()
    }, animationDelay)
  }, [])

  return (
    <View style={[style.container]}>
      <Animated.View style={[{ opacity: checkFadeAnim, transform: [{ translateY: tranAnim }] }, style.check]}>
        <ShieldImage {...{ height: 100, width: 100 }} />
      </Animated.View>
      <View>
        <CarImage {...{ height: 220, width: 220 }} />
      </View>
    </View>
  )
}

export default CredentialAdded
