import { fetchJSON, renderProjects, numberProjects } from '../global.js';
// import * as d3 from 'd3';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');
numberProjects(projects);

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50); // creates the svg points to make circle; does the heavy work for us!
// let arc = arcGenerator({
//     startAngle: 0,
//     endAngle: 2 * Math.PI,
// }); // to create full circle, not needed anymore


// making two arcs for two slices
// let data = [1, 2];
// let total = 0;

// for (let d of data) {
//   total += d;
// }

// let angle = 0;
// let arcData = [];

// for (let d of data) {
//   let endAngle = angle + (d / total) * 2 * Math.PI;
//   arcData.push({ startAngle: angle, endAngle });
//   angle = endAngle;
// }

// let arcs = arcData.map((d) => arcGenerator(d)); // loop through arcData into arcGenerator; generates the corresponding arc path data


// let projects = await fetchJSON('./lib/projects.json'); already declared
// using own personal project data
let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
);

let pieData = rolledData.map(([year, count]) => {
    return { value: count, label: year };
});


let sliceGenerator = d3.pie().value((d) => d.value); // uses only the values, not labels
let arcData = sliceGenerator(pieData);
let arcs = arcData.map((d) => arcGenerator(d));

// creating slices by dynamically adding paths (come on bruh)
let svg = document.querySelector("svg");
let legend = document.querySelector(".legend");
let colors = d3.scaleOrdinal(d3.schemeTableau10); // ordinal and sequential color scales to generate colors based on data
// step 5
export let selectedIndex = -1;

for (let i = 0; i < arcs.length; i++) {
    const svgNS = "http://www.w3.org/2000/svg"; // to create <path> tag
    let path = document.createElementNS(svgNS, "path");
    
    path.setAttribute("d", arcs[i]);
    path.setAttribute("fill", colors(i));

    path.addEventListener('click', function() {
        selectedIndex = selectedIndex === i ? -1 : i; // must be before to reset and because selectedIndex = -1, the slices don't match selectedIndex

        document.querySelectorAll('path').forEach((p, i) => { // path, index
            if (i === selectedIndex) {
                p.classList.add('selected');
            } else {
                p.classList.remove('selected');
            }
        })

        if (selectedIndex !== -1) { // step 5.3; this is pretty sick!
            let selectedYear = pieData[selectedIndex].label
            let filteredProjects = projects.filter(project => project.year === selectedYear);
            renderProjects(filteredProjects, projectsContainer, 'h2');
        } else {
            renderProjects(projects, projectsContainer, 'h2'); // i don't think number of projects should change (numberProjects(projects);)
        }
    });

    // Create a list item
    let li = document.createElement('li');
    li.style.setProperty('--color', colors(i));

    // Create the swatch span
    let swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = colors(i);
    
    // Append the swatch to the list item
    li.appendChild(swatch);

    // Set the label and value
    li.innerHTML += `${pieData[i].label} <em>(${pieData[i].value})</em>`;

    legend.appendChild(li);
    svg.appendChild(path);
};



// confusing, covered too quickly need to see this through
let query = '';

function setQuery(newQuery) {
    query = newQuery;
    updateFilteredProjects(newQuery); // unsure what the dictionary {} is for
}
  
let searchInput = document.getElementById('searchInput');

searchInput.addEventListener('change', (event) => {
    setQuery(event.target.value);
});

function updateFilteredProjects(query) {
    let filteredProjects = projects.filter((project) => {
        
        let values = Object.values(project).join('\n').toLowerCase(); // Takes all the values, joins them into a single string, converts the entire string to lowercase        
        return values.includes(query.toLowerCase())
    
    });   
}

