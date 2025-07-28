
"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"

export type ComboboxOption = { value: string; label: string; }
export type ComboboxGroup = { heading: string; options: ComboboxOption[]; }

interface ComboboxProps {
  options?: ComboboxOption[];
  groupedOptions?: ComboboxGroup[];
  value?: string;
  onChange?: (value: string) => void; // For simple selection
  onInputChange?: (search: string) => void; // For async search input
  onSelect?: (value: string) => void; // For async search selection
  placeholder?: string;
  searchPlaceholder?: string;
  emptyPlaceholder?: string;
}

export function Combobox({ 
  options, groupedOptions, value, onChange, onInputChange, onSelect,
  placeholder = "Select an option...", 
  searchPlaceholder = "Search...", 
  emptyPlaceholder = "No results found." 
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const allOptions = React.useMemo(() => {
    if (groupedOptions) return groupedOptions.flatMap(group => group.options);
    return options || [];
  }, [options, groupedOptions]);

  const selectedLabel = allOptions.find(option => option.value === value)?.label;

  const handleSelect = (selectedValue: string) => {
    if (onSelect) { // Async pattern
      onSelect(selectedValue);
    } else if (onChange) { // Simple select pattern
      onChange(selectedValue === value ? "" : selectedValue);
    }
    setOpen(false);
  }

  const displayValue = onInputChange ? value : selectedLabel;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
          {displayValue || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={onInputChange ? value : undefined}
            onValueChange={onInputChange}
          />
          <CommandList>
            <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
            {groupedOptions ? (
              groupedOptions.map((group) => (
                <CommandGroup key={group.heading} heading={group.heading}>
                  {group.options.map((option) => (
                    <CommandItem key={option.value} value={option.value} onSelect={handleSelect}>
                      <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            ) : (
              <CommandGroup>
                {options?.map((option) => (
                  <CommandItem key={option.value} value={option.value} onSelect={handleSelect}>
                    <Check className={cn("mr-2 h-4 w-4", value === option.value && !onInputChange ? "opacity-100" : "opacity-0")} />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
