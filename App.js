/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ScrollView,
  Button,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import Contacts from 'react-native-contacts';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RNCamera } from 'react-native-camera';
import RNTextDetector from "rn-text-detector";
import Icon from 'react-native-vector-icons/FontAwesome';
import {Linking} from 'react-native'
import { PermissionsAndroid } from 'react-native';


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
          }}
        >
        <Stack.Screen
          name='Main'
          component={MainPage}
        />
        <Stack.Screen
          name='Scanner'
          component={TakePicture}
        />
        <Stack.Screen
          name='Result'
          component={Result}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


const MainPage = ({navigation}) =>{

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    height:'100%'
  };

  return(
    <SafeAreaView style={backgroundStyle}>
        <View
          style={{
            justifyContent: 'center',
            height: '50%',
          }}>
          <Text style={{textAlign:'center',fontSize:50}}>KopiThat!</Text>
          <Text style={{textAlign:'center',fontSize:15}}>Scan an email or a phone number and have it saved on your device right away ☕</Text>
        </View>
        <View style={{
              width: '100%',
              height: '30%',
              justifyContent: 'center',
              alignItems: 'center'
          }}>
            <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('Scanner')}>
              <Text>SCAN NOW</Text>
            </TouchableOpacity>
          </View>
        <View style={styles.bottomView}>
          <Text style={styles.textStyle}>Ver. 1.0.0 Brewed with ❤</Text>
        </View>
    </SafeAreaView>
  )
}


class TakePicture extends React.Component {
  constructor(props) { 
    super(props);
    this.state = { 
      isFlashTurnedOn: false,
      isProcessing:false
    };
  }
  takePicture = async () => {
    try {
      setTimeout(()=>{
        this.setState({
          isProcessing:true
        })
      },500)
      const data = await this.camera.takePictureAsync();
      //console.log('Path to image: ' + data.uri);
      let text = await RNTextDetector.detectFromUri(data.uri)
      this.props.navigation.navigate('Result',{
        detectedText: text
      })
    } 
    catch (err) {
      console.log('err: ', err);
    }
    this.setState({
      isProcessing:false
    })
  };

  render() {
    return (
      <>
        <RNCamera
          ref={cam => {
            this.camera = cam;
          }}
          style={styles.preview}
          onTextRecognized={(textBlock)=>console.log(textBlock)}
          flashMode={this.state.isFlashTurnedOn ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
          >
          <View style={{height:'100%'}}>
            {
              this.state.isProcessing ? 
              <View style={{backgroundColor:Colors.darker,padding:20,justifyContent:'center',alignItems:'center',height:'100%'}}>
                <Text style={{textAlign:'center',fontSize:30}}>Give me a second to process this 🤔</Text>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{textAlign:'center',marginTop:10,fontWeight:'bold'}}>
                  Here is a useless fact while waiting:
                </Text>
                <Text style={{textAlign:'center',marginTop:10,fontWeight:'bold'}}>
                  You rest your tongue on the roof of your mouth and don't even think about it 🤯
                </Text>
            </View> : <>
            <View 
            style={{
              width: '100%',
              height: 50,
              marginLeft:-20,
              marginTop:20,
              flexDirection:'row',
              justifyContent:'flex-end'
            }}
            >
            <TouchableOpacity style={styles.flashLight} onPress={()=>
              this.setState(prevState => ({
                isFlashTurnedOn: !prevState.isFlashTurnedOn
              }))
              }>
              <Icon name="flash" size={20} color="#000" style={{textAlign:'center'}}/>
            </TouchableOpacity>
            </View>

            <View 
            style={{
              width: '100%',
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute', //Here is the trick
              bottom: 100, //Here is the trick
            }}
            >
            <TouchableOpacity style={styles.capture} onPress={this.takePicture}>
              <Icon name="camera" size={30} color="#000" style={{textAlign:'center'}}/>
            </TouchableOpacity>
            </View>
            
            </>
            }
          </View>
          
        </RNCamera>
        
        <View style={styles.space} />
      </>
    );
  }
}

