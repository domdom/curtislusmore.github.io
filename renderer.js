const AVAILABLE_REACTIONS = [
    ['+1', '👍'],
    ['-1', '👎'],
    ['laugh', '😆'],
    ['hooray', '🎉'],
    ['confused', '😕'],
    ['heart', '❤']
];

function elem(tag, body, attrs) {
    const el = document.createElement(tag);

    function append(child) {
        if (child === null) {
            return;
        } else if (typeof(child) === 'string') {
            el.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement || child instanceof Text) {
            el.appendChild(child);
        } else if (typeof(child[Symbol.iterator]) === 'function') {
            for (const item of child) {
                append(item);
            }
        } else if (child !== null) {
            el.appendChild(document.createTextNode(child));
        }
    }

    for (const key in attrs) {
        const value = attrs[key];
        const valueString = Array.isArray(value) ? value.join(' ') : value;
        if (key === 'class') {
            el.className = valueString;
        } else {
            el.setAttribute(key, valueString);
        }
    }

    append(body);

    return el;
}

class Renderer {
    constructor(container) {
        this.container = container;
    }

    renderPosts(posts) {
        for (const post of posts) {
            this.container.appendChild(this.renderPost(post));
        }
    }

    renderPost({number, title, body_html, user, labels, created_at, reactions, comments}) {
        return elem('div',
            [
                this.renderTitle(title),
                this.renderDetails(user, created_at, labels),
                this.renderBody(body_html),
                this.renderReactions(reactions),
                this.renderComments(comments)
            ],
            {
                'id': `post-${number}`,
                'class': 'post'
            }
        );
    }

    renderTitle(title) {
        return elem('h2', title, { 'class': 'post-title' });
    }

    renderDetails(user, time, labels) {
        return elem('ul',
            [
                this.renderAuthor(user),
                this.renderTime(time),
                this.renderLabels(labels)
            ],
            { 'class': 'post-details' }
        );
    }

    renderBody(body_html) {
        var body = elem('div', null, { 'class': 'post-body' });
        body.innerHTML = body_html;
        return body;
    }

    renderReactions(reactions) {
        function renderReaction([text, disp]) {
            const count = reactions[text];
            return count === 0 ? '' : elem('li', [disp, count], { 'class': ['reaction', `reaction-${text}`] });
        }
        return elem('ul', AVAILABLE_REACTIONS.map(renderReaction), { 'class': 'post-reactions' });
    }

    renderComments(comments) {
        const self = this;
        function renderComment({user, created_at, body_html}) {
            return elem('div',
                [
                    self.renderDetails(user, created_at, []),
                    self.renderBody(body_html),
                ],
                { 'class': 'post-comment' }
            );
        }
        return elem('div', comments.map(renderComment), { 'class': 'post-comments' });
    }

    renderAuthor(user) {
        return elem('li', this.renderUser(user), { 'class': 'post-author' });
    }

    renderUser(user) {
        return elem('span', user.login, { 'class': 'user' });
    }

    renderTime(time) {
        return elem('li', new Date(time).toLocaleString(), { 'class': 'post-time' });
    }

    renderLabels(labels) {
        return labels.length === 0 ? null : elem('li', labels.map(this.renderLabel), { 'class': 'post-labels' });
    }

    renderLabel(label) {
        return elem('a',
            label.name,
            {
                'class': 'label',
                'style': `border-color: #${label.color}`,
                'href': `?labels=${label.name}`
            }
        );
    }
}