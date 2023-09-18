fork from https://github.com/satya164/react-native-tab-view/tree/v2.16.0

react-native-tab-view wrap the FlatList

## CHANGELOG

1. add header props, it was wrapped in a FlatList
2. each Tab's minHeight ScreenHeight - TabHeight(60)
3. fix TabBar at the top of Screen when scroll over header's height
4. fix Indicator space 0

## TODO：

1. remember Tab's scroll position

## FIXME：

1. TabHeight should be dynamic, but it's a fixed number as 60 for now

# Cons
- the performance can't catch up the react-native-screen, which is integrate in the newest react-native-tab-view

