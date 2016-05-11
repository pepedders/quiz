$(document).ready(function(){
  $("#flash").show('slide', { direction: 'down' }, 'slow');
  $(".dismiss").on('click', function(){
    $("#flash").hide('slide', { direction: 'up' }, 'slow');
  });
});
