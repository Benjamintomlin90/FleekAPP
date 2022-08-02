import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import helper from "../theme/helper";
import Header from "../components/Header";
import { Hoshi } from "react-native-textinput-effects";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AppImages } from "../GlobalStyle";
import { SHOPIFY_STORE, SHOPIFY_TOKEN } from "../constant/api";
import axios from "axios";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { Modal, View, Text } from "react-native";
import Spinner from "react-native-loading-spinner-overlay/lib";
import RNFS from "react-native-fs";
import RNVideo from "react-native-video";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from "react-native-element-dropdown";
import {
  productConditionsList,
  productCategories,
  categoriesList,
  productAgeList,
  productSourceList,
  productStyleList,
  createDropDownList,
  renderSeparator,
} from "../constant/productAttributes";
import Icon from "../components/Icon";
import { Video } from "react-native-compressor";
import { stat } from "react-native-fs";

export default function AddProductScreen({ navigation, route }) {
  const initializationRef = useRef(false);

  const [videoAssets, setVideoAssets] = useState([]);
  const [imageAssets, setImageAssets] = useState([]);
  const [mediaList, setMediaList] = useState([]);

  //product characteristics
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productAge, setProductAge] = useState(null);
  const [productStyle, setProductStyle] = useState(null);
  const [productCategory, setCategory] = useState(null);
  const [productSubCategory, setSubCategory] = useState(null);
  const [productSubCategoryList, setSubCategoryList] = useState([]);
  const [secondProductSubCategory, setSecondSubCategory] = useState(null);
  const [secondProductSubCategoryList, setSecondSubCategoryList] = useState([]);
  // const [productQuantity, setProductQuantity] = useState("");
  const [productWeight, setProductWeight] = useState("");

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryValue, setCategoryValue] = useState(null);
  const [productCondition, setProductCondition] = useState(null);
  const [productSource, setProductSource] = useState(null);

  const [value, setValue] = useState(null);
  const [marginValue, setMarginValue] = useState("5%");
  const [styleColor, setStyleColor] = useState("black");
  const [conditionColor, setConditionColor] = useState("black");
  const [ageColor, setAgeColor] = useState("black");
  const [sourceColor, setSourceColor] = useState("black");
  const [categoryColor, setCategoryColor] = useState("black");
  const [subCategoryColor, setSubCategoryColor] = useState("black");
  const [secondSubCategoryColor, setSecondSubCategoryColor] = useState("black");

  const uploadVideoAsset = async () => {
    launchImageLibrary({
      mediaType: "video",
      durationLimit: 120,
    })
      .then(async (response) => {
        setLoading(true);
        let video = response.assets[0];

        const resultVideo = await Video.compress(
          video.uri,
          {
            compressionMethod: "auto",
          },
          (progress) => {
            console.log("Compression Progress: ", progress);
          }
        );
        //do not change order
        video.uri = resultVideo;
        const statResult = await stat(video.uri);
        video.fileSize = statResult.size;

        const videoData = {
          filename: video.fileName,
          mimeType: video.type,
          resource: "VIDEO",
          fileSize: video.fileSize.toString(),
        };

        var data = JSON.stringify({
          query: `mutation generateStagedUploads($input: [StagedUploadInput!]!) {
                stagedUploadsCreate(input: $input) {
                    stagedTargets {
                    url
                    resourceUrl
                    parameters {
                        name
                        value
                    }
                    }
                }
                }`,
          variables: { input: [videoData] },
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
            const formData = new FormData();

            const [{ url, parameters }] =
              response.data.data.stagedUploadsCreate.stagedTargets;
            const resourceUrl =
              response.data.data.stagedUploadsCreate.stagedTargets[0]
                .resourceUrl;

            parameters.forEach(({ name, value }) => {
              formData.append(name, value);
            });
            formData.append("file", video, video.fileName);

            var requestOptions = {
              method: "POST",
              body: formData,
              redirect: "follow",
            };

            fetch(url, requestOptions)
              .then((response) => response.text())
              .then((result) => {
                setVideoAssets((original) => [
                  ...original,
                  { originalSource: resourceUrl, mediaContentType: "VIDEO" },
                ]);
                setMediaList((original) => [
                  ...original,
                  { type: "VIDEO", url: video.uri },
                ]);
                setLoading(false);
              })
              .catch((error) => {
                console.log("error", error);
                setLoading(false);
              });
          })
          .catch(function (error) {
            setLoading(false);
            console.log(error);
          });
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };

  const uploadImageAsset = () => {
    launchImageLibrary({ mediaType: "photo" })
      .then((response) => {
        const image = response.assets[0];
        RNFS.readFile(image.uri, "base64").then((res) => {
          var data = {
            attachment: res,
          };
          setImageAssets((original) => [...original, data]);
          setMediaList((original) => [
            ...original,
            { type: "IMAGE", url: image.uri },
          ]);
        });

        return;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const uploadProduct = async () => {
    // if (productStyle === null) {
    //   setStyleColor("#FF7373");
    // }

    // if (productSource === null) {
    //   setSourceColor("#FF7373");
    // }

    // if (productAge === null) {
    //   setAgeColor("#FF7373");
    // }

    // if (productCondition === null) {
    //   setConditionColor("#FF7373");
    // }

    // if (productCategory === null) {
    //   setCategoryColor("#FF7373");
    // }

    // if (productSubCategory === null) {
    //   setSubCategoryColor("#FF7373");
    // }

    // if (secondProductSubCategory === null) {
    //   setSecondSubCategoryColor("#FF7373");
    // }

    if (
      productWeight == "" ||
      productName == "" ||
      productPrice == ""
      // ||
      // productCategory === null ||
      // productSubCategory === null ||
      // secondProductSubCategory === null ||
      // productCondition === null ||
      // productSource === null ||
      // productAge === null ||
      // productStyle === null
    ) {
      alert("Please fill necessary fields!");
      return;
    } else if (parseFloat(productWeight) < 1) {
      alert("Please add the weight!");
    } else if (imageAssets.length == 0 && videoAssets.length == 0) {
      alert("Please upload an image or video!");
    } else {
      setLoading(true);

      var data = JSON.stringify({
        product: {
          title: productName,
          body_html: productDescription,
          status: "draft",
          images: imageAssets,
          variants: [
            {
              price: productPrice,
              inventory_quantity: 1,
              weight: parseFloat(productWeight),
              weight_unit: "kg",
            },
          ],
          vendor: userData.handle,
          metafields: [
            {
              key: "vendor_base_price",
              value: productPrice,
              value_type: "integer",
              namespace: "joinfleek",
            },
          ],
          tags: [
            productCategory,
            productSubCategory,
            secondProductSubCategory,
            productCondition,
            productSource,
            productAge,
            productStyle,
          ],
        },
      });

      axios({
        method: "post",
        url: SHOPIFY_STORE + "/admin/api/2022-04/products.json",
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_TOKEN,
          "Content-Type": "application/json",
        },
        data: data,
      })
        .then(async (response) => {
          const product = response.data.product;

          axios.post(
            "https://opg3ryt0jf.execute-api.us-east-1.amazonaws.com/prod/upload-product",
            {
              prod: response.data.product,
              productWeight: parseFloat(productWeight),
              vendor_base_price: productPrice,
              type: "add",
            }
          );

          if (videoAssets.length == 0) {
            setLoading(false);
            navigation.navigate("Home");
          } else {
            var data = JSON.stringify({
              query: `mutation createProductMedia(
                      $id: ID!
                      $media: [CreateMediaInput!]!
                      ) {
                      productCreateMedia(productId: $id, media: $media) {
                          media {
                          ... fieldsForMediaTypes
                          mediaErrors {
                              code
                              details
                              message
                          }
                          mediaWarnings {
                              code
                              message
                          }
                          }
                          product {
                          id
                          }
                          mediaUserErrors {
                          code
                          field
                          message
                          }
                      }
                      }

                      fragment fieldsForMediaTypes on Media {
                      alt
                      mediaContentType
                      preview {
                          image {
                          id
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
                      }
                      ... on ExternalVideo {
                          id
                          host
                          embeddedUrl
                      }
                      ... on Model3d {
                          sources {
                          format
                          mimeType
                          url
                          }
                          boundingBox {
                          size {
                              x
                              y
                              z
                          }
                          }
                      }
                      }`,
              variables: {
                id: product.admin_graphql_api_id,
                media: videoAssets,
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
                setLoading(false);
                navigation.navigate("Home");
              })
              .catch(function (error) {
                setLoading(false);
                console.log(error);
              });
          }
        })
        .catch(function (error) {
          console.log("error", error);
        });
    }
  };

  const init = async () => {
    const user = JSON.parse(await AsyncStorage.getItem("userData"));
    setUserData(user);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <PageContainer>
      {loading && <Spinner visible={true} />}
      <Header
        imageSrc={AppImages.images.backArrow}
        title={"New Product"}
        buttonText="ADD PRODUCT"
        buttonStyle={{ color: "#0094FF" }}
        buttonOnPress={uploadProduct}
      />
      <KeyboardAwareScrollView style={{ width: "100%" }}>
        <ContainerView style={{ flex: 1 }}>
          <ScreenTitle>POST A PRODUCT</ScreenTitle>
          <UploadedSection horizontal={true}>
            {mediaList?.map((medias, key) => (
              <UploadBlockButton key={key}>
                {medias.type === "VIDEO" ? (
                  <RNVideo
                    source={{ uri: medias.url }}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                ) : (
                  <UploadBlockIcon
                    source={{ uri: medias.url }}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                )}
              </UploadBlockButton>
            ))}
            <UploadBlockButton onPress={() => setModalVisible(true)}>
              <Icon
                iconType={"FontAwesome"}
                iconName={"camera"}
                iconColor={"#C4C4C4"}
                iconSize={22}
              />
            </UploadBlockButton>
          </UploadedSection>

          <View style={{ marginBottom: 16 }}>
            <TextInput
              label={"£ Price per bundle - not including shipping"}
              labelStyle={{ paddingLeft: 0 }}
              borderHeight={0}
              backgroundColor={"#FFF"}
              keyboardType="numeric"
              value={productPrice}
              onChangeText={(e) => setProductPrice(e)}
            />

            <Text style={{ paddingTop: 10, color: "#7A7A7A" }}>
              Fleek will add the shipping amount on top of the price that you’ve
              entered.
            </Text>
          </View>
          {/*
            <TextInput
              label={"Quantity (how many bundles you have)"}
              borderHeight={0}
              keyboardType="numeric"
              backgroundColor={"#FFF"}
              value={productQuantity}
              onChangeText={(e) => setProductQuantity(e)}
            />
          */}

          <TextInput
            label={"Weight (kg)"}
            borderHeight={0}
            backgroundColor={"#FFF"}
            keyboardType="numeric"
            value={productWeight}
            onChangeText={(e) => setProductWeight(e)}
          />

          <TextInput
            label={"Product Title"}
            borderHeight={0}
            backgroundColor={"#FFF"}
            value={productName}
            onChangeText={(e) => setProductName(e)}
          />

          <TextInput
            label={"Description (include sizes)"}
            borderHeight={0}
            backgroundColor={"#FFF"}
            value={productDescription}
            onChangeText={(e) => setProductDescription(e)}
          />
          <View style={{ marginTop: "10%", marginBottom: "4%" }}>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 15,
              }}
            >
              TAG THIS PRODUCT (optional)
            </Text>
          </View>

          <Dropdown
            data={categoriesList}
            flatListProps={{
              ItemSeparatorComponent: renderSeparator,
            }}
            labelField="label"
            valueField="value"
            placeholder={"Category"}
            placeholderStyle={{
              color: categoryColor,
            }}
            containerStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #EFEFEF",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
              borderRadius: 8,
              borderBottomColor: "black",
              color: "#000",
            }}
            style={{
              marginBottom: "5%",
              borderBottomColor: "#EFEFEF",
              height: 50,
              borderBottomWidth: 0.5,
              color: "#000",
            }}
            selectedTextStyle={{ color: "#000" }}
            selectedStyle={{
              borderBottomColor: "black",
            }}
            onChange={(item) => {
              setCategory(item.value);
              let data = createDropDownList(
                Object.keys(productCategories[item.value])
              );
              setSubCategoryList(data);
            }}
          />

          {productSubCategoryList.length > 0 && (
            <Dropdown
              data={productSubCategoryList}
              flatListProps={{
                ItemSeparatorComponent: renderSeparator,
              }}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={"Subcategory"}
              placeholderStyle={{
                color: subCategoryColor,
              }}
              containerStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #EFEFEF",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
                borderRadius: 8,
                borderBottomColor: "black",
                color: "#000",
              }}
              style={{
                marginBottom: "5%",
                borderBottomColor: "#EFEFEF",
                height: 50,
                borderBottomWidth: 0.5,
                color: "#000",
              }}
              selectedTextStyle={{ color: "#000" }}
              selectedStyle={{
                borderBottomColor: "black",
              }}
              onChange={(item) => {
                setSubCategory(item.value);
                let data = createDropDownList(
                  productCategories[productCategory][item.value]
                );
                setSecondSubCategoryList(data);
              }}
            />
          )}

          {secondProductSubCategoryList.length > 0 && (
            <Dropdown
              data={secondProductSubCategoryList}
              flatListProps={{
                ItemSeparatorComponent: renderSeparator,
              }}
              labelField="label"
              valueField="value"
              placeholder={"SubCategory 2"}
              placeholderStyle={{
                color: secondSubCategoryColor,
              }}
              containerStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #EFEFEF",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
                borderRadius: 8,
                borderBottomColor: "black",
                color: "#000",
              }}
              style={{
                marginBottom: "5%",
                borderBottomColor: "#EFEFEF",
                height: 50,
                borderBottomWidth: 0.5,
                color: "#000",
              }}
              selectedTextStyle={{ color: "#000" }}
              selectedStyle={{
                borderBottomColor: "black",
              }}
              onChange={(item) => {
                setSecondSubCategory(item.value);
              }}
            />
          )}

          <Dropdown
            data={productConditionsList}
            flatListProps={{
              ItemSeparatorComponent: renderSeparator,
            }}
            labelField="label"
            valueField="value"
            placeholder={"Condition"}
            placeholderStyle={{
              color: conditionColor,
            }}
            containerStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #EFEFEF",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
              borderRadius: 8,
              borderBottomColor: "black",
              color: "#000",
            }}
            style={{
              marginBottom: "5%",
              borderBottomColor: "#EFEFEF",
              height: 50,
              borderBottomWidth: 0.5,
              color: "#000",
            }}
            selectedTextStyle={{ color: "#000" }}
            selectedStyle={{
              borderBottomColor: "black",
            }}
            onChange={(item) => {
              setProductCondition(item.value);
            }}
          />

          <Dropdown
            data={productSourceList}
            flatListProps={{
              ItemSeparatorComponent: renderSeparator,
            }}
            labelField="label"
            valueField="value"
            placeholder={"Source"}
            placeholderStyle={{
              color: sourceColor,
            }}
            containerStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #EFEFEF",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
              borderRadius: 8,
              borderBottomColor: "black",
              color: "#000",
            }}
            style={{
              marginBottom: "5%",
              borderBottomColor: "#EFEFEF",
              height: 50,
              borderBottomWidth: 0.5,
              color: "#000",
            }}
            selectedTextStyle={{ color: "#000" }}
            selectedStyle={{
              borderBottomColor: "black",
            }}
            onChange={(item) => {
              setProductSource(item.value);
            }}
          />

          <Dropdown
            data={productAgeList}
            flatListProps={{
              ItemSeparatorComponent: renderSeparator,
            }}
            labelField="label"
            valueField="value"
            placeholder={"Age"}
            placeholderStyle={{
              color: ageColor,
            }}
            containerStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #EFEFEF",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
              borderRadius: 8,
              borderBottomColor: "black",
              color: "#000",
            }}
            style={{
              marginBottom: "5%",
              borderBottomColor: "#EFEFEF",
              height: 50,
              borderBottomWidth: 0.5,
              color: "#000",
            }}
            selectedTextStyle={{ color: "#000" }}
            selectedStyle={{
              borderBottomColor: "black",
            }}
            onChange={(item) => {
              setProductAge(item.value);
            }}
          />

          <Dropdown
            data={productStyleList}
            flatListProps={{
              ItemSeparatorComponent: renderSeparator,
              // scrollToOffSet: function(){
              //     scrollToOffSet({x:0, y:10})
              // }
            }}
            labelField="label"
            valueField="value"
            placeholder={"Style"}
            maxHeight={300}
            placeholderStyle={{
              color: styleColor,
            }}
            keyboardAvoiding="false"
            selectedTextStyle={{ color: "#000" }}
            containerStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #EFEFEF",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
              borderRadius: 8,
              borderBottomColor: "black",
              overflow: "visible",
            }}
            style={{
              marginBottom: marginValue,
              borderBottomColor: "#EFEFEF",
              height: 50,
              borderBottomWidth: 0.5,
              color: "#000000",
            }}
            onFocus={() => {
              setMarginValue("60%");
            }}
            onChange={(item) => {
              setProductStyle(item.value);
              console.log(styleColor);
            }}
          />
        </ContainerView>
      </KeyboardAwareScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 22,
          }}
        >
          <View
            style={{
              margin: 20,
              backgroundColor: "white",
              borderRadius: 20,
              padding: 35,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <UploadButton
              onPress={() => {
                uploadVideoAsset();
                setModalVisible(false);
              }}
              style={{
                marginTop: 0,
              }}
            >
              <UploadText>Upload Video</UploadText>
            </UploadButton>

            <UploadButton
              onPress={() => {
                uploadImageAsset();
                setModalVisible(false);
              }}
            >
              <UploadText>Upload Image</UploadText>
            </UploadButton>
          </View>
        </View>
      </Modal>
    </PageContainer>
  );
}

