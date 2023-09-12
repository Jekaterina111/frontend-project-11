import onChange from 'on-change';

const languages = ['en', 'ru'];

const handleSwitchLanguage = (state) => (evt) => {
  const { lng } = evt.target.dataset;

  state.lng = lng;
};

const renderButtons = (watchedState, i18nInstance) => {
  const lngToggler = document.querySelector('.btn-group');
  lngToggler.setAttribute('role', 'group');
  lngToggler.innerHTML = '';
  languages.forEach((lng) => {
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    const className = watchedState.lng === lng ? 'btn-primary' : 'btn-outline-primary';
    button.classList.add('btn', 'mb-3', className);
    button.setAttribute('data-lng', lng);
    button.textContent = i18nInstance.t(`languages.${lng}`);
    button.addEventListener('click', handleSwitchLanguage(watchedState));
    lngToggler.appendChild(button);
  });
};

const renderContent = (elements, i18nInstance) => {
  const {
    mainTitle,
    greeting,
    label,
    sample,
    submitButton,
  } = elements;

  mainTitle.textContent = i18nInstance.t('mainTitle');
  greeting.textContent = i18nInstance.t('greeting');
  label.textContent = i18nInstance.t('label');
  submitButton.textContent = i18nInstance.t('form.submit');
  sample.textContent = i18nInstance.t('sample');
};

const handleSusscess = (elements, i18nInstance) => {
  elements.feedback.classList.add('text-success');
  elements.feedback.classList.remove('text-danger');
  elements.input.classList.remove('is-invalid');
  elements.feedback.textContent = i18nInstance.t('success');
  elements.form.reset();
  elements.input.focus();
};

const handleErrors = (elements, error, i18nInstance) => {
  const { feedback, input, submitButton } = elements;
  feedback.classList.add('text-danger');
  feedback.classList.remove('text-success');
  feedback.textContent = i18nInstance.t(`errors.validation.${error}`);
  if (error === 'Network Error') {
    input.classList.add('is-invalid');
    feedback.textContent = i18nInstance.t('errors.validation.network');
  }

  submitButton.disabled = false;
  input.disabled = false;
};

const generateStateControl = (elements, processState, watchedState, i18nInstance) => {
  const { feedback, submitButton } = elements;
  switch (processState) {
    case 'loaded':
      submitButton.classList.remove('disabled');
      handleSusscess(elements, i18nInstance);
      break;

    case 'filling':
      submitButton.classList.add('disabled');
      break;

    case 'error':
      submitButton.classList.add('disabled');
      handleErrors(elements, watchedState.form.error, i18nInstance);
      break;

    case 'loading':
      submitButton.classList.add('disabled');
      feedback.textContent = i18nInstance.t('loading');
      feedback.classList.add('text-success');
      feedback.classList.remove('text-danger');
      break;
    default:
      throw new Error(`unknow ${processState}`);
  }
};

const renderFeeds = (elements, values, i18nInstance) => {
  const { feeds } = elements;
  const div = document.createElement('div');
  div.classList.add('card', 'border-0');

  const div2 = document.createElement('div');
  div2.classList.add('card-body');

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nInstance.t('feeds');

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  values.forEach((feed) => {
    const { title, description } = feed;
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const h3 = document.createElement('h3');
    h3.classList.add('h5', 'm-0');
    h3.textContent = title;

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-body-secondary');
    p.textContent = description;

    li.append(h3, p);
    ul.prepend(li);
  });

  div2.append(h2);
  div.append(div2, ul);
  feeds.innerHTML = '';
  feeds.append(div);
};

const renderPost = (elements, values, i18nInstance, watchedState) => {
  const { posts } = elements;
  const div = document.createElement('div');
  div.classList.add('card', 'border-0');

  const div1 = document.createElement('div');
  div1.classList.add('card-body');

  const h3 = document.createElement('h3');
  h3.classList.add('card-title', 'h4');
  h3.textContent = i18nInstance.t('posts');

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  values.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'border-0', 'justyfy-content-between', 'align-items-start', 'border-end-0');
    const { title, link } = post;

    li.addEventListener('click', (event) => {
      const { id } = event.target.dataset;
      watchedState.uiState.readPostId.push(id);
    });

    const a = document.createElement('a');
    a.classList.add('fw-bold');
    a.setAttribute('href', link);
    a.setAttribute('target', 'blank');
    a.setAttribute('rel', 'nofollow noopener noreferrer');
    a.dataset.id = post.id;
    a.textContent = title;

    const btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'ms-3');
    btn.dataset.id = post.id;
    btn.dataset.bsToggle = 'modal';
    btn.dataset.bsTarget = '#modal';
    btn.textContent = i18nInstance.t('button');

    btn.addEventListener('click', (event) => {
      const { bsTarget } = event.target.dataset;
      const modal = document.querySelector(bsTarget);
      const modalTitle = modal.querySelector('.modal-title');
      const modalBody = modal.querySelector('.modal-body');
      const modalBtn = document.querySelector('a.full-article');
      const modalClsBtn = document.querySelector('.modal-footer button');

      modalTitle.textContent = post.title;
      modalBody.textContent = post.description;
      modalBtn.setAttribute('href', post.link);
      modalBtn.textContent = i18nInstance.t('btnRead');
      modalClsBtn.textContent = i18nInstance.t('modalBtn');
    });
    li.append(a, btn);
    ul.prepend(li);
  });

  div1.append(h3);
  div.append(div1, ul);
  posts.innerHTML = '';
  posts.append(div);
};

const havedReadPost = (readPostId) => {
  const postsList = document.querySelectorAll('.posts ul .list-group-item a');
  const readPost = new Set(readPostId);

  postsList.forEach((a) => {
    if (readPost.has(a.dataset.id)) {
      a.classList.replace('fw-bold', 'fw-normal');
      a.classList.add('link-secondary');
    }
  });
};

export { renderContent };

export default (state, elements, i18nInstance) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'lng': i18nInstance.changeLanguage(value).then(() => renderButtons(watchedState, i18nInstance));
        renderContent(elements, i18nInstance);
        break;

      case 'form.processState':
        generateStateControl(elements, value, watchedState, i18nInstance);
        break;

      case 'form.error':
        handleErrors(elements, watchedState.form.error, i18nInstance);
        break;

      case 'uiState.readPostId':
        havedReadPost(watchedState.uiState.readPostId);
        break;

      case 'data.feeds':
        renderFeeds(elements, value, i18nInstance);
        break;

      case 'data.posts':
        renderPost(elements, value, i18nInstance, watchedState);
        havedReadPost(watchedState.uiState.readPostId);
        break;

      default:
        break;
    }
  });
  renderButtons(watchedState, i18nInstance);
  return watchedState;
};
