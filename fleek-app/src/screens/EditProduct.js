import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, View, Text, Image } from "react-native";
import styled from "styled-components";
import helper from "../theme/helper";
import Header from "../components/Header";
import { Hoshi } from "react-native-textinput-effects";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { launchImageLibrary } from "react-native-image-picker";
import Spinner from "react-native-loading-spinner-overlay/lib";
import RNFS from "react-native-fs";
import RNVideo from "react-native-video";
import { AppImages } from "../GlobalStyle";
import { Dropdown } from "react-native-element-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SHOPIFY_STORE, SHOPIFY_TOKEN, API_HEADERS } from "../constant/api";
import axios from "axios";
import { Video } from "react-native-compressor";
import { stat } from "react-native-fs";

import {
  productConditionsList,
  productCategories,
  categoriesList,
  productAgeList,
  productSourceList,
  productStyleList,
  createDropDownList,
  renderSeparator,
  productAgeSet,
  productStyleSet,
  productSourceSet,
  productConditionSet,
  categorySet,
  subCategorySet,
  secondSubCategorySet,
} from "../constant/productAttributes";
import { useIsFocused } from "@react-navigation/native";
export const EditProductScreen = ({ route, navigation }) => {
  const { productTitle, productId } = route.params;

  const [videoAssets, setVideoAssets] = useState([]);
  const [imageAssets, setImageAssets] = useState([]);
  const [mediaList, setMediaList] = useState([]);

  const [loading, setLoading] = useState(true);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [userData, setUserData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [productCondition, setProductCondition] = useState(null);
  const [productSource, setProductSource] = useState(null);
  const [productAge, setProductAge] = useState(null);
  const [productStyle, setProductStyle] = useState(null);
  const [productCategory, setCategory] = useState(null);
  const [productSubCategory, setSubCategory] = useState(null);
  const [productSubCategoryList, setSubCategoryList] = useState([]);
  const [secondProductSubCategory, setSecondSubCategory] = useState(null);
  const [secondProductSubCategoryList, setSecondSubCategoryList] = useState([]);
  const isFocused = useIsFocused();

  const [value, setValue] = useState(null);
  const [images, setImages] = useState(null);
  const [productWeight, setProductWeight] = useState("");

  const EditProduct = async () => {
    setLoading(true);
    var data = JSON.stringify({
      product: {
        title: productName,
        body_html: productDescription,
        images: imageAssets,
        variants: [
          {
            price: productPrice,
            inventory_quantity: 1,
            weight: parseFloat(productWeight),
            weight_unit: "kg",
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

    var config = {
      method: "put",
      url: `${SHOPIFY_STORE}/admin/api/2021-10/products/${productId}.json`,
      headers: {
        "X-shopify-Access-Token": SHOPIFY_TOKEN,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        setLoading(false);
        alert("Successfully saved!");

        axios.post(
          "https://opg3ryt0jf.execute-api.us-east-1.amazonaws.com/prod/upload-product",
          {
            prod: response.data.product,
            productWeight: parseFloat(productWeight),
            type: "update",
            vendor_base_price: productPrice,
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
              id: `gid://shopify/Product/${productId}`,
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

        navigation.navigate("Home");
      })
      .catch(function (error) {
        setLoading(false);
        console.log(error);
      });
  };

  // const uploadVideoAsset = async () => {
  //   launchImageLibrary({ mediaType: "video" })
  //     .then(async (response) => {
  //       setLoading(true);
  //       let video = response.assets[0];

  //       const resultVideo = await Video.compress(
  //         video.uri,
  //         {
  //           compressionMethod: "auto",
  //         },
  //         (progress) => {
  //           console.log("Compression Progress: ", progress);
  //         }
  //       );

  //       //do not change order
  //       video.uri = resultVideo;
  //       const statResult = await stat(video.uri);
  //       video.fileSize = statResult.size;

  //       const videoData = {
  //         filename: video.fileName,
  //         mimeType: video.type,
  //         resource: "VIDEO",
  //         fileSize: video.fileSize.toString(),
  //       };

  //       var data = JSON.stringify({
  //         query: `mutation generateStagedUploads($input: [StagedUploadInput!]!) {
  //               stagedUploadsCreate(input: $input) {
  //                 stagedTargets {
  //                 url
  //                 resourceUrl
  //                 parameters {
  //                     name
  //                     value
  //                 }
  //               }
  //             }
  //           }`,
  //         variables: { input: [videoData] },
  //       });

  //       var config = {
  //         method: "post",
  //         url: SHOPIFY_STORE + "/admin/api/2022-04/graphql.json",
  //         headers: {
  //           "X-Shopify-Access-Token": SHOPIFY_TOKEN,
  //           "Content-Type": "application/json",
  //         },
  //         data: data,
  //       };

  //       axios(config)
  //         .then(async function (response) {
  //           const formData = new FormData();

  //           const [{ url, parameters }] =
  //             response.data.data.stagedUploadsCreate.stagedTargets;
  //           const resourceUrl =
  //             response.data.data.stagedUploadsCreate.stagedTargets[0]
  //               .resourceUrl;

  //           // parameters.forEach(({ name, value }) => {
  //           //   formData.append(name, value);
  //           // });
  //           formData.append("file", video, video.fileName);

  //           var requestOptions = {
  //             method: "POST",
  //             body: formData,
  //             redirect: "follow",
  //           };

  //           fetch(url, requestOptions)
  //             .then((response) => response.text())
  //             .then(() => {
  //               setMediaList((original) => [
  //                 ...original,
  //                 { type: "VIDEO", url: video.uri },
  //               ]);
  //               setLoading(false);
  //             })
  //             .catch((error) => {
  //               console.log("error", error);
  //               setLoading(false);
  //             });
  //         })
  //         .catch(function (error) {
  //           setLoading(false);
  //           console.log(error);
  //         });
  //     })
  //     .catch((error) => {
  //       setLoading(false);
  //       console.log(error);
  //     });
  // };
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

  const init = async () => {
    const user = JSON.parse(await AsyncStorage.getItem("userData"));
    setUserData(user);

    var config = {
      method: "get",
      url: `${SHOPIFY_STORE}/admin/api/2021-10/products/${productId}.json?fields=tags,body_html,images,title,variants`,
      headers: {
        "X-shopify-Access-Token": SHOPIFY_TOKEN,
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then((response) => {
        setLoading(false);
        let tagsList = response.data.product.tags.split(", ");
        let productImages = [];
        response.data.product.images.forEach((image) => {
          productImages.push({ type: "IMAGE", url: image.src, id: image.id });
          imageAssets.push({ id: image.id });
        });

        var mediaData = JSON.stringify({
          query: `{
              product(id:"gid://shopify/Product/${productId}") {
                media(first:5) {
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
        });

        var config = {
          method: "post",
          url: SHOPIFY_STORE + "/admin/api/2022-04/graphql.json",
          headers: {
            "X-Shopify-Access-Token": SHOPIFY_TOKEN,
            "Content-Type": "application/json",
          },
          data: mediaData,
        };

        axios(config)
          .then(function (response) {
            const mediaEdges = response.data.data.product.media.edges;
            const mediaTemporaryList = [];
            mediaEdges.forEach((media) => {
              const { node } = media;

              if (node.mediaContentType === "VIDEO" && node.status === "READY")
                mediaTemporaryList.push({
                  type: node.mediaContentType,
                  url: node.sources[0].url,
                  id: node.id,
                });
              if (node.mediaContentType === "IMAGE" && node.status === "READY")
                mediaTemporaryList.push({
                  type: node.mediaContentType,
                  url: node.image.url,
                  id: node.id,
                });
              imageAssets.push({ id: node.id });
            });
            setMediaList([...mediaTemporaryList]);
          })
          .catch(function (error) {
            console.log(error);
          });

        setProductName(response.data.product.title);
        setProductDescription(response.data.product.body_html);

        setProductWeight(response.data.product.variants[0].weight);

        let categoryName;
        let subCategoryName;
        if (tagsList && tagsList.length > 0) {
          tagsList.forEach((tag) => {
            try {
              if (productSourceSet.has(tag)) {
                setProductSource(tag);
              }
              if (productAgeSet.has(tag)) {
                setProductAge(tag);
              }
              if (productStyleSet.has(tag)) {
                setProductStyle(tag);
              }
              if (productConditionSet.has(tag)) {
                setProductCondition(tag);
              }
              if (categorySet.has(tag)) {
                setCategory(tag);
                categoryName = tag;
                let data = createDropDownList(
                  Object.keys(productCategories[tag])
                );
                setSubCategoryList(data);
              }
              if (subCategorySet.has(tag)) {
                subCategoryName = tag;
                setSubCategory(tag);
              }
              if (secondSubCategorySet.has(tag)) {
                setSecondSubCategory(tag);
              }
            } catch (error) {
              console.error(error);
            }
          });
          // let data = createDropDownList(
          //   productCategories[categoryName][subCategoryName]
          // );
          // setSecondSubCategoryList(data);
        }
      })
      .catch(function (error) {
        // setLoading(false);
        console.log(error);
      });

    axios
      .get(
        `${SHOPIFY_STORE}/admin/api/2021-07/products/${productId}/metafields.json`,
        {
          headers: API_HEADERS,
        }
      )
      .then((res) => {
        if (res.data && res.data.metafields) {
          for (let metafield of res.data.metafields) {
            if (metafield.key === "vendor_base_price") {
              setProductPrice(metafield.value);
            }
          }
        }
      })
      .catch((err) => console.log("err", err));
  };

  useEffect(() => {
    if (isFocused) {
      init();
    }
  }, [isFocused]);
  console.log(productPrice);
  return (
    <PageContainer>
      {loading && <Spinner visible={true} />}

      <Header
        imageSrc={AppImages.images.backArrow}
        title={productTitle}
        buttonText="SAVE"
        buttonStyle={{ color: "#0094FF" }}
        buttonOnPress={() => EditProduct()}
      />

      <KeyboardAwareScrollView style={{ width: "100%" }}>
        <ContainerView style={{ flex: 1 }}>
          <UploadText>UPLOAD MEDIA</UploadText>
          <UploadedSection horizontal={true}>
            {mediaList?.map((media, key) => (
              <UploadBlockButton
                key={key}
                onPress={() =>
                  navigation.navigate("DeleteProductImage", {
                    media: media,
                    productId: productId,
                    productTitle: productTitle,
                  })
                }
              >
                {media.type === "IMAGE" ? (
                  <Image
                    source={{ uri: media.url }}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                ) : media.type === "VIDEO" ? (
                  <RNVideo
                    source={{ uri: media.url }}
                    resizeMode={"cover"}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                ) : (
                  <UploadBlockIcon
                    source={{ uri: media.url }}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                )}
              </UploadBlockButton>
            ))}

            <UploadBlockButton onPress={() => setModalVisible(true)}>
              <UploadBlockIcon source={AppImages.images.plusIcon} />
            </UploadBlockButton>
          </UploadedSection>

          <View style={{ marginBottom: 16 }}>
            <TextInput
              label={"£ Price per bundle - not including shipping"}
              labelStyle={{ paddingLeft: 0 }}
              borderHeight={0}
              backgroundColor={"#FFF"}
              keyboardType="numeric"
              value={"" + productPrice}
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
              value={"" + productQuantity}
              onChangeText={(e) => setProductQuantity(e)}
            />
          */}

          <TextInput
            label={"Weight (kg)"}
            borderHeight={0}
            backgroundColor={"#FFF"}
            keyboardType="numeric"
            value={"" + productWeight}
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

          <View style={{ marginTop: "5%", marginBottom: "4%" }}>
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
            selectedTextStyle={{ color: "#000" }}
            labelField="label"
            valueField="value"
            placeholder={productCategory}
            value={value}
            dropdownPosition="bottom"
            placeholderStyle={{ color: "#000" }}
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

          {(productSubCategoryList.length > 0 ||
            productSubCategory !== null) && (
            <Dropdown
              data={productSubCategoryList}
              flatListProps={{
                ItemSeparatorComponent: renderSeparator,
              }}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={productSubCategory}
              value={value}
              placeholderStyle={{ color: "#000" }}
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
          {(secondProductSubCategoryList.length > 0 ||
            setSecondSubCategory !== null) && (
            <Dropdown
              data={secondProductSubCategoryList}
              flatListProps={{
                ItemSeparatorComponent: renderSeparator,
              }}
              labelField="label"
              valueField="value"
              placeholder={secondProductSubCategory}
              value={value}
              placeholderStyle={{ color: "#000" }}
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
            placeholder={productCondition}
            value={value}
            placeholderStyle={{ color: "#000" }}
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
            placeholder={productSource}
            value={value}
            placeholderStyle={{ color: "#000" }}
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
            placeholder={productAge}
            value={value}
            placeholderStyle={{ color: "#000" }}
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
          <View style={{ overflow: "visible" }}>
            <Dropdown
              data={productStyleList}
              flatListProps={{
                ItemSeparatorComponent: renderSeparator,
              }}
              labelField="label"
              valueField="value"
              placeholder={productStyle}
              value={value}
              placeholderStyle={{ color: "#000" }}
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
                setProductStyle(item.value);
              }}
            />
          </View>

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
        </ContainerView>
      </KeyboardAwareScrollView>
    </PageContainer>
  );
};

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
  width: 100%;
  font-size: ${helper.size(17)}px;
  font-weight: 400;
  margin-top: ${helper.size(10)}px;
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
const MenuButton = styled.TouchableOpacity``;

const MenuIcon = styled.Image`
  width: ${helper.size(24)}px;
  height: ${helper.size(24)}px;
`;

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
