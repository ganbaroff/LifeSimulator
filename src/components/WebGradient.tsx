import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WebGradientProps {
  colors: string[];
  style?: any;
  children?: React.ReactNode;
  start?: { x: number; y: number } | undefined;
  end?: { x: number; y: number } | undefined;
}

const WebGradient: React.FC<WebGradientProps> = ({ 
  colors, 
  style, 
  children, 
  start, 
  end 
}) => {
  if (Platform.OS === 'web') {
    // For web, use CSS gradient
    const gradientStyle = {
      ...style,
      background: `linear-gradient(${start?.x ? `${start.x * 100}deg` : '45deg'}, ${colors.join(', ')})`,
    };
    return <View style={gradientStyle}>{children}</View>;
  }

  // For native, use LinearGradient
  return (
    <LinearGradient 
      colors={colors} 
      style={style}
      {...({ start, end } as any)}
    >
      {children}
    </LinearGradient>
  );
};

export default WebGradient;
