import { app } from 'electron';
import GitHub from 'github-api';

const gh = new GitHub();
const repo = gh.getRepo('PartyLich', 'lossless-cut');

async function checkNewVersion() {
  try {
    // From API: https://developer.github.com/v3/repos/releases/#get-the-latest-release
    // View the latest published full release for the repository.
    // Draft releases and prereleases are not returned by this endpoint.
    const { tagName } = (await repo.getRelease('latest')).data;
    const currentVersion = app.getVersion();

    console.log('Current version', currentVersion);
    console.log('Newest version', tagName);

    if (tagName !== `v${currentVersion}`) return tagName;
    return undefined;
  } catch (e) {
    console.error('Failed to check github version');
    return undefined;
  }
}

export { checkNewVersion };
