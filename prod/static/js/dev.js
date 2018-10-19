;(function() {
  
  $('.js-select').change(function() {
    $('.js-objects-scroll').html($('.js-objects-scroll').html()); // тут получаешь контент аяксом
    window.lightning.obj.objectChanger();
  });
  
})()