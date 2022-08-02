// external modules
import React, { PureComponent } from "react";
import {
  View,
  Text,
  Linking,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Icon from "./Icon";
import VersionCheck from "react-native-version-check";

class UpdateBanner extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showUpdateBanner: false,
      bottomOffset: 0,
      storeUrl: "",
    };

    this.handleHideUpdateBanner = this.handleHideUpdateBanner.bind(this);
  }

  async componentDidMount() {
    const needUpdate = await VersionCheck.needUpdate();

    this.setState({
      storeUrl: needUpdate.storeUrl || "",
      showUpdateBanner: (needUpdate && needUpdate.isNeeded) || false,
    });
  }

  handleHideUpdateBanner() {
    this.setState({ showUpdateBanner: false });
  }

  render() {
    const { storeUrl, showUpdateBanner } = this.state;
    if (showUpdateBanner) {
      return (
        <View style={styles.container}>
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => Linking.openURL(storeUrl)}
            style={styles.button}
          >
            <View>
              <Text style={styles.header}>Update the app!</Text>
              <Text style={styles.text}>
                A new experience is waiting for you
              </Text>
            </View>
            <Icon
              iconType="Feather"
              iconName="download"
              iconColor="#4ECB71"
              iconSize={25}
            />
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    zIndex: 1,
    padding: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#202126",
    borderRadius: 14,
    padding: 20,
  },
  header: {
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "Open Sans",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 19,
  },
  text: {
    paddingTop: 5,
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "Open Sans",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 19,
  },
});

export default UpdateBanner;
