'use client';

import * as React from 'react';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
    Command,
    CommandGroup,
    CommandItem,
} from '@/components/ui/command';
import { Command as CommandPrimitive } from 'cmdk';

const multiSelectVariants = cva(
    'm-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300',
    {
        variants: {
            variant: {
                default:
                    'border-foreground/10 text-foreground bg-card hover:bg-card/80',
                secondary:
                    'border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
                destructive:
                    'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
                inverted: 'inverted',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

interface MultiSelectProps
    extends React.HTMLAttributes<HTMLDivElement> {
    options: {
        label: string;
        value: string;
    }[];
    onValueChange: (value: string[]) => void;
    defaultValue: string[];
    placeholder?: string;
}

const MultiSelect = React.forwardRef<
    HTMLButtonElement,
    MultiSelectProps
>(
    (
        {
            options,
            onValueChange,
            defaultValue = [],
            placeholder = 'Select options',
        }
    ) => {
        const [selectedValues, setSelectedValues] = React.useState(defaultValue);
        const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

        React.useEffect(() => {
            if (JSON.stringify(selectedValues) !== JSON.stringify(defaultValue)) {
                setSelectedValues(defaultValue);
            }
        }, [defaultValue, selectedValues]);

        const handleInputKeyDown = (
            event: React.KeyboardEvent<HTMLInputElement>
        ) => {
            if (event.key === 'Enter') {
                setIsPopoverOpen(true);
            } else if (event.key === 'Backspace' && !event.currentTarget.value) {
                const newSelectedValues = [...selectedValues];
                newSelectedValues.pop();
                setSelectedValues(newSelectedValues);
                onValueChange(newSelectedValues);
            }
        };

        const toggleOption = (value: string) => {
            const newSelectedValues = selectedValues.includes(value)
                ? selectedValues.filter((v) => v !== value)
                : [...selectedValues, value];
            setSelectedValues(newSelectedValues);
            onValueChange(newSelectedValues);
        };

        return (
            <Command
                onKeyDown={handleInputKeyDown}
                className="overflow-visible bg-transparent"
            >
                <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <div className="flex flex-wrap gap-1">
                        {selectedValues.map((value) => {
                             const option = options.find((o) => o.value === value);
                             const label = option ? option.label : value;
                             return (
                                <Badge
                                    key={value}
                                    className={cn(multiSelectVariants({ variant: 'default' }))}
                                >
                                    {label}
                                    <button
                                        className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                toggleOption(value);
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={() => toggleOption(value)}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                </Badge>
                             )
                        })}
                        <CommandPrimitive.Input
                            placeholder={placeholder}
                            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                            onFocus={() => setIsPopoverOpen(true)}
                            onBlur={() => setIsPopoverOpen(false)}
                        />
                    </div>
                </div>
                <div className="relative mt-2">
                    {isPopoverOpen && (
                        <CommandGroup className="absolute w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                             {options.map((option) => {
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onSelect={() => toggleOption(option.value)}
                                        className={'cursor-pointer'}
                                    >
                                        {option.label}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    )}
                </div>
            </Command>
        );
    }
);

MultiSelect.displayName = 'MultiSelect';

export { MultiSelect }; 