import { Text, View, Vibration, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { PanGestureHandler } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  SharedValue,
} from "react-native-reanimated";

type CardItemProps = {
  index: number;
  dataList: any[];
  pList: SharedValue<number[]>;
  aNum: SharedValue<number>;
  dirLis: SharedValue<number[]>;
  pListTmp: SharedValue<number[]>;
  cardHeight?: number;
  cardWidth?: number;
  cardColor?: string;
  item: any;
  renderContent: (item: any, index: number) => React.ReactNode;
  cardBorderRadius?: number;
  cardBorderWidth?: number;
  cardBorderColor?: string;
  cardDistance?: number;
  belowCardsDistance?: "high" | "middle" | "low";
};

type VerticalCardsDeckProps = {
  dataList: any[];
  cardColor?: string;
  renderContent?: (item: any, index: number) => React.ReactNode;
  cardDistance?: number;
  cardHeight?: number;
  cardWidth?: number;
  containerHeight?: number;
  cardBorderRadius?: number;
  cardBorderWidth?: number;
  cardBorderColor?: string;
  containerColor?: string;
  belowCardsDistance?: "high" | "middle" | "low";
};

const CardAnItem: React.FC<CardItemProps> = ({
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
  cardBorderColor = "#000000",
  cardDistance = 150,
  belowCardsDistance = "middle",
}) => {
  const translateY = useSharedValue(index === 0 ? -cardDistance : cardDistance);
  const transSortY = useSharedValue(0);
  const scaleBox = useSharedValue(1);
  const isGestureActive = useSharedValue(false);
  const prevIndex = useSharedValue(index);
  const activeIndxs = useSharedValue<number[]>([]);

  const backCardPos =
    belowCardsDistance === "high"
      ? 30
      : belowCardsDistance === "middle"
      ? 25
      : 20;

  useAnimatedReaction(
    () => dirLis.value,
    (newOrder) => {
      const newActiveIndxs: number[] = [];
      newOrder.forEach((v, i) => {
        if (i < newOrder.length - 1 && v === 1 && newOrder[i + 1] === 0) {
          newActiveIndxs.push(i, i + 1);
        }
      });
      activeIndxs.value = newActiveIndxs;

      const topCards = newOrder
        .filter((val, i) => val === 1)
        .map((val, i) => ({ indx: i, dir: val }))
        .reverse();

      const bottomCards = newOrder
        .filter((val, i) => val === 0)
        .map((val, i) => ({ indx: i, dir: val }))
        .reverse();

      const cCardDir = newOrder[prevIndex.value];

      if (cCardDir === 1 && topCards.length > 1) {
        const indV = topCards[prevIndex.value]?.indx ?? 0;
        transSortY.value = withTiming(indV * -backCardPos, {
          duration: 600,
        });
        //    scaleBox.value = withTiming(indV <= 2 ? 1 - indV * 0.1 : 0);
        scaleBox.value =
          indV <= 2
            ? withTiming(1 - indV * 0.1, {
                duration: 600,
              })
            : 0;
      } else if (cCardDir === 0 && bottomCards.length > 1) {
        const dnIndx = dataList.length - (prevIndex.value + 1);
        const indVB = bottomCards[dnIndx]?.indx ?? 0;
        //    scaleBox.value = withTiming(indVB <= 2 ? 1 - indVB * 0.1 : 0);
        scaleBox.value =
          indVB <= 2
            ? withTiming(1 - indVB * 0.1, {
                duration: 600,
              })
            : 0;
        transSortY.value = withTiming(indVB * backCardPos, {
          duration: 600,
        });
      } else {
        transSortY.value = withTiming(0, {
          duration: 600,
        });
        scaleBox.value = withTiming(1, {
          duration: 600,
        });
      }
    }
  );

  const upDirVal = () => {
    const tmp = [...dirLis.value];
    tmp[prevIndex.value] = 1;
    dirLis.value = tmp;
  };

  const downDirVal = () => {
    const tmp = [...dirLis.value];
    tmp[prevIndex.value] = 0;
    dirLis.value = tmp;
  };

  const resetPlis = () => {
    pList.value = [...pListTmp.value];
  };

  const increaseVal2 = () => {
    const [cont1, cont2] = pListTmp.value
      .slice(1, pListTmp.value.length - 1)
      .reduce<[number[], number[]]>(
        ([cont1, cont2], item, index) => {
          (index < prevIndex.value ? cont1 : cont2).push(item);
          return [cont1, cont2];
        },
        [[], []]
      );

    const sList = [...cont1].sort((a, b) => a - b);
    const spList = [...cont2];

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
      .reduce<[number[], number[]]>(
        ([cont1, cont2], item, index) => {
          (index < prevIndex.value - 1 ? cont1 : cont2).push(item);
          return [cont1, cont2];
        },
        [[], []]
      );

    const sList = [...cont1];
    const spList = [...cont2].sort((a, b) => b - a);

    pList.value = [
      pListTmp.value[0],
      ...sList,
      ...spList,
      pListTmp.value[pListTmp.value.length - 1],
    ];
  };

  const vibrateMe = () => {
    try {
      Vibration.vibrate(100);
    } catch (error) {}
  };

  const setTmp = () => {
    pListTmp.value = [...pList.value];
  };

  const panGesture = useAnimatedGestureHandler({
    onStart: (_, ctx: { startY: number }) => {
      ctx.startY = translateY.value;
      if (
        prevIndex.value !== 0 &&
        prevIndex.value !== dataList.length - 1 &&
        activeIndxs.value.includes(prevIndex.value)
      ) {
        isGestureActive.value = true;
        runOnJS(setTmp)();
      } else {
        isGestureActive.value = false;
        runOnJS(vibrateMe)();
      }
    },

    onActive: (evt, ctx: { startY: number }) => {
      if (
        ctx.startY + evt.translationY > -(cardDistance + 40) &&
        ctx.startY + evt.translationY < cardDistance + 40 &&
        isGestureActive.value
      ) {
        translateY.value = ctx.startY + evt.translationY;
        if (dataList.length > 3) {
          if (dirLis.value[prevIndex.value] === 0) {
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
          if (dirLis.value[prevIndex.value] === 0) {
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
                aNum.value = Math.max(aNum.value - 1, 0);
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
          translateY.value = withTiming(
            evt.translationY < -(cardDistance / 16)
              ? -cardDistance
              : cardDistance
          );
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
    <Animated.View style={animatedStyle}>
      <PanGestureHandler onGestureEvent={panGesture}>
        <Animated.View>
          <View
            style={[
              styles.card,
              {
                borderRadius: cardBorderRadius,
                borderColor: cardBorderColor,
                borderWidth: cardBorderWidth,
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

const VerticalCardsDeck: React.FC<VerticalCardsDeckProps> = ({
  dataList = [1, 2, 3, 4, 5, 6],
  cardColor = "#43a9d8",
  renderContent = (item, index) => (
    <Text style={styles.cardText}>Card {index + 1}</Text>
  ),
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
  const dList = useSharedValue(dataList);

  const initializeLists = () => {
    return {
      pList: Object.values([
        ...dataList.map((_, index) => index).slice(0, 1),
        ...dataList
          .map((_, index) => index)
          .slice(1)
          .reverse(),
      ]),
      dirLis: [...dataList.map((_, index) => (index === 0 ? 1 : 0))],
    };
  };

  const { pList: initialPList, dirLis: initialDirLis } = initializeLists();
  const pList = useSharedValue(initialPList);
  const pListTmp = useSharedValue(initialPList);
  const dirLis = useSharedValue(initialDirLis);

  useEffect(() => {
    dList.value = dataList;
    const { pList: newPList, dirLis: newDirLis } = initializeLists();
    pList.value = newPList;
    pListTmp.value = newPList;
    dirLis.value = newDirLis;
  }, [dataList]);

  return (
    <GestureHandlerRootView
      style={[
        styles.container,
        { height: containerHeight, backgroundColor: containerColor },
      ]}
    >
      {dataList.map((item, index) => (
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
      ))}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cardText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
  },
});

export default VerticalCardsDeck;
