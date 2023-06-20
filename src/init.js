import * as yup from 'yup';
import i18next from 'i18next';
import watch from './views.js';
import resources from './locales/index.js';

const validate = (fields, haveUrl) => {
  yub.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'errors.validation.alreadyExist' }),
    },
    string: {
      url: () => ({ key: 'errors.validation.invalidUrl' }),
    },
  });

  const schema = yup
    .string()
    .trim()
    .url()
    .notOneOf(haveUrl);

  return schema.validate(fields);
};

export default () => {
  const defaultLanguege = 'ru';
  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: defaultLanguege,
      debug: false,
      resources,
    })
    .then(() => {
      const state = {
        form: {
          valid: true,
          processState: 'filling',
          errors: {},
        },
        uiState: {
          posts: [],
          feeds: [],
          haveUrl: [],
        },
      };
      const elements = {
        form: document.querySelector('rss-form'),
        submitButton: document.querySelector('button[type="submit"]'),
        posts: document.querySelector('.posts'),
        feeds: document.querySelector('.feeds'),
        input: document.querySelector('.form-control'),
        feedback: document.querySelector('.feedback'),
        modal: document.querySelector('#modal'),

      };
      const watchedState = watch(elements, i18nInstance, state);
      watchedState.form.status = 'filing';
    });
};
