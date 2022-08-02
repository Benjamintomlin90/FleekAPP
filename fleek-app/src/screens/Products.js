import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import Spinner from "react-native-loading-spinner-overlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styled from "styled-components";
import helper from "../theme/helper";
import axios from "axios";
import { AppImages } from "../GlobalStyle";
import { SHOPIFY_STORE, SHOPIFY_TOKEN } from "../constant/api";

const tabContent = [
  {
    id: 1,
    title: "All",
    value: "all",
  },
  {
    id: 2,
    title: "Under review",
    value: "draft",
  },
  {
    id: 3,
    title: "Active",
    value: "active",
  },
  {
    id: 4,
    title: "Sold",
    value: "sold",
  },
];

function ProductCard({ product, goToEditProduct }) {
  const [thumbnail, setThumbnail] = useState();

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  useEffect(() => {
    var data = JSON.stringify({
      query: `{
        product(id:"gid://shopify/Product/${product.id}") {
          media(first:1) {
          edges {
            node {
              alt
            mediaContentType
            preview {
              image {
                id
                altText
                url
              }
            }
            status
            ... on Video {
              id
              sources {
                format
                height
                mimeType
                url
                width
              }
              originalSource {
                format
                height
                mimeType
                url
                width
              }
            }
            ... on MediaImage {
              id
              image {
                altText
                url
              }
            }
              }
            }
          }
        }
      }
      `,
      variables: {
        id: product.admin_graphql_api_id,
      },
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
      .then(function (response) {
        if (
          response.data.data.product &&
          response.data.data.product.media &&
          response.data.data.product.media.edges &&
          response.data.data.product.media.edges.length > 0 &&
          response.data.data.product.media.edges[0].node.preview.image.url
        )
          setThumbnail(
            response.data.data.product.media.edges[0].node.preview.image.url
          );
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  return (
    <ProductContent key={product.id} onPress={goToEditProduct}>
      <View
        style={{ flexDirection: "row", alignItems: "center", width: "100%" }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
          }}
        >
          <ProductImage
            source={
              thumbnail ? { uri: thumbnail } : AppImages.images.emptyPhoto
            }
          />
          <Text
            style={{ ...styles.productTitle, width: "80%" }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {product.title}
          </Text>
        </View>
        <SectionTwo>
          {product.status == "active" ? (
            <StatusView>
              <StatusText>
                {product.variants[0].inventory_quantity > 0 ? "Active" : "Sold"}
              </StatusText>
            </StatusView>
          ) : (
            <StatusDarftView>
              <StatusDraftText>
                {capitalizeFirstLetter(
                  product.status == "draft" ? "Under review" : product.status
                )}
              </StatusDraftText>
            </StatusDarftView>
          )}
        </SectionTwo>
      </View>
    </ProductContent>
  );
}

export default function ProductScreen({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [originalProductlist, setOriginalProductList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    const user = JSON.parse(await AsyncStorage.getItem("userData"));
    setRefreshing(true);

    fetchVendorProducts();
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchVendorProducts();
    }
  }, [isFocused]);

  const handleGoToEditProduct = (product) => {
    navigation.navigate("EditProduct", {
      productTitle: product.title,
      productId: product.id,
    });
  };

  const fetchVendorProducts = async () => {
    setLoading(true);
    const user = JSON.parse(await AsyncStorage.getItem("userData"));
    console.log(user);
    axios
      .post(
        "https://opg3ryt0jf.execute-api.us-east-1.amazonaws.com/prod/vendor-products",
        {
          vendorHandle: user.handle,
        }
      )
      .then(function (response) {
        setOriginalProductList(response.data);
        setProductList(response.data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(function (error) {
        setLoading(false);
        setRefreshing(false);
        console.log(error);
      });
  };

  const handleTab = (tabValue) => {
    setActiveTab(tabValue);
    if (tabValue == "all") {
      setProductList(originalProductlist);
    } else {
      if (tabValue == "sold") {
        const data = originalProductlist.filter(
          (product) =>
            product.status == "active" &&
            product.variants[0].inventory_quantity < 1
        );
        setProductList(data);
      } else if (tabValue == "active") {
        const data = originalProductlist.filter(
          (product) =>
            product.status == "active" &&
            product.variants[0].inventory_quantity > 0
        );
        setProductList(data);
      } else {
        const data = originalProductlist.filter(
          (product) => product.status == tabValue
        );
        setProductList(data);
      }
    }
  };

  const TabView = () => {
    return (
      <TabContainer>
        {tabContent.map((tabs) =>
          activeTab == tabs.value ? (
            <ActiveTabButton
              key={tabs.title}
              onPress={() => {
                handleTab(tabs.value);
              }}
            >
              <ActiveTabText>{tabs.title}</ActiveTabText>
            </ActiveTabButton>
          ) : (
            <InActiveTabButton
              key={tabs.title}
              onPress={() => {
                handleTab(tabs.value);
              }}
            >
              <InActiveTabText>{tabs.title}</InActiveTabText>
            </InActiveTabButton>
          )
        )}
      </TabContainer>
    );
  };

  const searchProduct = (keyword) => {
    setSearchText(keyword);
    const data = originalProductlist.filter((product) =>
      product.title.includes(keyword)
    );
    setProductList(data);
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {loading && <Spinner visible={true} />}
        <View
          style={{
            paddingVertical: 14,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.ordersCountText}>
            {productList?.length === 1
              ? "1 Bundle"
              : `${productList.length} Bundles`}
          </Text>

          <AddBundleButton onPress={() => navigation.navigate("AddProduct")}>
            <AddBundleText>ADD PRODUCT</AddBundleText>
          </AddBundleButton>
        </View>

        <View style={styles.ordersList}>
          <TabView />
          <SearchContainer>
            <SearchImage source={AppImages.images.searchIcon} />
            <SearchInput
              placeholder="Search Product"
              placeholderTextColor={"#888"}
              value={searchText}
              onChangeText={(e) => searchProduct(e)}
            />
          </SearchContainer>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 10,
            }}
          >
            <Text style={styles.ordersCountText}>Product</Text>
            <Text style={styles.ordersCountText}>Status</Text>
          </View>

          <ScrollView
            style={{ paddingTop: 10 }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {productList?.map((product, index) => {
              return (
                <ProductCard
                  goToEditProduct={() => handleGoToEditProduct(product)}
                  key={product.id}
                  index={index}
                  product={product}
                />
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const TabContainer = styled.View`
  flex-direction: row;
  border-bottom-width: 1px;
  border-color: #ccc;
  padding-left: ${helper.size(5)}px;
  padding-right: ${helper.size(5)}px;
`;

const ActiveTabButton = styled.TouchableOpacity`
  padding: 10px;
  border-bottom-width: 2px;
  border-color: #008060;
  padding-left: 20px;
  padding-right: 20px;
`;

const ActiveTabText = styled.Text`
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 400;
  font-size: ${helper.size(14)}px;
  line-height: ${helper.size(22)}px;
  text-align: center;
  letter-spacing: -0.408px;
  color: #202223;
`;

const InActiveTabButton = styled.TouchableOpacity`
  padding: 10px;
  padding-left: 20px;
  padding-right: 20px;
`;

const InActiveTabText = styled.Text`
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 400;
  font-size: ${helper.size(14)}px;
  line-height: ${helper.size(22)}px;
  text-align: center;
  letter-spacing: -0.408px;
  color: #666;
`;

const MainView = styled.ScrollView`
  height: 90%;
`;

const SearchContainer = styled.View`
  width: 100%;
  padding: ${helper.size(10)}px;
  padding-bottom: 0px;
`;

const SearchInput = styled.TextInput`
  padding: ${helper.size(10)}px;
  border: 1px solid #aaa;
  border-radius: ${helper.size(5)}px;
  width: 100%;
  padding-left: ${helper.size(35)}px;
  height: ${helper.size(38)}px;
  font-size: ${helper.size(12)}px;
  color: #000;
`;

const SearchImage = styled.Image`
  position: absolute;
  left: ${helper.size(20)}px;
  top: ${helper.size(18)}px;
  width: ${helper.size(20)}px;
  height: ${helper.size(20)}px;
  tint-color: #888;
`;

const ProductContent = styled.TouchableOpacity`
  padding: ${helper.size(10)}px;
  flex-direction: row;
  border: 1px solid #f6f6f7;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

const ProductImage = styled.Image`
  width: ${helper.size(32)}px;
  height: ${helper.size(32)}px;
`;

const SectionTwo = styled.View`
  align-items: flex-end;
  justify-content: center;
`;

const StatusView = styled.View`
  border-radius: ${helper.size(20)}px;
  padding: ${helper.size(2)}px;
  padding-left: ${helper.size(12)}px;
  padding-right: ${helper.size(12)}px;
  background: #aee9d1;
  align-items: center;
  justify-content: center;
`;

const StatusDarftView = styled.View`
  border-radius: ${helper.size(20)}px;
  padding: ${helper.size(2)}px;
  padding-left: ${helper.size(12)}px;
  padding-right: ${helper.size(12)}px;
  background: #a4e8f2;
  align-items: center;
  justify-content: center;
`;

const StatusText = styled.Text`
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 400;
  font-size: ${helper.size(12)}px;
  text-align: center;
  letter-spacing: -0.2px;
  color: #000;
`;

const StatusDraftText = styled.Text`
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 400;
  font-size: ${helper.size(12)}px;
  text-align: center;
  letter-spacing: -0.2px;
  color: #000;
`;

const AddBundleButton = styled.TouchableOpacity``;

const AddBundleText = styled.Text`
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 700;
  font-size: ${helper.size(14)}px;
  line-height: ${helper.size(19)}px;
  text-align: right;
  color: #0094ff;
`;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
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
  ordersCountText: {
    fontFamily: "Open Sans",
    fontWeight: "bold",
    fontStyle: "normal",
    fontSize: 18,
    color: "#000",
  },
  sectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
    alignItems: "center",
  },
  detailsContainer: {
    flexDirection: "row",
  },
  orderTitleText: {
    fontFamily: "Open Sans",
    fontWeight: "normal",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
    color: "#000",
  },
  orderDetailsText: {
    color: "#7A7A7A",
  },
  orderStatusText: {
    fontFamily: "Open Sans",
    fontStyle: "normal",
    fontSize: 11,
    textAlign: "center",
    letterSpacing: -0.1,
    color: "#000",
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
  ordersList: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderWidth: 1,
    borderColor: "#DDDDDE",
    borderRadius: 8,
    flex: 1,
  },
  productTitle: {
    fontFamily: "Open Sans",
    fontSize: 14,
    textAlign: "left",
    color: "#000",
    paddingLeft: 5,
  },
  innerContainer: {
    // width: '100%'
    flex: 1,
    width: "100%",
  },
});
