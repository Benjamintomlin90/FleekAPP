import React, { useEffect, useRef } from "react";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, TouchableOpacity } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";

// Screens
import SignUpScreen from "./src/screens/SignUp";
import SignInScreen from "./src/screens/SignIn";
import HomeScreen from "./src/screens/Home";
import OrdersScreen from "./src/screens/Orders";
import AddProductScreen from "./src/screens/AddProduct";
import { EditProductScreen } from "./src/screens/EditProduct";
import { DeleteProductImage } from "./src/screens/DeleteProductImage";
import OrderDetailsScreen from "./src/screens/OrderDetails";
import LineItemDetailsScreen from "./src/screens/LineItemDetails";

import PushNotification from "react-native-push-notification";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function App() {
  const navigationRef = useRef(null);
  const navTheme = DefaultTheme;
  navTheme.colors.background = "#FFFFFF";

  function DrawContent(props) {
    return (
      <DrawerContentScrollView
        style={sidebarContainer}
        contentContainerStyle={{
          flex: 1,
        }}
      >
        <View>
          <TouchableOpacity
            onPress={() => leaveApp("https://candidsync.com/aboutus")}
          >
            <Text>About Us</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
    );
  }

  function Sidebar() {
    return (
      <Drawer.Navigator
        screenOptions={{
          headerShown: false,
          drawerPosition: "right",
          drawerType: "front",
        }}
        drawerContent={(props, navigation) => DrawContent(props)}
      ></Drawer.Navigator>
    );
  }

  useEffect(() => {
    let user_date = new Date(Date.now());
    user_date.setHours(9);
    user_date.setMinutes(0);
    user_date.setDate(user_date.getDate() + 1);

    //scheduled notification
    PushNotification.createChannel({
      channelId: "channel-1", // (required)
      channelName: "My channel", // (required)
      vibrate: true,
    });
    PushNotification.cancelAllLocalNotifications();
    PushNotification.localNotificationSchedule({
      title: "Check your orders!",
      message: "Open the app to update your orders",
      channelId: "channel-1",
      date: user_date,
      allowWhileIdle: true,
      repeatType: "day",
    });
  }, []);

  return (
    <NavigationContainer theme={navTheme} ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="SignUp"
      >
        <Stack.Screen name="Sidebar" component={Sidebar} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="Order" component={OrderDetailsScreen} />
        <Stack.Screen
          name="LineItemDetails"
          component={LineItemDetailsScreen}
        />
        <Stack.Screen name="EditProduct" component={EditProductScreen} />
        <Stack.Screen
          name="DeleteProductImage"
          component={DeleteProductImage}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
