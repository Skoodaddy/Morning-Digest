import React, { useState } from 'react';
import { Meal } from '../types';
import { Clock, ChefHat, X } from 'lucide-react';

interface MealsSectionProps {
  meals: Meal[];
}

const MealsSection: React.FC<MealsSectionProps> = ({ meals }) => {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-serif text-white mb-4">Dinner Ideas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meals.map((meal, idx) => (
          <div 
            key={idx} 
            className="bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 flex flex-col cursor-pointer hover:border-white/20 transition-colors"
            onClick={() => setSelectedMeal(meal)}
          >
            <div className="relative aspect-video bg-zinc-800">
              {meal.imageUrl ? (
                <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <ChefHat className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-medium text-white mb-2">{meal.name}</h3>
              <div className="flex items-center text-zinc-400 text-sm mt-auto">
                <Clock className="w-4 h-4 mr-1" />
                <span>{meal.cookingTime || '30 mins'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-zinc-900/90 backdrop-blur-md p-4 border-b border-white/10 flex justify-between items-center z-10">
              <h2 className="text-xl font-medium text-white">{selectedMeal.name}</h2>
              <button 
                onClick={() => setSelectedMeal(null)}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {selectedMeal.imageUrl && (
              <div className="w-full h-64 bg-zinc-800">
                <img src={selectedMeal.imageUrl} alt={selectedMeal.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}

            <div className="p-6 space-y-8">
              <div className="flex items-center space-x-4 text-sm text-zinc-400">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {selectedMeal.cookingTime}
                </div>
                {selectedMeal.recipeUrl && (
                  <a href={selectedMeal.recipeUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
                    Original Recipe
                  </a>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <ChefHat className="w-5 h-5 mr-2 text-emerald-400" />
                  Ingredients
                </h3>
                <ul className="space-y-2">
                  {selectedMeal.ingredients?.map((ing, idx) => (
                    <li key={idx} className="flex items-start text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 mr-3 flex-shrink-0" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Instructions</h3>
                <div className="space-y-4">
                  {selectedMeal.instructions?.map((step, idx) => (
                    <div key={idx} className="flex">
                      <span className="text-zinc-500 font-mono mr-4 mt-0.5">{idx + 1}.</span>
                      <p className="text-zinc-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MealsSection;
