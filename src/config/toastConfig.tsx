import React from 'react';
import { View, Text } from 'react-native';

export const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View style={{
      height: 60, width: '95%', backgroundColor: '#ffffff', borderRadius: 12, 
      paddingHorizontal: 15, borderLeftWidth: 6, borderLeftColor: '#154c44',
      justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, alignSelf: 'center'
    }}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: '#154c44' }}>{text1}</Text>
      {text2 ? <Text style={{ fontSize: 13, color: '#64748b' }}>{text2}</Text> : null}
    </View>
  ),
  error: ({ text1, text2 }: any) => (
    <View style={{
      height: 60, width: '95%', backgroundColor: '#ffffff', borderRadius: 12, 
      paddingHorizontal: 15, borderLeftWidth: 6, borderLeftColor: '#ef4444',
      justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, alignSelf: 'center'
    }}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: '#ef4444' }}>{text1}</Text>
      {text2 ? <Text style={{ fontSize: 13, color: '#64748b' }}>{text2}</Text> : null}
    </View>
  ),
};
