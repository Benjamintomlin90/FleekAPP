import { StyleSheet, Platform, Dimensions } from "react-native";
// TODO can't import metrics here because metrics imports size() from here

const { width } = Dimensions.get("window");

const size = (size, increase = false) => {
  const normalWidth = Platform.isPad ? 768 : 375;
  const ratio = normalWidth / width;
  // if (!increase && ratio < 1) ratio = 1;
  // console.log(Math.ceil(size/ratio));

  // return size;
  return Math.ceil(size / ratio);
};

const interval_size = (divide_width, divided) => {
  const intervalSize = (width - size(divide_width)) / divided;
  return intervalSize;
};

const create = (styles) => {
  const platformStyles = {};

  Object.keys(styles).forEach((name) => {
    const { ios, android, ...otherStyles } = { ...styles[name] };
    let style = otherStyles;

    if (ios && Platform.OS === "ios") {
      style = { ...style, ...ios };
    }

    if (android && Platform.OS === "android") {
      style = { ...style, ...android };
    }

    platformStyles[name] = style;
  });

  return StyleSheet.create(platformStyles);
};

export default { size, create, interval_size };
