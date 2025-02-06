let data = [];
let xScale = null;
let yScale = null;

async function loadData() {
  data = await d3.csv("loc.csv", (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + "T00:00" + row.timezone),
    datetime: new Date(row.datetime),
  }));
  console.log(data);
  debugger;
  displayStats();
  createScatter();
  brushSelector();
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
});

let commits = d3.groups(data, (d) => d.commit);

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;

      let ret = {
        id: commit,
        url: "https://github.com/ch-lum/commit/" + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        // Calculate hour as a decimal for time analysis
        // e.g., 2:30 PM = 14.5
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        // How many lines were modified?
        totalLines: lines.length,
      };

      Object.defineProperty(ret, "lines", {
        value: lines,
        writable: false,
        enumerable: false,
        configurable: false,
        // What other options do we need to set?
        // Hint: look up configurable, writable, and enumerable
      });

      return ret;
    });
}

// 1.3
function displayStats() {
  // Process commits first
  processCommits();

  // Create the dl element
  const dl = d3.select("#stats").append("dl").attr("class", "stats");

  // Add total LOC
  dl.append("dt").html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append("dd").text(data.length);

  // Add total commits
  dl.append("dt").text("Total commits");
  dl.append("dd").text(commits.length);

  // Add more stats as needed...
  dl.append("dt").text("Last commit");
  dl.append("dd").text(commits[0].date.toLocaleDateString());

  dl.append("dt").text("Total Authors");
  dl.append("dd").text(
    commits.map((c) => c.author).filter((a, i, arr) => arr.indexOf(a) === i)
      .length
  );

  dl.append("dt").text("Author of largest commit");
  dl.append("dd").text(
    commits
      .map((c) => [c.author, c.totalLines])
      .sort((a, b) => b[1] - a[1])[0][0]
  );

  let commitCounts = d3.rollup(
    commits,
    (v) => v.length,
    (d) => d.author
  );

  // Find the top contributor
  let topContributor = Array.from(commitCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  // Display top contributor
  dl.append("dt").text("Top contributor");
  dl.append("dd").text(topContributor);
}

// part 2

function createScatter() {
  const width = 1000;
  const height = 600;
  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("overflow", "visible");

  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  const colorScale = d3
    .scaleLinear()
    .domain([0, 12])
    .range(["	#f4ac7b", "#0e3b5c"]);

  const rScale = d3
    .scaleSqrt() // Change only this line
    .domain([minLines, maxLines])
    .range([2, 30]);

  const margin = { top: 10, right: 10, bottom: 30, left: 20 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // Update scales with new ranges
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  const dots = svg.append("g").attr("class", "dots");

  dots
    .selectAll("circle")
    .data(sortedCommits)
    .join("circle")
    .attr("cx", (d) => xScale(d.datetime))
    .attr("cy", (d) => yScale(d.hourFrac))
    .attr("r", (d) => rScale(d.totalLines))
    .style("fill-opacity", 0.7)
    .attr("fill", (d) => colorScale(Math.abs(d.hourFrac - 12)))
    .on("mouseenter", (event, commit) => {
      d3.select(event.currentTarget).style("fill-opacity", 1); // Full opacity on hover
      updateTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on("mouseleave", () => {
      d3.select(event.currentTarget).style("fill-opacity", 0.7); // Restore transparency
      updateTooltipContent({});
      updateTooltipVisibility(false);
    });

  // Add gridlines BEFORE the axes
  const gridlines = svg
    .append("g")
    .attr("class", "gridlines")
    .attr("transform", `translate(${usableArea.left}, 0)`)
    .attr("opacity", 0.2);

  // Create gridlines as an axis with no labels and full-width ticks
  gridlines.call(
    d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width)
  );

  // Create the axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00");

  // Add X axis
  svg
    .append("g")
    .attr("transform", `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  // Add Y axis
  svg
    .append("g")
    .attr("transform", `translate(${usableArea.left}, 0)`)
    .call(yAxis);
}

function updateTooltipContent(commit) {
  const link = document.getElementById("commit-link");
  const date = document.getElementById("commit-date");

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString("en", {
    dateStyle: "full",
  });
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById("commit-tooltip");
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById("commit-tooltip");
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

function brushSelector() {
  const svg = document.querySelector("svg");
  d3.select(svg).call(d3.brush());
  d3.select(svg).selectAll(".dots, .overlay ~ *").raise();
  d3.select(svg).call(d3.brush().on("start brush end", brushed));
}

let brushSelection = null;

function brushed(event) {
  brushSelection = event.selection;
  updateSelection();
  updateSelectionCount();
}

function isCommitSelected(commit) {
  if (!brushSelection) return false;

  const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
  const max = { x: brushSelection[1][0], y: brushSelection[1][1] };
  const x = xScale(commit.date);
  const y = yScale(commit.hourFrac);

  return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}

function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll("circle").classed("selected", (d) => isCommitSelected(d));
}

function updateSelectionCount() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];
  const countElement = document.getElementById("selection-count");
  countElement.textContent = `${
    selectedCommits.length || "No"
  } commits selected`;

  updateLanguageBreakdown(selectedCommits);
  return selectedCommits;
}

function updateLanguageBreakdown(selectedCommits) {
  if (selectedCommits.length === 0) {
    const container = document.getElementById("language-breakdown");
    container.innerHTML = "";
    return;
  }
  const commits = selectedCommits.length ? selectedCommits : window.commits;

  const lines = commits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  // Update DOM with breakdown
  const container = document.getElementById("language-breakdown");
  container.innerHTML = "";

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format(".1~%")(proportion);

    container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
  }

  return breakdown;
}
