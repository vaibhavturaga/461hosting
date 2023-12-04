document.addEventListener('DOMContentLoaded', function() {
  const npmForm = document.getElementById('npm-url-form');
  npmForm.addEventListener('submit', handleNpmFormSubmit);
  fetchLatestPackages();
});

function fetchLatestPackages() {
  fetch('/packages') // This URL will be your Express route
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, status text: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      displayPackages(data.packages);
    })
    .catch(error => {
      console.error('Error fetching packages:', error);
    });
}


function displayPackages(packages) {
  const container = document.getElementById('packages-container');
  container.innerHTML = ''; // Clear existing packages

  packages.forEach(package => {
    const packageDiv = document.createElement('div');
    packageDiv.className = 'package';

    // Use URL as the header
    const header = document.createElement('h2');
    header.className = 'package-header';
    header.textContent = 'Package: ' + package.url;

    packageDiv.appendChild(header);

    // List metrics
    const metricsList = document.createElement('ul');
    ['NET_SCORE', 'RAMP_UP_SCORE', 'CORRECTNESS_SCORE', 'BUS_FACTOR_SCORE', 'RESPONSIVE_MAINTAINER_SCORE', 'LICENSE_SCORE',].forEach(metric => {
      const metricItem = document.createElement('li');
      metricItem.className = 'metric';
      metricItem.textContent = `${metric}: ${package[metric.toLowerCase()]}`;
      metricsList.appendChild(metricItem);
    });

    packageDiv.appendChild(metricsList);

    // Add a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = `/packages/${package.id}`; // This URL will be your Express route for downloading
    downloadLink.textContent = 'Download';
    packageDiv.appendChild(downloadLink);

    // Append this package div to the container
    container.appendChild(packageDiv);
  });
}


function handleNpmFormSubmit(event) {
  event.preventDefault();
  const npmUrlsValue = document.getElementById('npm-urls').value;
  const npmUrls = npmUrlsValue.split('\n').filter(url => url.trim());

  if (npmUrls.length === 0) {
    alert('Please enter at least one npm package URL.');
    return;
  }

  fetch('/packages/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ urls: npmUrls })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw errorData; // Throw the entire errorData object
        });
      }
      return response.json();
    })
    .then(result => {
      console.log('Ingest result:', result);
      fetchLatestPackages(); // Refresh the packages list
    })
    .catch(error => {
      console.error('Error ingesting npm packages:', error);
      // Check for the error property in the error object
      let errorMessage = error.error || error.message || 'Error processing packages';
      alert(`Failed to ingest packages. Error: ${errorMessage}`);
    });
}

function handleSearchFormSubmit(event) {
  event.preventDefault();
  const searchQuery = document.getElementById('search-query').value.trim();

  // Perform validation if needed
  if (!searchQuery) {
    alert('Please enter a search pattern.');
    return;
  }

  // Perform the search
  fetch(`/packages/search?query=${encodeURIComponent(searchQuery)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      displayPackages(data.packages);
    })
    .catch(error => {
      console.error('Error searching packages: ', error);
      console.log(error); // Log the full error object to get more details.
      alert('Failed to search packages. See console for more details.');
    });
}

// Add this event listener after the existing event listener for 'npm-url-form'
const searchForm = document.getElementById('search-form');
searchForm.addEventListener('submit', handleSearchFormSubmit);
