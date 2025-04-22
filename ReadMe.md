# React Native Vertical Cards Deck Animation

This is a React Native library that provides vertical cards deck animation functionalities.

<!-- ![This is a Preview.](/demoGif.gif "\This is a Preview.") -->

![This is a Preview.](https://i.imgur.com/GcrEWUv.gif "This is a Preview.")

## Installation

You can install this library using npm or yarn:

```bash
npm install react-native-vertical-cards-deck
or
yarn add react-native-vertical-cards-deck
```

Now we need to install [react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler) and [react-native-reanimated(>=2.0.0)](https://github.com/software-mansion/react-native-reanimated).

## Permission

On Android you must ask for vibration permission, To enable add the following code to the AndroidManifest.xml:

```bash
  <uses-permission android:name="android.permission.VIBRATE"/>
```

## Note

If an error occurs regarding the Reanimated library after installing it, simply reset the app cache using `npm start -- --reset-cache`.

## Usage

To use this library, import the `VerticalCardsDeck` component from the package:

```bash
import VerticalCardsDeck from 'react-native-vertical-cards-deck';
```

Then, you can use the `VerticalCardsDeck` component in your React Native application:

```bash
<VerticalCardsDeck
  dataList={[1, 2, 3, 4, 5]}
  cardColor="#43a9d8"
  renderContent={(item, index) => <Text>{item}</Text>}
  cardDistance={150}
  cardHeight={300}
  cardWidth={300}
  cardBorderRadius={20}
  cardBorderWidth={1}
  cardBorderColor={"#000000"}
  containerHeight={576}
  containerColor={'#FFFFFF'}
  belowCardsDistance={'middle'}
/>
```

# Props

- `dataList`: Array of data items to be rendered as cards.
- `cardColor`: Color of the cards.
- `renderContent`: Function to render the content of each card.
- `cardDistance`: Distance between cards.
- `cardHeight`: Height of each card.
- `cardWidth`: Width of each card.
- `containerHeight`: Height of the main container.
- `cardBorderRadius`: Border Radius of each card.
- `cardBorderWidth`: Border Width of each card.
- `cardBorderColor`: Border Color of each card.
- `containerColor` : Background color of main container.
- `belowCardsDistance` : Average distance between below cards. All options are `high`, `middle` and `low`, `middle` is default.

# Example

Here is a basic example of how to use the VerticalCardsDeck library:

```bash
import React from 'react';
import { Text } from 'react-native';
import VerticalCardsDeck from 'react-native-vertical-cards-deck';

const App = () => {
  const dataList = [1, 2, 3, 4, 5, 6];

  const renderContent = (item, index) => (
    <Text style={{fontSize: 24, color:'#ffffff', fontWeight:'bold'}}>
      Card {index + 1}
    </Text>
  );

  return (
    <VerticalCardsDeck
      dataList={dataList}
      cardColor='#43a9d8'
      renderContent={renderContent}
      cardDistance={134}
      cardHeight={255}
      cardWidth={357}
      cardBorderRadius={20}
      cardBorderWidth={1}
      cardBorderColor={"#000000"}
      containerHeight={576}
      containerColor={'#FFFFFF'}
      belowCardsDistance={'middle'}
    />
  );
};

export default App;

```

## Author

[Pritam Ramteke](https://pritamramteke.carrd.co/)

## License

ISC
