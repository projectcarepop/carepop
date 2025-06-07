'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { IAppointmentReport } from '@/lib/types/appointment-report.interface';

type ReportFormData = Omit<IAppointmentReport, 'created_at' | 'updated_at'>;

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string | null;
  existingReport: IAppointmentReport | null;
  onSave: (reportData: Partial<ReportFormData>) => Promise<void>;
}

export function ReportForm({ isOpen, onClose, appointmentId, existingReport, onSave }: ReportFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingReport) {
      setTitle(existingReport.report_title);
      setContent(existingReport.report_content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [existingReport]);

  const handleSubmit = async () => {
    if (!appointmentId) return;
    setIsSaving(true);
    const reportData: Partial<ReportFormData> = {
      appointment_id: appointmentId,
      report_title: title,
      report_content: content,
      ...(existingReport && { id: existingReport.id }),
    };
    await onSave(reportData);
    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{existingReport ? 'Edit' : 'Create'} Appointment Report</DialogTitle>
          <DialogDescription>
            {existingReport ? 'Edit the details of the existing report.' : 'Fill in the details for the new report.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              Content
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3"
              rows={10}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title || !content || isSaving}>
            {isSaving ? 'Saving...' : 'Save Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 