import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import App from './App.jsx';
import * as firebase from "firebase";

firebase.initializeApp({
  apiKey: "AIzaSyA_GRZkBVAqOul2kGw34VAnYqEv9r6eSpY",
  authDomain: "remarkable-3b79a.firebaseapp.com",
  databaseURL: "https://remarkable-3b79a.firebaseio.com",
  projectId: "remarkable-3b79a",
  storageBucket: "remarkable-3b79a.appspot.com",
  messagingSenderId: "1062802009751"
});

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
