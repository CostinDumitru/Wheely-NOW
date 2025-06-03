document
  .getElementById('orderForm')
  .addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get form values
    const formData = {
      name: document.getElementById('name').value,
      age: parseInt(document.getElementById('age').value, 10),
      address: document.getElementById('address').value,
      mobility: document.getElementById('mobility').value,
      seatWidth: parseInt(document.getElementById('seatWidth').value, 10),
      seatHeight: parseInt(document.getElementById('seatHeight').value, 10),
      wheelchairType: document.getElementById('wheelchairType').value,
      price: parseFloat(document.getElementById('price').value),
    };

    // Post data to JSON server
    const response = await fetch('http://localhost:4000/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert('Order submitted successfully!');
      document.getElementById('orderForm').reset();
    } else {
      alert('Error submitting order');
    }
  });
