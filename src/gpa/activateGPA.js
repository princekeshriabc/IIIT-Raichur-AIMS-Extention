(function () {
  // wrap code in an IIFE to prevent redeclaration errors on re-invoke.
const excludeList = [
  'minor core',
  'honors core',
  'minor elective',
  'honours project',
  'honours coursework',
  'fcc',
  'additional',
];
const gradeValues = {
  'A+': 10,
  A: 10,
  'A-': 9,
  B: 8,
  'B-': 7,
  C: 6,
  'C-': 5,
  D: 4,
  FR: 0,
  FS: 0,
  F:0,
};

const appendCheckbox = (parent, isChecked) => {
  const checkbox = document.createElement('input');
  checkbox.className = 'cgpa_cal_check';
  checkbox.type = 'checkbox';
  if (isChecked === true) checkbox.checked = true;
  else checkbox.checked = false;
  parent.before(checkbox);
};

const appendSelectionCheckbox = (element) => {
  const checkbox = document.createElement('input');
  checkbox.className = 'sem_sel_check';
  checkbox.type = 'checkbox';
  checkbox.checked = true; // eslint-disable-line

  checkbox.addEventListener('change', function () {
    console.log(this.checked);
    const semHeaderList = this.parentElement.parentElement.parentElement;
    const checkboxList = semHeaderList.querySelectorAll('.cgpa_cal_check');
    if (this.checked) {
    /* select all courses in that semester which should be selected by default. */
      checkboxList.forEach((each) => {
        each.checked = true; // eslint-disable-line
        const type = each.parentNode.children[5].innerText.trim();
        const grade = each.parentNode.children[8].innerText.trim();
        if (
          excludeList.indexOf(type.toLowerCase()) > -1
        || grade === ''
        || grade === 'I'
        ) {
        /* If Course is incomplete, hasn't finished or is to be excluded */
          each.checked = false; // eslint-disable-line
        }
      });
    } else {
    /* unselect all courses in that semester */
      checkboxList.forEach((each) => {
        each.checked = false; // eslint-disable-line
      });
    }
  });
  element.after(checkbox);
};

const addCheckboxes = () => {
  const coursesChecked = new Set();
  const checkboxList = document.querySelectorAll('.cgpa_cal_check');
  checkboxList.forEach((each) => {
    each.remove();
  });
  const elems = document.querySelectorAll('.hierarchyLi.dataLi.tab_body_bg');
  elems.forEach((eachCourse) => {
    if (eachCourse.childNodes.length < 9) return;

    const courseID = eachCourse.childNodes[0].innerText;
    if (coursesChecked.has(courseID)) {
      // incase the course has already been done before
      // For example, Improvements, do not include it.
      appendCheckbox(eachCourse.childNodes[0], false);
      return;
    }
    let isChecked = true; // assume all courses to be valid
    const type = eachCourse.childNodes[4].innerText.trim();
    const grade = eachCourse.childNodes[7].innerText.trim();
    
    if (
      excludeList.indexOf(type.toLowerCase()) > -1
      || grade === ''
      || grade === 'I'
    ) {
      // If Course is incomplete, hasn't finished or is to be excluded
      isChecked = false;
    }
    if (isChecked) {
      coursesChecked.add(courseID);
    }
    appendCheckbox(eachCourse.childNodes[0], isChecked);
  });
  const semMarkers = document.querySelectorAll(
    '.hierarchyLi.dataLi.hierarchyHdr.changeHdrCls.tab_body_bg',
  );
  semMarkers.forEach((eachSem) => {
    const insertionElement = eachSem.lastChild.firstChild;
    appendSelectionCheckbox(insertionElement);
  });
};

const showTotalGPA = () => {
  const courses = [];
  let totalGrades = 0;
  let totalCredits = 0;
  const gpaButton = document.querySelectorAll('#gpa_button');
  gpaButton.innerHTML = 'Calculating';
  const checkboxList = document.querySelectorAll('.cgpa_cal_check');
  if (checkboxList.length === 0) {
    // add checboxes in case they don't exist.
    addCheckboxes();
  }
  const elems = document.querySelectorAll('.hierarchyLi.dataLi.tab_body_bg');

  const typeCreditsMap = new Map();
  elems.forEach((eachCourse) => {
    if (eachCourse.querySelectorAll('.cgpa_cal_check:checked').length === 0) {
      return;
    }
    if (eachCourse.childNodes.length < 9) return;
    const course = {};
    course.code = eachCourse.childNodes[1].innerText.trim();
    course.name = eachCourse.childNodes[2].innerText;
    course.type = eachCourse.childNodes[5].innerText.trim();
    course.grade = eachCourse.childNodes[8].innerText.trim();
    course.credits = Number(eachCourse.childNodes[3].innerText.trim());
    if (!(course.grade in gradeValues || course.grade === 'S')) {
      return;
    }

    if (typeCreditsMap.has(course.type)) {
      typeCreditsMap.set(
        course.type,
        typeCreditsMap.get(course.type) + course.credits,
      );
    } else {
      typeCreditsMap.set(course.type, course.credits);
    }

    // If the student took an S grade, display it without considering it for CGPA.
    if (course.grade !== 'S') {
      const gradeValue = gradeValues[course.grade];
      const { credits } = course;
      totalGrades += credits * gradeValue;
      totalCredits += credits;
    }
    courses.push(course);
  });
  const gpa = (totalGrades / totalCredits).toFixed(2);
  const studentDataDiv = document.querySelectorAll(
    '.studentInfoDiv.inlineBlock',
  )[0];
  return {
    name: studentDataDiv.childNodes[1].innerHTML,
    rollno: studentDataDiv.childNodes[5].childNodes[3].innerHTML,
    branch: studentDataDiv.childNodes[9].childNodes[1].childNodes[3].innerHTML,
    studentType:
      studentDataDiv.childNodes[9].childNodes[3].childNodes[3].innerText,
    typeCreditsMap: JSON.stringify(Array.from(typeCreditsMap)),
    courses: JSON.stringify(courses),
    gpa,
  };
};
chrome.runtime.sendMessage({
  action: 'parsedGPA',
  data: showTotalGPA(),
});
})();
