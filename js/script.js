// Set dimensions for scatterplot, histograms, and choropleth maps
const width = 600, height = 400, margin = { top: 50, right: 30, bottom: 50, left: 60 };
var globalselectedAttr = "percent_no_heath_insurance"; // Default selected attribute
var yAxisAttribute = "percent_no_heath_insurance"; // Default Y-axis attribute
// Create the SVG container
const svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

let geoData, csvData; // Declare the variables globally

// Load CSV data and GeoJSON for US counties from the new URL
Promise.all([
    d3.json("data/counties-10m.json"),
    d3.csv("data/national_health_data_2024.csv")
]).then(([geoDataResponse, csvDataResponse]) => {
    geoData = geoDataResponse; // Assign geoData
    csvData = csvDataResponse; // Assign csvData

    csvData.forEach(d => {
        d.education_less_than_high_school_percent = +d.education_less_than_high_school_percent;
        d.percent_no_heath_insurance = +d.percent_no_heath_insurance;
        d.percent_high_blood_pressure = +d.percent_high_blood_pressure;
        d.percent_coronary_heart_disease = +d.percent_coronary_heart_disease;
        d.percent_stroke = +d.percent_stroke;
        d.percent_high_cholesterol = +d.percent_high_cholesterol;
    });

    createScatterPlot(csvData);
    createHistogram(csvData, "percent_no_heath_insurance", "#histogram-select", "Percent of Population with No Health Insurance (%)"); //Default Attribute
    createChoroplethMaps("percent_no_heath_insurance"); // Default attribute
});

// Select the slider and label
const attributes = [
    { name: "Percent of Population with No Health Insurance", key: "percent_no_heath_insurance" },
    { name: "Percent of Population Less Than High School", key: "education_less_than_high_school_percent" },
    { name: "Percent of Population with High Blood Pressure", key: "percent_high_blood_pressure" },
    { name: "Percent of Population with Coronary Heart Disease", key: "percent_coronary_heart_disease" },
    { name: "Percent of Population with Stroke", key: "percent_stroke" },
    { name: "Percent of Population with High Cholesterol", key: "percent_high_cholesterol" }
];

/*Modified Code*/
var attributes_ = {
    percent_no_heath_insurance : "Percent of Population with No Health Insurance",
    education_less_than_high_school_percent: "Percent of Population Less Than High School",
    percent_high_blood_pressure: "Percent of Population with High Blood Pressure",
    percent_coronary_heart_disease: "Percent of Population with Coronary Heart Disease", 
    percent_stroke: "Percent of Population with Stroke", 
    percent_high_cholesterol: "Percent of Population with High Cholesterol"
};

// Populate the dropdown for Y-axis selection
const yAxisDropdown = d3.select("#y-axis-select");
attributes.forEach((attr, index) => {
    yAxisDropdown.append("option")
        .attr("value", attr.key)
        .text(attr.name);
});

yAxisDropdown.on("change", function () {
    yAxisAttribute = this.value;
//    const xAxisIndex = +d3.select("#attribute-slider").property("value"); /* Removed Attribute Slider */
    const xAxisAttribute = globalselectedAttr; //attributes[xAxisIndex].key; /* Removed Attribute Slider */

    updateScatterPlot(csvData, xAxisAttribute, yAxisAttribute);
});

/* Removed Attribute Slider */
// d3.select("#attribute-slider").on("input", function () {
//     let index = +this.value;
//     d3.select("#selected-attribute").text(`Current: ${attributes[index].name}`);
//     d3.select("#map-title").text(attributes[index].name);
//     updateVisualizations(attributes[index].key, attributes[index].name);
// });

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        globalselectedAttr = tab.dataset.attr;
        const index = attributes.findIndex(attr => attr.key === globalselectedAttr);
        d3.select("#selected-attribute").text(`Current: ${attributes[index].name}`);
        d3.select("#map-title").text(attributes[index].name);
        d3.select("#cmap-title").text('Choropleth Map: ' + attributes[index].name);
        d3.select("#histogram-title").text('Histogram: ' + attributes[index].name);
        updateVisualizations(attributes[index].key, attributes[index].name);
    });
});


