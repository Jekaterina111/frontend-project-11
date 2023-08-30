export default (contents) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(contents, 'application/xml');
    const errorNode = doc.querySelector('parsererror');
  
    if (errorNode) {
      const error = new Error(errorNode.textContent);
      error.isParsingError = true;
      error.contents = contents;
      throw new Error('invalidUrl');
    }
  
    const channel = doc.querySelector('channel');
    const title = channel.querySelector('title').textContent;
    const link = channel.querySelector('link').textContent;
    const description = channel.querySelector('description').textContent;
    const feed = { title, description, link };
  
    const items = Array.from(channel.querySelectorAll('item'));
  
    const posts = items.map((item) => {
      const titleP = item.querySelector('title').textContent;
      const linkP = item.querySelector('link').textContent;
      const descriptionP = item.querySelector('description').textContent;
  
      const post = { title: titleP, description: descriptionP, link: linkP };
      return post;
    });
  
    return { feed, posts };
  };
  