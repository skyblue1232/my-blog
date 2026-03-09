ALL_POSTS.sort((a, b) => new Date(b.date) - new Date(a.date));

const PAGE_SIZE = 4;
let currentFilter = 'All';
let loadedCount = 0;
let isLoading = false;

function makeCard(post) {
  return `
    <div class="post-card reveal"
         onclick="location.href='${post.url}'">

      <div class="post-card-tags">
        ${post.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>

      <div class="post-card-title">
        ${post.title}
      </div>

      <div class="post-card-desc">
        ${post.desc}
      </div>

      <div class="post-card-meta">
        <span class="post-card-date">
          ${post.date}
        </span>

        <span class="post-card-read">
          ${calcReadTime(post.date)}
        </span>
      </div>

    </div>
  `;
}

function makeSkeleton() {
  return `<div class="skeleton">
    <div><span class="skel-tag"></span><span class="skel-tag"></span></div>
    <div class="skel-line med"></div>
    <div class="skel-line long"></div>
    <div class="skel-line long"></div>
    <div class="skel-line short" style="margin-top:14px"></div>
  </div>`;
}

// ── Home posts
function renderHomePosts() {
  const container = document.getElementById('home-posts');
  const recent = ALL_POSTS.slice(0, 5);
  container.innerHTML = recent.map(makeCard).join('');
  observeReveal();
}

function calcReadTime(dateString) {
  const now = new Date();
  const postDate = new Date(dateString);

  const diff = now - postDate;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 60) {
    return `${minutes}분 전`;
  }

  if (hours < 24) {
    return `${hours}시간 전`;
  }

  if (days < 30) {
    return `${days}일 전`;
  }

  if (months < 12) {
    return `${months}개월 전`;
  }

  const remainMonths = months % 12;
  return `${years}년 ${remainMonths}개월 전`;
}

// ── All posts with filter + skeleton pagination
function getFilteredPosts() {
  if (currentFilter === 'All') return ALL_POSTS;
  return ALL_POSTS.filter(p => p.tags.includes(currentFilter));
}

function renderFilterBar() {
  const tags = ['All', ...new Set(ALL_POSTS.flatMap(p => p.tags))];
  const bar = document.getElementById('filter-bar');
  bar.innerHTML = tags.map(t =>
    `<button class="filter-btn ${t === currentFilter ? 'active' : ''}" onclick="setFilter('${t}')">${t}</button>`
  ).join('');
}

function setFilter(tag) {
  currentFilter = tag;
  loadedCount = 0;
  document.getElementById('all-posts-list').innerHTML = '';
  document.getElementById('end-label').style.display = 'none';
  renderFilterBar();
  loadNextBatch();
}

function loadNextBatch() {
  if (isLoading) return;
  const filtered = getFilteredPosts();
  if (loadedCount >= filtered.length) {
    document.getElementById('end-label').style.display = 'block';
    return;
  }
  isLoading = true;
  const container = document.getElementById('all-posts-list');

  // show skeletons
  const skelWrap = document.createElement('div');
  skelWrap.className = 'posts-list';
  skelWrap.id = 'skel-wrap';
  const skelCount = Math.min(PAGE_SIZE, filtered.length - loadedCount);
  skelWrap.innerHTML = Array(skelCount).fill(makeSkeleton()).join('');
  container.appendChild(skelWrap);

  setTimeout(() => {
    skelWrap.remove();
    const batch = filtered.slice(loadedCount, loadedCount + PAGE_SIZE);
    batch.forEach(post => {
      container.insertAdjacentHTML('beforeend', makeCard(post));
    });
    loadedCount += batch.length;
    isLoading = false;
    observeReveal();

    if (loadedCount >= filtered.length) {
      document.getElementById('end-label').style.display = 'block';
    }
  }, 700);
}

// ── Tags page
function renderTags() {
  const tagCounts = {};
  ALL_POSTS.forEach(p => p.tags.forEach(t => { tagCounts[t] = (tagCounts[t]||0)+1; }));
  const max = Math.max(...Object.values(tagCounts));
  const grid = document.getElementById('tags-grid');
  grid.innerHTML = Object.entries(tagCounts).map(([tag, count]) => `
    <div class="tag-card reveal" onclick="goToTag('${tag}')">
      <div class="tag-card-name">#${tag}</div>
      <div class="tag-card-count">${count}개의 글</div>
      <div class="tag-card-bar">
        <div class="tag-card-bar-fill" style="width:0%" data-width="${Math.round(count/max*100)}%"></div>
      </div>
    </div>`).join('');
  setTimeout(() => {
    document.querySelectorAll('.tag-card-bar-fill').forEach(el => {
      el.style.width = el.dataset.width;
    });
    observeReveal();
  }, 120);
}

function goToTag(tag) {
  currentFilter = tag;
  loadedCount = 0;
  document.getElementById('all-posts-list').innerHTML = '';
  document.getElementById('end-label').style.display = 'none';
  switchTab('all');
}

// ── Tab switching
function switchTab(tab) {
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + tab);
  target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  observeReveal();

  if (tab === 'all') {
    renderFilterBar();
    if (loadedCount === 0) loadNextBatch();
  }
  if (tab === 'tags') renderTags();
}

// ── Intersection Observer for reveal
function observeReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => io.observe(el));
}

// ── Scroll sentinel for pagination
const sentinel = document.getElementById('scroll-sentinel');
const sentinelObs = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) loadNextBatch();
}, { rootMargin: '200px' });
sentinelObs.observe(sentinel);

function updateStats(){

  // Posts
  const postCount = ALL_POSTS.length;

  // Topics (unique tags)
  const tagSet = new Set();
  ALL_POSTS.forEach(p=>{
    p.tags.forEach(t=>tagSet.add(t));
  });

  const topicCount = tagSet.size;

  document.getElementById("stat-posts").dataset.count = postCount;
  document.getElementById("stat-topics").dataset.count = topicCount;

}

async function loadGithubRepos(){

  try{
    const res = await fetch("https://api.github.com/users/skyblue1232");
    const data = await res.json();

    document.getElementById("stat-repos").dataset.count =
      data.public_repos;

  }catch(e){
    console.log("github api error");
  }

}

// ── Counter animation
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(timer);
    }, 30);
  });
}

// ── Header scroll shadow
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 10);
});

// ── Init
renderHomePosts();

updateStats();
loadGithubRepos();

setTimeout(animateCounters, 400);

observeReveal();