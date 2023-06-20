import onChange from 'on-change';

export default (elements, i18nInstance, state) => {
  const generateFormControl = (processState) => {
    switch (processState) {
      case 'failed':
      case 'filling':
        elements.submitButton.disabled = false;
        break;
      case 'sending':
        elements.submitButton.disabled = true;
        break;
      case 'sent':
        elements.form.reset();
        elements.input.focus();
        break;

      default:
        break;
    }
  };

  const handleErrors = (error) => {
    if (state.form.valid === false) {
      elements.feedback.classList.add('is-invalid');
    }
    elements.feedback.classList.add('text-danger');
    elements.feedback.classList.remove('text-success');
    elements.feedback.textContent = error;
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.processState':
        generateFormControl();
        break;
      case 'form.valid':
        elements.submitButton.disabled = !value;
        break;
      case 'form.errors':
        handleErrors();
        break;
      default:
        break;
    }
  });
  return watchedState;
};
