"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Combobox } from "@base-ui-components/react/combobox";
import { cn } from "@lib/utils";
import { Plus } from "lucide-react";
import IconChevronUpDown from "@icons/chevron-up-down";

interface SubjectComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
}

// Helper type for items that can be creatable
type ComboboxItem = string | { creatable: string; id: string; value: string };

export function SubjectCombobox({
  value,
  onChange,
  options,
  disabled = false,
  placeholder = "Select a subject...",
  id,
  className,
}: SubjectComboboxProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedItem, setHighlightedItem] = useState<ComboboxItem | null>(null);
  const actionsRef = useRef<Combobox.Root.Actions>(null as any);

  // Sync input value with prop value
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Close popup when value changes (e.g., when an item is selected)
  // Use a ref to track previous value to detect actual changes
  const prevValueRef = useRef(value);
  useEffect(() => {
    if (value !== prevValueRef.current && value) {
      // Value actually changed, close popup
      setIsOpen(false);
      prevValueRef.current = value;
    }
  }, [value]);

  // Filter and prepare items for display
  // If input doesn't match any option, add a creatable item
  const itemsForView = useMemo((): ComboboxItem[] => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return options;
    }

    const lowered = trimmed.toLowerCase();
    
    // Filter options that match the input (case-insensitive)
    const matchingOptions = options.filter((opt) => opt.toLowerCase().includes(lowered));
    
    // Check if there's an exact match
    const exactExists = matchingOptions.some((opt) => opt.toLowerCase() === lowered);
    
    // Show the creatable item alongside matches if there's no exact match
    if (!exactExists) {
      return [...matchingOptions, { creatable: trimmed, id: `create:${lowered}`, value: `Create "${trimmed}"` }];
    }
    
    // Return only matching options
    return matchingOptions;
  }, [options, inputValue]);

  const handleValueChange = (selectedValue: ComboboxItem | null) => {
    if (!selectedValue) {
      return;
    }

    // Check if it's a creatable item
    if (typeof selectedValue === "object" && "creatable" in selectedValue) {
      // Use the creatable value as the new subject
      onChange(selectedValue.creatable);
      setInputValue(selectedValue.creatable);
    } else {
      // Regular option selected
      onChange(selectedValue);
      setInputValue(selectedValue);
    }
    // Close popup: defer to next tick so it runs after Base UI's handlers and React commit
    setTimeout(() => setIsOpen(false), 0);
  };

  // Ensure we close when Base UI requests it (e.g. on item select, escape, outside click)
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <div className={cn("relative", className)}>
      <Combobox.Root
        items={options}
        filteredItems={itemsForView}
        value={value}
        onValueChange={handleValueChange}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        disabled={disabled}
        autoHighlight={true}
        highlightItemOnHover={true}
        open={isOpen}
        onOpenChange={handleOpenChange}
        actionsRef={actionsRef}
        onItemHighlighted={(item) => {
          setHighlightedItem(item ?? null);
        }}
      >
        <div className="bg-background relative">
          <Combobox.Input
            id={id}
            placeholder={placeholder}
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter" && isOpen && highlightedItem) {
                e.preventDefault();
                handleValueChange(highlightedItem);
              }
              if (e.key === "Tab" && isOpen && highlightedItem && !e.shiftKey) {
                e.preventDefault();
                handleValueChange(highlightedItem);
              }
            }}
            className={cn(
              "w-full bg-card px-4 py-3 pr-10 text-sm focus:outline-none border-0 rounded-xl",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <IconChevronUpDown className="size-5 text-muted-foreground" />
          </div>
        </div>
        <Combobox.Portal>
          <Combobox.Positioner sideOffset={4}>
            <Combobox.Popup
              className={cn(
                "z-50 max-h-60 w-(--anchor-width) overflow-auto rounded-xl bg-card shadow-lg p-1"
              )}
            >
              {itemsForView.length === 0 && (
                <Combobox.Empty className="px-3 py-2 text-sm text-muted-foreground">
                  No subjects found.
                </Combobox.Empty>
              )}
              <Combobox.List className="">
                {(item: ComboboxItem) => {
                  // Check if this is a creatable item
                  const isCreatable = typeof item === "object" && "creatable" in item;
                  
                  // Check if this item matches the current input value (for showing the dot indicator)
                  const itemValue = isCreatable ? item.creatable : item;
                  const matchesInput = inputValue.trim().toLowerCase() === itemValue.toLowerCase();
                  
                  // Check if there are matching options (not just the creatable item)
                  const hasMatchingOptions = itemsForView.some((i) => typeof i === "string");

                  if (isCreatable) {
                    return (
                      <Combobox.Item
                        key={item.id}
                        value={item}
                        className={cn(
                          "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors duration-200",
                          "bg-transparent",
                          "data-selected:bg-muted",
                          "data-highlighted:bg-background data-highlighted:text-primary",
                          hasMatchingOptions && " mt-1"
                        )}
                      >
                        <Plus className="size-4" />
                        <span className="font-medium flex-1">{item.value}</span>
                      </Combobox.Item>
                    );
                  }

                  return (
                    <Combobox.Item
                      key={item}
                      value={item}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center justify-between rounded-lg px-4 py-2.75 text-sm outline-none transition-colors duration-200",
                        "bg-transparent",
                        "data-selected:bg-background",
                        "data-highlighted:bg-background",
                        "data-disabled:pointer-events-none data-disabled:opacity-50"
                      )}
                    >
                      <span>{item}</span>
                      {matchesInput && (
                        <div className="flex items-center justify-center">
                          <div className="size-2 rounded-full bg-primary" />
                        </div>
                      )}
                    </Combobox.Item>
                  );
                }}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  );
}
