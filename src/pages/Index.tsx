
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import AuthForm from '@/components/AuthForm';
import ProfileSetup from '@/components/ProfileSetup';
import HomeScreen from '@/components/HomeScreen';
import QAScreen from '@/components/QAScreen';
import ChatScreen from '@/components/ChatScreen';
import ProfileScreen from '@/components/ProfileScreen';
import AlumniScreen from '@/components/AlumniScreen';
import Navigation from '@/components/Navigation';

const Index = () => {
  const [user, loading] = useAuthState(auth);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeScreen, setActiveScreen] = useState<'home' | 'qa' | 'chat' | 'profile' | 'alumni'>('home');
  const [chatUser, setChatUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (user) {
      checkProfile();
    }
  }, [user]);

  const checkProfile = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setCurrentUser({ id: user.uid, ...userDoc.data() });
        setProfileExists(true);
      } else {
        setProfileExists(false);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setProfileExists(false);
    }
  };

  const handleProfileComplete = () => {
    setProfileExists(true);
    checkProfile();
  };

  const handleStartChat = (userId: string, userName: string) => {
    setChatUser({ id: userId, name: userName });
    setActiveScreen('chat');
  };

  const handleBackFromChat = () => {
    setChatUser(null);
    setActiveScreen('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (profileExists === false) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  if (profileExists === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-white text-xl">Checking profile...</div>
      </div>
    );
  }

  if (activeScreen === 'chat' && chatUser) {
    return (
      <ChatScreen
        chatUserId={chatUser.id}
        chatUserName={chatUser.name}
        onBack={handleBackFromChat}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="pb-20 md:pb-0">
        {activeScreen === 'home' && <HomeScreen onStartChat={handleStartChat} />}
        {activeScreen === 'qa' && <QAScreen />}
        {activeScreen === 'alumni' && <AlumniScreen />}
        {activeScreen === 'profile' && <ProfileScreen />}
      </div>
      <Navigation
        activeScreen={activeScreen}
        onScreenChange={setActiveScreen}
        currentUser={currentUser}
      />
    </div>
  );
};

export default Index;
