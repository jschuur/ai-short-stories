'use client';

import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

import { getStoryRequirementsColumns } from '@/components/Admin/StoryRequirementsColumns';

import { useAdminPreferences } from '@/hooks/useAdminPreferences';

import type { StoryRequirementCategory } from '@/db/queries/settings';

type RequirementFormValues = {
  key: string;
  label: string;
  count: number;
  template: string;
  options: string;
};

const emptyForm: RequirementFormValues = {
  key: '',
  label: '',
  count: 1,
  template: '',
  options: '',
};

function formFromCategory(cat: StoryRequirementCategory): RequirementFormValues {
  return {
    key: cat.key,
    label: cat.label,
    count: cat.count,
    template: cat.template,
    options: cat.options.map(String).join('\n'),
  };
}

function parseOptions(optionsStr: string): (string | number)[] {
  return optionsStr
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const num = Number(s);

      return isNaN(num) ? s : num;
    });
}

export function StoryRequirementsTable() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { storyRequirementsSorting: sorting, setStoryRequirementsSorting: setSorting } =
    useAdminPreferences();

  const { data: categories = [], isLoading } = useQuery<StoryRequirementCategory[]>({
    queryKey: ['admin-story-requirements'],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings/story-requirements');
      if (!res.ok) throw new Error('Failed to fetch');

      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (
      data: { id?: string } & Omit<RequirementFormValues, 'options'> & { options: (string | number)[] },
    ) => {
      const url = data.id
        ? `/api/admin/settings/story-requirements/${data.id}`
        : '/api/admin/settings/story-requirements';
      const res = await fetch(url, {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save');

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-story-requirements'] });
      queryClient.invalidateQueries({ queryKey: ['config'] });
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/settings/story-requirements/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-story-requirements'] });
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
  });

  const form = useForm({
    defaultValues: emptyForm,
    onSubmit: async ({ value }) => {
      const options = parseOptions(value.options);
      saveMutation.mutate({
        id: editingId ?? undefined,
        key: value.key,
        label: value.label,
        count: value.count,
        template: value.template,
        options,
      });
    },
  });

  const openCreate = () => {
    setEditingId(null);
    form.setFieldValue('key', emptyForm.key);
    form.setFieldValue('label', emptyForm.label);
    form.setFieldValue('count', emptyForm.count);
    form.setFieldValue('template', emptyForm.template);
    form.setFieldValue('options', emptyForm.options);
    setDialogOpen(true);
  };

  const openEdit = (cat: StoryRequirementCategory) => {
    const values = formFromCategory(cat);
    setEditingId(cat.id);
    form.setFieldValue('key', values.key);
    form.setFieldValue('label', values.label);
    form.setFieldValue('count', values.count);
    form.setFieldValue('template', values.template);
    form.setFieldValue('options', values.options);
    setDialogOpen(true);
  };

  const openDeleteConfirm = (id: string) => setDeleteTargetId(id);
  const closeDeleteConfirm = () => setDeleteTargetId(null);
  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
      closeDeleteConfirm();
    }
  };

  const columns = getStoryRequirementsColumns(openEdit, openDeleteConfirm);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable functions
  const table = useReactTable({
    data: categories,
    columns,
    state: { sorting },
    onSortingChange: (updaterOrValue) =>
      setSorting(typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading)
    return (
      <div className='text-center p-8 text-muted-foreground'>Loading story requirements...</div>
    );

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Story Requirements ({categories.length})</h3>
        <Button size='sm' onClick={openCreate}>
          <Plus className='size-4 mr-1' />
          Add Category
        </Button>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className='text-center text-muted-foreground'>
                No requirement categories configured.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && closeDeleteConfirm()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete requirement category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the requirement category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant='destructive' onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Requirement Category' : 'Add Requirement Category'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <form.Field
                name='key'
                children={(field) => (
                  <div className='space-y-2'>
                    <Label htmlFor='req-key'>Key</Label>
                    <Input
                      id='req-key'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder='e.g. tones'
                    />
                  </div>
                )}
              />

              <form.Field
                name='label'
                children={(field) => (
                  <div className='space-y-2'>
                    <Label htmlFor='req-label'>Label</Label>
                    <Input
                      id='req-label'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder='e.g. Tones to incorporate'
                    />
                  </div>
                )}
              />
            </div>

            <form.Field
              name='count'
              children={(field) => (
                <div className='space-y-2'>
                  <Label htmlFor='req-count'>Pick Count</Label>
                  <Input
                    id='req-count'
                    type='number'
                    min={1}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}
            />

            <form.Field
              name='template'
              children={(field) => (
                <div className='space-y-2'>
                  <Label htmlFor='req-template'>Template</Label>
                  <Input
                    id='req-template'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='e.g. Use these tones: {value}'
                  />
                  <p className='text-xs text-muted-foreground'>
                    Use {'{value}'} for the selected option(s) and {'{plural}'} for conditional plural
                    suffix.
                  </p>
                </div>
              )}
            />

            <form.Field
              name='options'
              children={(field) => (
                <div className='space-y-2'>
                  <Label htmlFor='req-options'>Options (one per line)</Label>
                  <Textarea
                    id='req-options'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={'excitement\nanger\njoy'}
                    rows={3}
                    className='min-h-22 max-h-34 overflow-y-auto'
                  />
                </div>
              )}
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => form.handleSubmit()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
