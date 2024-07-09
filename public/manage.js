$(document).ready(function () {
    let carData = []; // To store fetched car data
    let soldOutCarData = []; // To store fetched soldout car data
    let deleteCarId = null; // To store the car ID to be deleted
    let soldOutCarId = null; // To store the car ID to be marked as sold out
    let notSoldCarId = null; // To store the car ID to be marked as not sold

    function fetchAndDisplayCars() {
        // Fetch available cars
        fetch('/cars')
            .then(response => response.json())
            .then(data => {
                carData = data; // Store the fetched data
                let carList = $('#car-list');
                carList.empty(); // Clear the current list
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

                    carList.append(`
                <div class="col-md-3 mb-4">
                    <div class="card">
                        <div class="card-image-container">
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
                        </div>
                        <div class="card-body">
                            <h5 class="carbrand">${car.car_brand}</h5>
                            <h5 class="carmodel">${car.model}</h5>
                            <p class="id">Product id:${car.id}
                                <br>Number plate:${car.numberplate}</br></p>
                            
                            <button class="btn btn-primary btn-block view-options-btn" data-id="${car.id}">View Options</button>
                            <div class="card-options">
                                <button class="btn btn-secondary edit-btn" data-id="${car.id}">Edit</button>
                                <button class="btn btn-danger delete-btn" data-id="${car.id}">Delete</button>
                                <button class="btn btn-warning soldout-btn" data-id="${car.id}">Sold Out</button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
                });

                // Toggle the card options
                $('.view-options-btn').click(function () {
                    $(this).next('.card-options').slideToggle();
                });

                // Delete button functionality
                $('.delete-btn').click(function () {
                    deleteCarId = $(this).data('id');
                    $('#deleteModal').modal('show');
                });

                $('#confirmDelete').click(function () {
                    fetch(`/delete/${deleteCarId}`, {
                        method: 'DELETE'
                    })
                        .then(response => response.json())
                        .then(result => {
                            if (result.success) {
                                location.reload(); // Reload the page to reflect the changes
                            } else {
                                alert('Failed to delete the car');
                            }
                        });
                });

                // Edit button functionality
                $('.edit-btn').click(function () {
                    const carId = $(this).data('id');
                    const car = carData.find(car => car.id === carId);

                    $('#editCarId').val(car.id);
                    $('#editCarBrand').val(car.car_brand);
                    $('#editCarModel').val(car.model);
                    $('#editnumberplate').val(car.numberplate);
                    $('#editPrice').val(car.price);
                    $('#editbookingamount').val(car.booking_amount);
                    $('#editEngineCapacity').val(car.engine_capacity);
                    $('#editHorsepower').val(car.horsepower);
                    $('#editTorque').val(car.torque);
                    $('#editMileage').val(car.mileage);
                    $('#editFuelType').val(car.fuel_type);
                    $('#editTransmission').val(car.transmission);
                    $('#editRegistrationYear').val(car.registration_year);
                    $('#editKmsDriven').val(car.kms_driven);
                    $('#editbodytype').val(car.bodytype);
                    $('#editownership').val(car.ownership);
                    $('#editModal').modal('show');
                });

                // Sold out button functionality
                $('.soldout-btn').click(function () {
                    soldOutCarId = $(this).data('id');
                    $('#soldOutModal').modal('show');
                });

                $('#confirmSoldOut').click(function () {
                    fetch(`/soldout/${soldOutCarId}`, {
                        method: 'POST'
                    })
                        .then(response => response.json())
                        .then(result => {
                            if (result.success) {
                                location.reload(); // Reload the page to reflect the changes
                            } else {
                                alert('Failed to mark the car as sold out');
                            }
                        });
                });
            });
    }

    function fetchAndDisplaySoldOutCars() {
        // Fetch soldout cars
        fetch('/soldout_cars')
            .then(response => response.json())
            .then(data => {
                soldOutCarData = data; // Store the fetched data
                let soldoutCarList = $('#soldout-car-list');
                soldoutCarList.empty(); // Clear the current list
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

                    soldoutCarList.append(`
                <div class="col-md-3 mb-4">
                    <div class="card">
                        <div class="card-image-container">
                            <div class="sold-out-overlay">SOLD OUT</div>
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
                        </div>
                        <div class="card-body">
                            <h5 class="carbrand">${car.car_brand}</h5>
                            <h5 class="carmodel">${car.model}</h5>
                            <p class="id">Product id:${car.id}
                                <br>Number plate:${car.numberplate}</br></p>
                            <button class="btn btn-success btn-block not-sold-btn" data-id="${car.id}">Not Sold</button>
                        </div>
                    </div>
                </div>
            `);
                });

                // Not sold button functionality
                $('.not-sold-btn').click(function () {
                    notSoldCarId = $(this).data('id');
                    $('#notSoldModal').modal('show');
                });

                $('#confirmNotSold').click(function () {
                    fetch(`/notsold/${notSoldCarId}`, {
                        method: 'POST'
                    })
                        .then(response => response.json())
                        .then(result => {
                            if (result.success) {
                                location.reload(); // Reload the page to reflect the changes
                            } else {
                                alert('Failed to mark the car as not sold');
                            }
                        });
                });
            });
    }

    fetchAndDisplayCars();
    fetchAndDisplaySoldOutCars();

    // Handle edit form submission
    $('#editForm').submit(function (e) {
        e.preventDefault();

        const formData = {
            id: $('#editCarId').val(),
            carbrand: $('#editCarBrand').val(),
            model: $('#editCarModel').val(),
            numberplate: $('#editnumberplate').val(),
            price: $('#editPrice').val(),
            engine_capacity: $('#editEngineCapacity').val(),
            horsepower: $('#editHorsepower').val(),
            torque: $('#editTorque').val(),
            mileage: $('#editMileage').val(),
            fuel_type: $('#editFuelType').val(),
            transmission: $('#editTransmission').val(),
            registration_year: $('#editRegistrationYear').val(),
            kms_driven: $('#editKmsDriven').val(),
            bodytype: $('#editbodytype').val(),
            ownership: $('#editownership').val(),
            bookingamount: $('#editbookingamount').val()
        };

        fetch(`/edit/${formData.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Car details updated successfully');
                    $('#editModal').modal('hide');
                    location.reload(); // Reload the page to reflect the changes
                } else {
                    alert('Failed to update car details');
                }
            });
    });
});