import React, { useState, useEffect } from 'react';
import { X, Check, Edit2, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';

export default function OCRTextEditor({ 
  initialText, 
  allTexts, 
  onConfirm, 
  onClose,
  onSearch,
  error = null,
  message = null,
  drugInfo = null
}) {
  const { language } = useLanguage();
  const [editedText, setEditedText] = useState(initialText || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditedText(initialText || '');
  }, [initialText]);

  const handleSelectFromList = (text) => {
    setEditedText(text);
    setIsEditing(false);
  };

  const handleSearch = () => {
    if (editedText.trim()) {
      onSearch(editedText.trim());
    }
  };

  return (
    <div>
      {/* Hiển thị thông báo lỗi nếu có */}
      {(error || message) && (
        <div className={`mb-3 p-3 rounded-lg ${
          error === 'PRESCRIPTION_REQUIRED' 
            ? 'bg-amber-50 border-2 border-amber-400' 
            : 'bg-red-50 border-2 border-red-400'
        }`}>
          <div className={`text-sm font-bold ${
            error === 'PRESCRIPTION_REQUIRED' ? 'text-amber-800' : 'text-red-800'
          }`}>
            {message || (error === 'PRESCRIPTION_REQUIRED' ? getTranslation('prescriptionDrug', language) : getTranslation('drugNotFound', language))}
          </div>
          {drugInfo && (
            <div className="text-xs text-gray-600 mt-1">
              {drugInfo.drug_name && <div>{getTranslation('drugName', language)} {drugInfo.drug_name}</div>}
              {drugInfo.active_ingredient && <div>{getTranslation('activeIngredient', language)} {drugInfo.active_ingredient}</div>}
            </div>
          )}
          <div className="text-xs text-gray-600 mt-2">
            {getTranslation('selectOrEditText', language)}
          </div>
        </div>
      )}
      
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1">
          <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
            📝 {getTranslation('recognizedText', language)}
          </div>
          {isEditing ? (
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full px-3 py-2 border-2 border-teal-500 rounded-lg text-base font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows={2}
              autoFocus
              placeholder={getTranslation('enterOrEditText', language)}
            />
          ) : (
            <div 
              onClick={() => setIsEditing(true)}
              className="px-3 py-2 bg-teal-50 border-2 border-teal-200 rounded-lg text-base font-bold text-gray-800 break-words cursor-text hover:border-teal-400 transition"
            >
              {editedText || getTranslation('noText', language)}
            </div>
          )}
          {allTexts && allTexts.length > 1 && (
            <div className="mt-2">
              <div className="text-xs font-medium text-gray-600 mb-1">
                {getTranslation('allRecognizedTexts', language)} ({allTexts.length}):
              </div>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {allTexts.map((text, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectFromList(text)}
                    className={`px-2 py-1 rounded text-xs transition ${
                      text === editedText
                        ? 'bg-teal-500 text-white font-medium'
                        : 'bg-gray-100 text-gray-700 hover:bg-teal-100'
                    }`}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 bg-teal-100 rounded-lg hover:bg-teal-200 transition"
              title={getTranslation('edit', language)}
            >
              <Edit2 className="w-4 h-4 text-teal-600" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            title={getTranslation('close', language)}
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      {isEditing && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition"
          >
            {getTranslation('cancel', language)}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 px-3 py-2 bg-teal-500 text-white rounded-lg font-medium text-sm hover:bg-teal-600 transition"
          >
            {getTranslation('done', language)}
          </button>
        </div>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={handleSearch}
          disabled={!editedText.trim()}
          className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg font-bold text-sm hover:bg-teal-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          {getTranslation('confirmAndSearch', language)}
        </button>
        <button
          onClick={() => {
            setIsEditing(false);
            setEditedText(initialText || '');
            onClose();
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition"
        >
          {getTranslation('scanAgain', language)}
        </button>
      </div>
    </div>
  );
}

