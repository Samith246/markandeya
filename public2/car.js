$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');
    const RAZORPAY_KEY_ID = 'rzp_test_pvtc0wlp67EAqm';  // Replace with your actual key ID

    console.log('Fetching car details for ID:', carId);  // Debugging line

    fetch(`/car-details/${carId}`)
        .then(response => response.json())
        .then(car => {
            console.log('Car details fetched:', car);  // Debugging line

            $('#carTitle').text(`${car.registration_year} ${car.car_brand} ${car.model}`);
            $('#carDetails').html(`${car.kms_driven} kms | ${car.fuel_type} | ${car.transmission}`);
            $('#carPrice').text(`₹${car.price}`);

            const images = car.image.split(',');
            let carouselItems = '';
            images.forEach((img, index) => {
                const activeClass = index === 0 ? 'active' : '';
                carouselItems += `<div class="carousel-item ${activeClass}"><img src="/uploads/${img}" class="d-block w-100" alt="${car.car_brand}"></div>`;
            });
            $('#carouselImages').html(carouselItems);

            checkWishlistStatus(carId);

            // Set car overview details
            $('#registrationYear').text(car.registration_year);
            $('#fuelType').text(car.fuel_type);
            $('#kmsDriven').text(car.kms_driven);
            $('#ownership').text(car.ownership);
            $('#transmission').text(car.transmission);
            $('#insurance').text(car.insurance);
            $('#seats').text(car.seats);
            $('#rto').text(car.rto);
            $('#engineDisplacement').text(car.engine_capacity);
            $('#yearOfManufacture').text(car.registration_year);

            // Buy Now button click handler
            $('#buyNowBtn').click(function() {
                checkLoginStatus().then(user => {
                    if (user) {
                        // Proceed to payment
                        const options = {
                            "key": RAZORPAY_KEY_ID,
                            "amount": car.booking_amount * 100,  // Amount in paise
                            "currency": "INR",
                            "name": "M cars",
                            "description": `${car.car_brand} ${car.model} Booking Amount`,
                            "image": "/logo.png",  // Replace with your logo URL
                            "handler": function(response) {
                                alert('Payment successful. Payment ID: ' + response.razorpay_payment_id);
                                // Handle post-payment actions here (e.g., save booking details to DB)
                            },
                            "prefill": {
                                "name": user.name,
                                "email": user.email
                            },
                            "theme": {
                                "color": "#F37254"
                            }
                        };
                        const rzp1 = new Razorpay(options);
                        rzp1.open();
                    } else {
                        // Show login modal
                        $('#authModal').modal('show');
                    }
                });
            });

        })
        .catch(error => {
            console.error('Error fetching car details:', error);  // Debugging line
        });

    function checkWishlistStatus(carId) {
        checkLoginStatus().then(user => {
            if (user) {
                fetch(`/wishlist/${carId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user: user })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.inWishlist) {
                        $('#wishlistCheckbox').prop('checked', true);
                        $('.wishlist').html('Added to Wishlist');
                    } else {
                        $('#wishlistCheckbox').prop('checked', false);
                        $('.wishlist').html('Add to Wishlist');
                    }
                })
                .catch(error => {
                    console.error('Error checking wishlist status:', error);  // Debugging line
                });
            }
        });
    }

    $('#wishlistCheckbox').change(function() {
        checkLoginStatus().then(user => {
            if (user) {
                const isChecked = $(this).is(':checked');
                const url = isChecked ? '/add-to-wishlist' : '/remove-from-wishlist';

                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: carId, user: user })
                })
                .then(response => {
                    if (!response.ok) {
                        alert('Failed to update wishlist');
                        $(this).prop('checked', !isChecked); // Revert checkbox state
                    } else {
                        $('.wishlist').html(isChecked ? 'Added to Wishlist' : 'Add to Wishlist');
                    }
                })
                .catch(error => {
                    console.error('Error updating wishlist:', error);  // Debugging line
                    $(this).prop('checked', !isChecked); // Revert checkbox state
                });
            } else {
                $('#authModal').modal('show');
                $(this).prop('checked', !$(this).is(':checked')); // Revert checkbox state
            }
        });
    });

    function checkLoginStatus() {
        const user = localStorage.getItem('user');
        if (user) {
            return Promise.resolve(JSON.parse(user));
        } else {
            return fetch('/user-details', {
                method: 'GET',
                credentials: 'include'  // Include cookies with the request
            })
            .then(response => {
                if (response.ok) {
                    return response.json().then(user => {
                        localStorage.setItem('user', JSON.stringify(user));
                        return user;
                    });
                } else {
                    return null;
                }
            })
            .catch(error => {
                console.error('Error checking login status:', error);
                return null;
            });
        }
    }
});