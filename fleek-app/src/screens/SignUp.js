import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { AppImages } from "../GlobalStyle";
import helper from "../theme/helper";
import { Hoshi } from "react-native-textinput-effects";
import firestore from "@react-native-firebase/firestore";
import { SHOPIFY_STORE, SHOPIFY_TOKEN } from "../constant/api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Spinner from "react-native-loading-spinner-overlay";
import { Dropdown, SelectCountry } from "react-native-element-dropdown";
import { FIREBASE_SECRET, API_HEADERS } from "../constant/api";
const countryList = [
  { label: "Pakistan", value: "PK" },
  { label: "India", value: "IN" },
  { label: "United States", value: "US" },
  { label: "United Kingdom", value: "GB" },
  { label: "Thailand", value: "TH" },
  { label: "Italy", value: "IT" },
];

export default function SignUpScreen({ navigation, route }) {
  const [email, setEmail] = useState("");
  const [shopName, setShopName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [countryName, setCountryName] = useState("");
  console.log(countryName);
  const ValidateEmail = () => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return true;
    }
    return false;
  };

  const signUp = () => {
    if (shopName == "") {
      alert("Please input your shop name!");
      return;
    }
    if (!ValidateEmail()) {
      alert("You have entered an invalid email address!");
      return;
    }
    if (password.length < 6) {
      alert("Password must be more than 5 charaters!");
      return;
    }

    if (country == "") {
      alert("Please choose your country of origin");
      return;
    }

    setLoading(true);

    firestore()
      .collection("users")
      .where("email", "==", email.toLowerCase())
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          axios({
            method: "post",
            url: SHOPIFY_STORE + "/admin/api/2021-10/smart_collections.json",
            headers: {
              "X-Shopify-Access-Token": SHOPIFY_TOKEN,
              "Content-Type": "application/json",
            },
            data: {
              smart_collection: {
                title: shopName,
                rules: [
                  {
                    column: "vendor",
                    relation: "equals",
                    condition: shopName,
                  },
                ],
                template_suffix: "vendors",
              },
            },
          })
            .then(async (response) => {
              const handle = response.data.smart_collection.handle;
              const collectionId = response.data.smart_collection.id;

              await axios({
                method: "put",
                url:
                  SHOPIFY_STORE +
                  `/admin/api/2021-10/smart_collections/${collectionId}.json`,
                headers: {
                  "X-Shopify-Access-Token": SHOPIFY_TOKEN,
                  "Content-Type": "application/json",
                },
                data: {
                  smart_collection: {
                    rules: [
                      {
                        column: "vendor",
                        relation: "equals",
                        condition: handle,
                      },
                    ],
                  },
                },
              });

              var mutationsData = JSON.stringify({
                query: `mutation {
                  metafieldsSet(metafields: [{
                    ownerId: "gid://shopify/Collection/${collectionId}",
                    key: "country",
                    value: "${countryName}",
                    type: "single_line_text_field",
                    namespace: "my_fields"
                  },{
                    ownerId: "gid://shopify/Collection/${collectionId}",
                    key: "name",
                    value: "${shopName}",
                    type: "single_line_text_field",
                    namespace: "my_fields"
                  },
                  {
                    ownerId: "gid://shopify/Collection/${collectionId}",
                    key: "location",
                    value: "${countryName}",
                    type: "single_line_text_field",
                    namespace: "my_fields"
                  },
                  {
                    ownerId: "gid://shopify/Collection/${collectionId}",
                    key: "avatar",
                    value: "gid://shopify/MediaImage/29541064835310",
                    type: "file_reference",
                    namespace: "my_fields"
                  }
                ]) {
                    metafields {
                      # Metafield fields
                      id
                    }
                    userErrors {
                      field
                      message
                    }
                  }
                }`,
              });

              await axios
                .post(
                  SHOPIFY_STORE + "/admin/api/2022-04/graphql.json",
                  mutationsData,
                  {
                    headers: API_HEADERS,
                  }
                )
                .then((res) => {
                  if (res.data.hasOwnProperty("errors")) {
                    setLoading(false);
                    alert("There is an error! Please contact us");
                  } else {
                    const user = {
                      collection: collectionId,
                      email: email,
                      handle: handle,
                      password: password,
                      shopName: shopName,
                    };

                    firestore()
                      .collection("users")
                      .add(user)
                      .then(async () => {
                        await AsyncStorage.setItem(
                          "userData",
                          JSON.stringify(user)
                        );
                        navigation.navigate("Home");
                        setLoading(false);
                      });

                    axios.patch(
                      `https://dogwood-baton-345622-default-rtdb.firebaseio.com/supplier-info.json?auth=${FIREBASE_SECRET}`,
                      {
                        [handle]: {
                          origin: country,
                          email: email.toLowerCase(),
                          name: shopName,
                        },
                      }
                    );
                  }
                })
                .catch((err) => {
                  console.log("err", err);
                });
            })
            .catch((error) => console.log(error));
        } else {
          alert("Account already exists!");
          setLoading(false);
        }
      });
  };

  const init = async () => {
    const user = await AsyncStorage.getItem("userData");
    if (user) {
      navigation.navigate("Home");
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <PageContainer>
      {loading && <Spinner visible={true} />}
      <HeaderContainer>
        <HeaderImage source={AppImages.images.logo} />
        <HeaderText>
          If you are a Fleek seller, create and {"\n"}account and list your
          products today
        </HeaderText>
      </HeaderContainer>

      <ContainerView>
        <TextInput
          label={"Shop name"}
          borderColor={"#000"}
          borderHeight={1}
          autoCorrect={false}
          autoCapitalize="none"
          inputPadding={helper.size(14)}
          backgroundColor={"#FFF"}
          value={shopName}
          onChangeText={(e) => setShopName(e)}
          placeholderTextColor="#00000050"
        />
        <TextInput
          label={"Email"}
          borderColor={"#000"}
          borderHeight={1}
          autoCorrect={false}
          autoCapitalize="none"
          inputPadding={helper.size(14)}
          backgroundColor={"#FFF"}
          value={email}
          onChangeText={(e) => setEmail(e)}
          placeholderTextColor="#00000050"
        />
        <TextInput
          label={"Password"}
          borderColor={"#000"}
          borderHeight={1}
          autoCorrect={false}
          autoCapitalize="none"
          inputPadding={helper.size(14)}
          backgroundColor={"#FFF"}
          secureTextEntry={true}
          value={password}
          onChangeText={(e) => setPassword(e)}
          placeholderTextColor="#00000050"
        />

        <Dropdown
          data={countryList}
          labelField="label"
          valueField="value"
          maxHeight={countryList.length * 55}
          placeholder={"Choose you origin country"}
          placeholderStyle={{
            color: "#6a7989",
            fontFamily: "Open Sans",
            fontSize: 17,
            lineHeight: 22,
          }}
          containerStyle={{
            backgroundColor: "#FFFFFF",
            borderRadius: 8,
          }}
          style={{
            marginTop: 21,
            padding: 15,
            borderBottomColor: "#b9c1ca",
            borderBottomWidth: 2,
          }}
          selectedTextStyle={{
            fontFamily: "Open Sans",
            fontStyle: "normal",
            fontWeight: "bold",
            fontSize: 18,
            lineHeight: 22,
            color: "#6a7989",
          }}
          selectedStyle={{
            borderBottomColor: "black",
          }}
          onChange={async (item) => {
            setCountry(item.value);
            setCountryName(item.label);
          }}
        />
      </ContainerView>

      <FooterContainer>
        <SignButton onPress={() => signUp()}>
          <SignButtonText>Create Account</SignButtonText>
        </SignButton>

        <BottomContainer>
          <BottomText>Alread have an account? </BottomText>
          <RedirectButton onPress={() => navigation.navigate("SignIn")}>
            <RedirectText> Sign In</RedirectText>
          </RedirectButton>
        </BottomContainer>
      </FooterContainer>
    </PageContainer>
  );
}

