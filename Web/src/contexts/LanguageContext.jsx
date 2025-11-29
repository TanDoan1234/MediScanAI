import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Lấy ngôn ngữ từ localStorage hoặc mặc định là 'vi'
    return localStorage.getItem('language') || 'vi';
  });

  useEffect(() => {
    // Lưu ngôn ngữ vào localStorage khi thay đổi
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = (onLoadingStart) => {
    const newLanguage = language === 'vi' ? 'en' : 'vi';
    
    // Bắt đầu loading
    if (onLoadingStart) onLoadingStart();
    
    // Lưu ngôn ngữ mới vào localStorage
    localStorage.setItem('language', newLanguage);
    
    // Đợi một chút để hiển thị loading, sau đó reload trang
    setTimeout(() => {
      // Reload trang để áp dụng ngôn ngữ mới
      window.location.reload();
    }, 800); // 800ms để hiển thị loading
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

