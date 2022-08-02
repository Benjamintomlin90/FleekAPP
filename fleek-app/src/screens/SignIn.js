import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { AppImages } from "../GlobalStyle";
import helper from "../theme/helper";
import { Hoshi } from "react-native-textinput-effects";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import firestore from "@react-native-firebase/firestore";
import Spinner from "react-native-loading-spinner-overlay";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignInScreen({ navigation, route }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const ValidateEmail = () => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return true;
    }
    return false;
  };

  const loginUser = () => {
    if (!ValidateEmail()) {
      alert("You have entered an invalid email address!");
      return;
    }
    if (password.length < 6) {
      alert("Password must be more than 5 charaters!");
      return;
    }
    setLoading(true);
    firestore()
      .collection("users")
      .where("email", "==", email.toLowerCase())
      .where("password", "==", password)
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          console.log("No matching documents.");
          alert("Invalid credential!");
          setLoading(false);
          return;
        }
        snapshot.forEach((doc) => {
          const user = doc.data();
          console.log(user);
          AsyncStorage.setItem("userData", JSON.stringify(user));
          setLoading(false);
          navigation.navigate("Home");
        });
      });
  };

  return (
    <PageContainer>
      {loading && <Spinner visible />}
      <HeaderContainer>
        <HeaderImage source={AppImages.images.logo} />
        <HeaderText>
          If you are a Fleek seller, create and {"\n"}account and list your
          products today
        </HeaderText>
      </HeaderContainer>

      <ContainerView>
        <TextInput
          label="Email"
          borderColor="#000"
          borderHeight={1}
          inputPadding={16}
          value={email}
          autoCorrect={false}
          autoCapitalize="none"
          onChangeText={(e) => setEmail(e)}
          backgroundColor="#FFF"
          placeholderTextColor="#00000050"
        />
        <TextInput
          label="Password"
          borderColor="#000"
          borderHeight={1}
          inputPadding={16}
          backgroundColor="#FFF"
          value={password}
          onChangeText={(e) => setPassword(e)}
          secureTextEntry
          placeholderTextColor="#00000050"
        />
        {/* <ForgotButton>
                    <ForgotText>Forgot password?</ForgotText>
                </ForgotButton> */}
      </ContainerView>

      <FooterContainer>
        <SignButton onPress={() => loginUser()}>
          <SignButtonText>Sign In</SignButtonText>
        </SignButton>

        <BottomContainer>
          <BottomText>Don't have an account? </BottomText>
          <RedirectButton onPress={() => navigation.navigate("SignUp")}>
            <RedirectText> Sign Up</RedirectText>
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
`;

const TextInput = styled(Hoshi)`
  width: 100%;
  font-size: ${helper.size(20)}px;
  margin-top: ${helper.size(20)}px;
`;

const FooterContainer = styled.View`
  margin-top: ${helper.size(40)}px;
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
  line-height: ${helper.size(22)}px;
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
const ForgotButton = styled.TouchableOpacity`
  position: absolute;
  bottom: ${helper.size(32)}px;
  right: ${helper.size(15)}px;
`;

const ForgotText = styled.Text`
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  font-size: ${helper.size(12)}px;
  line-height: ${helper.size(18)}px;
  display: flex;
  align-items: center;
  text-align: right;
  letter-spacing: -0.078px;
  color: #007aff;
`;
