import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonCn from './cn/common';
import commonEn from './en/common';
import buttonEn from './en/button';
import buttonCn from './cn/button';
import warningCn from './cn/warning';
import warningEn from './en/warning';
import navCn from './cn/nav';
import navEn from './en/nav';
import overviewCn from './cn/overview';
import overviewEn from './en/overview';
import collectionCn from './cn/collection';
import collectionEn from './en/collection';
import dialogCn from './cn/dialog';
import dialogEn from './en/dialog';
import successEn from './en/success';
import successCn from './cn/success';

export const resources = {
  cn: {
    translation: commonCn,
    btn: buttonCn,
    warning: warningCn,
    nav: navCn,
    overview: overviewCn,
    collection: collectionCn,
    dialog: dialogCn,
    success: successCn,
  },
  en: {
    translation: commonEn,
    btn: buttonEn,
    warning: warningEn,
    nav: navEn,
    overview: overviewEn,
    collection: collectionEn,
    dialog: dialogEn,
    success: successEn,
  },
};

// the translations
// (tip move them in a JSON file and import them)

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  // .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    lng: 'en',
    fallbackLng: 'en',
    resources,
    keySeparator: false, // we do not use keys in form messages.welcome
    returnObjects: true,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },

    detection: {
      // order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],

      // keys or params to lookup language from
      lookupLocalStorage: 'lang',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,

      // cache user language on
      caches: ['localStorage', 'cookie'],
      excludeCacheFor: ['cimode'], // languages to not persist (cookie, localStorage)

      // optional expire and domain for set cookie
      cookieMinutes: 10,
      cookieDomain: 'myDomain',

      // optional htmlTag with lang attribute, the default is:
      htmlTag: document.documentElement,

      // only detect languages that are in the whitelist
      checkWhitelist: true,
    },
  });

export default i18n;