function updateVisualizations(attribute, attributeName) {
    createChoroplethMaps(attribute); // Update the choropleth map with the selected attribute
    createHistogram(csvData, attribute, "#histogram-select", attributeName + '(%)'); //Update Histogram
    updateScatterPlot(csvData, attribute, yAxisAttribute); // Update the scatterplot with the selected attribute

}

function getColorScale(attribute, data) {
    let extent = d3.extent(data, d => +d[attribute]); // Ensure numeric values
    return d3.scaleSequential(d3.interpolateBlues).domain(extent);
}

function updateChoroplethMap(attribute, data) {
    let colorScale = getColorScale(attribute, data);

    d3.selectAll(".county")
        .transition()
        .duration(500)
        .attr("fill", d => {
            let value = +d[attribute]; 
            return value ? colorScale(value) : "#ccc"; // Default to gray if no data
        })
        .on("mouseover", function (event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .attr("opacity", 0.8);

            const value = d[attribute];
            d3.select("#tooltip")
                .style("visibility", "visible")
                .html(value ? `${attribute}: ${value.toFixed(2)}%` : "No Data Available")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("stroke", "none")
                .attr("opacity", 1);

            d3.select("#tooltip").style("visibility", "hidden");
        });
}

function createScatterPlot(data) {
    const svg = d3.select("#scatterplot").append("svg")
        .attr("width", width)
        .attr("height", height);

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.education_less_than_high_school_percent))
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.percent_no_heath_insurance))
        .range([height - margin.bottom, margin.top]);

    svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("g").attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    const circles = svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d.education_less_than_high_school_percent))
        .attr("cy", d => yScale(d.percent_no_heath_insurance))
        .attr("r", 5)
        .attr("fill", "steelblue")
        .attr("class", "scatter-point");

    const brush = d3.brush()
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
        .on("brush end", ({ selection }) => {
            if (!selection) {
                // Brush cleared – reset colors and linked visualizations
                circles.attr("fill", "steelblue");
                updateLinkedVisualizations(data); // Or use [] if you want to clear it
                return;
            }
        
            // if (!selection) return;
            const [[x0, y0], [x1, y1]] = selection;

            const selectedData = data.filter(d =>
                x0 <= xScale(d.education_less_than_high_school_percent) && xScale(d.education_less_than_high_school_percent) <= x1 &&
                y0 <= yScale(d.percent_no_heath_insurance) && yScale(d.percent_no_heath_insurance) <= y1
            );

            // Highlight selected points
            circles.attr("fill", d => selectedData.includes(d) ? "orange" : "steelblue");

            // Update linked visualizations
            updateLinkedVisualizations(selectedData);
        });

    svg.append("g").attr("class", "brush").call(brush);


    // Append new axis labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .style("text-anchor", "middle")
        .text("Percent of Population Less Than High School (%)");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 15)
        .style("text-anchor", "middle")
        .text("Percent of Population with No Health Insurance (%)");
}

