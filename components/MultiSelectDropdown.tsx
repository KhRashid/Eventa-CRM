import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon, ChevronDownIcon } from '../icons';

interface MultiSelectDropdownProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ options, selected, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    const toggleOption = (option: string) => {
        const newSelected = selected.includes(option)
            ? selected.filter(item => item !== option)
            : [...selected, option];
        onChange(newSelected);
    };

    const removeOption = (option: string) => {
        onChange(selected.filter(item => item !== option));
    };

    const filteredOptions = options
        .filter(option => !selected.includes(option))
        .filter(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort();

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div 
                className="flex flex-wrap gap-2 p-2 bg-gray-700 border border-gray-600 rounded-md min-h-[42px] cursor-text"
                onClick={() => setIsOpen(true)}
            >
                {selected.map(item => (
                    <span key={item} className="flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {item}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeOption(item);
                            }}
                            className="text-blue-200 hover:text-white"
                        >
                            <CloseIcon className="h-3 w-3" />
                        </button>
                    </span>
                ))}
                 <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    placeholder={selected.length === 0 ? placeholder : ''}
                    className="flex-grow bg-transparent outline-none text-sm text-white placeholder-gray-400"
                />
            </div>
            
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(option => (
                            <div
                                key={option}
                                onClick={() => {
                                    toggleOption(option);
                                    setSearchTerm('');
                                    setIsOpen(false);
                                }}
                                className="px-4 py-2 text-sm text-white cursor-pointer hover:bg-gray-700"
                            >
                                {option}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-sm text-gray-400">
                           {searchTerm ? "Не найдено" : "Нет доступных опций"}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;