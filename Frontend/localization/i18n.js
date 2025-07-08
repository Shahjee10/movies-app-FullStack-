import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en';
import ur from './ur';

const fallback = { languageTag: 'en' };
const { languageTag } = Localization.getLocales()[0] || fallback;

i18n
  .use(initReactI18next) // this connects i18n to React Context
  .init({
    compatibilityJSON: 'v3',
    lng: languageTag,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
