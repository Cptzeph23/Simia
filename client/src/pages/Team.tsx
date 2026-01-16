import { useState, useEffect } from 'react';
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { USERS } from "@/lib/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MoreHorizontal, Plus, Search, X, ChevronLeft, ChevronRight, Star, MessageCircle, Video, MapPin, Calendar, Briefcase, Award, Languages, GraduationCap, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'BOSS' | 'EMPLOYEE';
  avatar: string;
  skills?: string[];
  location?: string;
  hireDate?: string;
  status?: 'online' | 'offline' | 'away';
  performance?: number;
  bio?: string;
  experience?: number;
  languages?: string[];
  education?: string;
}

const SKILLS = [
  'Auto Insurance', 'Home Insurance', 'Life Insurance', 'Health Insurance', 'Business Insurance',
  'Claims Processing', 'Customer Service', 'Risk Assessment', 'Policy Management', 'Sales', 'Underwriting'
];

const ITEMS_PER_PAGE = 9;

const TeamMemberCard = ({ member, onClick }: { member: TeamMember; onClick: () => void }) => (
  <Card 
    key={member.id} 
    className="border-none shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1 cursor-pointer"
    onClick={onClick}
  >
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div className="flex items-center gap-2">
        <Badge 
          variant={member.role === 'BOSS' ? 'default' : 'secondary'}
          className={cn(
            member.status === 'online' ? 'bg-emerald-500/10 text-emerald-600' : 
            member.status === 'away' ? 'bg-amber-500/10 text-amber-600' : 'bg-muted/50',
            'flex items-center gap-1.5'
          )}
        >
          <span className={cn(
            'h-2 w-2 rounded-full',
            member.status === 'online' ? 'bg-emerald-500' : 
            member.status === 'away' ? 'bg-amber-500' : 'bg-muted-foreground/30'
          )} />
          {member.role === 'BOSS' ? 'Director' : 'Agent'}
        </Badge>
        {member.performance !== undefined && (
          <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
            <Star className="h-3 w-3 fill-amber-500" />
            <span>{member.performance}%</span>
          </div>
        )}
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          // Handle menu click
        }}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </CardHeader>
    <CardContent className="flex flex-col items-center text-center pt-2 pb-6">
      <div className="relative mb-4 group-hover:scale-105 transition-transform">
        <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/10 to-primary/5">
            {member.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <span className={cn(
          'absolute bottom-1 right-1 h-4 w-4 rounded-full ring-4 ring-background transition-all',
          member.status === 'online' ? 'bg-emerald-500' : 
          member.status === 'away' ? 'bg-amber-500' : 'bg-muted-foreground/30'
        )}></span>
      </div>
      
      <h3 className="text-xl font-semibold text-foreground">{member.name}</h3>
      <p className="text-sm text-muted-foreground mb-3">
        {member.role === 'BOSS' ? 'Agency Director' : 'Insurance Specialist'}
      </p>
      
      {member.skills && member.skills.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 mb-4 max-w-full">
          {member.skills.slice(0, 3).map((skill, i) => (
            <Badge key={i} variant="outline" className="text-xs font-normal">
              {skill}
            </Badge>
          ))}
          {member.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">+{member.skills.length - 3} more</Badge>
          )}
        </div>
      )}
      
      <div className="flex gap-2 w-full justify-center mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5 flex-1"
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `mailto:${member.email}`;
          }}
        >
          <Mail className="h-3.5 w-3.5" />
          <span className="sr-only">Email</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5 flex-1"
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `tel:${member.phone}`;
          }}
        >
          <Phone className="h-3.5 w-3.5" />
          <span className="sr-only">Call</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5 flex-1"
          onClick={(e) => {
            e.stopPropagation();
            // Handle chat click
          }}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="sr-only">Chat</span>
        </Button>
      </div>
    </CardContent>
  </Card>
);

