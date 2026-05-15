import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    loading?: boolean;
}

export function DeleteConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Deletion",
    description = "Are you sure you want to delete this record? This action cannot be undone.",
    loading = false
}: DeleteConfirmationDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-center text-xl font-bold">{title}</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
                    <Button 
                        variant="outline" 
                        onClick={onClose} 
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={onConfirm} 
                        disabled={loading}
                        className="w-full sm:w-auto gap-2 bg-rose-600 hover:bg-rose-700"
                    >
                        {loading ? 'Deleting...' : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
