import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect} from "react-router-dom";
import LoginView from './components/Login/LoginView';
import ExampleProtectedView from './components/Login/ExampleProtectedView';
import ProtectedRoute from './components/Login/ProtectedRoute';
import Auth from './components/Login/Auth';
import axios from 'axios';
import constants from './constants.json';
import Clock from './components/Clock/Clock';
import ItemList from './components/ListItem/ItemList';
import Pay from './components/Bill/Pay';
import Register from './components/Login/Register';
import OutPage from './OutPage';
import './App.css';
import Verify from './components/Verify/Verify';
import Code from './components/Verify/Code';

export default class App extends Component {
  constructor(props)
  {
    super(props);
    this.state = {
      isAuthenticated: false,
      someData: null,
      timerStarted: false,
      timerStop: true,
      hours: 0,
      minutes: 0,
      seconds: 0,
      item: [],
      AddToCart:[],
      username: "",
      password: "",
      verify: [{id: 1, digit: '4444'}],
      numberVerify: null,
    };
  }

  componentDidMount = () =>
   {
     axios.get(constants.baseAddress + '/dogs').then(result => {
       this.setState({ item: result.data.dogs });
     })
     .catch(error => {
       console.error(error);
     })
   }

  onLogin = () => {
    this.setState({ isAuthenticated: true })
  }

  onLoginFail = () => {
    this.setState({ isAuthenticated: false });
    console.log("Login failed");
  }

  /* This function illustrates how some protected API could be accessed */
  loadProtectedData = () => {
    axios.get(constants.baseAddress + '/hello-protected', Auth.getAxiosAuth()).then(results => {
      this.setState({ someData: results.data });
    })
  }

  Finish = (id) =>
  {
    let newArray = [...this.state.AddToCart]
    let exc = newArray.filter(i=>i.id !== id);
    exc.splice(0,1);
    this.setState({AddToCart:exc});
    this.setState({hours: 0, minutes: 0, seconds: 0})
  }

  Add = (id, price) =>
  {
      let newArray = [...this.state.AddToCart]
      let exit = this.state.AddToCart.filter(i=>i.id === id)
      if (exit.length === 0){
      newArray.push({id, price});
      this.setState({AddToCart: newArray});
      console.log(this.state.AddToCart);
      }
  }

  getAdd = (productId) => {
    return this.state.item.find(item => item.id === productId);
  }

  handleStart = (e) =>{
    e.preventDefault();
    if(this.state.timerStop){
      this.timer = setInterval(()=>{
        this.setState({timerStarted: true, timerStop: false});
        if(this.state.timerStarted){
          if(this.state.seconds >= 60){
            this.setState((prevSecond)=>({minutes: prevSecond.minutes + 1, seconds: 0}))
          }
          if(this.state.minutes >= 60){
            this.setState((prevSecond)=>({hours: prevSecond.hours + 1, minutes:0, seconds: 0}))
          }
          this.setState((prevSecond)=>({seconds: prevSecond.seconds + 1}))
        }
      }, 1000)
    }
  }

  handleStop = (e) =>{
    e.preventDefault();
    this.setState({timerStarted: false, timerStop: true});
    clearInterval(this.timer);
  }

  handleReset = (e) =>{
    e.preventDefault();
    this.setState({timerStarted: false, timerStop: true, seconds: 0, minutes: 0, hours: 0});
    clearInterval(this.timer);
  }

  getProductInfo = (productId) => {
  return this.state.item.find(item => item.id === productId);
  }

  handleSubmit=(event)=>
  {event.preventDefault();
    console.log('post');
    axios.post(constants.baseAddress +'/users', {
    username: event.target['username'].value,
    password: event.target['password'].value
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
  }


  verify = (event) =>
{
  event.preventDefault();
  console.log(event.target['digit'].value);
  let b = this.state.verify.filter(i=>i.digit === event.target['digit'].value);
  console.log(b);
  if(b.length != 0)
  {
    this.setState({numberVerify : b[0] });
    console.log('success');
  }
  else
  {
     this.setState({numberVerify : null});
     console.log('empty')
  }
}



  render() {
    return (

      <Router>
            <div>
          <Route path="/code" exact render={ routeProps => <Code {...routeProps}  />}  />
          <Route path="/v" exact render={ routeProps => <Verify {...routeProps}  verify={this.verify} isAuthenticated={this.state.isAuthenticated}  {...routeProps}/> }  />
          <Route path="/" exact render={ routeProps => <OutPage {...routeProps}/>}  />
          <Route path="/pay" exact render={ routeProps => <Pay AddToCart={this.state.AddToCart} getAdd={this.getAdd} Finish={this.Finish} {...routeProps} hours={this.state.hours} minutes={this.state.minutes} seconds={this.state.seconds} />} />
          <Route path="/item" exact render={(routeProps) => <ItemList item={this.state.item} {...routeProps} numberVerify={this.state.numberVerify}/>}/>
          <Route path="/product/:id" exact render={ routeProps => <Clock {...routeProps} hours={this.state.hours} Add={this.Add} minutes={this.state.minutes} seconds={this.state.seconds} handleStart={this.handleStart} handleReset={this.handleReset} handleStop={this.handleStop} getProductInfo={ this.getProductInfo } /> } />
          <Route path="/register" exact render={ routeProps => <Register handleSubmit={this.handleSubmit} {...routeProps} />}/>
        <Route path="/login" exact render={
          (routeProps) =>
            <LoginView
              loginSuccess = { this.onLogin }
              loginFail = { this.onLoginFail }
              userInfo={ this.state.userInfo }
              redirectPathOnSuccess="/code"
              {...routeProps}
              />
        } />
        <ProtectedRoute isAuthenticated={this.state.isAuthenticated} path="/example" exact render={
            (routeProps) =>
              <ExampleProtectedView
                loadProtectedData={ this.loadProtectedData }
                someData={ this.state.someData }
                />
          }>
        </ProtectedRoute>

        </div>
      </Router>
    )
  }
}
