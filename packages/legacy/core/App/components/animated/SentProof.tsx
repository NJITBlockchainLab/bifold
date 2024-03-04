import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

import CarImage from '../../assets/img/carfront.svg'
import Line from '../../assets/img/line.svg' // Import the Line SVG component
import Sent from '../../assets/img/sent.svg'
import { useTheme } from '../../contexts/theme'

const SentProof: React.FC = () => {
  const { ColorPallet } = useTheme()
  const ringFadeAnim = useRef(new Animated.Value(0)).current
  const checkFadeAnim = useRef(new Animated.Value(0)).current
  const ringFadeTiming: Animated.TimingAnimationConfig = {
    toValue: 1,
    duration: 600,
    useNativeDriver: true,
  }
  const checkFadeTiming: Animated.TimingAnimationConfig = {
    toValue: 1,
    duration: 600,
    useNativeDriver: true,
  }
  const style = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      marginTop: 30, // Added marginTop for space
    },
    carContainer: {
      // Adjusted margin to create space between cars
      marginHorizontal: 70,
      zIndex: 2,
    },
    sentContainer: {
      // Adjusted position to place the Sent SVG between cars
      backgroundColor: ColorPallet.brand.modalPrimaryBackground,
      position: 'absolute',
      left: '61%', // Position the Sent SVG in the center horizontally
      zIndex: 2,
    },
    lineContainer: {
      position: 'absolute',
      top: '3%',
      left: '40%',
      zIndex: 1,
    },
  })

  useEffect(() => {
    Animated.parallel([
      Animated.timing(ringFadeAnim, ringFadeTiming),
      Animated.timing(checkFadeAnim, checkFadeTiming),
    ]).start()
  }, [])

  return (
    <View style={style.container}>
      <View style={style.carContainer}>
        <CarImage {...{ height: 115, width: 115 }} />
      </View>
      <View style={style.lineContainer}>
        <Line />
      </View>
      <View style={style.sentContainer}>
        <Animated.View style={{ opacity: ringFadeAnim }}>
          <Sent {...{ height: 70, width: 70 }} />
        </Animated.View>
      </View>
      <View style={style.carContainer}>
        <CarImage {...{ height: 115, width: 115 }} />
      </View>
    </View>
  )
}

export default SentProof
