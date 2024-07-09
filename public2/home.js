document.addEventListener('DOMContentLoaded', function () {
  // Year Range Slider
  const yearRange = document.getElementById('yearRange');
  const yearRangeMinValue = document.getElementById('yearRangeMinValue');
  const yearRangeMaxValue = document.getElementById('yearRangeMaxValue');

  noUiSlider.create(yearRange, {
    start: [2000, 2024],
    connect: true,
    range: {
      'min': 2000,
      'max': 2024
    },
    step: 1
  });

  yearRange.noUiSlider.on('update', function (values, handle) {
    yearRangeMinValue.textContent = Math.round(values[0]);
    yearRangeMaxValue.textContent = Math.round(values[1]);
  });

  // Price Range Slider
  const priceRange = document.getElementById('priceRange');
  const priceRangeMinValue = document.getElementById('priceRangeMinValue');
  const priceRangeMaxValue = document.getElementById('priceRangeMaxValue');

  noUiSlider.create(priceRange, {
    start: [10000, 10000000],
    connect: true,
    range: {
      'min': 10000,
      'max': 10000000
    },
    step: 10000,
    format: {
      to: function (value) {
        return Math.round(value);
      },
      from: function (value) {
        return Number(value);
      }
    }
  });

  priceRange.noUiSlider.on('update', function (values, handle) {
    priceRangeMinValue.textContent = Math.round(values[0]);
    priceRangeMaxValue.textContent = Math.round(values[1]);
  });

  // Handle form submission
  $('#filterForm').on('submit', function (e) {
    e.preventDefault();

    var filters = {
      car_brand: $('#car_brand').val(),
      minYear: yearRange.noUiSlider.get()[0],
      maxYear: yearRange.noUiSlider.get()[1],
      minPrice: priceRange.noUiSlider.get()[0],
      maxPrice: priceRange.noUiSlider.get()[1],
      fueltype: $('#fueltype').val(),
      transmission: $('#transmission').val(),
      bodytype: $('#bodytype').val(),
      ownership: $('#ownership').val()
    };

    // Send an AJAX request to the server with the filters
    $.ajax({
      url: '/cars',
      method: 'GET',
      data: filters,
      success: function (data) {
        // Clear existing car list
        $('#car-list').empty();
        
        // Process the data received from the server
        data.forEach(car => {
          let carouselIndicators = '';
          let carouselInner = '';
          const images = car.image.split(',');
          images.forEach((img, index) => {
            const activeClass = index === 0 ? 'active' : '';
            carouselIndicators += `<li data-target="#carousel${car.id}" data-slide-to="${index}" class="${activeClass}"></li>`;
            carouselInner += `
              <div class="carousel-item ${activeClass}">
                <img src="/uploads/${img}" class="d-block w-100" alt="${car.car_brand}">
              </div>`;
          });

          let soldOutOverlay = car.status === 'Sold Out' ? '<div class="sold-out-overlay">SOLD OUT</div>' : '';
          let priceText = car.status === 'Sold Out' ? 'Sold Out' : `₹${car.price}`;

          $('#car-list').append(`
            <div class="col-md-3 mb-4">
              <div class="card" data-id="${car.id}">
                ${soldOutOverlay}
                <div id="carousel${car.id}" class="carousel slide" data-ride="carousel">
                  <ol class="carousel-indicators">
                    ${carouselIndicators}
                  </ol>
                  <div class="carousel-inner">
                    ${carouselInner}
                  </div>
                  <a class="carousel-control-prev" href="#carousel${car.id}" role="button" data-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="sr-only">Previous</span>
                  </a>
                  <a class="carousel-control-next" href="#carousel${car.id}" role="button" data-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="sr-only">Next</span>
                  </a>
                </div>
                <div class="card-body">
                  <h5>${car.registration_year} ${car.car_brand} ${car.model}</h5>
                  <p>${car.kms_driven}kms | ${car.fuel_type} | ${car.transmission}</p>
                  <h4>${priceText}</h4>
                </div>
              </div>
            </div>
          `);
        });
      },
      error: function (err) {
        console.error('Error fetching car data:', err);
      }
    });
  });

  // Fetch initial car list
  fetch('/cars')
    .then(response => response.json())
    .then(data => {
      let carList = $('#car-list');
      data.forEach(car => {
        let carouselIndicators = '';
        let carouselInner = '';
        const images = car.image.split(',');
        images.forEach((img, index) => {
          const activeClass = index === 0 ? 'active' : '';
          carouselIndicators += `<li data-target="#carousel${car.id}" data-slide-to="${index}" class="${activeClass}"></li>`;
          carouselInner += `
            <div class="carousel-item ${activeClass}">
              <img src="/uploads/${img}" class="d-block w-100" alt="${car.car_brand}">
            </div>`;
        });

        let soldOutOverlay = car.status === 'Sold Out' ? '<div class="sold-out-overlay">SOLD OUT</div>' : '';
        let priceText = car.status === 'Sold Out' ? 'Sold Out' : `₹${car.price}`;

        carList.append(`
          <div class="col-md-3 mb-4">
            <div class="card" data-id="${car.id}">
              ${soldOutOverlay}
              <div id="carousel${car.id}" class="carousel slide" data-ride="carousel">
                <ol class="carousel-indicators">
                  ${carouselIndicators}
                </ol>
                <div class="carousel-inner">
                  ${carouselInner}
                </div>
                <a class="carousel-control-prev" href="#carousel${car.id}" role="button" data-slide="prev">
                  <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span class="sr-only">Previous</span>
                </a>
                <a class="carousel-control-next" href="#carousel${car.id}" role="button" data-slide="next">
                  <span class="carousel-control-next-icon" aria-hidden="true"></span>
                  <span class="sr-only">Next</span>
                </a>
              </div>
              <div class="card-body">
                <h5>${car.registration_year} ${car.car_brand} ${car.model}</h5>
                <p>${car.kms_driven}kms | ${car.fuel_type} | ${car.transmission}</p>
                <h4>${priceText}</h4>
              </div>
            </div>
          </div>
        `);
      });

      // Add click event listener to each card
      $('.card').click(function () {
        const carId = $(this).data('id');
        const detailPageUrl = `/car.html?id=${carId}`;
        console.log('Redirecting to:', detailPageUrl); // Debugging line
        if (!$(this).find('.sold-out-overlay').length) { // Prevent redirection for sold out cars
          window.location.href = detailPageUrl;
        }
      });
    });
});