class Result extends React.Component{
  
  constructor(props){
    super(props)
    this.state = {
      foundPhoneNumbers:''
    }
    this.phoneRegex = new RegExp('^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$')

  }

  createTwoButtonAlert = () =>
    Alert.alert(
      "Whoopsie!",
      "I thought that was a phone number. Maybe you wanna try again?",
      [
        {
          text: "No",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "Yes", onPress: () => this.props.navigation.navigate('Scanner') }
      ]
    );

  componentDidMount(){
    let phoneNums = []
    let others = []
    let text = this.props.route.params.detectedText
    text.forEach((element) => {
      // console.log(element.text.replace(/ /g,''))
      this.phoneRegex.exec(element.text.replace(/ /g,''))==null ? others.push(element.text) : phoneNums.push(element.text)
    });
    if(phoneNums.length != 0){
      this.setState({
        foundPhoneNumbers:true
      })
    }else{
      this.setState({
        foundPhoneNumbers:false
      })
    }
  }

  saveContact = (number) =>{
    var newPerson = {
      phoneNumbers:[{
        label:'mobile',
        number:number
      }],
    }

    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
      {
        'title': 'Contacts',
        'message': 'Can I save this number on your device?',
        'buttonPositive': 'Yes'
      }
    ).then(()=>{
      Contacts.openContactForm(newPerson).then(contact => {
        console.log(contact)
      }).catch((err)=>{
        console.error(err)
      })
    })
  }
  makeCall(number){
    Linking.openURL(`tel:${number}`)
  }

  render(){
    return(
      <ScrollView style={{backgroundColor:Colors.darker,paddingTop:10}}>
        <View>
          <Text style={{fontSize:20,textAlign:'center'}}>{this.state.foundPhoneNumbers == true? `All done! Here is what I found 😁` : `I couldnt find any numbers, try again maybe?`}</Text>
        </View>
          {
            this.props.route.params.detectedText.map((element,idx)=>{
                  return this.phoneRegex.exec(element.text.replace(/ /g,'')) == null ? null : <View key={idx} style={styles.result_container}>
                    <View style={styles.item}>
                      <Text>Phone Number: {element.text}</Text>
                    </View>
                    {
                    <View style={{marginRight:50,marginLeft:50, borderRadius:10,borderBottomColor:'white',marginBottom:10}}>

                        <TouchableOpacity onPress={()=>this.saveContact(element.text)}>
                          <Text style={{color:'white',padding:5,textAlign:'center',backgroundColor:'darkgreen',height:35, fontWeight:'bold'}}>Save Number</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={()=>this.makeCall(element.text)}>
                          <Text style={{color:'black',padding:5,textAlign:'center',backgroundColor:'orange',height:35,marginTop:10, fontWeight:'bold'}}>Make a Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>this.createTwoButtonAlert()}>
                          <Text style={{color:'white',padding:5,textAlign:'center',marginTop:10,backgroundColor:'darkred',height:35, fontWeight:'bold'}}>Not a Phone Number?</Text>
                        </TouchableOpacity>
                    </View>
                    
                    }
                  </View>
                
                
            })
          }
      </ScrollView>
    )
  }
}



const styles = StyleSheet.create({
  result_container: {
    flex: 1,
 // if you want to fill rows left to right
  },

  flashLight:{
    backgroundColor:'#fff',
    padding:10,
    borderRadius:20,
    height:40,
    width:40,
  },
  capture:{
    backgroundColor:'#fff',
    padding:10,
    borderRadius:20,
    height:50,
    width:60
  },
  bottomView: {
    width: '100%',
    height: 50,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', //Here is the trick
    bottom: 0, //Here is the trick
  },
  button: {
    alignItems: "center",
    backgroundColor: "#000",
    padding: 10,
    width:'50%',
    margin:10,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 50,
    width: '72%', // is 50% of container width
    backgroundColor:'black'
  },
  title: {
    fontSize: 32,
  }
});

export default App;
