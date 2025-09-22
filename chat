<script>
// Blogger Random Posts Widget (Optimized SEO + Lazy Loading)
// Author: Custom Version

// Generate random ID for widget
const generateWidgetId = () =>
  Array.from({ length: 12 }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
  ).join("");

// Utility: font-family mapping
const getFontFamily = (font) => {
  const fonts = {
    "Georgia": "Georgia, serif",
    "Arial": "Arial, Helvetica, sans-serif",
    "Times New Roman": '"Times New Roman", Times, serif',
    "Verdana": "Verdana, Geneva, sans-serif"
  };
  return fonts[font] || font;
};

// Utility: element display
const displayStyle = (v) => (v === "none" ? "display:none;" : "display:inline-block;");

// Render single post
const renderPost = (post, index, config) => {
  const data = {
    link: post.querySelector('link[rel="alternate"]')?.href || "/",
    title: post.querySelector("title")?.textContent || "No Title",
    date: post.querySelector("published")?.textContent?.substring(0, 10) || "",
    thumbnail: post.querySelector("media\\:thumbnail")?.getAttribute("url") ||
      "https://via.placeholder.com/150x100?text=No+Image",
    comments: Number(post.querySelector("thr\\:total")?.textContent) || 0,
    author: post.querySelector("author name")?.textContent || "Anonymous",
    excerpt: config.excerptLength > 0 && post.querySelector("summary")
      ? post.querySelector("summary").textContent.replace(/<[^>]+>/g, "").substring(0, config.excerptLength) + "..."
      : "",
    categories: Array.from(post.querySelectorAll("category")).map(c => c.getAttribute("term"))
  };

  const postDiv = document.querySelector(`.rpPost[post-id="${index}"]`);
  if (!postDiv) return;

  postDiv.innerHTML = `
    <div class="rpItem">
      <a href="${data.link}" title="${data.title}" target="_blank">
        <img src="${data.thumbnail}" loading="lazy"
             style="width:${config.thumbnailSize}px; border-radius:${config.thumbnailRounding};
             ${config.thumbnail === "left" ? "float:left;margin:0 5px 5px 0;" :
               config.thumbnail === "right" ? "float:right;margin:0 0 5px 5px;" :
               "display:block;margin:0 auto;"}"
             alt="${data.title}">
        <span class="rpTitle" style="display:${config.postTitle === "none" ? "none" : "block"};">
          ${data.title}
        </span>
      </a>
      <div class="rpMeta">
        <span class="rpAuthor" style="${displayStyle(config.postAuthor)}">👤 ${data.author}</span>
        <span class="rpDate" style="${displayStyle(config.publishDate)}">📅 ${data.date}</span>
        <span class="rpComments" style="${displayStyle(config.numOfComments)}">💬 ${data.comments}</span>
      </div>
      <div class="rpCats" style="${displayStyle(config.postCategories)}">
        ${data.categories.map(c => `<span class="rpCat">${c}</span>`).join(" ")}
      </div>
      <p class="rpExcerpt">${data.excerpt}</p>
    </div>
  `;
};

// Fetch posts
const fetchPost = async (index, config) => {
  const res = await fetch(`/feeds/posts/summary?start-index=${index}&max-results=1`);
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, "text/xml");
  const post = xml.querySelector("entry");
  if (post) renderPost(post, index, config);
};

// Initialize widget
const randomPostsWidget = async () => {
  try {
    const script = [...document.getElementsByTagName("script")]
      .find(s => s.src.includes("randomPosts.js"));
    const container = script.parentNode;

    const widgetId = generateWidgetId();
    const widgetDiv = document.createElement("div");
    widgetDiv.id = widgetId;
    container.insertBefore(widgetDiv, container.firstChild);

    const config = {
      numberOfPosts: +container.getAttribute("numberOfPosts") || 5,
      category: container.getAttribute("category") ? "/-/" + container.getAttribute("category") : "",
      titleFont: getFontFamily(container.getAttribute("titleFont") || "Arial"),
      textFont: getFontFamily(container.getAttribute("textFont") || "Georgia"),
      titleSize: +container.getAttribute("titleSize") || 16,
      textSize: +container.getAttribute("textSize") || 13,
      borderWidth: +container.getAttribute("borderWidth") || 1,
      borderStyle: container.getAttribute("borderStyle") || "solid",
      borderColor: container.getAttribute("borderColor") || "#333",
      textColor: container.getAttribute("textColor") || "#222",
      thumbnail: container.getAttribute("thumbnail") || "left",
      thumbnailSize: +container.getAttribute("thumbnailSize") || 70,
      thumbnailRounding: container.getAttribute("thumbnailRounding") || "10%",
      excerptLength: +container.getAttribute("excerptLength") || 150,
      postTitle: container.getAttribute("postTitle") || "block",
      postAuthor: container.getAttribute("postAuthor") || "block",
      publishDate: container.getAttribute("publishDate") || "block",
      postCategories: container.getAttribute("postCategories") || "block",
      numOfComments: container.getAttribute("numOfComments") || "block",
    };

    // Add CSS
    const style = document.createElement("style");
    style.textContent = `
      #${widgetId} { font-family:${config.textFont}; font-size:${config.textSize}px; color:${config.textColor}; }
      #${widgetId} .rpItem { border-bottom:${config.borderWidth}px ${config.borderStyle} ${config.borderColor}; padding:6px; overflow:hidden; }
      #${widgetId} .rpItem:first-child { border-top:${config.borderWidth}px ${config.borderStyle} ${config.borderColor}; }
      #${widgetId} .rpTitle { font-family:${config.titleFont}; font-size:${config.titleSize}px; font-weight:bold; color:${config.textColor}; }
      #${widgetId} .rpTitle:hover { text-decoration:underline; }
      #${widgetId} .rpMeta { font-size:${config.textSize - 1}px; margin:4px 0; }
      #${widgetId} .rpCats .rpCat { border:1px solid ${config.textColor}; padding:1px 4px; border-radius:3px; margin-right:3px; font-size:${config.textSize - 1}px; }
      #${widgetId} .rpExcerpt { font-style:italic; margin-top:4px; }
    `;
    document.head.appendChild(style);

    // Fetch posts list
    const res = await fetch(`/feeds/posts/summary${config.category}?start-index=1&max-results=150`);
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");
    const total = +xml.querySelector("openSearch\\:totalResults")?.textContent || 0;
    const entries = xml.querySelectorAll("entry");

    // Random indices
    const indices = [];
    while (indices.length < config.numberOfPosts && indices.length < total) {
      const i = Math.floor(Math.random() * total + 1);
      if (!indices.includes(i)) indices.push(i);
    }

    indices.forEach(i => {
      const div = document.createElement("div");
      div.className = "rpPost";
      div.setAttribute("post-id", i);
      widgetDiv.appendChild(div);
    });

    for (const i of indices) {
      if (i <= 150 && entries[i - 1]) {
        renderPost(entries[i - 1], i, config);
      } else {
        await fetchPost(i, config);
      }
    }
  } catch (err) {
    console.error("Widget error:", err);
  }
};

randomPostsWidget();

</script>
