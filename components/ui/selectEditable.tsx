"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface EditableSelectProps {
  options: string[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function EditableSelect({
  options,
  placeholder = "Selecione ou digite...",
  value,
  onChange,
}: EditableSelectProps) {
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const filtered = options.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [value, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleOptionClick = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="relative w-full max-w-sm" ref={selectRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
          aria-label="Select editável"
          aria-autocomplete="list"
          aria-controls="options-list"
          aria-expanded={isOpen}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute inset-y-0 right-0 flex items-center px-2"
          onClick={toggleDropdown}
          aria-label="Alternar opções"
        >
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </div>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-md"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            maxHeight: "200px",
            overflow: "hidden",
          }}
        >
          <ScrollArea className="h-full">
            <ul id="options-list" role="listbox" className="py-1">
              {filteredOptions.map((option, index) => (
                <li
                  key={index}
                  role="option"
                  aria-selected={value === option}
                  className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
