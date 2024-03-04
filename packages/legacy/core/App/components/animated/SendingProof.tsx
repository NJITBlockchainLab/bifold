import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

import ActivityIndicator from '../../assets/img/activity-indicator-circle.svg'
import CarImage from '../../assets/img/carfront.svg'
// import { useTheme } from '../../contexts/theme'

const SendingProof: React.FC = () => {
  // const { ColorPallet } = useTheme()
  const rotationAnim = useRef(new Animated.Value(0)).current
  const timing: Animated.TimingAnimationConfig = {
    toValue: 1,
    duration: 2000,
    useNativeDriver: true,
  }
  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })
  const style = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    animation: {
      position: 'absolute',
      top: 70,
    },
  })
  const credentialInHandDisplayOptions = {
    height: 150,
    width: 150,
  }
  const animatedCircleDisplayOptions = {
    height: 250,
    width: 250,
  }

  useEffect(() => {
    Animated.loop(Animated.timing(rotationAnim, timing)).start()
  }, [rotationAnim])

  return (
    <View style={style.container}>
      <CarImage style={style.animation} {...credentialInHandDisplayOptions} />
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <ActivityIndicator {...animatedCircleDisplayOptions} />
      </Animated.View>
      <CarImage style={style.animation} {...credentialInHandDisplayOptions} />
    </View>
  )
}

export default SendingProof
