document.addEventListener('DOMContentLoaded', async function () {
  const main = document.querySelector('main');
  main.innerHTML = '';

  // Initialize Edit modal right after DOM is loaded
  let editModal = null;
  const modalEl = document.getElementById('editOrderModal');
  if (modalEl) editModal = new bootstrap.Modal(modalEl);

  // Initialize Delete modal
  let deleteModal = null;
  const deleteModalEl = document.getElementById('deleteOrderModal');
  if (deleteModalEl) deleteModal = new bootstrap.Modal(deleteModalEl);

  async function fetchOrdersAndRender() {
    try {
      const response = await fetch('http://localhost:4000/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const orders = await response.json();

      if (orders.length === 0) {
        main.innerHTML =
          '<p class="text-center mt-5 fs-4">No orders found.</p>';
        return;
      }

      const table = document.createElement('table');
      table.className = 'table table-striped table-bordered shadow mb-5';

      table.innerHTML = `
        <thead class="table-primary">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Age</th>
            <th>Address</th>
            <th>Mobility</th>
            <th>Wheelchair Type</th>
            <th>Seat Width</th>
            <th>Seat Height</th>
            <th>Price (RON)</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          ${orders
            .map(
              (order, i) => `
            <tr data-id="${order.id}">
              <td>${i + 1}</td>
              <td>${order.name || '-'}</td>
              <td>${order.age ?? '-'}</td>
              <td>${order.address || '-'}</td>
              <td>${order.mobility || '-'}</td>
              <td>${order.wheelchairType || '-'}</td>
              <td>${order.seatWidth ? order.seatWidth + ' cm' : '-'}</td>
              <td>${order.seatHeight ? order.seatHeight + ' cm' : '-'}</td>
              <td>${
                typeof order.price === 'number' && !isNaN(order.price)
                  ? order.price.toFixed(2)
                  : '-'
              }</td>
              <td>
                <button class="btn btn-sm btn-warning edit-btn">Edit</button>
              </td>
              <td>
                <button class="btn btn-sm btn-danger delete-btn">Delete</button>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      `;

      const ths = table.querySelectorAll('thead th');
      ths.forEach((th) => {
        th.style.backgroundColor = '#80D3FF';
        th.style.verticalAlign = 'top';
      });

      main.innerHTML = '';
      main.appendChild(table);

      // Add event listeners for Delete (using modal)
      document.querySelectorAll('.delete-btn').forEach((btn) => {
        btn.addEventListener('click', function () {
          const tr = this.closest('tr');
          const orderId = tr.getAttribute('data-id');
          document.getElementById('deleteOrderId').value = orderId;
          if (deleteModal) deleteModal.show();
        });
      });

      // Add event listeners for Edit
      document.querySelectorAll('.edit-btn').forEach((btn) => {
        btn.addEventListener('click', function () {
          const tr = this.closest('tr');
          const orderId = tr.getAttribute('data-id');
          const tds = tr.querySelectorAll('td');
          document.getElementById('editOrderId').value = orderId;
          document.getElementById('editName').value = tds[1].textContent.trim();
          document.getElementById('editAge').value = tds[2].textContent.trim();
          document.getElementById('editAddress').value =
            tds[3].textContent.trim();

          // Defensive checks for select fields
          const mobilitySelect = document.getElementById('editMobility');
          const wheelchairTypeSelect =
            document.getElementById('editWheelchairType');
          if (!mobilitySelect) {
            console.error('editMobility select not found!');
            return;
          }
          if (!wheelchairTypeSelect) {
            console.error('editWheelchairType select not found!');
            return;
          }

          // Set Mobility select
          const mobilityValue = tds[4].textContent.trim();
          mobilitySelect.value = '';
          for (let i = 0; i < mobilitySelect.options.length; i++) {
            if (mobilitySelect.options[i].value === mobilityValue) {
              mobilitySelect.selectedIndex = i;
              break;
            }
          }

          // Set Wheelchair Type select
          const wheelchairTypeValue = tds[5].textContent.trim();
          wheelchairTypeSelect.value = '';
          for (let i = 0; i < wheelchairTypeSelect.options.length; i++) {
            if (wheelchairTypeSelect.options[i].value === wheelchairTypeValue) {
              wheelchairTypeSelect.selectedIndex = i;
              break;
            }
          }

          document.getElementById('editSeatWidth').value = tds[6].textContent
            .replace(' cm', '')
            .trim();
          document.getElementById('editSeatHeight').value = tds[7].textContent
            .replace(' cm', '')
            .trim();
          document.getElementById('editPrice').value =
            tds[8].textContent.trim();

          if (editModal) editModal.show();
        });
      });
    } catch (err) {
      main.innerHTML = `<div class="alert alert-danger text-center">Error loading orders: ${err.message}</div>`;
    }
  }

  fetchOrdersAndRender();

  // Modal form submission for Edit
  document.getElementById('editOrderForm').onsubmit = async function (e) {
    e.preventDefault();
    const orderId = document.getElementById('editOrderId').value;
    const newOrder = {
      name: document.getElementById('editName').value,
      age: Number(document.getElementById('editAge').value),
      address: document.getElementById('editAddress').value,
      mobility: document.getElementById('editMobility').value,
      wheelchairType: document.getElementById('editWheelchairType').value,
      seatWidth: Number(document.getElementById('editSeatWidth').value),
      seatHeight: Number(document.getElementById('editSeatHeight').value),
      price: Number(document.getElementById('editPrice').value),
    };
    try {
      const resp = await fetch(`http://localhost:4000/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      if (resp.ok) {
        if (editModal) editModal.hide();
        fetchOrdersAndRender();
      } else {
        alert('Error updating order.');
      }
    } catch (err) {
      alert('Error updating order.');
    }
  };

  // Modal form submission for Delete
  document.getElementById('deleteOrderForm').onsubmit = async function (e) {
    e.preventDefault();
    const orderId = document.getElementById('deleteOrderId').value;
    try {
      const delResponse = await fetch(
        `http://localhost:4000/orders/${orderId}`,
        {
          method: 'DELETE',
        }
      );
      if (delResponse.ok) {
        if (deleteModal) deleteModal.hide();
        fetchOrdersAndRender(); // Refresh the table
      } else {
        alert('Error deleting order.');
      }
    } catch (err) {
      alert('Error deleting order.');
    }
  };
});
