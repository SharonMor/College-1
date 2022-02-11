// const spothover = document.getElementById('spot3');
const checkBtn = document.getElementById("checkBtn");
const delayBtn = document.getElementById("delayBtn");
const table = document.getElementById("timeTable");
const allTableCells = document.querySelectorAll("#timeTable td");

let previousCellClicked;

checkBtn.addEventListener("click", () => {
    if (table.hidden) {
      table.hidden = false;
    }
  });
  



  allTableCells.forEach((tableCell) =>
  tableCell.addEventListener("click", () => {
    if(previousCellClicked){
      previousCellClicked.style.backgroundColor = "rgba(85, 107, 47, 0.904)";//green
  }
//when clicking on a different cell (not on the same one)
  if(previousCellClicked!=tableCell){
      previousCellClicked=tableCell;
      tableCell.style.backgroundColor = "rgb(50, 158, 231)";//blue
      delayBtn.removeAttribute('disabled');
  }
  //when clicking on the same cell ("turning it off")
  else{
      previousCellClicked=null;
      delayBtn.setAttribute('disabled','disabled');

  }
},false));



// let previousSpotHover;
// let previousCellClicked;

// document
//   .querySelectorAll("#timeTable td .name_span")
//   .forEach((tableCellSpan) => (tableCellSpan.hidden = true)); //hide all name details.

// hide name and show time on mouseOver in table cells
allTableCells.forEach((tableCell) =>
  tableCell.addEventListener("mouseover", () => {
    let tableCellSpan = tableCell.querySelector(".name_span");
    tableCellSpan.style.visibility = "visible";
    tableCellSpan = tableCell.querySelector(".time_span");
    tableCellSpan.style.visibility = "hidden";
  })
);

// show times and hide names on mouseOver in table cells
allTableCells.forEach((tableCell) =>
  tableCell.addEventListener("mouseout", () => {
    let tableCellSpan = tableCell.querySelector(".name_span");
    tableCellSpan.style.visibility = "hidden";
    tableCellSpan = tableCell.querySelector(".time_span");
    tableCellSpan.style.visibility = "visible";
  })
);

// document.querySelectorAll('#timeTable td')
// .forEach(tableCell => tableCell.addEventListener("mouseover", () => {
//     previousSpotHover=tableCell.innerHTML;
//     tableCell.innerHTML='Ronen, Regular';
// },false));

// document.querySelectorAll('#timeTable td')
// .forEach(tableCell => tableCell.addEventListener("mouseout", () => {
//     tableCell.innerHTML=previousSpotHover;

// },false));

// document.querySelectorAll('#timeTable td')
// .forEach(tableCell => tableCell.addEventListener("click", () => {
//     console.log(tableCell.innerHTML);
//     if(previousCellClicked){
//         previousCellClicked.style.backgroundColor = "rgba(85, 107, 47, 0.904)";
//     }

//     if(previousCellClicked!=tableCell){
//         previousCellClicked=tableCell;
//         tableCell.style.backgroundColor = "rgb(50, 158, 231)";
//     }
//     else{
//         previousCellClicked=null;
//     }
// },false));

// document.querySelectorAll('#timeTable td')
// .forEach(tableCell => tableCell.addEventListener("mouseover", () => {
//     previousSpotHover=tableCell.innerHTML;
//     tableCell.innerHTML='Ronen, Regular';
// },false));

// document.querySelectorAll('#timeTable td')
// .forEach(tableCell => tableCell.addEventListener("mouseout", () => {
//     tableCell.innerHTML=previousSpotHover;

// },false));

// document.querySelectorAll('#timeTable td')
// .forEach(tableCell => tableCell.addEventListener("click", () => {
//     console.log(tableCell.innerHTML);
//     if(previousCellClicked){
//         previousCellClicked.style.backgroundColor = "rgba(85, 107, 47, 0.904)";
//     }

//     if(previousCellClicked!=tableCell){
//         previousCellClicked=tableCell;
//         tableCell.style.backgroundColor = "rgb(50, 158, 231)";
//     }
//     else{
//         previousCellClicked=null;
//     }
// },false));