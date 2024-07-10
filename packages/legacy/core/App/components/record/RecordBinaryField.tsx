import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import Default from '../../assets/img/default-photo.svg'
import ImageModal from '../../components/modals/ImageModal'
import { hiddenFieldValue } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

interface RecordBinaryFieldProps {
  attributeValue: string
  shown?: boolean
  style?: Record<string, unknown>
}

const RecordBinaryField: React.FC<RecordBinaryFieldProps> = ({ attributeValue, shown, style }) => {
  const { ListItems } = useTheme()
  const { t } = useTranslation()
  const [showImageModal, setShowImageModal] = useState(false)

  // const actualValue = attributeValue === '*' ? Default : attributeValue
  // eslint-disable-next-line no-console
  // console.log(actualValue)

  const styles = StyleSheet.create({
    text: {
      ...ListItems.recordAttributeText,
    },
    image: {
      height: 150,
      aspectRatio: 1,
      resizeMode: 'contain',
      borderRadius: 10,
    },
  })

  return (
    <View>
      {shown ? (
        <TouchableOpacity
          accessibilityLabel={t('Record.Zoom')}
          testID={testIdWithKey('zoom')}
          onPress={() => setShowImageModal(true)}
        >
          {attributeValue === '*' ? (
            <Default {...{ height: 150, aspectRatio: 1 }} />
          ) : (
            <Image style={styles.image} source={{ uri: attributeValue }} />
          )}
        </TouchableOpacity>
      ) : (
        <Text style={style || styles.text} testID={testIdWithKey('AttributeValue')}>
          {hiddenFieldValue}
        </Text>
      )}
      {showImageModal && <ImageModal uri={attributeValue} onDismissPressed={() => setShowImageModal(false)} />}
    </View>
  )
}

export default RecordBinaryField
