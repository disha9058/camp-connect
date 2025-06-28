
import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, doc, getDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, User } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

interface ChatScreenProps {
  chatUserId: string;
  chatUserName: string;
  onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ chatUserId, chatUserName, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const chatId = getChatId(currentUser.id, chatUserId);
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        setMessages(messagesData);
      });

      return () => unsubscribe();
    }
  }, [currentUser, chatUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCurrentUser = async () => {
    if (!auth.currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setCurrentUser({ id: auth.currentUser.uid, ...userDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const getChatId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('_');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const chatId = getChatId(currentUser.id, chatUserId);

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: currentUser.id,
        senderName: currentUser.name,
        message: newMessage,
        timestamp: new Date().toISOString(),
      });

      setNewMessage('');
    } catch (error) {
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Chat Header */}
        <Card className="mb-4 backdrop-blur-lg bg-white/90">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={onBack}>
                  ← Back
                </Button>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <CardTitle>{chatUserName}</CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <Card className="backdrop-blur-lg bg-white/90 h-[600px] flex flex-col">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === currentUser?.id
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId === currentUser?.id ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Message Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                disabled={!newMessage.trim()}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatScreen;
