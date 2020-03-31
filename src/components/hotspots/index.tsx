import React from 'react';
import {WebView} from 'react-native-webview';
import {ActivityIndicator} from 'react-native-paper';

const Spinner = () => (
  <ActivityIndicator
    size="large"
    style={{position: 'absolute', top: 0, right: 0, left: 0, bottom: 0}}
  />
);

export function HotSpots() {
  return (
    <>
      <WebView
        startInLoadingState={true}
        allowsBackForwardNavigationGestures
        originWhitelist={['*']}
        allowsLinkPreview
        source={{
          uri: 'https://www.evital.in/covid-19/hotspots/mobile/',
        }}
        renderLoading={Spinner}
      />
    </>
  );
}
