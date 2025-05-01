import React from 'react';
import { View, SafeAreaView, ViewProps } from 'react-native';

interface Props extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

const ScreenContainer = ({ children, className = '', style, ...props }: Props) => {
  const baseClasses = 'flex-1 bg-neutral-light dark:bg-neutral-dark';
  const paddingClasses = 'p-4'; // Standard padding for screen content

  return (
    <SafeAreaView className={`${baseClasses} ${className}` } style={style} {...props}>
      <View className={`${paddingClasses} flex-1`}>{children}</View>
    </SafeAreaView>
  );
};

export default ScreenContainer; 