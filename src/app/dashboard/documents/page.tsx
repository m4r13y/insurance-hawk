
"use client"

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, Trash2, Download, Shield, Activity, LifeBuoy, Home, PiggyBank, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Combobox } from '@/components/ui/combobox';
import type { Policy as PolicyType, Document as DocumentType } from '@/types';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { FirebaseNotConfigured } from '@/components/firebase-not-configured';
import Link from 'next/link';


const DentalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9.34 2.15l3.93 2.75c.1.07.14.19.14.32v4.34c0 .28-.22.5-.5.5h-4.82c-.28 0-.5-.22-.5-.5V5.22c0-.13.04-.25.14-.32l3.93-2.75c.22-.15.54-.15.76 0z"/><path d="M12 10v4c0 .55.45 1 1 1h.5c.55 0 1-.45 1-1v-4"/><path d="m14 14 2.5-3"/><path d="m10 14-2.5-3"/><path d="M12 14v4.5c0 .83.67 1.5 1.5 1.5h-.03c.82 0 1.47-.68 1.47-1.5V14"/><path d="M9.97 20c0 .82-.65 1.5-1.47 1.5h-.03C7.67 21.5 7 20.83 7 20v-4.5"/><path d="M14.5 9h-5c-1.1 0-2 .9-2 2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1c0-1.1-.9-2-2-2z"/>
    </svg>
);

const iconMap: { [key: string]: React.ElementType } = {
    Shield,
    DentalIcon,
    Activity,
    LifeBuoy,
    Home,
    PiggyBank
}

const allAvailablePolicies: PolicyType[] = [
    { id: 'pol-aetna-ppo', category: 'Health/Medical Plan', iconName: 'Shield', provider: 'Aetna', planName: 'PPO Plus' },
    { id: 'pol-bs-secure-ppo', category: 'Health/Medical Plan', iconName: 'Shield', provider: 'Blue Shield', planName: 'Secure PPO' },
    { id: 'pol-delta-ppo', category: 'Dental Coverage', iconName: 'DentalIcon', provider: 'Delta Dental', planName: 'PPO Plus' },
    { id: 'pol-aflac-cancer', category: 'Cancer Insurance', iconName: 'Activity', provider: 'Aflac', planName: 'Guaranteed Issue' },
    { id: 'pol-prudential-life', category: 'Life Insurance', iconName: 'LifeBuoy', provider: 'Prudential', planName: 'Term Life Essentials' },
    { id: 'pol-metlife-ltc', category: 'Long-Term Care', iconName: 'Home', provider: 'MetLife', planName: 'LTC Choice' },
    { id: 'pol-vanguard-retirement', category: 'Retirement Plan', iconName: 'PiggyBank', provider: 'Vanguard', planName: 'Target Retirement 2050' },
];

const groupedPolicies = allAvailablePolicies.reduce((acc, policy) => {
    const category = policy.category;
    if (!acc[category]) {
        acc[category] = [];
    }
    acc[category].push({
        value: policy.id,
        label: `${policy.provider} - ${policy.planName}`
    });
    return acc;
}, {} as Record<string, {value: string, label: string}[]>);

const comboboxGroupedOptions = Object.entries(groupedPolicies).map(([heading, options]) => ({
    heading,
    options
}));

