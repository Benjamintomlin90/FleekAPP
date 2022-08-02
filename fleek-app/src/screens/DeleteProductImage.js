import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, View, Text, ListItem, ScrollView, Image } from "react-native";
import styled from "styled-components";
import helper from "../theme/helper";
import Header from "../components/Header";
import { AppImages } from "../GlobalStyle";
import { SHOPIFY_STORE, SHOPIFY_TOKEN } from "../constant/api";
import axios from "axios";
import RNVideo from "react-native-video";

export const DeleteProductImage = ({ route, navigation }) => {
  const { media, productId, productTitle } = route.params;

  const deleteImage = () => {
    // setLoad
    var data = JSON.stringify({
      query: ` mutation deleteProductMedia($id: ID!, $mediaIds: [ID!]!) {
        productDeleteMedia(productId: $id, mediaIds: $mediaIds) {
          deletedMediaIds
          product {
            id
          }
          mediaUserErrors {
            code
            field
            message
          }
        }
      }`,
      variables: {
        id: `gid://shopify/Product/${productId}`,
        mediaIds: [media.id],
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
    // var config = {
    //   method: "delete",
    //   url: `${SHOPIFY_STORE}/admin/api/2021-10/products/${productId}/images/${imageId}.json`,
    //   headers: {
    //     "X-shopify-Access-Token": SHOPIFY_TOKEN,
    //     "Content-Type": "application/json",
    //   },
    // };

    axios(config)
      .then(function (response) {
        console.log(response.data.data);
        navigation.navigate("EditProduct", {
          productTitle: productTitle,
          productId: productId,
        });
      })
      .catch(function (error) {
        // setLoading(false);
        console.log(error);
      });
  };

  return (
    <PageContainer>
      <Header imageSrc={AppImages.images.backArrow} />

      {media.type === "IMAGE" ? (
        <Image
          source={{ uri: media.url }}
          style={{
            width: "100%",
            height: "80%",
          }}
        />
      ) : media.type === "VIDEO" ? (
        <RNVideo
          source={{ uri: media.url }}
          resizeMode={"cover"}
          style={{
            width: "100%",
            height: "80%",
          }}
        />
      ) : null}

      <View style={{ paddingHorizontal: 16, width: "100%" }}>
        <DeleteButton onPress={() => deleteImage()}>
          <DeleteButtonText>Delete</DeleteButtonText>
        </DeleteButton>
      </View>
    </PageContainer>
  );
};

const PageContainer = styled.SafeAreaView`
  flex: 1;
  align-items: center;
`;

const DeleteButton = styled.TouchableOpacity`
  background: #ff7373;
  border-radius: ${helper.size(45)}px;
  padding: ${helper.size(12)}px;
  width: 100%;
  margin-bottom: 30px;
  margin-top: ${helper.size(30)}px;
`;

const DeleteButtonText = styled.Text`
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 600;
  font-size: ${helper.size(14)}px;
  line-height: ${helper.size(22)}px;
  display: flex;
  align-items: center;
  text-align: center;
  letter-spacing: -0.408px;
  color: white;
`;
