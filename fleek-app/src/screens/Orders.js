import React, { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Text,
  View,
  StyleSheet,
  Image,
} from "react-native";
import axios from "axios";
import Moment from "moment";
import Spinner from "react-native-loading-spinner-overlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SHOPIFY_STORE, SHOPIFY_TOKEN, API_HEADERS } from "../constant/api";

function LineItemCard({ vendorHandle, onGoToLineItem, lineItem, index }) {
  if (lineItem.vendor !== vendorHandle) {
    return null;
  }

  const [imageUri, setImageUri] = useState("");

  const fetchLineItemImage = async () => {
    const imagesReq = await axios
      .get(
        `${SHOPIFY_STORE}/admin/api/2022-04/products/${lineItem.product_id}/images.json`,
        {
          headers: API_HEADERS,
        }
      )
      .catch((err) => console.log("err", err));
    const images = imagesReq.data;

    if (images && images.images && images.images.length > 0) {
      setImageUri(images.images[0].src);
    } else {
      setImageUri("");
    }
  };

  useEffect(() => {
    fetchLineItemImage();
  }, []);

  const totalEarned = lineItem.price;
  console.log(lineItem);
  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onGoToLineItem}
      key={lineItem.id}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.label}>{lineItem.order.name + " • "}</Text>
        <Text style={styles.label}>
          {Moment(lineItem.order.created_at).format("DD MMM, H:MM") + " • "}
        </Text>
        <Text style={styles.label}>{"1 item"}</Text>
      </View>

      <View style={{ ...styles.sectionContainer, alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{lineItem.title}</Text>
          <View style={styles.sectionContainer}>
            <View
              style={{
                ...styles.statusContainer,
                backgroundColor:
                  lineItem.fulfillment_status &&
                  lineItem.fulfillment_status === "fulfilled"
                    ? "#aee9d1"
                    : "#FFE991",
              }}
            >
              <Text style={styles.orderStatusText}>
                {lineItem.fulfillment_status
                  ? lineItem.fulfillment_status
                  : "Unfulfilled"}
              </Text>
            </View>
          </View>
        </View>
        <View>
          <Text>{`${totalEarned} ${lineItem.order.currency}`}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen({ navigation, route }) {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [orderedLineItems, setOrderedLineItems] = useState([]);

  useEffect(() => {
    if (isFocused) {
      fetchVendorOrders();
    }
  }, [isFocused]);

  const fetchVendorOrders = async () => {
    setLoading(true);
    const user = JSON.parse(await AsyncStorage.getItem("userData"));
    setUser(user);

    axios
      .post(
        "https://opg3ryt0jf.execute-api.us-east-1.amazonaws.com/prod/vendor-ordered-line-items",
        {
          vendorHandle: user.handle,
        }
      )
      .then((response) => {
        const lineItems = response.data;
        setOrderedLineItems(lineItems);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(function (error) {
        setLoading(false);
        setRefreshing(false);
        console.log(error);
      });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    fetchVendorOrders();
  };

  const handleGoToOrder = (order) => {
    navigation.navigate("Order", {
      order: order,
      vendorHandle: user.handle,
    });
  };

  const handleGoToLineItem = (lineItem) => {
    navigation.navigate("LineItemDetails", {
      lineItem: lineItem,
      vendorHandle: user.handle,
    });
  };

  return (
    <View style={styles.container}>
      {loading && <Spinner visible={true} />}
      <View style={{ paddingVertical: 14 }}>
        <Text style={styles.subTitle}>
          {orderedLineItems?.length === 1
            ? "1 New Order"
            : `${orderedLineItems.length} New Orders`}
        </Text>
      </View>

      <ScrollView
        style={styles.ordersList}
        contentContainerStyle={styles.orderListContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orderedLineItems.map((lineItem, index) => (
          <LineItemCard
            onGoToLineItem={() => handleGoToLineItem(lineItem)}
            key={lineItem.id}
            index={index}
            vendorHandle={user.handle}
            lineItem={lineItem}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#F6F6F7",
  },
  cardContainer: {
    backgroundColor: "white",
    padding: 16,
    shadowColor: "#000",
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F8F9",
  },
  orderListContainer: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  statusContainer: {
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 12,
    backgroundColor: "#aee9d1",
    alignItems: "center",
    justifyContent: "center",
  },
  subTitle: {
    fontFamily: "Open Sans",
    fontWeight: "bold",
    fontStyle: "normal",
    fontSize: 18,
    color: "#000",
    width: "100%",
  },
  sectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
  },
  label: {
    color: "#7A7A7A",
  },
  title: {
    fontFamily: "Open Sans",
    fontWeight: "normal",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "left",
    fontWeight: "bold",
    color: "#000",
    width: "70%",
  },
  orderStatusText: {
    fontFamily: "Open Sans",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: 11,
    textAlign: "center",
    letterSpacing: -0.1,
    color: "#000",
  },
  ordersList: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderWidth: 1,
    borderColor: "#DDDDDE",
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 38,
    height: 38,
    backgroundColor: "#C4C4C4",
    marginRight: 8,
    borderRadius: 5,
  },
});
