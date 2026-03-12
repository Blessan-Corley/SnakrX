import { useCallback, useState } from 'react';
import { playClick } from '@/utils/sound.js';

const useAchievementFilters = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    playClick();
  }, []);

  const handleToggleUnlockedOnly = useCallback(() => {
    setShowUnlockedOnly((previous) => !previous);
    playClick();
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setShowUnlockedOnly(false);
    setSelectedCategory('all');
    setSelectedTier('all');
    playClick();
  }, []);

  return {
    handleCategoryChange,
    handleClearFilters,
    handleToggleUnlockedOnly,
    searchTerm,
    selectedCategory,
    selectedTier,
    setSearchTerm,
    setSelectedTier,
    showUnlockedOnly
  };
};

export default useAchievementFilters;
