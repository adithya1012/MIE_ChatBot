import React, { Component } from "react";
import { render } from "react-dom";
import { Launcher } from "../../src";
import messageHistory from "./messageHistory";
import TestArea from "./TestArea";
import Header from "./Header";
import Footer from "./Footer";
import Highlight from "react-highlight.js";
import "./../assets/styles";
const axios = require("axios");

class Demo extends Component {
  constructor() {
    super();
    this.state = {
      messageList: messageHistory,
      newMessagesCount: 0,
      isOpen: false,
    };
    this.lastId = messageHistory[messageHistory.length - 1].id;
    this.firstMessage = true;
  }

  // This is the data we need to take and pass it to Ollama.
  _onMessageWasSent(message) {
    // console.log("_onMessageWasSent");
    this.ollamaMessage(message.data.text);
    // this.test();
    this.setState({
      messageList: [
        ...this.state.messageList,
        { id: this.lastId + 1, ...message },
      ],
    });
    this.lastId += 1;
  }

  async test() {
    const response = await axios.get("http://localhost:5001/data");
  }

  // Talk to Ollama API
  async ollamaMessage(text) {
    console.log("text: ", text);
    // if (this.firstMessage) {
    //   this.firstMessage = false;
    //   const response = await axios.get("http://localhost:5001/data");
    //   // await this._sendMessage(response.data);
    // } else {
    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-r1:1.5b",
          // model: "MIE-Assistant:latest",
          prompt: text,
          stream: false,
        }),
      });
      console.log(response);
      const data = await response.json();
      // console.log(data["response"]);
      this._sendMessage(data["response"]);
      // return data;
    } catch (error) {
      console.error("Error:", error);
    }
    // }
  }

  async _sendMessage(text) {
    console.log("_sendMessage");
    console.log(text);
    if (text.length > 0) {
      const newMessagesCount = this.state.isOpen
        ? this.state.newMessagesCount
        : this.state.newMessagesCount + 1;
      this.setState({
        newMessagesCount: newMessagesCount,
        messageList: [
          ...this.state.messageList,
          {
            id: this.lastId + 1,
            author: "them",
            type: "text",
            data: { text },
          },
        ],
      });
      this.lastId += 1;
    }
    // console.log(this.state.messageList);
  }

  _handleClick() {
    console.log("_handleClick **********");
    this.setState({
      isOpen: !this.state.isOpen,
      newMessagesCount: 0,
    });
  }

  // This is called when each key is pressed in the chat. For any suggessions we can use this.
  onKeyPress = (userInput) => {
    console.log("onKeyPress **********");
    console.log(userInput);
  };

  onDelete = (msg) => {
    console.log("onDelete **********");
    console.log(msg);
    this.setState({
      messageList: this.state.messageList.filter(({ id }) => id !== msg.id),
    });
  };

  render() {
    return (
      <div>
        <Header />
        <TestArea onMessage={this._sendMessage.bind(this)} />
        <Launcher
          agentProfile={{
            teamName: "MIE AI Assistant",
            imageUrl:
              "https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png",
          }}
          onMessageWasSent={this._onMessageWasSent.bind(this)}
          messageList={this.state.messageList}
          newMessagesCount={this.state.newMessagesCount}
          handleClick={this._handleClick.bind(this)}
          isOpen={this.state.isOpen}
          onKeyPress={this.onKeyPress}
          onDelete={this.onDelete}
          showEmoji
          showFile
        />
        <div style={{ height: 200 }} />
        <Footer />
      </div>
    );
  }
}

render(<Demo />, document.querySelector("#demo"));
