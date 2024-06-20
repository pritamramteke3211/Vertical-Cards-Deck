import { Text, View, Vibration } from "react-native";
import React from "react";
import { PanGestureHandler } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const CardAnItem = ({
  index,
  dataList,
  pList,
  aNum,
  dirLis,
  pListTmp,
  cardHeight = 300,
  cardWidth = 300,
  cardColor = "#43a9d8",
  item,
  renderContent,
  cardBorderRadius = 20,
  cardBorderWidth = 1,
  cardBorderColor="#000000",
  cardDistance = 150,
  belowCardsDistance = "middle",
}) => {
  const translateY = useSharedValue(index == 0 ? -cardDistance : cardDistance);
  const transSortY = useSharedValue(0);
  const scaleBox = useSharedValue(1);
  const isGestureActive = useSharedValue(false);
  const prevIndex = useSharedValue(index);
  const activeIndxs = useSharedValue(index);

  const backCardPos =
    belowCardsDistance == "high"
      ? 30
      : belowCardsDistance == "middle"
      ? 25
      : 20;

  useAnimatedReaction(
    () => dirLis.value,

    (newOrder) => {

      let activeItemIndex = newOrder.map((v, index) => {

        if (index < newOrder.length - 1) {
          if (v == 1 && newOrder[index + 1] == 0) {
            activeIndxs.value = [index, index + 1];
          }
        }
      });

      let topCards = newOrder
        .filter((val, index) => val == 1)
        .map((val, index) => {
          return { indx: index, dir: val };
        })
        .reverse();

      let bottomCards = newOrder
        .filter((val, index) => val == 0)
        .map((val, index) => {
          return { indx: index, dir: val };
        })
        .reverse();

      let cCardDir = newOrder[prevIndex.value];

      if (cCardDir == 1 && topCards.length > 1) {
        let indV = topCards[prevIndex.value]?.indx;
        transSortY.value = withTiming(indV * -backCardPos);
        scaleBox.value = withTiming(indV <= 2 ? 1 - indV * 0.1 : 0.01);
      } else if (cCardDir == 0 && bottomCards.length > 1) {
        let dnIndx = dataList.length - (prevIndex.value + 1);
        let indVB = bottomCards[dnIndx]?.indx;
        scaleBox.value = withTiming(indVB <= 2 ? 1 - indVB * 0.1 : 0.01);
        transSortY.value = withTiming(indVB * backCardPos);
      } else {
        transSortY.value = withTiming(0);
        scaleBox.value = withTiming(1);
      }
    }
  );

  const upDirVal = () => {
    let tmp = [...dirLis.value];
    tmp[prevIndex.value] = 1;
    dirLis.value = tmp;
  };

  const downDirVal = () => {
    let tmp = [...dirLis.value];
    tmp[prevIndex.value] = 0;
    dirLis.value = tmp;
  };

  const resetPlis = () => {
    pList.value = [...pListTmp.value];
  };

  const increaseVal2 = () => {
    const [cont1, cont2] = pListTmp.value
      .slice(1, pListTmp.value.length - 1)
      .reduce(
        ([cont1, cont2], item, index) => {
          (index < prevIndex.value ? cont1 : cont2).push(item);
          return [cont1, cont2];
        },
        [[], []]
      );

    let sList = [...cont1].sort((a, b) => a - b);
    let spList = [...cont2];

    pList.value = [
      pListTmp.value[0],
      ...sList,
      ...spList,
      pListTmp.value[pListTmp.value.length - 1],
    ];
  };

  const decreaseVal2 = () => {
    const [cont1, cont2] = pListTmp.value
      .slice(1, pListTmp.value.length - 1)
      .reduce(
        ([cont1, cont2], item, index) => {
          (index < prevIndex.value - 1 ? cont1 : cont2).push(item);
          return [cont1, cont2];
        },

        [[], []]
      );

    let sList = [...cont1];
    let spList = [...cont2].sort((a, b) => b - a);

    pList.value = [
      pListTmp.value[0],
      ...sList,
      ...spList,
      pListTmp.value[pListTmp.value.length - 1],
    ];
  };

  const vibrateMe = () => {
    Vibration.vibrate(100);
  };

  const setTmp = () => {
    pListTmp.value = [...pList.value];
  };

  const panGesture = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;

      if (
        prevIndex.value != 0 &&
        prevIndex.value != dataList.length - 1 &&
        activeIndxs.value.includes(prevIndex.value)
      ) {
        isGestureActive.value = true;

        runOnJS(setTmp)();
      } else {
        isGestureActive.value = false;

        runOnJS(vibrateMe)();
      }
    },

    onActive: (evt, ctx) => {
      if (
        ctx.startY + evt.translationY > -(cardDistance + 40) &&
        ctx.startY + evt.translationY < cardDistance + 40 &&
        isGestureActive.value
      ) {
        translateY.value = ctx.startY + evt.translationY;

        if (dataList.length > 3) {
          if (dirLis.value[prevIndex.value] == 0) {
            if (prevIndex.value > 1 && prevIndex.value < dataList.length - 1) {
              runOnJS(increaseVal2)();
            }
          } else {
            if (
              prevIndex.value > 0 &&
              prevIndex.value < dataList.length - 2 &&
              aNum.value > 1
            ) {
              runOnJS(decreaseVal2)();
            }
          }
        }
      }
    },

    onEnd: (evt) => {
      if (isGestureActive.value) {
        if (dataList.length > 2) {
          if (dirLis.value[prevIndex.value] == 0) {
            if (evt.translationY < -(cardDistance / 16)) {
              translateY.value = withTiming(-cardDistance);

              runOnJS(upDirVal)();

              if (
                prevIndex.value > 1 &&
                prevIndex.value < dataList.length - 1
              ) {
                aNum.value = aNum.value + 1;
              }
            } else {
              translateY.value = withTiming(cardDistance);

              if (
                prevIndex.value > 1 &&
                prevIndex.value < dataList.length - 1
              ) {
                runOnJS(resetPlis)();
              }
            }
          } else {
            if (evt.translationY > cardDistance / 16) {
              translateY.value = withTiming(cardDistance);

              runOnJS(downDirVal)();

              if (prevIndex.value > 2) {
                aNum.value = aNum.value - 1;
              }
            } else {
              translateY.value = withTiming(-cardDistance);

              if (
                prevIndex.value > 0 &&
                prevIndex.value < dataList.length - 2
              ) {
                runOnJS(resetPlis)();
              }
            }
          }
        } else {
          if (evt.translationY < -(cardDistance / 16)) {
            translateY.value = withTiming(-cardDistance);
          } else {
            translateY.value = withTiming(cardDistance);
          }
        }
      }
    },

    onFinish: () => {
      isGestureActive.value = false;
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const zIndex = pList.value[prevIndex.value];
    const sortTY = transSortY.value;
    const scale = scaleBox.value;

    return {
      position: "absolute",
      zIndex,
      transform: [{ translateY: translateY.value + sortTY }, { scale }],
    };
  });

  return (
    <Animated.View style={{ ...animatedStyle }}>
      <PanGestureHandler onGestureEvent={panGesture}>
        <Animated.View>
          <View
            style={[
              {
                borderRadius: cardBorderRadius,
                borderColor: cardBorderColor,
                borderWidth: cardBorderWidth,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                backgroundColor: cardColor,
                width: cardWidth,
                height: cardHeight,
              },
            ]}
          >
            {renderContent(item, index)}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

const VerticalCardsDeck = ({
  dataList = [1, 2, 3, 4, 5, 6],
  cardColor = "#43a9d8",
  renderContent = (item, index) => <Text
  style={{fontSize: 24, color:'#ffffff', fontWeight:'bold'}}
  >Card {index + 1}</Text>,
  cardDistance = 134,
  cardHeight = 255,
  cardWidth = 357,
  containerHeight = 576,
  cardBorderRadius = 20,
  cardBorderWidth = 1,
  cardBorderColor = "#000000",
  containerColor = "#00000000",
  belowCardsDistance = "middle",
}) => {
  const aNum = useSharedValue(1);

  const pList = useSharedValue(
    Object.values([
      ...dataList.map((_, index) => index).slice(0, 1),

      ...dataList

        .map((_, index) => index)

        .slice(1)

        .reverse(),
    ])
  );

  const pListTmp = useSharedValue(
    Object.values([
      ...dataList.map((_, index) => index).slice(0, 1),

      ...dataList

        .map((_, index) => index)

        .slice(1)

        .reverse(),
    ])
  );

  const dirLis = useSharedValue([
    ...dataList.map((item, index) => (index == 0 ? 1 : 0)),
  ]);

  return (
    <GestureHandlerRootView
      style={{
        height: containerHeight,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: containerColor,
      }}
    >
      {dataList.map((item, index) => {
        return (
          <CardAnItem
            key={index}
            index={index}
            dataList={dataList}
            pList={pList}
            aNum={aNum}
            dirLis={dirLis}
            pListTmp={pListTmp}
            cardHeight={cardHeight}
            cardWidth={cardWidth}
            cardColor={cardColor}
            item={item}
            cardDistance={cardDistance}
            renderContent={renderContent}
            cardBorderRadius={cardBorderRadius}
            cardBorderWidth={cardBorderWidth}
            cardBorderColor={cardBorderColor}
            belowCardsDistance={belowCardsDistance}
          />
        );
      })}
    </GestureHandlerRootView>
  );
};

export default VerticalCardsDeck;
