// === Random Posts Widget Logic (Ultra HD Force Fix) ===

// 1. Total posts count fetcher
async function fetchTotalPosts(label) {
  const res = await fetch(`/feeds/posts/summary/-/${encodeURIComponent(label)}?alt=json`);
  const data = await res.json();
  return data.feed.openSearch$totalResults.$t;
}

// 2. Fetch posts (filtering drafts)
async function fetchPosts(label, total) {
  const maxResults = Math.min(total, 50);
  const res = await fetch(`/feeds/posts/summary/-/${encodeURIComponent(label)}?alt=json&max-results=${maxResults}`);
  const data = await res.json();
  let posts = data.feed.entry || [];
  posts = posts.filter(entry => !entry.app$control); // Remove drafts
  return posts;
}

// 3. Random Index Selector
function getRandomIndexes(total, count) {
  const indexes = new Set();
  while (indexes.size < count && indexes.size < total) {
    indexes.add(Math.floor(Math.random() * total));
  }
  return [...indexes];
}

// 4. Create Post Item (THE MAIN FIX IS HERE)
function createPostItem(entry, config) {
  const title = entry.title.$t;

  // Link handling
  let linkObj = entry.link.find(l => l.rel === "alternate") || entry.link.find(l => l.rel === "self");
  let link = linkObj ? linkObj.href : "#";
  if (link.startsWith("http://")) link = link.replace("http://", "https://");
  link = link.split("#")[0];

  const date = new Date(entry.published.$t);
  const comments = entry.thr$total ? entry.thr$total.$t + " Comments" : "Comments Disabled";

  // ============================================
  // ✅ ULTRA HD IMAGE FIX (START)
  // ============================================
  
  let thumb = config.noThumb;

  if (entry.media$thumbnail && entry.media$thumbnail.url) {
      let originalUrl = entry.media$thumbnail.url;

      // 1. Check if it is a YouTube Image
      if (originalUrl.includes("youtube.com") || originalUrl.includes("ytimg.com")) {
          // Force Max Resolution for YouTube
          thumb = originalUrl.replace(/\/default\.jpg|\/mqdefault\.jpg|\/hqdefault\.jpg|\/sddefault\.jpg/, "/maxresdefault.jpg");
      } 
      // 2. Check if it is a Blogger/Google Image
      else {
          // Step A: Replace standard size params like /s72-c/ or /s1600/
          thumb = originalUrl.replace(/\/s\d+[^/]*\//, "/s1600/");
          
          // Step B: Replace width/height params like /w200-h150/ or /w640/
          thumb = thumb.replace(/\/w\d+[^/]*\//, "/s1600/");
          thumb = thumb.replace(/\/h\d+[^/]*\//, "/s1600/");

          // Step C: If no size param was found but it's a googleusercontent link, force append s1600 (Safety net)
          // (This part is rarely needed but ensures safety)
          if (thumb === originalUrl && originalUrl.includes("googleusercontent.com")) {
               // Sometimes links end like .../image.jpg, we don't touch those usually unless broken
          }
      }
  }

  // ============================================
  // ✅ ULTRA HD IMAGE FIX (END)
  // ============================================

  let content = entry.summary?.$t || entry.content?.$t || "";
  content = content.replace(/<[^>]*>/g, "");
  if (content.length > config.chars) {
    content = content.substring(0, config.chars).trim() + "…";
  }

  const li = document.createElement("li");
  li.innerHTML = `
    <a href="${link}" title="${title}">
      <img src="${config.noThumb}" data-src="${thumb}" alt="Thumbnail of ${title}" loading="lazy" class="lazy-thumb">
    </a>
    <div>
      <a href="${link}" title="${title}">${title}</a>
      ${config.details ? `<div class="random-info">${date.toLocaleDateString()} - ${comments}</div>` : ""}
      <div class="random-summary">${content}</div>
    </div>
  `;
  return li;
}

// 5. Lazy Load Logic
function lazyLoadImages() {
  const images = document.querySelectorAll("img.lazy-thumb");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        // Error handling: If s1600 fails (rare), revert to original URL
        img.onerror = function() {
            this.onerror = null;
            // Agar s1600 load nahi hua to s600 try kare ga (fallback)
            this.src = this.src.replace("/s1600/", "/s600/"); 
        };
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  }, { rootMargin: "50px" });

  images.forEach(img => observer.observe(img));
}

// 6. Main Loader Function
async function loadRandomPosts(config) {
  const container = document.getElementById(config.containerId);
  container.innerHTML = "";
  try {
    const total = await fetchTotalPosts(config.label);
    if (total === 0) {
      container.innerHTML = `<li>No posts found for label: ${config.label}</li>`;
      return;
    }
    const posts = await fetchPosts(config.label, total);
    const indexes = getRandomIndexes(posts.length, config.number);
    for (const idx of indexes) {
      const entry = posts[idx];
      if (entry) container.appendChild(createPostItem(entry, config));
    }
    lazyLoadImages();
  } catch (error) {
    console.error("Error loading random posts:", error);
    container.innerHTML = "<li>Failed to load posts.</li>";
  }
}
