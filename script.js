const items = [
  "Apple", "Apricot", "Application", "Banana", "Bandana", "Blueberry",
  "Blackberry", "Cherry", "Chocolate", "Coconut", "Coffee", "Computer",
  "Keyboard", "Keychain", "Monitor", "Mouse", "Orange", "Pineapple",
  "Strawberry", "Watermelon", "Wireless Mouse", "Wireless Keyboard",
  "Programming", "JavaScript", "Python", "React", "GitHub", "Google Chrome"
];

const input = document.getElementById("searchInput");
const dropdown = document.getElementById("dropdown");
const list = document.getElementById("resultsList");
const emptyState = document.getElementById("emptyState");
const clearBtn = document.getElementById("clearBtn");
const selected = document.getElementById("selected");

let results = [];
let activeIndex = -1;

function levenshtein(a, b) {
  const prev = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        cur[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    for (let j = 0; j < cur.length; j++) prev[j] = cur[j];
  }
  return prev[b.length];
}

// Scoring:
// 1. Exact full match
// 2. Exact prefix match
// 3. Word-prefix match
// 4. Fuzzy similarity
// 5. Alphabetical tie-breaker
function scoreItem(item, query) {
  const text = item.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return { score: 0, type: "default", distance: 0 };

  if (text === q) return { score: 10000, type: "exact", distance: 0 };
  if (text.startsWith(q)) return { score: 9000 - text.length, type: "prefix", distance: 0 };

  const words = text.split(/\s+/);
  if (words.some(word => word.startsWith(q))) {
    return { score: 8000 - text.length, type: "word-prefix", distance: 0 };
  }

  const distance = Math.min(
    levenshtein(q, text),
    ...words.map(word => levenshtein(q, word))
  );
  const maxLen = Math.max(q.length, text.length);
  const similarity = 1 - distance / maxLen;

  // Reject very weak fuzzy matches.
  if (distance > Math.max(2, Math.floor(q.length * 0.6)) && similarity < 0.45) {
    return null;
  }

  return { score: 5000 + similarity * 1000 - distance * 100, type: "fuzzy", distance };
}

function search(query) {
  const q = query.trim();

  if (!q) {
    results = items.map(item => ({ item, info: { type: "default", score: 0 } }));
  } else {
    results = items
      .map(item => ({ item, info: scoreItem(item, q) }))
      .filter(x => x.info)
      .sort((a, b) => b.info.score - a.info.score || a.item.localeCompare(b.item))
      .slice(0, 8);
  }

  activeIndex = -1;
  render(q);
}

function highlight(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp("(" + escaped + ")", "ig");
  return text.replace(re, "<mark>$1</mark>");
}

function label(type) {
  if (type === "exact") return "Exact match";
  if (type === "prefix") return "Prefix match";
  if (type === "word-prefix") return "Word prefix";
  if (type === "fuzzy") return "Fuzzy match";
  return "";
}

function render(query) {
  list.innerHTML = "";
  emptyState.classList.toggle("hidden", results.length !== 0);

  results.forEach(({ item, info }, index) => {
    const li = document.createElement("li");
    li.className = "result";
    li.setAttribute("role", "option");
    li.dataset.index = index;

    li.innerHTML = `
      <div>
        <div class="name">${highlight(item, query)}</div>
        <div class="meta">${info.type === "fuzzy" ? "Typo-tolerant result" : "Prioritized result"}</div>
      </div>
      ${label(info.type) ? `<span class="badge">${label(info.type)}</span>` : ""}
    `;

    li.addEventListener("mousedown", e => {
      e.preventDefault();
      selectItem(index);
    });
    list.appendChild(li);
  });

  dropdown.classList.remove("hidden");
  input.setAttribute("aria-expanded", "true");
}

function updateActive() {
  [...list.children].forEach((el, i) => el.classList.toggle("active", i === activeIndex));
  if (activeIndex >= 0 && list.children[activeIndex]) {
    input.setAttribute("aria-activedescendant", `result-${activeIndex}`);
    list.children[activeIndex].scrollIntoView({ block: "nearest" });
  } else {
    input.removeAttribute("aria-activedescendant");
  }
}

function selectItem(index) {
  if (!results[index]) return;
  input.value = results[index].item;
  selected.textContent = `Selected: ${results[index].item}`;
  dropdown.classList.add("hidden");
  input.setAttribute("aria-expanded", "false");
  activeIndex = -1;
}

input.addEventListener("input", () => search(input.value));

input.addEventListener("keydown", e => {
  if (dropdown.classList.contains("hidden")) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex = Math.min(activeIndex + 1, results.length - 1);
    updateActive();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex = Math.max(activeIndex - 1, 0);
    updateActive();
  } else if (e.key === "Enter" && activeIndex >= 0) {
    e.preventDefault();
    selectItem(activeIndex);
  } else if (e.key === "Escape") {
    dropdown.classList.add("hidden");
    input.setAttribute("aria-expanded", "false");
  }
});

input.addEventListener("focus", () => search(input.value));

clearBtn.addEventListener("click", () => {
  input.value = "";
  selected.textContent = "No item selected";
  search("");
  input.focus();
});

document.addEventListener("click", e => {
  if (!e.target.closest(".search-wrap") && !e.target.closest(".dropdown")) {
    dropdown.classList.add("hidden");
    input.setAttribute("aria-expanded", "false");
  }
});

search("");
