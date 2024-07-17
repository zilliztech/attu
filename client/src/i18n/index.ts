import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonCn from './cn/common';
import commonEn from './en/common';
import buttonEn from './en/button';
import buttonCn from './cn/button';
import warningCn from './cn/warning';
import warningEn from './en/warning';
import navCn from './cn/nav';
import navEn from './en/nav';
import homeCn from './cn/home';
import homeEn from './en/home';
import collectionCn from './cn/collection';
import collectionEn from './en/collection';
import dialogCn from './cn/dialog';
import dialogEn from './en/dialog';
import partitionCn from './cn/partition';
import partitionEn from './en/partition';
import successEn from './en/success';
import successCn from './cn/success';
import indexEn from './en/index';
import indexCn from './cn/index';
import insertEn from './en/insert';
import insertCn from './cn/insert';
import searchEn from './en/search';
import searchCn from './cn/search';
import systemViewTransEn from './en/systemView';
import systemViewTransCn from './cn/systemView';
import userTransEn from './en/user';
import userTransCn from './cn/user';
import databaseTransEn from './en/database';
import databaseTransCn from './cn/database';
import prometheusTransEn from './en/prometheus';
import prometheusTransCn from './cn/prometheus';
import propertiesEn from './en/properties';
import propertiesCn from './cn/properties';

export const resources = {
  'zh-CN': {
    translation: commonCn,
    btn: buttonCn,
    warning: warningCn,
    nav: navCn,
    home: homeCn,
    collection: collectionCn,
    dialog: dialogCn,
    partition: partitionCn,
    success: successCn,
    index: indexCn,
    insert: insertCn,
    search: searchCn,
    systemView: systemViewTransCn,
    user: userTransCn,
    database: databaseTransCn,
    prometheus: prometheusTransCn,
    properties: propertiesCn,
  },
  en: {
    translation: commonEn,
    btn: buttonEn,
    warning: warningEn,
    nav: navEn,
    home: homeEn,
    collection: collectionEn,
    dialog: dialogEn,
    partition: partitionEn,
    success: successEn,
    index: indexEn,
    insert: insertEn,
    search: searchEn,
    systemView: systemViewTransEn,
    user: userTransEn,
    database: databaseTransEn,
    prometheus: prometheusTransEn,
    properties: propertiesEn,
  },
};

// the translations
// (tip move them in a JSON file and import them)

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
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
      lookupLocalStorage: 'attu.ui.lang',
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
