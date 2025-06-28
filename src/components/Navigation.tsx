
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Users, MessageSquare, User, GraduationCap } from 'lucide-react';

interface NavigationProps {
  activeScreen: 'home' | 'qa' | 'chat' | 'profile' | 'alumni';
  onScreenChange: (screen: 'home' | 'qa' | 'chat' | 'profile' | 'alumni') => void;
  currentUser: any;
}

const Navigation: React.FC<NavigationProps> = ({ activeScreen, onScreenChange, currentUser }) => {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged out successfully" });
    } catch (error) {
      toast({ title: "Failed to log out", variant: "destructive" });
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:relative md:bottom-auto md:left-auto md:right-auto backdrop-blur-lg bg-white/90 z-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={activeScreen === 'home' ? 'default' : 'outline'}
              onClick={() => onScreenChange('home')}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Home</span>
            </Button>
            <Button
              variant={activeScreen === 'qa' ? 'default' : 'outline'}
              onClick={() => onScreenChange('qa')}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline">Q&A</span>
            </Button>
            <Button
              variant={activeScreen === 'alumni' ? 'default' : 'outline'}
              onClick={() => onScreenChange('alumni')}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden md:inline">Alumni</span>
            </Button>
            <Button
              variant={activeScreen === 'profile' ? 'default' : 'outline'}
              onClick={() => onScreenChange('profile')}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Profile</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <User className="w-4 h-4" />
              <span>{currentUser?.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Navigation;
