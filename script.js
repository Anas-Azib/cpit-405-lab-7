// ---------- Configuration ----------
// Paste your Unsplash Access Key here (https://unsplash.com/developers)
const ACCESS_KEY = "y63NQ8N6jDins-pputosR3SLRzkTFg2-ZArLGZ9hluM";
const API_URL = "https://api.unsplash.com/search/photos";
const PER_PAGE = 12;

// ---------- DOM elements ----------
const searchInput = document.getElementById("searchInput");
const xhrBtn = document.getElementById("xhrBtn");
const promiseBtn = document.getElementById("promiseBtn");
const asyncBtn = document.getElementById("asyncBtn");
const results = document.getElementById("results");
const message = document.getElementById("message");
const buttons = [xhrBtn, promiseBtn, asyncBtn];

// ---------- Helpers ----------
function buildUrl(query) {
    return API_URL + "?query=" + encodeURIComponent(query) + "&per_page=" + PER_PAGE;
}

function showMessage(text, isError) {
    message.textContent = text;
    message.classList.toggle("error", Boolean(isError));
}

function setLoading(isLoading) {
    for (const button of buttons) {
        button.disabled = isLoading;
    }
}

// Returns the trimmed search term, or null if the input is empty
function getQuery() {
    const query = searchInput.value.trim();
    if (query === "") {
        showMessage("Please type something to search for.", true);
        searchInput.focus();
        return null;
    }
    return query;
}

function startSearch(method) {
    results.replaceChildren();
    showMessage("Searching using " + method + "...");
    setLoading(true);
}

function showError(error) {
    showMessage("Something went wrong: " + error.message, true);
    setLoading(false);
}

// Creates the image cards dynamically using the DOM API
function renderPhotos(data, method) {
    results.replaceChildren();

    if (!data.results || data.results.length === 0) {
        showMessage("No images found.");
        setLoading(false);
        return;
    }

    for (const photo of data.results) {
        const figure = document.createElement("figure");
        figure.className = "photo";

        const link = document.createElement("a");
        link.href = photo.links.html;
        link.target = "_blank";
        link.rel = "noopener";

        const img = document.createElement("img");
        img.src = photo.urls.small;
        img.alt = photo.alt_description || "Unsplash photo";
        img.loading = "lazy";
        link.appendChild(img);

        const caption = document.createElement("figcaption");

        const description = document.createElement("p");
        description.className = "description";
        description.textContent = photo.description || photo.alt_description || "Untitled";

        const author = document.createElement("p");
        author.className = "author";
        author.textContent = "Photo by " + photo.user.name;

        caption.append(description, author);
        figure.append(link, caption);
        results.appendChild(figure);
    }

    showMessage("Showing " + data.results.length + " of " + data.total + " results (loaded using " + method + ").");
    setLoading(false);
}

// ---------- 1) XMLHttpRequest ----------
function searchUsingXHR() {
    const query = getQuery();
    if (query === null) return;
    startSearch("XHR");

    const xhr = new XMLHttpRequest();
    xhr.open("GET", buildUrl(query));
    xhr.setRequestHeader("Authorization", "Client-ID " + ACCESS_KEY);

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status === 200) {
            renderPhotos(JSON.parse(xhr.responseText), "XHR");
        } else if (xhr.status !== 0) {
            showError(new Error("HTTP " + xhr.status));
        }
    };

    xhr.onerror = function () {
        showError(new Error("Network error"));
    };

    xhr.send();
}

// ---------- 2) Fetch with Promises ----------
function searchUsingFetchPromises() {
    const query = getQuery();
    if (query === null) return;
    startSearch("Fetch with Promises");

    fetch(buildUrl(query), {
        method: "GET",
        headers: { Authorization: "Client-ID " + ACCESS_KEY }
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            renderPhotos(data, "Fetch with Promises");
        })
        .catch(function (error) {
            showError(error);
        });
}

// ---------- 3) Fetch with Async/Await ----------
async function searchUsingFetchAsyncAwait() {
    const query = getQuery();
    if (query === null) return;
    startSearch("Fetch with Async/Await");

    try {
        const response = await fetch(buildUrl(query), {
            method: "GET",
            headers: { Authorization: "Client-ID " + ACCESS_KEY }
        });
        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }
        const data = await response.json();
        renderPhotos(data, "Fetch with Async/Await");
    } catch (error) {
        showError(error);
    }
}

// ---------- Events ----------
// Mouse events
xhrBtn.addEventListener("click", searchUsingXHR);
promiseBtn.addEventListener("click", searchUsingFetchPromises);
asyncBtn.addEventListener("click", searchUsingFetchAsyncAwait);

// Keyboard event: pressing Enter searches using async/await
searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !asyncBtn.disabled) {
        searchUsingFetchAsyncAwait();
    }
});
