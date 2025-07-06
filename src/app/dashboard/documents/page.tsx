
"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { mockDocuments as initialMockDocuments } from '@/lib/mock-data';
import { UploadCloud, File, Trash2, Download, Shield, Activity, LifeBuoy, Home, PiggyBank, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


// Custom icon for Dental since it's not in lucide-react
const DentalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9.34 2.15l3.93 2.75c.1.07.14.19.14.32v4.34c0 .28-.22.5-.5.5h-4.82c-.28 0-.5-.22-.5-.5V5.22c0-.13.04-.25.14-.32l3.93-2.75c.22-.15.54-.15.76 0z"/><path d="M12 10v4c0 .55.45 1 1 1h.5c.55 0 1-.45 1-1v-4"/><path d="m14 14 2.5-3"/><path d="m10 14-2.5-3"/><path d="M12 14v4.5c0 .83.67 1.5 1.5 1.5h.03c.82 0 1.47-.68 1.47-1.5V14"/><path d="M9.97 20c0 .82-.65 1.5-1.47 1.5h-.03C7.67 21.5 7 20.83 7 20v-4.5"/><path d="M14.5 9h-5c-1.1 0-2 .9-2 2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1c0-1.1-.9-2-2-2z"/>
    </svg>
);

const initialMockPolicies = [
    { id: 'health', label: 'Health/Medical Plan', icon: Shield, provider: 'Blue Shield', planName: 'Secure PPO' },
    { id: 'dental', label: 'Dental Coverage', icon: DentalIcon, provider: 'Delta Dental', planName: 'PPO Plus' },
    { id: 'cancer', label: 'Cancer Insurance', icon: Activity, provider: 'Aflac', planName: 'Guaranteed Issue' },
];

export default function DocumentsPage() {
    const [files, setFiles] = useState(initialMockDocuments);
    const [policies, setPolicies] = useState(initialMockPolicies);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newPolicy, setNewPolicy] = useState({ label: '', provider: '', planName: '' });
    const [isDragging, setIsDragging] = useState(false);
    const { toast } = useToast();

    const handleSavePolicy = () => {
        if (newPolicy.label && newPolicy.provider && newPolicy.planName) {
            const newPolicyWithIdAndIcon = {
                ...newPolicy,
                id: `policy-${Date.now()}`,
                icon: LifeBuoy, // Use a default icon for newly added policies
            };
            setPolicies(prev => [...prev, newPolicyWithIdAndIcon]);
            setNewPolicy({ label: '', provider: '', planName: '' }); // Reset form
            setIsDialogOpen(false); // Close dialog
            toast({
                title: 'Policy Added',
                description: `${newPolicy.label} has been added to your policies.`,
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please fill out all fields to add a policy.',
            });
        }
    };


    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            toast({
                title: 'File "Uploaded"',
                description: `${e.dataTransfer.files[0].name} has been added to the list. (Demo)`,
            });
            // This is a simulation. In a real app, you would upload the file.
            const newFile = {
                id: `doc-${Date.now()}`,
                name: e.dataTransfer.files[0].name,
                uploadDate: new Date().toISOString().split('T')[0],
                size: `${(e.dataTransfer.files[0].size / 1024 / 1024).toFixed(2)}MB`,
            };
            setFiles(prev => [newFile, ...prev]);
            e.dataTransfer.clearData();
        }
    };

  return (
    <div className="space-y-8 md:space-y-12">
       <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Policies & Documents</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage your policies and upload related documents securely.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
                <CardTitle className="text-2xl">My Policies</CardTitle>
                <CardDescription>Here are the policies you've added to your nest.</CardDescription>
            </div>
            <Button size="icon" variant="outline" onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="h-6 w-6" />
                <span className="sr-only">Add Policy</span>
            </Button>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {policies.map((policy) => {
                    const Icon = policy.icon;
                    return (
                        <Card key={policy.id} className="flex flex-col">
                            <CardHeader className="flex-row items-center gap-4 space-y-0 p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100 text-sky-600 shrink-0">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{policy.label}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-2 text-sm p-6 pt-0">
                                <p><span className="font-semibold">Provider:</span> {policy.provider}</p>
                                <p><span className="font-semibold">Plan:</span> {policy.planName}</p>
                            </CardContent>
                            <CardFooter className="p-6 pt-0">
                                <Button variant="outline" className="w-full">
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Upload Documents
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Document Upload</CardTitle>
          <CardDescription>Drag and drop files here or click to browse. You can also upload from your policy cards above.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed rounded-lg transition-colors ${
              isDragging ? 'border-primary bg-primary/10' : 'border-border'
            }`}
          >
            <UploadCloud className={`h-12 w-12 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="mt-4 text-center text-muted-foreground">
              {isDragging ? 'Drop the file to upload' : 'Drag & drop file here, or click to select file'}
            </p>
            <Button variant="outline" className="mt-4">Browse Files</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="w-full overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Upload Date</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {files.map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell className="font-medium flex items-center gap-3">
                                    <File className="h-5 w-5 text-muted-foreground" />
                                    {doc.name}
                                </TableCell>
                                <TableCell>{doc.uploadDate}</TableCell>
                                <TableCell>{doc.size}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <Download className="h-4 w-4" />
                                        <span className="sr-only">Download</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Policy</DialogTitle>
                    <DialogDescription>
                        Enter the details of your new insurance policy below.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="policyLabel">Policy Type</Label>
                        <Input
                            id="policyLabel"
                            value={newPolicy.label}
                            onChange={(e) => setNewPolicy({ ...newPolicy, label: e.target.value })}
                            placeholder="e.g., Life Insurance"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="provider">Provider / Company</Label>
                        <Input
                            id="provider"
                            value={newPolicy.provider}
                            onChange={(e) => setNewPolicy({ ...newPolicy, provider: e.target.value })}
                            placeholder="e.g., Prudential"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="planName">Plan Name</Label>
                        <Input
                            id="planName"
                            value={newPolicy.planName}
                            onChange={(e) => setNewPolicy({ ...newPolicy, planName: e.target.value })}
                            placeholder="e.g., Term Life Essentials"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSavePolicy}>Save Policy</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}
