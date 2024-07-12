import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

import ActivityIndicator from '../../assets/img/activity-indicator-circle.svg'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

const LoadingIndicator: React.FC = () => {
  const { Assets } = useTheme()
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
    animation: {
      position: 'absolute',
    },
  })
  const imageDisplayOptions = {
    height: 200,
    width: 200,
  }

  useEffect(() => {
    Animated.loop(Animated.timing(rotationAnim, timing)).start()
  }, [rotationAnim])

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }} testID={testIdWithKey('LoadingActivityIndicator')}>
      <Assets.svg.logo style={{ alignSelf: 'center' }} width={150} height={75} />
      <Animated.View style={[style.animation, { transform: [{ rotate: rotation }] }]}>
        <ActivityIndicator {...imageDisplayOptions} />
      </Animated.View>
    </View>
  )
}

export default LoadingIndicator
