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

let selectTheme = document.querySelector('#set-theme');

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