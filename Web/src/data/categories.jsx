import React from 'react';
import { 
  Pill, 
  Tablets, 
  Activity, 
  Leaf, 
  Droplet, 
  Stethoscope, 
  Wind 
} from 'lucide-react';

export const categories = [
  { id: 1, nameKey: 'prescription', icon: <Pill className="w-7 h-7 text-white" /> },
  { id: 2, nameKey: 'otc', icon: <Tablets className="w-7 h-7 text-white" /> },
  { id: 3, nameKey: 'vitamin', icon: <Activity className="w-7 h-7 text-white" /> },
  { id: 4, nameKey: 'herbal', icon: <Leaf className="w-7 h-7 text-white" /> },
  { id: 5, nameKey: 'topical', icon: <Droplet className="w-7 h-7 text-white" /> },
  { id: 6, nameKey: 'medicalDevices', icon: <Stethoscope className="w-7 h-7 text-white" /> },
  { id: 7, nameKey: 'digestion', icon: <Activity className="w-7 h-7 text-white" /> },
  { id: 8, nameKey: 'respiratory', icon: <Wind className="w-7 h-7 text-white" /> },
];

// Helper function to get category name with translation
export const getCategoryName = (category, language = 'vi') => {
  const { getTranslation } = require('../locales/translations');
  return getTranslation(category.nameKey, language);
};

