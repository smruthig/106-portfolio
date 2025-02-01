import { fetchJSON, renderProjects, fetchGitHubData} from './global.js';

const projects = await fetchJSON('./lib/projects.json'); // assumes your projects.json file is located in a lib folder relative
const latestProjects = projects.slice(0, 3);

const projectsContainer = document.querySelector('.projects');
renderProjects(latestProjects, projectsContainer, 'h2'); // scoped variables, strict mode, import/export between files, code organization, reusability, maintainability

const githubData = await fetchGitHubData('jeh027'); // returns dictionary; wait for the process to complete before proceeding
// console.log(githubData);

const profileStats = document.querySelector('#profile-stats');
if (profileStats) { // if the container exists, dynamically update its content; ensures that we don't run into errors when trying to manipulate the DOM
    // readability, simplicity, easy to insert dynamic content
    // "<dl> description list is used to group a set of terms and their descriptions; <dt> description term; <dd> description detail
    profileStats.innerHTML = `
          <dl>
            <dt>Public Repos</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers</dt><dd>${githubData.followers}</dd>
            <dt>Following</dt><dd>${githubData.following}</dd>
          </dl>
      `;
};



