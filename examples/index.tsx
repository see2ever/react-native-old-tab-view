import React, { useCallback, useMemo, useState } from 'react';
import { Text, StyleSheet } from 'react-native';

import { OldSceneMap, OldTabView, OldTabBar } from '@/components/OldTabs';

const routes = [
  { key: 'a', title: 'A' },
  { key: 'b', title: 'B' },
  { key: 'c', title: 'C' },
];

export const Example = () => {
  const [index, setIndex] = useState(0);
  const navigationState = useMemo(() => ({ index, routes }), [index]);

  const renderA = useCallback(() => null, []);
  const renderB = useCallback(() => null, []);
  const renderC = useCallback(() => null, []);

  const renderScene = useMemo(
    () =>
      OldSceneMap({
        a: renderA,
        b: renderB,
        c: renderC,
      }),
    [renderA, renderB, renderC],
  );

  const renderTabBar = useCallback(
    props => (
      <OldTabBar
        {...props}
        renderLabel={({ route: r, focused }) => {
          const textStyle = StyleSheet.flatten([styles.label, focused && styles.isFocused]);

          return <Text style={textStyle}>{r.title}</Text>;
        }}
        indicatorStyle={styles.indicatorStyle}
        style={styles.tabBarStyle}
        contentContainerStyle={styles.tabBarContainerStyle}
        tabStyle={styles.tabStyle}
      />
    ),
    [],
  );

  return (
    <OldTabView
      navigationState={navigationState}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={Layout.window}
      removeClippedSubviews={false}
      renderTabBar={renderTabBar}
      lazy
      header={header}
    />
  );
};
