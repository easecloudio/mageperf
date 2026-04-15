'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertTriangle,
  Zap,
  TrendingUp,
  Clock,
  Target,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  color?: string;
}

export interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories?: FilterOption[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  severityLevels?: FilterOption[];
  selectedSeverity: string[];
  onSeverityChange: (severity: string[]) => void;
  tags?: FilterOption[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  sortOptions?: FilterOption[];
  selectedSort: string;
  onSortChange: (sort: string) => void;
  totalResults?: number;
  className?: string;
  showAdvanced?: boolean;
  onReset?: () => void;
}

const defaultSeverityLevels: FilterOption[] = [
  { 
    value: 'critical', 
    label: 'Critical', 
    icon: <AlertTriangle className="h-4 w-4" />, 
    color: 'text-red-600' 
  },
  { 
    value: 'high', 
    label: 'High Priority', 
    icon: <Zap className="h-4 w-4" />, 
    color: 'text-orange-600' 
  },
  { 
    value: 'medium', 
    label: 'Medium Priority', 
    icon: <TrendingUp className="h-4 w-4" />, 
    color: 'text-yellow-600' 
  },
  { 
    value: 'low', 
    label: 'Low Priority', 
    icon: <Clock className="h-4 w-4" />, 
    color: 'text-blue-600' 
  },
];

const defaultSortOptions: FilterOption[] = [
  { value: 'relevance', label: 'Relevance', icon: <Target className="h-4 w-4" /> },
  { value: 'severity', label: 'Severity', icon: <AlertTriangle className="h-4 w-4" /> },
  { value: 'impact', label: 'Impact', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'name', label: 'Name (A-Z)', icon: <Tag className="h-4 w-4" /> },
];

export function SearchFilter({
  searchQuery,
  onSearchChange,
  categories = [],
  selectedCategories,
  onCategoriesChange,
  severityLevels = defaultSeverityLevels,
  selectedSeverity,
  onSeverityChange,
  tags = [],
  selectedTags,
  onTagsChange,
  sortOptions = defaultSortOptions,
  selectedSort,
  onSortChange,
  totalResults,
  className,
  showAdvanced = true,
  onReset,
}: SearchFilterProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategories.length > 0 ||
      selectedSeverity.length > 0 ||
      selectedTags.length > 0 ||
      searchQuery.length > 0
    );
  }, [selectedCategories, selectedSeverity, selectedTags, searchQuery]);

  const handleCategoryToggle = useCallback((categoryValue: string) => {
    const newCategories = selectedCategories.includes(categoryValue)
      ? selectedCategories.filter(c => c !== categoryValue)
      : [...selectedCategories, categoryValue];
    onCategoriesChange(newCategories);
  }, [selectedCategories, onCategoriesChange]);

  const handleSeverityToggle = useCallback((severityValue: string) => {
    const newSeverity = selectedSeverity.includes(severityValue)
      ? selectedSeverity.filter(s => s !== severityValue)
      : [...selectedSeverity, severityValue];
    onSeverityChange(newSeverity);
  }, [selectedSeverity, onSeverityChange]);

  const handleTagToggle = useCallback((tagValue: string) => {
    const newTags = selectedTags.includes(tagValue)
      ? selectedTags.filter(t => t !== tagValue)
      : [...selectedTags, tagValue];
    onTagsChange(newTags);
  }, [selectedTags, onTagsChange]);

  const handleReset = useCallback(() => {
    onSearchChange('');
    onCategoriesChange([]);
    onSeverityChange([]);
    onTagsChange([]);
    onSortChange('relevance');
    onReset?.();
  }, [onSearchChange, onCategoriesChange, onSeverityChange, onTagsChange, onSortChange, onReset]);

  return (
    <Card className={cn("shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50", className)}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Search Input */}
          <div className="relative">
            <div className={cn(
              "relative transition-all duration-300",
              searchFocused ? "transform scale-[1.02]" : ""
            )}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors" />
              <Input
                type="text"
                placeholder="Search recommendations, issues, and metrics..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="pl-10 pr-4 h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-300"
              />
            </div>
          </div>

          {/* Quick Filters Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Severity Filter Pills */}
              <div className="flex items-center space-x-2">
                {severityLevels.slice(0, 3).map((severity) => (
                  <Button
                    key={severity.value}
                    variant={selectedSeverity.includes(severity.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSeverityToggle(severity.value)}
                    className={cn(
                      "h-8 px-3 text-xs font-medium transition-all duration-200",
                      selectedSeverity.includes(severity.value)
                        ? "bg-gray-900 text-white shadow-md"
                        : "hover:bg-gray-50 border-gray-200"
                    )}
                  >
                    {severity.icon}
                    <span className="ml-1">{severity.label}</span>
                    {severity.count && (
                      <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                        {severity.count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {totalResults !== undefined && (
                <div className="text-sm text-gray-500">
                  {totalResults} result{totalResults !== 1 ? 's' : ''}
                </div>
              )}
              
              {showAdvanced && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Advanced
                  {isAdvancedOpen ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </Button>
              )}

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {isAdvancedOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  {/* Categories */}
                  {categories.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <Button
                            key={category.value}
                            variant={selectedCategories.includes(category.value) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleCategoryToggle(category.value)}
                            className="h-8 px-3 text-xs"
                          >
                            {category.icon}
                            <span className={category.icon ? "ml-1" : ""}>{category.label}</span>
                            {category.count && (
                              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                                {category.count}
                              </Badge>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Button
                            key={tag.value}
                            variant={selectedTags.includes(tag.value) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTagToggle(tag.value)}
                            className="h-7 px-2 text-xs rounded-full"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag.label}
                            {tag.count && (
                              <span className="ml-1 text-xs opacity-70">({tag.count})</span>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sort Options */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Sort by</h4>
                    <div className="flex flex-wrap gap-2">
                      {sortOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant={selectedSort === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => onSortChange(option.value)}
                          className="h-8 px-3 text-xs"
                        >
                          {option.icon}
                          <span className={option.icon ? "ml-1" : ""}>{option.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="px-2 py-1">
                  Search: &quot;{searchQuery}&quot;
                  <button
                    onClick={() => onSearchChange('')}
                    className="ml-2 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategories.map((categoryValue) => {
                const category = categories.find(c => c.value === categoryValue);
                return (
                  <Badge key={categoryValue} variant="secondary" className="px-2 py-1">
                    {category?.label || categoryValue}
                    <button
                      onClick={() => handleCategoryToggle(categoryValue)}
                      className="ml-2 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
              {selectedSeverity.map((severityValue) => {
                const severity = severityLevels.find(s => s.value === severityValue);
                return (
                  <Badge key={severityValue} variant="secondary" className="px-2 py-1">
                    {severity?.label || severityValue}
                    <button
                      onClick={() => handleSeverityToggle(severityValue)}
                      className="ml-2 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
              {selectedTags.map((tagValue) => {
                const tag = tags.find(t => t.value === tagValue);
                return (
                  <Badge key={tagValue} variant="secondary" className="px-2 py-1">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag?.label || tagValue}
                    <button
                      onClick={() => handleTagToggle(tagValue)}
                      className="ml-2 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SearchFilter;