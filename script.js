const rupiah = value => new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0
    }).format(Math.max(0, Number(value) || 0));

    const coffeeSelect = document.getElementById('coffee');
    const qtyInput = document.getElementById('qty');
    const priceInput = document.getElementById('price');
        const shippingInput = document.getElementById('shipping');
    const buyerInput = document.getElementById('buyer');
    let currentProduct = null;

    function calculate() {
      const qty = Math.max(1, Math.min(10000, Number(qtyInput.value) || 1));
      const price = Math.max(0, Number(priceInput.value) || 0);
      const shipping = Math.max(0, Number(shippingInput.value) || 0);
      const subtotal = qty * price;
      const total = subtotal + shipping;

      document.getElementById('subtotalLabel').textContent = `Subtotal (${qty.toLocaleString('id-ID')} kg)`;
      document.getElementById('subtotal').textContent = rupiah(subtotal);
      document.getElementById('shippingAmount').textContent = rupiah(shipping);
      document.getElementById('grandTotal').textContent = rupiah(total);
      document.getElementById('totalBottom').textContent = rupiah(total);
      return { qty, price, shipping, subtotal, total };
    }

    coffeeSelect.addEventListener('change', () => {
      priceInput.value = coffeeSelect.value;
      calculate();
    });
    [qtyInput, priceInput, shippingInput].forEach(el => {
      el.addEventListener('input', calculate);
    });
    document.getElementById('resetCalc').addEventListener('click', () => {
      coffeeSelect.value = '135000';
      qtyInput.value = 5;
      priceInput.value = 135000;
      shippingInput.value = 15000;
      buyerInput.value = '';
      calculate();
      showToast('Kalkulator dikembalikan ke nilai awal.');
    });

    function showToast(message) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
    }

    document.getElementById('copySummary').addEventListener('click', async () => {
      const c = calculate();
      const selected = coffeeSelect.options[coffeeSelect.selectedIndex].dataset.name;
      const buyer = buyerInput.value.trim() || '—';
      const summary = [
        'RINGKASAN PESANAN RUANG BIJI',
        `Pembeli: ${buyer}`,
        `Produk: ${selected}`,
        `Jumlah: ${c.qty} kg`,
        `Harga per kg: ${rupiah(c.price)}`,
        `Subtotal: ${rupiah(c.subtotal)}`,
        `Ongkos kirim: ${rupiah(c.shipping)}`,
        `TOTAL: ${rupiah(c.total)}`,
        '',
        '*Estimasi harga; konfirmasi ketersediaan dan ongkir sebelum transaksi.'
      ].join('\\n');
      try {
        await navigator.clipboard.writeText(summary);
        showToast('Ringkasan pesanan berhasil disalin.');
      } catch (e) {
        const temp = document.createElement('textarea');
        temp.value = summary;
        document.body.appendChild(temp);
        temp.select();
        const copied = document.execCommand('copy');
        temp.remove();
        showToast(copied ? 'Ringkasan pesanan berhasil disalin.' : 'Gagal menyalin. Silakan coba lagi.');
      }
    });

    // Filter produk berdasarkan kategori.
    document.querySelectorAll('.filter').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        const filter = button.dataset.filter;
        document.querySelectorAll('.product-card').forEach(card => {
          card.style.display = filter === 'semua' || card.dataset.type.split(' ').includes(filter) ? '' : 'none';
        });
      });
    });

    // Gambar dapat diklik atau diaktifkan dengan keyboard untuk membuka detail.
    const modal = document.getElementById('productModal');
    const modalImg = document.getElementById('modalImg');
    function openProduct(card) {
      currentProduct = card;
      const image = card.querySelector('img');
      modalImg.src = image.src;
      modalImg.alt = image.alt;
      document.getElementById('modalOrigin').textContent = card.dataset.origin;
      document.getElementById('modalTitle').textContent = card.dataset.name;
      document.getElementById('modalDesc').textContent = card.dataset.desc;
      document.getElementById('modalNotes').textContent = card.dataset.notes;
      document.getElementById('modalPrice').textContent = rupiah(card.dataset.price);
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      document.getElementById('closeModal').focus();
    }
    function closeProduct() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
    document.querySelectorAll('.product-card').forEach(card => {
      const imageBox = card.querySelector('.product-image');
      imageBox.addEventListener('click', () => openProduct(card));
      imageBox.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProduct(card); }
      });
      card.querySelector('[data-add]').addEventListener('click', () => {
        coffeeSelect.value = card.dataset.price;
        priceInput.value = card.dataset.price;
        calculate();
        document.getElementById('kalkulator').scrollIntoView({ behavior: 'smooth' });
        showToast(card.dataset.name + ' dipilih untuk kalkulator.');
      });
    });
    document.getElementById('closeModal').addEventListener('click', closeProduct);
    modal.addEventListener('click', e => { if (e.target === modal) closeProduct(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeProduct(); });
    document.getElementById('modalChoose').addEventListener('click', () => {
      if (currentProduct) {
        coffeeSelect.value = currentProduct.dataset.price;
        priceInput.value = currentProduct.dataset.price;
        calculate();
      }
      closeProduct();
      document.getElementById('kalkulator').scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('year').textContent = new Date().getFullYear();
    calculate();
