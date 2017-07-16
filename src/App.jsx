import React, {Component} from "react";
import {Button, Container, Form, Header, Segment, TextArea} from "semantic-ui-react";
import * as firebase from "firebase";
// import * as google from "googleapis";

import unified from "unified";
import markdown from "remark-parse";
import slug from "remark-slug";
import headings from "rehype-autolink-headings";
import remark2rehype from "remark-rehype";
import rehype2react from "rehype-react";

const authProvider = new firebase.auth.GoogleAuthProvider();
authProvider.addScope("https://www.googleapis.com/auth/drive.file");

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      markdown: null,
      tocLinks: [],
      signedIn: false,
      accessToken: null
    };

    this.handleChange = this.handleChange.bind(this);
    this.updateTOC = this.updateTOC.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  signIn(event, data) {
    firebase.auth().signInWithPopup(authProvider)
      .then((result) => {
        this.setState({signedIn: true});
        console.log(result);
      }).catch((error) => {
        console.log("[FIREBASE] ", error);
      });
  }

  signOut(event, data) {
    firebase.auth().signOut().then(() => {
      this.setState({signedIn: false});
    }).catch((error) => {
      console.log("[FIREBASE] ", error);
    });
  }

  updateTOC(text) {
    return Promise.resolve(
      this.setState({
        tocLinks: text.split('\n')
          .filter((line) => line.startsWith('#'))
          .map((header, index) => {
            const content = header.split(' ').splice(1);
            const ref = `#${content.join('-').toLowerCase()}`;
            const display = content.join(' ');
            return (
              <div key={index}>
                <a href={ref}> {display} </a>
                <br/>
              </div>
            );
          })
      }));
  }

  handleChange(event, data) {
    const text = data.value;

    this.updateTOC(text);

    unified()
      .use(markdown)
      .use(slug)
      .use(headings)
      .use(remark2rehype)
      .use(rehype2react, {createElement: React.createElement})
      .process(text).then((file) => {
        this.setState({markdown: file.contents});
      }).catch((error) => {
        console.error("[ ERROR ]", error.message);
      });
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      console.log("[ USER ]", user)
      if (user) {
        console.log("[ SIGNED IN ]", user.displayName);
        this.setState({
          signedIn: true
        });
      } else {
        console.log("[ NOT SIGNED IN ]");
      }
    });
  }

  render() {
    const contentZIndex = 99;
    const tableOfContentStyle = {
      position: "fixed",
      top: "15px",
      left: "15px",
      width: "200px",
      maxHeight: `${window.innerHeight - 40}px`,
      overflow: 'auto',
      zIndex: contentZIndex
    };
    const googleSignInStyle = {
      position: "fixed",
      bottom: "15px",
      right: "15px"
    };
    const containerStyle = {
      zIndex: contentZIndex - 10
    };

    const signInIcon = this.state.signedIn ? "sign out" : "google";
    const signInText = this.state.signedIn ? "Sign Out" : "Google Sign In";

    return (
      <Container>
        {this.state.tocLinks.length === 0
          ? null
          : <Segment style={tableOfContentStyle}>
            <Header size="small" content="Table of Content"/>
            {this.state.tocLinks}
          </Segment>
        }

        <Button
          basic
          icon={signInIcon}
          style={googleSignInStyle}
          color={this.state.signedIn ? "red" : "blue"}
          content={signInText}
          onClick={this.state.signedIn ? this.signOut : this.signIn} />

        <Container text style={containerStyle}>
          <Header size="large">
            Welcome to Remarkable!
          </Header>
          <Form>
            <TextArea placeholder='Enter Markdown' onChange={this.handleChange}/>
          </Form>

          <Segment>
            {this.state.markdown}
          </Segment>
        </Container>
      </Container>
    );
  }
}

export default App;
