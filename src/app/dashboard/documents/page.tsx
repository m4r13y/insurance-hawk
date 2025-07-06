"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { mockDocuments } from '@/lib/mock-data';
import { UploadCloud, File, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DocumentsPage() {
    const [files, setFiles] = useState(mockDocuments);
    const [isDragging, setIsDragging] = useState(false);
    const { toast } = useToast();

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
    <div className="space-y-6">
       <div>
        <h1 className="font-headline text-3xl font-bold">Manage Documents</h1>
        <p className="text-muted-foreground">Upload and manage your required documents securely.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Document</CardTitle>
          <CardDescription>Drag and drop files here or click to browse.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg transition-colors ${
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
          <CardTitle>Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
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
                            <TableCell className="font-medium flex items-center gap-2">
                                <File className="h-4 w-4 text-muted-foreground" />
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
        </CardContent>
      </Card>
    </div>
  )
}
