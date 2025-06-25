import { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    editClinic?: (data: TData) => void;
    editDoctor?: (data: TData) => void;
    // Add other potential actions here as we build more tables
  }
} 