
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, User, MessageSquare, Filter } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  batch: string;
  branch: string;
  interests: string[];
  email: string;
}

interface HomeScreenProps {
  onStartChat: (userId: string, userName: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartChat }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [batchFilter, setBatchFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, batchFilter, branchFilter]);

  const fetchCurrentUser = async () => {
    if (!auth.currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setCurrentUser({ id: auth.currentUser.uid, ...userDoc.data() } as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from Firestore...');
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      console.log('Users snapshot size:', usersSnapshot.size);
      
      const usersData = usersSnapshot.docs
        .map(doc => {
          const userData = { id: doc.id, ...doc.data() } as UserProfile;
          console.log('User data:', userData);
          return userData;
        })
        .filter(user => user.id !== auth.currentUser?.uid);
      
      console.log('Filtered users (excluding current user):', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: "Failed to fetch users", variant: "destructive" });
    }
    setLoading(false);
  };

  const filterUsers = () => {
    let filtered = users;
    console.log('Starting filter with users:', filtered);
    console.log('Batch filter:', batchFilter);
    console.log('Branch filter:', branchFilter);
    
    if (batchFilter !== 'all') {
      filtered = filtered.filter(user => user.batch === batchFilter);
      console.log('After batch filter:', filtered);
    }
    
    if (branchFilter !== 'all') {
      filtered = filtered.filter(user => user.branch === branchFilter);
      console.log('After branch filter:', filtered);
    }
    
    setFilteredUsers(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 flex items-center justify-center">
        <Card className="backdrop-blur-lg bg-white/90">
          <CardContent className="p-8">
            <div className="text-center">Loading users...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Campus Connect</h1>
          <p className="text-white/80">Welcome back, {currentUser?.name}</p>
          <p className="text-white/60 text-sm">Total users found: {users.length} | Filtered users: {filteredUsers.length}</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 backdrop-blur-lg bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Batch</label>
                <Select value={batchFilter} onValueChange={setBatchFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    <SelectItem value="1st year">1st Year</SelectItem>
                    <SelectItem value="2nd year">2nd Year</SelectItem>
                    <SelectItem value="3rd year">3rd Year</SelectItem>
                    <SelectItem value="4th year">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Branch</label>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
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
          </CardContent>
        </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="backdrop-blur-lg bg-white/90 hover:bg-white/95 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Badge variant="default">
                      {user.batch}
                    </Badge>
                    <Badge variant="outline">
                      {user.branch.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Interests:</p>
                    <div className="flex flex-wrap gap-1">
                      {user.interests.slice(0, 3).map((interest, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                      {user.interests.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{user.interests.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    onClick={() => onStartChat(user.id, user.name)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="backdrop-blur-lg bg-white/90">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No users found with the selected filters.</p>
              <p className="text-gray-500 text-sm mt-2">
                {users.length === 0 ? 'No users have created profiles yet.' : 'Try adjusting your filters or select "All" to see all users.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