function updateScatterPlot(data, xAttribute, yAttribute) {
    const svg = d3.select("#scatterplot svg");

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[xAttribute]))
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[yAttribute]))
        .range([height - margin.bottom, margin.top]);
    

    // Remove old axis labels
    svg.selectAll(".axis-label").remove();

    // Update axes
    svg.select(".x-axis")
        .transition().duration(500)
        .call(d3.axisBottom(xScale));

    svg.select(".y-axis")
        .transition().duration(500)
        .call(d3.axisLeft(yScale));

    // Update scatterplot circles
    svg.selectAll("circle")
        .data(data)
        .transition()
        .duration(500)
        .attr("cx", d => xScale(d[xAttribute]))
        .attr("cy", d => yScale(d[yAttribute]))
        .attr("fill", "steelblue");
    
    // Append new axis labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .style("text-anchor", "middle")
        .text(attributes.find(attr => attr.key === xAttribute).name + " (%)");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 15)
        .style("text-anchor", "middle")
        .text(attributes.find(attr => attr.key === yAttribute).name + " (%)");

    // Remove old brush before reapplying
    svg.select(".brush").remove();

    // Add brushing again
    const brush = d3.brush()
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
        .on("brush end", ({ selection }) => {
            if (!selection) {
                // Brush cleared – reset colors and linked visualizations
                svg.selectAll("circle").attr("fill", "steelblue");
                updateLinkedVisualizations(data); // or updateLinkedVisualizations([])
                return;
            }
            //if (!selection) return;
            const [[x0, y0], [x1, y1]] = selection;

            const selectedData = data.filter(d =>
                x0 <= xScale(d[xAttribute]) && xScale(d[xAttribute]) <= x1 &&
                y0 <= yScale(d[yAttribute]) && yScale(d[yAttribute]) <= y1
            );

            // Highlight selected points
            svg.selectAll("circle")
                .attr("fill", d => selectedData.includes(d) ? "orange" : "steelblue");

            // Update linked visualizations
            updateLinkedVisualizations(selectedData);
        });
    // Clear previous brush
    svg.select(".brush").remove();

    svg.append("g").attr("class", "brush").call(brush);
}

