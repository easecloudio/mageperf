"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Building, Calendar, Camera, Download, FileText, Shield, CheckCircle, Clock, UserCheck, Loader2 } from "lucide-react"
import { MainSidebar } from '@/components/MainSidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { DynamicBreadcrumb } from '@/components/ui/DynamicBreadcrumb'
import { useMockAuth } from "@/contexts/MockAuthContext"

export default function ProfilePage() {
  const { user } = useMockAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState({
    // Auth0 fields (some editable, some read-only)
    name: user?.name || "John Doe",
    email: user?.email || "john@example.com",
    picture: user?.picture || "/placeholder-user.png",
    userId: user?.id || "auth0|123456789",
    emailVerified: true,
    lastLogin: "2024-08-15T10:30:00Z",
    createdAt: "2024-01-15T14:22:00Z",
    // Additional profile fields
    company: "E-commerce Solutions Inc.",
    role: "Performance Engineer",
    bio: "Passionate about optimizing Magento stores for better performance and user experience. Expert in Core Web Vitals, server optimization, and conversion rate improvement.",
    // Account statistics
    totalAudits: 47,
    averageScore: 82,
    lastAuditDate: "2024-08-14T16:45:00Z",
    storesAnalyzed: 12
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call to Auth0 Management API for editable fields
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsEditing(false)
      // Here you would typically save to Auth0 Management API
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }


  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <div className="flex h-full flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/80 backdrop-blur-sm">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb />
            <div className="ml-auto flex items-center space-x-3">
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                variant={isEditing ? "default" : "outline"}
                className={isEditing ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700" : ""}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Edit Profile"
                )}
              </Button>
            </div>
          </header>
          <div className="flex-1 p-6 overflow-auto bg-gray-50">
            {/* Enhanced Header */}
            <div className='mb-8'>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Profile
                  </h1>
                  <p className="text-lg text-gray-600 mb-4 lg:mb-0">
                    Manage your account settings and preferences
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auth0 Profile Information */}
            <Card className="shadow-xl border border-gray-100">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Shield className="h-6 w-6 mr-3 text-orange-600" />
                  Auth0 Profile
                </CardTitle>
                <CardDescription>Account information synced with Auth0</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.picture} alt="Profile" />
                    <AvatarFallback className="text-lg bg-gradient-to-r from-orange-100 to-red-100 text-orange-700">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center">
                      Full Name
                      <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800">
                        Editable
                      </Badge>
                    </Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      disabled={!isEditing}
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center">
                      Email
                      <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-800">
                        Auth0 Synced
                      </Badge>
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled={true}
                        className="pr-10 bg-gray-50"
                      />
                      {profile.emailVerified && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userId" className="flex items-center">
                      User ID
                      <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-800">
                        Auth0 Synced
                      </Badge>
                    </Label>
                    <Input
                      id="userId"
                      value={profile.userId}
                      disabled={true}
                      className="bg-gray-50 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastLogin" className="flex items-center">
                      Last Login
                      <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-800">
                        Auth0 Synced
                      </Badge>
                    </Label>
                    <Input
                      id="lastLogin"
                      value={formatDate(profile.lastLogin)}
                      disabled={true}
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="createdAt" className="flex items-center">
                      Account Created
                      <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-800">
                        Auth0 Synced
                      </Badge>
                    </Label>
                    <Input
                      id="createdAt"
                      value={formatDate(profile.createdAt)}
                      disabled={true}
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Profile Information */}
            <Card className="shadow-xl border border-gray-100">
              <CardHeader>
                <CardTitle className="text-2xl">Additional Information</CardTitle>
                <CardDescription>Additional profile details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      disabled={!isEditing}
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={profile.role}
                      onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                      disabled={!isEditing}
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    className="focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Tell us about yourself and your experience..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats & Activity */}
          <div className="space-y-6">
            <Card className="shadow-xl border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-orange-600" />
                  Account Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Member since</p>
                    <p className="text-sm text-muted-foreground">{formatDate(profile.createdAt).split(',')[0]}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Total Audits</p>
                    <p className="text-sm text-muted-foreground">{profile.totalAudits} completed</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Stores Analyzed</p>
                    <p className="text-sm text-muted-foreground">{profile.storesAnalyzed} unique stores</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Average Score</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-muted-foreground">{profile.averageScore}/100</p>
                      <Badge 
                        variant="secondary" 
                        className={`${
                          profile.averageScore >= 90 ? 'bg-green-100 text-green-800' :
                          profile.averageScore >= 75 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {profile.averageScore >= 90 ? 'Excellent' :
                         profile.averageScore >= 75 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Last Audit</p>
                    <p className="text-sm text-muted-foreground">{formatDate(profile.lastAuditDate).split(',')[0]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card className="shadow-xl border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-orange-600" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Email Verified</p>
                      <p className="text-xs text-muted-foreground">Your email is verified with Auth0</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">Managed through Auth0</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Configure in Auth0
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border border-gray-100">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-transparent hover:bg-orange-50 hover:border-orange-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Audit History
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-transparent hover:bg-orange-50 hover:border-orange-200"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Profile Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}