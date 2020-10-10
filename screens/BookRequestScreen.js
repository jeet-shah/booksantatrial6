import React,{Component} from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  Alert} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader'

export default class BookRequestScreen extends Component{
  constructor(){
    super();
    this.state ={
      userId : firebase.auth().currentUser.email,
      bookName:"",
      reasonToRequest:"",
      request_id:"",
      requestedbookname:"",
      book_status:"",
      docId:"",
      isbookrequestactive:"",
      userdocid:""
    }
  }

  sendnotification = () => {

  }

  updatebooksatatus = () => {

  }

  recievedbooks = () => {
    
  }

  createUniqueId(){
    return Math.random().toString(36).substring(7);
  }

  getisbookrequestactive = () => {
    db.collection('users').where('email_id','==',this.state.userId).onSnapshot((snapshot)=>{
      snapshot.forEach((doc)=>{
        this.setState({
          isbookrequestactive:doc.data().isbookrequest,
          userdocid:doc.id
        })
      })
    })
  }

  getbookrequest = () => {
    var bookrequest = db.collection('requested_books').where('user_id','==',this.state.userId).get()
    .then((snapshot)=>{
      snapshot.forEach((doc)=>{
        if(doc.data().book_status != "recieved"){
          this.setState({
            request_id:doc.data().request_id,
            requestedbookname:doc.data().book_name,
            book_status:doc.data().book_status,
            docId:doc.id
          })
        }
      })
    })
  }

  addRequest = async(bookName,reasonToRequest)=>{
    var userId = this.state.userId
    var randomRequestId = this.createUniqueId()
    db.collection('requested_books').add({
        "user_id": userId,
        "book_name":bookName,
        "reason_to_request":reasonToRequest,
        "request_id"  : randomRequestId,
        "book_status":"requested",
        "date":firebase.firestore.FieldValue.serverTimestamp()
    })

    await this.getbookrequest()
    db.collection('users').where("email_id","==",userId).get()
    .then()
    .then((snapshot)=>{
      snapshot.forEach((doc)=>{
        db.collection('users').doc(doc.id).update({
          isbookrequest:true
        })
      })
    })

    this.setState({
        bookName :'',
        reasonToRequest : ''
    })

    return Alert.alert("Book Requested Successfully")
  }


  render(){
    if(this.state.isbookrequestactive === false){
    return(
        <View style={{flex:1}}>
          <MyHeader title="Request Book" navigation ={this.props.navigation}/>
            <KeyboardAvoidingView style={styles.keyBoardStyle}>
              <TextInput
                style ={styles.formTextInput}
                placeholder={"enter book name"}
                onChangeText={(text)=>{
                    this.setState({
                        bookName:text
                    })
                }}
                value={this.state.bookName}
              />
              <TextInput
                style ={[styles.formTextInput,{height:300}]}
                multiline
                numberOfLines ={8}
                placeholder={"Why do you need the book"}
                onChangeText ={(text)=>{
                    this.setState({
                        reasonToRequest:text
                    })
                }}
                value ={this.state.reasonToRequest}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={()=>{this.addRequest(this.state.bookName,this.state.reasonToRequest)}}
                >
                <Text>Request</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
    )
  }else{
    return(
      <View>
        <Text> Book Name </Text>
        <Text> {this.state.bookName} </Text>
        <Text> Book Status </Text>
        <Text> {this.state.book_status} </Text>
        <TouchableOpacity style={styles.button} onPress={()=>{
          this.sendnotification()
          this.updatebooksatatus()
          this.recievedbooks(this.state.requestedbookname)
        }}>
          <Text> I recived the book </Text>
        </TouchableOpacity>
      </View>
    )
  }
  }
}

const styles = StyleSheet.create({
  keyBoardStyle : {
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  formTextInput:{
    width:"75%",
    height:35,
    alignSelf:'center',
    borderColor:'#ffab91',
    borderRadius:10,
    borderWidth:1,
    marginTop:20,
    padding:10,
  },
  button:{
    width:"75%",
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    marginTop:20
    },
  }
)
