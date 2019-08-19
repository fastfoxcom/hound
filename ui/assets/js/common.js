export function ExpandVars(template, values) {
    for (var name in values) {
        template = template.replace('{' + name + '}', values[name]);
    }
    return template;
};

export function UrlToRepo(repo, path, line, rev) {
    var url = repo.url.replace(/\.git$/, ''),
        pattern = repo['url-pattern'],
        filename = path.substring(path.lastIndexOf('/') + 1),
        anchor = line ? ExpandVars(pattern.anchor, { line : line, filename : filename }) : '';

    // Determine if the URL passed is a GitHub wiki
    var wikiUrl = /\.wiki$/.exec(url);
    if (wikiUrl) {
        url = url.replace(/\.wiki/, '/wiki')
        path = path.replace(/\.md$/, '')
        anchor = '' // wikis do not support direct line linking
    }

    // Hacky solution to fix _some more_ of the 404's when using SSH style URLs.
    // This works for both github style URLs (git@github.com:username/Foo.git) and
    // bitbucket style URLs (ssh://hg@bitbucket.org/username/Foo).

    // Regex explained: Match either `git` or `hg` followed by an `@`.
    // Next, slurp up the hostname by reading until either a `:` or `/` is found.
    // Finally, grab all remaining characters.
    var sshParts = /(git|hg)@(.*?)(:|\/)(.*)/.exec(url);

    // Another hack added for phabricator style git urls.
    // ssh://phabricator-git@phabricator.broex.net/diffusion/BH/bhishma.git
    // https://phabricator.broex.net/diffusion/BH/bhishma/browse/master/cron/createAdhocOpenHouse.js$21
    // https://phabricator.broex.net/diffusion/BH/browse/master/cron/createAdhocOpenHouse.js$21
    if (url.includes('phabricator') && sshParts) {
        const urlParts = sshParts[4].split("/");
        url = '//' + sshParts[2] + '/' + urlParts[0] + '/' + urlParts[1];
    } else if (sshParts) {
        url = '//' + sshParts[2] + '/' + sshParts[4];
    }

    // I'm sure there is a nicer React/jsx way to do this:
    return ExpandVars(pattern['base-url'], {
        url : url,
        path: path,
        rev: rev,
        anchor: anchor
    });
}
