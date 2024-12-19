import {StyleSheet,Text,View,TextInput,TouchableOpacity, Image,ScrollView,} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState, useRef, useEffect } from "react";
import { SelectList } from "react-native-dropdown-select-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { Animated, ImageBackground } from "react-native";


const Stack = createNativeStackNavigator();

//stack screens
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="AddMenu" component={AddMenuScreen} />
        <Stack.Screen name="FilterMenu" component={FilterMenuScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Fade in view
const FadeInView = ({ duration = 3000, style, children }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={{ ...style, opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
};

// Home Page
function HomePage({ navigation, route }) {
  const [menuItems, setMenuItems] = useState([]); // Array for menu items
  const [averagePrices, setAveragePrices] = useState([0, 0, 0]);

  // Function to calculate average prices
  const calculateAveragePrices = (items) => {
    const sums = [0, 0, 0];
    const counts = [0, 0, 0];
    const averages = [0, 0, 0];
    
    items.forEach(item => {
      const [, , price, course] = item;
      let index;

      // Use Number to convert price to a number
      const numericPrice = Number(price); // Convert price to a number

      // Using switch statement for index
      switch (course) {
        case "Starters":
        case 1:
          index = 0;
          break;
        case "Main":
        case 2:
          index = 1;
          break;
        case "Dessert":
        case 3:
          index = 2;
          break;
        default:
          index = undefined; // Handle unexpected course values
          
      }

      if (index !== undefined) {
        sums[index] += numericPrice; // Use numericPrice instead of price
        counts[index]++;
      }
    });

    // Calculate averages
    for (let i = 0; i < 3; i++) {
      if (counts[i] > 0) {
        averages[i] = sums[i] / counts[i];
      }
    }

    return averages;
  };

  // Render menu items
  const renderMenuItems = (items) => {
    const elements = [];
    for (let i = 0; i < items.length; i++) {
      const [name, description, price, course] = items[i];
      elements.push(
        <View key={i} style={styles.rowContainer}>
          <Text style={styles.descriptionText}>
            {name} - R{price}
          </Text>
          <Text style={styles.descriptionText}>
            {description}
          </Text>
          <View style={styles.borderLine} />
        </View>
      );
    }
    return elements;
  };

  // Update the useEffect to calculate averages when menu items change
  useEffect(() => {
    if (route.params?.menuItems) {
      const items = route.params.menuItems;
      console.log("Received Menu Items:", items); // Debugging
      setMenuItems(items);
    } else {
      console.log("No Menu Items received."); 
    }
  }, [route.params?.menuItems]);

  // recalculate average prices when menuItems change
  useEffect(() => {
    const averages = calculateAveragePrices(menuItems);
    setAveragePrices(averages);
    console.log("Calculated Average Prices:", averages); // Debugging
  }, [menuItems]); // Add menuItems as a dependency


  return (
    <View style={styles.container}>
      <SafeAreaView>
        <ScrollView>
          <View style={styles.header}>
            <Text style={styles.Title}>Christofell</Text>
            <Image source={require("./assets/logo.png")} />
          </View>

          <ImageBackground
            source={require("./assets/background-image.jpg")}
            resizeMode="cover"
            style={[styles.backgroundImage, { flex: 1, minHeight: 450 }]}
          >
            <ScrollView style={styles.scrollContainer}>
              {renderMenuItems(menuItems)}
            </ScrollView>
          </ImageBackground>

          {/* Display average prices */}
          <View style={styles.averagesContainer}>
            <Text style={styles.averageText}>Average Prices:</Text>
            <Text style={styles.averageText}>Starters: R{averagePrices[0]}</Text>
            <Text style={styles.averageText}>Main: R{averagePrices[1]}</Text>
            <Text style={styles.averageText}>Dessert: R{averagePrices[2]}</Text>
          </View>

          {/* Navigation Buttons */}
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => navigation.navigate("AddMenu", { 
              menuItems: menuItems,
              setMenuItems: setMenuItems 
            })}
          >
            <Text style={styles.buttonTextStyle}>Add Menu Items</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => navigation.navigate("FilterMenu", { menuItems })}
          >
            <Text style={styles.buttonTextStyle}>Filter Menu</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Add Menu Screen
function AddMenuScreen({ navigation, route }) {
  const [item, setItem] = useState("");
  const [des, setDes] = useState("");
  const [price, setPrice] = useState("");
  const [course, setCourse] = useState("");
  const [localMenuItems, setLocalMenuItems] = useState(route.params?.menuItems || []);

  const data = [
    { key: 1, value: "Starters" },
    { key: 2, value: "Main" },
    { key: 3, value: "Dessert" },
  ];

  const renderMenuItemsWithRemove = (items, removeItem) => {
    const elements = [];
    for (let i = 0; i < items.length; i++) {
      const [name, description, price] = items[i];
      elements.push(
        <View key={i} style={styles.rowContainer}>
          <Text style={styles.descriptionText}>
            {name} - R{price}
          </Text>
          <Text style={styles.descriptionText}>
            {description}
          </Text>
          <TouchableOpacity onPress={() => removeItem(i)}>
            <Text style={styles.removeButton}>Remove</Text>
          </TouchableOpacity>
          <View style={styles.borderLine} />
        </View>
      );
    }
    return elements;
  };

   const addItem = () => {
     // Create new item as array 
     const newItem = [item, des, price, course]; 

    // Add new item to the list
    setLocalMenuItems((prevItems) => [...prevItems, newItem]);

    // Clear input fields
    setItem("");
    setDes("");
    setPrice("");
    setCourse("");
  };

  //remove button functionality
  const removeItem = (index) => {
    const updatedItems = [...localMenuItems];
    updatedItems.splice(index, 1);
    setLocalMenuItems(updatedItems);
  };

  const goBackToHome = () => {
    // Pass the local state back to Home screen
    navigation.navigate('Home', {
      menuItems: localMenuItems,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.Title}>Christofell</Text>
          <Image source={require("./assets/logo.png")} />
        </View>

        <View>
          <Text style={styles.heading}>Please enter the Name, Description, and Price of the dish</Text>
        </View>

        <View style={styles.section}>
          <TextInput
            placeholder="Dish Name"
            value={item}
            onChangeText={setItem}
            style={styles.inputStyle}
          />
        </View>

        <View style={styles.section}>
          <TextInput
            placeholder="Description"
            value={des}
            onChangeText={setDes}
            style={styles.inputStyle}
          />
        </View>

        <View style={styles.section}>
          <TextInput
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            style={styles.inputStyle}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.list}>
          <SelectList
            data={data}
            setSelected={setCourse}
            placeholder="Select Course"
          />
        </View>

        <TouchableOpacity style={styles.buttonStyle} onPress={addItem}>
          <Text style={styles.buttonTextStyle}>Add Item</Text>
        </TouchableOpacity>

        <View style={styles.itemsContainer}>
          {renderMenuItemsWithRemove(localMenuItems, removeItem)}
        </View>

        <TouchableOpacity style={styles.buttonStyle} onPress={goBackToHome}>
          <Text style={styles.buttonTextStyle}>Go to Home Page</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}



// Filter Menu Screen
function FilterMenuScreen({ route }) {
  const menuItems = route.params?.menuItems || [];
  const [selectedCourse, setSelectedCourse] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  const data = [
    { key: 1, value: "Starters" },
    { key: 2, value: "Main" },
    { key: 3, value: "Dessert" },
  ];

  const handleCourseSelect = (selected) => {
    setSelectedCourse(selected);
    const filtered = [];
    
    for (let item of menuItems) {
      if (item[3] === selected) {
        filtered.push(item);
      }
    }
    
    setFilteredItems(filtered);
  };

  const renderFilteredItems = (items) => {
    const elements = [];
    for (let i = 0; i < items.length; i++) {
      const [name, description, price] = items[i];
      elements.push(
        <View key={i} style={styles.rowContainer}>
          <Text style={styles.descriptionText}>
            {name} - R{price}
          </Text>
          <Text style={styles.descriptionText}>{description}</Text>
          <View style={styles.borderLine} />
        </View>
      );
    }
    return elements;
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.Title}>Christofell</Text>
        <Image source={require("./assets/logo.png")} />
      </View>
      <View style={styles.list}>
        <SelectList
          data={data}
          setSelected={handleCourseSelect}
          placeholder="Filter by Course"
        />
      </View>
      <ScrollView>
        <Text style={styles.heading}>Filtered Menu Items:</Text>
        {renderFilteredItems(filteredItems)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  Title: {
    fontFamily: "Arial",
    fontSize: 36,
    color: "#ff9a3c",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 17,
    color: "#a2c11c",
    width: "60%",
    marginLeft: 20,
  },
  buttonStyle: {
    backgroundColor: "#d1cebd",
    height: 50,
    alignItems: "center",
    borderRadius: 30,
    margin: 20,
  },
  buttonTextStyle: {
    color: "#222831",
    paddingVertical: 10,
    fontSize: 20,
    fontWeight: "bold",
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Arial",
  },
  section: {
    height: 50,
    margin: 10,
    padding:5,
  },
  inputStyle: {
    width:"65%",
    height:30,
    paddingLeft: 15,
    borderWidth: 3,
    borderRadius: 30,
    borderColor: "#d1cebd",
  },
  rowContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 1,
    marginTop: 1,
    width: '100%',
    alignSelf: 'center',
  },
  list: {
    margin: 10,
  },

  descriptionText:{
    color:"#ff9a3c",
    marginLeft:10,
    marginTop:1,
  },

  removeButton: {
    backgroundColor: "#ff6f61",
    padding: 5,
    borderRadius: 10,
    width:"20%",
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollContainer: {
    flexGrow: 1,
    marginTop:"20%",
  },
  itemsContainer: {
    flex: 1,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  itemText: {
    flex: 1,
    marginRight: 10,
    
  },
  
  borderLine: {
    width: '85%',  
    height: 1,
    backgroundColor: '#cccccc',
    marginTop: 10,
    marginLeft:"4%",
  },
  averagesContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  averageText: {
    fontSize: 16,
    color: '#ff9a3c',
    marginVertical: 2,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
