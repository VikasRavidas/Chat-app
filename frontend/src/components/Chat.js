import React, { Component } from 'react';
import '../chat.css';
import minus_icon from '../components/img/minus.png';
import { io } from 'socket.io-client';
import { connect } from 'react-redux';
import { getAuthTokenFromLocalStorage } from '../helpers/utils';

class Chat extends Component {
  state = {
    messages: [], // {content: 'some message', self: true, id: Date.now()}
    typedMessage: '',
    isChatOpen: true,
  };

  componentDidMount() {
    // Initialize from sessionStorage
    const storedChatState = sessionStorage.getItem(
      `chatState_${this.props.user?.email}`,
    );
    const initialChatState = storedChatState
      ? JSON.parse(storedChatState)
      : true;

    this.setState({ isChatOpen: initialChatState });

    this.socket = io('http://localhost:8000', {
      auth: {
        token: getAuthTokenFromLocalStorage(),
      },
    });

    if (this.props.user?.email) {
      this.setupConnections();
    }
  }

  toggleChat = () => {
    this.setState((prevState) => {
      const newState = !prevState.isChatOpen;
      // Save state to sessionStorage
      sessionStorage.setItem(
        `chatState_${this.props.user.email}`,
        JSON.stringify(newState),
      );
      return { isChatOpen: newState };
    });
  };

  componentWillUnmount() {
    // Clean up socket connection when component unmounts
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  setupConnections = () => {
    this.socket.on('connect', () => {
      console.log('CONNECTION ESTABLISHED');

      this.socket.emit('join_room', {
        user_email: this.props.user.email,
        chatroom: 'codeial',
      });
    });

    this.socket.on('user_joined', (data) => {
      console.log('NEW USER JOINED', data);
    });

    this.socket.on('receive_message', (data) => {
      // Add unique ID to each message
      const newMessage = {
        content: data.message,
        self: data.user_email === this.props.user.email,
        id: Date.now(), // Unique identifier for key prop
      };

      this.setState((prevState) => ({
        messages: [...prevState.messages, newMessage],
      }));
    });
  };

  handleSubmit = () => {
    const { typedMessage } = this.state;
    if (typedMessage && this.props.user?.email) {
      this.socket.emit('send_message', {
        message: typedMessage,
        user_email: this.props.user.email,
        chatroom: 'codeial',
      });
      this.setState({ typedMessage: '' });
    }
  };

  // toggleChat = () => {
  //   this.setState((prevState) => ({ isChatOpen: !prevState.isChatOpen }));
  // };

  render() {
    const { typedMessage, messages, isChatOpen } = this.state;

    return (
      <div
        className="chat-container"
        style={{
          height: isChatOpen ? '400px' : '43px',
          transition: 'all 0.3s ease',
        }}
      >
        <div className="chat-header">
          Chat
          <img
            src={minus_icon}
            alt="Toggle chat"
            height={17}
            onClick={this.toggleChat}
            style={{
              transform: isChatOpen ? 'rotate(0deg)' : 'rotate(180deg)',
            }}
          />
        </div>
        {isChatOpen && (
          <>
            <div className="chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id} // Unique key prop added here
                  className={
                    message.self
                      ? 'chat-bubble self-chat'
                      : 'chat-bubble other-chat'
                  }
                >
                  {message.content}
                </div>
              ))}
            </div>
            <div className="chat-footer">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) =>
                  this.setState({ typedMessage: e.target.value })
                }
              />
              <button onClick={this.handleSubmit}>Submit</button>
            </div>
          </>
        )}
      </div>
    );
  }
}

function mapStateToProps({ auth }) {
  return {
    user: auth.user,
  };
}

export default connect(mapStateToProps)(Chat);
