import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { AppImages } from "../GlobalStyle";
import {
  TouchableOpacity,
  SafeAreaView,
  Text,
  View,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  Linking,
} from "react-native";
import Header from "../components/Header";
import Clipboard from "@react-native-clipboard/clipboard";
import { useIsFocused } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Spinner from "react-native-loading-spinner-overlay";
import { SHOPIFY_STORE, SHOPIFY_TOKEN, API_HEADERS } from "../constant/api";
import axios from "axios";
import Moment from "moment";
import { Dropdown } from "react-native-element-dropdown";
import { parse } from "@babel/core";

export const confirmStatusList = [
  { label: "Accept", value: "accepted" },
  { label: "Reject", value: "rejected" },
];

export const dispatchStatusList = [
  { label: "Dispatched", value: "dispatched" },
  { label: "Not Dispatched", value: "not-dispatched" },
];

function ProductCard({
  fulfillmentObj,
  orderLineItemsStatus,
  product,
  order,
  index,
}) {
  const productStatus = orderLineItemsStatus[product.id];
  const fulfillmentStatus = fulfillmentObj[product.id];
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState("");
  const [handle, setHandle] = useState("");
  const [trackingNumber, setTrackingNumber] = useState(
    fulfillmentStatus?.tracking_number
  );
  const [shippingCarrier, setShippingCarrier] = useState(
    fulfillmentStatus?.tracking_company
  );

  useEffect(() => {
    if (isFocused) {
      fetchOrderDetails();
    }
  }, [isFocused]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    const imagesReq = await axios
      .get(
        `${SHOPIFY_STORE}/admin/api/2022-04/products/${product.product_id}/images.json`,
        {
          headers: API_HEADERS,
        }
      )
      .catch((err) => console.log("err", err));
    const images = imagesReq.data;

    if (images && images.images && images.images.length > 0) {
      setLoading(false);
      setImageUri(images.images[0].src);
    } else {
      setLoading(false);
      setImageUri("");
    }

    const handleReq = await axios
      .get(
        `${SHOPIFY_STORE}/admin/api/2022-04/products/${product.product_id}.json?fields=handle`,
        {
          headers: API_HEADERS,
        }
      )
      .catch((err) => console.log("err", err));

    const handle = handleReq.data.product.handle || "";
    setHandle(handle);
  };

  return (
    <View style={{ marginBottom: 30 }}>
      <View
        key={index}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          // flex: 1,
          width: "100%",
          marginBottom: 5,
        }}
      >
        <Image
          style={styles.imagePlaceholder}
          source={
            imageUri !== "" ? { uri: imageUri } : AppImages.images.emptyPhoto
          }
        />
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              width: "100%",
              flex: 1,
            }}
          >
            <Text
              style={{
                ...styles.productTitle,
                width: "90%",
                textDecorationLine: "underline",
              }}
              onPress={() =>
                Linking.openURL(`https://joinfleek.com/products/${handle}`)
              }
            >
              {product.name}
            </Text>
            <Text style={styles.orderDetailsText}>
              {`${order.current_total_tax}%`}
            </Text>
            <Text style={styles.orderDetailsText}>
              {`${product.price} ${order.currency} x ${product.quantity}`}
            </Text>
          </View>
          <Text style={styles.productTitle}>
            {`${product.price} ${order.currency}`}
          </Text>
        </View>
      </View>

      <View>
        <View style={{ paddingTop: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "400",
              lineHeight: 16,
              letterSpacing: 0,
              color: "#7A7A7A",
            }}
          >
            Confirmation Status
          </Text>
          <Dropdown
            disable={productStatus === "dispatched"}
            data={confirmStatusList}
            labelField="label"
            valueField="value"
            maxHeight={confirmStatusList.length * 55}
            placeholder={"Accept or Reject Item"}
            placeholderStyle={{
              color: "#000",
            }}
            containerStyle={{
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              color: "#000",
            }}
            style={{
              borderBottomColor: "#E8E8E8",
              borderBottomWidth: 0.5,
              color: "#000",
            }}
            selectedTextStyle={{ color: "#000" }}
            selectedStyle={{
              borderBottomColor: "black",
            }}
            value={
              productStatus === "accepted" ||
              productStatus === "dispatched" ||
              productStatus === "not-dispatched"
                ? "accepted"
                : null
            }
            onChange={async (item) => {
              const res = await axios
                .post(
                  `${SHOPIFY_STORE}/admin/api/2021-10/orders/${order.id}/metafields.json`,
                  {
                    metafield: {
                      namespace: "joinfleek",
                      key: "order_line_items_status",
                      type: "json_string",
                      value: JSON.stringify({
                        ...orderLineItemsStatus,
                        [product.id]: item.value,
                      }),
                    },
                  },
                  {
                    headers: API_HEADERS,
                  }
                )
                .then((res) => console.log("success", res.data))
                .catch((err) => console.log("err", err));
            }}
          />
        </View>

        {productStatus === "accepted" ||
        productStatus === "dispatched" ||
        productStatus === "not-dispatched" ? (
          <View style={{ paddingTop: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "400",
                lineHeight: 16,
                letterSpacing: 0,
                color: "#7A7A7A",
              }}
            >
              Dispatch Status
            </Text>
            <Dropdown
              data={dispatchStatusList}
              labelField="label"
              valueField="value"
              maxHeight={dispatchStatusList.length * 55}
              placeholder={"Dispatched or not dispatched"}
              placeholderStyle={{
                color: "#000",
              }}
              containerStyle={{
                backgroundColor: "#FFFFFF",
                borderRadius: 8,
                color: "#000",
              }}
              style={{
                borderBottomColor: "#E8E8E8",
                borderBottomWidth: 0.5,
              }}
              selectedTextStyle={{ color: "#000" }}
              selectedStyle={{
                borderBottomColor: "black",
              }}
              value={orderLineItemsStatus[product.id]}
              onChange={async (item) => {
                const res = await axios
                  .post(
                    `${SHOPIFY_STORE}/admin/api/2021-10/orders/${order.id}/metafields.json`,
                    {
                      metafield: {
                        namespace: "joinfleek",
                        key: "order_line_items_status",
                        type: "json_string",
                        value: JSON.stringify({
                          ...orderLineItemsStatus,
                          [product.id]: item.value,
                        }),
                      },
                    },
                    {
                      headers: API_HEADERS,
                    }
                  )
                  .then((res) => console.log("success", res.data))
                  .catch((err) => console.log("err", err));
              }}
            />
          </View>
        ) : null}

        {productStatus === "dispatched" ? (
          <View style={{ paddingTop: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "400",
                lineHeight: 16,
                letterSpacing: 0,
                color: "#7A7A7A",
              }}
            >
              Tracking Information
            </Text>

            <TextInput
              placeholder={"Tracking Number"}
              value={trackingNumber}
              onChangeText={(val) => {
                setTrackingNumber(val);
              }}
              placeholderTextColor="#000"
              multiline
              style={{
                paddingTop: 16,
                paddingBottom: 8,
                borderBottomWidth: 1,
                borderBottomColor: "#F8F8F9",
              }}
            />

            <TextInput
              placeholder={"Shipping Carrier"}
              value={shippingCarrier}
              onChangeText={(val) => {
                setShippingCarrier(val);
              }}
              placeholderTextColor="#000"
              multiline
              style={{
                paddingTop: 16,
                paddingBottom: 8,
                borderBottomWidth: 1,
                borderBottomColor: "#F8F8F9",
              }}
            />
          </View>
        ) : null}

        {productStatus === "dispatched" && trackingNumber && shippingCarrier ? (
          <TouchableOpacity
            onPress={async () => {
              //update fulfillment
              await axios
                .post(
                  `${SHOPIFY_STORE}/admin/api/2021-10/orders/${order.id}/fulfillments.json`,
                  {
                    fulfillment: {
                      location_id: order.location_id,
                      tracking_number: trackingNumber,
                      tracking_company: shippingCarrier,
                      line_items: [{ id: product.id }],
                      status: "pending",
                    },
                  },
                  {
                    headers: API_HEADERS,
                  }
                )
                .then((res) => console.log("success", res.data))
                .catch((err) => console.log("err", err));

              await axios
                .post(
                  `${SHOPIFY_STORE}/admin/api/2021-10/orders/${order.id}/metafields.json`,
                  {
                    metafield: {
                      namespace: "joinfleek",
                      key: "fulfillment",
                      type: "json_string",
                      value: JSON.stringify({
                        ...fulfillmentObj,
                        [product.id]: {
                          tracking_company: shippingCarrier,
                          tracking_number: trackingNumber,
                        },
                      }),
                    },
                  },
                  {
                    headers: API_HEADERS,
                  }
                )
                .then((res) => console.log("success", res.data))
                .catch((err) => console.log("err", err));
            }}
            style={styles.fulfillButton}
          >
            <Text style={styles.fulfillLabel}>FULFILL ITEM</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export default function OrderDetails({ navigation, route }) {
  const { order, vendorHandle } = route.params;

  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [note, setNote] = useState(order.note || "");
  const [orderLineItemsStatus, setOrderLineItemsStatus] = useState({});
  const [fulfillmentObj, setFulfillmentObj] = useState({});
  const lineItems =
    order.line_items && order.line_items.length > 0
      ? order.line_items.filter((lineItem) => lineItem.vendor === vendorHandle)
      : [];

  if (lineItems.length === 0) {
    return null;
  }

  useEffect(() => {
    axios
      .get(
        `${SHOPIFY_STORE}/admin/api/2021-07/orders/${order.id}/metafields.json`,
        {
          headers: API_HEADERS,
        }
      )
      .then((res) => {
        if (res.data && res.data.metafields) {
          for (let metafield of res.data.metafields) {
            if (metafield.key === "order_line_items_status") {
              setOrderLineItemsStatus(JSON.parse(metafield.value));
            }
            if (metafield.key === "fulfillment") {
              setFulfillmentObj(JSON.parse(metafield.value));
            }
          }
        }
      })
      .catch((err) => console.log("err", err));

    // axios
    //   .get(
    //     `${SHOPIFY_STORE}/admin/api/2021-07/orders/${order.id}/fulfillment_orders.json`,
    //     {
    //       headers: API_HEADERS,
    //     }
    //   )
    //   .then((res) => {
    //     console.log(res.data.fulfillment_orders[0].line_items);
    //   })
    //   .catch((err) => console.log("err", err));

    var data = JSON.stringify({
      query: `{
        fulfillment($id) {
         trackingInfo {
           number
         }
        }
      }`,
      variables: { id: "gid://shopify/Fulfillment/3955671695538" },
    });

    var config = {
      method: "post",
      url: SHOPIFY_STORE + "/admin/api/2022-04/graphql.json",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_TOKEN,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(async function (response) {
        console.log("response.data", response.data);
      })
      .catch((err) => console.log("err"));
  }, []);

  const address = order.hasOwnProperty("shipping_address")
    ? order.shipping_address?.name +
      "\n" +
      order.shipping_address?.address1 +
      "\n" +
      order.shipping_address?.city +
      ", " +
      order.shipping_address?.province +
      "\n" +
      order.shipping_address?.zip +
      "\n" +
      order.shipping_address?.country +
      "\n"
    : "";

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (note) {
        axios({
          method: "put",
          url:
            SHOPIFY_STORE + "/admin/api/2022-07/orders/" + order.id + ".json",
          data: {
            order: {
              id: order.id,
              note: note,
            },
          },
          headers: API_HEADERS,
        });
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [note]);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        imageSrc={AppImages.images.backArrow}
        title={lineItems[0].title}
      />
      <KeyboardAwareScrollView
        style={styles.innerContainer}
        contentContainerStyle={{ flexGrow: 1, flex: 1 }}
      >
        <ScrollView>
          {loading && <Spinner visible={true} />}
          <View style={styles.orderCard}>
            <View style={styles.coloredHeader}>
              <View style={styles.detailsContainer}>
                <Text style={styles.orderDetailsText}>
                  {order.name + " • "}
                </Text>
                <Text style={styles.orderDetailsText}>
                  {Moment(order.created_at).format("DD MMM, H:MM") + " • "}
                </Text>
                <Text style={styles.orderDetailsText}>
                  {lineItems?.length === 1
                    ? "1 item"
                    : `${lineItems.length} items`}
                </Text>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.orderTitleText}>{lineItems[0].title}</Text>
              </View>

              <View style={styles.sectionContainer}>
                <View
                  style={{
                    ...styles.statusContainer,
                    backgroundColor: order.fulfillment_status
                      ? "#aee9d1"
                      : "#FFE991",
                  }}
                >
                  <Text style={styles.orderStatusText}>
                    {order.fulfillment_status ? "Fulfilled" : "Unfulfilled"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.additionalInfo}>
              <View style={styles.listContainer}>
                {lineItems?.map((product, index) => (
                  <ProductCard
                    key={index}
                    orderLineItemsStatus={orderLineItemsStatus}
                    fulfillmentObj={fulfillmentObj}
                    product={product}
                    order={order}
                  />
                ))}
              </View>

              {order.shipping_address ? (
                <View style={styles.addressContainer}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      marginBottom: 5,
                    }}
                  >
                    {"SHIPPING ADDRESS"}
                  </Text>
                  <View style={styles.addressCopy}>
                    <Text>{address}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        Clipboard.setString(address);
                        setIsCopied(true);
                      }}
                    >
                      <Text
                        style={{
                          color: isCopied ? "#777" : "#0094FF",
                          fontWeight: "bold",
                        }}
                      >
                        {isCopied ? "COPIED" : "COPY"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View />
              )}
            </View>
          </View>
          <View style={{ ...styles.orderCard, marginTop: 10 }}>
            <View style={styles.coloredHeader}>
              <Text style={styles.orderTitleText}>{"NOTES"}</Text>
            </View>
            <View style={{ display: "flex", paddingTop: 8 }}>
              <TextInput
                placeholder={"Write here"}
                value={note}
                onChangeText={(val) => {
                  setNote(val);
                }}
                backgroundColor={"#FFF"}
                placeholderTextColor="#000"
                multiline
                style={{
                  padding: 16,
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    width: "100%",
    padding: 18,
    // flex: 1
  },
  cardFooter: {
    padding: 16,
  },
  fulfillButton: {
    height: 50,
    marginTop: 16,
    borderRadius: 45,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    width: "100%",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  confirmationButton: {
    height: 32,
    width: 48,
    borderRadius: 45,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  yesLabel: {
    fontFamily: "Open Sans",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
    color: "#4ECB71",
  },
  fulfillLabel: {
    fontFamily: "Open Sans",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
    color: "#0094FF",
  },
  noLabel: {
    fontFamily: "Open Sans",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
    color: "#FF7373",
  },
  container: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    backgroundColor: "#F6F6F7",
  },
  listContainer: {
    width: "100%",
  },
  statusContainer: {
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 12,
    backgroundColor: "#aee9d1",
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontFamily: "Open Sans",
    fontWeight: "700",
    fontStyle: "normal",
    fontSize: 18,
    lineHeight: 25,
    color: "#000",
    width: "100%",
  },
  sectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    alignItems: "center",
  },
  detailsContainer: {
    flexDirection: "row",
  },
  orderTitleText: {
    fontFamily: "Open Sans",
    fontStyle: "normal",
    fontWeight: "700",
    fontSize: 18,
    color: "#000",
  },
  orderDetailsText: {
    color: "#7A7A7A",
    fontSize: 14,
    marginTop: 3,
  },
  orderStatusText: {
    fontFamily: "Open Sans",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: 10,
    textAlign: "center",
    letterSpacing: -0.2,
    color: "#000",
  },
  orderCard: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DDDDDE",
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: "#C4C4C4",
    marginRight: 8,
    borderRadius: 5,
  },
  addressCopy: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  coloredHeader: {
    backgroundColor: "#FBF7ED",
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  additionalInfo: {
    padding: 16,
  },
  addressContainer: {
    marginTop: 10,
  },
});
