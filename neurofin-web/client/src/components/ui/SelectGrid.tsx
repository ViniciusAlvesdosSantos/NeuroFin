import { useState, useRef, useEffect } from 'react';

interface SelectGridItem {
  value: string;
  label: string;
  icon?: string;
  color?: string;
}

interface SelectGridProps {
  items: SelectGridItem[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  columns?: number;
  renderItem?: (item: SelectGridItem, isSelected: boolean) => React.ReactNode;
  error?: string;
  label?: string;
}

export function SelectGrid({
  items,
  value,
  onChange,
  placeholder = 'Selecione...',
  columns = 5,
  renderItem,
  error,
  label,
}: SelectGridProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find(item => item.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (itemValue: string) => {
    onChange(itemValue);
    setIsOpen(false);
  };

  const defaultRenderItem = (item: SelectGridItem, isSelected: boolean) => (
    <div className="flex flex-col items-center gap-1">
      {item.icon && <span className="text-2xl">{item.icon}</span>}
      {item.color && (
        <div
          className="w-8 h-8 rounded-lg"
          style={{ backgroundColor: item.color }}
        />
      )}
      <span className="text-xs text-center line-clamp-1">{item.label}</span>
    </div>
  );

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-foreground mb-2">
          {label}
        </label>
      )}
      
      {/* Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border-2 rounded-lg flex items-center justify-between transition-all ${
          isOpen ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
        } ${error ? 'border-red-500' : ''}`}
      >
        <div className="flex items-center gap-3">
          {selectedItem ? (
            <>
              {selectedItem.icon && <span className="text-2xl">{selectedItem.icon}</span>}
              {selectedItem.color && (
                <div
                  className="w-6 h-6 rounded-lg"
                  style={{ backgroundColor: selectedItem.color }}
                />
              )}
              <span className="font-medium text-gray-700">{selectedItem.label}</span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div
            className="grid gap-2 p-3"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {items.map((item) => {
              const isSelected = item.value === value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleSelect(item.value)}
                  className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {renderItem ? renderItem(item, isSelected) : defaultRenderItem(item, isSelected)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
