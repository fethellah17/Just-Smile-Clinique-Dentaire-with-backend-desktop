import { useData } from "@/lib/data-context";

export function useCategories() {
  const { categories, addCategory, updateCategory, deleteCategory, isLoaded } = useData();

  const deleteCategoryByName = (name: string) => {
    const category = (categories || []).find(c => c.name === name);
    if (category) {
      deleteCategory(category.id);
    }
  };

  const getCategoryByName = (name: string) => {
    return (categories || []).find(c => c.name === name);
  };

  return { 
    categories: categories || [], 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    deleteCategoryByName, 
    getCategoryByName,
    isLoaded 
  };
}
