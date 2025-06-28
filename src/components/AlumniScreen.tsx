
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, User, Building, Phone, Mail, Filter, MapPin } from 'lucide-react';

interface AlumniProfile {
  id: string;
  name: string;
  batch: string;
  branch: string;
  company: string;
  position: string;
  email: string;
  phone?: string;
  location: string;
  experience: string;
  linkedIn?: string;
}

const AlumniScreen: React.FC = () => {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniProfile[]>([]);
  const [companyFilter, setCompanyFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock data for demonstration - in real app this would come from Firestore
  const mockAlumniData: AlumniProfile[] = [
    {
      id: '1',
      name: 'Parul Chaddha',
      batch: '2025',
      branch: 'Computer Science',
      company: 'Flipkart',
      position: 'Software Engineer',
      email: 'parul947a@gmail.com',
      phone: '+91 9876543210',
      location: 'Bangalore',
      experience: '3 years',
      linkedIn: 'linkedin.com/in/parulchaddha0904'    },
    {
      id: '2',
      name: 'Priya Patel',
      batch: '2019',
      branch: 'Computer Science',
      company: 'Microsoft',
      position: 'Senior Software Engineer',
      email: 'priya.patel@outlook.com',
      phone: '+91 9876543211',
      location: 'Hyderabad',
      experience: '4 years',
      linkedIn: 'linkedin.com/in/priyapatel'
    },
    {
      id: '3',
      name: 'Amit Kumar',
      batch: '2021',
      branch: 'Electronics Engineering',
      company: 'Amazon',
      position: 'Software Development Engineer',
      email: 'amit.kumar@amazon.com',
      phone: '+91 9876543212',
      location: 'Chennai',
      experience: '2 years'
    },
    {
      id: '4',
      name: 'Sneha Gupta',
      batch: '2018',
      branch: 'Computer Science',
      company: 'Apple',
      position: 'Senior Software Engineer',
      email: 'sneha.gupta@apple.com',
      location: 'Pune',
      experience: '5 years',
      linkedIn: 'linkedin.com/in/snehagupta'
    },
    {
      id: '5',
      name: 'Vikash Singh',
      batch: '2020',
      branch: 'Electrical Engineering',
      company: 'Tesla',
      position: 'Software Engineer',
      email: 'vikash.singh@tesla.com',
      phone: '+91 9876543213',
      location: 'Bangalore',
      experience: '3 years'
    }
  ];

  useEffect(() => {
    fetchAlumni();
  }, []);

  useEffect(() => {
    filterAlumni();
  }, [alumni, companyFilter, branchFilter]);

  const fetchAlumni = async () => {
    try {
      // In a real app, this would fetch from Firestore collection 'alumni'
      // For now, using mock data
      setAlumni(mockAlumniData);
    } catch (error) {
      toast({ title: "Failed to fetch alumni data", variant: "destructive" });
    }
    setLoading(false);
  };

  const filterAlumni = () => {
    let filtered = alumni;
    
    if (companyFilter !== 'all') {
      filtered = filtered.filter(person => person.company.toLowerCase().includes(companyFilter.toLowerCase()));
    }
    
    if (branchFilter !== 'all') {
      filtered = filtered.filter(person => person.branch === branchFilter);
    }
    
    setFilteredAlumni(filtered);
  };

  const getCompanies = () => {
    const companies = [...new Set(alumni.map(person => person.company))];
    return companies.sort();
  };

  const getBranches = () => {
    const branches = [...new Set(alumni.map(person => person.branch))];
    return branches.sort();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 flex items-center justify-center">
        <Card className="backdrop-blur-lg bg-white/90">
          <CardContent className="p-8">
            <div className="text-center">Loading alumni network...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Alumni Network</h1>
          <p className="text-white/80">Connect with successful alumni in top companies</p>
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
                <label className="text-sm font-medium mb-2 block">Company</label>
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {getCompanies().map(company => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
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
                    {getBranches().map(branch => (
                      <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((person) => (
            <Card key={person.id} className="backdrop-blur-lg bg-white/90 hover:bg-white/95 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{person.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {person.position} at {person.company}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Batch {person.batch}
                    </Badge>
                    <Badge variant="outline">
                      {person.experience}
                    </Badge>
                  </div>
                  
                  <div>
                    <Badge variant="secondary" className="text-xs">
                      {person.branch}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <a href={`mailto:${person.email}`} className="text-blue-600 hover:underline">
                        {person.email}
                      </a>
                    </div>
                    
                    {person.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a href={`tel:${person.phone}`} className="text-blue-600 hover:underline">
                          {person.phone}
                        </a>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{person.location}</span>
                    </div>
                  </div>
                  
                  {person.linkedIn && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(`https://${person.linkedIn}`, '_blank')}
                    >
                      Connect on LinkedIn
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAlumni.length === 0 && (
          <Card className="backdrop-blur-lg bg-white/90">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No alumni found with the selected filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AlumniScreen;
