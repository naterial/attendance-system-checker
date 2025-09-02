
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Worker, AttendanceRecord, DayOfWeek, Shift } from '@/lib/types';
import { daysOfWeek } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddWorkerForm } from '@/components/add-worker-form';
import EditWorkerForm from '@/components/edit-worker-form';
import { PlusCircle, Users, LogOut, Edit, Trash2, Download, Loader2, ThumbsUp, ThumbsDown, History, Hourglass, QrCode, Sparkles as AiIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getWorkers, addWorker, updateWorker, deleteWorker, getAttendanceRecords, updateAttendanceStatus } from '@/lib/firestore';
import { QrCodeDialog } from '@/components/qr-code-dialog';
import { summarizeNotes } from '@/ai/flows/summarize-notes-flow';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const ShiftBadge = ({ shift }: { shift: Shift }) => {
    const shiftColors: Record<Shift, string> = {
        Morning: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
        Afternoon: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        Night: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
        'Off Day': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return <Badge className={cn('font-normal', shiftColors[shift])}>{shift}</Badge>;
}

export default function AdminPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [isAddWorkerOpen, setAddWorkerOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isQrCodeOpen, setQrCodeOpen] = useState(false);
    const [isSummaryLoading, setSummaryLoading] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());


    useEffect(() => {
        const authStatus = localStorage.getItem('isAdminAuthenticated');
        if (authStatus !== 'true') {
            router.push('/admin/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);
    
    useEffect(() => {
        if(isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [workersData, recordsData] = await Promise.all([
                getWorkers(),
                getAttendanceRecords()
            ]);
            setWorkers(workersData);
            setAttendanceRecords(recordsData);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to load data from the database." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddWorker = async (newWorkerData: Omit<Worker, 'id'>) => {
       try {
            await addWorker(newWorkerData);
            await fetchData();
            setAddWorkerOpen(false);
            toast({ title: "Success", description: "New worker has been added." });
        } catch (error) {
            console.error("Failed to add worker:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to add worker." });
        }
    };

    const handleUpdateWorker = async (updatedWorker: Worker) => {
        try {
            await updateWorker(updatedWorker.id, updatedWorker);
            await fetchData();
            setEditingWorker(null);
            toast({ title: "Success", description: "Worker details have been updated." });
        } catch (error) {
            console.error("Failed to update worker:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to update worker." });
        }
    };

    const handleDeleteWorker = async (workerId: string) => {
        try {
            await deleteWorker(workerId);
            await fetchData();
            toast({ title: "Success", description: "Worker has been deleted." });
        } catch (error) {
            console.error("Failed to delete worker:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to delete worker." });
        }
    };
    
    const handleLogout = () => {
        localStorage.removeItem('isAdminAuthenticated');
        router.push('/admin/login');
    };

    const handleApproval = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await updateAttendanceStatus(id, status);
            await fetchData();
            toast({
                title: 'Success',
                description: `Record has been ${status}.`
            })
        } catch(e) {
             toast({
                variant: 'destructive',
                title: 'Database Error',
                description: "Failed to update the record status.",
            });
        }
    }

    const handleGenerateSummary = async () => {
        setSummaryLoading(true);
        setSummary(null);

        const recordsForDay = attendanceRecords.filter(r => 
            r.status === 'approved' &&
            format(r.timestamp, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
        );
        
        const notes = recordsForDay.map(r => r.notes).filter(note => note.trim() !== "");

        if (notes.length === 0) {
            toast({
                variant: "destructive",
                title: "No Notes Found",
                description: `There are no approved notes for ${format(selectedDate, 'PPP')} to summarize.`,
            });
            setSummaryLoading(false);
            return;
        }

        try {
            const result = await summarizeNotes({ notes });
            setSummary(result.summary);
        } catch (error) {
            console.error("AI Summary failed:", error);
            toast({
                variant: "destructive",
                title: "AI Summary Error",
                description: "Could not generate the daily summary. Please try again.",
            });
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleExportPdf = async () => {
        const records = attendanceRecords.filter(r => r.status === 'approved');
        if (records.length === 0) {
            toast({ variant: 'destructive', title: 'No approved records to export.'});
            return;
        }

        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("Vibrant Aging Community Centre - Attendance Report", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Report generated on: ${format(new Date(), 'PPP p')}`, 14, 29);

        const groupedRecords = records.reduce((acc, record) => {
            const dayKey = format(record.timestamp, 'yyyy-MM-dd');
            if (!acc[dayKey]) {
                acc[dayKey] = [];
            }
            acc[dayKey].push(record);
            return acc;
        }, {} as Record<string, AttendanceRecord[]>);

        const sortedDayKeys = Object.keys(groupedRecords).sort((a,b) => b.localeCompare(a));
        
        let startY = 40;

        sortedDayKeys.forEach(dayKey => {
            const dayRecords = groupedRecords[dayKey];
            const tableTitle = `Date: ${format(new Date(dayKey), "eeee, MMMM d, yyyy")}`;
            
            const tableBody = dayRecords.map(record => [
                record.name,
                record.role,
                record.shift,
                format(record.timestamp, 'p'),
                record.notes
            ]);

            autoTable(doc, {
                startY: startY,
                head: [['Name', 'Role', 'Shift', 'Time', 'Notes']],
                body: tableBody,
                didDrawPage: (data) => {
                    doc.setFontSize(12);
                    doc.text(tableTitle, 14, data.cursor ? data.cursor.y - 10 : 15);
                }
            });

            startY = (doc as any).lastAutoTable.finalY + 15;
        });

        doc.save(`approved-attendance-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    };

    if (isAuthenticated === null || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }
    
    const pendingRecords = attendanceRecords.filter(r => r.status === 'pending');
    const processedRecords = attendanceRecords.filter(r => r.status === 'approved' || r.status === 'rejected');


    return (
        <div className="min-h-screen bg-background font-body p-4 md:p-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <Link href="/" passHref>
                   <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary cursor-pointer hover:underline">Admin Dashboard</h1>
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                     <Button variant="outline" onClick={() => setQrCodeOpen(true)}>
                        <QrCode className="mr-2" /> Show QR Code
                     </Button>
                     <Button variant="outline" onClick={handleExportPdf}>
                        <Download className="mr-2" /> Export Approved PDF
                     </Button>
                    <Button variant="ghost" onClick={handleLogout}>
                        <LogOut className="mr-2" /> Logout
                    </Button>
                </div>
            </header>
            <main className="container mx-auto px-0 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Attendance Approval</CardTitle>
                        <CardDescription>Review and approve or reject pending attendance submissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="pending">
                            <TabsList className="mb-4 flex-wrap h-auto">
                                <TabsTrigger value="pending">
                                    <Hourglass className="mr-2" /> Pending ({pendingRecords.length})
                                </TabsTrigger>
                                <TabsTrigger value="history">
                                    <History className="mr-2" /> History ({processedRecords.length})
                                </TabsTrigger>
                                <TabsTrigger value="summary">
                                    <AiIcon className="mr-2" /> AI Daily Summary
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="pending">
                                <AttendanceTable records={pendingRecords} onApproval={handleApproval} />
                            </TabsContent>
                             <TabsContent value="history">
                                <AttendanceTable records={processedRecords} />
                            </TabsContent>
                            <TabsContent value="summary">
                                <div className="p-4 border rounded-lg bg-muted/50 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                                    <h3 className="text-xl font-semibold">Generate AI-Powered Daily Summary</h3>
                                    <p className="text-muted-foreground max-w-md">
                                        Select a date to get a concise summary of all approved staff notes from that day.
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[280px] justify-start text-left font-normal",
                                                    !selectedDate && "text-muted-foreground"
                                                )}
                                                >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={selectedDate}
                                                    onSelect={(date) => date && setSelectedDate(date)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <Button onClick={handleGenerateSummary} disabled={isSummaryLoading}>
                                            {isSummaryLoading ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <AiIcon className="mr-2 h-4 w-4" />
                                            )}
                                            Generate Summary
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Worker Management</CardTitle>
                            <CardDescription>Add, view, and manage worker details and schedules.</CardDescription>
                        </div>
                        <Dialog open={isAddWorkerOpen} onOpenChange={setAddWorkerOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2"/>
                                    Add Worker
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                                <DialogHeader>
                                    <DialogTitle>Add a New Worker</DialogTitle>
                                </DialogHeader>
                                <div className="flex-grow overflow-hidden">
                                   <AddWorkerForm onSubmit={handleAddWorker} workers={workers} />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {workers.length > 0 ? (
                             <div className="overflow-x-auto relative">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="sticky left-0 bg-card z-10 min-w-[150px]">Name</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>PIN</TableHead>
                                            {daysOfWeek.map(day => (
                                                <TableHead key={day} className="min-w-[120px]">{day}</TableHead>
                                            ))}
                                            <TableHead className="text-right sticky right-0 bg-card z-10 min-w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {workers.map((worker) => (
                                            <TableRow key={worker.id}>
                                                <TableCell className="font-medium sticky left-0 bg-card z-10">{worker.name}</TableCell>
                                                <TableCell>{worker.role}</TableCell>
                                                <TableCell>****</TableCell>
                                                {daysOfWeek.map(day => (
                                                    <TableCell key={day}>
                                                        {worker.schedule ? <ShiftBadge shift={worker.schedule[day]} /> : '-'}
                                                    </TableCell>
                                                ))}
                                                <TableCell className="text-right sticky right-0 bg-card z-10">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="icon" onClick={() => setEditingWorker(worker)}>
                                                            <Edit className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="destructive" size="icon">
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span className="sr-only">Delete</span>
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete the worker.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteWorker(worker.id)}>
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                             <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/50">
                                <div className="flex justify-center mb-4">
                                  <div className="p-4 rounded-full bg-muted-foreground/10 text-muted-foreground">
                                      <Users className="w-8 h-8"/>
                                  </div>
                                </div>
                                <h3 className="text-xl font-semibold text-foreground/80">No workers added yet.</h3>
                                <p className="text-sm text-muted-foreground mt-1">Click "Add Worker" to get started.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {editingWorker && (
                 <Dialog open={!!editingWorker} onOpenChange={(isOpen) => !isOpen && setEditingWorker(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Edit Worker Details</DialogTitle>
                        </DialogHeader>
                        <div className="flex-grow overflow-hidden">
                            <EditWorkerForm
                                worker={editingWorker}
                                workers={workers}
                                onSubmit={handleUpdateWorker}
                                onCancel={() => setEditingWorker(null)}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            <Dialog open={!!summary} onOpenChange={(isOpen) => !isOpen && setSummary(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                           <AiIcon/> AI Summary for {format(selectedDate, "PPP")}
                        </DialogTitle>
                         <DialogDescription>
                            This summary was generated based on approved notes from staff.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-body">{summary}</pre>
                    </div>
                </DialogContent>
            </Dialog>

            <QrCodeDialog open={isQrCodeOpen} onOpenChange={setQrCodeOpen} />

        </div>
    );
}

interface AttendanceTableProps {
    records: AttendanceRecord[];
    onApproval?: (id: string, status: 'approved' | 'rejected') => void;
}

const AttendanceTable = ({ records, onApproval }: AttendanceTableProps) => {
    if (records.length === 0) {
        return <p className="text-center text-muted-foreground py-8">No records to display.</p>;
    }
    
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Worker</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead className="hidden md:table-cell">Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map(record => (
                        <TableRow key={record.id}>
                            <TableCell>
                                <div className="font-medium">{record.name}</div>
                                <div className="text-sm text-muted-foreground">{record.role} - <ShiftBadge shift={record.shift} /></div>
                            </TableCell>
                            <TableCell>{format(record.timestamp, 'p')}</TableCell>
                            <TableCell className="hidden md:table-cell max-w-xs truncate">{record.notes}</TableCell>
                            <TableCell className="text-right">
                               {record.status === 'pending' && onApproval && (
                                   <div className="flex justify-end gap-2">
                                       <Button variant="outline" size="sm" onClick={() => onApproval(record.id, 'approved')}>
                                           <ThumbsUp className="mr-2 h-4 w-4" /> Approve
                                       </Button>
                                       <Button variant="destructive" size="sm" onClick={() => onApproval(record.id, 'rejected')}>
                                           <ThumbsDown className="mr-2 h-4 w-4" /> Reject
                                       </Button>
                                   </div>
                               )}
                               {record.status !== 'pending' && (
                                   <span className={`text-sm font-semibold ${record.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                       {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                   </span>
                               )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
