import React, {Component} from 'react';
import unified from "unified";
import markdown from "remark-parse";
import slug from "remark-slug";
import headings from "rehype-autolink-headings";
import remark2rehype from "remark-rehype";
import rehype2react from "rehype-react";

import {Container, Form, Header, Segment, TextArea} from 'semantic-ui-react'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      markdown: null,
      tocLinks: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.updateTOC = this.updateTOC
  }

  updateTOC(text) {
    return Promise.resolve(
      this.setState({
        tocLinks: text.split('\n')
          .filter((line) => line.startsWith('#'))
          .map((header, index) => {
            const content = header.split(' ').splice(1);
            const ref = `#${content.join('-')}`;
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

  render() {
    const contentZIndex = 99;
    console.log(window.innerHeight)
    const tableOfContentStyle = {
      position: "fixed",
      top: "15px",
      left: "15px",
      width: "200px",
      maxHeight: `${window.innerHeight - 40}px`,
      overflow: 'auto',
      zIndex: contentZIndex
    };
    const containerStyle = {
      zIndex: contentZIndex - 10
    };

    return (
      <Container>
        {this.state.tocLinks.length === 0
          ? null
          : <Segment style={tableOfContentStyle}>
            <Header size="small" content="Table of Content"/>
            {this.state.tocLinks}
          </Segment>
        }

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