const TeamMemberModal = ({ 
  member, 
  open, 
  onOpenChange 
}: { 
  member: TeamMember | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) => {
  if (!member) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="relative mb-6">
              <Avatar className="h-40 w-40 border-4 border-background shadow-lg">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-primary/10 to-primary/5">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className={cn(
                'absolute bottom-1 right-1 h-5 w-5 rounded-full ring-4 ring-background',
                member.status === 'online' ? 'bg-emerald-500' : 
                member.status === 'away' ? 'bg-amber-500' : 'bg-muted-foreground/30'
              )}></span>
            </div>
            
            <h2 className="text-2xl font-semibold text-center">{member.name}</h2>
            <p className="text-muted-foreground text-center mb-4">
              {member.role === 'BOSS' ? 'Agency Director' : 'Insurance Specialist'}
            </p>
            
            <div className="w-full space-y-3 mb-6">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Mail className="h-4 w-4" />
                {member.email}
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Phone className="h-4 w-4" />
                {member.phone}
              </Button>
              {member.location && (
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MapPin className="h-4 w-4" />
                  {member.location}
                </Button>
              )}
            </div>
            
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Performance</span>
                <span className="font-medium">{member.performance || 0}%</span>
              </div>
              <Progress value={member.performance || 0} className="h-2" />
            </div>
            
            <div className="w-full mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Member since {member.hireDate || 'N/A'}</span>
              </div>
              {member.experience && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{member.experience} years experience</span>
                </div>
              )}
              {member.languages && member.languages.length > 0 && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Languages className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Speaks {member.languages.join(', ')}</span>
                </div>
              )}
              {member.education && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{member.education}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-6">
                <h3 className="font-medium mb-4">Biography</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {member.bio || 'No biography available.'}
                </p>
                
                <h3 className="font-medium mt-8 mb-4">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a href={`mailto:${member.email}`} className="text-sm hover:underline">
                        {member.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a href={`tel:${member.phone}`} className="text-sm hover:underline">
                        {member.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="skills" className="mt-6">
                <h3 className="font-medium mb-4">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {member.skills?.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                      {skill}
                    </Badge>
                  )) || 'No skills listed.'}
                </div>
                
                <h3 className="font-medium mt-8 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Customer Satisfaction</span>
                      <span className="font-medium">{Math.min(100, (member.performance || 0) + 10)}%</span>
                    </div>
                    <Progress value={Math.min(100, (member.performance || 0) + 10)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Claims Processed</span>
                      <span className="font-medium">{Math.floor(Math.random() * 100)}</span>
                    </div>
                    <Progress value={Math.min(100, (member.performance || 50) + Math.floor(Math.random() * 20))} className="h-2" />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Top Performer</p>
                      <p className="text-muted-foreground text-xs">Awarded for exceptional customer service in Q2 2023</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="bg-emerald-500/10 p-2 rounded-full">
                      <Star className="h-4 w-4 text-emerald-500 fill-emerald-500/30" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">5-Star Rating</p>
                      <p className="text-muted-foreground text-xs">Consistently receives 5-star reviews from clients</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" className="flex-1 gap-2">
                <MessageCircle className="h-4 w-4" />
                Message
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Video className="h-4 w-4" />
                Video Call
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Team() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Enhance mock data with additional fields
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => 
    USERS.map(user => ({
      ...user,
      status: ['online', 'offline', 'away'][Math.floor(Math.random() * 3)] as 'online' | 'offline' | 'away',
      performance: 70 + Math.floor(Math.random() * 30), // Random performance between 70-100
      skills: Array.from({ length: 3 + Math.floor(Math.random() * 4) }, () => 
        SKILLS[Math.floor(Math.random() * SKILLS.length)]
      ).filter((v, i, a) => a.indexOf(v) === i), // Unique skills
      bio: 'Dedicated insurance professional with a passion for helping clients find the perfect coverage. Committed to providing exceptional service and building long-term relationships.',
      experience: 3 + Math.floor(Math.random() * 15),
      languages: ['English', ...(Math.random() > 0.5 ? ['Spanish'] : [])],
      education: 'Bachelor\'s in Business Administration',
      hireDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      location: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'][Math.floor(Math.random() * 5)]
    }))
  );

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || 
                       (roleFilter === 'director' && member.role === 'BOSS') ||
                       (roleFilter === 'agent' && member.role === 'EMPLOYEE');
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Our Team</h1>
            <p className="text-muted-foreground mt-1">
              {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'} found
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Team Member</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-muted-foreground text-sm">
                  Team member management coming soon. This is a placeholder for the add team member form.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="director">Directors</SelectItem>
                <SelectItem value="agent">Agents</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="away">Away</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No team members found</h3>
            <p className="text-muted-foreground text-sm text-center max-w-md">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <Button 
              variant="ghost" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedMembers.map(member => (
                <TeamMemberCard 
                  key={member.id} 
                  member={member} 
                  onClick={() => handleMemberClick(member)}
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {selectedMember && (
        <TeamMemberModal 
          member={selectedMember} 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen} 
        />
      )}
    </Layout>
  );
}
