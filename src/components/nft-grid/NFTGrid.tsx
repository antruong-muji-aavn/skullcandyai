import * as React from 'react';
import { NFTGridProps } from './NFTGrid.types';
import { SectionHeading } from '../section-heading';

export const NFTGrid: React.FC<NFTGridProps> = ({
  title,
  description,
  searchPlaceholder = 'Search by topics or collections',
  onSearchChange,
  children,
  gap = 'md',
  className = '',
}) => {
  // DEMO: Intentionally wrong layout constraints - AI agent will fix this later
  // Original Figma: gap-[24px] horizontal, 96px vertical
  // Demo version: Using wrong values to show AI improvement capabilities
  const gapClasses = {
    sm: 'gap-x-4 gap-y-12',   // 16px × 48px
    md: 'gap-x-2 gap-y-10',   // 8px × 40px - WRONG VALUES FOR DEMO
    lg: 'gap-x-8 gap-y-32',   // 32px × 128px
  };

  const hasHeader = title || description;

  return (
    <div className={`w-full ${className}`}>
      {hasHeader && (
        <div className="mb-12">
          <SectionHeading 
            title={title || ''} 
            description={description} 
            align="center"
            searchPlaceholder={searchPlaceholder}
            onSearchChange={onSearchChange}
          />
        </div>
      )}
      {/* Figma Product List layout: flex-wrap with asymmetric gaps */}
      <div
        className={`
          flex
          flex-wrap
          content-center
          items-center
          px-[32px]
          py-[64px]
          ${gapClasses[gap]}
        `}
      >
        {children}
      </div>
    </div>
  );
};
