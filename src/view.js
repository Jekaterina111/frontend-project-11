import onChange from 'on-change';

export default (state, elements, i18nInstance) => {
    const {
      form,
      input,
      submitButton,
      feedback,
      feeds,
      posts,
    } = elements;
  
    const generateStateControl = (processState) => {
      switch (processState) {
        case 'loaded':
          submitButton.setAttribute('type', 'submit');
          submitButton.classList.remove('disabled');
          form.reset();
          input.focus();
          break;
        case 'loading':
          submitButton.classList.add('disabled');
          break;
        case 'networkError':
        case 'invalidError':
          submitButton.classList.remove('disabled');
          submitButton.setAttribute('type', '');
          break;
        default:
          break;
      }
    };
  
    const generateFormControl = (formProcessState) => {
      switch (formProcessState) {
        case 'filling':
          submitButton.classList.remove('disabled');
          break;
        case 'validating':
          submitButton.classList.add('disabled');
          break;
        case 'validated':
          submitButton.classList.remove('disabled');
          input.classList.remove('is-invalid');
          break;
        case 'invalidated':
          submitButton.classList.remove('disabled');
          input.classList.add('is-invalid');
          break;
        default:
          break;
      }
    };
    const handleErrors = (value) => {
      feedback.textContent = i18nInstance.t(value);
      switch (value) {
        case 'success':
          feedback.classList.remove('text-danger');
          feedback.classList.add('text-success');
          break;
        case 'errors.validation.alreadyExist':
        case 'errors.validation.invalidUrl':
        case 'errors.validation.invalidRss':
        case 'errors.validation.emptyField':
        case 'errors.validation.network':
          feedback.classList.remove('text-success');
          feedback.classList.add('text-danger');
          break;
        default:
          throw new Error(`Unknow ${value}`);
      }
    };
  
    const renderFeeds = (values) => {
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
        h3.classList.add('h6', 'm-0');
        h3.textContent = title;
  
        const p = document.createElement('p');
        p.classList.add('m-0', 'small', 'text-black-50');
        p.textContent = description;
  
        li.append(h3, p);
        ul.prepend(li);
      });
  
      div2.append(h2);
      div.append(div2, ul);
      feeds.innerHTML = '';
      feeds.append(div);
    };
  
    const renderPost = (values) => {
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
        a.setAttribute('rel', 'noopener noreferrer');
        a.dataset.id = post.id;
        a.textContent = title;
  
        const btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        btn.dataset.id = post.id;
        btn.dataset.bsToggle = 'modal';
        btn.dataset.bsTarget = '#modal';
        btn.textContent = i18nInstance.t('button');
        li.append(a, btn);
        ul.prepend(li);
      });
      div1.append(h3);
      div.append(div1, ul);
      posts.innerHTML = '';
      posts.append(div);
    };
  
    const watchedState = onChange(state, (path, value) => {
      switch (path) {
        case 'processState':
          generateStateControl(value);
          break;
        case 'form.processState':
          generateFormControl();
          break;
        case 'uiState.feedback':
          handleErrors(value);
          break;
        case 'data.feeds':
          renderFeeds(value);
          break;
        case 'data.posts':
          renderPost(value);
          break;
        default:
          break;
      }
    });
    return watchedState;
  };
  