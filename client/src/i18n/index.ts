import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonCn from './cn/common';
import commonEn from './en/common';
import buttonEn from './en/button';
import buttonCn from './cn/button';
import databaseCn from './cn/database';
import databaseEn from './en/database';
import signUpCn from './cn/signUp';
import signUpEn from './en/signUp';
import warningCn from './cn/warning';
import warningEn from './en/warning';
import verifyCn from './cn/verify';
import verifyEn from './en/verify';
import helpCn from './cn/help';
import helpEn from './en/help';
import queryCn from './cn/query';
import queryEn from './en/query';
import collectionCn from './cn/collection';
import collectionEn from './en/collection';
import partitionCn from './cn/partition';
import partitionEn from './en/partition';
import indexCn from './cn/index';
import indexEn from './en/index';
import cardCn from './cn/card';
import cardEn from './en/card';
import dataCn from './cn/data';
import dataEn from './en/data';
import dialogCn from './cn/dialog';
import dialogEn from './en/dialog';
import passwordCn from './cn/password';
import passwordEn from './en/password';
import connectCn from './cn/connect';
import connectEn from './en/connect';

export const resources = {
  cn: {
    translation: commonCn,
    signUp: signUpCn,
    btn: buttonCn,
    warning: warningCn,
    verify: verifyCn,
    help: helpCn,
    database: databaseCn,
    query: queryCn,
    collection: collectionCn,
    partition: partitionCn,
    index: indexCn,
    card: cardCn,
    data: dataCn,
    dialog: dialogCn,
    password: passwordCn,
    connect: connectCn,
  },
  en: {
    translation: commonEn,
    signUp: signUpEn,
    btn: buttonEn,
    warning: warningEn,
    verify: verifyEn,
    help: helpEn,
    database: databaseEn,
    query: queryEn,
    collection: collectionEn,
    partition: partitionEn,
    index: indexEn,
    card: cardEn,
    data: dataEn,
    dialog: dialogEn,
    password: passwordEn,
    connect: connectEn,
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
