
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User, Edit, Save } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  batch: string;
  branch: string;
  interests: string[];
  email: string;
}

const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    batch: '',
    branch: '',
    interests: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!auth.currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = { id: auth.currentUser.uid, ...userDoc.data() } as UserProfile;
        setProfile(userData);
        setFormData({
          name: userData.name,
          batch: userData.batch,
          branch: userData.branch,
          interests: userData.interests.join(', ')
        });
      }
    } catch (error) {
      toast({ title: "Failed to fetch profile", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        batch: profile.batch,
        branch: profile.branch,
        interests: profile.interests.join(', ')
      });
    }
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!auth.currentUser || !profile) return;

    setSaving(true);
    try {
      const updatedData = {
        name: formData.name,
        batch: formData.batch,
        branch: formData.branch,
        interests: formData.interests.split(',').map(i => i.trim()).filter(i => i.length > 0)
      };

      await updateDoc(doc(db, 'users', auth.currentUser.uid), updatedData);
      
      setProfile({ ...profile, ...updatedData });
      setEditMode(false);
      toast({ title: "Profile updated successfully!" });
    } catch (error) {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 flex items-center justify-center">
        <Card className="backdrop-blur-lg bg-white/90">
          <CardContent className="p-8">
            <div className="text-center">Loading profile...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 flex items-center justify-center">
        <Card className="backdrop-blur-lg bg-white/90">
          <CardContent className="p-8">
            <div className="text-center">Profile not found</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="backdrop-blur-lg bg-white/90 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              My Profile
            </CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!editMode ? (
              // View Mode
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                    <p className="text-lg font-semibold">{profile.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-lg">{profile.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Batch</Label>
                    <p className="text-lg capitalize">{profile.batch}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Branch</Label>
                    <p className="text-lg">{profile.branch.replace('-', ' ').toUpperCase()}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Interests</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleEdit}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batch">Batch</Label>
                    <Select value={formData.batch} onValueChange={(value) => setFormData({ ...formData, batch: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your batch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="branch">Branch</Label>
                    <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
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
                </div>
                
                <div>
                  <Label htmlFor="interests">Interests</Label>
                  <Textarea
                    id="interests"
                    value={formData.interests}
                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                    placeholder="Web Development, AI/ML, Robotics, etc. (comma separated)"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileScreen;
