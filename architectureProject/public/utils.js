// checking if year,month,day are equal
function areDatesEqual(actual, expected) {
    return (
      actual.getFullYear() === expected.getFullYear() &&
      actual.getMonth() === expected.getMonth() &&
      actual.getDate() === expected.getDate()
    );
  }