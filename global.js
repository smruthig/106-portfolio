function $$(selector, context = document)  {

    return Array.from(context.querySelectorAll(selector))
}

// let navLinks = $$("nav a")

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
// );

// if (currentLink) {
//     // or if (currentLink !== undefined)
//     currentLink.classList.add('current'); // currentLink?.classList.add('current');
// }

let pages = [
    { url: 'index.html', title: 'Home' },
    { url: 'projects/index.html', title: 'Projects' },
    { url: 'contact/index.html', title: 'Contact' },
    { url: 'cv_resume/index.html', title: 'CV' },
    { url: 'https://github.com/jeh027', title: 'Profile' },
];


let nav = document.createElement('nav');
document.body.prepend(nav);

const ARE_WE_HOME = document.body.classList.contains('home');

for (let p of pages) {
    let url = p.url;
    let title = p.title;

    if (!ARE_WE_HOME && !url.startsWith('http')) { // url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
        url = '../' + url;
    } // position matters

    let a = document.createElement('a'); // for this page and this page
    a.href = url;
    a.textContent = title;
    nav.append(a);

    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );

    // ^^^
    // if (a.host === location.host && a.pathname === location.pathname) {
    //     a.classList.add('current');
    // }

    if (url.startsWith('http')) {
        a.toggleAttribute('target', true); // cool functions to remember
        a.setAttribute('target', '_blank');
    }

}

document.body.insertAdjacentHTML(  // why doesn't this work without a <div>
    'afterbegin',
    `
    <div class="color-scheme">
        <label>
            Theme: 
                <select id="set-theme">
                    <option>Light Dark</option>
                    <option>Light</option>
                    <option>Dark</option>
                </select> 
        </label>
    </div>
    `
);

let selectTheme = document.querySelector('#set-theme'); // no default set, so sometimes the selector will be empty

selectTheme.addEventListener('input', function (event) { // input: triggered whenever the value of an input, textarea, or select element is changed
    document.documentElement.style.setProperty('color-scheme', event.target.value.toLowerCase()); // gets color-scheme from html root and modify inline style
    localStorage.colorScheme = event.target.value; // .key = value
});

if ("colorScheme" in localStorage) {
    let user_theme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', user_theme); // this command is repeated twice, can define function that does once
    const select_element = document.getElementById('set-theme'); // remember these document functions (very useful)
    select_element.value = user_theme;
}

let emailForm = document.querySelector('#email-form'); // why form and not the button directly?

emailForm?.addEventListener('submit', function (event) { // conditional to check if reference is empty
    event.preventDefault(); // prevents the default form submission from happening
    const data = new FormData(emailForm);
    
    let new_url = emailForm.action + "?"

    for (let [name, value] of data) { // revamped the url so that it contains the right format
        if (name === "subject") {
            new_url = new_url + name + "=" + encodeURIComponent(value) + "&";
        } else {
            new_url = new_url + name + "=" + encodeURIComponent(value); // yay! it works
        }
    }

    location.href = new_url;

});

// lab 4.
export async function fetchJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        // console.log(response);
        const data = await response.json();
        return data;


    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

// console.log(fetchJSON('../lib/projects.json'))

// function validateProject(project) {
//     return project && project.image && project.title && project.description; // checks if all elements exist
// }

// function validateContainer(container) {
//     return container !== 'null' && container instanceof HTMLElement;
// }

export function renderProjects(projects, containerElement, headingLevel = 'h2') { // project = list, containerElement = where the articles are located
    containerElement.innerHTML = ''; // ensures no duplication

    // if (!validateContainer(containerElement)) {
    //     console.error('Invalid container data');
    //     return;
    // }

    for (let project of projects) {

        // if (!validateProject(project)) {
        //     console.error('Invalid project data');
        //     return;
        // }
    
        const article = document.createElement('article'); // security, reusability, organization
        // header
        const headingElement = document.createElement(headingLevel);
        headingElement.textContent = project.title;
        article.appendChild(headingElement);
        // image
        const imgElement = document.createElement('img');
        imgElement.src = project.image;
        imgElement.alt = project.title;
        article.appendChild(imgElement);
        // description
        const textElement = document.createElement('p');
        textElement.textContent = project.description;
        article.appendChild(textElement);
        // year
        const yearElement = document.createElement('p');
        yearElement.textContent = project.year;
        article.appendChild(yearElement);

        // article.innerHTML = `
        //                         <h3>${project.title}</h3>
        //                         <img src="${project.image}" alt="${project.title}">
        //                         <p>${project.description}</p>
        //                     `;

        containerElement.appendChild(article)
    }
};

export function numberProjects(projects) {
    const titleElement = document.querySelector('.projects-title'); // gets projects-title class and adds text content
    titleElement.textContent = `${projects.length} Projects`;
};

export async function fetchGitHubData(username) { // one of the few APIs left that provides public data without requiring us to authenticate :(
    return fetchJSON(`https://api.github.com/users/${username}`); // perform HTTP request to retrieve data from a server and parse it as JSON
};
