import React from "react";
import { View, Text, StyleSheet } from "react-native";
import styled from "styled-components";
import { AppImages } from "../GlobalStyle";
import helper from "../theme/helper";
import { useNavigation } from "@react-navigation/native";

export default function Header({
  imageSrc,
  title,
  buttonText,
  buttonOnPress,
  buttonStyle = {},
}) {
  const navigation = useNavigation();
  return (
    <HeaderContainer style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <MenuButton onPress={() => navigation.goBack()}>
          {imageSrc ? (
            <MenuIcon source={imageSrc} style={{ width: 16, height: 14 }} />
          ) : (
            <View />
          )}
        </MenuButton>

        {title ? (
          <View style={styles.titleContainer}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
              {title}
            </Text>
          </View>
        ) : (
          <View
            style={{
              ...styles.titleContainer,
              paddingLeft: 0,
              width: "100%",
              alignItems: "center",
            }}
          >
            <LogoIcon source={AppImages.images.logo} />
          </View>
        )}
      </View>

      <MenuButton onPress={buttonOnPress}>
        {buttonText && (
          <Text style={{ ...styles.title, ...buttonStyle }}>{buttonText}</Text>
        )}
      </MenuButton>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.View`
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  width: 100%;
  padding-left: ${helper.size(10)}px;
  padding-right: ${helper.size(10)}px;
  background: #ffffff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.05);
`;

const MenuButton = styled.TouchableOpacity``;

const MenuIcon = styled.Image`
  width: ${helper.size(24)}px;
  height: ${helper.size(24)}px;
`;

const LogoIcon = styled.Image`
  width: ${helper.size(80)}px;
  height: ${helper.size(48)}px;
`;

const styles = StyleSheet.create({
  container: {
    shadowColor: "#00000050",
    shadowOffset: {
      width: 2,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
    paddingLeft: 18,
    paddingRight: 18,
    zIndex: 5,
  },
  titleContainer: {
    height: 48,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 12,
    // width: '100%',
    flex: 1,
  },
  title: {
    fontFamily: "Open Sans",
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    maxWidth: "100%",
  },
});
