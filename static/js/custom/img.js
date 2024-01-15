// This script is used to display images
// Get the modal
var modal = document.getElementById('modal_show');

var modalImg = document.getElementById("modal_image");

$(".show_image").click(function () {
  modal.style.display = "block";
  modalImg.src = this.src;
});
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
}