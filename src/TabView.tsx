import React, { createRef } from 'react';
import {
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
  FlatList,
} from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { event, greaterThan, cond } from 'react-native-reanimated';
import TabBar, { Props as TabBarProps } from './TabBar';
import SceneView from './SceneView';
import { Layout, NavigationState, Route, SceneRendererProps, PagerCommonProps } from './types';
import Pager, { Props as ChildProps } from './Pager';

const ReanimatedFlatList = Animated.createAnimatedComponent(FlatList);

export type Props<T extends Route> = PagerCommonProps & {
  position?: Animated.Value<number>;
  onIndexChange: (index: number) => void;
  navigationState: NavigationState<T>;
  renderScene: (
    props: SceneRendererProps & {
      route: T;
    },
  ) => React.ReactNode;
  renderLazyPlaceholder: (props: { route: T }) => React.ReactNode;
  renderTabBar: (
    props: SceneRendererProps & {
      navigationState: NavigationState<T>;
    },
  ) => React.ReactNode;
  initialLayout?: { width?: number; height?: number };
  lazy: ((props: { route: T }) => boolean) | boolean;
  lazyPreloadDistance: number;
  removeClippedSubviews?: boolean;
  sceneContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  gestureHandlerProps: React.ComponentProps<typeof PanGestureHandler>;
  renderPager: (props: ChildProps<T>) => React.ReactNode;
  header: React.ReactNode;
};

type State = {
  layout: Layout;
};

const GestureHandlerWrapper = GestureHandlerRootView ?? View;

export default class TabView<T extends Route> extends React.Component<Props<T>, State> {
  static defaultProps = {
    renderTabBar: <P extends Route>(props: TabBarProps<P>) => <TabBar {...props} />,
    renderLazyPlaceholder: () => null,
    keyboardDismissMode: 'auto',
    swipeEnabled: true,
    lazy: false,
    lazyPreloadDistance: 0,
    removeClippedSubviews: false,
    springConfig: {},
    timingConfig: {},
    gestureHandlerProps: {},
    renderPager: (props: ChildProps<any>) => <Pager {...props} />,
  };

  state = {
    layout: { width: 0, height: 0, ...this.props.initialLayout },
    headerHeight: 0,
  };

  private jumpToIndex = (index: number) => {
    if (index !== this.props.navigationState.index) {
      this.props.onIndexChange(index);
      // requestAnimationFrame(() => {
      //   this.wrapper.current?.scrollToOffset({ offset: this.state.headerHeight });
      // });
    }
  };

  private handleLayout = (e: LayoutChangeEvent) => {
    const { height, width } = e.nativeEvent.layout;

    if (this.state.layout.width === width && this.state.layout.height === height) {
      return;
    }

    this.setState({
      layout: {
        height,
        width,
      },
    });
  };

  private handleHeaderLayout = (e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;

    this.setState({ headerHeight: height });
  };

  private scrollY = Array(this.props.navigationState.routes.length).fill(new Animated.Value(0));

  private handleWrapperScroll = event([
    {
      nativeEvent: {
        contentOffset: {
          y: this.scrollY[this.props.navigationState.index],
        },
      },
    },
  ]);

  private wrapper = createRef();

  private handleTabBarPress = () => {
    requestAnimationFrame(() => {
      this.wrapper.current?.scrollToOffset({ offset: this.state.headerHeight });
    });
  };

  render() {
    const {
      position: positionListener,
      onSwipeStart,
      onSwipeEnd,
      navigationState,
      lazy,
      lazyPreloadDistance,
      removeClippedSubviews,
      keyboardDismissMode,
      swipeEnabled,
      swipeVelocityImpact,
      timingConfig,
      springConfig,
      renderTabBar,
      renderScene,
      renderLazyPlaceholder,
      sceneContainerStyle,
      style,
      gestureHandlerProps,
      springVelocityScale,
      renderPager,
      header,
    } = this.props;
    const { layout } = this.state;
    const opacity = greaterThan(this.scrollY[this.props.navigationState.index], this.state.headerHeight);

    return (
      <GestureHandlerWrapper onLayout={this.handleLayout} style={[styles.pager, style]}>
        {renderPager({
          navigationState,
          layout,
          keyboardDismissMode,
          swipeEnabled,
          swipeVelocityImpact,
          timingConfig,
          springConfig,
          onSwipeStart,
          onSwipeEnd,
          onIndexChange: this.jumpToIndex,
          springVelocityScale,
          removeClippedSubviews,
          gestureHandlerProps,
          children: ({ position, render, addListener, removeListener, jumpTo }) => {
            // All of the props here must not change between re-renders
            // This is crucial to optimizing the routes with PureComponent
            const sceneRendererProps = {
              position,
              layout,
              jumpTo,
            };

            return (
              <>
                <ReanimatedFlatList
                  data={undefined}
                  renderItem={null}
                  onScroll={this.handleWrapperScroll}
                  ref={this.wrapper}
                  keyboardShouldPersistTaps="handled"
                  ListHeaderComponent={
                    <>
                      <View onLayout={this.handleHeaderLayout}>{header}</View>
                      {positionListener ? <Animated.Code exec={Animated.set(positionListener, position)} /> : null}
                      {renderTabBar({
                        ...sceneRendererProps,
                        onTabPress: this.handleTabBarPress,
                        navigationState,
                      })}
                      {render(
                        navigationState.routes.map((route, i) => {
                          return (
                            <SceneView
                              {...sceneRendererProps}
                              addListener={addListener}
                              removeListener={removeListener}
                              key={route.key}
                              index={i}
                              lazy={typeof lazy === 'function' ? lazy({ route }) : lazy}
                              lazyPreloadDistance={lazyPreloadDistance}
                              navigationState={navigationState}
                              style={sceneContainerStyle}>
                              {({ loading }) =>
                                loading
                                  ? renderLazyPlaceholder({ route })
                                  : renderScene({
                                      ...sceneRendererProps,
                                      route,
                                    })
                              }
                            </SceneView>
                          );
                        }),
                      )}
                    </>
                  }
                />

                <Animated.View
                  style={[
                    styles.fixedTabBar,
                    {
                      opacity,
                      zIndex: cond(opacity, 0, -1),
                    },
                  ]}>
                  {renderTabBar({
                    ...sceneRendererProps,
                    onTabPress: this.handleTabBarPress,
                    navigationState,
                  })}
                </Animated.View>
              </>
            );
          },
        })}
      </GestureHandlerWrapper>
    );
  }
}

const styles = StyleSheet.create({
  pager: {
    flex: 1,
    overflow: 'hidden',
  },
  fixedTabBar: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'red',
    width: '100%',
    zIndex: 100,
  },
});
