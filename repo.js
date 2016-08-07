function* fetch(baseUrl, relUrl = '') {
    function findNextLink(linkHeader) {
        const linkPattern = /<([^<>]+)>; rel="([^"]+)"/g;
        while ((match = linkPattern.exec(linkHeader)) !== null) {
            if (match[2] === 'next') {
                return match[1];
            }
        }
        return null;
    }

    function fetchArray(url) {
        const req = new XMLHttpRequest();
        req.open('GET', url, false);
        req.setRequestHeader('Accept', 'application/vnd.github.squirrel-girl-preview,application/vnd.github.VERSION.html+json');
        req.send();
        const link = findNextLink(req.getResponseHeader('link'));
        return [link, JSON.parse(req.responseText)];
    }

    var url = baseUrl + relUrl;
    do {
        [url, items] = fetchArray(url);
        for (const item of items) {
            yield item;
        }
    } while (url !== null);
}

class Repo {
    constructor(owner, repo) {
        this.baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
    }

    *loadPosts({
        filter = 'all',
        state = 'all',
        labels = [],
        sort = 'created',
        direction = 'desc',
        since = '1900-01-01T00:00:00Z'
    } = {}) {
        filter = encodeURI(filter);
        state = encodeURI(state);
        labels = Array.isArray(labels) ? labels.map(encodeURI).join(',') : encodeURI(labels);
        sort = encodeURI(sort);
        direction = encodeURI(direction);
        since = encodeURI(since);
        const posts = fetch(
            this.baseUrl,
            `/issues?filter=${filter}&state=${state}&labels=${labels}&sort=${sort}&direction=${direction}&since=${since}`
        );
        for (const post of posts) {
            post.comments = this.loadComments(post.number)
            yield post;
        }
    }

    loadComments(number) {
        return fetch(
            this.baseUrl,
            `/issues/${number}/comments`
        );
    }
}