const pastels = ["#ffb482", "#b1de69", "#f88178", "#8593ee", "#f37ca5", "#80e0ed"]
function randomPastel(tag) {
    const hash = [...tag].reduce((acc, c) => acc + c.charCodeAt(0), 0)
    return pastels[hash % pastels.length]
}

function createCard(pkg) {
    const template = document.getElementById("package-template")
    const card = template.cloneNode(true)
    card.classList.remove("hidden")
    const link = card.querySelector(".lib-link")
    const desc = card.querySelector(".lib-desc")
    const version = card.querySelector(".lib-version")
    const date = card.querySelector(".lib-date")
    const author = card.querySelector(".lib-author")
    const tagBox = card.querySelector(".tags")

    link.href = pkg.homepage || pkg.url
    link.textContent = pkg.name
    desc.textContent = pkg.description || "No description provided."
    version.textContent = pkg.version || "?"

    const secondsAgo = Math.floor(Date.now() / 1000) - pkg.tagger.date.seconds
    date.textContent = formatTimeAgo(secondsAgo)

    const username = pkg.name.split("/")[0]
    const fullName = pkg.author?.name || pkg.tagger?.name || username

    author.innerHTML = `<span class="text-yellow-400 cursor-pointer hover:underline">${username}</span><span class="text-zinc-400 text-xs"> (${fullName})</span>`
    author.onclick = () => doSearch(`author:${username}`)

    tagBox.innerHTML = ""
    const tags = pkg.tags || []
    tags.forEach(tag => {
        const span = document.createElement("span")
        span.textContent = tag
        span.className = "text-xs px-2 py-1 rounded-full cursor-pointer hover:underline text-black"
        span.style.backgroundColor = randomPastel(tag)
        span.onclick = () => doSearch(`tag:${tag}`)
        tagBox.appendChild(span)
    })

    return card
}

function formatTimeAgo(seconds) {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(seconds / 3600)
    const days = Math.floor(seconds / 86400)
    const weeks = Math.floor(seconds / (86400 * 7))
    const months = Math.floor(seconds / (86400 * 30))
    const years = Math.floor(seconds / (86400 * 365))

    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
    if (weeks < 5) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`
    return `${years} year${years !== 1 ? 's' : ''} ago`
}

function doSearch(query) {
    const input = document.getElementById("search-input")
    input.value = query
    search()
}

async function search() {
    const query = document.getElementById("search-input").value.trim() || "*"
    const container = document.getElementById("results")
    container.innerHTML = "<p class='text-zinc-400'>Searching...</p>"
    try {
        const res = await fetch(`https://lit.luvit.io/search/${encodeURIComponent(query)}`)
        const data = await res.json()
        container.innerHTML = ""
        const matches = data.matches || {}
        if (!Object.keys(matches).length) {
            container.innerHTML = "<p class='text-zinc-500'>No packages found.</p>"
            return
        }
        for (const name in matches) {
            const card = createCard(matches[name])
            container.appendChild(card)
        }
    } catch (e) {
        container.innerHTML = `<p class='text-red-500'>Error: ${e.message}</p>`
    }
}

document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const query = document.getElementById("search-input").value.trim();
    if (query) search(query);
});