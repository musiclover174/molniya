(function () {

  window.xs = window.innerWidth <= 1024 ? true : false

  window.mobile = window.innerWidth <= 480 ? true : false

  window.xsHeight = window.innerHeight <= 540 ? true : false

  window.touch = document.querySelector('html').classList.contains('touchevents')

  window.animation = {}

  window.animation.fadeIn = (elem, ms, cb, d = 'block') => {
    if (!elem)
      return;

    elem.style.opacity = 0;
    elem.style.display = d;

    if (ms) {
      var opacity = 0;
      var timer = setInterval(function () {
        opacity += 50 / ms;
        if (opacity >= 1) {
          clearInterval(timer);
          opacity = 1;
          if (cb) cb()
        }
        elem.style.opacity = opacity;
      }, 50);
    } else {
      elem.style.opacity = 1;
      if (cb) cb()
    }
  }

  window.animation.fadeOut = (elem, ms, cb) => {
    if (!elem)
      return;

    elem.style.opacity = 1;

    if (ms) {
      var opacity = 1;
      var timer = setInterval(function () {
        opacity -= 50 / ms;
        if (opacity <= 0) {
          clearInterval(timer);
          opacity = 0;
          elem.style.display = "none";
          if (cb) cb()
        }
        elem.style.opacity = opacity;
      }, 50);
    } else {
      elem.style.opacity = 0;
      elem.style.display = "none";
      if (cb) cb()
    }
  }

  window.animation.scrollTo = (to, duration) => {
    if (duration <= 0) return;
    const element = document.documentElement,
      difference = to - element.scrollTop,
      perTick = difference / duration * 10;

    setTimeout(function () {
      element.scrollTop = element.scrollTop + perTick;
      window.animation.scrollTo(to, duration - 10);
    }, 10);
  }

  window.animation.visChecker = (el) => {
    let rect = el.getBoundingClientRect()
    return (
      //rect.top >= 0 &&
      //rect.left >= 0 &&
      rect.bottom - el.offsetHeight * .35 <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  window.lightning = {}

  window.lightning.form = ({
    
    popSelect: null,

    init: function () {

      const _th = this,
        inputs = document.querySelectorAll('.common__input, .common__textarea'),
        forms = document.querySelectorAll('form'),
        selectors = document.querySelectorAll('.js-select'),
        choicesArr = [],
        digitsInput = document.querySelectorAll('.js-digits')

      $('.js-phone').mask('+7(999) 999-9999')

      function emptyCheck(event) {
        event.target.value.trim() === '' ?
          event.target.classList.remove('notempty') :
          event.target.classList.add('notempty')
      }
      
      for (let item of inputs) {
        item.addEventListener('keyup', emptyCheck)
        item.addEventListener('blur', emptyCheck)
      }

      if (document.querySelectorAll('.js-common-file').length) {
        let commonFile = document.querySelectorAll('.js-common-fileinput'),
          commonFileDelete = document.querySelectorAll('.js-common-filedelete')

        for (let fileInp of commonFile) {
          fileInp.addEventListener('change', (e) => {
            let el = fileInp.nextElementSibling,
              path = fileInp.value.split('\\'),
              pathName = path[path.length - 1].split('');

            pathName.length >= 30 ?
              pathName = pathName.slice(0, 28).join('') + '...' :
              pathName = pathName.join('')

            el.textContent = pathName;
            el.classList.add('choosed');
          })
        }

        for (let fileDelete of commonFileDelete) {
          fileDelete.addEventListener('click', (e) => {
            let el = fileDelete.previousElementSibling,
              fileInput = fileDelete.previousElementSibling.previousElementSibling;
            el.textContent = el.getAttribute('data-default');
            fileInput.value = '';
            el.classList.remove('choosed');
          })
        }
      }

      for (let form of forms) {
        form.addEventListener('submit', e => !_th.checkForm(form) && e.preventDefault() && e.stopPropagation())
      }

      for (let selector of selectors) {
        let choice = new Choices(selector, {
          searchEnabled: false,
          itemSelectText: '',
          position: 'bottom'
        })
        if (selector.classList.contains('js-select-first')) 
          this.popSelect = choice
        choicesArr.push(choice)
      }

      for (let digitInput of digitsInput) {
        digitInput.addEventListener('keydown', (e) => {
          let validArr = [46, 8, 9, 27, 13, 110, 190]
          if (validArr.indexOf(e.keyCode) !== -1 ||
            (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
            (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) ||
            (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) ||
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
          }
          if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault()
          }
        });
      }

      return this
    },

    checkForm: function (form) {
      let checkResult = true;
      const warningElems = form.querySelectorAll('.warning');

      if (warningElems.length) {
        for (let warningElem of warningElems) {
          warningElem.classList.remove('warning')
        }
      }

      for (let elem of form.querySelectorAll('input, textarea, select')) {
        if (elem.getAttribute('data-req')) {
          switch (elem.getAttribute('data-type')) {
            case 'tel':
              var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
              if (!re.test(elem.value)) {
                elem.classList.add('warning')
                checkResult = false
              }
              break;
            case 'email':
              var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
              if (!re.test(elem.value)) {
                elem.classList.add('warning')
                checkResult = false
              }
              break;
            case 'file':
              if (elem.value.trim() === '') {
                elem.parentNode.classList.add('warning')
                checkResult = false
              }
              break;
            default:
              if (elem.value.trim() === '') {
                elem.classList.add('warning')
                checkResult = false
              }
              break;
          }
        }
      }
      
      for (let item of form.querySelectorAll('input[name^=agreement]')) {
        if (!item.checked) {
          item.classList.add('warning')
          checkResult = false
        }
      }
      return checkResult
    }

  }).init()

  window.lightning.obj = ({
    
    select: null,

    progressUpdate: (val) => {
      const progressEl = document.querySelector('.js-ibanner-progress')

      progressEl.style.width = val + '%'
    },
    
    progressUpdateHeight: (val) => {
      const progressEl = document.querySelector('.js-iclients-progress')

      progressEl.style.height = val + 'vh'
    },
    
    ibannerCar: () => {
      const carElemCount = document.querySelector('.js-ibanner .swiper-wrapper').children.length
      
      const ibannerCar = new Swiper('.js-ibanner', {
        speed: 1500,
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        navigation: {
          nextEl: '.js-ibanner .swiper-button-next',
          prevEl: '.js-ibanner .swiper-button-prev',
        },
        autoplay: {
          delay: 5000
        }
      })

      ibannerCar.on('slideChangeTransitionStart', function () {
        window.lightning.obj.progressUpdate(Math.floor((this.realIndex + 1) * 100 / carElemCount))
      })
      
      window.lightning.obj.progressUpdate(Math.floor(100 / carElemCount))
      
    },
    
    iclientsCar: () => {
      const clientSwiper = new Swiper('.js-iclients', {
        speed: 700,
        slidesPerView: 5,
        slidesPerColumn: 2,
        spaceBetween: 0,
        navigation: {
          nextEl: '.iclients__car-over .swiper-button-next',
          prevEl: '.iclients__car-over .swiper-button-prev',
        },
        breakpoints: {
          768: {
            slidesPerView: 2
          },
          960: {
            slidesPerView: 3
          },
          1270: {
            slidesPerView: 4
          }
        }
      })
    },
    
    resizeWatcher: () => {
      const tableSel = document.querySelectorAll('table'),
        scrollArray = [];
      if (tableSel.length) {
        tableSel.forEach((item, i) => {
          let orgHtml = item.outerHTML,
            def = 'default';

          if (item.getAttribute('class')) def = '';

          item.outerHTML = `<div class='table-scroller${i} ${def}'>${orgHtml}</div>`;
          let ps = new PerfectScrollbar(`.table-scroller${i}`, {
            wheelPropagation: true
          });
          scrollArray.push(ps);
        });
        window.addEventListener('resize', () => {
          if (scrollArray.length)
            scrollArray.forEach((item, i) => {
              item.update()
            });
        });
      }

    },

    asyncScroll: () => {
      const featElems = document.querySelectorAll('.js-async-scroll')
      
      featElems.forEach(item => item.setAttribute('data-top', parseInt(getComputedStyle(item)['top'])))
      
      window.addEventListener('scroll', () => {
        featElems.forEach(item => {
          const rect = item.getBoundingClientRect(),
                diff = rect.bottom - item.offsetHeight - (window.innerHeight || document.documentElement.clientHeight),
                dataKoef = item.getAttribute('data-koef'),
                dataTop = item.getAttribute('data-top')
          
          if (diff <= 0 && (rect.top + item.offsetHeight >= 0)) {
            item.style.top = dataTop - diff * dataKoef + 'px'
          }
        })
      })
    },
    
    iScenes: () => {
      const spacers = document.querySelectorAll('.js-scenes-spacer'),
            positioner = document.querySelector('.js-scenes-positioner'),
            scenesOver = document.querySelector('.js-scenes'),
            progressEl = document.querySelector('.js-iclients-progress')
      
      window.addEventListener('scroll', () => {
        const scenesRect = scenesOver.getBoundingClientRect(),
              posRect = positioner.getBoundingClientRect(),
              sceneHeight = getComputedStyle(scenesOver)['height'],
              positionHeight = getComputedStyle(positioner)['height'],
              wHeightHalf = (window.innerHeight || document.documentElement.clientHeight) / 2,
              positionHeightHalf = positioner.offsetHeight / 2
        
        let progressHeight = 0
        
        if (scenesRect.top + positionHeightHalf <= wHeightHalf) {
          if (scenesRect.top + scenesOver.offsetHeight - positionHeightHalf - wHeightHalf > 0) { 
            positioner.style.top = Math.abs(scenesRect.top + positionHeightHalf - wHeightHalf) + 'px'
            progressEl.style.top = Math.abs(scenesRect.top + positionHeightHalf - wHeightHalf) + 'px'
            progressHeight = (parseInt(positionHeight) + parseInt(positioner.style.top)) * 100 / parseInt(sceneHeight)
          }
          else {
            progressHeight = 100
          }
          window.lightning.obj.progressUpdateHeight(progressHeight)
        } else {
          positioner.removeAttribute('style')
          progressEl.removeAttribute('style')
        }
        
      })
      
      const controller = new ScrollMagic.Controller()
      
      const sceneClass1 = new ScrollMagic.Scene({
        triggerElement: '.js-scenes-spacer[data-step="1"]'
      }).setClassToggle('.js-scenes-positioner', 'scene1')
      const sceneClass2 = new ScrollMagic.Scene({
        triggerElement: '.js-scenes-spacer[data-step="2"]'
      }).setClassToggle('.js-scenes-positioner', 'scene2')
      const sceneClass3 = new ScrollMagic.Scene({
        triggerElement: '.js-scenes-spacer[data-step="3"]'
      }).setClassToggle('.js-scenes-positioner', 'scene3')
      const sceneClass4 = new ScrollMagic.Scene({
        triggerElement: '.js-scenes-spacer[data-step="4"]'
      }).setClassToggle('.js-scenes-positioner', 'scene4')
      
      controller.addScene([
        sceneClass1,
        sceneClass2,
        sceneClass3,
        sceneClass4
      ])
      
    },
    
    contacts: () => {
      const mapEl = document.querySelector('.js-contacts-map'),
            geo = mapEl.getAttribute('data-coords').split(', ')

			const map = new ymaps.Map(mapEl, {
				center: [geo[0], geo[1]],
				zoom: 16,
				controls: [],
				behaviors: ['default', 'scrollZoom']
			})

			const PMitem = new ymaps.Placemark([geo[0], geo[1]], {}, {
				iconLayout: 'default#image',
				iconImageSize: [42, 58],
				iconImageHref: 'static/i/pin.png',
				iconImageOffset: [-3, -42],
				hideIconOnBalloonOpen: false,
				balloonOffset: [-22, -49]
			})
      
			map.geoObjects.add(PMitem)
    },
    
    objectChanger: () => {
      const placeEl = document.querySelector('.js-objects-place'),
            addressEl = document.querySelector('.js-objects-address'),
            glaEl = document.querySelector('.js-objects-gla'),
            gbaEl = document.querySelector('.js-objects-gba'),
            moreEl = document.querySelector('.js-objects-more'),
            bgEl = document.querySelector('.js-objects-bg'),
            objectOver = document.querySelector('.js-objects'),
            objectOrder = document.querySelector('.js-object-order')
      
      for (let objectElem of document.querySelectorAll('.js-objects__elem')) {
        objectElem.addEventListener('click', () => {
          objectOver.classList.add('change')
          setTimeout(() => {
            placeEl.textContent = objectElem.getAttribute('data-name')
            addressEl.textContent = objectElem.getAttribute('data-address')
            glaEl.textContent = objectElem.getAttribute('data-gla') + ' кв.м.'
            gbaEl.textContent = objectElem.getAttribute('data-gba') + ' кв.м.'
            moreEl.setAttribute('href', objectElem.getAttribute('data-href'))
            placeEl.setAttribute('href', objectElem.getAttribute('data-href'))
            objectOrder.setAttribute('data-id', objectElem.getAttribute('data-id'))
            bgEl.style.backgroundImage = `url('${objectElem.getAttribute('data-bg')}')`
            objectOver.classList.remove('change')
          }, 700)
        })
      }
    },
    
    objects: () => {
      if (document.querySelector('.js-objects-scroll')) {
        const ps = new PerfectScrollbar('.js-objects-scroll', {
          wheelPropagation: false
        })

        window.addEventListener('resize', () => {
          ps.update()
        })
      }
    },
    
    objectGallery: () => {
      const objectCar = new Swiper('.js-object-gallery', {
        speed: 1500,
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        navigation: {
          nextEl: '.js-object-gallery + .swiper-buttons .swiper-button-next',
          prevEl: '.js-object-gallery + .swiper-buttons .swiper-button-prev',
        }
      })
    },
    
    objectOthers: () => {
      const othersCar = new Swiper('.js-object-others', {
        speed: 700,
        slidesPerView: 2,
        spaceBetween: 60,
        loop: true,
        navigation: {
          nextEl: '.js-object-others .swiper-button-next',
          prevEl: '.js-object-others .swiper-button-prev',
        },
        breakpoints: {
          800: {
            slidesPerView: 1
          },
          1270: {
            spaceBetween: 30
          }
        }
      })
    },
    
    plan: () => {
      let hint = document.querySelector('.js-plan-hint'),
          plan = document.querySelector('.plan__floors-tab.active .plan__bg'),
          floors = document.querySelectorAll('.js-plan-floor')
      
      if (floors.length) {
        let curVal, newVal
        for (let floor of floors) {
          floor.addEventListener('click', () => {
            if (floor.classList.contains('active'))
              return
              
            curVal = document.querySelector('.js-plan-floor.active').getAttribute('data-tab')
            newVal = floor.getAttribute('data-tab')
            
            if (document.querySelector('.js-plan-point.open'))
              document.querySelector('.js-plan-point.open').classList.remove('open')
            hint.classList.remove('show')
            hint.removeAttribute('style')
            
            window.animation.fadeOut(document.querySelector(`.js-plan-tab[data-tab="${curVal}"]`), 400, () => {
              document.querySelector(`.js-plan-tab[data-tab="${curVal}"]`).classList.remove('active')
              window.animation.fadeIn(document.querySelector(`.js-plan-tab[data-tab="${newVal}"]`), 400, () => {
                document.querySelector(`.js-plan-tab[data-tab="${newVal}"]`).classList.add('active')
                plan = document.querySelector('.plan__floors-tab.active .plan__bg')
              })
            })
            
            document.querySelector('.js-plan-floor.active').classList.remove('active')
            floor.classList.add('active')
          })
        }
      }
      
      for (let planElem of document.querySelectorAll('.plan__bg')) {
        planElem.addEventListener('click', () => {
          if (document.querySelector('.js-plan-point.open'))
            document.querySelector('.js-plan-point.open').classList.remove('open')
          hint.classList.remove('show')
          hint.removeAttribute('style')
        })
      }
      
      for (let point of document.querySelectorAll('.js-plan-point')) {
        point.addEventListener('click', () => {
          if (point.classList.contains('open'))
            return
            
          if (document.querySelector('.js-plan-point.open'))
            document.querySelector('.js-plan-point.open').classList.remove('open')
          point.classList.add('open')
          
          hint.classList.remove('show')
          hint.removeAttribute('style')
          
          hint.innerHTML = point.getAttribute('data-html')
          
          setTimeout(() => {
            let hintW = hint.offsetWidth,
                hintH = hint.offsetHeight,
                pointL = point.offsetLeft,
                pointT = point.offsetTop,
                hintT = pointT - hintH - 20, 
                hintL = pointL - 30
            
            if (pointT + 20 < hintH) {
              hintT = pointT + 40
            }
            
            if (plan.offsetWidth - pointL + 30 < hintW) {
              hintL = pointL - hintW + 44
            }
            
            hint.style.top = hintT + 'px'
            hint.style.left = hintL + 'px'
            hint.classList.add('show')
          }, 200)
        })
      }
    },
    
    init: function () {
      const burgerEl = document.querySelector('.js-burger'),
        html = document.querySelector('html'),
        headerEl = document.querySelector('.header'),
        elemsToCheck = ['.news__elem-imgover', '.js-scroll-imgover', '.about__steps-elem']

      burgerEl.addEventListener('click', (e) => {
        html.classList.toggle('burgeropen')
        burgerEl.classList.toggle('open')
        e.preventDefault()
      })

      if (document.querySelector('.js-async-scroll')) this.asyncScroll()
      
      if (document.querySelector('.js-ibanner')) this.ibannerCar()
      
      if (document.querySelector('.js-scenes')) this.iScenes()
      
      if (document.querySelector('.js-iclients')) this.iclientsCar()
      
      if (document.querySelector('.js-objects')) this.objects()
      
      if (document.querySelector('.js-object-gallery')) this.objectGallery()
      
      if (document.querySelectorAll('.js-objects__elem').length) this.objectChanger()
      
      if (document.querySelectorAll('.js-object-others').length) this.objectOthers()
      
      if (document.querySelectorAll('.js-object-order').length) {
        $('.js-object-order').fancybox({
          i18n: {
            en: {
              CLOSE: "Закрыть"
            }
          },
          clickOutside: '',
          clickSlide: '',
          touch: false,
          beforeShow: () => {
            window.lightning.form.popSelect.setValueByChoice(document.querySelector('.js-object-order').getAttribute('data-id'))
          }
        })
      }
      
      if (document.querySelector('.js-contacts-map')) ymaps.ready(this.contacts)
      
      if (document.querySelectorAll('.js-plan-point')) this.plan()
      
      window.addEventListener('resize', () => {
        window.xs = window.innerWidth <= 960 ? true : false
        window.mobile = window.innerWidth <= 480 ? true : false
        window.xsHeight = window.innerHeight <= 540 ? true : false
      })

      window.addEventListener('scroll', () => {
        for (let item of elemsToCheck) {
          for (let elem of document.querySelectorAll(item)) {
            if (window.animation.visChecker(elem)) {
              elem.classList.add('visible')
            }
          }
        }
      })

      $('html').on('click', '.js-add-select', () => {
        let tempHtml = $('.popup__sel-template').html()
        $('.popup__row_selects').append(tempHtml)

        let choice = new Choices($('.popup__sel').last().find('select')[0], {
          searchEnabled: false,
          itemSelectText: '',
          position: 'bottom'
        })
        
        $('.popup__sel').last().prev().find('.js-remove-select').removeClass('hidden')
        $('.popup__sel').last().prev().find('.js-add-select').addClass('hidden')
        
        return false
      })
      
      $('html').on('click', '.js-remove-select', function() {
        if ($('.popup__sel').length <= 2) {
          $(this).parent().prev().find('.js-remove-select').addClass('hidden')
          $(this).parent().prev().find('.js-add-select').removeClass('hidden')
        }
        
        $(this).parent().remove()
        
        return false
      })
      
      this.resizeWatcher()

      $('[data-fancybox]:not(.js-object-order)').fancybox({
        i18n: {
          en: {
            CLOSE: "Закрыть"
          }
        },
        clickOutside: '',
        clickSlide: '',
        touch: false
      })
      
      let eventResize
      try {
        eventResize = new Event('resize')
      }
      catch (e) {
        eventResize = document.createEvent('Event')
        let doesnt_bubble = false,
            isnt_cancelable = false
        eventResize.initEvent('resize', doesnt_bubble, isnt_cancelable);
      }
      window.dispatchEvent(eventResize)
      
      let eventScroll
      try {
        eventScroll = new Event('scroll')
      }
      catch (e) {
        eventScroll = document.createEvent('Event');
        let doesnt_bubble = false,
            isnt_cancelable = false
        eventScroll.initEvent('scroll', doesnt_bubble, isnt_cancelable);
      }
      window.dispatchEvent(eventScroll)

      return this
    }
  })

  Pace.on('hide', () => {
    setTimeout(() => {
      window.lightning.obj.init()
    }, 200)
  })
  
})();
