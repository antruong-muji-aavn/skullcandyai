import * as React from 'react';
import { SectionHeadingProps } from './SectionHeading.types';
import { SearchBar } from '../search-bar';

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  description,
  align = 'center',
  searchPlaceholder = 'Search by topics or collections',
  onSearchChange,
  showSearch = true,
  className = '',
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
  };

  return (
    <div className={`flex flex-col ${showSearch ? 'gap-[80px]' : 'gap-0'} w-full items-center ${className}`}>
      {/* Title Section */}
      <div className={`flex flex-col gap-[16px] w-full ${alignClasses[align]}`}>
        <h2 className="font-family-title font-bold text-[38px] tracking-[1.9px] uppercase text-white leading-normal max-w-[649px] mx-auto">
          {title}
        </h2>
        {description && (
          <p className="font-family-body font-normal text-[20px] text-white opacity-70 leading-normal max-w-[744px] mx-auto whitespace-pre-line">
            {description}
          </p>
        )}
      </div>
      
      {/* Search Bar - Only show if enabled */}
      {showSearch && (
        <SearchBar placeholder={searchPlaceholder} onChange={onSearchChange} />
      )}
    </div>
  );
};