export default function DocumentsPage() {
    const [user, loading] = useAuthState(auth);
    const [files, setFiles] = useState<DocumentType[]>([]);
    const [policies, setPolicies] = useState<PolicyType[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPolicyId, setSelectedPolicyId] = useState<string | undefined>();
    const [isDragging, setIsDragging] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user || !db) return;

        // Fetch Policies
        const policiesQuery = query(collection(db, `users/${user.uid}/policies`));
        const unsubscribePolicies = onSnapshot(policiesQuery, (snapshot) => {
            const userPolicies: PolicyType[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PolicyType));
            setPolicies(userPolicies);
        });

        // Fetch Documents
        const docsQuery = query(collection(db, `users/${user.uid}/documents`), orderBy('uploadDate', 'desc'));
        const unsubscribeDocs = onSnapshot(docsQuery, (snapshot) => {
            const userDocs: DocumentType[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DocumentType));
            setFiles(userDocs);
        });

        return () => {
            unsubscribePolicies();
            unsubscribeDocs();
        };
    }, [user])

    const handleSavePolicy = async () => {
        if (!user || !db) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to add a policy.' });
            return;
        }

        if (selectedPolicyId) {
            const policyToAdd = allAvailablePolicies.find(p => p.id === selectedPolicyId);
            
            if (policyToAdd && !policies.some(p => p.id === policyToAdd.id)) {
                try {
                    await addDoc(collection(db, `users/${user.uid}/policies`), policyToAdd);
                    toast({
                        title: 'Policy Added',
                        description: `${policyToAdd.provider} - ${policyToAdd.planName} has been added.`,
                    });
                } catch (error) {
                    console.error("Error adding policy: ", error);
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not add policy.' });
                }
            } else if (policies.some(p => p.id === policyToAdd?.id)) {
                 toast({
                    variant: 'destructive',
                    title: 'Policy Already Exists',
                    description: 'This policy is already in your list.',
                });
            }

            setSelectedPolicyId(undefined);
            setIsDialogOpen(false);
        } else {
             toast({
                variant: 'destructive',
                title: 'No Policy Selected',
                description: 'Please select a policy to add.',
            });
        }
    };

    const handleDeleteFile = async (fileId: string) => {
        if (!user || !db) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/documents`, fileId));
            toast({
                title: "Document Deleted",
                description: "The file has been removed."
            });
        } catch (error) {
            console.error("Error deleting document: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete document.' });
        }
    };

    const handleFiles = (uploadedFiles: FileList) => {
        if (!user || !db) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to upload files.' });
            return;
        }
        if (uploadedFiles && uploadedFiles.length > 0) {
            const uploadedFile = uploadedFiles[0];
            
            // TODO for production: Upload `uploadedFile` to Firebase Storage instead of storing as a data URL in Firestore,
            // which has size limitations. After uploading, get the downloadURL and save that to Firestore.
            
            const reader = new FileReader();
            reader.onload = async (e) => {
                const dataUrl = e.target?.result as string;
                if(dataUrl) {
                    const newFile = {
                        name: uploadedFile.name,
                        uploadDate: new Date().toISOString(),
                        size: `${(uploadedFile.size / 1024 / 1024).toFixed(2)}MB`,
                        dataUrl: dataUrl,
                    };
                    try {
                        await addDoc(collection(db, `users/${user.uid}/documents`), newFile);
                        toast({
                            title: 'File Uploaded',
                            description: `${uploadedFile.name} has been added.`,
                        });
                    } catch (error) {
                        console.error("Error uploading file metadata: ", error);
                        toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not save file information.' });
                    }
                } else {
                     toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not read the file.' });
                }
            };
            
            reader.onerror = () => {
                 toast({ variant: 'destructive', title: 'Upload Failed', description: 'An error occurred while reading the file.' });
            }
            
            reader.readAsDataURL(uploadedFile);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
        if(e.target) e.target.value = '';
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };
    
    if (!isFirebaseConfigured) {
        return <FirebaseNotConfigured />;
    }

    if (loading) {
        return <p>Loading documents...</p>;
    }
    
    if (!user) {
        return (
            <div className="text-center">
                <p>Please log in to manage your documents.</p>
                <Button asChild className="mt-4"><Link href="/">Login</Link></Button>
            </div>
        );
    }

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-2xl font-semibold">Policies & Documents</h1>
        <p className="text-base text-muted-foreground mt-1">Manage your policies and upload related documents securely.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
                <CardTitle className="text-xl">My Policies</CardTitle>
                <CardDescription>Here are the policies you've added to your nest.</CardDescription>
            </div>
            <Button size="icon" variant="outline" onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="h-6 w-6" />
                <span className="sr-only">Add Policy</span>
            </Button>
        </CardHeader>
        <CardContent>
            {policies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {policies.map((policy) => {
                        const Icon = iconMap[policy.iconName];
                        return (
                            <Card key={policy.id} className="flex flex-col">
                                <CardHeader className="flex-row items-center gap-4 space-y-0 p-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100 text-sky-600 shrink-0">
                                        {Icon ? <Icon className="h-6 w-6" /> : <File className="h-6 w-6" />}
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{policy.category}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-2 text-sm p-4 pt-0">
                                    <p><span className="font-semibold">Provider:</span> {policy.provider}</p>
                                    <p><span className="font-semibold">Plan:</span> {policy.planName}</p>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                                        <UploadCloud className="mr-2 h-4 w-4" />
                                        Upload Documents
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-semibold">No Policies Added Yet</h3>
                    <p className="text-muted-foreground mt-2">Click the '+' button to add your first policy.</p>
                </div>
            )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Document Upload</CardTitle>
          <CardDescription>Drag and drop files here or click to browse. You can also upload from your policy cards above.</CardDescription>
        </CardHeader>
        <CardContent>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
              isDragging ? 'border-primary bg-primary/10' : 'border-border'
            }`}
          >
            <UploadCloud className={`h-12 w-12 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="mt-4 text-center text-muted-foreground">
              {isDragging ? 'Drop the file to upload' : 'Drag & drop file here, or click to select file'}
            </p>
            <Button variant="outline" className="mt-4 pointer-events-none">Browse Files</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
            {files.length > 0 ? (
                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead className="hidden sm:table-cell">Upload Date</TableHead>
                                <TableHead className="hidden sm:table-cell">Size</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {files.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium flex items-center gap-3 max-w-xs sm:max-w-md">
                                        <File className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <span className="truncate">{doc.name}</span>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">{new Date(doc.uploadDate).toLocaleDateString()}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{doc.size}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="icon">
                                            <a href={doc.dataUrl} download={doc.name}>
                                                <Download className="h-4 w-4" />
                                                <span className="sr-only">Download</span>
                                            </a>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteFile(doc.id)}>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                 <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-semibold">No Documents Uploaded</h3>
                    <p className="text-muted-foreground mt-2">Use the uploader above to add your first document.</p>
                </div>
            )}
        </CardContent>
      </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Policy</DialogTitle>
                    <DialogDescription>
                        Search for and select a policy to add to your list.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Combobox
                        groupedOptions={comboboxGroupedOptions}
                        value={selectedPolicyId}
                        onChange={setSelectedPolicyId}
                        placeholder="Select a policy..."
                        searchPlaceholder="Search by provider or plan..."
                        emptyPlaceholder="No matching policies found."
                    />
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