const PageContainer = styled.SafeAreaView`
  flex: 1;
  align-items: center;
  padding: ${helper.size(20)}px;
`;

const HeaderContainer = styled.View`
  margin-top: ${helper.size(20)}px;
  padding: ${helper.size(20)}px;
  align-items: center;
`;

const HeaderImage = styled.Image`
  width: ${helper.size(100)}px;
  height: ${helper.size(60)}px;
`;

const HeaderText = styled.Text`
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 400;
  font-size: ${helper.size(17)}px;
  line-height: ${helper.size(22)}px;
  text-align: center;
  letter-spacing: -0.408px;
  color: rgba(60, 60, 67, 0.6);
`;

const ContainerView = styled.View`
  width: 100%;
  padding: ${helper.size(20)}px;
  padding-top: 0px;
`;

const TextInput = styled(Hoshi)`
  width: 100%;
  font-size: ${helper.size(20)}px;
  margin-top: ${helper.size(20)}px;
  padding-left: 0px;
`;

const FooterContainer = styled.View`
  margin-top: ${helper.size(30)}px;
  padding: ${helper.size(20)}px;
  width: 100%;
`;

const SignButton = styled.TouchableOpacity`
  background: #fff500;
  border-radius: ${helper.size(45)}px;
  padding: ${helper.size(12)}px;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const SignButtonText = styled.Text`
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 600;
  font-size: ${helper.size(14)}px;
  display: flex;
  align-items: center;
  text-align: center;
  letter-spacing: -0.408px;
  color: #000000;
`;

const BottomText = styled.Text`
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 400;
  font-size: ${helper.size(17)}px;
  line-height: ${helper.size(22)}px;
  text-align: center;
  letter-spacing: -0.408px;
  color: rgba(60, 60, 67, 0.6);
  margin-top: ${helper.size(17)}px;
`;

const RedirectText = styled.Text`
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 400;
  font-size: ${helper.size(17)}px;
  line-height: ${helper.size(22)}px;
  text-align: center;
  letter-spacing: -0.408px;
  color: #007aff;
  margin-top: ${helper.size(17)}px;
`;

const BottomContainer = styled.View`
  flex-direction: row;
  justify-content: center;
`;

const RedirectButton = styled.TouchableOpacity``;
