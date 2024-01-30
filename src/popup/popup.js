let Button = 0; 

function showLoading() {
  document.getElementById('loading-image').style.display = 'block';
  document.getElementsByClassName('button-container')[0].style.display = 'none';
}

function removeLoading() {
  document.getElementById('loading-image').style.display = 'none';
  document.getElementsByClassName('button-container')[0].style.display = 'block';
}

function injectGPA() {
  showLoading();
  chrome.tabs.executeScript(null, {
    file: '/js/jquery-3.4.1.min.js',
  }, () => {
    chrome.tabs.executeScript(null, {
      file: '/src/gpa/activateGPA.js',
    });
  });
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'parsedGPA') {
    removeLoading();
    const gpaValue = request.data.gpa;
    document.getElementsByClassName('gpa-container')[0].style.display = 'flex';
    document.getElementsByClassName('gpa-value')[0].innerText = gpaValue;
    // TODO: use the courses and GPA to display in another tab.

    localStorage.setItem('courseGPA', JSON.stringify(request.data));
    chrome.tabs.create({ url: chrome.runtime.getURL('/src/gpa/gpa_report.html') });
  }
});

document.getElementsByClassName('calculate-gpa-button')[0].onclick = () => {
  Button = 2; 
  injectGPA();
};
