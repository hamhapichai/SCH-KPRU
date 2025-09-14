import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onRowClick?: (record: T, index: number) => void;
  className?: string;
}

function Table<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'ไม่มีข้อมูล',
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
  className,
}: TableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (column.sortable && onSort) {
      onSort(column.key as string);
    }
  };

  const getValue = (record: T, key: keyof T | string): unknown => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((current: unknown, k: string) => {
        return current && typeof current === 'object' && k in current 
          ? (current as Record<string, unknown>)[k] 
          : undefined;
      }, record);
    }
    return record[key as keyof T];
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white shadow-default">
        <div className="flex h-64 items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span className="text-black">กำลังโหลด...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('border rounded-lg bg-white shadow-default', className)}>
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg">
          <thead className="bg-gray">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black',
                    column.sortable && 'cursor-pointer select-none hover:bg-stroke',
                    column.className
                  )}
                  style={column.width ? { width: column.width } : undefined}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={cn(
                            'h-3 w-3',
                            sortKey === column.key && sortDirection === 'asc'
                              ? 'text-primary'
                              : 'text-bodydark1'
                          )}
                        />
                        <ChevronDown
                          className={cn(
                            'h-3 w-3 -mt-1',
                            sortKey === column.key && sortDirection === 'desc'
                              ? 'text-primary'
                              : 'text-bodydark1'
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke bg-white">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-black"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((record, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    'hover:bg-gray-100',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(record, rowIndex)}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={cn(
                        'whitespace-nowrap px-6 py-4 text-sm text-black',
                        column.className
                      )}
                    >
                      {column.render
                        ? column.render(getValue(record, column.key), record, rowIndex)
                        : String(getValue(record, column.key) ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;