import React from "react";
import IconFeather from "react-native-vector-icons/Feather";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import IconMaterialCommunity from "react-native-vector-icons/MaterialCommunityIcons";
import IconOcticons from "react-native-vector-icons/Octicons";
import IconAwesome5 from "react-native-vector-icons/FontAwesome5";
import IconAwesome from "react-native-vector-icons/FontAwesome";
import IconAntd from "react-native-vector-icons/AntDesign";
import IconIonicons from "react-native-vector-icons/Ionicons";
import IconEntypo from "react-native-vector-icons/Entypo";
import IconEvil from "react-native-vector-icons/EvilIcons";

const Icon = ({ iconType, iconName, iconColor, iconSize }) => {
  switch (iconType) {
    case "EvilIcons":
      return <IconEvil name={iconName} color={iconColor} size={iconSize} />;
    case "Feather":
      return <IconFeather name={iconName} color={iconColor} size={iconSize} />;

    case "MaterialIcons":
      return <IconMaterial name={iconName} color={iconColor} size={iconSize} />;

    case "Entypo":
      return <IconEntypo name={iconName} color={iconColor} size={iconSize} />;

    case "MaterialCommunityIcons":
      return (
        <IconMaterialCommunity
          name={iconName}
          color={iconColor}
          size={iconSize}
        />
      );

    case "Octicons":
      return <IconOcticons name={iconName} color={iconColor} size={iconSize} />;

    case "Ionicons":
      return <IconIonicons name={iconName} color={iconColor} size={iconSize} />;

    case "FontAwesome5":
      return <IconAwesome5 name={iconName} color={iconColor} size={iconSize} />;
    case "FontAwesome":
      return <IconAwesome name={iconName} color={iconColor} size={iconSize} />;

    case "AntDesign":
      return <IconAntd name={iconName} color={iconColor} size={iconSize} />;
    default:
      return <IconAwesome name={iconName} color={iconColor} size={iconSize} />;
  }
};

export default Icon;
