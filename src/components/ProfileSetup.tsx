
import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [batch, setBatch] = useState('');
  const [branch, setBranch] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Starting profile creation process...');
    console.log('Current user:', auth.currentUser);
    console.log('User UID:', auth.currentUser?.uid);
    console.log('User email:', auth.currentUser?.email);
    
    if (!auth.currentUser) {
      console.error('No authenticated user found');
      toast({ 
        title: "Authentication error", 
        description: "Please log in again",
        variant: "destructive" 
      });
      return;
    }

    // Validate required fields
    if (!name.trim()) {
      toast({ 
        title: "Name is required", 
        description: "Please enter your full name",
        variant: "destructive" 
      });
      return;
    }

    if (!batch) {
      toast({ 
        title: "Batch is required", 
        description: "Please select your batch",
        variant: "destructive" 
      });
      return;
    }

    if (!branch) {
      toast({ 
        title: "Branch is required", 
        description: "Please select your branch",
        variant: "destructive" 
      });
      return;
    }

    if (!interests.trim()) {
      toast({ 
        title: "Interests are required", 
        description: "Please enter your interests",
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const interestsArray = interests.split(',').map(i => i.trim()).filter(i => i.length > 0);
      
      const profileData = {
        name: name.trim(),
        batch,
        branch,
        interests: interestsArray,
        email: auth.currentUser.email,
        createdAt: new Date().toISOString(),
      };
      
      console.log('Attempting to save profile data:', profileData);
      console.log('Document path:', `users/${auth.currentUser.uid}`);
      
      await setDoc(doc(db, 'users', auth.currentUser.uid), profileData);
      
      console.log('Profile created successfully!');
      toast({ title: "Profile created successfully!" });
      onComplete();
    } catch (error: any) {
      console.error('Profile creation error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = "Please try again";
      
      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Please check Firestore security rules.";
        console.error('Permission denied - check Firebase security rules for users collection');
      } else if (error.code === 'unavailable') {
        errorMessage = "Firebase is temporarily unavailable. Please try again.";
      } else if (error.code === 'unauthenticated') {
        errorMessage = "Authentication expired. Please log in again.";
      }
      
      toast({ 
        title: "Profile creation failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <Card className="w-full max-w-md backdrop-blur-lg bg-white/90 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Complete Your Profile
          </CardTitle>
          <CardDescription>Tell us about yourself to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="batch">Batch *</Label>
              <Select value={batch} onValueChange={setBatch} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st year">1st Year</SelectItem>
                  <SelectItem value="2nd year">2nd Year</SelectItem>
                  <SelectItem value="3rd year">3rd Year</SelectItem>
                  <SelectItem value="4th year">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="branch">Branch *</Label>
              <Select value={branch} onValueChange={setBranch} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="computer-science">Computer Science</SelectItem>
                  <SelectItem value="electrical">Electrical Engineering</SelectItem>
                  <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
                  <SelectItem value="civil">Civil Engineering</SelectItem>
                  <SelectItem value="electronics">Electronics Engineering</SelectItem>
                  <SelectItem value="chemical">Chemical Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interests">Interests *</Label>
              <Textarea
                id="interests"
                placeholder="Web Development, AI/ML, Robotics, etc. (comma separated)"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="min-h-[80px]"
                required
              />
            </div>
            
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" disabled={loading}>
              {loading ? "Creating Profile..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