const PageContainer = styled.SafeAreaView`
  flex: 1;
  align-items: center;
`;

const ContainerView = styled.ScrollView`
  padding: ${helper.size(20)}px;
  width: 100%;
  flex: 1;
`;

const HeaderTitle = styled.Text`
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 700;
  font-size: ${helper.size(24)}px;
  line-height: ${helper.size(33)}px;
  color: #000000;
`;

const UploadText = styled.Text`
  font-family: "Open Sans";
  margin-top: ${helper.size(10)}px;
  font-style: normal;
  font-weight: 700;
  font-size: ${helper.size(14)}px;
  line-height: ${helper.size(19)}px;
  color: #0094ff;
`;

const FontDesign = styled.Text`
  font-family: "Open Sans";
  font-style: normal;
  margin-bottom: 3%;
  font-size: ${helper.size(14)}px;
  line-height: ${helper.size(19)}px;
`;
const ScreenTitle = styled.Text`
  font-family: Open Sans;
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  text-align: left;
`;

const UploadDescription = styled.Text`
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 400;
  font-size: ${helper.size(14)}px;
  line-height: ${helper.size(19)}px;
  color: #2f2f2f;
`;

const UploadButton = styled.TouchableOpacity`
  margin-top: ${helper.size(10)}px;
  margin-bottom: ${helper.size(10)}px;
`;

const AddButton = styled.TouchableOpacity`
  background: #fff500;
  border-radius: ${helper.size(45)}px;
  padding: ${helper.size(12)}px;
  width: 100%;
  margin-bottom: 30px;
  margin-top: ${helper.size(30)}px;
`;

const AddButtonText = styled.Text`
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 600;
  font-size: ${helper.size(14)}px;
  line-height: ${helper.size(22)}px;
  display: flex;
  align-items: center;
  text-align: center;
  letter-spacing: -0.408px;
  color: #000000;
`;

const TextInput = styled(Hoshi)`
  font-size: ${helper.size(20)}px;
  margin-top: ${helper.size(5)}px;
`;

const UploadedSection = styled.ScrollView`
  flex-direction: row;
`;

const UploadBlockButton = styled.TouchableOpacity`
  height: ${helper.size(150)}px;
  width: ${helper.size(100)}px;
  justify-content: center;
  align-items: center;
  border-radius: ${helper.size(10)}px;
  background: #f4f4f4;
  margin-right: ${helper.size(10)}px;
  margin-top: ${helper.size(10)}px;
`;

const UploadBlockIcon = styled.Image`
  width: ${helper.size(30)}px;
  height: ${helper.size(30)}px;
`;
