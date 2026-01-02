// === Random Posts Widget Logic (s1600 High Quality Fix) ===

// Total posts count
async function fetchTotalPosts(label) {
  const res = await fetch(`/feeds/posts/summary/-/${encodeURIComponent(label)}?alt=json`);
  const data = await res.json();
  return data.feed.openSearch$totalResults.$t;
}

// Fetch posts (filter drafts)
async function fetchPosts(label, total) {
  const maxResults = Math.min(total, 50);
  const res = await fetch(`/feeds/posts/summary/-/${encodeURIComponent(label)}?alt=json&max-results=${maxResults}`);
  const data = await res.json();
  let posts = data.feed.entry || [];
  posts = posts.filter(entry => !entry.app$control); // Remove drafts
  return posts;
}

// Random index selection
function getRandomIndexes(total, count) {
  const indexes = new Set();
  while (indexes.size < count && indexes.size < total) {
    indexes.add(Math.floor(Math.random() * total));
  }
  return [...indexes];
}

// Create one post item
function createPostItem(entry, config) {
  const title = entry.title.$t;

  // Get correct post link
  let linkObj = entry.link.find(l => l.rel === "alternate") || entry.link.find(l => l.rel === "self");
  let link = linkObj ? linkObj.href : "#";

  if (link.startsWith("http://")) link = link.replace("http://", "https://");
  link = link.split("#")[0];

  const date = new Date(entry.published.$t);
  const comments = entry.thr$total ? entry.thr$total.$t + " Comments" : "Comments Disabled";

  // === ✅ IMAGE TRICK FROM YOUR CODE (s1600) ===
  let thumb = entry.media$thumbnail?.url || config.noThumb;

  // Ye wo logic hai jo apnay di hai:
  // Ye code har qisam k size (s72, s600, w100 etc) ko pakar kar s1600 kar de ga
  // s1600 = Full Original Quality
  thumb = thumb.replace(/\/s[0-9]+.*?\//, "/s1600/");
  
  // Extra safety: Agar kahin s72-c bach gya to usay bhi replace kr do
  if (thumb.includes("/s72-c/")) { 
      thumb = thumb.replace("/s72-c/", "/s1600/"); 
  }

  // YouTube thumbnails k liye bhi quality behtar kar di hai
  if (thumb.includes("img.youtube.com") || thumb.includes("i.ytimg.com")) {
      thumb = thumb.replace("/default.jpg", "/mqdefault.jpg");
  }
  // ===============================================

  let content = entry.summary?.$t || entry.content?.$t || "";
  content = content.replace(/<[^>]*>/g, "");
  if (content.length > config.chars) {
    content = content.substring(0, config.chars).trim();
    const lastSpace = content.lastIndexOf(" ");
    if (lastSpace !== -1) {
      content = content.substring(0, lastSpace) + "…";
    } else {
      content = content.substring(0, config.chars) + "…";
    }
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

// Lazy loading thumbnails
function lazyLoadImages() {
  const images = document.querySelectorAll("img.lazy-thumb");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  }, { rootMargin: "50px" });

  images.forEach(img => observer.observe(img));
}

// Load posts into one widget
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
    container.innerHTML = "<li>Failed to load posts. Please try again later.</li>";
  }
}
