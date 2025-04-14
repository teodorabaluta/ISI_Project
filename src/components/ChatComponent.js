import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import './ChatComponent.css';  // Asumând că ai stilurile definite aici

const ChatComponent = () => {
  const { groupId } = useParams();  // Extragerea groupId din URL
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!groupId) {
      console.error("No groupId provided!");
      return;
    }
    if (!auth.currentUser) {
      console.error("User not authenticated!");
      return;
    }

    const messagesRef = collection(db, `groups/${groupId}/messages`);
    const q = query(messagesRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!auth.currentUser) {
      console.error("User not authenticated!");
      return;
    }

    try {
      const messagesRef = collection(db, `groups/${groupId}/messages`);
      await addDoc(messagesRef, {
        sender: auth.currentUser.email,
        content: newMessage,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat-container2">
      <div className="chat-messages2">
        {messages.length > 0 ? messages.map(message => (
          <div key={message.id} className={`chat-message ${message.sender === auth.currentUser.email ? "own-message2" : "other-message2"}`}>
            <p><strong>{message.sender}:</strong> {message.content}</p>
            <small>{new Date(message.timestamp?.toDate()).toLocaleTimeString()}</small>
          </div>
        )) : <p>No messages yet.</p>}
      </div>
      <div className="chat-input2">
        <input
          type="text"
          placeholder="Scrie un mesaj..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Trimite</button>
      </div>
    </div>
  );
};

export default ChatComponent;
