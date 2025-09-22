// randomPosts.js
// A Blogger Random Posts Widget that fetches and displays random posts with customizable styling
// Author: Grok (Generated for GitHub upload)
// License: MIT

// Utility function to generate a random ID
const generateWidgetId = () => {
  const chars = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890_-';
  let id = '';
  for (let i = 0; i < 16; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};

// Utility function to get text alignment style
const getTextAlign = (value) => {
  switch (value) {
    case 'none': return 'display:none;';
    case 'right': return 'display:block;text-align:right;';
    case 'center': return 'display:block;text-align:center;';
    default: return 'display:block;text-align:left;';
  }
};

// Utility function to map font names to font-family strings
const getFontFamily = (font) => {
  const fonts = {
    'Georgia': 'Georgia, serif',
    'Palatino': '"Palatino Linotype", "Book Antiqua", Palatino, serif',
    'Times New Roman': '"Times New Roman", Times, serif',
    'Arial': 'Arial, Helvetica, sans-serif',
    'Arial Black': '"Arial Black", Gadget, sans-serif',
    'Comic Sans': '"Comic Sans MS", cursive, sans-serif',
    'Impact': 'Impact, Charcoal, sans-serif',
    'Lucida Sans': '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
    'Tahoma': 'Tahoma, Geneva, sans-serif',
    'Trebuchet': '"Trebuchet MS", Helvetica, sans-serif',
    'Verdana': 'Verdana, Geneva, sans-serif',
    'Courier New': '"Courier New", Courier, monospace',
    'Lucida Console': '"Lucida Console", Monaco, monospace'
  };
  return fonts[font] || font;
};

// Utility function to get display style
const getDisplayStyle = (value) => {
  return value === 'none' ? 'display:none;' : 'display:inline-block;';
};

// Function to render a single post
const renderPost = (post, index, config) => {
  try {
    const postData = {
      link: post.querySelector('link[rel="alternate"]')?.getAttribute('href') || '/',
      title: post.querySelector('title')?.textContent || 'No title',
      date: post.querySelector('published')?.textContent?.substring(0, 10) || '',
      thumbnail: post.querySelector('media\\:thumbnail')?.getAttribute('url') ||
                 'https://3.bp.blogspot.com/-go-1bJQKzCY/XIpRVUCkeCI/AAAAAAAAQM/YUdYK3hEkcIFwcz0r-T2uErre0JOJWnrwCLcBGAs/s1600/no-image.png',
      comments: Number(post.querySelector('thr\\:total')?.textContent) || 0,
      author: post.querySelector('author name')?.textContent || 'Anonymous',
      excerpt: config.excerptLength > 0 && post.querySelector('summary')
        ? post.querySelector('summary').textContent.replace(/<[^>]+>/g, '').substring(0, config.excerptLength) + '...' : '',
      categories: '',
      categoryList: ''
    };

    // Generate category labels
    post.querySelectorAll('category').forEach((cat, i) => {
      const term = cat.getAttribute('term');
      postData.categories += `<pbplabel>${term}</pbplabel>`;
      postData.categoryList += term + (i < post.querySelectorAll('category').length - 1 ? ', ' : '');
    });

    // Insert post HTML
    const postDiv = document.querySelector(`.pbpRandomPost[post="np7${index}s1"]`);
    if (postDiv) {
      postDiv.innerHTML = `
        <pbprandompost>
          <a href="${postData.link}" title="${postData.title}" target="_blank">
            <img src="${postData.thumbnail}" style="${config.thumbnail === 'none' ? 'display:none;' : config.thumbnail === 'left' ? 'float:left;margin:0 5px 5px 0;' : config.thumbnail === 'right' ? 'float:right;margin:0 0 5px 5px;' : 'display:block;text-align:center;'}width:${config.thumbnailSize}px;" alt="No image">
            <pbpostitle>${postData.title}</pbpostitle>
          </a>
          <pbpinfobox>
            <pbpkomenty title="${postData.comments} comments about ${postData.title}">${postData.comments}</pbpkomenty>
            <pbpautor title="Published by ${postData.author}">${postData.author}</pbpautor>
            <pbpdatapubl title="Date of publication">📅 ${postData.date}</pbpdatapubl>
          </pbpinfobox>
          <pbptagi title="Labels: ${postData.categoryList}">${postData.categories}</pbptagi>
          <pbpfragment>${postData.excerpt}</pbpfragment>
        </pbprandompost>
      `;
    }
  } catch (error) {
    console.error(`Error rendering post ${index}:`, error);
  }
};

// Function to fetch individual post
const fetchPost = async (index, config) => {
  try {
    const response = await fetch(`/feeds/posts/summary?start-index=${index}&max-results=1`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const post = xml.querySelector('entry');
    if (post) renderPost(post, index, config);
  } catch (error) {
    console.error(`Error fetching post ${index}:`, error);
  }
};

// Main widget function
const randomPostsWidget = async () => {
  try {
    // Find widget container
    const script = Array.from(document.getElementsByTagName('script'))
      .find(s => s.src.includes('randomPosts.js'));
    if (!script) throw new Error('Script not found');
    const widgetContainer = script.parentNode;

    // Generate widget ID
    const widgetId = generateWidgetId();
    const widgetDiv = document.createElement('div');
    widgetDiv.id = widgetId;
    widgetContainer.insertBefore(widgetDiv, widgetContainer.firstChild);

    // Get configuration from attributes
    const config = {
      numberOfPosts: Number(widgetContainer.getAttribute('numberOfPosts')) || 5,
      category: widgetContainer.getAttribute('category') ? '/-/' + widgetContainer.getAttribute('category') : '',
      titleFont: getFontFamily(widgetContainer.getAttribute('titleFont') || 'Arial'),
      textFont: getFontFamily(widgetContainer.getAttribute('textFont') || 'Georgia'),
      titleSize: Number(widgetContainer.getAttribute('titleSize')) || 15,
      textSize: Number(widgetContainer.getAttribute('textSize')) || 12,
      borderWidth: Number(widgetContainer.getAttribute('borderWidth')) || 1,
      borderStyle: widgetContainer.getAttribute('borderStyle') || 'solid',
      borderColor: widgetContainer.getAttribute('borderColor') || '#333333',
      textColor: widgetContainer.getAttribute('textColor') || '#333333',
      thumbnail: widgetContainer.getAttribute('thumbnail') || 'left',
      thumbnailSize: Number(widgetContainer.getAttribute('thumbnailSize')) || 70,
      thumbnailRounding: widgetContainer.getAttribute('thumbnailRounding') || '15%',
      excerptLength: Number(widgetContainer.getAttribute('excerptLength')) || 200,
      postTitle: widgetContainer.getAttribute('postTitle') || 'block',
      postAuthor: widgetContainer.getAttribute('postAuthor') || 'none',
      publishDate: widgetContainer.getAttribute('publishDate') || 'none',
      postCategories: widgetContainer.getAttribute('postCategories') || 'none',
      numOfComments: widgetContainer.getAttribute('numOfComments') || 'none'
    };

    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
      #${widgetId} { display: block; }
      #${widgetId} pbprandompost { display: block; font-size: ${config.textSize}px; color: ${config.textColor}; padding: 5px; border-bottom: ${config.borderWidth}px ${config.borderStyle} ${config.borderColor}; }
      #${widgetId} .pbpRandomPost:first-child pbprandompost { border-top: ${config.borderWidth}px ${config.borderStyle} ${config.borderColor}; }
      #${widgetId} pbprandompost pbpostitle { ${getTextAlign(config.postTitle)} font-size: ${config.titleSize}px; color: ${config.textColor}; font-family: ${config.titleFont}; }
      #${widgetId} pbprandompost a img { border-radius: ${config.thumbnailRounding}; }
      #${widgetId} pbprandompost a img:hover { opacity: 0.8; }
      #${widgetId} pbprandompost a { text-decoration: none; border: none; padding: 0; margin: 0; }
      #${widgetId} pbprandompost a:hover pbpostitle { text-decoration: underline; }
      #${widgetId} pbpinfobox { margin-bottom: ${config.textSize < 12 ? 2 : config.textSize < 21 ? 3 : 4}px; }
      #${widgetId} pbpinfobox pbpautor { ${getDisplayStyle(config.postAuthor)} }
      #${widgetId} pbpinfobox pbpdatapubl { ${getDisplayStyle(config.publishDate)} }
      #${widgetId} pbpinfobox pbpkomenty { ${getDisplayStyle(config.numOfComments)} }
      #${widgetId} pbptagi { ${getDisplayStyle(config.postCategories)} white-space: nowrap; overflow-x: hidden; cursor: default; margin-bottom: ${config.textSize < 12 ? 3 : config.textSize < 21 ? 4 : 5}px; }
      #${widgetId} pbptagi pbplabel { display: inline-block; border: 1px solid ${config.textColor}; padding: 1px 3px; border-radius: 15%; margin-right: 4px; }
      #${widgetId} pbpfragment { display: block; font-style: italic; text-align: justify; }
      a[title="New Random Posts Widget For Blogger"] { display: inline-block; padding: 1px 2px; }
      a[title="New Random Posts Widget For Blogger"]:hover { padding: 0; }
      a[title="New Random Posts Widget For Blogger"] img { height: 20px; }
      a[title="New Random Posts Widget For Blogger"]:hover img { height: 22px; }
    `;
    document.head.appendChild(style);

    // Fetch posts
    const response = await fetch(`/feeds/posts/summary${config.category}?start-index=1&max-results=150`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const totalPosts = Number(xml.querySelector('openSearch\\:totalResults')?.textContent || 0);
    const entries = xml.querySelectorAll('entry');

    // Generate random post indices
    const postIndices = [];
    while (postIndices.length < config.numberOfPosts && postIndices.length < totalPosts) {
      const index = Math.floor(Math.random() * totalPosts + 1);
      if (!postIndices.includes(index)) {
        postIndices.push(index);
        const postDiv = document.createElement('div');
        postDiv.className = 'pbpRandomPost';
        postDiv.setAttribute('post', `np7${index}s1`);
        widgetDiv.appendChild(postDiv);
      }
    }

    // Render posts
    for (const index of postIndices) {
      if (index <= 150 && entries[index - 1]) {
        renderPost(entries[index - 1], index, config);
      } else {
        await fetchPost(index, config);
      }
    }

    // Add footer link
    const footer = document.createElement('div');
    footer.innerHTML = `
      <a href="https://probloggerplugins.github.io/randomPosts" title="New Random Posts Widget For Blogger" target="_blank">
        <img src="https://1.bp.blogspot.com/-2bRVcNd9ZUE/YP-G_1dv4iI/AAAAAAAAa4/QY44I4q9e98OCcWO6-RmvgJLaQU6vT44QCLcBGAsYHq/s0/kosc.png" alt="Random Posts Blogger Widget">
      </a>
    `;
    widgetDiv.appendChild(footer);
  } catch (error) {
    console.error('Error initializing random posts widget:', error);
  }
};

// Initialize widget
randomPostsWidget();
