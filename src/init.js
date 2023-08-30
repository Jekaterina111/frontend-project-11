import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import watch from './views.js';
import resources from './locales/index.js';
import parse from './parser.js';

const validUrl = (url, haveUrl) => {
  const schema = yup.string()
    .trim()
    .url()
    .notOneOf(haveUrl)
    .required();
  return schema.validate(url);
};

yup.setLocale({
  string: {
    notOneOf: i18next.t('errors.validation.alreadyExist'),
    url: i18next.t('errors.validation.invalidUrl'),
    required: i18next.t('errors.validation.emptyField'),
  },
});

const getOriginsProxy = (urlLink) => {
  const originsProxy = 'https://allorigins.hexlet.app/get';
  const rssUrl = new URL(originsProxy);
  rssUrl.searchParams.set('disableCache', 'true');
  rssUrl.searchParams.set('url', urlLink);
  console.log(rssUrl);
  return axios.get(rssUrl);
};

const updateRss = (feeds) => {
  const promises = feeds
    .map(({ feedId, link }) => getOriginsProxy(link)
      .then((res) => {
        const { posts } = parse(res.data.contents);
        const uploadPosts = posts.map((post) => post.link);
        const newPost = posts.filter((post) => !uploadPosts.includes(post.link));
        if (newPost.length === 0) {
          return [];
        }
        const updatedPosts = newPost.map((post) => ({ ...post, feedId, id: _.uniqueId() }));
        posts.push(...updatedPosts);
        return updatedPosts;
      })
      .catch((err) => console.error(err.message)));
  Promise.allSettled(promises)
    .finally(() => {
      setTimeout(() => updateRss(feeds), 5000);
    });
};

export default () => {
  const defaultLanguege = 'ru';

  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: defaultLanguege,
      debug: false,
      resources,
    });

  const state = {
    lng: defaultLanguege,
    processState: 'initialized',
    form: {
      processState: 'filling',
      error: null,
    },
    uiState: {
      feedback: null,
      readPostId: [],
    },
    data: {
      posts: [],
      feeds: [],
    },
    haveUrl: [],
  };

  const elements = {
    mainTitle: document.querySelector('.display-3'),
    form: document.querySelector('.rss-form'),
    submitButton: document.querySelector('button[type="submit"]'),
    posts: document.querySelector('.posts'),
    postsBtn: document.querySelectorAll('[data-bs-toggle="modal"]'),
    feeds: document.querySelector('.feeds'),
    input: document.querySelector('.form-control'),
    feedback: document.querySelector('.feedback'),
    modal: document.querySelector('#modal'),
    body: document.querySelector('.modal-body'),
    footer: document.querySelector('.modal-footer'),
  };
  const watchedState = watch(state, elements, i18nInstance);
  updateRss(watchedState.data.feeds);

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const link = formData.get('url').trim();

    validUrl(link, watchedState.haveUrl)
      .then(() => {
        watchedState.form.processState = 'validated';
        watchedState.processState = 'loading';
        return getOriginsProxy(link);
      })
      .then((res) => {
        const content = res.data.contents;
        watchedState.haveUrl.push(link);
        const { feed, posts } = parse(content);
        if (!feed || !posts) {
          throw new Error('Parser Error');
        }
        const feedId = _.uniqueId();
        watchedState.data.feeds.push({ ...feed, id: feedId, link });
        const postId = _.uniqueId();
        const extractPost = posts.map((post) => ({ ...post, feedId, id: postId }));
        watchedState.data.posts.push(...extractPost);
        watchedState.processState = 'loaded';
        watchedState.uiState.feedback = 'success';
        watchedState.form.processState = 'filling';
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          const [errorCode] = err.errors;
          watchedState.form.processState = 'invalidated';
          watchedState.uiState.feedback = errorCode;
        } else if (err.name === 'AxiosError') {
          if (err.message === 'Network Error') {
            watchedState.processState = 'networkError';
            watchedState.uiState.feedback = 'errors.validation.network';
          }
        } else if (err.name === 'Error') {
          if (err.message === 'Parser Error') {
            watchedState.processState = 'invalidError';
            watchedState.uiState.feedback = 'errors.validation.invalidRss';
          }
        } else {
          throw new Error(`Unknown error ${err}`);
        }
        console.error(err.message);
      });
  });
};
