import React from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  Lightbulb 
} from 'lucide-react';

export const healthInfos = [
  {
    id: 1,
    tagKey: 'note',
    tagColor: 'bg-orange-100 text-orange-600',
    titleKey: 'safeMedicineUsage',
    descKey: 'safeMedicineDesc',
    icon: <ShieldCheck className="w-5 h-5 text-orange-500" />
  },
  {
    id: 2,
    tagKey: 'knowledge',
    tagColor: 'bg-teal-100 text-teal-600',
    titleKey: 'commonSideEffects',
    descKey: 'sideEffectsDesc',
    icon: <BookOpen className="w-5 h-5 text-teal-500" />
  },
  {
    id: 3,
    tagKey: 'advice',
    tagColor: 'bg-blue-100 text-blue-600',
    titleKey: 'pharmacistAdvice',
    descKey: 'pharmacistAdviceDesc',
    icon: <Lightbulb className="w-5 h-5 text-blue-500" />
  }
];

