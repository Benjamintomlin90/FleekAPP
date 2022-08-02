import React, { useEffect, useState } from "react";
import { StyleSheet, SafeAreaView, Text, View, Pressable } from "react-native";
import Header from "../components/Header";
import { SHOPIFY_STORE, SHOPIFY_TOKEN, API_HEADERS } from "../constant/api";
import OrdersScreen from "./Orders";
import ProductsScreen from "./Products";
import UpdateBanner from "../components/UpdateBanner";
import axios from "axios";
export default function HomeScreen({ navigation }) {
  const [isOrdersSelected, setIsOrdersSelected] = useState(false);
  // useEffect(() => {
  //   const handle = "raes-vintage";
  //   const collectionId = "405369323758";
  //   const shopName = "RAES VINTAGE";
  //   const country = "Italy";

  //   axios({
  //     method: "put",
  //     url:
  //       SHOPIFY_STORE +
  //       `/admin/api/2021-10/smart_collections/${collectionId}.json`,
  //     headers: {
  //       "X-Shopify-Access-Token": SHOPIFY_TOKEN,
  //       "Content-Type": "application/json",
  //     },
  //     data: {
  //       smart_collection: {
  //         rules: [
  //           {
  //             column: "vendor",
  //             relation: "equals",
  //             condition: handle,
  //           },
  //         ],
  //       },
  //     },
  //   });

  //   var mutationsData = JSON.stringify({
  //     query: `mutation {
  //           metafieldsSet(metafields: [{
  //             ownerId: "gid://shopify/Collection/${collectionId}",
  //             key: "country",
  //             value: "${country}",
  //             type: "single_line_text_field",
  //             namespace: "my_fields"
  //           },{
  //             ownerId: "gid://shopify/Collection/${collectionId}",
  //             key: "name",
  //             value: "${shopName}",
  //             type: "single_line_text_field",
  //             namespace: "my_fields"
  //           },
  //           {
  //             ownerId: "gid://shopify/Collection/${collectionId}",
  //             key: "location",
  //             value: "${country}",
  //             type: "single_line_text_field",
  //             namespace: "my_fields"
  //           },
  //           {
  //             ownerId: "gid://shopify/Collection/${collectionId}",
  //             key: "avatar",
  //             value: "gid://shopify/MediaImage/29541064835310",
  //             type: "file_reference",
  //             namespace: "my_fields"
  //           }
  //         ]) {
  //             metafields {
  //               # Metafield fields
  //               id
  //             }
  //             userErrors {
  //               field
  //               message
  //             }
  //           }
  //         }`,
  //   });
  //   axios
  //     .post(SHOPIFY_STORE + "/admin/api/2022-04/graphql.json", mutationsData, {
  //       headers: API_HEADERS,
  //     })
  //     .catch((err) => console.log("err", err))
  //     .then((res) => console.log("updated metafields", res.data));
  // }, []);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <UpdateBanner />

      <View style={{ flex: 1, backgroundColor: "#F6F6F7" }}>
        <Header />
        <View style={styles.container}>
          <View style={styles.tabsBar}>
            <Pressable
              style={
                isOrdersSelected
                  ? styles.tabContainer
                  : { ...styles.tabContainer, ...styles.selectedTab }
              }
              onPress={() => setIsOrdersSelected(false)}
            >
              <Text style={styles.tabTitle}>Products</Text>
            </Pressable>
            <Pressable
              style={
                !isOrdersSelected
                  ? styles.tabContainer
                  : { ...styles.tabContainer, ...styles.selectedTab }
              }
              onPress={() => setIsOrdersSelected(true)}
            >
              <Text style={styles.tabTitle}>New Orders</Text>
            </Pressable>
          </View>

          {isOrdersSelected ? (
            <OrdersScreen navigation={navigation} />
          ) : (
            <ProductsScreen navigation={navigation} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: "100%",
    height: "100%",
  },
  tabsBar: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E7E7E9",
    borderRadius: 8,
    padding: 4,
  },
  tabContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    flex: 1,
    paddingVertical: 7,
  },
  tabTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  selectedTab: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
});