/*Modified Code*/
function createHistogram(data, attribute, container, label) {
    d3.select(container).selectAll("*").remove();
    const svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height);

    const cleanedData = data.filter(d => d[attribute] !== -1 && d[attribute] != null);

    const xScale = d3.scaleLinear()
        .domain(d3.extent(cleanedData, d => d[attribute]))
        .range([margin.left, width - margin.right]);

    const histogram = d3.histogram()
        .value(d => d[attribute])
        .domain(xScale.domain())
        .thresholds(20);

    const bins = histogram(cleanedData);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height - margin.bottom, margin.top]);

    svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("g").attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    const histogramTooltip = d3.select("body").append("div").attr("class", "histogram-tooltip");
    svg.selectAll("rect")
        .data(bins)
        .enter().append("rect")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.length))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("height", d => height - margin.bottom - yScale(d.length))
        .attr("fill", "steelblue")
        .on("mouseover", function (event, d) {
            // Change fill color on hover
            d3.select(this).attr("fill", "orange");
            histogramTooltip.style("visibility", "visible")
            .html(`${label}: ${d.x0.toFixed(1)} - ${d.x1.toFixed(1)}<br>Count of Counties: ${d.length}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mousemove", function(event) {
            histogramTooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            // Restore original fill
            d3.select(this).attr("fill", "steelblue");
            histogramTooltip.style("visibility", "hidden");
        });

    // Data labels on top of bars
    svg.selectAll("text.bar-label")
        .data(bins)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
        .attr("y", d => yScale(d.length) - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "#333")
        .text(d => d.length > 0 ? d.length : "");

    svg.append("text").attr("x", width / 2).attr("y", height - 10)
        .style("text-anchor", "middle").text(label);

    svg.append("text").attr("transform", "rotate(-90)").attr("x", -height / 2)
        .attr("y", 15).style("text-anchor", "middle").text("Count of Counties");
}

function createChoroplethMaps(attribute) {
    const dataMap = {};

    // Create a mapping for CSV data based on county FIPS codes
    csvData.forEach(d => {
        dataMap[d.cnty_fips] = {
            county: d.display_name,
            education_less_than_high_school_percent: d.education_less_than_high_school_percent,
            percent_no_heath_insurance: d.percent_no_heath_insurance,
            percent_high_blood_pressure: d.percent_high_blood_pressure,
            percent_coronary_heart_disease: d.percent_coronary_heart_disease,
            percent_stroke: d.percent_stroke,
            percent_high_cholesterol: d.percent_high_cholesterol
        };
    });

    // const colorScales = {
    //     education_less_than_high_school_percent: d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(csvData, d => d.education_less_than_high_school_percent)]),
    //     percent_no_heath_insurance: d3.scaleSequential(d3.interpolateReds).domain([0, d3.max(csvData, d => d.percent_no_heath_insurance)]),
    //     percent_high_blood_pressure: d3.scaleSequential(d3.interpolatePurples).domain([0, d3.max(csvData, d => d.percent_high_blood_pressure)]),
    //     percent_coronary_heart_disease: d3.scaleSequential(d3.interpolateOranges).domain([0, d3.max(csvData, d => d.percent_coronary_heart_disease)]),
    //     percent_stroke: d3.scaleSequential(d3.interpolateYlGnBu).domain([0, d3.max(csvData, d => d.percent_stroke)]),
    //     percent_high_cholesterol: d3.scaleSequential(d3.interpolateGreens).domain([0, d3.max(csvData, d => d.percent_high_cholesterol)])
    // };

    // const colorScales =  d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(csvData, d => d[attribute])]);

    // Filter valid values for the color scale
    const validValues = csvData
    .map(d => d[attribute])
    .filter(v => v !== -1 && v != null);

    const colorScales = d3.scaleSequential()
    .domain([d3.min(validValues), d3.max(validValues)])
    .interpolator(d3.interpolateBlues);


    // Convert the TopoJSON data to GeoJSON
    const counties = topojson.feature(geoData, geoData.objects.counties).features;

    // Call the function to draw the choropleth map based on the selected attribute
    const selectedScale = colorScales;
    drawChoropleth("#map-svg", counties, dataMap, selectedScale, attribute);
}

function drawChoropleth(svgId, counties, dataMap, colorScale, valueKey) {
    const svg = d3.select(svgId).attr("width", width).attr("height", height + 100);
    svg.selectAll("*").remove();

    const projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2])
        .scale(width);

    const path = d3.geoPath().projection(projection);

    // Title
    // svg.append("text")
    //     .attr("x", width / 2)
    //     .attr("y", 15)
    //     .attr("text-anchor", "middle")
    //     .attr("font-size", "20px")
    //     .attr("font-weight", "bold")
    //     .text(`Choropleth: ${attributes_[valueKey]}`);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "lightgray")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("display", "none");

    svg.selectAll(".county")
        .data(counties)
        .enter().append("path")
        .attr("class", "county")
        .attr("d", path)
        .attr("fill", d => {
            const countyData = dataMap[d.id];
            return countyData === -1 || countyData == null || countyData[valueKey] == null ? "#ccc" : colorScale(countyData[valueKey]);
        })
        .attr("stroke", "#fff")
        .on("mouseover", function (event, d) {
            // Save current color before hover
            const originalColor = d3.select(this).attr("fill");
            d3.select(this).attr("data-original-fill", originalColor);

            // Apply hover color (same as brushing)
            d3.select(this).attr("fill", "orange");

            const countyData = dataMap[d.id];
            if (countyData === -1 || countyData == null || countyData[valueKey] == null) {
                return;
            }
            let tooltipText = "No Data Available";
            if (countyData !== -1 && countyData != null && countyData[valueKey] != null) {
                tooltipText = `${countyData.county}<br>${attributes_[valueKey]}: ${countyData[valueKey]}%`;
            }
            
            tooltip.style("display", "block")
                .html(tooltipText)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            // Revert to original fill
            const originalColor = d3.select(this).attr("data-original-fill");
            if (originalColor) {
                d3.select(this).attr("fill", originalColor);
            }

            tooltip.style("display", "none");
        });

    // Legend
    const legendWidth = 300;
    const legendHeight = 10;

    const legendGroup = svg.append("g")
        .attr("transform", `translate(${(width - legendWidth) / 2}, ${height + 40})`);

    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", "legendGradient");

    gradient.selectAll("stop")
        .data(d3.ticks(0, 1, 10))
        .enter()
        .append("stop")
        .attr("offset", d => `${d * 100}%`)
        .attr("stop-color", d => {
            const domain = colorScale.domain();
            return colorScale(d * (domain[1] - domain[0]) + domain[0]);
        });

    legendGroup.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legendGradient)")
        .attr("stroke", "#000");

    const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickSize(legendHeight + 3);

    legendGroup.append("g")
        .attr("transform", `translate(0, 0)`)
        .call(legendAxis)
        .select(".domain").remove();

    // Add "No Data" Box
    legendGroup.append("rect")
        .attr("x", legendWidth + 20)
        .attr("width", 20)
        .attr("height", legendHeight)
        .attr("fill", "#ccc")
        .attr("stroke", "#000");

    legendGroup.append("text")
        .attr("x", legendWidth + 45)
        .attr("y", legendHeight - 1)
        .text("No Data")
        .attr("alignment-baseline", "middle")
        .style("font-size", "12px");
}


function updateLinkedVisualizations(selectedData) {
    if (selectedData.length === 0) {
        /*Modified Code*/
        createHistogram(csvData, globalselectedAttr, "#histogram-select", attributes_[globalselectedAttr] + '(%)');
        createChoroplethMaps(globalselectedAttr);
    } else {
        /*Modified Code*/
        createHistogram(selectedData, globalselectedAttr, "#histogram-select", attributes_[globalselectedAttr] + '(%)');
        updateChoroplethMapBrush(globalselectedAttr, selectedData);
    }
}

function updateChoroplethMapBrush(attribute, selectedData) {
    const selectedCountyFIPS = new Set(selectedData.map(d => d.cnty_fips));
    const colorScale = getColorScale(attribute, csvData);

    // Convert the TopoJSON data to GeoJSON
    const counties = topojson.feature(geoData, geoData.objects.counties).features;

    // Remove any existing tooltip to avoid duplicates
    d3.select(".brush-tooltip").remove();

    const tooltip = d3.select("body").append("div")
        .attr("class", "brush-tooltip")
        .style("position", "absolute")
        .style("background", "lightgray")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("display", "none");

    d3.selectAll(".county")
        .attr("class", "county")
        .transition()
        .duration(100)
        .attr("fill", d => {
            const countyData = csvData.find(cd => cd.cnty_fips == d.id);
            if (!countyData || countyData[attribute] == null || countyData[attribute] == -1) {
                return "#ccc";
            }
            return selectedCountyFIPS.has(countyData.cnty_fips)
                ? colorScale(countyData[attribute])
                : "#ccc";
        });

    // Re-bind mouse events to show tooltip only for valid and selected counties
    d3.selectAll(".county")
    .attr("class", "county")
    .on("mouseover", function (event, d) {
        // Save current color before hover
        const originalColor = d3.select(this).attr("fill");
        d3.select(this).attr("data-original-fill", originalColor);

        // Apply hover color (same as brushing)
        d3.select(this).attr("fill", "orange");

        const countyData = csvData.find(cd => cd.cnty_fips == d.id);

        if (!countyData || countyData[attribute] == null || countyData[attribute] == -1 || !selectedCountyFIPS.has(countyData.cnty_fips)) {
                tooltip.style("display", "none");
                return;
            }
            // Ensure we correctly check for missing data
            const countyName = countyData.display_name || "Unknown County";
            const tooltipText = `${countyName}<br>${attributes_[attribute]}: ${countyData[attribute]}%`;

            tooltip
                .style("display", "block")
                .html(tooltipText)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mousemove", event => {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            // Revert to original fill
            const originalColor = d3.select(this).attr("data-original-fill");
            if (originalColor) {
                d3.select(this).attr("fill", originalColor);
            }
            tooltip.style("display", "none");
        });
}


